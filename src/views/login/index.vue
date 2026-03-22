<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo-container">
          <img src="../../assets/logo.png" alt="logo" class="logo" />
        </div>
        <h2 class="title">图书管理系统</h2>
        <p class="subtitle">BOOK MANAGEMENT SYSTEM</p>
      </div>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" size="large" @submit.prevent>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" show-password @keyup.enter="handleLogin" placeholder="密码">
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <div class="login-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-button link type="primary" @click="handleForgotPassword">忘记密码</el-button>
        </div>
        <el-button :loading="loading" class="login-button" type="primary" @click="handleLogin">{{ loading ? '登录中' : '立即登录' }}</el-button>
      </el-form>
        <div class="login-footer">
      <div class="divider">
        <span>测试账号</span>
      </div>
      <div class="test-accounts">
        <el-tooltip effect="dark" content="拥有最高权限：可管理所有管理员及用户" placement="top">
          <el-tag size="small" type="warning">超管: super_admin / 123456</el-tag>
          
        </el-tooltip>
        <el-tag size="small" type="info">管理员: admin / admin123</el-tag>
        <el-tag size="small" type="info">学生: student / 123456</el-tag>
          
      </div>
    </div>
    </div>


    
  </div>
  
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormRules, FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import router from '@/router'
const loginForm = reactive({
  username: '',
  password: ''
})
const loginFormRef = ref<FormInstance>()
const rememberMe = ref(false)
const loading = ref(false)
const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  try {
    await loginFormRef.value.validate()
    loading.value = true
    const res: any = await login(loginForm)
    if (res.code === 200) {
      const{token, userInfo} = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      ElMessage.success('登录成功')
      router.push('/')     
    }
  } catch (error) {
    console.error('失败:', error)
  } finally {
    loading.value = false
  }
  
}

const handleForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('@/static/bg2.jpg');
  background-size: cover;
  background-position: center;
  overflow: hidden;
  position: relative;
}


.login-box {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 10;
  animation: fadeIn 0.8s ease-out;
}


.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  width: 80px;
  height: 80px;
  background: #fff;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.logo-container .logo {
  width: 50px;
  height: 50px;
}

.login-header .title {
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.login-header .subtitle {
  color: #7f8c8d;
  font-size: 12px;
  margin-top: 8px;
  letter-spacing: 4px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 4px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(118, 75, 162, 0.3);
}

.login-button:active {
  transform: translateY(0);
}


.login-footer {
  margin-top: 35px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
}

.divider span {
  padding: 0 15px;
  color: #95a5a6;
  font-size: 13px;
}

.test-accounts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.test-accounts .el-tag {
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #7f8c8d;
}


:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  box-shadow: none !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 5px 15px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper.is-focus) {
  background-color: #fff;
  border-color: #667eea;
}

:deep(.el-input__prefix-inner) {
  font-size: 18px;
  color: #764ba2;
}

:deep(.el-checkbox__label) {
  color: #7f8c8d;
}
</style>
