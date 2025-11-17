<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="舒尔特方格" show-back />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <div class="grid grid-cols-3 gap-4">
        <GlassCard class="text-center">
          <div class="caption mb-1">当前数字</div>
          <div class="text-2xl text-[rgb(var(--primary))]">{{ currentNumber }}</div>
        </GlassCard>
        <GlassCard class="text-center">
          <div class="caption mb-1">用时</div>
          <div class="text-2xl text-[rgb(var(--accent))]">{{ formatTime(elapsedTime) }}s</div>
        </GlassCard>
        <GlassCard class="text-center">
          <div class="caption mb-1">最佳</div>
          <div class="text-2xl text-yellow-400">
            {{ bestLabel }}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <p class="caption mb-3">选择难度</p>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="size in [4,5,6]"
            :key="size"
            class="py-3 rounded-xl transition-base"
            :class="[
              difficulty === size ? 'bg-[rgb(var(--primary))] text-white' : 'bg-white/5 hover:bg-white/10',
              isPlaying ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            :disabled="isPlaying"
            @click="setDifficulty(size)"
          >
            {{ size }}×{{ size }}
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <div
          class="grid gap-2"
          :style="{ gridTemplateColumns: `repeat(${difficulty}, 1fr)`, aspectRatio: '1/1' }"
        >
          <button
            v-for="(num, i) in grid"
            :key="i"
            class="aspect-square rounded-xl flex items-center justify-center text-2xl transition-base"
            :class="cellClass(num)"
            :disabled="!isPlaying"
            @click="handleCellClick(num)"
          >
            {{ num }}
          </button>
        </div>
      </GlassCard>

      <div class="flex gap-3">
        <Button v-if="!isPlaying" class="flex-1 h-14 gradient-primary glow-primary" @click="handleStart">
          <Icon icon="lucide:play" class="w-5 h-5 mr-2" />
          开始游戏
        </Button>
        <Button v-else variant="outline" class="flex-1 h-14 border-white/10" @click="pauseGame">暂停</Button>
        <Button variant="outline" class="h-14 w-14 border-white/10" size="icon" @click="resetGrid">
          <Icon icon="lucide:rotate-ccw" class="w-5 h-5" />
        </Button>
      </div>

      <GlassCard v-if="!isPlaying">
        <h4 class="mb-3">游戏说明</h4>
        <ul class="space-y-2 text-sm text-secondary">
          <li>• 按顺序点击数字 1 到 {{ difficulty * difficulty }}</li>
          <li>• 越快完成得分越高</li>
          <li>• 可以锻炼注意力和视觉搜索能力</li>
        </ul>
      </GlassCard>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import TopNav from '@/components/TopNav.vue'
import GlassCard from '@/components/GlassCard.vue'
import Button from '@/components/ui/Button.vue'
import { useGamesStore } from '@/stores/games'

const gamesStore = useGamesStore()

const difficulty = ref<4 | 5 | 6>(5)
const grid = ref<number[]>([])
const currentNumber = ref(1)
const isPlaying = ref(false)
const startTime = ref<number | null>(null)
const elapsedTime = ref(0)
const timer = ref<number | null>(null)

const bestSummary = computed(() => gamesStore.summaries.schulte)
const bestLabel = computed(() => (bestSummary.value?.bestScore ? `${bestSummary.value.bestScore}s` : '-'))

const shuffle = (arr: number[]) => [...arr].sort(() => Math.random() - 0.5)

const generateGrid = () => {
  const size = difficulty.value * difficulty.value
  grid.value = shuffle(Array.from({ length: size }, (_, i) => i + 1))
  currentNumber.value = 1
  elapsedTime.value = 0
}

const handleStart = () => {
  generateGrid()
  isPlaying.value = true
  startTime.value = Date.now()
  startTimer()
}

const pauseGame = () => {
  isPlaying.value = false
  stopTimer()
}

const resetGrid = () => {
  isPlaying.value = false
  stopTimer()
  generateGrid()
}

const setDifficulty = (size: number) => {
  difficulty.value = size as 4 | 5 | 6
  resetGrid()
}

const handleCellClick = (num: number) => {
  if (!isPlaying.value) return
  if (num === currentNumber.value) {
    if (num === difficulty.value * difficulty.value) {
      finishGame()
    } else {
      currentNumber.value += 1
    }
  }
}

const finishGame = async () => {
  isPlaying.value = false
  stopTimer()
  const final = elapsedTime.value
  await gamesStore.saveResult({ gameType: 'schulte', score: Number(formatTime(final)), durationMs: final, metadata: { difficulty: difficulty.value } })
}

const formatTime = (ms: number) => (ms / 1000).toFixed(2)

const startTimer = () => {
  stopTimer()
  timer.value = window.setInterval(() => {
    if (isPlaying.value && startTime.value) {
      elapsedTime.value = Date.now() - startTime.value
    }
  }, 100)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const cellClass = (num: number) => {
  if (!isPlaying.value) return 'bg-white/5 text-[rgb(var(--muted-foreground))]'
  if (num < currentNumber.value) return 'bg-green-500/20 text-green-400'
  if (num === currentNumber.value) return 'bg-[rgb(var(--primary))] text-white glow-primary scale-105'
  return 'bg-white/10 hover:bg-white/20 active:scale-95'
}

onMounted(async () => {
  generateGrid()
  await gamesStore.fetchSummary('schulte')
})

onUnmounted(stopTimer)
</script>
