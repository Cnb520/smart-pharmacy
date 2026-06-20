import { ChevronRight } from 'lucide-react'
import { Drug } from '@/types'
import styles from './DrugCard.module.css'

interface DrugCardProps {
  drug: Drug
  onClick: () => void
}

export default function DrugCard({ drug, onClick }: DrugCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <img
        className={styles.thumbnail}
        src={drug.imageUrls?.[0] || ''}
        alt={drug.name}
      />
      <div className={styles.info}>
        <span className={styles.name}>{drug.name}</span>
        <span className={styles.spec}>{drug.specification}</span>
        <span className={styles.manufacturer}>{drug.manufacturer}</span>
      </div>
      <ChevronRight className={styles.arrow} size={20} />
    </div>
  )
}
