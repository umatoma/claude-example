---
name: backend-patterns
description: Node.js・ExpressのAPIルートにおけるバックエンドアーキテクチャパターン・API設計・データベース最適化・サーバーサイドのベストプラクティス
---

# バックエンド開発パターン

スケーラブルなサーバーサイドアプリケーションのためのバックエンドアーキテクチャパターンとベストプラクティス。

## API設計パターン

### API構造

```typescript
POST /api/get_markets       # リソース一覧
POST /api/get_market        # 単一リソース取得
POST /api/create_market     # リソース作成
POST /api/update_market     # リソース更新
POST /api/delete_market     # リソース削除
```

### アダプターパターン

```typescript
import mysql from 'mysql2/promise'

// コネクションプール作成
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
})

// データアクセスロジックのカプセル化
class DbMarketAdapter {
  async findAll(filters?: MarketFilters): Promise<Market[]> {
    let sql = 'SELECT * FROM markets WHERE 1=1'
    const params: any[] = []

    if (filters?.status) {
      sql += ' AND status = ?'
      params.push(filters.status)
    }

    if (filters?.limit) {
      sql += ' LIMIT ?'
      params.push(filters.limit)
    }

    const [rows] = await pool.execute(sql, params)
    return rows as Market[]
  }

  // その他のメソッド...
}
```

### ユースケースパターン

```typescript
// ビジネスロジックをデータアクセスから分離
class MarketUseCase {
  constructor(private marketAdapter: DbMarketAdapter) {}

  async searchMarkets(query: string, limit: number = 10): Promise<Market[]> {
    // ビジネスロジック
    const embedding = await generateEmbedding(query)
    const results = await this.vectorSearch(embedding, limit)

    // 完全なデータを取得
    const markets = await this.marketAdapter.findByIds(results.map(r => r.id))

    // 類似度でソート
    return markets.sort((a, b) => {
      const scoreA = results.find(r => r.id === a.id)?.score || 0
      const scoreB = results.find(r => r.id === b.id)?.score || 0
      return scoreA - scoreB
    })
  }

  private async vectorSearch(embedding: number[], limit: number) {
    // ベクトル検索の実装
  }
}
```

### ミドルウェアパターン

```typescript
// リクエスト/レスポンス処理パイプライン
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const user = await verifyToken(token)
      req.user = user
      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}

// 使用例
export default withAuth(async (req, res) => {
  // ハンドラーはreq.userにアクセス可能
})
```

## データベースパターン

### N+1クエリ問題の防止

```typescript
// ❌ 悪い例: N+1クエリ問題
const markets = await getMarkets()
for (const market of markets) {
  market.creator = await getUser(market.creator_id)  // Nクエリ
}

// ✅ 良い例: バッチフェッチ
const markets = await getMarkets()
const creatorIds = markets.map(m => m.creator_id)
const creators = await getUsers(creatorIds)  // 1クエリ
const creatorMap = new Map(creators.map(c => [c.id, c]))

markets.forEach(market => {
  market.creator = creatorMap.get(market.creator_id)
})
```

### トランザクションパターン

```typescript
async function createMarketWithPosition(
  marketData: CreateMarketData,
  positionData: CreatePositionData
) {
  const connection = await pool.getConnection()

  try {
    // トランザクション開始
    await connection.beginTransaction()

    // マーケット作成
    const [marketResult] = await connection.execute(
      'INSERT INTO markets (name, description, status) VALUES (?, ?, ?)',
      [marketData.name, marketData.description, marketData.status]
    )
    const marketId = (marketResult as any).insertId

    // ポジション作成
    await connection.execute(
      'INSERT INTO positions (market_id, user_id, amount) VALUES (?, ?, ?)',
      [marketId, positionData.userId, positionData.amount]
    )

    // コミット
    await connection.commit()

    return { marketId, success: true }
  } catch (error) {
    // ロールバック
    await connection.rollback()
    throw new Error('Transaction failed')
  } finally {
    // コネクションをプールに返却
    connection.release()
  }
}
```

## キャッシュ戦略

### Redisキャッシュレイヤー

