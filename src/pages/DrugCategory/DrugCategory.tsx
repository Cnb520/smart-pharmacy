import { useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList, Stethoscope } from 'lucide-react'
import styles from './DrugCategory.module.css'

const cards = [
  {
    icon: BookOpen,
    title: '药品大全',
    desc: '按首字母A-Z检索全部药品',
    path: '/drug-category/all',
  },
  {
    icon: ClipboardList,
    title: '购买权限',
    desc: '按处方药/非处方药分类查找',
    path: '/drug-category/auth',
  },
  {
    icon: Stethoscope,
    title: '用药途径',
    desc: '按口服/注射/外用等途径查找',
    path: '/drug-category/route',
  },
]

export default function DrugCategory() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      {cards.map((card) => (
        <div
          key={card.path}
          className={styles.card}
          onClick={() => navigate(card.path)}
        >
          <div className={styles.iconBox}>
            <card.icon size={24} color="#fff" />
          </div>
          <div className={styles.cardContent}>
            <span className={styles.title}>{card.title}</span>
            <span className={styles.desc}>{card.desc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
