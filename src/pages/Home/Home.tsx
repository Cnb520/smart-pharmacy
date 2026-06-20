import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { articlesApi } from '@/api'
import type { Article } from '@/types'
import SearchBar from '@/components/SearchBar/SearchBar'
import ArticleCard from '@/components/ArticleCard/ArticleCard'
import styles from './Home.module.css'

export default function Home() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await articlesApi.list(1, 10)
        setArticles(data)
      } catch {
        // 静默降级为空列表
      }
    }
    fetchArticles()
  }, [])

  return (
    <div className="page-content">
      <div className={styles.searchArea}>
        <SearchBar
          readOnly
          placeholder="搜索药品名称"
          onCameraClick={() => alert('拍照识药功能即将上线')}
          onAiClick={() => navigate('/ai-chat')}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>今日精选</span>
          <span className={styles.sectionMore}>查看更多</span>
        </div>
      </div>

      <div className={styles.articleList}>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => navigate(`/article/${article.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
