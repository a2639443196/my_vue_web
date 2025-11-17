<template>
  <div class="dashboard">
    <section class="hero">
      <div>
        <p class="eyebrow">今日概览</p>
        <h1>状态仪表盘</h1>
        <p class="description">
          汇总饮水、抽烟与摸鱼记录，并提供快捷入口助你保持节奏。
        </p>
      </div>
      <div class="quick-actions">
        <v-btn color="primary" variant="flat" @click="goWater">
          <v-icon start>mdi-water</v-icon>
          去喝水
        </v-btn>
        <v-btn color="secondary" variant="outlined" @click="goActivities">
          <v-icon start>mdi-notebook-edit</v-icon>
          记录活动
        </v-btn>
        <v-btn variant="text" @click="goChat">
          <v-icon start>mdi-chat-outline</v-icon>
          聊天室
        </v-btn>
      </div>
    </section>

    <section class="summary-grid">
      <div class="summary-card">
        <p class="label">今日饮水</p>
        <h2>{{ todayHydration }} ml</h2>
        <div class="hint">目标 {{ dailyTarget }} ml（本月 {{ monthHydration }} ml）</div>
      </div>
      <div class="summary-card">
        <p class="label">今日抽烟</p>
        <h2>{{ todaySmoking }} 支</h2>
        <div class="hint">共 {{ smokingRecords.length }} 条记录</div>
      </div>
      <div class="summary-card">
        <p class="label">今日摸鱼</p>
        <h2>{{ todaySlack }} 分钟</h2>
        <div class="hint">心情 {{ slackMood }}</div>
      </div>
      <div class="summary-card">
        <p class="label">聊天室消息</p>
        <h2>{{ chatPreview.length }}</h2>
        <div class="hint">最新 5 条以供回顾</div>
      </div>
    </section>

    <section class="cards-grid">
      <v-card elevation="4">
        <v-card-title>最近饮水记录</v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>时间</th>
                <th>饮品</th>
                <th>容量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in hydrationEntries.slice(0, 5)" :key="entry.id">
                <td>{{ formatRecord(entry.recorded_at) }}</td>
                <td>{{ entry.drink_name }}</td>
                <td>{{ entry.amount }} ml</td>
              </tr>
              <tr v-if="!hydrationEntries.length">
                <td colspan="3" class="empty-cell">暂无饮水记录，快去补水吧。</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <v-card elevation="4">
        <v-card-title>聊天室动态</v-card-title>
        <v-card-text class="chat-preview">
          <template v-if="chatPreview.length">
            <div v-for="message in chatPreview" :key="message.id" class="chat-line">
              <span class="author">{{ message.username }}：</span>
              <span class="content">{{ message.content }}</span>
              <span class="time">{{ formatRecord(message.createdAt) }}</span>
            </div>
          </template>
          <div v-else class="empty-cell">还没有聊天记录。</div>
        </v-card-text>
      </v-card>
    </section>

    <section class="timeline-card" v-if="activityTimeline.length">
      <h3>最新活动</h3>
      <v-timeline align="start" density="comfortable">
        <v-timeline-item
          v-for="item in activityTimeline"
          :key="item.id"
          :dot-color="item.category === 'smoking' ? 'primary' : item.category === 'slack' ? 'teal' : 'grey'"
        >
          <div class="timeline-entry">
            <div class="time">{{ formatRecord(item.created_at) }}</div>
            <div class="title">{{ renderTitle(item) }}</div>
            <div class="details">{{ renderDetails(item) }}</div>
          </div>
        </v-timeline-item>
      </v-timeline>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useHydrationStore } from '@/stores/hydration'
import { useActivityStore } from '@/stores/activity'
import { useChatStore } from '@/stores/chat'

const router = useRouter()
const hydrationStore = useHydrationStore()
const activityStore = useActivityStore()
const chatStore = useChatStore()

const dailyTarget = 2000

const hydrationEntries = computed(() => hydrationStore.entries)
const todayHydration = computed(() => {
  const today = format(new Date(), 'yyyy-MM-dd')
  return hydrationEntries.value
    .filter(entry => entry.recorded_at.startsWith(today))
    .reduce((sum, entry) => sum + entry.amount, 0)
})

