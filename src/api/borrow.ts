import request from '@/api/request'

export interface BorrowRecord {
    id?: number
    bookId: number
    bookTitle: string
    userId: number
    username: string
    borrowDate: string
    dueDate: string
    returnDate?: string
    status: number // 0: 借阅中, 1: 已归还, 2: 已逾期
}

// 获取借阅列表
export const getBorrowList = (params?: any) => {
    return request({
        url: '/api/borrows',
        method: 'get',
        params
    })
}

// 借阅图书
export const borrowBook = (data: { bookId: number; userId: number }) => {
    return request({
        url: '/api/borrows',
        method: 'post',
        data
    })
}

// 归还图书
export const returnBook = (id: number) => {
    return request({
        url: `/api/borrows/${id}/return`,
        method: 'post'
    })
}



// 删除借阅记录
export const deleteBorrow = (id: number) => {
    return request({
        url: `/api/borrows/${id}`,
        method: 'delete'
    })
}