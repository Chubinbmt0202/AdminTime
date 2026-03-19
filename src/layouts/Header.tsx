import { useEffect, useMemo, useRef, useState } from 'react';
import { BellFilled } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { UserOutlined } from '@ant-design/icons';
import './Header.css';

type NotificationItem = {
  id: number;
  title: string;
  time: string;
  unread: boolean;
};

const mockNotifications: NotificationItem[] = [
  { id: 1, title: 'Nguyễn Văn A vừa nộp đơn xin nghỉ phép.', time: '5 phút trước', unread: true },
  { id: 2, title: 'Trần Thị B đã điểm danh muộn.', time: '1 giờ trước', unread: true },
  { id: 3, title: 'Cập nhật hệ thống thành công.', time: '2 giờ trước', unread: false },
];

export default function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Dùng data giả lập giống hình hoặc lấy từ user context
  const displayName = user?.full_name || 'Nguyễn Văn Admin';
  const role = user?.role || 'HR DIRECTOR';

  const unreadCount = useMemo(() => mockNotifications.filter((n) => n.unread).length, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header className="app-header">
      {/* Left side: Breadcrumbs */}
      <div className="app-header-left">
        <div className="breadcrumbs">
          <span className="breadcrumb-item text-gray">Trang chủ</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item text-gray">Quản lý đơn từ</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item text-dark">Chi tiết đơn</span>
        </div>
      </div>

      {/* Right side: Notifications & Profile */}
      <div className="app-header-right" ref={wrapRef}>

        {/* Notification Bell */}
        <div className="header-notification-wrapper">
          <button className={`header-icon-btn ${open ? 'active' : ''}`} onClick={() => setOpen((v) => !v)}>
            <BellFilled className="bell-icon" />
            {unreadCount > 0 && <span className="header-dot"></span>}
          </button>

          {open && (
            <div className="header-popover">
              <div className="header-popover-head">
                <div className="header-popover-title">Thông báo</div>
                <button className="header-popover-link" onClick={() => setOpen(false)}>
                  Đóng
                </button>
              </div>
              <div className="header-popover-list">
                {mockNotifications.map((n) => (
                  <div key={n.id} className={`header-notif-item ${n.unread ? 'unread' : ''}`}>
                    <div className="header-notif-text">{n.title}</div>
                    <div className="header-notif-time">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="header-divider"></div>

        {/* User Profile */}
        <div className="header-profile">
          <div className="profile-text">
            <div className="profile-name">{displayName}</div>
          </div>
          <span><UserOutlined /></span>
        </div>

      </div>
    </header>
  );
}