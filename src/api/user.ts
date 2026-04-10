import request from '@/api/request'


export interface User {
    id?: number
    username: string
    nickname: string
    role: string
    status: number
    createTime?: string
    password?: string
}
export interface UserQuery {
    username?: string
    role?: string
    pageNum?: number
    pageSize?: number
}
export const updateUserStatus = (id: number, status: number) => {
    return request({
        url: `/api/users/${id}/status`,
        method: 'put',
        data: { status }
    })
}

export const deleteUser = (id: number) => {
    return request({
        url: `/api/users/${id}`,
        method: 'delete'
    })
}


export const getUserList = (params?: UserQuery) => {
    return request({
        url: '/api/users',
        method: 'get',
        params
    })
}

export const addUser = (data: User) => {
    return request({
        url: '/api/users',
        method: 'post',
        data: data
    })
}

export const updateUser= (id: number, data: Partial<User>)=> {
    return request({
        url: `/api/users/${id}`,
        method: 'put',
        data: data
    })
}

export const uploadAvatar = (data: FormData) => {
    return request({
        url: '/api/user/upload-avatar',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}