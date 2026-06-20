import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Eye, User, ChevronRight } from 'lucide-react'
import { articlesApi, commentsApi } from '@/api'
import type { Article, Comment } from '@/types'
import { formatTime } from '@/utils'
import CommentSection from '@/components/CommentSection/CommentSection'
import { useStore } from '@/store'
import styles from './ArticleDetail.module.css'

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLoggedIn } = useStore()
  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articleRes, commentsRes] = await Promise.all([
          articlesApi.detail(id!),
          commentsApi.list(id!),
        ])
        setArticle(articleRes.data)
        setComments(commentsRes.data)
      } catch {
        // 静默降级
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backBtn} data-tip="返回">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className={styles.notFound}>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backBtn} data-tip="返回">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className={styles.notFound}>
          <p>文章未找到</p>
        </div>
      </div>
    )
  }

  async function handleSubmitComment(content: string) {
    try {
      const { data } = await commentsApi.create(article!.id, content)
      setComments(prev => [data, ...prev])
    } catch {
      // 静默失败
    }
  }

  function handleLoginRequired() {
    navigate('/mine/login')
  }

  return (
    <div className={styles.container}>
      {/* 封面图 + 返回按钮 */}
      <div className={styles.coverWrapper}>
        <img src={article.coverImage} alt={article.title} className={styles.cover} 
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <button onClick={() => navigate(-1)} className={styles.backBtn} data-tip="返回">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className={styles.content}>
        {/* 标题 */}
        <h1 className={styles.title}>{article.title}</h1>

        {/* 元信息 */}
        <div className={styles.meta}>
          <span><User size={14} /> {article.author}</span>
          <span><Calendar size={14} /> {formatTime(article.publishedAt)}</span>
          <span><Eye size={14} /> {article.viewCount} 阅读</span>
          {article.source && <span className={styles.source}>{article.source}</span>}
        </div>

        {/* 标签 */}
        <div className={styles.tags}>
          {article.tags.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>

        {/* 正文 */}
        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* 分隔线 */}
        <div className={styles.divider} />

        {/* 评论区 */}
        <CommentSection
          comments={comments}
          isLoggedIn={isLoggedIn}
          onSubmitComment={handleSubmitComment}
          onLoginRequired={handleLoginRequired}
        />
      </div>
    </div>
  )
}
