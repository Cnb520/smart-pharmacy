import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { drugsApi } from '@/api'
import { Drug } from '@/types'
import DrugCard from '@/components/DrugCard/DrugCard'
import styles from './DrugRouteList.module.css'

export default function DrugRouteList() {
  const navigate = useNavigate()
  const { type } = useParams<{ type: string }>()
  const [drugs, setDrugs] = useState<Drug[]>([])

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const { data } = await drugsApi.list({
          route: type,
          pageSize: 200,
        })
        setDrugs(data)
      } catch {
        // 静默降级为空列表
      }
    }
    if (type) fetchDrugs()
  }, [type])

  const grouped = useMemo(() => {
    const categoryMap: Record<string, Drug[]> = {}
    drugs.forEach((drug) => {
      if (!categoryMap[drug.categoryName]) {
        categoryMap[drug.categoryName] = []
      }
      categoryMap[drug.categoryName].push(drug)
    })

    Object.keys(categoryMap).forEach((key) => {
      categoryMap[key].sort((a, b) => a.pinyin.localeCompare(b.pinyin))
    })

    return Object.entries(categoryMap)
  }, [drugs])

  return (
    <div className={styles.page}>
      <div className={styles.navbar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} data-tip="返回">
          <ArrowLeft size={24} />
        </button>
        <span className={styles.navTitle}>{type}</span>
        <div className={styles.placeholder} />
      </div>

      <div className={styles.list}>
        {grouped.map(([categoryName, categoryDrugs]) => (
          <div key={categoryName}>
            <div className={styles.categoryHeader}>{categoryName}</div>
            {categoryDrugs.map((drug) => (
              <DrugCard
                key={drug.id}
                drug={drug}
                onClick={() => navigate(`/drug/${drug.id}`)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
