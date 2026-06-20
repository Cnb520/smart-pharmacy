import { useState } from 'react'
import { User, Send, MessageSquare } from 'lucide-react'
import { Comment } from '@/types'
import { formatTime } from '@/utils'
import styles from './CommentSection.module.css'

interface CommentSectionProps {
  comments: Comment[]
  isLoggedIn: boolean
  onSubmitComment: (content: string) => void
  onLoginRequired: () => void
}

export default function CommentSection({
  comments,
  isLoggedIn,
  onSubmitComment,
  onLoginRequired,
}: CommentSectionProps) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = () => {
    const content = inputValue.trim()
    if (!content) return
    onSubmitComment(content)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {comments.length === 0 ? (
          <div className={styles.empty}>
            <MessageSquare className={styles.emptyIcon} size={40} strokeWidth={1.5} />
            <span className={styles.emptyText}>暂无评论，来说两句吧</span>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              {comment.avatar ? (
                <img
                  className={styles.avatar}
                  src={comment.avatar}
                  alt={comment.nickname}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <User size={16} color="#bfbfbf" />
                </div>
              )}
              <div className={styles.commentBody}>
                <div className={styles.commentHeader}>
                  <span className={styles.nickname}>{comment.nickname}</span>
                  <span className={styles.time}>{formatTime(comment.createdAt)}</span>
                </div>
                <div className={styles.content}>{comment.content}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {isLoggedIn ? (
        <div className={styles.inputArea}>
          <input
            className={styles.input}
            placeholder="发表评论..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={styles.sendBtn}
            disabled={!inputValue.trim()}
            onClick={handleSubmit}
            data-tip="发送"
          >
            <Send size={16} />
          </button>
        </div>
      ) : (
        <div className={styles.loginHint} onClick={onLoginRequired}>
          <User size={14} />
          <span>请先登录后发表评论</span>
        </div>
      )}
    </div>
  )
}
