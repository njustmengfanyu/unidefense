<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../composables/useAppStore'

const router = useRouter()
const store = useAppStore()

const username = ref('')
const password = ref('')
const remember = ref(true)
const error = ref('')

const handleLogin = () => {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = '请输入用户名和密码（模拟登录，不会校验密码）'
    return
  }
  store.login(username.value.trim())
  if (remember.value) {
    localStorage.setItem('unidefense-remember-user', username.value.trim())
  }
  router.push('/')
}

onMounted(() => {
  const cached = localStorage.getItem('unidefense-remember-user')
  if (cached) {
    username.value = cached
  }
})
</script>

<template>
  <div class="login-page">
    <div class="glass-card">
      <div class="logo">UniDefense</div>
      <h1 class="title">登录后门检测与防御控制台</h1>
      <p class="subtitle">AI 安全&鲁棒评估实验平台-网安平台</p>

      <form class="form" @submit.prevent="handleLogin">
        <label class="field">
          <span class="label">用户名</span>
          <input v-model="username" type="text" placeholder="例如: analyst" />
        </label>

        <label class="field">
          <span class="label">密码</span>
          <input v-model="password" type="password" placeholder="*" />
        </label>

        <label class="remember">
          <input v-model="remember" type="checkbox" />
          <span>记住用户名</span>
        </label>

        <div v-if="error" class="error">{{ error }}</div>

        <button class="submit" type="submit">立即登录</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.25), transparent 35%),
    radial-gradient(circle at 80% 30%, rgba(167, 139, 250, 0.2), transparent 35%),
    linear-gradient(135deg, #0f172a, #0a0a1a 60%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #fff;
}

.glass-card {
  width: min(520px, 100%);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
}

.logo {
  font-weight: 700;
  font-size: 1.2rem;
  color: #60a5fa;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.4;
}

.subtitle {
  margin: 0.5rem 0 1.5rem 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.95rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.label {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
}

input[type='text'],
input[type='password'] {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input[type='text']:focus,
input[type='password']:focus {
  border-color: rgba(96, 165, 250, 0.7);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
}

.remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.75);
}

.remember input {
  accent-color: #60a5fa;
}

.error {
  color: #f87171;
  font-size: 0.9rem;
}

.submit {
  padding: 0.95rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 12px 30px rgba(96, 165, 250, 0.35);
}

.submit:hover {
  transform: translateY(-2px);
}

.submit:active {
  transform: translateY(0);
}
</style>
