<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="数独挑战" show-back />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <GlassCard v-if="!isPlaying">
        <p class="caption mb-3">选择难度</p>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="level in levels"
            :key="level.id"
            class="py-3 rounded-xl transition-base"
            :class="difficulty === level.id ? 'bg-[rgb(var(--primary))] text-white' : 'bg-white/5 hover:bg-white/10'"
            @click="difficulty = level.id"
          >
            {{ level.label }}
          </button>
        </div>
      </GlassCard>

      <GlassCard class="overflow-hidden">
        <div class="grid grid-cols-9 gap-0">
          <button
            v-for="(cell, idx) in flatGrid"
            :key="idx"
            class="aspect-square flex items-center justify-center text-lg transition-base"
            :class="cellClass(idx, cell)"
            :disabled="!isPlaying"
            @click="handleCellClick(idx)"
          >
            {{ cell !== 0 ? cell : '' }}
          </button>
        </div>
      </GlassCard>

      <GlassCard v-if="isPlaying">
        <div class="grid grid-cols-5 gap-3">
          <button
            v-for="num in 9"
            :key="num"
            class="aspect-square rounded-xl bg-[rgb(var(--card-elevated))] hover:bg-[rgb(var(--primary))] hover:text-white transition-base text-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            :disabled="!canEditSelected"
            @click="handleNumberInput(num)"
          >
            {{ num }}
          </button>
          <button
            class="aspect-square rounded-xl bg-red-500/20 hover:bg-red-500 hover:text-white transition-base disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center"
            :disabled="!canEditSelected"
            @click="handleErase"
          >
            <Icon icon="lucide:eraser" class="w-5 h-5" />
          </button>
        </div>
      </GlassCard>

      <div class="flex gap-3">
        <Button v-if="!isPlaying" class="flex-1 h-14 gradient-primary glow-primary" @click="startGame">
          <Icon icon="lucide:play" class="w-5 h-5 mr-2" />
          开始游戏
        </Button>
        <Button v-else variant="outline" class="flex-1 h-14 border-white/10" @click="pauseGame">
          暂停
        </Button>
        <Button variant="outline" class="h-14 w-14 border-white/10" size="icon" @click="resetGrid">
          <Icon icon="lucide:rotate-ccw" class="w-5 h-5" />
        </Button>
      </div>

      <GlassCard v-if="!isPlaying">
        <h4 class="mb-3">游戏说明</h4>
        <ul class="space-y-2 text-sm text-secondary">
          <li>• 每行、每列都要包含数字 1-9</li>
          <li>• 每个 3×3 宫格也要包含数字 1-9</li>
          <li>• 加粗的数字是初始数字，不能修改</li>
          <li>• 点击格子后使用数字键盘输入</li>
        </ul>
      </GlassCard>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import TopNav from '@/components/TopNav.vue'
import GlassCard from '@/components/GlassCard.vue'
import Button from '@/components/ui/Button.vue'

type Difficulty = 'easy' | 'medium' | 'hard'

const levels = [
  { id: 'easy', label: '简单' },
  { id: 'medium', label: '中等' },
  { id: 'hard', label: '困难' }
] as const

const difficulty = ref<Difficulty>('easy')
const isPlaying = ref(false)
const selectedIndex = ref<number | null>(null)

const baseGrid = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
]

const grid = ref<number[][]>(baseGrid.map(row => [...row]))
const initialGrid = ref<number[][]>(baseGrid.map(row => [...row]))

const flatGrid = computed(() => grid.value.flat())

const rowColFromIndex = (idx: number) => {
  const row = Math.floor(idx / 9)
  const col = idx % 9
  return { row, col }
}

const handleCellClick = (idx: number) => {
  if (!isPlaying.value) return
  const { row, col } = rowColFromIndex(idx)
  if (initialGrid.value[row][col] !== 0) return
  selectedIndex.value = idx
}

const handleNumberInput = (num: number) => {
  if (selectedIndex.value === null) return
  const { row, col } = rowColFromIndex(selectedIndex.value)
  if (initialGrid.value[row][col] !== 0) return
  const copy = grid.value.map(r => [...r])
  copy[row][col] = num
  grid.value = copy
}

const handleErase = () => {
  if (selectedIndex.value === null) return
  const { row, col } = rowColFromIndex(selectedIndex.value)
  if (initialGrid.value[row][col] !== 0) return
  const copy = grid.value.map(r => [...r])
  copy[row][col] = 0
  grid.value = copy
}

const isInSameRow = (row: number) => {
  if (selectedIndex.value === null) return false
  return row === Math.floor(selectedIndex.value / 9)
}

const isInSameCol = (col: number) => {
  if (selectedIndex.value === null) return false
  return col === selectedIndex.value % 9
}

const isInSameBox = (row: number, col: number) => {
  if (selectedIndex.value === null) return false
  const selRow = Math.floor(selectedIndex.value / 9)
  const selCol = selectedIndex.value % 9
  return Math.floor(row / 3) === Math.floor(selRow / 3) && Math.floor(col / 3) === Math.floor(selCol / 3)
}

const cellClass = (idx: number, cell: number) => {
  const { row, col } = rowColFromIndex(idx)
  const isRightBorder = (col + 1) % 3 === 0 && col !== 8
  const isBottomBorder = (row + 1) % 3 === 0 && row !== 8
  const isSelected = selectedIndex.value === idx
  const highlighted = isInSameRow(row) || isInSameCol(col) || isInSameBox(row, col)
  return [
    isSelected
      ? 'bg-[rgb(var(--primary))] text-white'
      : highlighted
        ? 'bg-[rgb(var(--primary))]/10'
        : 'bg-white/5 hover:bg-white/10',
    initialGrid.value[row][col] !== 0 ? 'font-bold' : 'text-[rgb(var(--muted-foreground))]',
    isRightBorder ? 'border-r-2 border-white/20' : 'border-r border-white/5',
    isBottomBorder ? 'border-b-2 border-white/20' : 'border-b border-white/5',
    !isPlaying.value ? 'opacity-50' : ''
  ]
}

const canEditSelected = computed(() => {
  if (selectedIndex.value === null) return false
  const { row, col } = rowColFromIndex(selectedIndex.value)
  return initialGrid.value[row][col] === 0
})

const startGame = () => {
  isPlaying.value = true
}

const pauseGame = () => {
  isPlaying.value = false
}

const resetGrid = () => {
  grid.value = initialGrid.value.map(row => [...row])
  selectedIndex.value = null
}
</script>
