import request from './request'

export interface Category {
    id?: number
    name: string
    code: string
    description?: string
    createTime?: string
}

// 获取分类列表
export const getCategoryList = (params?: any) => {
    return request({
        url: '/api/categories',
        method: 'get',
        params
    })
}

// 新增分类
export const addCategory = (data: Category) => {
    return request({
        url: '/api/categories',
        method: 'post',
        data
    })
}

// 更新分类
export const updateCategory = (id: number, data: Partial<Category>) => {
    return request({
        url: `/api/categories/${id}`,
        method: 'put',
        data
    })
}

// 删除分类
export const deleteCategory = (id: number) => {
    return request({
        url: `/api/categories/${id}`,
        method: 'delete'
    })
}
