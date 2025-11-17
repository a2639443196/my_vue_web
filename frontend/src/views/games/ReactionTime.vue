<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="反应速度测试" show-back />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <div class="grid grid-cols-3 gap-4">
        <GlassCard class="text-center">
          <div class="caption mb-1">本次</div>
          <div class="text-2xl text-[rgb(var(--accent))]">{{ reactionTimeLabel }}</div>
        </GlassCard>
        <GlassCard class="text-center">
          <div class="caption mb-1">最佳</div>
          <div class="text-2xl text-green-400">{{ bestTimeLabel }}</div>
        </GlassCard>
        <GlassCard class="text-center">
          <div class="caption mb-1">平均</div>
          <div class="text-2xl text-[rgb(var(--primary))]">{{ averageLabel }}</div>
        </GlassCard>
      </div>

      <GlassCard class="min-h-[400px]">
        <div
          class="h-[400px] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-base"
          :class="areaClass"
          @click="handleAreaClick"
        >
          <template v-if="state === 'waiting'">
            <Icon icon="lucide:zap" class="w-16 h-16 mx-auto mb-4 text-[rgb(var(--primary))]" />
            <h3 class="mb-2">准备开始</h3>
            <p class="text-[rgb(var(--muted-foreground))]">点击区域开始测试</p>
          </template>

          <template v-else-if="state === 'ready'">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 animate-pulse" />
              <h3 class="text-red-400">等待...</h3>
              <p class="text-[rgb(var(--muted-foreground))] mt-2">准备点击</p>
            </div>
          </template>

          <template v-else-if="state === 'go'">
            <div class="text-center animate-pulse">
              <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-green-500 glow-primary" />
              <h2 class="text-green-400">点击!</h2>
            </div>
          </template>

          <template v-else-if="state === 'tooEarly'">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500" />
              <h3 class="text-red-400 mb-2">太早了!</h3>
              <p class="text-[rgb(var(--muted-foreground))] mb-6">等绿色出现后再点击</p>
              <Button @click.stop="handleReset" variant="outline" class="border-white/10">
                重新开始
              </Button>
            </div>
          </template>

          <template v-else-if="state === 'result'">
            <div class="text-center">
              <Icon icon="lucide:zap" class="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <div class="text-5xl mb-2">{{ reactionTime }}ms</div>
              <div class="text-xl mb-6" :class="rating.color">
                {{ rating.label }}
              </div>
              <Button @click.stop="handleReset" class="gradient-primary">
                <Icon icon="lucide:rotate-ccw" class="w-5 h-5 mr-2" />
                再测一次
              </Button>
            </div>
          </template>
        </div>
      </GlassCard>

      <GlassCard v-if="attempts.length">
        <h4 class="mb-4">最近记录</h4>
        <div class="space-y-2">
          <div v-for="(time, idx) in attempts.slice().reverse()" :key="idx" class="flex items-center justify-between">
            <span class="caption">第 {{ attempts.length - idx }} 次</span>
            <span :class="getRating(time).color">{{ time }}ms</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h4 class="mb-3">测试说明</h4>
        <ul class="space-y-2 text-sm text-secondary">
          <li>• 点击开始后等待绿色信号</li>
          <li>• 看到绿色后立即点击</li>
          <li>• 多次测试获得更准确的平均值</li>
          <li>• 正常反应时间在 200-300ms 之间</li>
        </ul>
      </GlassCard>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import TopNav from '@/components/TopNav.vue'
import GlassCard from '@/components/GlassCard.vue'
import Button from '@/components/ui/Button.vue'
import { useGamesStore } from '@/stores/games'

type GameState = 'waiting' | 'ready' | 'go' | 'result' | 'tooEarly'

const gamesStore = useGamesStore()

const state = ref<GameState>('waiting')
const reactionTime = ref<number | null>(null)
const attempts = ref<number[]>([])
const timerRef = ref<number | undefined>()
const startRef = ref<number>(0)

const bestSummary = computed(() => gamesStore.summaries.reaction)

const handleAreaClick = () => {
  if (state.value === 'waiting') {
    startReady()
    return
  }
  if (state.value === 'ready') {
    tooEarly()
    return
  }
  if (state.value === 'go') {
    finish()
  }
}

const startReady = () => {
  state.value = 'ready'
  const delay = 2000 + Math.random() * 3000
  timerRef.value = window.setTimeout(() => {
    state.value = 'go'
    startRef.value = Date.now()
  }, delay)
}

const tooEarly = () => {
  clearTimer()
  state.value = 'tooEarly'
}

const finish = async () => {
  const time = Date.now() - startRef.value
  reactionTime.value = time
  attempts.value = [...attempts.value, time].slice(-5)
  state.value = 'result'
  clearTimer()
  await gamesStore.saveResult({ gameType: 'reaction', score: time, durationMs: time })
}

const handleReset = () => {
  state.value = 'waiting'
  reactionTime.value = null
}

const clearTimer = () => {
  if (timerRef.value) {
    clearTimeout(timerRef.value)
    timerRef.value = undefined
  }
}

const getRating = (time: number) => {
  if (time < 200) return { label: '极快', color: 'text-green-400' }
  if (time < 250) return { label: '很快', color: 'text-blue-400' }
  if (time < 300) return { label: '快速', color: 'text-cyan-400' }
  if (time < 350) return { label: '一般', color: 'text-yellow-400' }
  return { label: '需要练习', color: 'text-orange-400' }
}

const rating = computed(() => (reactionTime.value ? getRating(reactionTime.value) : { label: '', color: '' }))

const reactionTimeLabel = computed(() => (reactionTime.value ? `${reactionTime.value}ms` : '-'))
const bestTimeLabel = computed(() => {
  const best = bestSummary.value?.bestScore
  return best ? `${best}ms` : '-'
})
const averageLabel = computed(() => {
  if (!attempts.value.length) return bestSummary.value?.averageScore ? `${bestSummary.value.averageScore}ms` : '-'
  const avg = Math.round(attempts.value.reduce((a, b) => a + b, 0) / attempts.value.length)
  return `${avg}ms`
})

const areaClass = computed(() => {
  if (state.value === 'waiting') return 'bg-[rgb(var(--primary))]/10 border-2 border-[rgb(var(--primary))]/30'
  if (state.value === 'ready') return 'bg-red-500/10 border-2 border-red-500/30'
  if (state.value === 'go') return 'bg-green-500/20 border-2 border-green-500 glow-primary'
  if (state.value === 'tooEarly') return 'bg-red-500/20 border-2 border-red-500'
  return 'bg-[rgb(var(--card))]'
})

onMounted(async () => {
  await gamesStore.fetchSummary('reaction')
})

onBeforeUnmount(clearTimer)
</script>
