import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Pill, ShieldCheck } from 'lucide-react'
import styles from './DrugAuth.module.css'

const entries = [
  {
    icon: Pill,
    title: '处方药',
    desc: '需医师开具处方方可购买',
    path: '/drug-category/auth/prescription',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
  },
  {
    icon: ShieldCheck,
    title: '非处方药',
    desc: '无需处方，可自行购买使用',
    path: '/drug-category/auth/otc',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
]

export default function DrugAuth() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.navbar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} data-tip="返回">
          <ArrowLeft size={24} />
        </button>
        <span className={styles.navTitle}>购买权限</span>
        <div className={styles.placeholder} />
      </div>

      <div className={styles.grid}>
        {entries.map((entry) => (
          <div
            key={entry.path}
            className={styles.card}
            onClick={() => navigate(entry.path)}
          >
            <div
              className={styles.iconBox}
              style={{ background: entry.gradient }}
            >
              <entry.icon size={32} color="#fff" />
            </div>
            <span className={styles.title}>{entry.title}</span>
            <span className={styles.desc}>{entry.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
