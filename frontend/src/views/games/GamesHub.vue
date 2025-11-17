<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="训练游戏" show-back show-profile />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <div class="grid grid-cols-3 gap-4">
        <GlassCard class="text-center">
          <Icon icon="lucide:trophy" class="w-6 h-6 mx-auto mb-2 text-yellow-400" />
          <div class="text-2xl mb-1">{{ totalPlays }}</div>
          <div class="caption">总次数</div>
        </GlassCard>
        <GlassCard class="text-center">
          <Icon icon="lucide:clock" class="w-6 h-6 mx-auto mb-2 text-blue-400" />
          <div class="text-2xl mb-1">{{ totalDuration }}</div>
          <div class="caption">总时长</div>
        </GlassCard>
        <GlassCard class="text-center">
          <Icon icon="lucide:brain" class="w-6 h-6 mx-auto mb-2 text-purple-400" />
          <div class="text-2xl mb-1">{{ totalScore }}</div>
          <div class="caption">总得分</div>
        </GlassCard>
      </div>

      <section>
        <h4 class="mb-4">选择游戏</h4>
        <div class="space-y-4">
          <GlassCard
            v-for="game in games"
            :key="game.id"
            hover
            @click="navigateTo(game.id)"
          >
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white" :class="game.gradient">
                <Icon :icon="game.icon" class="w-8 h-8" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="mb-1">{{ game.name }}</h4>
                <p class="caption">{{ game.description }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <span class="text-sm text-[rgb(var(--primary))]">最佳: {{ game.best }}</span>
                  <span class="caption">{{ game.plays }} 次</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h4>排行榜</h4>
          <button class="text-sm text-[rgb(var(--primary))] hover:underline">查看全部</button>
        </div>
        <GlassCard>
          <div v-if="leaders.length" class="space-y-3">
            <div v-for="entry in leaders" :key="entry.rank" class="flex items-center gap-4">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-white"
                :class="entry.rank === 1 ? 'bg-yellow-500' : entry.rank === 2 ? 'bg-gray-400' : 'bg-orange-600'"
              >
                {{ entry.rank }}
              </div>
              <div class="w-10 h-10 rounded-full bg-[rgb(var(--primary))]/20 flex items-center justify-center">
                {{ entry.avatar || entry.username[0]?.toUpperCase() }}
              </div>
              <div class="flex-1">
                <p>{{ entry.username }}</p>
              </div>
              <div class="text-[rgb(var(--primary))]">
                {{ entry.score }}
              </div>
            </div>
          </div>
          <div v-else class="text-center text-secondary text-sm">暂无排行榜数据</div>
        </GlassCard>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import TopNav from '@/components/TopNav.vue'
import GlassCard from '@/components/GlassCard.vue'
import { useGamesStore } from '@/stores/games'

const router = useRouter()
const gamesStore = useGamesStore()
const currentGameType = ref<'schulte' | 'reaction' | 'memory' | 'sudoku'>('schulte')

const games = computed(() => {
  const summaries = gamesStore.summaries
  return [
    {
      id: 'schulte' as const,
      name: '舒尔特方格',
      description: '提升注意力和视觉搜索能力',
      icon: 'lucide:grid-3x3',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      best: summaries.schulte?.bestScore ?? '--',
      plays: summaries.schulte?.totalPlays ?? 0
    },
    {
      id: 'reaction' as const,
      name: '反应速度测试',
      description: '测试你的反应时间',
      icon: 'lucide:zap',
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      best: summaries.reaction?.bestScore ?? '--',
      plays: summaries.reaction?.totalPlays ?? 0
    },
    {
      id: 'memory' as const,
      name: '记忆翻牌',
      description: '锻炼短期记忆能力',
      icon: 'lucide:brain',
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
      best: summaries.memory?.bestScore ?? '--',
      plays: summaries.memory?.totalPlays ?? 0
    },
    {
      id: 'sudoku' as const,
      name: '数独挑战',
      description: '逻辑思维训练',
      icon: 'lucide:table',
      gradient: 'bg-gradient-to-br from-green-500 to-teal-500',
      best: summaries.sudoku?.bestScore ?? '--',
      plays: summaries.sudoku?.totalPlays ?? 0
    }
  ]
})

const leaders = computed(() => gamesStore.leaderboards[currentGameType.value])

const totalPlays = computed(() => gamesStore.userSummary?.totals.plays ?? 0)
const totalDuration = computed(() => {
  const ms = gamesStore.userSummary?.totals.durationMs ?? 0
  if (!ms) return '0h'
  return `${(ms / 3600000).toFixed(1)}h`
})
const totalScore = computed(() => {
  const sums = Object.values(gamesStore.summaries).reduce((acc, cur) => acc + (cur?.bestScore ?? 0), 0)
  return sums || 0
})

const navigateTo = (id: string) => {
  if (id === 'schulte') router.push({ name: 'SchulteGrid' })
  else if (id === 'reaction') router.push({ name: 'ReactionTime' })
  else if (id === 'memory') router.push({ name: 'MemoryFlip' })
  else if (id === 'sudoku') router.push({ name: 'Sudoku' })
}

onMounted(async () => {
  await Promise.all([
    gamesStore.fetchUserSummary(),
    gamesStore.fetchSummary('schulte'),
    gamesStore.fetchSummary('reaction'),
    gamesStore.fetchSummary('memory'),
    gamesStore.fetchSummary('sudoku'),
    gamesStore.fetchLeaderboard(currentGameType.value)
  ])
})
</script>
