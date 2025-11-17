<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="活动中心" show-back show-profile />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <div class="flex gap-2 p-1 bg-[rgb(var(--card))] rounded-xl border border-white/5">
        <button
          v-for="mood in moods"
          :key="mood.id"
          class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-base"
          :class="selectedMood === mood.id ? 'bg-[rgb(var(--primary))] text-white' : 'text-[rgb(var(--muted-foreground))]'"
          @click="selectedMood = mood.id"
        >
          <Icon :icon="mood.icon" class="w-4 h-4" :class="mood.color" />
          <span class="text-sm">{{ mood.label }}</span>
        </button>
      </div>

      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="flex flex-col items-center gap-2 p-3 rounded-xl border transition-base"
          :class="selectedCategory === cat.id ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10' : 'border-white/10 hover:bg-white/5'"
          @click="selectedCategory = cat.id"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white" :style="{ background: cat.bg }">
            <Icon :icon="cat.icon" class="w-5 h-5" />
          </div>
          <span class="text-xs">{{ cat.label }}</span>
        </button>
      </div>

      <GlassCard>
        <h4 class="mb-4">记录活动</h4>
        <div class="space-y-4">
          <div>
            <p class="caption mb-2">你的备注</p>
            <textarea
              v-model="note"
              rows="3"
              class="w-full bg-transparent border border-white/10 rounded-xl p-3 text-sm resize-none outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
              placeholder="记录今天的心情、完成的任务或收获..."
            ></textarea>
          </div>
          <Button class="w-full h-12" :disabled="activityStore.loading" @click="handleSave">
            <Icon icon="lucide:plus" class="w-5 h-5 mr-2" />
            保存活动
          </Button>
          <p v-if="activityStore.error" class="caption text-red-400 text-center">{{ activityStore.error }}</p>
        </div>
      </GlassCard>

      <div>
        <div class="flex items-center justify-between mb-4">
          <h4>活动时间线</h4>
          <span class="caption text-[rgb(var(--muted-foreground))]">
            {{ activityStore.loading ? '加载中...' : `${activities.length} 条` }}
          </span>
        </div>
        <div v-if="activityStore.loading" class="text-center text-secondary text-sm">加载中...</div>
        <div v-else-if="!activities.length" class="text-center text-secondary text-sm">还没有记录，开始第一条吧。</div>
        <div v-else class="space-y-3">
          <GlassCard v-for="item in activities" :key="item.id">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="getActivityStyle(item)">
                <Icon :icon="getActivityIcon(item)" class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <p>{{ item.note }}</p>
                <p class="caption mt-1">{{ formatTime(item.createdAt) }}</p>
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
import TopNav from '@/components/TopNav.vue'
import GlassCard from '@/components/GlassCard.vue'
import Button from '@/components/ui/Button.vue'
import { useActivityStore } from '@/stores/activity'
import type { Activity } from '@/api/activitiesApi'

const activityStore = useActivityStore()

const moods = [
  { id: 'happy', icon: 'lucide:smile', label: '开心', color: 'text-green-400' },
  { id: 'normal', icon: 'lucide:meh', label: '平静', color: 'text-blue-400' },
  { id: 'sad', icon: 'lucide:frown', label: '低落', color: 'text-gray-400' }
]

const categories = [
  { id: 'health', icon: 'lucide:heart', label: '健康', bg: '#ef4444' },
  { id: 'food', icon: 'lucide:coffee', label: '饮食', bg: '#f97316' },
  { id: 'study', icon: 'lucide:book-open', label: '学习', bg: '#3b82f6' },
  { id: 'exercise', icon: 'lucide:dumbbell', label: '运动', bg: '#22c55e' }
]

const selectedMood = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)
const note = ref('')

const activities = computed(() => activityStore.activities)

const handleSave = async () => {
  if (!note.value.trim()) return
  await activityStore.createActivity({
    mood: (selectedMood.value || 'normal') as any,
    category: (selectedCategory.value || 'health') as any,
    note: note.value.trim()
  })
  selectedMood.value = null
  selectedCategory.value = null
  note.value = ''
}

const getActivityStyle = (item: Activity) => {
  const cat = categories.find(c => c.id === item.category)
  const base = cat?.bg || '#64748b'
  return { background: `${base}20`, color: base }
}

const getActivityIcon = (item: Activity) => {
  const cat = categories.find(c => c.id === item.category)
  return cat?.icon || 'lucide:activity'
}

const formatTime = (value: string) => {
  const d = new Date(value)
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  activityStore.fetchActivities()
  activityStore.fetchStats()
})
</script>
