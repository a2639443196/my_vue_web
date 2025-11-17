<template>
  <div class="water-page container main-content-with-toolbar">
    <!-- 页面标题 -->
    <div class="section">
      <h1 class="section__title">饮水追踪</h1>
      <p class="section__subtitle">记录您的每日饮水量，保持健康的水分补充习惯</p>
    </div>

    <!-- 饮水进度概览 -->
    <section class="hydration-section">
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">今日饮水进度</h2>
          <div class="progress-ring">
            <div class="progress-value">{{ Math.round((todayTotal / dailyTarget) * 100) }}%</div>
          </div>
        </div>
        <div class="card__content">
          <div class="hydration-summary">
            <div class="current-amount">
              <span class="amount-number">{{ todayTotal }}</span>
              <span class="amount-unit">ml</span>
            </div>
            <div class="target-info text-tertiary">
              目标: {{ dailyTarget }}ml
            </div>
          </div>

          <!-- 统计卡片 -->
          <div class="stats-grid grid grid--3-cols">
            <div class="stat-item">
              <div class="stat-value text-primary">{{ Math.max(dailyTarget - todayTotal, 0) }}</div>
              <div class="stat-label text-quaternary text-xs">今日剩余 (ml)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value text-info">{{ weeklyTotal }}</div>
              <div class="stat-label text-quaternary text-xs">7日总量 (ml)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value text-success">{{ drinks.length }}</div>
              <div class="stat-label text-quaternary text-xs">饮品种类</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速记录表单 -->
    <section class="quick-record-section">
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">快速记录</h2>
          <p class="card__subtitle">选择饮品类型，记录饮水量</p>
        </div>
        <div class="card__content">
          <div class="form-group">
            <label class="form-label">选择饮品</label>
            <select v-model="selectedDrinkId" class="input">
              <option v-for="drink in selectableDrinks" :key="drink.id" :value="drink.id">
                {{ drink.name }} ({{ drink.amount }}ml)
              </option>
            </select>
          </div>

          <!-- 快速选择按钮 -->
          <div class="quick-drinks" v-if="favoriteDrinks.length">
            <div class="quick-drinks-label text-sm text-secondary">快速选择</div>
            <div class="quick-drinks-grid">
              <button
                v-for="drink in favoriteDrinks"
                :key="drink.id"
                class="quick-drink-btn"
                :class="{ 'quick-drink-btn--active': selectedDrinkId === drink.id }"
                @click="applyDrink(drink)"
              >
                {{ drink.name }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">自定义容量 (ml)</label>
            <input
              v-model.number="customAmount"
              type="number"
              :min="50"
              :max="2000"
              :step="50"
              class="input"
              placeholder="输入容量"
            />
          </div>
        </div>
        <div class="card__footer">
          <div class="form-actions">
            <button
              class="btn btn--secondary"
              @click="showDrinkDialog = true"
            >
              添加自定义饮品
            </button>
            <button
              class="btn btn--primary btn--lg"
              :class="{ 'btn--loading': submitting }"
              :disabled="!canSubmit || submitting"
              @click="saveIntake"
            >
              <span v-if="!submitting">记录饮水</span>
              <span v-else>记录中...</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="calendar-card">
      <div class="calendar-head">
        <div>
          <p class="eyebrow">饮水日历</p>
          <h2>{{ displayMonthLabel }}</h2>
        </div>
        <div class="month-controls">
          <v-btn icon variant="tonal" @click="shiftMonth(-1)">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn icon variant="tonal" :disabled="monthOffset === 0" @click="shiftMonth(1)">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>

      <div class="weekday-row">
        <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
      </div>
      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.key"
          :class="['calendar-cell', { today: day.isToday, muted: day.isPlaceholder }]"
        >
          <div class="date">{{ day.label }}</div>
          <div v-if="day.total" class="pill">
            {{ day.total }} ml
          </div>
        </div>
      </div>
    </section>

    <section class="history-card" v-if="entries.length">
      <div class="section-header">
        <div>
          <p class="eyebrow">最近记录</p>
          <h2>最新 10 条饮水</h2>
        </div>
      </div>

      <div class="table-wrapper">
        <v-table>
          <thead>
            <tr>
              <th>时间</th>
              <th>饮品</th>
              <th>容量</th>
              <th>咖啡因</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries.slice(0, 10)" :key="entry.id">
              <td>{{ formatRecord(entry.recorded_at) }}</td>
              <td>
                <v-icon size="16" class="mr-1">{{ entry.drink_icon || 'mdi-cup-water' }}</v-icon>
                {{ entry.drink_name }}
              </td>
              <td>{{ entry.amount }} ml</td>
              <td>{{ entry.caffeine_mg ? entry.caffeine_mg + ' mg' : '--' }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </section>

    <v-dialog v-model="showDrinkDialog" max-width="420">
      <v-card>
        <v-card-title>添加自定义饮品</v-card-title>
        <v-card-text>
          <v-text-field v-model="newDrink.name" label="名称" required></v-text-field>
          <v-text-field
            v-model.number="newDrink.amount"
            type="number"
            label="默认容量 (ml)"
            min="50"
            max="2000"
          ></v-text-field>
          <v-text-field v-model="newDrink.icon" label="图标 (mdi 名称，可选)"></v-text-field>
          <v-text-field
            v-model.number="newDrink.caffeine_mg"
            type="number"
            label="咖啡因含量 mg (可选)"
            min="0"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="showDrinkDialog = false">取消</v-btn>
          <v-btn color="primary" :disabled="!newDrink.name || !newDrink.amount" @click="createDrink">
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

  <!-- 日历视图 -->
    <section class="calendar-section">
      <div class="card">
        <div class="card__header flex--between">
          <div>
            <h2 class="card__title">饮水日历</h2>
            <p class="card__subtitle">{{ displayMonthLabel }}</p>
          </div>
          <div class="calendar-controls">
            <button class="btn btn--secondary" @click="shiftMonth(-1)">
              <v-icon size="20">mdi-chevron-left</v-icon>
            </button>
            <button
              class="btn btn--secondary"
              :disabled="monthOffset === 0"
              @click="shiftMonth(1)"
            >
              <v-icon size="20">mdi-chevron-right</v-icon>
            </button>
          </div>
        </div>
        <div class="card__content">
          <!-- 星期标题 -->
          <div class="calendar-weekdays">
            <span v-for="weekday in weekdays" :key="weekday" class="calendar-weekday">
              {{ weekday }}
            </span>
          </div>

          <!-- 日历网格 -->
          <div class="calendar-grid">
            <div
              v-for="day in calendarDays"
              :key="day.key"
              :class="['calendar-day', {
                'calendar-day--today': day.isToday,
                'calendar-day--placeholder': day.isPlaceholder,
                'calendar-day--has-data': day.total
              }]"
            >
              <div class="calendar-date">{{ day.label }}</div>
              <div v-if="day.total" class="calendar-amount">
                {{ day.total }}ml
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 添加饮品对话框 -->
    <v-dialog v-model="showDrinkDialog" max-width="420">
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">添加自定义饮品</h2>
        </div>
        <div class="card__content">
          <div class="form-group">
            <label class="form-label">名称</label>
            <input v-model="newDrink.name" class="input" placeholder="饮品名称" required />
          </div>
          <div class="form-group">
            <label class="form-label">默认容量 (ml)</label>
            <input
              v-model.number="newDrink.amount"
              type="number"
              :min="50"
              :max="2000"
              class="input"
              placeholder="默认容量"
            />
          </div>
          <div class="form-group">
            <label class="form-label">图标 (可选)</label>
            <input v-model="newDrink.icon" class="input" placeholder="mdi-图标名称" />
          </div>
          <div class="form-group">
            <label class="form-label">咖啡因含量 (mg, 可选)</label>
            <input
              v-model.number="newDrink.caffeine_mg"
              type="number"
              :min="0"
              class="input"
              placeholder="咖啡因含量"
            />
          </div>
        </div>
        <div class="card__footer">
          <button class="btn btn--secondary" @click="showDrinkDialog = false">取消</button>
          <button class="btn btn--primary" :disabled="!newDrink.name || !newDrink.amount" @click="createDrink">
            保存
          </button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { addMonths, eachDayOfInterval, endOfMonth, format, isToday, startOfMonth } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { storeToRefs } from 'pinia'
