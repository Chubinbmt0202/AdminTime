import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppstoreOutlined,
  TeamOutlined,
  HistoryOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
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

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, logout } = useAuth()

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
        // { key: 'admin-security', label: 'Giám sát an ninh', icon: <SafetyCertificateOutlined />, path: '/admin/security' },
        { key: 'shifts', label: 'Ca làm việc', icon: <ClockCircleOutlined />, path: '/admin/shifts' },

      ]
    }

    // Fallback (nhân viên hoặc chưa xác định)
    return [{ key: 'home', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/' }]
  }, [role])

  const activeKey = useMemo(() => {
    // Tìm item có path trùng khớp nhất (dài nhất)
    const sortedItems = [...navItems].sort((a, b) => b.path.length - a.path.length)
    const match = sortedItems.find(item => {
      if (item.path === '/') return location.pathname === '/'
      return location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    })
    return match?.key ?? navItems[0]?.key ?? 'home'
  }, [navItems, location.pathname])

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
        <button
          className={`sidebar-nav-item ${activeKey === 'settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          <span className="sidebar-nav-icon"><SettingOutlined /></span>
          <span className="sidebar-nav-label">Cài đặt</span>
        </button>
        <button
          className="sidebar-nav-item logout"
          onClick={logout}
        >
          <span className="sidebar-nav-icon"><LogoutOutlined /></span>
          <span className="sidebar-nav-label">Đăng xuất</span>
        </button>
      </div>

    </aside>
  )
}