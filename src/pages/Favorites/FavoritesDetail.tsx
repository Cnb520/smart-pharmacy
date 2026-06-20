import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, PackageOpen } from 'lucide-react'
import { useStore } from '@/store'
import { favoritesApi } from '@/api'
import type { Drug } from '@/types'
import DrugCard from '@/components/DrugCard/DrugCard'
import styles from './FavoritesDetail.module.css'

export default function FavoritesDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { favoriteFolders } = useStore()
  const [drugList, setDrugList] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)

  const folder = useMemo(
    () => favoriteFolders.find((f) => f.id === id),
    [favoriteFolders, id],
  )

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await favoritesApi.getItems(id!)
        setDrugList(data)
      } catch {
        // 静默降级为空列表
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchItems()
  }, [id])

  return (
    <div className={`page-content no-tab ${styles.page}`}>
      {/* 顶部导航 */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/mine/favorites')} data-tip="返回">
          <ArrowLeft size={22} />
        </button>
        <div className={styles.headerTitle}>{folder?.name || '收藏夹详情'}</div>
      </div>

      {/* 内容区 */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.empty}>
            <p>加载中...</p>
          </div>
        ) : drugList.length === 0 ? (
          <div className={styles.empty}>
            <PackageOpen size={48} strokeWidth={1.5} className={styles.emptyIcon} />
            <p className={styles.emptyText}>收藏夹为空</p>
            <p className={styles.emptyHint}>浏览药品时可以添加到收藏夹</p>
          </div>
        ) : (
          <div className={styles.list}>
            {drugList.map((drug) => (
              <DrugCard
                key={drug.id}
                drug={drug}
                onClick={() => navigate(`/drug/${drug.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
