<template>
  <div class="water-tracker">
    <section class="tracker-hero">
      <div class="hero-left">
        <h1>喝水打卡</h1>
        <p>保持每日 2000 ml 以上的饮水量，帮助身体维持最佳状态。使用小杯快捷按钮或自定义毫升数来完成补水。</p>
        <div class="target-control">
          <span>每日目标：{{ hydrationTarget }} ml</span>
          <v-slider
            class="mt-2"
            :min="1200"
            :max="4000"
            step="100"
            v-model="target"
            @change="updateTarget"
          ></v-slider>
        </div>
        <div class="quick-actions">
          <span>快捷杯量：</span>
          <v-chip-group selected-class="selected-chip">
            <v-chip
              v-for="cup in cups"
              :key="cup"
              class="cup-chip"
              @click="addWater(cup)"
            >
              {{ cup }} ml
            </v-chip>
          </v-chip-group>
        </div>
        <div class="custom-input">
          <v-text-field
            v-model.number="customAmount"
            type="number"
            label="自定义毫升数"
            min="50"
            max="2000"
            append-inner-icon="mdi-water"
          ></v-text-field>
          <v-btn color="primary" :disabled="!customAmount" @click="addWater(customAmount)">
            记录饮水
          </v-btn>
        </div>
      </div>
      <div class="hero-right">
        <div class="cup" :style="{ '--fill': cupFillHeight }">
          <div class="cup-fill"></div>
          <div class="cup-info">
            <div class="cup-value">{{ todayHydration }} ml</div>
            <div class="cup-sub">今日进度 {{ hydrationProgress.toFixed(0) }}%</div>
          </div>
        </div>
        <div class="hero-stats">
          <div>
            <span class="label">剩余目标</span>
            <strong>{{ Math.max(hydrationTarget - todayHydration, 0) }} ml</strong>
          </div>
          <div>
            <span class="label">7 日总量</span>
            <strong>{{ sevenDayTotal }} ml</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="calendar-section">
      <div class="section-header">
        <h2>饮水日历</h2>
        <p>展示上月与本月每日饮水量，颜色越深表示完成度越高。</p>
      </div>
      <div class="calendar-grid">
        <div v-for="month in months" :key="month.key" class="calendar-month">
          <div class="month-header">{{ month.label }}</div>
          <div class="weekday-row">
            <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
          </div>
          <div class="days-grid">
            <div
              v-for="day in month.days"
              :key="day.date"
              class="day"
              :class="{ today: day.isToday }"
              :style="{ '--fill': day.fill }"
            >
              <span class="day-number">{{ day.label }}</span>
              <span class="day-ml">{{ day.total ? day.total + 'ml' : '' }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="history-section" v-if="recentEntries.length">
      <div class="section-header">
        <h2>最新饮水记录</h2>
        <p>按时间倒序显示最近的喝水情况。</p>
      </div>
      <v-table class="history-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>饮水量</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in recentEntries" :key="entry.id">
            <td>{{ formatDate(entry.recordedAt) }}</td>
            <td>{{ entry.amount }} ml</td>
            <td>{{ entry.note || '--' }}</td>
          </tr>
        </tbody>
      </v-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, subDays, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

const cups = [120, 180, 240, 320, 500]
const customAmount = ref<number | null>(null)
const target = ref(userStore.hydrationTarget)

const hydrationTarget = computed(() => userStore.hydrationTarget)
const todayHydration = computed(() => userStore.todayHydration)
const hydrationProgress = computed(() => {
  if (hydrationTarget.value === 0) return 0
  return Math.min((todayHydration.value / hydrationTarget.value) * 100, 150)
})

const cupFillHeight = computed(() => `${Math.min(hydrationProgress.value, 100)}%`)

const hydrationHistory = computed(() => userStore.hydrationHistory)
const recentEntries = computed(() => userStore.hydrationEntries.slice(0, 10))

const sevenDayTotal = computed(() => {
  const now = new Date()
  const days = eachDayOfInterval({ start: subDays(now, 6), end: now })
  return days.reduce((sum, day) => {
    const key = format(day, 'yyyy-MM-dd')
    return sum + (hydrationHistory.value[key]?.total || 0)
  }, 0)
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const months = computed(() => {
  const current = new Date()
  const previous = subMonths(current, 1)

  const createMonth = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const days = eachDayOfInterval({ start, end })
    const firstDay = start.getDay()

    const placeholders = Array.from({ length: firstDay }, (_, index) => ({
      date: `${format(start, 'yyyy-MM')}-placeholder-${index}`,
      label: '',
      total: 0,
      isToday: false,
      fill: '0%'
    }))

    const mapped = days.map(day => {
      const key = format(day, 'yyyy-MM-dd')
      const total = hydrationHistory.value[key]?.total || 0
      const fill = Math.min(total / hydrationTarget.value, 1)
      return {
        date: key,
        label: day.getDate(),
        total,
        isToday: isToday(day),
        fill: `${fill * 100}%`
      }
    })

    return {
      key: format(date, 'yyyy-MM'),
      label: format(date, 'yyyy年MM月', { locale: zhCN }),
      days: [...placeholders, ...mapped]
    }
  }

  return [createMonth(previous), createMonth(current)]
})

const addWater = (amount: number | null) => {
  if (!amount || amount <= 0) return
  try {
    userStore.logWater(amount)
    notificationStore.showSuccess(`已记录 ${amount} ml 饮水`)
    customAmount.value = null
  } catch (error: any) {
    notificationStore.showError(error.message)
  }
}

const updateTarget = () => {
  userStore.updateHydrationTarget(target.value)
  notificationStore.showInfo(`每日目标已调整为 ${target.value} ml`)
}

const formatDate = (date: string) => format(new Date(date), 'MM月dd日 HH:mm')

watch(
  () => hydrationTarget.value,
  value => {
    target.value = value
  }
)
</script>

<style scoped>
.water-tracker {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.tracker-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  align-items: center;
  background: linear-gradient(120deg, rgba(47, 136, 255, 0.12) 0%, rgba(76, 175, 80, 0.1) 100%);
  border-radius: 28px;
  padding: clamp(1.5rem, 4vw, 3rem);
}

.hero-left h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 3.5vw, 2.6rem);
}

