<template>
  <div class="reaction-view">
    <v-card class="main-card" elevation="6">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">反应力测试</h1>
          <p class="text-body-2 text-medium-emphasis">
            当屏幕变为亮绿色时立即点击，连续测试 {{ totalAttempts }} 次，获得平均与最佳成绩。
          </p>
        </div>
        <v-btn color="primary" @click="startTest" :disabled="state === 'waiting'">
          <v-icon start>mdi-reload</v-icon>
          {{ state === 'idle' ? '开始测试' : '重新开始' }}
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="test-panel" :class="state" @click="handleClick">
          <div class="panel-content">
            <template v-if="state === 'idle'">
              <span class="hint">点击“开始测试”后等待屏幕变绿</span>
            </template>
            <template v-else-if="state === 'waiting'">
              <span class="hint">准备...请等待绿色提示</span>
            </template>
            <template v-else-if="state === 'ready'">
              <span class="action">点击！</span>
            </template>
            <template v-else-if="state === 'cooldown'">
              <span class="hint">稍等片刻...</span>
            </template>
            <template v-else>
              <span class="result">{{ lastReaction }} ms</span>
              <span class="hint">第 {{ attempts.length }} 次</span>
            </template>
          </div>
        </div>

        <div class="attempts">
          <h3>成绩记录</h3>
          <div class="chips">
            <v-chip
              v-for="(value, index) in attempts"
              :key="index"
              color="primary"
              variant="outlined"
            >
              第 {{ index + 1 }} 次：{{ value }} ms
            </v-chip>
          </div>
          <div class="stats" v-if="attempts.length">
            <div>
              <span>平均反应</span>
              <strong>{{ averageReaction }} ms</strong>
            </div>
            <div>
              <span>最佳成绩</span>
              <strong>{{ bestReaction }} ms</strong>
            </div>
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
        <div v-else class="empty">暂无历史成绩，完成一次测试即可记录。</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { format } from 'date-fns'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

const totalAttempts = 5
const state = ref<'idle' | 'waiting' | 'ready' | 'result' | 'cooldown'>('idle')
const attempts = ref<number[]>([])
const waitTimeout = ref<number | null>(null)
const cooldownTimeout = ref<number | null>(null)
const startTimestamp = ref<number | null>(null)
const lastReaction = ref<number>(0)

const averageReaction = computed(() => {
  if (!attempts.value.length) return 0
  const total = attempts.value.reduce((sum, value) => sum + value, 0)
  return Math.round(total / attempts.value.length)
})

const bestReaction = computed(() => {
  if (!attempts.value.length) return 0
  return Math.min(...attempts.value)
})

const history = computed(() =>
  userStore.gameRecords.filter(record => record.game === 'reaction').slice(0, 6)
)

const startTest = () => {
  attempts.value = []
  state.value = 'waiting'
  scheduleReady()
}

const scheduleReady = () => {
  clearTimers()
  const delay = 1000 + Math.random() * 2000
  waitTimeout.value = window.setTimeout(() => {
    state.value = 'ready'
    startTimestamp.value = performance.now()
  }, delay)
}

const handleClick = () => {
  if (state.value === 'waiting') {
    notificationStore.showWarning('太心急啦！等绿色提示出现再点。')
    startTest()
    return
  }

  if (state.value === 'ready') {
    const end = performance.now()
    const reaction = Math.round(end - (startTimestamp.value || end))
    lastReaction.value = reaction
    attempts.value.push(reaction)
    state.value = 'result'

    if (attempts.value.length >= totalAttempts) {
      finishTest()
    } else {
      cooldownTimeout.value = window.setTimeout(() => {
        state.value = 'waiting'
        scheduleReady()
      }, 800)
    }
    return
  }

  if (state.value === 'idle') {
    startTest()
  }
}

const finishTest = () => {
  clearTimers()
  state.value = 'cooldown'
  const best = bestReaction.value
  const average = averageReaction.value
  const summary = `最佳 ${best} ms · 平均 ${average} ms`

  userStore.recordGameResult('reaction', {
    score: best,
    unit: '毫秒',
    summary,
    details: {
      attempts: [...attempts.value],
      average
    }
  })

  notificationStore.showSuccess('反应力成绩已记录')
  cooldownTimeout.value = window.setTimeout(() => {
    state.value = 'idle'
  }, 1500)
}

const clearTimers = () => {
  if (waitTimeout.value) {
    clearTimeout(waitTimeout.value)
    waitTimeout.value = null
  }
  if (cooldownTimeout.value) {
    clearTimeout(cooldownTimeout.value)
    cooldownTimeout.value = null
  }
}

onBeforeUnmount(() => {
  clearTimers()
})

const formatDate = (date: string) => format(new Date(date), 'MM月dd日 HH:mm')
</script>

<style scoped>
.reaction-view {
  display: grid;
  gap: 2rem;
}

.main-card {
  border-radius: 24px;
}

.test-panel {
  border-radius: 20px;
  height: 260px;
  display: grid;
  place-items: center;
  margin-top: 1.5rem;
  transition: background 0.3s ease;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.04);
}

.test-panel.waiting {
  background: rgba(255, 193, 7, 0.2);
}

.test-panel.ready {
  background: rgba(76, 175, 80, 0.35);
}

.test-panel.cooldown {
  background: rgba(96, 125, 139, 0.2);
}

.test-panel.result {
  background: rgba(63, 81, 181, 0.18);
}

.panel-content {
  text-align: center;
  display: grid;
  gap: 0.6rem;
}

.panel-content .hint {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.6);
}

.panel-content .action {
  font-size: 2.8rem;
  font-weight: 700;
  color: #0f172a;
}

.panel-content .result {
  font-size: 2.4rem;
  font-weight: 700;
  color: #0f172a;
}

.attempts {
  margin-top: 2rem;
}

.attempts h3 {
  margin-bottom: 0.75rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stats {
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
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
  padding: 0.75rem 1rem;
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
