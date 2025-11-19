<template>
  <div class="min-h-screen bg-[rgb(var(--background))] text-primary">
    <TopNav title="彦祖的导航站" show-menu show-profile @menu="menuOpen = true" />
    <SideMenu :is-open="menuOpen" @close="menuOpen = false" />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <section>
        <h3>早上好，{{ userDisplayName }} 👋</h3>
        <p class="text-secondary mt-1">{{ todayLabel }}</p>
      </section>

      <GlassCard>
        <div class="flex flex-col items-center">
          <p class="mb-4">今日喝水进度</p>
          <CircularProgress
            :value="todayHydration"
            :max="goal || 1"
            :label="`${todayHydration}ml`"
            :sub-label="`目标 ${goal}ml`"
          />
          <div class="flex items-center gap-6 mt-6 w-full">
            <div class="flex-1 text-center">
              <div class="caption mb-1">已完成</div>
              <div class="text-[rgb(var(--accent))]">{{ completion }}%</div>
            </div>
            <div class="w-px h-8 bg-white/10" />
            <div class="flex-1 text-center">
              <div class="caption mb-1">还需</div>
              <div class="text-[rgb(var(--primary))]">{{ Math.max(goal - todayHydration, 0) }}ml</div>
            </div>
          </div>
        </div>
      </GlassCard>

      <section>
        <h4 class="mb-4">快捷操作</h4>
        <div class="grid grid-cols-4 gap-3">
          <QuickAction icon="lucide:droplet" label="喝水" color="rgb(var(--accent))" @click="goWater" />
          <QuickAction icon="lucide:activity" label="活动" color="rgb(var(--primary))" @click="goActivities" />
          <QuickAction icon="lucide:gamepad-2" label="游戏" color="rgb(var(--secondary))" @click="() => goGames()" />
          <QuickAction icon="lucide:message-circle" label="聊天" color="rgb(139, 92, 246)" @click="goChat" />
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h4>最近活动</h4>
          <span class="caption text-[rgb(var(--muted-foreground))]">{{ activityStore.loading ? '加载中...' : `${recentActivities.length} 条` }}</span>
        </div>
        <div v-if="activityStore.loading" class="text-center text-secondary text-sm">加载中...</div>
        <div v-else-if="!recentActivities.length" class="text-center text-secondary text-sm">暂无活动记录</div>
        <div v-else class="space-y-3">
          <GlassCard v-for="activity in recentActivities" :key="activity.id">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="activity.bg">
                <Icon :icon="activity.icon" class="w-5 h-5" :class="activity.iconClass" />
              </div>
              <div class="flex-1">
                <p>{{ activity.title }}</p>
                <p class="caption mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-4">
        <GlassCard hover @click="goDashboard">
          <div class="flex flex-col items-center text-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Icon icon="lucide:bar-chart-3" class="w-6 h-6" />
            </div>
            <div>
              <p>数据看板</p>
              <p class="caption mt-1">查看详细统计</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover @click="goActivities">
          <div class="flex flex-col items-center text-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <Icon icon="lucide:trending-up" class="w-6 h-6" />
            </div>
            <div>
              <p>活动中心</p>
              <p class="caption mt-1">记录每日动态</p>
            </div>
          </div>
        </GlassCard>
      </section>

      <GlassCard>
        <h4 class="mb-4">今日概览</h4>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon icon="lucide:droplet" class="w-5 h-5 text-blue-400" />
              <span>饮水摄入</span>
            </div>
            <span>{{ waterIntakeStat }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon icon="lucide:gamepad-2" class="w-5 h-5 text-purple-400" />
              <span>训练次数</span>
            </div>
            <span>{{ trainingCount }} 次</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon icon="lucide:moon" class="w-5 h-5 text-blue-400" />
              <span>睡眠质量</span>
            </div>
            <span>{{ sleepQuality }}</span>
          </div>
        </div>
      </GlassCard>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { format } from 'date-fns'
import { Icon } from '@iconify/vue'
import TopNav from '@/components/TopNav.vue'
import SideMenu from '@/components/SideMenu.vue'
import GlassCard from '@/components/GlassCard.vue'
import QuickAction from '@/components/QuickAction.vue'
import CircularProgress from '@/components/CircularProgress.vue'
import { useUserStore } from '@/stores/user'
import { useHydrationStore } from '@/stores/hydration'
import { useActivityStore } from '@/stores/activity'
import { useGamesStore } from '@/stores/games'
import { useRouter } from 'vue-router'

const router = useRouter()
const menuOpen = ref(false)
const userStore = useUserStore()
const hydrationStore = useHydrationStore()
const activityStore = useActivityStore()
const gamesStore = useGamesStore()

const todayLabel = computed(() => format(new Date(), 'MM月dd日 EEEE'))
const userDisplayName = computed(() => userStore.userDisplayName || '伙伴')
const goal = computed(() => hydrationStore.goal)
const todayHydration = computed(() => hydrationStore.todayTotal)
const completion = computed(() => Math.min(Math.round((todayHydration.value / goal.value) * 100), 100))

const waterIntakeStat = computed(() => {
  const today = hydrationStore.todayTotal ?? 0
  const limit = hydrationStore.goal ?? 2000
  return `${today} / ${limit}ml`
})

const trainingCount = computed(() => gamesStore.userSummary?.totals.plays ?? 0)
const sleepQuality = computed(() => '良好')

const recentActivities = computed(() => {
  return activityStore.activities.slice(0, 4).map(act => ({
    id: act.id,
    title: act.note,
    time: format(new Date(act.createdAt), 'MM-dd HH:mm'),
    icon: 'lucide:activity',
    iconClass: 'text-[rgb(var(--primary))]',
    bg: { background: 'rgba(var(--primary),0.16)' }
  }))
})

const goDashboard = () => router.push({ name: 'Dashboard' }).catch(err => console.error('Navigation error:', err))
const goWater = () => router.push({ name: 'WaterTracker' }).catch(err => console.error('Navigation error:', err))
const goGames = (tab?: string) => {
  const targetRoute = tab === 'reaction' ? { name: 'ReactionTime' } : { name: 'Games' }
  router.push(targetRoute).catch(err => console.error('Navigation error:', err))
}
const goChat = () => router.push({ name: 'ChatRoom' }).catch(err => console.error('Navigation error:', err))
const goActivities = () => router.push({ name: 'Activities' }).catch(err => console.error('Navigation error:', err))

onMounted(async () => {
  await userStore.initialize()
  await Promise.all([
    hydrationStore.fetchEntries(),
    hydrationStore.fetchStats(),
    activityStore.fetchActivities(),
    gamesStore.fetchUserSummary()
  ])
})
</script>
