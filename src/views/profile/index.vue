<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 个人信息卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="profile-card">
          <div class="user-avatar-container">
            <div class="user-avatar">
              <el-avatar :size="100" :src="userInfo.avatar" :icon="UserFilled" />
              <div class="avatar-hover" @click="triggerUpload">
                <el-icon><Upload /></el-icon>
                <span>更换头像</span>
              </div>
            </div>
            <!-- 隐藏的上传按钮 -->
            <el-upload
                ref="uploadRef"
                class="avatar-uploader"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleAvatarChange"
            >
            </el-upload>
          </div>
          <div class="user-info">
            <h3 class="nickname">{{ userInfo.nickname }}</h3>
            <p class="role-tag">
              <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'success'">
                {{ userInfo.role === 'admin' ? '系统管理员' : '在校学生' }}
              </el-tag>
            </p>
          </div>
          <el-divider />
          <div class="user-details">
            <div class="detail-item">
              <el-icon><User /></el-icon>
              <span>用户名：{{ userInfo.username }}</span>
            </div>
            <div class="detail-item">
              <el-icon><Calendar /></el-icon>
              <span>注册时间：2023-12-24</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 修改资料/密码卡片 -->
      <el-col :span="16">
        <el-card shadow="hover">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="info">
              <el-form :model="infoForm" label-width="100px" style="max-width: 500px; margin-top: 20px">
                <el-form-item label="用户昵称">
                  <el-input v-model="infoForm.nickname" />
                </el-form-item>
                <el-form-item label="手机号码">
                  <el-input v-model="infoForm.phone" />
                </el-form-item>
                <el-form-item label="电子邮箱">
                  <el-input v-model="infoForm.email" />
                </el-form-item>
                <el-form-item label="个人简介">
                  <el-input v-model="infoForm.intro" type="textarea" :rows="3" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdateInfo">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="安全设置" name="security">
              <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="100px" style="max-width: 500px; margin-top: 20px">
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input v-model="pwdForm.oldPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="pwdForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdatePwd">修改密码</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 头像裁剪对话框 -->
    <el-dialog
        v-model="cropperVisible"
        title="裁剪头像"
        width="600px"
        append-to-body
        destroy-on-close
    >
      <div class="cropper-wrapper">
        <div class="cropper-content">
          <vue-cropper
              ref="cropperRef"
              v-bind="cropperOption"
          />
        </div>
        <div class="preview-container">
          <div class="preview-title">预览</div>
          <div class="avatar-preview-round">
            <img :src="sourceImg" class="preview-img" v-if="sourceImg"  alt=""/>
          </div>
          <p class="preview-text">80x80px</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="cropperVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCropConfirm">确认上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { User, UserFilled, Calendar, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { getInfo, resetPassword, updateProfile } from '@/api/auth'
import { uploadAvatar } from '@/api/user'
import { VueCropper } from 'vue-cropper'

const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
const activeTab = ref('info')

// 头像上传相关
const cropperVisible = ref(false)
const cropperRef = ref()
const sourceImg = ref('')
const uploadRef = ref()

const triggerUpload = () => {
  const uploadInput = document.querySelector('.avatar-uploader input') as HTMLInputElement
  if (uploadInput) {
    uploadInput.click()
  }
}

const cropperOption = reactive({
  img: '', // 裁剪图片的地址
  outputSize: 1, // 裁剪生成图片的质量
  outputType: 'jpeg', // 裁剪生成图片的格式
  info: true, // 裁剪框的大小信息
  canScale: true, // 图片是否允许滚轮缩放
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixed: true, // 是否开启截图框宽高固定比例
  fixedNumber: [1, 1], // 截图框的宽高比例
  full: false, // 是否输出原图比例的截图
  fixedBox: true, // 固定截图框大小 不允许改变
  canMove: true, // 上传图片是否可以移动
  canMoveBox: false, // 截图框能否拖动
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  height: true, // 是否按照设备像素比生成
  infoTrue: false, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
  maxImgSize: 3000, // 限制图片最大宽度和高度
  enlarge: 1, // 图片根据截图框输出比例倍数
  mode: 'contain' // 图片默认渲染方式
})

// 选择文件
const handleAvatarChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw
  if (!file) return

  const isTypeOk = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const isSizeOk = file.size / 1024 / 1024 < 2

  if (!isTypeOk) {
    ElMessage.error('上传头像图片只能是 JPG/PNG/WEBP 格式!')
    return
  }
  if (!isSizeOk) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return
  }

  const reader = new FileReader()
  reader.onload = (e: any) => {
    sourceImg.value = e.target.result
    cropperOption.img = e.target.result
    cropperVisible.value = true
  }
  reader.readAsDataURL(file)
}

// 确认裁剪
const handleCropConfirm = () => {
  cropperRef.value.getCropBlob(async (blob: Blob) => {
    // 转换为 File 对象并统一格式为 jpeg
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

    const formData = new FormData()
    formData.append('file', file)

    try {
      // 1. 调用后端上传接口
      const res: any = await uploadAvatar(formData)
      const avatarUrl = res.data // 假设后端返回 data 字段为图片 URL

      // 2. 调用更新个人资料接口存入数据库
      await updateProfile({ avatar: avatarUrl })

      // 3. 更新本地显示
      userInfo.value.avatar = avatarUrl
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

      ElMessage.success('头像修改成功')
      cropperVisible.value = false
    } catch (error) {
      console.error('上传头像失败:', error)
      ElMessage.error('头像上传失败，请稍后重试')
    }
  })
}

const infoForm = reactive({
  nickname: userInfo.value.nickname,
  phone: '13800138000',
  email: userInfo.value.username + '@example.com',
  intro: '这个人很懒，什么都没写~'
})

const handleUpdateInfo = async () => {
  try {
    await updateProfile(infoForm)
    userInfo.value.nickname = infoForm.nickname
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    ElMessage.success('基本资料更新成功')
  } catch (error) {
    console.error('更新资料失败:', error)
  }
}

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const pwdFormRef = ref<FormInstance>()

const pwdRules = reactive<FormRules>({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== pwdForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

onMounted(async () => {
  try {
    const res: any = await getInfo()
    userInfo.value = res.data
    Object.assign(infoForm, {
      nickname: userInfo.value.nickname,
      phone: userInfo.value.phone || '13800138000',
      email: userInfo.value.email || userInfo.value.username + '@example.com',
      intro: userInfo.value.intro || '这个人很懒，什么都没写~'
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})

const handleUpdatePwd = async () => {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await resetPassword({
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword
        })
        ElMessage.success('密码修改成功')
        pwdFormRef.value?.resetFields()
      } catch (error) {
        console.error('修改密码失败:', error)
      }
    }
  })
}
</script>

<style scoped>
.profile-container {
  padding: 10px;
}

.profile-card {
  text-align: center;
  padding: 20px 0;
}

.user-avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.user-avatar {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ebeef5;
  transition: all 0.3s;
}

.user-avatar:hover {
  border-color: #409eff;
}

.avatar-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
}

.user-avatar:hover .avatar-hover {
  opacity: 1;
}

.avatar-uploader {
  display: none;
}

.cropper-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 400px;
}

.cropper-content {
  width: 400px;
  height: 400px;
}

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.preview-title {
  margin-bottom: 20px;
  font-weight: bold;
  color: #606266;
}

.avatar-preview-round {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #ebeef5;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-text {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.nickname {
  margin: 10px 0;
  font-size: 20px;
  color: #303133;
}

.role-tag {
  margin-bottom: 20px;
}

.user-details {
  text-align: left;
  padding: 0 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

</style>