import { useHydrationStore } from '@/stores/hydration'
import { useUserStore } from '@/stores/user'

const hydrationStore = useHydrationStore()
const userStore = useUserStore()
const { drinks, entries, calendar } = storeToRefs(hydrationStore)

const submitting = ref(false)

const selectedDrinkId = ref<number | null>(null)
const customAmount = ref<number | null>(null)
const showDrinkDialog = ref(false)
const newDrink = ref({
  name: '',
  amount: 300,
  icon: '',
  caffeine_mg: null as number | null
})

const monthOffset = ref(0)
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const dailyTarget = 2000

const todayTotal = computed(() => {
  const todayKey = format(new Date(), 'yyyy-MM-dd')
  const entry = calendar.value.find(item => item.date === todayKey)
  return entry ? entry.total : 0
})

const weeklyTotal = computed(() =>
  entries.value
    .filter(item => {
      const recordDate = new Date(item.recorded_at)
      const now = new Date()
      const diff = now.getTime() - recordDate.getTime()
      return diff <= 6 * 24 * 60 * 60 * 1000
    })
    .reduce((sum, item) => sum + item.amount, 0)
)

const displayMonth = computed(() => addMonths(new Date(), monthOffset.value))
const displayMonthLabel = computed(() => format(displayMonth.value, 'yyyy年MM月', { locale: zhCN }))

