import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppstoreOutlined,
  TeamOutlined,
  HistoryOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import './Sidebar.css'

const navItems = [
  { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/' },
  { key: 'employees', label: 'Nhân viên', icon: <TeamOutlined />, path: '/employees' },
  { key: 'logs', label: 'Chấm công', icon: <HistoryOutlined />, path: '/logs' },
  { key: 'leave-requests', label: 'Đơn xin nghỉ', icon: <CalendarOutlined />, path: '/leave-requests' },
  { key: 'reports', label: 'Báo cáo', icon: <BarChartOutlined />, path: '/reports' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const activeKey = navItems.find(item => item.path === location.pathname)?.key ?? 'dashboard'

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
          <span className="sidebar-brand-sub">Tài khoản Admin</span>
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
          <span className="sidebar-nav-label">Settings</span>
        </button>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">AR</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">Alex Rivera</span>
            <span className="sidebar-user-role">Super Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
