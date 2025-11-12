<template>
  <div class="profile-view">
    <v-row dense>
      <v-col cols="12" md="8">
        <v-card class="card" elevation="6">
          <v-card-title>基础信息</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveProfile">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.username" label="用户名" prepend-inner-icon="mdi-account"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.email" label="邮箱" type="email" prepend-inner-icon="mdi-email"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="form.avatar" label="头像地址" prepend-inner-icon="mdi-image"></v-text-field>
                </v-col>
              </v-row>
              <div class="actions">
                <v-btn color="primary" type="submit">保存信息</v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card class="card" elevation="6" v-if="operations.length">
          <v-card-title>近期操作记录</v-card-title>
          <v-card-text>
            <v-timeline density="comfortable" align="start">
              <v-timeline-item
                v-for="item in operations"
                :key="item.id"
                :dot-color="item.type === 'water' ? 'primary' : 'secondary'"
              >
                <div class="timeline-item">
                  <div class="time">{{ formatDateTime(item.createdAt) }}</div>
                  <div class="title">{{ item.title }}</div>
                  <div class="desc">{{ item.description }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="card" elevation="6">
          <v-card-title>饮水趋势</v-card-title>
          <v-card-text>
            <div class="hydration-stats">
              <div class="target">
                <span>每日目标</span>
                <strong>{{ userStore.hydrationTarget }} ml</strong>
              </div>
              <div class="today">
                <span>今日已喝</span>
                <strong>{{ userStore.todayHydration }} ml</strong>
              </div>
            </div>
            <div class="hydration-bars">
              <div v-for="day in hydrationSummary" :key="day.date" class="bar">
                <div class="value" :style="{ height: day.percent + '%' }"></div>
                <span class="label">{{ day.label }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="card" elevation="6">
          <v-card-title>首页导航卡片配置</v-card-title>
          <v-card-text>
            <div class="nav-form">
              <v-text-field v-model="navForm.title" label="标题" dense></v-text-field>
              <v-text-field v-model="navForm.description" label="描述" dense></v-text-field>
              <v-text-field v-model="navForm.icon" label="图标 (mdi 名称)" dense></v-text-field>
              <v-text-field v-model="navForm.color" label="主题色" dense></v-text-field>
              <v-radio-group v-model="navForm.type" inline>
                <v-radio label="内部页面" value="internal"></v-radio>
                <v-radio label="外部链接" value="external"></v-radio>
              </v-radio-group>
              <v-select
                v-if="navForm.type === 'internal'"
                v-model="navForm.to"
                :items="internalRoutes"
                label="内部路由"
                dense
              ></v-select>
              <v-text-field
                v-else
                v-model="navForm.externalUrl"
                label="外部链接地址"
                dense
              ></v-text-field>
              <v-btn color="primary" block class="mt-3" @click="addNavigationCard">添加到首页</v-btn>
            </div>

            <div class="nav-list" v-if="navigationStore.cards.length">
              <div v-for="card in navigationStore.cards" :key="card.id" class="nav-item">
                <div>
                  <div class="name">{{ card.title }}</div>
                  <div class="desc">{{ card.description }}</div>
                  <div class="link">{{ card.to || card.externalUrl }}</div>
                </div>
                <div class="nav-actions">
                  <v-switch
                    :model-value="card.highlight"
                    color="primary"
                    inset
                    hide-details
                    label="高亮显示"
                    @update:model-value="value => navigationStore.updateCard(card.id, { highlight: !!value })"
                  ></v-switch>
                  <v-btn icon variant="text" color="error" @click="removeCard(card.id)">
                    <v-icon>mdi-delete-outline</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { format } from 'date-fns'
import { useUserStore } from '@/stores/user'
import { useNavigationStore } from '@/stores/navigation'
import { useNotificationStore } from '@/stores/notification'

const userStore = useUserStore()
const navigationStore = useNavigationStore()
const notificationStore = useNotificationStore()

const form = reactive({
  username: userStore.user?.username || '',
  email: userStore.user?.email || '',
  avatar: userStore.user?.avatar || ''
})

type NavFormState = {
  title: string
  description: string
  icon: string
  color: string
  type: 'internal' | 'external'
  to: string
  externalUrl: string
}

const navForm = reactive<NavFormState>({
  title: '',
  description: '',
  icon: 'mdi-star-outline',
  color: '#2F88FF',
  type: 'internal',
  to: '/water',
  externalUrl: ''
})

const operations = computed(() => userStore.operations)
const hydrationHistory = computed(() => userStore.hydrationHistory)

const hydrationSummary = computed(() => {
  const today = new Date()
  const list = [] as { date: string; label: string; percent: number }[]
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = format(date, 'yyyy-MM-dd')
    const total = hydrationHistory.value[key]?.total || 0
    const percent = Math.min((total / (userStore.hydrationTarget || 1)) * 100, 100)
    list.push({
      date: key,
      label: format(date, 'MM/dd'),
      percent
    })
  }
  return list
})

const internalRoutes = [
  { title: '首页', value: '/' },
  { title: '喝水打卡', value: '/water' },
  { title: '聊天室', value: '/chat' },
  { title: '专注训练', value: '/games' },
  { title: '个人主页', value: '/profile' }
]

const saveProfile = async () => {
  try {
    await userStore.updateProfile({
      username: form.username,
      email: form.email,
      avatar: form.avatar
    })
    notificationStore.showSuccess('个人信息已更新')
  } catch (error: any) {
    notificationStore.showError(error.message)
  }
}

const addNavigationCard = () => {
  if (!navForm.title || !navForm.description) {
    notificationStore.showWarning('请填写完整的标题和描述')
    return
  }

  if (navForm.type === 'external' && !navForm.externalUrl) {
    notificationStore.showWarning('请输入外部链接地址')
    return
  }

  navigationStore.addCard({
    title: navForm.title,
    description: navForm.description,
    icon: navForm.icon,
    color: navForm.color,
    to: navForm.type === 'internal' ? navForm.to : undefined,
    externalUrl: navForm.type === 'external' ? navForm.externalUrl : undefined,
    badge: navForm.type === 'external' ? '外链' : undefined,
    highlight: navForm.type === 'internal'
  })

  notificationStore.showSuccess('已添加导航卡片')

  navForm.title = ''
  navForm.description = ''
  navForm.icon = 'mdi-star-outline'
  navForm.color = '#2F88FF'
  navForm.externalUrl = ''
  navForm.type = 'internal'
  navForm.to = '/water'
}

const removeCard = (id: string) => {
  navigationStore.removeCard(id)
  notificationStore.showInfo('已移除导航卡片')
}

const formatDateTime = (date: string) => format(new Date(date), 'MM月dd日 HH:mm')
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  border-radius: 24px;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.timeline-item {
  display: grid;
  gap: 0.25rem;
}

.timeline-item .time {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.5);
}

.timeline-item .title {
  font-weight: 600;
}

.timeline-item .desc {
  color: rgba(0, 0, 0, 0.65);
}

.hydration-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.hydration-stats span {
  color: rgba(0, 0, 0, 0.55);
}

.hydration-bars {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  height: 140px;
  padding: 0.5rem 0;
}

.bar {
  flex: 1;
  display: grid;
  justify-items: center;
  gap: 0.35rem;
}

.bar .value {
  width: 100%;
  background: linear-gradient(180deg, rgba(47, 136, 255, 0.85), rgba(76, 175, 80, 0.65));
  border-radius: 12px 12px 4px 4px;
  transition: height 0.4s ease;
}

.bar .label {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.nav-form {
  display: grid;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.nav-list {
  display: grid;
  gap: 0.75rem;
}

.nav-item {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  padding: 0.75rem 1rem;
  display: grid;
  gap: 0.5rem;
}

.nav-item .name {
  font-weight: 600;
}

.nav-item .desc {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.9rem;
}

.nav-item .link {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.5);
}

.nav-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
