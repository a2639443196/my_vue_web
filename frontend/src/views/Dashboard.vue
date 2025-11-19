<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="数据看板" show-back show-profile />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <div class="flex gap-2 p-1 bg-[rgb(var(--card))] rounded-xl border border-white/5">
        <button
          class="flex-1 py-2 rounded-lg transition-base"
          :class="timeRange === 'week' ? 'bg-[rgb(var(--primary))] text-white' : 'text-[rgb(var(--muted-foreground))]'"
          @click="timeRange = 'week'"
        >
          本周
        </button>
        <button
          class="flex-1 py-2 rounded-lg transition-base"
          :class="timeRange === 'month' ? 'bg-[rgb(var(--primary))] text-white' : 'text-[rgb(var(--muted-foreground))]'"
          @click="timeRange = 'month'"
        >
          本月
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <GlassCard v-for="stat in statCards" :key="stat.label">
          <div class="flex items-start justify-between mb-3">
            <Icon :icon="stat.icon" class="w-5 h-5" :class="stat.color" />
            <div class="flex items-center gap-1 text-sm" :class="stat.trend === 'up' ? 'text-green-400' : 'text-red-400'">
              <Icon :icon="stat.trend === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'" class="w-3 h-3" />
              {{ formatPercent(stat.change) }}
            </div>
          </div>
          <div class="text-2xl mb-1">{{ stat.value }}</div>
          <div class="caption">{{ stat.label }}</div>
        </GlassCard>
      </div>

      <GlassCard>
        <h4 class="mb-4">喝水趋势</h4>
        <div class="text-xs text-gray-500 mb-2">
          调试: maxWater={{ maxWater }}ml, 数据: {{ waterSeries.map(d => `${d.label}:${d.amount}`).join(', ') }}
        </div>
        <div class="overflow-x-auto -mx-2 px-2 pb-2">
          <div
            v-if="waterSeries.length"
            class="flex items-end gap-3 h-48 min-w-[520px]"
            :class="timeRange === 'month' ? 'min-w-[900px]' : ''"
          >
            <div
              v-for="(day, index) in waterSeries"
              :key="day.label"
              class="flex-1 flex flex-col items-center gap-2"
            >
              <div
                class="w-full rounded-t-lg bg-gradient-to-t from-[rgb(var(--accent))] to-[rgb(var(--primary))]"
                :style="{
                  height: `${getBarHeight(day.amount, maxWater)}%`,
                  minHeight: '4px'
                }"
                :title="`${day.label}: ${day.amount}ml (高度: ${getBarHeight(day.amount, maxWater)}%)`"
              />
              <span class="caption text-[10px] text-center whitespace-nowrap">
                {{ day.label }}: {{ day.amount }}ml<br>
                <small>{{ getBarHeight(day.amount, maxWater).toFixed(1) }}%</small>
              </span>
            </div>
          </div>
          <div v-else class="text-center text-secondary text-sm">暂无数据</div>
        </div>
        <div class="flex items-center justify-between mt-4" v-if="waterSeries.length">
          <div>
            <div class="caption">平均值</div>
            <div class="text-[rgb(var(--accent))]">{{ avgWater }}ml</div>
          </div>
          <div>
            <div class="caption">最高值</div>
            <div class="text-[rgb(var(--accent))]">{{ maxWater }}ml</div>
          </div>
          <div>
            <div class="caption">最低值</div>
            <div class="text-[rgb(var(--accent))]">{{ minWater }}ml</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h4 class="mb-4">活动统计</h4>
        <div class="flex items-end gap-3 h-48" v-if="activitySeries.length">
          <div
            v-for="day in activitySeries"
            :key="day.label"
            class="flex-1 flex flex-col items-center gap-2"
          >
            <div
              class="w-full rounded-t-lg bg-gradient-to-t from-[rgb(var(--primary))] to-[rgb(var(--secondary))]"
              :style="{
                height: `${getBarHeight(day.count, maxActivity)}%`,
                minHeight: '4px'
              }"
              :title="`${day.label}: ${day.count} 次`"
            />
            <span class="caption text-[10px] text-center whitespace-nowrap">{{ day.label }}</span>
          </div>
        </div>
        <div v-else class="text-center text-secondary text-sm">暂无数据</div>
      </GlassCard>

      <GlassCard>
        <h4 class="mb-4">本周对比</h4>
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span>喝水完成率</span>
              <span class="text-[rgb(var(--accent))]">{{ formatPercent(completionWater.value) }}</span>
            </div>
            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--primary))] rounded-full" :style="{ width: `${completionWater}%` }" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span>活动次数</span>
              <span class="text-[rgb(var(--primary))]">{{ activityTotal }}</span>
            </div>
            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))] rounded-full" :style="{ width: `${activityCompletion}%` }" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span>游戏训练</span>
              <span class="text-[rgb(var(--secondary))]">{{ trainingTotal }} 次</span>
            </div>
            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[rgb(var(--secondary))] to-purple-500 rounded-full" :style="{ width: `${trainingCompletion}%` }" />
            </div>
          </div>
        </div>
      </GlassCard>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Icon } from '@iconify/vue'
import TopNav from '@/components/TopNav.vue'
import GlassCard from '@/components/GlassCard.vue'
import { useHydrationStore } from '@/stores/hydration'
import { useActivityStore } from '@/stores/activity'
import { useGamesStore } from '@/stores/games'
import { useDashboardStore } from '@/stores/dashboard'

