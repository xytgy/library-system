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