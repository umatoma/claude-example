---
name: frontend-patterns
description: Vue・状態管理・パフォーマンス最適化・UIベストプラクティスのフロントエンド開発パターン
---

# フロントエンド開発パターン

Vue・高性能なユーザーインターフェースのためのモダンなフロントエンドパターン。

## コンポーネントパターン

### スロットによるコンポジション

```vue
<!-- Card.vue -->
<script setup lang="ts">
interface Props {
  variant?: 'default' | 'outlined'
}

withDefaults(defineProps<Props>(), {
  variant: 'default'
})
</script>

<template>
  <div :class="`card card-${variant}`">
    <div class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<!-- 使用例 -->
<Card variant="outlined">
  <template #header>タイトル</template>
  コンテンツ
</Card>
```

### Provide/Injectパターン

```vue
<!-- Tabs.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'

interface Props {
  defaultTab: string
}

const props = defineProps<Props>()
const activeTab = ref(props.defaultTab)

provide('tabs', {
  activeTab,
  setActiveTab: (tab: string) => {
    activeTab.value = tab
  }
})
</script>

<template>
  <div class="tabs">
    <slot />
  </div>
</template>

<!-- Tab.vue -->
<script setup lang="ts">
import { inject } from 'vue'

interface Props {
  id: string
}

const props = defineProps<Props>()
const tabs = inject('tabs') as {
  activeTab: Ref<string>
  setActiveTab: (tab: string) => void
}
</script>

<template>
  <button
    :class="{ active: tabs.activeTab.value === id }"
    @click="tabs.setActiveTab(id)"
  >
    <slot />
  </button>
</template>

<!-- 使用例 -->
<Tabs defaultTab="overview">
  <Tab id="overview">概要</Tab>
  <Tab id="details">詳細</Tab>
</Tabs>
```

### Renderless Componentsパターン

```vue
<!-- DataLoader.vue -->
<script setup lang="ts" generic="T">
import { ref, watch } from 'vue'

interface Props {
  url: string
}

const props = defineProps<Props>()

const data = ref<T | null>(null)
const loading = ref(true)
const error = ref<Error | null>(null)

watch(() => props.url, async (url) => {
  loading.value = true
  error.value = null

  try {
    const res = await fetch(url)
    data.value = await res.json()
  } catch (e) {
    error.value = e as Error
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <slot :data="data" :loading="loading" :error="error" />
</template>

<!-- 使用例 -->
<DataLoader url="/api/markets" v-slot="{ data: markets, loading, error }">
  <Spinner v-if="loading" />
  <ErrorMessage v-else-if="error" :error="error" />
  <MarketList v-else :markets="markets" />
</DataLoader>
```

## Composablesパターン

### 状態管理Composable

```typescript
// composables/useToggle.ts
import { ref } from 'vue'

export function useToggle(initialValue = false) {
  const value = ref(initialValue)

  const toggle = () => {
    value.value = !value.value
  }

  return { value, toggle }
}

// 使用例
const { value: isOpen, toggle: toggleOpen } = useToggle()
```

### 非同期データ取得Composable

```typescript
// composables/useQuery.ts
import { ref, watch, type Ref } from 'vue'

interface UseQueryOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  enabled?: Ref<boolean> | boolean
}

export function useQuery<T>(
  key: string | Ref<string>,
  fetcher: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const refetch = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await fetcher()
      data.value = result
      options?.onSuccess?.(result)
    } catch (e) {
      error.value = e as Error
      options?.onError?.(e as Error)
    } finally {
      loading.value = false
    }
  }

  watch(
    () => [typeof key === 'string' ? key : key.value, options?.enabled],
    () => {
      const enabled = typeof options?.enabled === 'boolean'
        ? options.enabled
        : options?.enabled?.value ?? true

      if (enabled) {
        refetch()
      }
    },
    { immediate: true }
  )

  return { data, error, loading, refetch }
}

// 使用例
const { data: markets, loading, error, refetch } = useQuery(
  'markets',
  () => fetch('/api/markets').then(r => r.json()),
  {
    onSuccess: data => console.log('取得完了', data.length, 'markets'),
    onError: err => console.error('失敗:', err)
  }
)
```

### デバウンスComposable

