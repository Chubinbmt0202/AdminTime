import { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppstoreOutlined,
  TeamOutlined,
  HistoryOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  ApartmentOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  BellOutlined, // Thêm icon chuông
} from '@ant-design/icons'
import { useAuth } from '../auth/AuthContext'
import type { Role } from '../auth/auth.types'
import './Sidebar.css'

type NavItem = { key: string; label: string; icon: React.ReactNode; path: string }

function roleLabel(role: Role | null) {
  switch (role) {
    case 'giam_doc':
      return 'Giám đốc'
    case 'can_bo_nhan_su':
      return 'Cán bộ nhân sự'
    case 'quan_tri_vien':
      return 'Quản trị viên'
    default:
      return 'Tài khoản'
  }
}

// Dữ liệu thông báo mẫu
const mockNotifications = [
  { id: 1, text: 'Nguyễn Văn A vừa nộp đơn xin nghỉ phép.', time: '5 phút trước', unread: true },
  { id: 2, text: 'Trần Thị B đã điểm danh muộn.', time: '1 giờ trước', unread: true },
  { id: 3, text: 'Cập nhật hệ thống thành công.', time: '2 giờ trước', unread: false },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role } = useAuth()

  const navItems = useMemo<NavItem[]>(() => {
    // 1) Giám đốc: Tổng quan + Báo cáo và phân tích
    if (role === 'giam_doc') {
      return [
        { key: 'director-overview', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/director' },
        { key: 'director-reports', label: 'Báo cáo và phân tích', icon: <BarChartOutlined />, path: '/director/reports' },
      ]
    }

    // 2) Cán bộ nhân sự: Tổng quan (riêng) + nhân viên + chấm công + đơn xin nghỉ
    if (role === 'can_bo_nhan_su') {
      return [
        { key: 'hr-overview', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/hr' },
        { key: 'employees', label: 'Nhân viên', icon: <TeamOutlined />, path: '/employees' },
        { key: 'logs', label: 'Chấm công', icon: <HistoryOutlined />, path: '/logs' },
        { key: 'leave-requests', label: 'Đơn xin nghỉ', icon: <CalendarOutlined />, path: '/leave-requests' },
      ]
    }

    // 3) Quản trị viên: Tổng quan (riêng) + Tổ chức & nhân sự + Thiết lập chấm công + Giám sát an ninh + Cài đặt hệ thống
    if (role === 'quan_tri_vien') {
      return [
        { key: 'admin-overview', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/admin' },
        { key: 'admin-org-hr', label: 'Tổ chức và nhân sự', icon: <ApartmentOutlined />, path: '/admin/org-hr' },
        { key: 'admin-attendance', label: 'Thiết lập chấm công', icon: <RadarChartOutlined />, path: '/admin/attendance-setup' },
        { key: 'admin-security', label: 'Giám sát an ninh', icon: <SafetyCertificateOutlined />, path: '/admin/security' },
        { key: 'admin-system', label: 'Cài đặt hệ thống', icon: <SettingOutlined />, path: '/admin/system-settings' },
      ]
    }

    // Fallback (nhân viên hoặc chưa xác định)
    return [{ key: 'home', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/' }]
  }, [role])

  // State quản lý việc hiển thị popup thông báo
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Logic click ra ngoài để đóng popup thông báo
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const activeKey =
    navItems.find(item => {
      if (item.path === '/') return location.pathname === '/'
      return location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    })?.key ?? navItems[0]?.key ?? 'home'

  // Đếm số thông báo chưa đọc
  const unreadCount = mockNotifications.filter(n => n.unread).length

  return (
    <aside className="sidebar">
      {/* Logo / Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2" />
            <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.6" />
          </svg>
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">MindCheck</span>
          <span className="sidebar-brand-sub">{roleLabel(role)}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`sidebar-nav-item ${activeKey === item.key ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        {/* Giữ nút cài đặt chung cho HR (route /settings hiện có) */}
        {role === 'can_bo_nhan_su' && (
          <button
            className={`sidebar-nav-item ${location.pathname.startsWith('/settings') ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            <span className="sidebar-nav-icon"><SettingOutlined /></span>
            <span className="sidebar-nav-label">Cài đặt</span>
          </button>
        )}

        {/* User Info & Notification Area */}
        <div className="sidebar-user" ref={notifRef}>
          <div className="sidebar-user-profile">
            <div className="sidebar-user-avatar">
              {(user?.full_name || user?.username || 'U')
                .split(' ')
                .filter(Boolean)
                .slice(-2)
                .map(w => w[0]?.toUpperCase())
                .join('')}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.full_name || user?.username || 'User'}</span>
              <span className="sidebar-user-role">{roleLabel(role)}</span>
            </div>
          </div>

          <div className="sidebar-notif-wrapper">
            <button
              className={`sidebar-notif-btn ${showNotif ? 'active' : ''}`}
              onClick={() => setShowNotif(!showNotif)}
            >
              <BellOutlined />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {/* Notification Popup */}
            {showNotif && (
              <div className="notif-popup">
                <div className="notif-header">
                  <h4>Thông báo</h4>
                  <button className="mark-read-btn">Đánh dấu đã đọc</button>
                </div>
                <div className="notif-list">
                  {mockNotifications.map(n => (
                    <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                      <p className="notif-text">{n.text}</p>
                      <span className="notif-time">{n.time}</span>
                    </div>
                  ))}
                </div>
                <div className="notif-footer">
                  <button onClick={() => navigate('/logs')}>Xem tất cả</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}