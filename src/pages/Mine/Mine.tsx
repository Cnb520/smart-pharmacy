import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Smartphone,
  MessageCircle,
  User,
  FolderHeart,
  Clock,
  Stethoscope,
  HelpCircle,
  ChevronRight,
  X,
  RefreshCw,
  Pencil,
} from 'lucide-react'
import { useStore } from '@/store'
import styles from './Mine.module.css'

const WECHAT_MOCK_NICKNAMES = ['清风徐来', '岁月静好', '阳光灿烂', '春暖花开', '心之所向', '星辰大海', '雨过天晴', '宁静致远']
const WECHAT_MOCK_AVATARS = [
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=健康医疗风格微信头像,圆形,简约清新&image_size=square',
]

function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone
  return phone.slice(0, 3) + '****' + phone.slice(7)
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function Mine() {
  const { isLoggedIn, user, favoriteFolders, wechatLogin, logout, updateProfile } = useStore()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showQrLogin, setShowQrLogin] = useState(false)
  const [qrStatus, setQrStatus] = useState<'pending' | 'scanned' | 'expired'>('pending')
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 编辑资料
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [saving, setSaving] = useState(false)

  const openEditProfile = () => {
    setEditName(user?.nickname || '')
    setEditAvatar(user?.avatar || '')
    setShowEditProfile(true)
  }

  const handleSaveProfile = async () => {
    if (!editName.trim() || saving) return
    setSaving(true)
    try {
      await updateProfile({ nickname: editName.trim(), avatar: editAvatar.trim() || undefined })
      setShowEditProfile(false)
    } catch {
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    setShowLogoutConfirm(false)
  }

  const doWechatLogin = () => {
    const wxOpenId = 'wx_' + Date.now().toString(36)
    const nickname = randomPick(WECHAT_MOCK_NICKNAMES)
    const avatar = randomPick(WECHAT_MOCK_AVATARS)
    wechatLogin(wxOpenId, nickname, avatar)
    setShowQrLogin(false)
  }

  const handleWechatLogin = () => {
    setShowQrLogin(true)
    setQrStatus('pending')

    // 30秒后二维码过期
    expireTimerRef.current = setTimeout(() => {
      setQrStatus(prev => prev === 'pending' ? 'expired' : prev)
    }, 30000)
  }

  const handleSimulateScan = () => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current)
    setQrStatus('scanned')
    // 扫描成功后短暂延迟再登录
    setTimeout(doWechatLogin, 800)
  }

  const handleCloseQr = () => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current)
    setShowQrLogin(false)
    setQrStatus('pending')
  }

  const handleRefreshQr = () => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current)
    setQrStatus('pending')
    expireTimerRef.current = setTimeout(() => {
      setQrStatus(prev => prev === 'pending' ? 'expired' : prev)
    }, 30000)
  }

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (expireTimerRef.current) clearTimeout(expireTimerRef.current)
    }
  }, [])

  return (
    <div className={`page-content ${styles.page}`}>
      {!isLoggedIn ? (
        <>
          {/* 品牌 Logo 区 */}
          <div className={styles.brandSection}>
            <div className={styles.logoIcon}>💊</div>
            <h1 className={styles.brandName}>智慧药房</h1>
            <p className={styles.brandSlogan}>您的随身用药助手</p>
          </div>

          {/* 登录引导卡片 */}
          <div className={styles.loginCard}>
            <div className={styles.loginCardTitle}>登录后享受更多功能</div>
            <div className={styles.loginCardDesc}>收藏药品、查看浏览记录</div>
            <div className={styles.loginButtons}>
              <button
                className={styles.phoneLoginBtn}
                onClick={() => navigate('/mine/login')}
              >
                <Smartphone size={20} />
                <span>手机号登录</span>
              </button>
              <button
                className={styles.wechatLoginBtn}
                onClick={handleWechatLogin}
              >
                <MessageCircle size={20} />
                <span>微信登录</span>
              </button>
            </div>
          </div>

          {/* 隐私协议 */}
          <div className={styles.privacySection}>
            <span
              className={styles.privacyLink}
              onClick={() => alert('隐私协议页面')}
            >
              《隐私政策》
            </span>
            <span className={styles.privacyDivider}>|</span>
            <span
              className={styles.privacyLink}
              onClick={() => alert('用户协议页面')}
            >
              《用户协议》
            </span>
          </div>
        </>
      ) : (
        <>
          {/* 个人信息区 */}
          <div className={styles.userHeader} onClick={openEditProfile}>
            <div className={styles.avatarWrapper}>
              {user?.avatar ? (
                <img
                  className={styles.avatar}
                  src={user.avatar}
                  alt="头像"
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <User size={32} />
                </div>
              )}
              <div className={styles.avatarEditBadge}>
                <Pencil size={12} />
              </div>
            </div>
            <div className={styles.userInfo}>
              <div className={styles.nickname}>
                {user?.nickname || '用户'}
                <Pencil size={14} className={styles.editIcon} />
              </div>
              <div className={styles.phone}>{user?.phone ? maskPhone(user.phone) : ''}</div>
            </div>
          </div>

          {/* 功能列表 */}
          <div className={styles.menuList}>
            <div
              className={styles.menuItem}
              onClick={() => navigate('/mine/favorites')}
            >
              <div className={styles.menuLeft}>
                <FolderHeart size={22} className={styles.menuIcon} />
                <span className={styles.menuLabel}>收藏夹</span>
              </div>
              <div className={styles.menuRight}>
                <span className={styles.menuCount}>
                  {favoriteFolders.length} 个收藏夹
                </span>
                <ChevronRight size={18} className={styles.menuArrow} />
              </div>
            </div>

            <div
              className={styles.menuItem}
              onClick={() => navigate('/mine/history')}
            >
              <div className={styles.menuLeft}>
                <Clock size={22} className={styles.menuIcon} />
                <span className={styles.menuLabel}>浏览记录</span>
              </div>
              <div className={styles.menuRight}>
                <ChevronRight size={18} className={styles.menuArrow} />
              </div>
            </div>

            <div
              className={styles.menuItem}
              onClick={() => navigate('/mine/tools')}
            >
              <div className={styles.menuLeft}>
                <Stethoscope size={22} className={styles.menuIcon} />
                <span className={styles.menuLabel}>医学工具</span>
              </div>
              <div className={styles.menuRight}>
                <ChevronRight size={18} className={styles.menuArrow} />
              </div>
            </div>

            <div
              className={styles.menuItem}
              onClick={() => navigate('/mine/help')}
            >
              <div className={styles.menuLeft}>
                <HelpCircle size={22} className={styles.menuIcon} />
                <span className={styles.menuLabel}>帮助中心</span>
              </div>
              <div className={styles.menuRight}>
                <ChevronRight size={18} className={styles.menuArrow} />
              </div>
            </div>
          </div>

          {/* 退出登录 */}
          <div className={styles.logoutSection}>
            <button
              className={styles.logoutBtn}
              onClick={() => setShowLogoutConfirm(true)}
            >
              退出登录
            </button>
          </div>
        </>
      )}

      {/* 退出登录确认弹窗 */}
      {showLogoutConfirm && (
        <div className={styles.overlay} onClick={() => setShowLogoutConfirm(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogTitle}>确认退出</div>
            <div className={styles.dialogDesc}>退出后需要重新登录</div>
            <div className={styles.dialogActions}>
              <button
                className={styles.dialogCancel}
                onClick={() => setShowLogoutConfirm(false)}
              >
                取消
              </button>
              <button
                className={styles.dialogConfirm}
                onClick={handleLogout}
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 微信扫码登录弹窗 */}
      {showQrLogin && (
        <div className={styles.overlay}>
          <div className={styles.qrDialog}>
            {/* 顶部标题栏 */}
            <div className={styles.qrHeader}>
              <div className={styles.qrHeaderLeft}>
                <MessageCircle size={22} color="#07C160" />
                <span className={styles.qrHeaderTitle}>微信登录</span>
              </div>
              <button className={styles.qrClose} onClick={handleCloseQr} data-tip="关闭">
                <X size={20} />
              </button>
            </div>

            {/* 二维码区域 */}
            <div className={styles.qrBody}>
              <div className={`${styles.qrCodeWrapper} ${qrStatus === 'expired' ? styles.qrExpired : ''} ${qrStatus === 'scanned' ? styles.qrScanned : ''}`}>
                {qrStatus === 'pending' && (
                  <>
                    {/* SVG 模拟二维码 */}
                    <svg className={styles.qrSvg} viewBox="0 0 200 200" width="180" height="180">
                      {/* QR码背景 */}
                      <rect width="200" height="200" fill="#fff" rx="8" />
                      {/* 定位图案 - 左上 */}
                      <rect x="10" y="10" width="54" height="54" fill="#000" rx="6" />
                      <rect x="16" y="16" width="42" height="42" fill="#fff" rx="4" />
                      <rect x="22" y="22" width="30" height="30" fill="#000" rx="2" />
                      {/* 定位图案 - 右上 */}
                      <rect x="136" y="10" width="54" height="54" fill="#000" rx="6" />
                      <rect x="142" y="16" width="42" height="42" fill="#fff" rx="4" />
                      <rect x="148" y="22" width="30" height="30" fill="#000" rx="2" />
                      {/* 定位图案 - 左下 */}
                      <rect x="10" y="136" width="54" height="54" fill="#000" rx="6" />
                      <rect x="16" y="142" width="42" height="42" fill="#fff" rx="4" />
                      <rect x="22" y="148" width="30" height="30" fill="#000" rx="2" />
                      {/* 模拟数据区域 */}
                      {Array.from({ length: 25 }, (_, i) => {
                        const row = Math.floor(i / 5)
                        const col = i % 5
                        return (
                          <rect
                            key={i}
                            x={76 + col * 10}
                            y={76 + row * 10}
                            width={6}
                            height={6}
                            fill={Math.random() > 0.5 ? '#000' : 'none'}
                            rx="1"
                          />
                        )
                      })}
                      {/* 微信Logo中心 */}
                      <rect x="80" y="80" width="40" height="40" fill="#fff" rx="6" />
                      <circle cx="92" cy="96" r="8" fill="#07C160" />
                      <circle cx="108" cy="96" r="8" fill="#07C160" />
                      <ellipse cx="100" cy="108" rx="12" ry="6" fill="#07C160" />
                    </svg>
                    <div className={styles.qrHint}>
                      <RefreshCw size={14} className={styles.qrHintIcon} />
                      请使用微信扫一扫登录
                    </div>
                    <button className={styles.qrSimulateBtn} onClick={handleSimulateScan}>
                      模拟扫码成功
                    </button>
                  </>
                )}

                {qrStatus === 'scanned' && (
                  <>
                    <svg className={styles.qrSvg} viewBox="0 0 200 200" width="180" height="180">
                      <rect width="200" height="200" fill="#f0fdf4" rx="8" />
                      <circle cx="100" cy="90" r="30" fill="#07C160" />
                      <path d="M88 95 L96 103 L112 87" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="100" y="145" textAnchor="middle" fill="#07C160" fontSize="15" fontWeight="600">扫描成功</text>
                      <text x="100" y="165" textAnchor="middle" fill="#999" fontSize="12">正在登录...</text>
                    </svg>
                  </>
                )}

                {qrStatus === 'expired' && (
                  <>
                    <svg className={styles.qrSvg} viewBox="0 0 200 200" width="180" height="180">
                      <rect width="200" height="200" fill="#f5f5f5" rx="8" />
                      <circle cx="100" cy="90" r="24" fill="#ddd" />
                      <text x="100" y="95" textAnchor="middle" fill="#999" fontSize="28" fontWeight="700">!</text>
                      <text x="100" y="135" textAnchor="middle" fill="#999" fontSize="14">二维码已过期</text>
                    </svg>
                    <button className={styles.qrRefreshBtn} onClick={handleRefreshQr}>
                      <RefreshCw size={14} />
                      点击刷新
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑资料弹窗 */}
      {showEditProfile && (
        <div className={styles.overlay} onClick={() => setShowEditProfile(false)}>
          <div className={styles.editDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.editDialogTitle}>编辑资料</div>

            {/* 头像编辑 */}
            <div className={styles.editAvatarSection}>
              <div className={styles.editAvatarPreview}>
                {editAvatar ? (
                  <img src={editAvatar} alt="头像预览" className={styles.editAvatarImg} />
                ) : (
                  <div className={styles.editAvatarPlaceholder}>
                    <User size={36} />
                  </div>
                )}
              </div>
              <div className={styles.editAvatarInput}>
                <label className={styles.editLabel}>头像链接</label>
                <input
                  className={styles.editInput}
                  type="text"
                  placeholder="输入头像图片URL"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                />
              </div>
            </div>

            {/* 昵称编辑 */}
            <div className={styles.editField}>
              <label className={styles.editLabel}>昵称</label>
              <input
                className={styles.editInput}
                type="text"
                maxLength={20}
                placeholder="请输入昵称"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            {/* 按钮 */}
            <div className={styles.editActions}>
              <button
                className={styles.editCancel}
                onClick={() => setShowEditProfile(false)}
              >
                取消
              </button>
              <button
                className={styles.editSave}
                disabled={!editName.trim() || saving}
                onClick={handleSaveProfile}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
