import request from "./request";

export const getBookList = (params?: any) => {
    return request({
        url: '/api/books',
        method: 'get',
        params: params || {} // 确保 params 始终是一个对象
    })
}