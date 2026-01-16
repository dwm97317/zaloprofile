import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getMessageDetail, markMessageRead } from '../../api/message'
import Loading from '../../components/Loading/Index'
import './Detail.scss'

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

const MessageDetail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const messageId = searchParams.get('id')
  
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (messageId) {
      loadMessageDetail()
    }
  }, [messageId])

  const loadMessageDetail = async () => {
    try {
      setLoading(true)
      const res = await getMessageDetail(messageId)
      
      if (res.status === 200 && res.data) {
        setMessage(res.data.detail)
        
        // 如果是未读消息，标记为已读
        if (res.data.detail.is_read === 0) {
          await markMessageRead(messageId)
        }
      }
    } catch (error) {
      console.error('加载消息详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="message-detail-page">
      {/* Header */}
      <div className="detail-header">
        <div className="header-left" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="w-6 h-6" />
        </div>
        <div className="header-title">รายละเอียดข้อความ</div>
      </div>

      {/* Content */}
      {loading ? (
        <Loading is={true} />
      ) : message ? (
        <div className="detail-content">
          <div className="message-card">
            <div className="message-icon">
              <BellIcon className="w-8 h-8" />
            </div>
            <div className="message-time">
              {formatDate(message.created_time, 'DD/MM/YYYY HH:mm')}
            </div>
            <div className="message-body">
              {message.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="error-message">ไม่พบข้อความ</div>
      )}
    </div>
  )
}

export default MessageDetail
