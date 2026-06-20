import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { drugsApi } from '@/api'
import type { Drug } from '@/types'
import { useStore } from '@/store'
import SearchBar from '@/components/SearchBar/SearchBar'
import DrugCard from '@/components/DrugCard/DrugCard'
import EmptyState from '@/components/EmptyState/EmptyState'
import styles from './Search.module.css'

export default function Search() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const { searchHistory, addSearchHistory, clearSearchHistory } = useStore()
  const [inputValue, setInputValue] = useState(keyword)
  const [searchResults, setSearchResults] = useState<Drug[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(
    async (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) {
        setSearchResults([])
        setSearchKeyword('')
        return
      }
      setSearchKeyword(trimmed)
      setLoading(true)
      try {
        const { data } = await drugsApi.list({ keyword: trimmed, pageSize: 200 })
        setSearchResults(data)
      } catch {
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const handleSearch = useCallback(
    async (value: string) => {
      // 清除防抖定时器，立即搜索
      if (debounceRef.current) clearTimeout(debounceRef.current)
      const trimmed = value.trim()
      if (!trimmed) return
      setInputValue(trimmed)
      addSearchHistory(trimmed)
      await doSearch(trimmed)
    },
    [addSearchHistory, doSearch],
  )

  // 输入变化时防抖搜索（300ms）
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setSearchResults([])
      setSearchKeyword('')
      return
    }
    // 如果和当前已搜索关键词相同，不需要重复搜索
    if (trimmed === searchKeyword) return
    debounceRef.current = setTimeout(() => {
      doSearch(trimmed)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [inputValue, searchKeyword, doSearch])

  // 从 URL 参数自动搜索
  useEffect(() => {
    if (keyword && !searchKeyword) {
      addSearchHistory(keyword)
      doSearch(keyword)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showResults = searchKeyword.trim().length > 0

  return (
    <div className="page-content no-tab">
      <div className={styles.searchArea}>
        <div className={styles.searchHeader}>
          <button onClick={() => navigate(-1)} className={styles.backBtn} data-tip="返回">
            <ArrowLeft size={20} />
          </button>
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputValue}
              readOnly={false}
              onChange={setInputValue}
              onSearch={handleSearch}
              onClear={() => {}}
              onCameraClick={() => alert('拍照识药功能即将上线')}
              onAiClick={() => navigate('/ai-chat')}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {showResults ? (
          loading ? (
            <EmptyState title="搜索中..." />
          ) : searchResults.length > 0 ? (
            <div className={styles.resultList}>
              {searchResults.map((drug) => (
                <DrugCard
                  key={drug.id}
                  drug={drug}
                  onClick={() => navigate(`/drug/${drug.id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="未找到相关药品"
              description="换个关键词试试吧"
            />
          )
        ) : (
          <div className={styles.historySection}>
            {searchHistory.length > 0 && (
              <>
                <div className={styles.historyHeader}>
                  <span className={styles.historyTitle}>搜索历史</span>
                  <button
                    className={styles.clearBtn}
                    onClick={clearSearchHistory}
                  >
                    清除
                  </button>
                </div>
                <div className={styles.historyList}>
                  {searchHistory.map((item, index) => (
                    <span
                      key={index}
                      className={styles.historyItem}
                      onClick={() => handleSearch(item)}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </>
            )}
            {searchHistory.length === 0 && (
              <EmptyState title="输入药品名称搜索" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
