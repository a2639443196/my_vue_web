<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-text">
        <div class="greeting">你好，{{ userStore.userDisplayName }} 👋</div>
        <h1>欢迎来到彦祖的导航站</h1>
        <p class="description">
          集合聊天、训练与打卡的个人效率首页。今天也要元气满满，保持好状态哦！
        </p>
        <div class="hero-stats">
          <div class="stat-card">
            <span class="label">今日饮水</span>
            <div class="value">{{ todayHydration }}<small>ml</small></div>
            <v-progress-linear
              :model-value="hydrationProgress"
              height="6"
              color="primary"
              rounded
            ></v-progress-linear>
            <span class="hint">目标 {{ hydrationTarget }} ml</span>
          </div>
          <div class="stat-card">
            <span class="label">舒尔特最佳</span>
            <div class="value">
              <template v-if="bestSchulte">
                {{ bestSchulte.score.toFixed(2) }}<small>秒</small>
              </template>
              <template v-else>--</template>
            </div>
            <span class="hint">最快专注成绩</span>
          </div>
          <div class="stat-card">
            <span class="label">反应力最佳</span>
            <div class="value">
              <template v-if="bestReaction">
                {{ Math.round(bestReaction.score) }}<small>ms</small>
              </template>
              <template v-else>--</template>
            </div>
            <span class="hint">越低越好</span>
          </div>
        </div>
      </div>

      <div class="hydration-card">
        <h3>今日饮水进度</h3>
        <div class="cup" :style="{ '--fill': cupFillHeight }">
          <div class="cup-fill"></div>
          <div class="cup-label">
            <div class="cup-value">{{ todayHydration }} ml</div>
            <div class="cup-target">目标 {{ hydrationTarget }} ml</div>
          </div>
        </div>
        <div class="hydration-footer">
          <v-btn color="#FFFFFF" variant="outlined" @click="goWater">前往喝水打卡</v-btn>
          <div class="small-history" v-if="recentHydration.length">
            <span class="small-title">最近记录</span>
            <ul>
              <li v-for="item in recentHydration" :key="item.id">
                {{ formatTime(item.recordedAt) }} · {{ item.amount }} ml
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="navigation">
      <div class="section-header">
        <h2>快速导航</h2>
        <div class="actions">
          <v-btn variant="text" size="small" @click="goProfile">
            管理导航卡片
            <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="card-grid">
        <div
          v-for="card in navigationCards"
          :key="card.id"
          class="nav-card"
          :class="{ highlight: card.highlight }"
          :style="{ '--card-color': card.color }"
          @click="handleCardClick(card)"
        >
          <div class="nav-card-icon">
            <v-icon size="32">{{ card.icon }}</v-icon>
          </div>
          <div class="nav-card-body">
            <div class="nav-card-title">
              {{ card.title }}
              <v-chip
                v-if="card.badge"
                size="small"
                color="white"
                variant="flat"
                class="ml-2"
              >
                {{ card.badge }}
              </v-chip>
            </div>
            <p>{{ card.description }}</p>
          </div>
          <div class="nav-card-arrow">
            <v-icon>mdi-arrow-right</v-icon>
          </div>
        </div>
      </div>
    </section>

    <section class="live-section">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-card class="card-hover" elevation="4">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>聊天室动态</span>
              <v-btn color="primary" variant="text" size="small" @click="goChat">
                进入聊天室
                <v-icon size="18" class="ml-1">mdi-chat-outline</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="chat-preview">
              <template v-if="recentMessages.length">
                <div v-for="message in recentMessages" :key="message.id" class="chat-line">
                  <span class="author">{{ message.username }}：</span>
                  <span class="content">{{ message.content }}</span>
                  <span class="time">{{ formatShort(message.createdAt) }}</span>
                </div>
              </template>
              <template v-else>
                <div class="empty">还没有聊天记录，快来打个招呼吧。</div>
              </template>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="card-hover" elevation="4">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>在线用户</span>
              <v-chip size="small" color="primary" variant="flat">
                {{ onlineUsers.length }} 人
              </v-chip>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="online-list">
              <p class="online-summary">
                当前共有 <strong>{{ onlineUsers.length }}</strong> 人在线，点击下方按钮查看详情。
              </p>
              <v-btn
                color="primary"
                block
                variant="outlined"
                :loading="isFetchingOnlineUsers"
                @click="openOnlineModal"
              >
                查看在线列表
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="card-hover" elevation="4">
            <v-card-title>今日安排</v-card-title>
            <v-divider></v-divider>
            <v-card-text class="schedule">
              <div class="schedule-item" @click="goWater">
                <div class="icon" style="background:#2F88FF10;color:#2F88FF">
                  <v-icon>mdi-water-plus</v-icon>
                </div>
                <div class="body">
                  <div class="title">喝水补给</div>
                  <div class="subtitle">{{ hydrationProgress.toFixed(0) }}% 已完成</div>
                </div>
                <v-icon class="arrow">mdi-chevron-right</v-icon>
              </div>
              <div class="schedule-item" @click="() => goGames()">
                <div class="icon" style="background:#43A04710;color:#43A047">
                  <v-icon>mdi-brain</v-icon>
                </div>
                <div class="body">
                  <div class="title">舒尔特练习</div>
                  <div class="subtitle">
                    {{ bestSchulte ? `${bestSchulte.score.toFixed(2)} 秒` : '等待刷新成绩' }}
                  </div>
                </div>
                <v-icon class="arrow">mdi-chevron-right</v-icon>
              </div>
              <div class="schedule-item" @click="() => goGames('reaction')">
                <div class="icon" style="background:#FF980010;color:#FF9800">
                  <v-icon>mdi-flash-outline</v-icon>
                </div>
                <div class="body">
                  <div class="title">反应速度</div>
                  <div class="subtitle">
                    {{ bestReaction ? `${Math.round(bestReaction.score)} ms` : '准备冲刺！' }}
                  </div>
                </div>
                <v-icon class="arrow">mdi-chevron-right</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <section class="timeline" v-if="latestOperations.length">
      <div class="section-header">
        <h2>操作记录</h2>
        <p class="hint">记录你最近的喝水、游戏等行为，便于在个人主页查看明细。</p>
      </div>
      <v-timeline align="start" density="compact">
        <v-timeline-item
          v-for="item in latestOperations"
          :key="item.id"
          :dot-color="item.type === 'water' ? 'primary' : 'secondary'"
        >
          <div class="operation-item">
            <div class="time">{{ formatDateTime(item.createdAt) }}</div>
            <div class="title">{{ item.title }}</div>
            <div class="desc">{{ item.description }}</div>
          </div>
        </v-timeline-item>
      </v-timeline>
    </section>

    <v-dialog v-model="showOnlineModal" max-width="420">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>在线用户（{{ onlineUsers.length }}）</span>
          <v-btn icon variant="text" @click="showOnlineModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="member-list">
          <div v-if="isFetchingOnlineUsers" class="member-loading">
            <v-progress-circular indeterminate color="primary" size="28"></v-progress-circular>
            <span>正在同步在线状态...</span>
          </div>
          <template v-else-if="onlineUsers.length">
            <div
              v-for="user in onlineUsers"
              :key="user.id"
              class="member-item"
              role="button"
              tabindex="0"
              @click="handleOnlineUserClick(user)"
              @keypress.enter.prevent="handleOnlineUserClick(user)"
            >
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
          <div v-else class="empty">暂无用户在线。</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { useNavigationStore } from '@/stores/navigation'
