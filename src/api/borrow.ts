import request from './request'

export const getRecentBorrows = () => {
    return request({
        url: '/api/borrows/recent',
        method: 'get'
    })
}

export const getStatistics = () => {
    return request({
        url: '/api/borrows/statistics',
        method: 'get'
    })
}
