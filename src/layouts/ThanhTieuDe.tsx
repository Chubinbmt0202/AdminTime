import { useEffect, useMemo, useRef, useState } from 'react';
import { BellFilled } from '@ant-design/icons';
import { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import avatarImg from '../assets/images/avatar.png';
import './ThanhTieuDe.css';
import ThanhDieuHuong from '../components/common/Breadcrumb/ThanhDieuHuong';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, update, get, query, limitToLast } from 'firebase/database';
import { database } from '../config/cauHinhFirebase';
import { useXacThuc } from '../auth/ContextXacThuc';

export default function ThanhTieuDe() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const auth = useXacThuc();

  const [notifications, setNotifications] = useState<any[]>([]);

  // Định dạng thời gian trôi qua
  const dinhDangThoiGianDaQua = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  useEffect(() => {
    if (!auth.isAuthenticated || auth.role === 'Employee') {
      return;
    }

    const notifRef = ref(database, 'admin_notifications');
    const notifQuery = query(notifRef, limitToLast(50));

    const unsubscribe = onValue(notifQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })).sort((a, b) => b.ngay_tao - a.ngay_tao);
        setNotifications(list);
      } else {
        setNotifications([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth.isAuthenticated, auth.role]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.da_doc).length, [notifications]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const xuLyDanhDauTatCaDaDoc = async () => {
    try {
      const notifRef = ref(database, 'admin_notifications');
      const snapshot = await get(notifRef);
      if (snapshot.exists()) {
        const updates: any = {};
        snapshot.forEach((child) => {
          const key = child.key;
          const val = child.val();
          if (val && !val.da_doc) {
            updates[`${key}/da_doc`] = true;
          }
        });
        if (Object.keys(updates).length > 0) {
          await update(notifRef, updates);
        }
      }
      setOpen(false);
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };

  const xuLyClickThongBao = async (n: any) => {
    try {
      const itemRef = ref(database, `admin_notifications/${n.id}`);
      await update(itemRef, { da_doc: true });
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
    setOpen(false);
    if (n.loai_thong_bao === 'LEAVE_REQUEST') {
      navigate('/leave-requests');
    } else if (n.loai_thong_bao === 'OVERTIME_REQUEST') {
      navigate('/overtime-requests');
    }
  };

  return (
    <header className="app-header">
      {/* Left side: Breadcrumbs */}
      <div className="app-header-left">
        <ThanhDieuHuong />
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
                <div className="header-popover-title">Thông báo ({unreadCount})</div>
                <button className="header-popover-link" onClick={xuLyDanhDauTatCaDaDoc}>
                  Đánh dấu tất cả là đã đọc
                </button>
              </div>
              <div className="header-popover-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                    Không có thông báo mới
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`header-notif-item ${!n.da_doc ? 'unread' : ''}`}
                      onClick={() => xuLyClickThongBao(n)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="header-notif-avatar-wrapper">
                        <div className="header-notif-icon-placeholder leave">
                          📝
                        </div>
                        {!n.da_doc && <span className="header-notif-dot"></span>}
                      </div>
                      <div className="header-notif-content">
                        <div className="header-notif-text">
                          <strong>{n.ho_ten_nhan_vien}</strong>: {n.tieu_de} - {n.noi_dung}
                        </div>
                        <div className="header-notif-time">{dinhDangThoiGianDaQua(n.ngay_tao)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="header-popover-footer">
                <button className="header-popover-footer-btn" onClick={() => { setOpen(false); navigate('/leave-requests'); }}>
                  Xem tất cả đơn nghỉ phép
                </button>
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