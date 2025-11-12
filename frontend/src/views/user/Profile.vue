<template>
  <div class="profile-view">
    <v-card v-if="operations.length" class="card" elevation="6">
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

    <v-card class="card" elevation="6">
      <v-card-title>基础信息</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveProfile">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.username" label="用户名" prepend-inner-icon="mdi-account"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.phone"
                label="手机号"
                type="tel"
                prepend-inner-icon="mdi-cellphone"
              ></v-text-field>
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
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { format } from 'date-fns'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

const form = reactive({
  username: userStore.user?.username || '',
  phone: userStore.user?.phone || '',
  email: userStore.user?.email || '',
  avatar: userStore.user?.avatar || ''
})

const operations = computed(() => userStore.operations.slice(0, 10))

const saveProfile = async () => {
  try {
    await userStore.updateProfile({
      username: form.username,
      phone: form.phone,
      email: form.email,
      avatar: form.avatar
    })
    notificationStore.showSuccess('个人信息已更新')
  } catch (error: any) {
    notificationStore.showError(error.message)
  }
}

const formatDateTime = (value: string) => format(new Date(value), 'MM月dd日 HH:mm')
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  border-radius: 24px;
}

.timeline-item .time {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.55);
}

.timeline-item .title {
  font-weight: 600;
}

.timeline-item .desc {
  color: rgba(15, 23, 42, 0.7);
}

.actions {
  margin-top: 1rem;
}
</style>
