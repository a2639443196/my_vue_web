<template>
  <div class="chat-page">
    <v-card elevation="6" class="chat-shell">
      <header class="chat-head">
        <div class="head-row primary">
          <span class="status-dot" :class="{ online: isConnected }"></span>
          <span class="title">彦祖聊天室</span>
        </div>
        <div class="head-row secondary">
          <span class="user-name">{{ userStore.userDisplayName }}</span>
          <v-btn size="small" variant="text" class="online-btn" @click="showMembers = true">
            <v-icon size="16" class="mr-1">mdi-account-multiple</v-icon>
            {{ onlineUsers.length }} 人在线
          </v-btn>
        </div>
      </header>

      <section ref="messageContainer" class="chat-feed">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['chat-line', {
            mine: message.userId === currentUserId && !message.isSystem,
            system: message.isSystem
          }]"
        >
          <div v-if="!message.isSystem" class="avatar">
            <v-avatar size="36" color="primary">
              <template v-if="!message.avatar">
                {{ message.username.slice(0, 1).toUpperCase() }}
              </template>
              <img v-else :src="message.avatar" :alt="message.username" />
            </v-avatar>
          </div>
          <div class="bubble">
            <template v-if="message.isSystem">
              <div class="system-text">{{ message.content }}</div>
            </template>
            <template v-else>
              <div class="meta">
                <span class="author">{{ message.username }}</span>
                <span class="time">{{ formatTime(message.createdAt) }}</span>
              </div>
              <div class="content">{{ message.content }}</div>
            </template>
          </div>
        </div>
      </section>

      <footer class="chat-input-bar">
        <div class="composer">
          <v-textarea
            v-model="draft"
            auto-grow
            max-rows="3"
            rows="1"
            variant="outlined"
            placeholder="输入内容开始聊天（Enter 发送，Shift + Enter 换行）"
            @keydown.enter.prevent="handleEnter"
          ></v-textarea>
        </div>
        <v-btn
          color="primary"
          class="send-btn"
          :disabled="!draft.trim()"
          @click="sendMessage"
          icon
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </footer>
    </v-card>

    <v-dialog v-model="showMembers" max-width="420">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>在线用户（{{ onlineUsers.length }}）</span>
          <v-btn icon variant="text" @click="showMembers = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="member-list">
          <template v-if="onlineUsers.length">
            <div v-for="user in sortedOnlineUsers" :key="user.id" class="member-item">
              <v-avatar size="36" color="primary">
                <template v-if="!user.avatar">
                  {{ user.username.slice(0, 1).toUpperCase() }}
                </template>
                <img v-else :src="user.avatar" :alt="user.username" />
              </v-avatar>
              <div class="member-meta">
                <div class="name">{{ user.username }}</div>
                <div class="time">{{ formatRelative(user.lastActive) }}</div>
              </div>
            </div>
          </template>
          <div v-else class="empty">暂无其他用户在线</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'

const chatStore = useChatStore()
const userStore = useUserStore()
const { messages, onlineUsers, connecting, room } = storeToRefs(chatStore)

const draft = ref('')
const showMembers = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const currentUserId = computed(() => userStore.user?.id ?? 'guest')
const isConnected = computed(() => !connecting.value && !!room.value)
const sortedOnlineUsers = computed(() =>
  [...onlineUsers.value].sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  )
)

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  if (!draft.value.trim()) return
  try {
    chatStore.sendMessage(draft.value)
    draft.value = ''
    scrollToBottom()
  } catch (error: any) {
    console.error(error)
  }
}

const handleEnter = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    draft.value += '\n'
    return
  }
  sendMessage()
}

watch(
  () => messages.value.length,
  () => scrollToBottom()
)

onMounted(async () => {
  await chatStore.initialize()
  chatStore.fetchOnlineUsers().catch(() => undefined)
  scrollToBottom()
})

const formatTime = (value: string) => format(new Date(value), 'MM-dd HH:mm')
const formatRelative = (value: string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true, locale: zhCN })
</script>

<style scoped>
.chat-page {
  min-height: calc(100vh - 140px);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.12), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.1), transparent 40%),
    #f4f5fb;
}

.chat-shell {
  width: min(960px, 100%);
  border-radius: 32px;
  padding: clamp(1rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  min-height: clamp(560px, calc(100vh - 180px), 960px);
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.15);
  background-color: rgba(255, 255, 255, 0.95);
}

.chat-head {
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  z-index: 3;
  background: rgba(255, 255, 255, 0.95);
  padding-bottom: 0.5rem;
}

.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head-row.primary {
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #9ca3af;
  display: inline-block;
}

.status-dot.online {
  background: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
}

.title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
}

.head-row.secondary {
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.65);
}

.online-btn {
  text-transform: none;
  font-weight: 500;
}

.chat-feed {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 24px;
  padding: 1.2rem;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);
  margin-bottom: 1rem;
}

.chat-line {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
  align-items: flex-start;
}

.chat-line:not(.system) .bubble {
  max-width: 85%;
}

@media (max-width: 768px) {
  .chat-line:not(.system) .bubble {
    max-width: 75%;
  }
}

.chat-line.mine {
  justify-content: end;
}

.chat-line.mine .bubble {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.14), rgba(99, 102, 241, 0.18));
}

.chat-line.system {
  grid-template-columns: 1fr;
}

.chat-line.system .bubble {
  background: transparent;
  text-align: center;
  box-shadow: none;
  color: rgba(15, 23, 42, 0.55);
  font-size: 0.85rem;
}

.bubble {
  background: white;
  border-radius: 18px;
  padding: 0.75rem 1rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(15, 23, 42, 0.55);
  margin-bottom: 0.35rem;
}

.content {
  white-space: pre-wrap;
  color: #0f172a;
  line-height: 1.55;
}

.chat-input-bar {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: stretch;
  position: sticky;
  bottom: 0;
  z-index: 3;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: 0.5rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.composer {
  flex: 1;
  min-height: 64px;
}

.composer :deep(.v-input),
.composer :deep(.v-field) {
  width: 100%;
  height: 100%;
}

.send-btn {
  align-self: flex-end;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-left: 0.5rem;
}

.member-list {
  max-height: 420px;
  overflow-y: auto;
  padding-top: 1rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0;
}

.member-meta .name {
  font-weight: 600;
}

.member-meta .time {
  font-size: 0.8rem;
  color: rgba(15, 23, 42, 0.55);
}

.empty {
  text-align: center;
  color: rgba(15, 23, 42, 0.45);
  padding: 1rem 0;
}

@media (max-width: 768px) {
  .chat-shell {
    min-height: calc(100vh - 100px);
    max-height: calc(100vh - 60px);
    padding: 0.75rem;
    border-radius: 20px;
  }

  .chat-page {
    padding: 0.5rem;
  }

  .send-btn {
    width: 44px;
    height: 44px;
  }

  .chat-head {
    padding: 0.25rem 0.25rem 0.75rem;
  }

  .chat-feed {
    border-radius: 18px;
    padding: 0.75rem;
  }

  .chat-input-bar {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .chat-line {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .bubble {
    padding: 0.6rem 0.85rem;
  }
}
</style>
