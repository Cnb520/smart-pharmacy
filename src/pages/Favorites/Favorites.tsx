import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, Trash2, X } from 'lucide-react'
import { useStore } from '@/store'
import styles from './Favorites.module.css'

export default function Favorites() {
  const { isLoggedIn, favoriteFolders, createFolder, deleteFolder, loadFavoriteFolders } = useStore()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadFavoriteFolders()
  }, [])

  if (!isLoggedIn) {
    navigate('/mine/login', { replace: true })
    return null
  }

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    createFolder(name)
    setNewName('')
    setShowCreate(false)
  }

  const handleDelete = (id: string) => {
    deleteFolder(id)
    setDeleteId(null)
  }

  const handleCardClick = (folderId: string) => {
    if (deleteId) {
      setDeleteId(null)
      return
    }
    navigate(`/mine/favorites/${folderId}`)
  }

  return (
    <div className={`page-content no-tab ${styles.page}`}>
      {/* 顶部导航 */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/mine')} data-tip="返回">
          <X size={22} />
        </button>
        <div className={styles.headerTitle}>我的收藏夹</div>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)} data-tip="新建收藏夹">
          <Plus size={22} />
        </button>
      </div>

      {/* 收藏夹列表 */}
      <div className={styles.list}>
        {favoriteFolders.length === 0 ? (
          <div className={styles.emptyList}>
            <p>暂无收藏夹</p>
            <button className={styles.emptyBtn} onClick={() => setShowCreate(true)}>
              创建一个
            </button>
          </div>
        ) : (
          favoriteFolders.map((folder) => (
            <div key={folder.id} className={styles.cardWrapper}>
              <div
                className={styles.card}
                onClick={() => handleCardClick(folder.id)}
              >
                <div className={styles.cardInfo}>
                  <span className={styles.cardName}>{folder.name}</span>
                  <span className={styles.cardCount}>
                    {folder.itemCount} 种药品
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(deleteId === folder.id ? null : folder.id)
                    }}
                    data-tip="删除"
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight size={20} className={styles.arrow} />
                </div>
              </div>
              {deleteId === folder.id && (
                <div className={styles.deleteConfirm}>
                  <span>确认删除？</span>
                  <button
                    className={styles.confirmBtn}
                    onClick={() => handleDelete(folder.id)}
                  >
                    删除
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setDeleteId(null)}
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 新建收藏夹弹窗 */}
      {showCreate && (
        <div className={styles.overlay} onClick={() => setShowCreate(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogTitle}>新建收藏夹</div>
            <input
              className={styles.dialogInput}
              placeholder="请输入收藏夹名称"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div className={styles.dialogActions}>
              <button
                className={styles.dialogCancel}
                onClick={() => {
                  setShowCreate(false)
                  setNewName('')
                }}
              >
                取消
              </button>
              <button
                className={styles.dialogConfirm}
                onClick={handleCreate}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
