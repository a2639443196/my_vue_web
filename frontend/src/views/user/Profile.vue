<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="个人中心" show-back />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <GlassCard>
        <div class="flex flex-col items-center text-center">
          <div class="relative mb-4">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] flex items-center justify-center text-4xl">
              {{ avatarEmoji }}
            </div>
            <button class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center border-2 border-[rgb(var(--background))] hover:scale-110 transition-base">
              <Icon icon="lucide:camera" class="w-4 h-4" />
            </button>
          </div>

          <template v-if="!isEditing">
            <h3 class="mb-1">{{ profile?.username || '用户' }}</h3>
            <p class="text-secondary mb-2">{{ profile?.email }}</p>
            <p class="caption mb-4">{{ profile?.bio }}</p>
            <Button variant="outline" class="border-white/10" :disabled="profileStore.loading" @click="isEditing = true">
              <Icon icon="lucide:edit" class="w-4 h-4 mr-2" />
              编辑资料
            </Button>
          </template>
          <template v-else>
            <div class="w-full space-y-4">
              <div class="space-y-2">
                <Label for-id="name">用户名</Label>
                <Input id="name" v-model="form.username" class="bg-[rgb(var(--surface))] border-white/10" />
              </div>
              <div class="space-y-2">
                <Label for-id="email">邮箱</Label>
                <Input id="email" v-model="form.email" class="bg-[rgb(var(--surface))] border-white/10" />
              </div>
              <div class="space-y-2">
                <Label for-id="bio">个人简介</Label>
                <Input id="bio" v-model="form.bio" class="bg-[rgb(var(--surface))] border-white/10" />
              </div>
              <div class="flex gap-3">
                <Button class="flex-1 gradient-primary" :disabled="profileStore.loading" @click="saveProfile">保存</Button>
                <Button variant="outline" class="flex-1 border-white/10" :disabled="profileStore.loading" @click="cancelEdit">取消</Button>
              </div>
            </div>
          </template>
        </div>
      </GlassCard>

      <div class="grid grid-cols-2 gap-4">
        <GlassCard v-for="stat in statCards" :key="stat.label" class="text-center">
          <div class="text-2xl mb-1" :class="stat.color">{{ stat.value }}</div>
          <div class="caption">{{ stat.label }}</div>
        </GlassCard>
      </div>

      <GlassCard>
        <h4 class="mb-4">最近成就</h4>
        <div v-if="achievements.length" class="space-y-3">
          <div v-for="ach in achievements" :key="ach.id" class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <span class="text-2xl">{{ ach.icon || '🏆' }}</span>
            </div>
            <div class="flex-1">
              <p>{{ ach.title }}</p>
              <p class="caption">{{ ach.description }}</p>
            </div>
            <span class="caption text-[rgb(var(--muted-foreground))]">{{ formatDate(ach.earnedAt) }}</span>
          </div>
        </div>
        <div v-else class="text-center text-secondary text-sm">暂无成就</div>
      </GlassCard>

      <div>
        <h4 class="mb-4">设置</h4>
        <GlassCard class="p-0">
          <button
            v-for="(setting, i) in settings"
            :key="setting.label"
            class="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-base"
            :class="i !== settings.length - 1 ? 'border-b border-white/5' : ''"
          >
            <Icon :icon="setting.icon" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            <span class="flex-1 text-left">{{ setting.label }}</span>
            <span class="text-[rgb(var(--muted-foreground))]">›</span>
          </button>
        </GlassCard>
      </div>

      <GlassCard>
        <h4 class="mb-4">账号信息</h4>
        <div class="space-y-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-[rgb(var(--muted-foreground))]">加入时间</span>
            <span>{{ profile?.joinedAt || '-' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[rgb(var(--muted-foreground))]">账号ID</span>
            <span>{{ accountId }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[rgb(var(--muted-foreground))]">版本</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </GlassCard>

      <Button variant="outline" class="w-full h-12 border-red-500/30 text-red-400 hover:bg-red-500/10" @click="logout">
        <Icon icon="lucide:log-out" class="w-5 h-5 mr-2" />
        退出登录
      </Button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Icon } from '@iconify/vue'
import TopNav from '@/components/TopNav.vue'
import GlassCard from '@/components/GlassCard.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { useUserStore } from '@/stores/user'
import { useProfileStore } from '@/stores/profile'
import { useActivityStore } from '@/stores/activity'
import { useGamesStore } from '@/stores/games'

const userStore = useUserStore()
const profileStore = useProfileStore()
const activityStore = useActivityStore()
const gamesStore = useGamesStore()

const isEditing = ref(false)
const form = reactive({
  username: '',
  email: '',
  bio: ''
})

const profile = computed(() => profileStore.profile)
const achievements = computed(() => profileStore.achievements)
const stats = computed(() => profileStore.stats)
const activityStats = computed(() => activityStore.stats)
const gameStats = computed(() => gamesStore.userSummary)

const statCards = computed(() => [
  { label: '连续打卡', value: stats.value?.streakDays ?? '--', color: 'text-green-400' },
  { label: '总活动', value: activityStats.value?.total ?? '--', color: 'text-blue-400' },
  { label: '喝水量', value: stats.value?.hydrationLiters ?? '--', color: 'text-cyan-400' },
  { label: '游戏次数', value: gameStats.value?.totals.plays ?? '--', color: 'text-purple-400' }
])

const settings = [
  { icon: 'lucide:bell', label: '通知设置' },
  { icon: 'lucide:shield', label: '隐私与安全' },
  { icon: 'lucide:download', label: '导出数据' },
  { icon: 'lucide:help-circle', label: '帮助与反馈' }
]

const avatarEmoji = computed(() => userStore.userAvatar || '🧑')
const accountId = computed(() => userStore.user?.id || 'YZ-2024-0001')

const saveProfile = async () => {
  await profileStore.updateProfile({
    username: form.username,
    email: form.email,
    bio: form.bio
  })
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  syncForm()
}

const syncForm = () => {
  form.username = profile.value?.username || ''
  form.email = profile.value?.email || ''
  form.bio = profile.value?.bio || ''
}

const logout = () => userStore.logout()

const formatDate = (value: string) => {
  const d = new Date(value)
  return `${d.getMonth() + 1}-${d.getDate()}`
}

onMounted(async () => {
  await userStore.initialize()
  await Promise.all([
    profileStore.fetchProfile(),
    profileStore.fetchAchievements(),
    profileStore.fetchStats(),
    activityStore.fetchActivities(),
    activityStore.fetchStats(),
    gamesStore.fetchUserSummary()
  ])
  syncForm()
})
</script>