import { useNotificationStore } from '@/stores/notification'
import type { NavigationCard } from '@/types/navigation'
import type { ChatPresence } from '@/types/chat'

const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()
const navigationStore = useNavigationStore()
const notificationStore = useNotificationStore()
const showOnlineModal = ref(false)
const isFetchingOnlineUsers = ref(false)
const { messages, onlineUsers } = storeToRefs(chatStore)

const hydrationTarget = computed(() => userStore.hydrationTarget)
const todayHydration = computed(() => userStore.todayHydration)
const hydrationProgress = computed(() => {
  if (hydrationTarget.value === 0) return 0
  return Math.min((todayHydration.value / hydrationTarget.value) * 100, 120)
})

const cupFillHeight = computed(() => `${Math.min(hydrationProgress.value, 100)}%`)

const navigationCards = computed(() => navigationStore.cards)

const recentHydration = computed(() => userStore.hydrationEntries.slice(0, 5))
const latestOperations = computed(() => userStore.operations.slice(0, 4))
const bestSchulte = computed(() => userStore.bestSchulteRecord)
const bestReaction = computed(() => userStore.bestReactionRecord)

const recentMessages = computed(() => [...messages.value].slice(-5).reverse())

const goWater = () => router.push({ name: 'WaterTracker' })
const goGames = (tab?: string) => {
  if (tab === 'reaction') {
    router.push({ name: 'ReactionTime' })
  } else {
    router.push({ name: 'Games' })
  }
}
const goChat = () => router.push({ name: 'ChatRoom' })
const goProfile = () => router.push({ name: 'Profile' })

const handleCardClick = (card: NavigationCard) => {
  if (card.to) {
    router.push(card.to)
    return
  }
  if (card.externalUrl) {
    window.open(card.externalUrl, '_blank')
  }
}

const handleOnlineUserClick = (user: ChatPresence) => {
  showOnlineModal.value = false
  router.push({ name: 'ChatRoom', query: { focus: user.id } })
}

