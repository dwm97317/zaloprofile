import request from '../utils/request'

/**
 * 站内信API
 */

// 获取站内信列表
export const getMessageList = (params) => {
  return request.get('/sitesms/lists', params)
}

// 获取站内信详情
export const getMessageDetail = (id) => {
  return request.get('/sitesms/detail', { id })
}

// 标记单条消息为已读
export const markMessageRead = (id) => {
  return request.post('/sitesms/read', { id })
}

// 标记全部消息为已读
export const markAllMessagesRead = () => {
  return request.post('/sitesms/readAll')
}

// 获取未读消息数量
export const getUnreadCount = () => {
  return request.get('/sitesms/unreadCount')
}
