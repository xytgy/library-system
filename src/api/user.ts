import request from './request'


export interface UserQuery {
    username?: string
    role?: string
    pageNum?: number
    pageSize?: number
}



export const getUserList = (params?: UserQuery) => {
    return request({
        url: '/api/users',
        method: 'get',
        params
    })
}