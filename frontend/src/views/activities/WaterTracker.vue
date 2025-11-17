<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="喝水打卡" show-back show-profile />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <GlassCard>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4>今日喝水</h4>
            <p class="caption mt-1">目标 {{ goal }}ml</p>
          </div>
          <span class="text-2xl font-bold">{{ todayTotal }}ml</span>
        </div>
        <div class="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            class="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--primary))] rounded-full transition-all duration-500"
            :style="{ width: `${completion}%` }"
          />
        </div>
        <div class="flex items-center justify-between text-sm text-[rgb(var(--muted-foreground))]">
          <span>已完成 {{ completion }}%</span>
          <span>剩余 {{ Math.max(goal - todayTotal, 0) }}ml</span>
        </div>
      </GlassCard>

      <GlassCard>
        <div class="flex items-center justify-between mb-4">
          <h4>快捷添加</h4>
          <div class="flex items-center gap-2 caption text-[rgb(var(--muted-foreground))]">
            <Icon icon="lucide:droplet" class="w-4 h-4" />
            <span>ml</span>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <Button v-for="preset in presets" :key="preset" variant="outline" class="h-12" :disabled="hydrationStore.loading" @click="addWater(preset)">
            +{{ preset }}
          </Button>
        </div>
        <div class="flex items-center gap-3 mt-4">
          <Button variant="outline" size="icon" class="h-12 w-12 border-white/10" :disabled="hydrationStore.loading" @click="decrementCustom">
            <Icon icon="lucide:minus" class="w-5 h-5" />
          </Button>
          <div class="flex-1 text-center">
            <input v-model.number="customAmount" type="number" class="w-full bg-transparent text-center text-2xl outline-none" />
            <p class="caption">ml</p>
          </div>
          <Button variant="outline" size="icon" class="h-12 w-12 border-white/10" :disabled="hydrationStore.loading" @click="incrementCustom">
            <Icon icon="lucide:plus" class="w-5 h-5" />
          </Button>
        </div>
        <Button class="w-full h-11 gradient-primary mt-4" :disabled="hydrationStore.loading" @click="addWater(customAmount)">
          <Icon icon="lucide:droplet" class="w-5 h-5 mr-2" />
          添加记录
        </Button>
        <p v-if="hydrationStore.error" class="caption text-red-400 text-center mt-2">{{ hydrationStore.error }}</p>
      </GlassCard>

      <GlassCard>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <Icon icon="lucide:coffee" class="w-5 h-5 text-orange-400" />
            <h4>咖啡因摄入</h4>
          </div>
          <span class="caption">{{ caffeineStat }}</span>
        </div>
        <div class="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
            :style="{ width: caffeinePercent }"
          />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-[rgb(var(--muted-foreground))]">{{ caffeineStatus }}</span>
          <span class="text-sm text-orange-400">剩余 {{ Math.max(caffeineLimit - caffeineToday, 0) }}mg</span>
        </div>
      </GlassCard>

      <GlassCard>
        <div class="flex items-center justify-between mb-4">
          <h4>本周记录</h4>
          <Icon icon="lucide:calendar" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
        </div>
        <div class="grid grid-cols-7 gap-2">
          <div v-for="(day, i) in weekData" :key="i" class="flex flex-col items-center gap-2">
            <span class="caption text-xs">{{ day.day }}</span>
            <div
              class="w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-1"
              :class="day.active ? 'bg-[rgb(var(--primary))] text-white' : day.amount >= goal ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-[rgb(var(--muted-foreground))]'"
            >
              <Icon icon="lucide:droplet" class="w-3 h-3" />
              <span class="text-xs">{{ (day.amount / 1000).toFixed(1) }}L</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div>
        <h4 class="mb-4">今日记录</h4>
        <div v-if="hydrationStore.loading" class="text-center text-secondary text-sm">加载中...</div>
        <div v-else-if="!todayLogs.length" class="text-center text-secondary text-sm">今日尚无记录</div>
        <div v-else class="space-y-3">
          <GlassCard v-for="log in todayLogs" :key="log.id">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))]">
                  <Icon icon="lucide:droplet" class="w-5 h-5" />
                </div>
                <div>
                  <p>{{ log.amount }}ml 水</p>
                  <p v-if="log.caffeineMg" class="caption">咖啡因 {{ log.caffeineMg }}mg</p>
                </div>
              </div>
              <div class="text-right">
                <p class="caption">{{ formatTime(log.recordedAt) }}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { format } from 'date-fns'
import TopNav from '@/components/TopNav.vue'
import GlassCard from '@/components/GlassCard.vue'
import Button from '@/components/ui/Button.vue'
import { useHydrationStore } from '@/stores/hydration'

const hydrationStore = useHydrationStore()

const presets = [200, 300, 500]
const customAmount = ref(250)

const goal = computed(() => hydrationStore.goal)
const todayTotal = computed(() => hydrationStore.todayTotal)
const completion = computed(() => Math.min(Math.round((todayTotal.value / goal.value) * 100), 100))

const caffeineToday = computed(() => hydrationStore.stats?.today ?? 0)
const caffeineLimit = 300
const caffeinePercent = computed(() => `${Math.min((caffeineToday.value / caffeineLimit) * 100, 100)}%`)
const caffeineStat = computed(() => `${caffeineToday.value} / ${caffeineLimit}mg`)
const caffeineStatus = computed(() => {
  if (caffeineToday.value < caffeineLimit * 0.5) return '安全范围'
  if (caffeineToday.value < caffeineLimit * 0.8) return '适度摄入'
  return '接近上限'
})

const weekData = computed(() => {
  const weekly = hydrationStore.stats?.weekly ?? []
  return weekly.map(entry => {
    const date = new Date(entry.date)
    return {
      day: format(date, 'E'),
      amount: entry.total,
      active: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    }
  })
})

const todayLogs = computed(() => {
  const dateKey = format(new Date(), 'yyyy-MM-dd')
  return hydrationStore.entries.filter(e => e.recordedAt.startsWith(dateKey))
})

const addWater = async (amount: number) => {
  if (!amount) return
  await hydrationStore.createEntry({ amount })
}

const incrementCustom = () => {
  customAmount.value += 50
}

const decrementCustom = () => {
  customAmount.value = Math.max(50, customAmount.value - 50)
}

const formatTime = (value: string) => format(new Date(value), 'HH:mm')

onMounted(async () => {
  await Promise.all([hydrationStore.fetchEntries(), hydrationStore.fetchStats()])
})
</script>
