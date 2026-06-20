import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, MessageSquare, Info } from 'lucide-react'

const faqList = [
  {
    q: '如何使用拍照识药？',
    a: '点击首页的拍照按钮，对准药品包装或药片进行拍照，系统将自动识别药品信息。请确保光线充足，药品包装上的文字清晰可见。',
  },
  {
    q: '如何收藏药品？',
    a: '在药品详情页点击收藏按钮，选择要放入的收藏夹即可。您可以在"我的-收藏夹"中管理已收藏的药品。',
  },
  {
    q: '如何查看浏览记录？',
    a: '您浏览过的药品和文章会自动记录在"我的-浏览记录"中，方便您随时回顾查找。',
  },
]

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    paddingBottom: 40,
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
  section: {
    margin: 12,
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottom: '1px solid #f0f0f0',
  },
  faqQuestion: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    cursor: 'pointer',
  },
  faqQText: {
    fontSize: 15,
    color: '#333',
    fontWeight: 500,
  },
  faqAnswer: {
    padding: '0 16px 16px',
    fontSize: 14,
    color: '#666',
    lineHeight: 1.6,
  },
  actions: {
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  feedbackBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 22,
    border: '1px solid #1a73e8',
    background: '#fff',
    color: '#1a73e8',
    fontSize: 15,
    cursor: 'pointer',
  },
  aboutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 22,
    border: '1px solid #e0e0e0',
    background: '#fff',
    color: '#666',
    fontSize: 15,
    cursor: 'pointer',
  },
}

export default function Help() {
  const navigate = useNavigate()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className={`page-content no-tab`} style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/mine')} data-tip="返回">
          <ArrowLeft size={22} />
        </button>
        <div style={styles.headerTitle}>帮助中心</div>
      </div>

      <div style={styles.section}>
        {faqList.map((faq, index) => (
          <div key={index} style={styles.faqItem}>
            <div style={styles.faqQuestion} onClick={() => toggleFaq(index)}>
              <span style={styles.faqQText}>{faq.q}</span>
              {expandedIndex === index ? (
                <ChevronUp size={18} color="#999" />
              ) : (
                <ChevronDown size={18} color="#999" />
              )}
            </div>
            {expandedIndex === index && (
              <div style={styles.faqAnswer}>{faq.a}</div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button
          style={styles.feedbackBtn}
          onClick={() => alert('感谢您的反馈！')}
        >
          <MessageSquare size={18} />
          意见反馈
        </button>
        <button
          style={styles.aboutBtn}
          onClick={() => alert('智慧药房 v1.0.0')}
        >
          <Info size={18} />
          关于我们
        </button>
      </div>
    </div>
  )
}