const calendarMap = computed<Record<string, number>>(() =>
  calendar.value.reduce((acc, item) => {
    acc[item.date] = item.total
    return acc
  }, {} as Record<string, number>)
)

const calendarDays = computed(() => {
  const start = startOfMonth(displayMonth.value)
  const end = endOfMonth(displayMonth.value)
  const days = eachDayOfInterval({ start, end })
  const leading = Array.from({ length: start.getDay() }).map((_, index) => ({
    key: `prev-${index}`,
    isPlaceholder: true,
    label: '',
    total: 0,
    isToday: false
  }))

  const mapped = days.map(day => {
    const key = format(day, 'yyyy-MM-dd')
    return {
      key,
      label: day.getDate(),
      total: calendarMap.value[key] || 0,
      isPlaceholder: false,
      isToday: isToday(day)
    }
  })

  return [...leading, ...mapped]
})

const selectedDrink = computed(() =>
  drinks.value.find(drink => drink.id === selectedDrinkId.value) || null
)

const selectableDrinks = computed(() => drinks.value)
const favoriteDrinks = computed(() => drinks.value.filter(drink => drink.is_default).slice(0, 4))
const canSubmit = computed(() => !!(customAmount.value || selectedDrink.value))

const loadData = async () => {
  await Promise.all([
    hydrationStore.fetchDrinks(),
    hydrationStore.fetchEntries(),
    hydrationStore.fetchCalendar()
  ])
  if (drinks.value.length) {
    const defaultDrink = drinks.value.find(d => d.is_default) ?? drinks.value[0]
    selectedDrinkId.value = defaultDrink?.id ?? null
    customAmount.value = defaultDrink?.amount ?? null
  }
}

const shiftMonth = (delta: number) => {
  const next = Math.max(Math.min(monthOffset.value + delta, 0), -1)
  if (next === monthOffset.value) return
  monthOffset.value = next
}

watch(
  () => monthOffset.value,
  async () => {
    const month = format(displayMonth.value, 'yyyy-MM')
    await hydrationStore.fetchCalendar(month)
  }
)

const applyDrink = (drink: any) => {
  selectedDrinkId.value = drink.id
  customAmount.value = drink.amount
}

watch(
  () => selectedDrinkId.value,
  value => {
    if (!value) return
    const drink = drinks.value.find(item => item.id === value)
    if (drink) {
      customAmount.value = drink.amount
    }
  }
)

const saveIntake = async () => {
  const payload: Record<string, any> = {
    amount: customAmount.value || selectedDrink.value?.amount,
    drink_id: selectedDrinkId.value || undefined
  }
  if (!payload.amount) return
  const result = await hydrationStore.addEntry(payload)
  const logAmount = Number(result.amount || payload.amount)
  userStore.logWater(logAmount, result.drink_name)
  await hydrationStore.fetchCalendar(format(displayMonth.value, 'yyyy-MM'))
  customAmount.value = null
}