.hero-left p {
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.7;
}

.target-control {
  margin-top: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(30, 64, 175, 0.1);
}

.quick-actions {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-weight: 600;
}

.cup-chip {
  cursor: pointer;
  border-radius: 12px;
  padding: 0.5rem 0.9rem;
  background: rgba(47, 136, 255, 0.12);
}

.selected-chip {
  background: #2f88ff !important;
  color: white !important;
}

.custom-input {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: minmax(160px, 220px) auto;
  gap: 0.75rem;
  align-items: center;
}

.hero-right {
  display: grid;
  gap: 1.5rem;
  justify-items: center;
}

.cup {
  width: 200px;
  height: 260px;
  border: 5px solid rgba(47, 136, 255, 0.6);
  border-radius: 0 0 80px 80px;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.85);
}

.cup-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--fill);
  background: linear-gradient(180deg, rgba(47, 136, 255, 0.9), rgba(76, 175, 80, 0.95));
  transition: height 0.6s ease;
}

.cup-info {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #0f172a;
  text-align: center;
  font-weight: 700;
  gap: 0.5rem;
}

.cup-sub {
  font-size: 0.95rem;
  font-weight: 500;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  width: 100%;
}

.hero-stats div {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.hero-stats .label {
  display: block;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 0.4rem;
}

.calendar-section .calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.calendar-month {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
}

.month-header {
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day {
  position: relative;
  padding-top: 100%;
  background: linear-gradient(180deg, rgba(47, 136, 255, 0.05), rgba(76, 175, 80, 0.08));
  border-radius: 16px;
  overflow: hidden;
}

.day::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(47, 136, 255, 0.2), rgba(76, 175, 80, 0.3));
  opacity: calc(var(--fill) / 100);
  transition: opacity 0.3s ease;
}

.day-number,
.day-ml {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #0f172a;
}

.day-number {
  top: 8px;
  font-weight: 600;
}

.day-ml {
  bottom: 8px;
  font-size: 0.75rem;
}

.day.today {
  border: 2px solid rgba(47, 136, 255, 0.6);
}

.history-table {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}

.history-table thead tr {
  background: rgba(47, 136, 255, 0.1);
}

.history-table th,
.history-table td {
  padding: 1rem;
  text-align: left;
}

@media (max-width: 960px) {
  .custom-input {
    grid-template-columns: 1fr;
  }
}
</style>
