import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useStore } from '@/store'
import { authApi } from '@/api'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeText, setCodeText] = useState('获取验证码')
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [codeFocused, setCodeFocused] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [sending, setSending] = useState(false)
  const [logging, setLogging] = useState(false)

  const isValidPhone = /^1\d{10}$/.test(phone)
  const hasCode = code.trim().length === 6
  const canSubmit = isValidPhone && hasCode

  const handleGetCode = useCallback(async () => {
    if (!isValidPhone || sending) return
    setCodeError('')
    setSending(true)
    try {
      await authApi.sendCode(phone)
      setCodeSent(true)

      // 倒计时
      let count = 60
      setCodeText(`${count}s后重发`)
      const timer = setInterval(() => {
        count--
        if (count <= 0) {
          clearInterval(timer)
          setCodeText('获取验证码')
        } else {
          setCodeText(`${count}s后重发`)
        }
      }, 1000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '发送失败，请重试'
      setCodeError(msg)
    } finally {
      setSending(false)
    }
  }, [isValidPhone, sending, phone])

  const handleLogin = async () => {
    if (!canSubmit || logging) return
    setCodeError('')
    setLogging(true)
    try {
      await login(phone, code)
      navigate('/mine', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败，请重试'
      setCodeError(msg)
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className={`page-content no-tab ${styles.page}`}>
      {/* 顶部导航 */}
      <div className={styles.nav}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} data-tip="返回">
          <ArrowLeft size={22} />
        </button>
        <div className={styles.navTitle}>手机号登录</div>
      </div>

      {/* 表单 */}
      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <div
            className={`${styles.inputWrapper} ${phoneFocused ? styles.inputWrapperFocused : ''}`}
          >
            <input
              className={styles.input}
              type="tel"
              maxLength={11}
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
            />
          </div>
          {codeSent && !codeError && (
            <div className={styles.codeHint}>验证码已发送至 {phone}，请注意查收</div>
          )}
        </div>

        <div className={styles.inputGroup}>
          <div
            className={`${styles.inputWrapper} ${codeFocused ? styles.inputWrapperFocused : ''}`}
          >
            <input
              className={styles.input}
              type="text"
              maxLength={6}
              placeholder="请输入验证码"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onFocus={() => setCodeFocused(true)}
              onBlur={() => setCodeFocused(false)}
            />
            <button
              className={`${styles.codeBtn} ${(!isValidPhone || codeText !== '获取验证码' || sending) ? styles.codeBtnDisabled : ''}`}
              disabled={!isValidPhone || codeText !== '获取验证码' || sending}
              onClick={handleGetCode}
            >
              {sending ? '发送中...' : codeText}
            </button>
          </div>
          {codeError && <div className={styles.codeError}>{codeError}</div>}
        </div>

        <button
          className={`${styles.loginBtn} ${!canSubmit || logging ? styles.loginBtnDisabled : ''}`}
          disabled={!canSubmit || logging}
          onClick={handleLogin}
        >
          {logging ? '登录中...' : '登录'}
        </button>

        <div className={styles.tip}>
          未注册手机号登录后将自动创建账号
        </div>
      </div>
    </div>
  )
}
