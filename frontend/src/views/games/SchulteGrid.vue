<template>
  <div class="schulte-view">
    <v-card class="main-card" elevation="6">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">舒尔特方格训练</h1>
          <p class="text-body-2 text-medium-emphasis">
            点击数字 1 开始，按顺序找到所有数字。训练可提升专注力与视线移动速度。
          </p>
        </div>
        <div class="controls">
          <v-select
            v-model="gridSize"
            :items="gridOptions"
            label="方格尺寸"
            hide-details
            density="comfortable"
            style="max-width: 140px"
          ></v-select>
          <v-switch
            v-model="highlightOnClick"
            label="点击后高亮"
            inset
            hide-details
            color="primary"
            class="ml-4"
          ></v-switch>
          <v-btn color="primary" class="ml-3" @click="startGame">
            <v-icon start>mdi-refresh</v-icon>
            重新开始
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <div class="grid-wrapper">
          <div class="grid" :style="gridStyle">
            <button
              v-for="number in numbers"
              :key="number"
              class="grid-cell"
              :class="{
                correct: completedNumbers.includes(number),
                next: highlightOnClick && number === nextNumber
              }"
              @click="selectNumber(number)"
            >
              {{ number }}
            </button>
          </div>
        </div>

        <div class="stats">
          <div>
            <span>当前目标</span>
            <strong>{{ nextNumber }}</strong>
          </div>
          <div>
            <span>已用时间</span>
            <strong>{{ elapsedDisplay }}</strong>
          </div>
          <div>
            <span>最佳成绩</span>
            <strong>{{ bestRecord ? bestRecord.score.toFixed(2) + ' 秒' : '--' }}</strong>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card elevation="4">
      <v-card-title>历史成绩</v-card-title>
      <v-card-text>
        <div v-if="history.length" class="history-list">
          <div v-for="record in history" :key="record.id" class="history-item">
            <div class="time">{{ formatDate(record.createdAt) }}</div>
            <div class="summary">{{ record.summary }}</div>
          </div>
        </div>
        <div v-else class="empty">还没有成绩记录，点击数字 1 开始训练。</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { format } from 'date-fns'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

const gridOptions = [
  { title: '4 x 4', value: 4 },
  { title: '5 x 5', value: 5 },
  { title: '6 x 6', value: 6 }
]

const gridSize = ref(5)
const numbers = ref<number[]>([])
const completedNumbers = ref<number[]>([])
const nextNumber = ref(1)
const elapsed = ref(0)
const timer = ref<number | null>(null)
const started = ref(false)
const startTime = ref<number | null>(null)
const highlightOnClick = ref(true)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridSize.value}, 1fr)`,
  gridTemplateRows: `repeat(${gridSize.value}, 1fr)`
}))

const bestRecord = computed(() => userStore.bestSchulteRecord)
const history = computed(() =>
  userStore.gameRecords.filter(record => record.game === 'schulte').slice(0, 6)
)

const elapsedDisplay = computed(() => `${elapsed.value.toFixed(2)} 秒`)

const shuffle = (array: number[]) => {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const generateGrid = () => {
  const total = gridSize.value ** 2
  const arr = Array.from({ length: total }, (_, index) => index + 1)
  numbers.value = shuffle(arr)
  completedNumbers.value = []
  nextNumber.value = 1
  elapsed.value = 0
  started.value = false
  startTime.value = null
  clearTimer()
}

const startGame = () => {
  generateGrid()
}

const selectNumber = (number: number) => {
  if (!started.value) {
    started.value = true
    startTimer()
  }

  if (number === nextNumber.value) {
    completedNumbers.value.push(number)
    if (number === gridSize.value ** 2) {
      finishGame()
    } else {
      nextNumber.value += 1
    }
  } else {
    notificationStore.showWarning('顺序错误，请继续寻找正确的数字。')
  }
}

const startTimer = () => {
  startTime.value = performance.now()
  timer.value = window.setInterval(() => {
    if (!startTime.value) return
    const now = performance.now()
    elapsed.value = (now - startTime.value) / 1000
  }, 50)
}

const clearTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const finishGame = () => {
  clearTimer()
  started.value = false
  if (startTime.value) {
    elapsed.value = (performance.now() - startTime.value) / 1000
  }
  notificationStore.showSuccess('恭喜完成训练，成绩已记录！')

  userStore.recordGameResult('schulte', {
    score: elapsed.value,
    unit: '秒',
    summary: `${gridSize.value} x ${gridSize.value} 用时 ${elapsed.value.toFixed(2)} 秒`,
    details: {
      gridSize: gridSize.value,
      path: [...completedNumbers.value]
    }
  })
}

watch(gridSize, () => {
  startGame()
})

onBeforeUnmount(() => {
  clearTimer()
})

const formatDate = (date: string) => format(new Date(date), 'MM月dd日 HH:mm')

startGame()
</script>

<style scoped>
.schulte-view {
  display: grid;
  gap: 2rem;
}

.main-card {
  border-radius: 24px;
}

.controls {
  display: flex;
  align-items: center;
}

.grid-wrapper {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.grid {
  display: grid;
  gap: 0.75rem;
  width: min(520px, 100%);
}

.grid-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.grid-cell:hover {
  transform: translateY(-2px);
  background: rgba(63, 81, 181, 0.12);
}

.grid-cell.correct {
  background: rgba(76, 175, 80, 0.22);
  color: #1b5e20;
}

.grid-cell.next {
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.4);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.stats span {
  display: block;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 0.4rem;
}

.stats strong {
  font-size: 1.4rem;
}

.history-list {
  display: grid;
  gap: 1rem;
}

.history-item {
  padding: 0.8rem 1rem;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
}

.history-item .time {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.55);
}

.history-item .summary {
  margin-top: 0.25rem;
  font-weight: 600;
}

.empty {
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  padding: 1rem 0;
}
</style>
