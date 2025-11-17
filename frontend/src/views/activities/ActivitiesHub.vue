<template>
  <div class="activities-page container main-content-with-toolbar">
    <!-- 页面标题 -->
    <div class="section">
      <h1 class="section__title">活动记录</h1>
      <p class="section__subtitle">记录您的日常活动，追踪健康数据</p>
    </div>

    <!-- 统计概览 -->
    <section class="summary-section">
      <div class="summary-grid grid grid--3-cols">
        <div class="summary-card card">
          <div class="card__header">
            <h3 class="card__title">今日抽烟</h3>
          </div>
          <div class="card__content">
            <div class="summary-number">{{ todaySmoking }}</div>
            <p class="text-tertiary text-sm mt-2">支</p>
            <p class="text-quaternary text-xs mt-1">统计来自今日已记录的抽烟次数</p>
          </div>
        </div>
        <div class="summary-card card">
          <div class="card__header">
            <h3 class="card__title">今日摸鱼</h3>
          </div>
          <div class="card__content">
            <div class="summary-number">{{ todaySlack }}</div>
            <p class="text-tertiary text-sm mt-2">分钟</p>
            <p class="text-quaternary text-xs mt-1">以分钟为单位统计</p>
          </div>
        </div>
        <div class="summary-card card">
          <div class="card__header">
            <h3 class="card__title">最近活动</h3>
          </div>
          <div class="card__content">
            <div class="summary-number">{{ activities.length }}</div>
            <p class="text-tertiary text-sm mt-2">条记录</p>
            <p class="text-quaternary text-xs mt-1">近 30 条操作记录</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 表单区域 -->
    <section class="forms-section">
      <div class="grid grid--2-cols">
        <!-- 抽烟记录表单 -->
        <div class="card">
          <div class="card__header">
            <h2 class="card__title">抽烟记录</h2>
            <p class="card__subtitle">记录每一次抽烟的数量与心情，帮助自我觉察</p>
          </div>
          <div class="card__content">
            <div class="form-group">
              <label class="form-label">数量（支）</label>
              <div class="slider-container">
                <input
                  type="range"
                  v-model="smokingForm.count"
                  :min="1"
                  :max="10"
                  step="1"
                  class="slider"
                />
                <div class="slider-value">{{ smokingForm.count }}</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">心情</label>
              <select v-model="smokingForm.mood" class="input">
                <option v-for="mood in smokingMoods" :key="mood.value" :value="mood.value">
                  {{ mood.title }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">简短描述（可选）</label>
              <textarea
                v-model="smokingForm.notes"
                class="input"
                rows="3"
                placeholder="记录当时的心情或想法..."
              ></textarea>
            </div>
          </div>
          <div class="card__footer">
            <button
              class="btn btn--primary btn--lg"
              :class="{ 'btn--loading': submitting.smoking }"
              :disabled="submitting.smoking"
              @click="submitSmoking"
            >
              <span v-if="!submitting.smoking">记录抽烟</span>
              <span v-else>记录中...</span>
            </button>
          </div>
        </div>

        <!-- 摸鱼记录表单 -->
        <div class="card">
          <div class="card__header">
            <h2 class="card__title">摸鱼记录</h2>
            <p class="card__subtitle">记录放松时刻，帮助平衡效率与休息</p>
          </div>
          <div class="card__content">
            <div class="form-group">
              <label class="form-label">时长（分钟）</label>
              <input
                v-model.number="slackForm.duration"
                type="number"
                :min="5"
                :max="240"
                :step="5"
                class="input"
                placeholder="输入时长"
              />
            </div>

            <div class="form-group">
              <label class="form-label">心情</label>
              <select v-model="slackForm.mood" class="input">
                <option v-for="mood in slackMoods" :key="mood.value" :value="mood.value">
                  {{ mood.title }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">简短描述（可选）</label>
              <textarea
                v-model="slackForm.notes"
                class="input"
                rows="3"
                placeholder="记录放松的内容..."
              ></textarea>
            </div>
          </div>
          <div class="card__footer">
            <button
              class="btn btn--primary btn--lg"
              :class="{ 'btn--loading': submitting.slack }"
              :disabled="submitting.slack"
              @click="submitSlack"
            >
              <span v-if="!submitting.slack">记录摸鱼</span>
              <span v-else>记录中...</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 活动时间线 -->
    <section class="timeline-section" v-if="activities.length">
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">最新活动</h2>
          <p class="card__subtitle">查看您的最近活动记录</p>
        </div>
        <div class="card__content">
          <div class="timeline">
            <div
              v-for="item in activities"
              :key="item.id"
              class="timeline-item"
            >
              <div class="timeline-item__dot" :class="`timeline-item__dot--${item.category}`"></div>
              <div class="timeline-item__content">
                <div class="timeline-item__time text-quaternary text-sm">
                  {{ formatRecord(item.created_at) }}
                </div>
                <div class="timeline-item__title font-semibold text-primary">
                  {{ renderTitle(item) }}
                </div>
                <div class="timeline-item__details text-secondary text-word-break">
                  {{ renderDetails(item) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
/* 页面布局 */
.activities-page {
  padding-bottom: var(--space-6);
  background-color: var(--color-bg-primary);
}

/* 统计概览区域 */
.summary-section {
  margin-bottom: var(--space-6);
}

.summary-grid {
  gap: var(--space-4);
}

.summary-card {
  text-align: center;
}

.summary-number {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-1);
}

/* 表单区域 */
.forms-section {
  margin-bottom: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

/* 自定义滑块 */
.slider-container {
  position: relative;
  padding: var(--space-2) 0;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow-sm);
}

.slider-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-primary);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  min-width: 32px;
  text-align: center;
}

/* 时间线区域 */
.timeline-section {
  margin-bottom: var(--space-6);
}

.timeline {
  position: relative;
  padding-left: var(--space-4);
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: var(--color-border-secondary);
}

.timeline-item {
  position: relative;
  padding-bottom: var(--space-5);
  padding-left: var(--space-5);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item__dot {
  position: absolute;
  left: -20px;
  top: 6px;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-bg-surface);
  z-index: 1;
}

.timeline-item__dot--smoking {
  background-color: var(--color-primary);
}

.timeline-item__dot--slack {
  background-color: var(--color-info);
}

.timeline-item__content {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  box-shadow: var(--shadow-sm);
}

.timeline-item__time {
  margin-bottom: var(--space-1);
}

.timeline-item__title {
  margin-bottom: var(--space-1);
}

.timeline-item__details {
  line-height: var(--line-height-normal);
}

/* 加载状态 */
.btn--loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn--loading:hover {
  transform: none;
  box-shadow: none;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .activities-page {
    padding-bottom: var(--space-8);
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .summary-number {
    font-size: var(--font-size-2xl);
  }

  .forms-section .grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .timeline {
    padding-left: var(--space-3);
  }

  .timeline::before {
    left: 6px;
  }

  .timeline-item {
    padding-left: var(--space-4);
    padding-bottom: var(--space-4);
  }

  .timeline-item__dot {
    left: -16px;
    width: 14px;
    height: 14px;
  }

  .timeline-item__content {
    padding: var(--space-2) var(--space-3);
  }
}

/* 小屏幕优化 */
@media (max-width: 375px) {
  .summary-number {
    font-size: var(--font-size-xl);
  }

  .slider-value {
    min-width: 28px;
    font-size: var(--font-size-xs);
  }

  .timeline-item__content {
    padding: var(--space-2);
  }
}
</style>
