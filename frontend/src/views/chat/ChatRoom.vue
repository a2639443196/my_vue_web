<template>
  <div class="min-h-screen bg-[rgb(var(--background))] flex flex-col">
    <TopNav title="聊天室" show-back show-profile />

    <div class="px-6 py-3 bg-[rgb(var(--card))] border-b border-white/5">
      <div class="flex items-center gap-2 max-w-md mx-auto">
        <Icon icon="lucide:users" class="w-4 h-4 text-green-400" />
        <span class="text-sm text-secondary">{{ onlineUsers.length }} 人在线</span>
        <div class="flex -space-x-2 ml-auto">
          <div
            v-for="(avatar, i) in displayedAvatars"
            :key="i"
            class="w-8 h-8 rounded-full bg-[rgb(var(--primary))]/20 border-2 border-[rgb(var(--background))] flex items-center justify-center text-sm"
          >
            {{ avatar }}
          </div>
        </div>
      </div>
    </div>

    <div ref="feedRef" class="flex-1 overflow-y-auto px-6 py-4 max-w-md mx-auto w-full">
      <div class="space-y-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex gap-3"
          :class="msg.userId === currentUserId ? 'flex-row-reverse' : 'flex-row'"
        >
          <div class="w-10 h-10 rounded-full bg-[rgb(var(--primary))]/20 flex items-center justify-center flex-shrink-0">
            <span v-if="!msg.avatar">{{ (msg.username || 'U')[0].toUpperCase() }}</span>
            <img v-else :src="msg.avatar" alt="" class="w-full h-full object-cover rounded-full" />
          </div>

          <div class="flex flex-col max-w-[70%]" :class="msg.userId === currentUserId ? 'items-end' : 'items-start'">
            <div class="flex items-center gap-2 mb-1">
              <span v-if="msg.userId !== currentUserId" class="text-sm text-[rgb(var(--muted-foreground))]">{{ msg.username }}</span>
              <span class="caption">{{ formatTime(msg.createdAt) }}</span>
            </div>
            <div
              class="px-4 py-3 rounded-2xl"
              :class="
                msg.userId === currentUserId
                  ? 'bg-[rgb(var(--primary))] text-white rounded-tr-sm'
                  : 'bg-[rgb(var(--card))] border border-white/5 rounded-tl-sm'
              "
            >
              <p>{{ msg.content }}</p>
            </div>
          </div>
        </div>
        <div ref="bottomRef" />
      </div>
    </div>

    <div class="sticky bottom-0 safe-bottom px-6 py-4 bg-[rgb(var(--card))] border-t border-white/5">
      <div class="max-w-md mx-auto flex gap-3">
        <Input
          v-model="draft"
          placeholder="输入消息..."
          class="flex-1 h-12 bg-[rgb(var(--surface))] border-white/10"
          @keydown.enter.prevent="handleEnter"
        />
        <Button
          class="h-12 w-12 gradient-primary p-0"
          :disabled="!draft.trim()"
          @click="sendMessage"
        >
          <Icon icon="lucide:send" class="w-5 h-5" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import TopNav from '@/components/TopNav.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'

const chatStore = useChatStore()
const userStore = useUserStore()

const draft = ref('')
const feedRef = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)

const { messages, onlineUsers } = chatStore
const currentUserId = computed(() => userStore.profile?.id ?? 'guest')

const displayedAvatars = computed(() => {
  const fallback = ['👨', '👩', '🧑', '👴', '👵']
  return onlineUsers.slice(0, 5).map(u => u.avatar || u.username?.[0]?.toUpperCase() || fallback[Math.floor(Math.random() * fallback.length)])
})

const scrollToBottom = () => {
  nextTick(() => {
    bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

const handleEnter = () => {
  if (!draft.value.trim()) return
  sendMessage()
}

const sendMessage = () => {
  if (!draft.value.trim()) return
  chatStore.sendMessage(draft.value.trim())
  draft.value = ''
  scrollToBottom()
}

const formatTime = (value: string) => {
  const date = new Date(value)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

watch(
  () => messages.length,
  () => scrollToBottom(),
  { immediate: true }
)

onMounted(() => {
  chatStore.initialize()
  scrollToBottom()
})
</script>