const createDrink = async () => {
  await hydrationStore.createDrink({
    name: newDrink.value.name,
    amount: newDrink.value.amount,
    icon: newDrink.value.icon || undefined,
    caffeine_mg: newDrink.value.caffeine_mg || undefined
  })
  showDrinkDialog.value = false
  newDrink.value = { name: '', amount: 300, icon: '', caffeine_mg: null }
}

const formatRecord = (value: string) => format(new Date(value), 'MM月dd日 HH:mm')

onMounted(loadData)
</script>

<style scoped>
/* 页面布局 */
.water-page {
  padding-bottom: var(--space-8);
  background-color: var(--color-bg-primary);
}

/* 饮水进度区域 */
.hydration-section {
  margin-bottom: var(--space-6);
}

.progress-ring {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: conic-gradient(
    from 0deg,
    var(--color-primary) 0deg,
    var(--color-primary) calc((todayTotal / dailyTarget) * 360deg),
    var(--color-bg-elevated) calc((todayTotal / dailyTarget) * 360deg)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.progress-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.hydration-summary {
  text-align: center;
  margin-bottom: var(--space-6);
}

.amount-number {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: var(--line-height-tight);
}

.amount-unit {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  margin-left: var(--space-2);
}

.target-info {
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
}

.stats-grid {
  gap: var(--space-3);
}

.stat-item {
  text-align: center;
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.stat-label {
  margin-top: var(--space-1);
  line-height: var(--line-height-tight);
}

/* 快速记录区域 */
.quick-record-section {
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

/* 快速选择按钮 */
.quick-drinks {
  margin-bottom: var(--space-4);
}

.quick-drinks-label {
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
}

.quick-drinks-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.quick-drink-btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-drink-btn:hover {
  background-color: var(--color-bg-overlay);
  border-color: var(--color-border-hover);
}

.quick-drink-btn--active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: var(--space-3);
}

.form-actions .btn {
  flex: 1;
}

/* 日历区域 */
.calendar-section {
  margin-bottom: var(--space-6);
}

.calendar-controls {
  display: flex;
  gap: var(--space-2);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.calendar-weekday {
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  padding: var(--space-2) 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
}

.calendar-day {
  min-height: 80px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-surface);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-1);
  transition: all 0.2s ease;
  cursor: pointer;
}

.calendar-day:hover {
  background-color: var(--color-bg-overlay);
  border-color: var(--color-border-hover);
}

.calendar-day--today {
  border-color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
}

.calendar-day--placeholder {
  opacity: 0;
  cursor: default;
}

.calendar-day--placeholder:hover {
  background-color: var(--color-bg-surface);
  border-color: var(--color-border-primary);
}

.calendar-day--has-data {
  border-color: var(--color-info);
  background-color: rgba(6, 182, 212, 0.1);
}

.calendar-date {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.calendar-amount {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  background: rgba(6, 182, 212, 0.2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(6, 182, 212, 0.3);
  align-self: flex-start;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  .water-page {
    padding-bottom: var(--space-6);
  }

  .progress-ring {
    width: 50px;
    height: 50px;
  }

  .progress-value {
    font-size: var(--font-size-xs);
  }

  .amount-number {
    font-size: var(--font-size-3xl);
  }

  .amount-unit {
    font-size: var(--font-size-lg);
  }

  .stats-grid {
    gap: var(--space-2);
  }

  .stat-value {
    font-size: var(--font-size-lg);
  }

  .calendar-day {
    min-height: 60px;
    padding: var(--space-1);
  }

  .calendar-weekday {
    font-size: var(--font-size-xs);
    padding: var(--space-1) 0;
  }

  .calendar-amount {
    font-size: 10px;
    padding: 1px 4px;
  }
}

/* 小屏幕优化 */
@media (max-width: 375px) {
  .amount-number {
    font-size: var(--font-size-2xl);
  }

  .amount-unit {
    font-size: var(--font-size-base);
  }

  .progress-ring {
    width: 40px;
    height: 40px;
  }

  .progress-value {
    font-size: 10px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .calendar-day {
    min-height: 50px;
  }
}
</style>
