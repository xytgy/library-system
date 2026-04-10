import request from './request'


export interface Book {
    id?: number
    title: string
    author: string
    isbn: string
    categoryId?: number
    categoryName?: string
    publisher: string
    publishDate: string
    price: number
    stock: number
    description?: string
    cover?: string
}




export const getBookList = (params?: any) => {
    return request({
        url: '/api/books',
        method: 'get',
        params: params || {}
    })
}

// 获取图书详情
export const getBookById = (id: number) => {
    return request({
        url: `/api/books/${id}`,
        method: 'get'
    })
}

// 新增图书
export const addBook = (data: Book) => {
    return request({
        url: '/api/books',
        method: 'post',
        data
    })
}

// 更新图书
export const updateBook = (id: number, data: Partial<Book>) => {
    return request({
        url: `/api/books/${id}`,
        method: 'put',
        data
    })
}

// 删除图书
export const deleteBook = (id: number) => {
    return request({
        url: `/api/books/${id}`,
        method: 'delete'
    })
}