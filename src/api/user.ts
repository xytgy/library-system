import request from "@/api/request.ts";

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