import request from './request'


export const login = (data: any) => {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}