```typescript
// composables/useDebounce.ts
import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay: number): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>

  let timeout: ReturnType<typeof setTimeout>

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}

// 使用例
const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 500)

watch(debouncedQuery, (query) => {
  if (query) {
    performSearch(query)
  }
})
```

## 状態管理パターン

### Piniaストアパターン

```typescript
// stores/market.ts
import { defineStore } from 'pinia'

interface Market {
  id: string
  name: string
  volume: number
}

export const useMarketStore = defineStore('market', {
  state: () => ({
    markets: [] as Market[],
    selectedMarket: null as Market | null,
    loading: false
  }),

  getters: {
    sortedByVolume: (state) => {
      return [...state.markets].sort((a, b) => b.volume - a.volume)
    },

    getById: (state) => {
      return (id: string) => state.markets.find(m => m.id === id)
    }
  },

  actions: {
    async fetchMarkets() {
      this.loading = true
      try {
        const res = await fetch('/api/markets')
        this.markets = await res.json()
      } finally {
        this.loading = false
      }
    },

    selectMarket(market: Market) {
      this.selectedMarket = market
    }
  }
})

// 使用例
const marketStore = useMarketStore()
await marketStore.fetchMarkets()
```

### Composition APIによるストア

```typescript
// stores/useMarketStore.ts
import { ref, computed } from 'vue'

const markets = ref<Market[]>([])
const selectedMarket = ref<Market | null>(null)
const loading = ref(false)

export function useMarketStore() {
  const sortedByVolume = computed(() => {
    return [...markets.value].sort((a, b) => b.volume - a.volume)
  })

  const fetchMarkets = async () => {
    loading.value = true
    try {
      const res = await fetch('/api/markets')
      markets.value = await res.json()
    } finally {
      loading.value = false
    }
  }

  const selectMarket = (market: Market) => {
    selectedMarket.value = market
  }

  return {
    markets,
    selectedMarket,
    loading,
    sortedByVolume,
    fetchMarkets,
    selectMarket
  }
}
```

## パフォーマンス最適化

### 算出プロパティとメモ化

```vue
<script setup lang="ts">
import { computed, shallowRef } from 'vue'

const markets = shallowRef<Market[]>([])

// ✅ 重い計算にcomputedを使用
const sortedMarkets = computed(() => {
  return [...markets.value].sort((a, b) => b.volume - a.volume)
})

// ✅ 大きなリストにはshallowRefを使用
const updateMarkets = (newMarkets: Market[]) => {
  markets.value = newMarkets
}
</script>
```

### 非同期コンポーネントと遅延読み込み

```typescript
// router/index.ts
import { defineAsyncComponent } from 'vue'

// ✅ 重いコンポーネントを遅延読み込み
const HeavyChart = defineAsyncComponent(() =>
  import('./components/HeavyChart.vue')
)

const ThreeJsBackground = defineAsyncComponent({
  loader: () => import('./components/ThreeJsBackground.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 3000
})
```

```vue
<template>
  <Suspense>
    <template #default>
      <HeavyChart :data="data" />
    </template>
    <template #fallback>
      <ChartSkeleton />
    </template>
  </Suspense>
</template>
```

### 仮想スクロール

```vue
<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'

interface Props {
  markets: Market[]
}

const props = defineProps<Props>()

const { list, containerProps, wrapperProps } = useVirtualList(
  () => props.markets,
  {
    itemHeight: 100,
    overscan: 5
  }
)
</script>

<template>
  <div v-bind="containerProps" style="height: 600px; overflow: auto">
    <div v-bind="wrapperProps">
      <div
        v-for="{ data: market, index } in list"
        :key="index"
        style="height: 100px"
      >
        <MarketCard :market="market" />
      </div>
    </div>
  </div>
</template>
```

## フォーム処理パターン

### バリデーション付きフォーム

