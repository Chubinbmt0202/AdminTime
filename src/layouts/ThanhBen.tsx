import { useMemo, useState, useEffect } from 'react'
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
  LogoutOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { ref, onValue, query, limitToLast, get, update } from 'firebase/database'
import { database } from '../config/cauHinhFirebase'
import { useXacThuc } from '../auth/ContextXacThuc'
import type { Role } from '../auth/kieuXacThuc'
import './ThanhBen.css'

type NavItem = { key: string; label: string; icon: React.ReactNode; path: string }

function nhanVaiTro(role: Role | null) {
  switch (role) {
    case 'Director':
      return 'Giám đốc'
    case 'HR':
      return 'Cán bộ nhân sự'
    case 'Admin':
      return 'Quản trị viên'
    default:
      return 'Tài khoản'
  }
}

export default function ThanhBen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, logout } = useXacThuc()
  console.log("role", role)

  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!role || role === 'Employee') {
      return
    }

    const notifRef = ref(database, 'admin_notifications')
    const notifQuery = query(notifRef, limitToLast(50))

    const unsubscribe = onValue(notifQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
        setNotifications(list)
      } else {
        setNotifications([])
      }
    })

    return () => {
      unsubscribe()
    }
  }, [role])

  const danhDauDaDocThongBao = async (type: 'LEAVE_REQUEST' | 'OVERTIME_REQUEST' | 'LATE_EXPLANATION') => {
    try {
      const notifRef = ref(database, 'admin_notifications')
      const snapshot = await get(notifRef)
      if (snapshot.exists()) {
        const updates: any = {}
        snapshot.forEach((child) => {
          const key = child.key
          const val = child.val()
          if (val && val.loai_thong_bao === type && !val.da_doc) {
            updates[`${key}/da_doc`] = true
          }
        })
        if (Object.keys(updates).length > 0) {
          await update(notifRef, updates)
        }
      }
    } catch (error) {
      console.error(`Lỗi khi đánh dấu đã đọc thông báo loại ${type}:`, error)
    }
  }

  useEffect(() => {
    if (location.pathname.startsWith('/leave-requests')) {
      danhDauDaDocThongBao('LEAVE_REQUEST')
    } else if (location.pathname.startsWith('/overtime-requests')) {
      danhDauDaDocThongBao('OVERTIME_REQUEST')
    } else if (location.pathname.startsWith('/late-explanations')) {
      danhDauDaDocThongBao('LATE_EXPLANATION')
    }
  }, [location.pathname])

  const soLuongThongBaoNghiPhep = useMemo(() => {
    return notifications.filter(n => n.loai_thong_bao === 'LEAVE_REQUEST' && !n.da_doc).length
  }, [notifications])

  const soLuongThongBaoTangCa = useMemo(() => {
    return notifications.filter(n => n.loai_thong_bao === 'OVERTIME_REQUEST' && !n.da_doc).length
  }, [notifications])

  const soLuongThongBaoGiaiTrinh = useMemo(() => {
    return notifications.filter(n => n.loai_thong_bao === 'LATE_EXPLANATION' && !n.da_doc).length
  }, [notifications])

  const navItems = useMemo<NavItem[]>(() => {
    // 1) Giám đốc: Tổng quan + Báo cáo và phân tích
    if (role === 'Director') {
      return [
        { key: 'director-overview', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/director' },
        { key: 'director-reports', label: 'Báo cáo và phân tích', icon: <BarChartOutlined />, path: '/director/reports' },
      ]
    }

    // 2) Cán bộ nhân sự: Tổng quan (riêng) + nhân viên + chấm công + đơn xin nghỉ
    if (role === 'HR') {
      return [
        { key: 'hr-overview', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/hr' },
        { key: 'employees', label: 'Nhân viên', icon: <TeamOutlined />, path: '/employees' },
        { key: 'logs', label: 'Chấm công', icon: <HistoryOutlined />, path: '/logs' },
        { key: 'leave-requests', label: 'Đơn xin nghỉ', icon: <CalendarOutlined />, path: '/leave-requests' },
        { key: 'overtime-requests', label: 'Đơn xin tăng ca', icon: <ClockCircleOutlined />, path: '/overtime-requests' },
        { key: 'late-explanations', label: 'Giải trình đi trễ', icon: <HistoryOutlined />, path: '/late-explanations' },
        { key: 'leave-types', label: 'Thiết lập đơn từ', icon: <SettingOutlined />, path: '/leave-types' },
      ]
    }

    // 3) Quản trị viên: Tổng quan (riêng) + Tổ chức & nhân sự + Thiết lập chấm công + Giám sát an ninh + Cài đặt hệ thống
    if (role === 'Admin') {
      return [
        { key: 'admin-overview', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/admin' },
        { key: 'admin-org-hr', label: 'Tổ chức và nhân sự', icon: <ApartmentOutlined />, path: '/admin/org-hr' },
        { key: 'employees', label: 'Nhân viên', icon: <TeamOutlined />, path: '/employees' },
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
          <span className="sidebar-brand-sub">{nhanVaiTro(role)}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          let count = 0
          if (item.key === 'leave-requests') {
            count = soLuongThongBaoNghiPhep
          } else if (item.key === 'overtime-requests') {
            count = soLuongThongBaoTangCa
          } else if (item.key === 'late-explanations') {
            count = soLuongThongBaoGiaiTrinh
          }

          return (
            <button
              key={item.key}
              className={`sidebar-nav-item ${activeKey === item.key ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {count > 0 && <span className="sidebar-badge">{count}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
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