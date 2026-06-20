import { PackageOpen, type LucideIcon } from 'lucide-react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionText?: string
  onAction?: () => void
}

const iconMap: Record<string, LucideIcon> = {
  PackageOpen,
}

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  const IconComponent = icon ? iconMap[icon] || PackageOpen : PackageOpen

  return (
    <div className={styles.container}>
      <IconComponent className={styles.icon} size={48} strokeWidth={1.5} />
      <div className={styles.title}>{title}</div>
      {description && <div className={styles.description}>{description}</div>}
      {actionText && onAction && (
        <button className={styles.actionBtn} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  )
}