```vue
<script setup lang="ts">
import { reactive, computed } from 'vue'

interface FormData {
  name: string
  description: string
  endDate: string
}

interface FormErrors {
  name?: string
  description?: string
  endDate?: string
}

const formData = reactive<FormData>({
  name: '',
  description: '',
  endDate: ''
})

const errors = reactive<FormErrors>({})

const validate = (): boolean => {
  // エラーをクリア
  errors.name = undefined
  errors.description = undefined
  errors.endDate = undefined

  let isValid = true

  if (!formData.name.trim()) {
    errors.name = '名前は必須です'
    isValid = false
  } else if (formData.name.length > 200) {
    errors.name = '名前は200文字以内にしてください'
    isValid = false
  }

  if (!formData.description.trim()) {
    errors.description = '説明は必須です'
    isValid = false
  }

  if (!formData.endDate) {
    errors.endDate = '終了日は必須です'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  try {
    await createMarket(formData)
    // 成功時の処理
  } catch (error) {
    // エラー処理
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="formData.name"
      placeholder="マーケット名"
    />
    <span v-if="errors.name" class="error">{{ errors.name }}</span>

    <!-- その他のフィールド -->

    <button type="submit">マーケットを作成</button>
  </form>
</template>
```

### VeeValidateを使用したフォーム

```vue
<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

const schema = yup.object({
  name: yup.string().required('名前は必須です').max(200, '200文字以内'),
  description: yup.string().required('説明は必須です'),
  endDate: yup.date().required('終了日は必須です')
})

const { handleSubmit, errors } = useForm({
  validationSchema: schema
})

const { value: name } = useField('name')
const { value: description } = useField('description')
const { value: endDate } = useField('endDate')

const onSubmit = handleSubmit(async (values) => {
  await createMarket(values)
})
</script>

<template>
  <form @submit="onSubmit">
    <input v-model="name" placeholder="マーケット名" />
    <span v-if="errors.name" class="error">{{ errors.name }}</span>

    <button type="submit">マーケットを作成</button>
  </form>
</template>
```

## エラーハンドリングパターン

```vue
<!-- ErrorBoundary.vue -->
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  console.error('エラーバウンダリがキャッチ:', err)
  return false // エラーの伝播を停止
})

const retry = () => {
  error.value = null
}
</script>

<template>
  <div v-if="error" class="error-fallback">
    <h2>問題が発生しました</h2>
    <p>{{ error.message }}</p>
    <button @click="retry">再試行</button>
  </div>
  <slot v-else />
</template>

<!-- 使用例 -->
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## アニメーションパターン

### Transitionによるアニメーション

```vue
<script setup lang="ts">
import { ref } from 'vue'

const markets = ref<Market[]>([])
</script>

<template>
  <!-- リストアニメーション -->
  <TransitionGroup
    name="list"
    tag="div"
    class="market-list"
  >
    <MarketCard
      v-for="market in markets"
      :key="market.id"
      :market="market"
    />
  </TransitionGroup>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
```

### モーダルアニメーション

```vue
<script setup lang="ts">
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => emit('update:modelValue', false)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="close">
        <div class="modal-content" @click.stop>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>
```

## アクセシビリティパターン

### キーボードナビゲーション

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  options: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [value: string]
}>()

const isOpen = ref(false)
const activeIndex = ref(0)

const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, props.options.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      emit('select', props.options[activeIndex.value])
      isOpen.value = false
      break
    case 'Escape':
      isOpen.value = false
      break
  }
}
</script>

<template>
  <div
    role="combobox"
    :aria-expanded="isOpen"
    aria-haspopup="listbox"
    @keydown="handleKeyDown"
  >
    <!-- ドロップダウンの実装 -->
  </div>
</template>
```

### フォーカス管理

```vue
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const modalRef = ref<HTMLDivElement | null>(null)
let previousFocus: HTMLElement | null = null

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    // 現在フォーカスされている要素を保存
    previousFocus = document.activeElement as HTMLElement

    // モーダルにフォーカス
    await nextTick()
    modalRef.value?.focus()
  } else {
    // 閉じる時にフォーカスを復元
    previousFocus?.focus()
  }
})

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('update:modelValue', false)
  }
}
</script>

<template>
  <div
    v-if="modelValue"
    ref="modalRef"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    @keydown="handleKeyDown"
  >
    <slot />
  </div>
</template>
```

**心に留めておくこと**: モダンなフロントエンドパターンは、保守しやすく高性能なユーザーインターフェースを実現します。プロジェクトの複雑さに合ったパターンを選択してください。
