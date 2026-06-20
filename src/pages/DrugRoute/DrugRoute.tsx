import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Coffee, Syringe, Droplets, Wind } from 'lucide-react'
import styles from './DrugRoute.module.css'

const routes = [
  { icon: Coffee, label: '口服', type: '口服' },
  { icon: Syringe, label: '注射', type: '注射' },
  { icon: Droplets, label: '外用', type: '外用' },
  { icon: Wind, label: '吸入', type: '吸入' },
]

export default function DrugRoute() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.navbar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} data-tip="返回">
          <ArrowLeft size={24} />
        </button>
        <span className={styles.navTitle}>用药途径</span>
        <div className={styles.placeholder} />
      </div>

      <div className={styles.list}>
        {routes.map((route) => (
          <div
            key={route.type}
            className={styles.item}
            onClick={() => navigate(`/drug-category/route/${route.type}`)}
          >
            <div className={styles.iconBox}>
              <route.icon size={24} color="#0891B2" />
            </div>
            <span className={styles.label}>{route.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
