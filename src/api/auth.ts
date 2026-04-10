import request from './request'

//登录
export const login = (data: any) => {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}


//发送验证码
export const sendVerifyCode = (email: string) => {
  return request({
    url: '/api/auth/verify-code',
    method: 'post',
    data: { email }
  })
}

// 获取当前用户信息
export const getInfo = () => {
  return request({
    url: '/api/auth/info',
    method: 'get'
  })
}

// 重置密码
export const resetPassword = (data: any) => {
  return request({
    url: '/api/auth/reset-password',
    method: 'post',
    data
  })
}

// 更新个人信息
export const updateProfile = (data: any) => {
  return request({
    url: '/api/auth/profile',
    method: 'put',
    data
  })
}