import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { drugsApi } from '@/api'
import { Drug } from '@/types'
import DrugCard from '@/components/DrugCard/DrugCard'
import LetterIndex from '@/components/LetterIndex/LetterIndex'
import styles from './DrugAll.module.css'

export default function DrugAll() {
  const navigate = useNavigate()
  const [activeLetter, setActiveLetter] = useState('A')
  const [drugs, setDrugs] = useState<Drug[]>([])
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const { data } = await drugsApi.list({ pageSize: 200 })
        setDrugs(data)
      } catch {
        // 静默降级为空列表
      }
    }
    fetchDrugs()
  }, [])

  const grouped = useMemo(() => {
    const groups: { letter: string; drugs: Drug[] }[] = []
    const sorted = [...drugs].sort((a, b) =>
      a.firstLetter.localeCompare(b.firstLetter) || a.pinyin.localeCompare(b.pinyin)
    )

    let currentLetter = ''
    let currentGroup: Drug[] = []

    sorted.forEach((drug) => {
      if (drug.firstLetter !== currentLetter) {
        if (currentGroup.length > 0) {
          groups.push({ letter: currentLetter, drugs: currentGroup })
        }
        currentLetter = drug.firstLetter
        currentGroup = [drug]
      } else {
        currentGroup.push(drug)
      }
    })

    if (currentGroup.length > 0) {
      groups.push({ letter: currentLetter, drugs: currentGroup })
    }

    return groups
  }, [drugs])

  const letters = useMemo(
    () => grouped.map((g) => g.letter),
    [grouped]
  )

  const handleLetterClick = useCallback((letter: string) => {
    setActiveLetter(letter)
    const el = groupRefs.current[letter]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.navbar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} data-tip="返回">
          <ArrowLeft size={24} />
        </button>
        <span className={styles.navTitle}>药品大全</span>
        <div className={styles.placeholder} />
      </div>

      <div className={styles.content}>
        <div className={styles.list}>
          {grouped.map((group) => (
            <div
              key={group.letter}
              ref={(el) => { groupRefs.current[group.letter] = el }}
            >
              <div className={styles.letterHeader}>{group.letter}</div>
              {group.drugs.map((drug) => (
                <DrugCard
                  key={drug.id}
                  drug={drug}
                  onClick={() => navigate(`/drug/${drug.id}`)}
                />
              ))}
            </div>
          ))}
        </div>
        <LetterIndex
          letters={letters}
          activeLetter={activeLetter}
          onLetterClick={handleLetterClick}
        />
      </div>
    </div>
  )
}