type RangeKey = 'week' | 'month'
const timeRange = ref<RangeKey>('week')

const hydrationStore = useHydrationStore()
const activityStore = useActivityStore()
const gamesStore = useGamesStore()
const dashboardStore = useDashboardStore()

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const formatPercent = (value: unknown) => {
  const num = Number(value)
  if (Number.isFinite(num)) return `${num}%`
  if (typeof value === 'string') return value
  return '0%'
}

const daysBack = (range: RangeKey) => (range === 'week' ? 7 : 30)

// Calculate bar height with smart scaling for large data ranges
const getBarHeight = (value: number, maxValue: number) => {
  const height = (value / maxValue) * 100
  console.log(`getBarHeight: value=${value}, maxValue=${maxValue}, height=${height}`)
  return Math.max(height, 0.1) // Minimum 0.1% to ensure visibility
}

const waterSeries = computed(() => {
  const weekly = hydrationStore.stats?.weekly ?? []
  const count = daysBack(timeRange.value)
  const map: Record<string, number> = {}

  // Initialize all days with 0
  for (let i = 0; i < count; i++) {
    const day = new Date()
    day.setDate(day.getDate() - (count - 1 - i))
    const dateKey = format(day, 'yyyy-MM-dd')
    map[dateKey] = 0
  }

  // Fill with actual data
  weekly.forEach(entry => {
    const total = Number(entry.total ?? 0)
    if (map[entry.date] !== undefined && Number.isFinite(total)) {
      map[entry.date] = total
    }
  })

  return Object.entries(map).map(([key, val]) => ({
    label: format(new Date(key), timeRange.value === 'week' ? 'EEE' : 'MM/dd', { locale: zhCN }),
    amount: val
  }))
})

const maxWater = computed(() => {
  const values = waterSeries.value.map(d => d.amount)
  return Math.max(...values, 1)
})
const minWater = computed(() => Math.min(...waterSeries.value.map(d => d.amount), 0))
const avgWater = computed(() => Math.round(waterSeries.value.reduce((s, d) => s + d.amount, 0) / (waterSeries.value.length || 1)))

const activitySeries = computed(() => {
  const data = activityStore.activities
  const count = daysBack(timeRange.value)
  const map: Record<string, number> = {}

  // Initialize all days with 0
  for (let i = 0; i < count; i++) {
    const day = new Date()
    day.setDate(day.getDate() - (count - 1 - i))
    map[format(day, 'yyyy-MM-dd')] = 0
  }

  // Count activities per day
  data.forEach(entry => {
    try {
      const key = format(new Date(entry.createdAt), 'yyyy-MM-dd')
      if (map[key] !== undefined) {
        map[key] += 1
      }
    } catch (error) {
      console.warn('Invalid activity date:', entry.createdAt)
    }
  })

  return Object.entries(map).map(([key, val]) => ({
    label: format(new Date(key), timeRange.value === 'week' ? 'EEE' : 'MM/dd', { locale: zhCN }),
    count: val
  }))
})

const maxActivity = computed(() => {
  const values = activitySeries.value.map(d => d.count)
  return Math.max(...values, 1)
})
const activityTotal = computed(() => activityStore.activities.length)

const statCards = computed(() => [
  {
    label: '日均喝水',
    value: `${(avgWater.value / 1000).toFixed(1)}L`,
    change: '+0%',
    trend: 'up',
    icon: 'lucide:droplets',
    color: 'text-cyan-400'
  },
  {
    label: '活动次数',
    value: activityTotal.value,
    change: '+0%',
    trend: 'up',
    icon: 'lucide:activity',
    color: 'text-green-400'
  },
  {
    label: '训练次数',
    value: trainingTotal.value,
    change: '+0%',
    trend: 'up',
    icon: 'lucide:zap',
    color: 'text-purple-400'
  },
  {
    label: '喝水完成',
    value: formatPercent(completionWater.value),
    change: '+0%',
    trend: 'up',
    icon: 'lucide:droplet',
    color: 'text-blue-400'
  }
])

const completionWater = computed(() => {
  const completion = toNumber((hydrationStore.stats as any)?.completion, NaN)
  if (Number.isFinite(completion)) {
    return Math.min(Math.max(Math.round(completion), 0), 100)
  }
  const today = toNumber((hydrationStore.stats as any)?.today, 0)
  const goal = toNumber((hydrationStore.stats as any)?.goal, 2000) || 2000
  const percent = (today / goal) * 100
  return Math.min(Math.max(Math.round(percent), 0), 100)
})
const activityCompletion = computed(() => {
  const percent = (Number(activityTotal.value) / 20) * 100
  return Math.min(Math.max(Math.round(percent), 0), 100)
})
const trainingTotal = computed(() => gamesStore.userSummary?.totals.plays ?? 0)
const trainingCompletion = computed(() => {
  const percent = (Number(trainingTotal.value) / 20) * 100
  return Math.min(Math.max(Math.round(percent), 0), 100)
})

onMounted(async () => {
  try {
    await Promise.all([
      hydrationStore.fetchEntries(),
      hydrationStore.fetchStats(),
      activityStore.fetchActivities(),
      gamesStore.fetchUserSummary(),
      dashboardStore.fetchSummary().catch(() => undefined)
    ])
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
})
</script>
