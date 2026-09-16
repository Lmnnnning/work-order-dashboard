<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h1>Work Order Dashboard</h1>
        <p>Please sign in to continue</p>
      </div>

      <a-form
        :model="form"
        :rules="rules"
        ref="formRef"
        layout="vertical"
        @finish="onFinish"
      >
        <a-form-item label="Username" name="username">
          <a-input
            v-model:value="form.username"
            placeholder="Try 'admin' or any other name"
            size="large"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="Password" name="password">
          <a-input-password
            v-model:value="form.password"
            placeholder="Any value will do"
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            Log in
          </a-button>
        </a-form-item>
      </a-form>

      <div class="login-tip">
        <span>💡 Hint:</span>
        <span>Username <b>admin</b> → Administrator · others → Regular User</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: 'Please enter your username' }],
  password: [{ required: true, message: 'Please enter your password' }]
}

const onFinish = () => {
  loading.value = true
  const role = form.username === 'admin' ? 'admin' : 'user'
  const user = { username: form.username, role }
  localStorage.setItem('currentUser', JSON.stringify(user))

  setTimeout(() => {
    loading.value = false
    message.success(`Welcome back, ${form.username}! (${role === 'admin' ? 'Admin' : 'User'})`)
    router.replace('/dashboard')
  }, 400)
}
</script>

<style lang="less" scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 24px;
}

.login-card {
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  .login-header {
    text-align: center;
    margin-bottom: 28px;

    h1 {
      margin: 0 0 8px;
      font-size: 24px;
      color: #1f1f1f;
    }
    p {
      margin: 0;
      color: #8c8c8c;
      font-size: 14px;
    }
  }

  .login-tip {
    margin-top: 16px;
    font-size: 12px;
    color: #8c8c8c;
    text-align: center;

    b {
      color: #1890ff;
    }
  }
}
</style>