const monthHydration = computed(() => {
  const month = format(new Date(), 'yyyy-MM')
  return hydrationEntries.value
    .filter(entry => entry.recorded_at.startsWith(month))
    .reduce((sum, entry) => sum + entry.amount, 0)
})

const smokingRecords = computed(() => activityStore.smokingRecords)
const slackRecords = computed(() => activityStore.slackRecords)
const activityTimeline = computed(() => activityStore.activities.slice(0, 6))

const todaySmoking = computed(() => {
  const today = format(new Date(), 'yyyy-MM-dd')
  return smokingRecords.value
    .filter(record => record.recorded_at.startsWith(today))
    .reduce((sum, record) => sum + record.count, 0)
})

const todaySlack = computed(() => {
  const today = format(new Date(), 'yyyy-MM-dd')
  return slackRecords.value
    .filter(record => record.recorded_at.startsWith(today))
    .reduce((sum, record) => sum + record.duration, 0)
})

const slackMood = computed(() => {
  if (!slackRecords.value.length) return '--'
  const latest = slackRecords.value[0]
  return translateMood(latest.mood)
})

const chatPreview = computed(() => chatStore.messages.slice(-5).reverse())

const translateMood = (value?: string | null) => {
  if (!value) return '--'
  const map: Record<string, string> = {
    relaxed: '放松',
    stressed: '压力大',
    social: '社交',
    habit: '习惯',
    other: '其它',
    bored: '无聊',
    stress: '缓解压力'
  }
  return map[value] || value
}

const formatRecord = (value: string) => format(new Date(value), 'MM月dd日 HH:mm', { locale: zhCN })

const renderTitle = (item: any) => {
  switch (item.category) {
    case 'smoking':
      return '抽烟记录'
    case 'slack':
      return '摸鱼记录'
    default:
      return '活动'
  }
}

const renderDetails = (item: any) => {
  if (item.category === 'smoking') {
    return `数量 ${item.details?.count ?? '--'} 支 · 心情 ${translateMood(item.details?.mood)}`
  }
  if (item.category === 'slack') {
    return `时长 ${item.details?.duration ?? '--'} 分钟 · 心情 ${translateMood(item.details?.mood)}`
  }
  return item.details?.description || JSON.stringify(item.details || {})
}

const goWater = () => router.push({ name: 'WaterTracker' })
const goActivities = () => router.push({ name: 'Activities' })
const goChat = () => router.push({ name: 'ChatRoom' })

onMounted(async () => {
  await Promise.all([
    hydrationStore.fetchEntries(),
    activityStore.initialize()
  ]).catch(() => undefined)
  chatStore.initialize()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: #e5e7eb;
  background: #0b1220;
  padding: clamp(1.25rem, 4vw, 2rem);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.eyebrow {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.7);
}

.description {
  color: rgba(226, 232, 240, 0.7);
  max-width: 520px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  padding: 1.25rem;
  border-radius: 20px;
  background: #0f172a;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.summary-card .label {
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.7);
}

.summary-card h2 {
  margin: 0.3rem 0;
}

.summary-card .hint {
  color: rgba(226, 232, 240, 0.65);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.chat-preview {
  display: grid;
  gap: 0.5rem;
}

.chat-line {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  align-items: baseline;
  font-size: 0.95rem;
}

.chat-line .author {
  font-weight: 600;
}

.chat-line .content {
  color: rgba(226, 232, 240, 0.8);
  word-break: break-word;
}

.chat-line .time {
  font-size: 0.8rem;
  color: rgba(226, 232, 240, 0.6);
}

.timeline-card {
  background: #0f172a;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.timeline-entry .time {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.65);
}

.timeline-entry .title {
  font-weight: 600;
}

.timeline-entry .details {
  color: rgba(226, 232, 240, 0.7);
}

.empty-cell {
  text-align: center;
  color: rgba(15, 23, 42, 0.45);
}

@media (max-width: 768px) {
  .quick-actions {
    flex-direction: column;
  }
}
</style>
