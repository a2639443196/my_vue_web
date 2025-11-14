<template>
  <div class="water-page">
    <section class="hydration-hero">
      <div class="hero-info">
        <p class="eyebrow">饮水进度</p>
        <h1>今日已喝 {{ todayTotal }} ml</h1>
        <p class="description">
          选择常用饮品或自定义容量，保持全天补水节奏。支持咖啡、能量饮料等多种饮品记录。
        </p>

        <div class="stat-grid">
          <div class="stat-card">
            <span class="label">今日剩余</span>
            <strong>{{ Math.max(dailyTarget - todayTotal, 0) }} ml</strong>
          </div>
          <div class="stat-card">
            <span class="label">7 日总量</span>
            <strong>{{ weeklyTotal }} ml</strong>
          </div>
          <div class="stat-card">
            <span class="label">饮品种类</span>
            <strong>{{ drinks.length }}</strong>
          </div>
        </div>
      </div>

      <div class="hero-form">
        <v-select
          v-model="selectedDrinkId"
          :items="selectableDrinks"
          item-title="name"
          item-value="id"
          label="选择饮品"
          prepend-inner-icon="mdi-cup-water"
        ></v-select>

        <div class="quick-chip-row" v-if="favoriteDrinks.length">
          <v-chip
            v-for="drink in favoriteDrinks"
            :key="drink.id"
            variant="outlined"
            class="quick-chip"
            @click="applyDrink(drink)"
          >
            {{ drink.name }}
          </v-chip>
        </div>

        <v-text-field
          v-model.number="customAmount"
          type="number"
          label="自定义容量 (ml)"
          min="50"
          max="2000"
          append-inner-icon="mdi-water"
        ></v-text-field>

        <div class="form-actions">
          <v-btn variant="text" prepend-icon="mdi-plus" @click="showDrinkDialog = true">
            添加自定义饮品
          </v-btn>
          <v-btn color="primary" :disabled="!canSubmit" @click="saveIntake">
            记录本次饮水
          </v-btn>
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
.water-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hydration-hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  background: linear-gradient(135deg, rgba(47, 112, 255, 0.12), rgba(76, 175, 80, 0.12));
  border-radius: 24px;
  padding: 1.5rem;
}

@media (min-width: 769px) {
  .hydration-hero {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    padding: clamp(1.5rem, 4vw, 3rem);
    border-radius: 32px;
  }
}

.hero-info h1 {
  margin: 0.2rem 0 0.5rem;
  font-size: clamp(2rem, 3.5vw, 2.6rem);
}

.description {
  color: rgba(15, 23, 42, 0.65);
  max-width: 520px;
}

.stat-grid {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

@media (min-width: 769px) {
  .stat-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}

.stat-card {
  padding: 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.stat-card .label {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.6);
}

.hero-form {
  padding: 1.25rem;
  border-radius: 20px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.1);
}

.quick-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-chip {
  border-radius: 999px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-card,
.history-card {
  background: white;
  border-radius: 28px;
  padding: clamp(1.25rem, 3vw, 2rem);
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
}

.calendar-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.weekday-row,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.weekday-row span {
  text-align: center;
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.6);
}

.calendar-cell {
  min-height: 60px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.02);
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.3rem;
}

.calendar-cell.today {
  border: 1px solid rgba(99, 102, 241, 0.6);
}

.calendar-cell.muted {
  opacity: 0;
}

.calendar-cell .date {
  font-weight: 600;
}

.pill {
  align-self: flex-start;
  background: rgba(99, 102, 241, 0.1);
  color: #4c1d95;
  border-radius: 999px;
  padding: 0.1rem 0.6rem;
  font-size: 0.8rem;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.history-card table {
  width: 100%;
  min-width: 500px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: rgba(15, 23, 42, 0.55);
  margin-bottom: 0.35rem;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .water-page {
    gap: 1.5rem;
  }

  .calendar-card,
  .history-card {
    padding: 1rem;
    border-radius: 20px;
  }

  .calendar-grid {
    gap: 0.3rem;
  }

  .calendar-cell {
    min-height: 50px;
    padding: 0.3rem;
  }

  .stat-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .pill {
    font-size: 0.75rem;
    padding: 0.05rem 0.5rem;
  }
}
</style>
