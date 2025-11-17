<template>
  <div class="activities-page">
    <section class="summary-grid">
      <div class="summary-card">
        <p class="eyebrow">今日抽烟</p>
        <h2>{{ todaySmoking }} 支</h2>
        <p class="hint">统计来自今日已记录的抽烟次数</p>
      </div>
      <div class="summary-card">
        <p class="eyebrow">今日摸鱼</p>
        <h2>{{ todaySlack }} 分钟</h2>
        <p class="hint">以分钟为单位统计</p>
      </div>
      <div class="summary-card">
        <p class="eyebrow">最近活动</p>
        <h2>{{ activities.length }}</h2>
        <p class="hint">近 30 条操作记录</p>
      </div>
    </section>

    <section class="forms-grid">
      <v-card elevation="6" class="form-card">
        <v-card-title>抽烟记录</v-card-title>
        <v-card-subtitle>记录每一次抽烟的数量与心情，帮助自我觉察。</v-card-subtitle>

        <v-card-text class="form-body">
          <v-slider
            v-model="smokingForm.count"
            class="mt-4"
            :min="1"
            :max="10"
            step="1"
            thumb-label
            label="数量（支）"
          ></v-slider>

          <v-select
            v-model="smokingForm.mood"
            :items="smokingMoods"
            label="心情"
            prepend-inner-icon="mdi-emoticon-outline"
          ></v-select>

          <v-textarea
            v-model="smokingForm.notes"
            rows="2"
            label="简短描述（可选）"
            auto-grow
          ></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" :loading="submitting.smoking" @click="submitSmoking">
            记录抽烟
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card elevation="6" class="form-card">
        <v-card-title>摸鱼记录</v-card-title>
        <v-card-subtitle>记录放松时刻，帮助平衡效率与休息。</v-card-subtitle>

        <v-card-text class="form-body">
          <v-text-field
            v-model.number="slackForm.duration"
            type="number"
            min="5"
            max="240"
            step="5"
            label="时长（分钟）"
            prepend-inner-icon="mdi-timer-outline"
          ></v-text-field>

          <v-select
            v-model="slackForm.mood"
            :items="slackMoods"
            label="心情"
            prepend-inner-icon="mdi-emoticon-happy-outline"
          ></v-select>

          <v-textarea
            v-model="slackForm.notes"
            rows="2"
            label="简短描述（可选）"
            auto-grow
          ></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" :loading="submitting.slack" @click="submitSlack">
            记录摸鱼
          </v-btn>
        </v-card-actions>
      </v-card>
    </section>

    <section class="history-grid">
      <v-card elevation="4">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>抽烟记录</span>
          <v-chip size="small" variant="flat">{{ smokingRecords.length }}</v-chip>
        </v-card-title>
        <v-divider></v-divider>
        <div class="table-wrapper">
          <v-table density="comfortable">
            <thead>
              <tr>
                <th>时间</th>
                <th>数量</th>
                <th>心情</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in smokingRecords" :key="record.id">
                <td>{{ formatRecord(record.recorded_at) }}</td>
                <td>{{ record.count }} 支</td>
                <td>{{ translateMood(record.mood) }}</td>
                <td>{{ record.notes || '--' }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>

      <v-card elevation="4">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>摸鱼记录</span>
          <v-chip size="small" variant="flat">{{ slackRecords.length }}</v-chip>
        </v-card-title>
        <v-divider></v-divider>
        <div class="table-wrapper">
          <v-table density="comfortable">
            <thead>
              <tr>
                <th>时间</th>
                <th>时长</th>
                <th>心情</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in slackRecords" :key="record.id">
                <td>{{ formatRecord(record.recorded_at) }}</td>
                <td>{{ record.duration }} 分钟</td>
                <td>{{ translateMood(record.mood) }}</td>
                <td>{{ record.notes || '--' }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>
    </section>

    <section class="timeline-card" v-if="activities.length">
      <h3 class="timeline-title">最新活动</h3>
      <v-timeline align="start" density="comfortable">
        <v-timeline-item
          v-for="item in activities"
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
import { computed, onMounted, reactive, ref } from 'vue'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useActivityStore } from '@/stores/activity'
import { useNotificationStore } from '@/stores/notification'

const activityStore = useActivityStore()
const notificationStore = useNotificationStore()

const smokingForm = reactive({
  count: 1,
  mood: 'relaxed',
  notes: ''
})

const slackForm = reactive({
  duration: 30,
  mood: 'relaxed',
  notes: ''
})

const submitting = reactive({
  smoking: false,
  slack: false
})

const smokingMoods = [
  { title: '放松', value: 'relaxed' },
  { title: '压力大', value: 'stressed' },
  { title: '社交', value: 'social' },
  { title: '习惯', value: 'habit' },
  { title: '其它', value: 'other' }
]

const slackMoods = [
  { title: '放松', value: 'relaxed' },
  { title: '无聊', value: 'bored' },
  { title: '缓解压力', value: 'stress' },
  { title: '社交', value: 'social' },
  { title: '其它', value: 'other' }
]

const activities = computed(() => activityStore.activities)
const smokingRecords = computed(() => activityStore.smokingRecords)
const slackRecords = computed(() => activityStore.slackRecords)

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

const submitSmoking = async () => {
  submitting.smoking = true
  try {
    await activityStore.createSmokingRecord(smokingForm)
    notificationStore.showSuccess('已记录抽烟情况')
    smokingForm.notes = ''
  } catch (error: any) {
    notificationStore.showError(error.message || '记录失败')
  } finally {
    submitting.smoking = false
  }
}

const submitSlack = async () => {
  submitting.slack = true
  try {
    await activityStore.createSlackRecord(slackForm)
    notificationStore.showSuccess('摸鱼记录已保存')
    slackForm.notes = ''
  } catch (error: any) {
    notificationStore.showError(error.message || '记录失败')
  } finally {
    submitting.slack = false
  }
}

const formatRecord = (value: string) => format(new Date(value), 'MM月dd日 HH:mm', { locale: zhCN })

const renderTitle = (item: any) => {
  switch (item.category) {
    case 'smoking':
      return '抽烟记录'
    case 'slack':
      return '摸鱼记录'
    default:
      return '活动记录'
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

onMounted(() => {
  activityStore.initialize().catch(() => undefined)
})
</script>

<style scoped>
.activities-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 4px;
  background: #0f172a;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: #1e293b;
  border: 1px solid rgba(71, 85, 105, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.eyebrow {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.hint {
  color: #64748b;
  margin-top: 0.4rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.summary-card h2 {
  color: #f1f5f9;
  margin: 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.form-card {
  border-radius: 20px;
}

.form-card :deep(.v-card-title) {
  padding-bottom: 4px;
}

.form-card :deep(.v-card-subtitle) {
  padding-top: 0;
  line-height: 1.4;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-top: 0.75rem;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.timeline-card {
  background: #1e293b;
  border: 1px solid rgba(71, 85, 105, 0.2);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.timeline-title {
  margin: 0 0 1rem;
  color: #f1f5f9;
  font-size: 1.25rem;
  font-weight: 600;
}

.timeline-entry .time {
  font-size: 0.85rem;
  color: #94a3b8;
}

.timeline-entry .title {
  font-weight: 600;
  color: #cbd5e1;
}

.timeline-entry .details {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-wrapper table {
  min-width: 420px;
}

@media (max-width: 768px) {
  .activities-page {
    gap: 0.75rem;
    padding: 8px 4px;
  }

  .form-actions {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .summary-card {
    padding: 14px 16px;
    border-radius: 14px;
    margin: 0;
  }

  .summary-card h2 {
    font-size: 1.75rem;
  }

  .hint {
    font-size: 0.8rem;
  }

  .form-card {
    border-radius: 16px;
    margin: 0;
  }

  .form-card :deep(.v-card-text) {
    padding: 16px 16px 8px;
  }

  .timeline-card {
    padding: 16px;
    border-radius: 16px;
    margin: 0;
  }

  .timeline-title {
    font-size: 1.125rem;
  }

  .timeline-entry .title {
    font-size: 0.95rem;
  }

  .timeline-entry .details {
    font-size: 0.85rem;
  }

  .forms-grid {
    gap: 0.75rem;
  }

  .history-grid {
    gap: 0.75rem;
  }

  /* 超小屏幕优化 */
  @media (max-width: 375px) {
    .summary-card {
      padding: 12px 14px;
    }

    .timeline-card {
      padding: 14px;
    }

    .form-card :deep(.v-card-text) {
      padding: 14px;
    }

    .activities-page {
      padding: 4px 2px;
      gap: 0.65rem;
    }

    .summary-grid, .forms-grid, .history-grid {
      gap: 0.65rem;
    }
  }
}

@media (min-width: 769px) {
  .forms-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .history-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}
</style>
