import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, AlertCircle, ShieldCheck, PackageOpen } from 'lucide-react'
import { drugsApi } from '@/api'
import type { Drug } from '@/types'
import { useStore } from '@/store'
import styles from './DrugDetail.module.css'

const sections = [
  { key: 'indication', label: '适应症', field: 'indication' as const },
  { key: 'usage', label: '用法用量', field: 'usage' as const },
  { key: 'adverseReactions', label: '不良反应', field: 'adverseReactions' as const },
  { key: 'contraindication', label: '禁忌', field: 'contraindication' as const },
  { key: 'precautions', label: '注意事项', field: 'precautions' as const },
  { key: 'storage', label: '贮藏', field: 'storage' as const },
  { key: 'validPeriod', label: '有效期', field: 'validPeriod' as const },
]

export default function DrugDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLoggedIn, isFavorited, toggleFavorite, favoriteFolders } = useStore()

  const [drug, setDrug] = useState<Drug | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['indication']))
  const [showFolderPicker, setShowFolderPicker] = useState(false)

  useEffect(() => {
    const fetchDrug = async () => {
      try {
        const { data } = await drugsApi.detail(id!)
        setDrug(data)
      } catch {
        // drug stays null
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDrug()
  }, [id])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backBtn} data-tip="返回">
            <ArrowLeft size={20} />
          </button>
          <span className={styles.headerTitle}>药品详情</span>
        </div>
        <div className={styles.notFound}>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (!drug) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backBtn} data-tip="返回">
            <ArrowLeft size={20} />
          </button>
          <span className={styles.headerTitle}>药品详情</span>
        </div>
        <div className={styles.notFound}>
          <PackageOpen size={48} color="#94A3B8" />
          <p>药品未找到</p>
        </div>
      </div>
    )
  }

  const favorited = isFavorited(drug.id)

  function toggleSection(key: string) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function handleToggleFavorite() {
    if (!isLoggedIn) {
      navigate('/mine/login')
      return
    }

    if (favorited) {
      toggleFavorite(drug!.id, favoriteFolders[0]?.id || '')
    } else {
      if (favoriteFolders.length === 1) {
        toggleFavorite(drug!.id, favoriteFolders[0].id)
      } else {
        setShowFolderPicker(true)
      }
    }
  }

  function handleSelectFolder(folderId: string) {
    toggleFavorite(drug!.id, folderId)
    setShowFolderPicker(false)
  }

  return (
    <div className={styles.container}>
      {/* 图片轮播 */}
      <div className={styles.imageCarousel}>
        {drug.imageUrls.length > 0 ? (
          <>
            <img
              src={drug.imageUrls[currentImage]}
              alt={drug.name}
              className={styles.drugImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23E2E8F0"><rect width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2394A3B8" font-size="14">暂无图片</text></svg>'
              }}
            />
            {drug.imageUrls.length > 1 && (
              <>
                <button
                  className={`${styles.carouselBtn} ${styles.prevBtn}`}
                  onClick={() => setCurrentImage(i => (i - 1 + drug.imageUrls.length) % drug.imageUrls.length)}
                  data-tip="上一张"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className={`${styles.carouselBtn} ${styles.nextBtn}`}
                  onClick={() => setCurrentImage(i => (i + 1) % drug.imageUrls.length)}
                  data-tip="下一张"
                >
                  <ChevronRight size={20} />
                </button>
                <div className={styles.dots}>
                  {drug.imageUrls.map((_, i) => (
                    <span
                      key={i}
                      className={`${styles.dot} ${i === currentImage ? styles.dotActive : ''}`}
                      onClick={() => setCurrentImage(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className={styles.noImage}>
            <PackageOpen size={48} color="#94A3B8" />
            <p>暂无图片</p>
          </div>
        )}
      </div>

      {/* 返回按钮 */}
      <button onClick={() => navigate(-1)} className={styles.backBtn} data-tip="返回">
        <ArrowLeft size={20} />
      </button>

      {/* 基本信息卡片 */}
      <div className={styles.content}>
        <div className={styles.infoCard}>
          <div className={styles.nameRow}>
            <h1 className={styles.drugName}>{drug.name}</h1>
            <span className={`${styles.prescriptionBadge} ${drug.isPrescription ? styles.rx : styles.otc}`}>
              {drug.isPrescription ? (
                <><AlertCircle size={14} /> 处方药</>
              ) : (
                <><ShieldCheck size={14} /> 非处方药</>
              )}
            </span>
          </div>
          <p className={styles.genericName}>{drug.genericName}</p>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>规格</span>
              <span className={styles.infoValue}>{drug.specification}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>剂型</span>
              <span className={styles.infoValue}>{drug.dosage}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>生产厂家</span>
              <span className={styles.infoValue}>{drug.manufacturer}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>批准文号</span>
              <span className={styles.infoValue}>{drug.approvalNo}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>分类</span>
              <span className={styles.infoValue}>{drug.categoryName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>用药途径</span>
              <span className={styles.infoValue}>{drug.routes.join('、')}</span>
            </div>
          </div>
        </div>

        {/* 说明书折叠面板 */}
        <div className={styles.infoCard}>
          <h2 className={styles.sectionTitle}>药品说明书</h2>
          {sections.map(section => (
            <div key={section.key} className={styles.accordion}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleSection(section.key)}
              >
                <span>{section.label}</span>
                <span className={`${styles.accordionArrow} ${expandedSections.has(section.key) ? styles.expanded : ''}`}>
                  <ChevronRight size={16} />
                </span>
              </button>
              {expandedSections.has(section.key) && (
                <div className={styles.accordionContent}>
                  <p>{drug[section.field]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 底部收藏栏 */}
      <div className={styles.bottomBar}>
        <button
          className={`${styles.favoriteBtn} ${favorited ? styles.favorited : ''}`}
          onClick={handleToggleFavorite}
        >
          <Heart size={20} fill={favorited ? '#EF4444' : 'none'} />
          <span>{favorited ? '已收藏' : '收藏'}</span>
        </button>
      </div>

      {/* 收藏夹选择弹窗 */}
      {showFolderPicker && (
        <div className={styles.overlay} onClick={() => setShowFolderPicker(false)}>
          <div className={styles.folderPicker} onClick={e => e.stopPropagation()}>
            <h3>选择收藏夹</h3>
            <div className={styles.folderList}>
              {favoriteFolders.map(folder => (
                <button
                  key={folder.id}
                  className={styles.folderItem}
                  onClick={() => handleSelectFolder(folder.id)}
                >
                  <span>{folder.name}</span>
                  <span className={styles.folderCount}>{folder.itemCount} 项</span>
                </button>
              ))}
            </div>
            <button className={styles.cancelBtn} onClick={() => setShowFolderPicker(false)}>
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