const openOnlineModal = async () => {
  if (isFetchingOnlineUsers.value) return
  isFetchingOnlineUsers.value = true
  try {
    await chatStore.fetchOnlineUsers()
    showOnlineModal.value = true
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : '无法获取在线用户'
    notificationStore.showError(message)
  } finally {
    isFetchingOnlineUsers.value = false
  }
}

onMounted(() => {
  chatStore.initialize()
  chatStore.fetchOnlineUsers().catch(() => undefined)
})

const formatTime = (date: string) => format(new Date(date), 'HH:mm')
const formatShort = (date: string) => format(new Date(date), 'MM-dd HH:mm')
const formatDateTime = (date: string) => format(new Date(date), 'MM月dd日 HH:mm')
const formatRelative = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN })
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  align-items: center;
}

.hero-text h1 {
  font-size: clamp(2.1rem, 4vw, 3rem);
  margin: 0.5rem 0 1rem;
}

.greeting {
  font-weight: 600;
  color: var(--v-theme-primary);
}

.description {
  color: rgba(0, 0, 0, 0.6);
  max-width: 540px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(44, 62, 80, 0.08);
}

.stat-card .label {
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.9rem;
}

.stat-card .value {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.stat-card .value small {
  font-size: 0.9rem;
  margin-left: 0.25rem;
  font-weight: 500;
}

.stat-card .hint {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.45);
}

.hydration-card {
  background: linear-gradient(160deg, #2f88ff 0%, #7c4dff 100%);
  color: white;
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

.hydration-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.15), transparent 55%);
  pointer-events: none;
}

.hydration-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
}

.cup {
  width: 160px;
  height: 220px;
  border: 4px solid rgba(255, 255, 255, 0.6);
  border-radius: 0 0 60px 60px;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.12);
}

.cup-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--fill);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(0, 122, 255, 0.95));
  transition: height 0.6s ease;
}

.cup-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.cup-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.cup-target {
  font-size: 0.9rem;
  opacity: 0.8;
}

.hydration-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.small-history {
  flex: 1;
}

.small-history ul {
  margin: 0.4rem 0 0;
  padding-left: 1rem;
  font-size: 0.85rem;
  line-height: 1.4;
}

.navigation .card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.nav-card {
  display: flex;
  align-items: center;
  padding: 1.2rem;
  border-radius: 20px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 20px 35px rgba(31, 59, 179, 0.08);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.nav-card.highlight {
  box-shadow: 0 20px 40px rgba(0, 128, 255, 0.22);
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 40px rgba(31, 59, 179, 0.14);
}

.nav-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--card-color) 15%, #ffffff);
  display: grid;
  place-items: center;
  margin-right: 1rem;
  color: var(--card-color);
}

.nav-card-body {
  flex: 1;
}

.nav-card-title {
  font-weight: 600;
  display: flex;
  align-items: center;
}

.nav-card-body p {
  margin: 0.4rem 0 0;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.92rem;
}

.nav-card-arrow {
  color: rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.section-header .hint {
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.chat-preview {
  max-height: 280px;
  overflow-y: auto;
  display: grid;
  gap: 0.75rem;
}

.chat-line {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  font-size: 0.9rem;
  align-items: baseline;
}

.chat-line .author {
  font-weight: 600;
}

.chat-line .content {
  color: rgba(0, 0, 0, 0.7);
}

.chat-line .time {
  color: rgba(0, 0, 0, 0.45);
  font-size: 0.8rem;
}

.online-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.online-summary {
  color: rgba(0, 0, 0, 0.6);
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
  padding: 0.5rem 0.35rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.member-item:focus-visible,
.member-item:hover {
  background: rgba(99, 102, 241, 0.08);
  transform: translateX(2px);
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.member-meta .name {
  font-weight: 600;
}

.member-meta .time {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.55);
}

.member-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(15, 23, 42, 0.6);
  padding: 0.5rem 0;
}

.schedule {
  display: grid;
  gap: 0.75rem;
}

.schedule-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: background 0.3s ease;
}

.schedule-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.schedule-item .icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
}

.schedule-item .title {
  font-weight: 600;
}

.schedule-item .subtitle {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.55);
}

.schedule-item .arrow {
  color: rgba(0, 0, 0, 0.3);
}

.empty {
  color: rgba(0, 0, 0, 0.45);
  text-align: center;
  padding: 1.5rem 0;
}

.timeline {
  margin-bottom: 2rem;
}

.operation-item {
  display: grid;
  gap: 0.25rem;
}

.operation-item .time {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.45);
}

.operation-item .title {
  font-weight: 600;
}

.operation-item .desc {
  color: rgba(0, 0, 0, 0.65);
  font-size: 0.92rem;
}

@media (max-width: 960px) {
  .hydration-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
