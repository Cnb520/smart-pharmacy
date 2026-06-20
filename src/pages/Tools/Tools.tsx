import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Ruler, FlaskConical, Baby } from 'lucide-react'

const tools = [
  { icon: Ruler, label: 'BMI 计算器', desc: '计算身体质量指数' },
  { icon: FlaskConical, label: '药物相互作用查询', desc: '查询药物间的相互作用' },
  { icon: Baby, label: '孕期用药查询', desc: '查询孕期用药安全性' },
]

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 48,
    padding: '0 8px',
    background: '#fff',
    borderBottom: '1px solid #eee',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#333',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: 17,
    fontWeight: 600,
    color: '#333',
    marginRight: 36,
  },
  list: {
    padding: 12,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    cursor: 'pointer',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 12,
    background: '#e8f0fe',
    color: '#1a73e8',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: 500,
    color: '#333',
  },
  desc: {
    fontSize: 12,
    color: '#999',
  },
}

export default function Tools() {
  const navigate = useNavigate()

  return (
    <div className={`page-content no-tab`} style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/mine')} data-tip="返回">
          <ArrowLeft size={22} />
        </button>
        <div style={styles.headerTitle}>医学工具</div>
      </div>

      <div style={styles.list}>
        {tools.map((tool) => (
          <div
            key={tool.label}
            style={styles.card}
            onClick={() => alert('功能即将上线')}
          >
            <div style={styles.iconWrapper}>
              <tool.icon size={22} />
            </div>
            <div style={styles.info}>
              <span style={styles.label}>{tool.label}</span>
              <span style={styles.desc}>{tool.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
