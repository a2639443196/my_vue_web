<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="记忆翻牌" show-back />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <div class="grid grid-cols-4 gap-3">
        <GlassCard class="text-center">
          <div class="caption mb-1">步数</div>
          <div class="text-xl text-[rgb(var(--primary))]">{{ moves }}</div>
        </GlassCard>
        <GlassCard class="text-center">
          <div class="caption mb-1">配对</div>
          <div class="text-xl text-green-400">{{ matches }}/{{ pairCount }}</div>
        </GlassCard>
        <GlassCard class="text-center">
          <div class="caption mb-1">用时</div>
          <div class="text-xl text-[rgb(var(--accent))]">{{ timeLabel }}s</div>
        </GlassCard>
        <GlassCard class="text-center">
          <div class="caption mb-1">最佳</div>
          <div class="text-xl text-yellow-400">{{ bestLabel }}</div>
        </GlassCard>
      </div>

      <GlassCard>
        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="card in cards"
            :key="card.id"
            class="aspect-square rounded-xl flex items-center justify-center text-3xl transition-base transform"
            :class="cardClass(card)"
            :disabled="!isPlaying || card.isFlipped || card.isMatched"
            @click="handleCardClick(card.id)"
          >
            <span v-if="card.isFlipped || card.isMatched">{{ card.value }}</span>
          </button>
        </div>
      </GlassCard>

      <div class="flex gap-3">
        <Button v-if="!isPlaying" class="flex-1 h-14 gradient-primary glow-primary" @click="handleStart">
          <Icon icon="lucide:play" class="w-5 h-5 mr-2" />
          开始游戏
        </Button>
        <Button v-else variant="outline" class="flex-1 h-14 border-white/10" @click="pauseGame">
          暂停
        </Button>
        <Button variant="outline" class="h-14 w-14 border-white/10" size="icon" @click="handleStart">
          <Icon icon="lucide:rotate-ccw" class="w-5 h-5" />
        </Button>
      </div>

      <GlassCard v-if="isPlaying">
        <div class="flex items-center justify-between mb-2">
          <span>游戏进度</span>
          <span class="text-[rgb(var(--accent))]">{{ Math.round(progress) }}%</span>
        </div>
        <div class="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--primary))] rounded-full transition-all duration-500"
            :style="{ width: `${progress}%` }"
          />
        </div>
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

interface Card {
  id: number
  value: string
  isFlipped: boolean
  isMatched: boolean
}

const gamesStore = useGamesStore()

const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑']
const cards = ref<Card[]>([])
const flippedCards = ref<number[]>([])
const moves = ref(0)
const matches = ref(0)
const isPlaying = ref(false)
const startTime = ref<number | null>(null)
const elapsed = ref(0)
let timer: number | null = null

const pairCount = emojis.length
const progress = computed(() => (matches.value / pairCount) * 100)
const timeLabel = computed(() => (elapsed.value / 1000).toFixed(1))
const bestSummary = computed(() => gamesStore.summaries.memory)
const bestLabel = computed(() => bestSummary.value?.bestScore ?? '-')

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)

const initializeGame = () => {
  const shuffled = shuffle([...emojis, ...emojis]).map((value, index) => ({
    id: index,
    value,
    isFlipped: false,
    isMatched: false
  }))
  cards.value = shuffled
  flippedCards.value = []
  moves.value = 0
  matches.value = 0
  elapsed.value = 0
}

const startTimer = () => {
  stopTimer()
  timer = window.setInterval(() => {
    if (isPlaying.value && startTime.value) elapsed.value = Date.now() - startTime.value
  }, 100)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const handleStart = () => {
  initializeGame()
  isPlaying.value = true
  startTime.value = Date.now()
  startTimer()
}

const pauseGame = () => {
  isPlaying.value = false
  stopTimer()
}

const cardClass = (card: Card) => {
  if (card.isMatched) return 'bg-green-500/20 scale-95'
  if (card.isFlipped) return 'bg-[rgb(var(--primary))] text-white scale-105'
  return 'bg-gradient-to-br from-[rgb(var(--card-elevated))] to-[rgb(var(--card))] hover:scale-105 active:scale-95'
}

const handleCardClick = (id: number) => {
  if (!isPlaying.value || flippedCards.value.length >= 2) return
  const card = cards.value.find(c => c.id === id)
  if (!card || card.isFlipped || card.isMatched) return

  card.isFlipped = true
  flippedCards.value = [...flippedCards.value, id]

  if (flippedCards.value.length === 2) {
    moves.value += 1
    checkMatch()
  }
}

const checkMatch = async () => {
  const [first, second] = flippedCards.value
  const firstCard = cards.value.find(c => c.id === first)
  const secondCard = cards.value.find(c => c.id === second)
  if (!firstCard || !secondCard) return

  if (firstCard.value === secondCard.value) {
    setTimeout(async () => {
      firstCard.isMatched = true
      secondCard.isMatched = true
      matches.value += 1
      flippedCards.value = []
      if (matches.value === pairCount) await finishGame()
    }, 400)
  } else {
    setTimeout(() => {
      firstCard.isFlipped = false
      secondCard.isFlipped = false
      flippedCards.value = []
    }, 800)
  }
}

const finishGame = async () => {
  isPlaying.value = false
  stopTimer()
  await gamesStore.saveResult({
    gameType: 'memory',
    score: moves.value,
    durationMs: elapsed.value,
    metadata: {
      gridSize: gridSize.value,
      pairs: pairCount,
      moves: moves.value
    }
  })
}

onMounted(async () => {
  initializeGame()
  await gamesStore.fetchSummary('memory')
})

onBeforeUnmount(stopTimer)
</script>
