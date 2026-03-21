import { useEffect, useMemo, useRef, useState } from 'react';
import { BellFilled } from '@ant-design/icons';
import { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import avatarImg from '../assets/images/avatar.png';
import './Header.css';
import Breadcrumb from '../components/common/Breadcrumb/Breadcrumb';

type NotificationItem = {
  id: number;
  title: string;
  time: string;
  unread: boolean;
  type: 'leave' | 'attendance' | 'system' | 'award';
  avatar?: string;
};

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Nguyễn Văn A vừa nộp đơn xin nghỉ phép.',
    time: '5 phút trước',
    unread: true,
    type: 'leave',
    avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: 2,
    title: 'Trần Thị B đã điểm danh muộn.',
    time: '1 giờ trước',
    unread: true,
    type: 'attendance',
    avatar: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: 3,
    title: 'Cập nhật hệ thống thành công.',
    time: '2 giờ trước',
    unread: false,
    type: 'system'
  },
  {
    id: 4,
    title: 'Chúc mừng bạn nhận được giải nhân viên xuất sắc!',
    time: '3 giờ trước',
    unread: false,
    type: 'award'
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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
        <Breadcrumb />
      </div>

      {/* Right side: Notifications & Profile */}
      <div className="app-header-right" ref={wrapRef}>

        {/* Search Input */}
        <div className="header-search">
          <SearchOutlined className="header-search-icon" />
          <input type="text" placeholder="Tìm kiếm nhanh..." className="header-search-input" />
        </div>

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
                  Đánh dấu tất cả là đã đọc
                </button>
              </div>
              <div className="header-popover-list">
                {mockNotifications.map((n) => (
                  <div key={n.id} className={`header-notif-item ${n.unread ? 'unread' : ''}`}>
                    <div className="header-notif-avatar-wrapper">
                      {n.avatar ? (
                        <img src={n.avatar} alt="Avatar" className="header-notif-avatar" />
                      ) : (
                        <div className={`header-notif-icon-placeholder ${n.type}`}>
                          {n.type === 'system' ? '⚙️' : '🏆'}
                        </div>
                      )}
                      {n.unread && <span className="header-notif-dot"></span>}
                    </div>
                    <div className="header-notif-content">
                      <div className="header-notif-text">{n.title}</div>
                      <div className="header-notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="header-popover-footer">
                <button className="header-popover-footer-btn">Xem tất cả thông báo</button>
              </div>
            </div>
          )}
        </div>

        {/* Help Icon */}
        <button className="header-icon-btn">
          <QuestionCircleOutlined className="header-icon" />
        </button>


        {/* User Profile Avatar */}
        <div className="header-profile">
          <div className="header-avatar-wrapper">
            <img src={avatarImg} alt="User Avatar" className="header-avatar" />
          </div>
        </div>

      </div>
    </header>
  );
}