```typescript
class CachedMarketAdapter {
  constructor(
    private baseAdapter: DbMarketAdapter,
    private redis: RedisClient
  ) {}

  async findById(id: string): Promise<Market | null> {
    // まずキャッシュを確認
    const cached = await this.redis.get(`market:${id}`)

    if (cached) {
      return JSON.parse(cached)
    }

    // キャッシュミス - データベースから取得
    const market = await this.baseAdapter.findById(id)

    if (market) {
      // 5分間キャッシュ
      await this.redis.setex(`market:${id}`, 300, JSON.stringify(market))
    }

    return market
  }

  async invalidateCache(id: string): Promise<void> {
    await this.redis.del(`market:${id}`)
  }
}
```

### キャッシュアサイドパターン

```typescript
async function getMarketWithCache(id: string): Promise<Market> {
  const cacheKey = `market:${id}`

  // キャッシュを試行
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // キャッシュミス - DBから取得
  const [rows] = await pool.execute(
    'SELECT * FROM markets WHERE id = ?',
    [id]
  )
  const market = (rows as Market[])[0]

  if (!market) throw new Error('Market not found')

  // キャッシュを更新
  await redis.setex(cacheKey, 300, JSON.stringify(market))

  return market
}
```

## エラーハンドリングパターン

### 集中エラーハンドラー

```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export function errorHandler(error: unknown, req: Request): Response {
  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: error.statusCode })
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: error.errors
    }, { status: 400 })
  }

  // 予期しないエラーをログ出力
  console.error('Unexpected error:', error)

  return NextResponse.json({
    success: false,
    error: 'Internal server error'
  }, { status: 500 })
}

// 使用例
export async function GET(request: Request) {
  try {
    const data = await fetchData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return errorHandler(error, request)
  }
}
```

### 指数バックオフによるリトライ

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (i < maxRetries - 1) {
        // 指数バックオフ: 1秒、2秒、4秒
        const delay = Math.pow(2, i) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

// 使用例
const data = await fetchWithRetry(() => fetchFromAPI())
```

## 認証と認可

### JWTトークン検証

```typescript
import jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
}

export function verifyToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return payload
  } catch (error) {
    throw new ApiError(401, 'Invalid token')
  }
}

export async function requireAuth(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new ApiError(401, 'Missing authorization token')
  }

  return verifyToken(token)
}

// APIルートでの使用例
export async function GET(request: Request) {
  const user = await requireAuth(request)

  const data = await getDataForUser(user.userId)

  return NextResponse.json({ success: true, data })
}
```

## バックグラウンドジョブとキュー

### シンプルなキューパターン

```typescript
class JobQueue<T> {
  private queue: T[] = []
  private processing = false

  async add(job: T): Promise<void> {
    this.queue.push(job)

    if (!this.processing) {
      this.process()
    }
  }

  private async process(): Promise<void> {
    this.processing = true

    while (this.queue.length > 0) {
      const job = this.queue.shift()!

      try {
        await this.execute(job)
      } catch (error) {
        console.error('Job failed:', error)
      }
    }

    this.processing = false
  }

  private async execute(job: T): Promise<void> {
    // ジョブ実行ロジック
  }
}

// マーケットのインデックス作成での使用例
interface IndexJob {
  marketId: string
}

const indexQueue = new JobQueue<IndexJob>()

export async function POST(request: Request) {
  const { marketId } = await request.json()

  // ブロッキングせずにキューに追加
  await indexQueue.add({ marketId })

  return NextResponse.json({ success: true, message: 'Job queued' })
}
```

## ロギングとモニタリング

### 構造化ロギング

```typescript
interface LogContext {
  userId?: string
  requestId?: string
  method?: string
  path?: string
  [key: string]: unknown
}

class Logger {
  log(level: 'info' | 'warn' | 'error', message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    }

    console.log(JSON.stringify(entry))
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error.message,
      stack: error.stack
    })
  }
}

const logger = new Logger()

// 使用例
export async function GET(request: Request) {
  const requestId = crypto.randomUUID()

  logger.info('Fetching markets', {
    requestId,
    method: 'GET',
    path: '/api/markets'
  })

  try {
    const markets = await fetchMarkets()
    return NextResponse.json({ success: true, data: markets })
  } catch (error) {
    logger.error('Failed to fetch markets', error as Error, { requestId })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

**心に留めておくこと**: バックエンドパターンは、スケーラブルで保守しやすいサーバーサイドアプリケーションを実現します。複雑さのレベルに合ったパターンを選択してください。
