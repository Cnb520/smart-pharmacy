import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { useStore } from '@/store'
import { formatTime } from '@/utils'
import styles from './History.module.css'

const TYPE_LABELS: Record<string, string> = {
  drug: '药品',
  article: '文章',
}

export default function History() {
  const { browseHistory, loadBrowseHistory } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadBrowseHistory()
  }, [])

  const sorted = [...browseHistory].reverse()

  const handleItemClick = (item: (typeof browseHistory)[0]) => {
    if (item.targetType === 'drug') {
      navigate(`/drug/${item.targetId}`)
    } else if (item.targetType === 'article') {
      navigate(`/article/${item.targetId}`)
    }
  }

  return (
    <div className={`page-content no-tab ${styles.page}`}>
      {/* 顶部导航 */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/mine')} data-tip="返回">
          <ArrowLeft size={22} />
        </button>
        <div className={styles.headerTitle}>浏览记录</div>
      </div>

      {/* 列表 */}
      <div className={styles.list}>
        {sorted.length === 0 ? (
          <div className={styles.empty}>
            <Clock size={48} strokeWidth={1.5} className={styles.emptyIcon} />
            <p className={styles.emptyText}>暂无浏览记录</p>
            <p className={styles.emptyHint}>浏览药品和文章后将出现在这里</p>
          </div>
        ) : (
          sorted.map((item) => (
            <div
              key={item.id}
              className={styles.item}
              onClick={() => handleItemClick(item)}
            >
              <div className={styles.thumbnail}>
                {item.coverImage ? (
                  <img
                    className={styles.thumbImg}
                    src={item.coverImage}
                    alt={item.title}
                  />
                ) : (
                  <Clock size={20} className={styles.thumbPlaceholder} />
                )}
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{item.title}</span>
                <div className={styles.itemMeta}>
                  <span className={styles.typeTag}>
                    {TYPE_LABELS[item.targetType] || item.targetType}
                  </span>
                  <span className={styles.time}>{formatTime(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
