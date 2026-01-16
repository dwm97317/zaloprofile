import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMessageList, markAllMessagesRead } from '../../api/message'
import Loading from '../../components/Loading/Index'
import './Index.scss'

// 图标组件
const ArrowLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
)

const BellIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

// 格式化日期函数
const formatDate = (dateStr, format = 'DD/MM/YYYY HH:mm') => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  
  const pad = (num) => String(num).padStart(2, '0')
  
  const replacements = {
    'YYYY': date.getFullYear(),
    'MM': pad(date.getMonth() + 1),
    'DD': pad(date.getDate()),
    'HH': pad(date.getHours()),
    'mm': pad(date.getMinutes()),
    'ss': pad(date.getSeconds())
  }
  
  let result = format
  Object.keys(replacements).forEach(key => {
    result = result.replace(key, replacements[key])
  })
  
  return result
}

const MessageIndex = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 加载消息列表
  const loadMessages = async (pageNum = 1) => {
    try {
      setLoading(true)
      const res = await getMessageList({ page: pageNum })
      
      if (res.status === 200 && res.data) {
        const newMessages = res.data.list?.data || []
        
        if (pageNum === 1) {
          setMessages(newMessages)
        } else {
          setMessages(prev => [...prev, ...newMessages])
        }
        
        setHasMore(newMessages.length >= 10)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('加载消息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages(1)
  }, [])

  // 全部已读
  const handleMarkAllRead = async () => {
    try {
      await markAllMessagesRead()
      // 更新本地状态
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: 1 })))
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 点击消息
  const handleMessageClick = (message) => {
    navigate(`/message/detail?id=${message.id}`)
  }

  // 格式化日期为小字显示
  const formatMessageDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes === 0 ? 'เมื่อสักครู่' : `${minutes} นาทีที่แล้ว`
      }
      return `${hours} ชั่วโมงที่แล้ว`
    } else if (days === 1) {
      return 'เมื่อวาน'
    } else if (days < 7) {
      return `${days} วันที่แล้ว`
    } else {
      return formatDate(dateStr, 'DD/MM/YYYY')
    }
  }

  return (
    <div className="message-page">
      {/* Header */}
      <div className="message-header">
        <div className="header-left" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="w-6 h-6" />
        </div>
        <div className="header-title">ข้อความ</div>
        <div className="header-right" onClick={handleMarkAllRead}>
          <span className="mark-all-read">อ่านทั้งหมด</span>
        </div>
      </div>

      {/* Message List */}
      <div className="message-list">
        {loading && page === 1 ? (
          <Loading is={true} />
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">ไม่มีข้อความ</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-item ${message.is_read === 0 ? 'unread' : 'read'}`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="message-icon">
                  <BellIcon className="w-6 h-6" />
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {message.content}
                  </div>
                  <div className="message-date">
                    {formatMessageDate(message.created_time)}
                  </div>
                </div>
                {message.is_read === 0 && (
                  <div className="unread-badge"></div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default MessageIndex
