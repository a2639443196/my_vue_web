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
              {{ stat.change }}
            </div>
          </div>
          <div class="text-2xl mb-1">{{ stat.value }}</div>
          <div class="caption">{{ stat.label }}</div>
        </GlassCard>
      </div>

      <GlassCard>
        <h4 class="mb-4">喝水趋势</h4>
        <div class="flex items-end gap-3 h-48" v-if="waterSeries.length">
          <div
            v-for="day in waterSeries"
            :key="day.label"
            class="flex-1 flex flex-col items-center gap-2"
          >
            <div class="w-full rounded-t-lg bg-gradient-to-t from-[rgb(var(--accent))] to-[rgb(var(--primary))]" :style="{ height: `${Math.max(day.amount / maxWater * 100, 4)}%` }" />
            <span class="caption text-[10px] text-center">{{ day.label }}</span>
          </div>
        </div>
        <div v-else class="text-center text-secondary text-sm">暂无数据</div>
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
            <div class="w-full rounded-t-lg bg-gradient-to-t from-[rgb(var(--primary))] to-[rgb(var(--secondary))]" :style="{ height: `${Math.max(day.count / maxActivity * 100, 4)}%` }" />
            <span class="caption text-[10px] text-center">{{ day.label }}</span>
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
              <span class="text-[rgb(var(--accent))]">{{ completionWater }}%</span>
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

const daysBack = (range: RangeKey) => (range === 'week' ? 7 : 30)

const waterSeries = computed(() => {
  const weekly = hydrationStore.stats?.weekly ?? []
  const count = daysBack(timeRange.value)
  const map: Record<string, number> = {}
  for (let i = 0; i < count; i++) {
    const day = new Date()
    day.setDate(day.getDate() - (count - 1 - i))
    map[format(day, 'yyyy-MM-dd')] = 0
  }
  weekly.forEach(entry => {
    if (map[entry.date] !== undefined) map[entry.date] = entry.total
  })
  return Object.entries(map).map(([key, val]) => ({
    label: format(new Date(key), timeRange.value === 'week' ? 'EEE' : 'MM/dd', { locale: zhCN }),
    amount: val
  }))
})

const maxWater = computed(() => Math.max(...waterSeries.value.map(d => d.amount), 1))
const minWater = computed(() => Math.min(...waterSeries.value.map(d => d.amount), 0))
const avgWater = computed(() => Math.round(waterSeries.value.reduce((s, d) => s + d.amount, 0) / (waterSeries.value.length || 1)))

const activitySeries = computed(() => {
  const data = activityStore.activities
  const count = daysBack(timeRange.value)
  const map: Record<string, number> = {}
  for (let i = 0; i < count; i++) {
    const day = new Date()
    day.setDate(day.getDate() - (count - 1 - i))
    map[format(day, 'yyyy-MM-dd')] = 0
  }
  data.forEach(entry => {
    const key = format(new Date(entry.createdAt), 'yyyy-MM-dd')
    if (map[key] !== undefined) map[key] += 1
  })
  return Object.entries(map).map(([key, val]) => ({
    label: format(new Date(key), timeRange.value === 'week' ? 'EEE' : 'MM/dd', { locale: zhCN }),
    count: val
  }))
})

const maxActivity = computed(() => Math.max(...activitySeries.value.map(d => d.count), 1))
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
    value: `${completionWater}%`,
    change: '+0%',
    trend: 'up',
    icon: 'lucide:coffee',
    color: 'text-orange-400'
  }
])

const completionWater = computed(() => Math.min(Math.round(((hydrationStore.stats?.today ?? 0) / (hydrationStore.stats?.goal ?? 2000)) * 100), 100))
const activityCompletion = computed(() => Math.min(Math.round((activityTotal.value / 20) * 100), 100))
const trainingTotal = computed(() => gamesStore.userSummary?.totals.plays ?? 0)
const trainingCompletion = computed(() => Math.min(Math.round((trainingTotal.value / 20) * 100), 100))

onMounted(async () => {
  await Promise.all([
    hydrationStore.fetchEntries(),
    hydrationStore.fetchStats(),
    activityStore.fetchActivities(),
    gamesStore.fetchUserSummary(),
    dashboardStore.fetchSummary().catch(() => undefined)
  ])
})
</script>
