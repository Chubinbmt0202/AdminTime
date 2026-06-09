import { useEffect } from 'react';
import {
  CloseOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PictureOutlined
} from '@ant-design/icons';
import type { AttendanceRecord } from '../../../../services/attendance.service';
import './AttendanceDetailDrawer.css';

interface Props {
  open: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

const getStatusLabel = (status: string | null) => {
    switch (status) {
        case 'present': return 'Đúng giờ';
        case 'late': return 'Đi muộn';
        case 'half_day': return 'Nửa ngày';
        case null: return 'Chưa chấm công';
        default: return status;
    }
};

const getStatusClass = (status: string | null) => {
    switch (status) {
        case 'present': return 'status-present';
        case 'late': return 'status-late';
        case 'half_day': return 'status-half';
        case null: return 'status-none';
        default: return 'status-default';
    }
};

const calculateTotalTime = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return '--h';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '--h';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

export default function AttendanceDetailDrawer({ open, onClose, record }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!record) return null;

  return (
    <>
      <div className={`att-drawer-overlay ${open ? 'att-drawer-overlay-visible' : ''}`} onClick={onClose} />
      <div className={`att-drawer-panel ${open ? 'att-drawer-panel-open' : ''}`}>
        <div className="att-drawer-header">
          <div className="att-drawer-header-left">
            <div className="att-drawer-header-icon">
              <CalendarOutlined />
            </div>
            <div>
              <h2 className="att-drawer-title">Chi tiết chấm công</h2>
              <p className="att-drawer-subtitle">{formatDate(record.log_date)} - {record.full_name}</p>
            </div>
          </div>
          <button className="att-drawer-close-btn" onClick={onClose} title="Đóng">
            <CloseOutlined />
          </button>
        </div>

        <div className="att-drawer-body">
          <div className={`att-status-banner ${getStatusClass(record.status)}`}>
            <span>Trạng thái: <strong>{getStatusLabel(record.status)}</strong></span>
          </div>

          <div className="att-section">
            <h3 className="att-section-title"><ClockCircleOutlined /> Thời gian làm việc</h3>
            <div className="att-time-grid">
              <div className="att-time-box">
                <span className="att-time-label">Giờ vào (Check-in)</span>
                <span className="att-time-value">{formatTime(record.check_in_time)}</span>
              </div>
              <div className="att-time-box">
                <span className="att-time-label">Giờ ra (Check-out)</span>
                <span className="att-time-value">{formatTime(record.check_out_time)}</span>
              </div>
              <div className="att-time-box att-time-total">
                <span className="att-time-label">Tổng thời gian</span>
                <span className="att-time-value">{calculateTotalTime(record.check_in_time, record.check_out_time)}</span>
              </div>
            </div>
          </div>

          {record.has_ot && (
            <div className="att-section ot-section">
              <h3 className="att-section-title"><ClockCircleOutlined /> Thông tin tăng ca</h3>
              <div className="ot-detail-grid">
                <div className="ot-detail-info">
                  <p><strong>Giờ đăng ký:</strong> {record.ot_start_time?.substring(0, 5)} - {record.ot_expected_end_time?.substring(0, 5)}</p>
                  <p><strong>Lý do:</strong> {record.ot_reason || 'Không có'}</p>
                  <p>
                    <strong>Trạng thái duyệt: </strong> 
                    <span className={`ot-status-txt text-${record.ot_status === 'DA_DUYET' ? 'green' : record.ot_status === 'CHO_DUYET' ? 'orange' : 'red'}`}>
                      {record.ot_status === 'DA_DUYET' ? 'Đã duyệt' : record.ot_status === 'CHO_DUYET' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </p>
                </div>
                {record.ot_status === 'DA_DUYET' && (
                  <div className="att-time-grid ot-time-grid" style={{ marginTop: '12px' }}>
                    <div className="att-time-box">
                      <span className="att-time-label">Vào tăng ca (Check-in OT)</span>
                      <span className="att-time-value">{formatTime(record.ot_check_in_time)}</span>
                    </div>
                    <div className="att-time-box">
                      <span className="att-time-label">Ra tăng ca (Check-out OT)</span>
                      <span className="att-time-value">{formatTime(record.ot_check_out_time)}</span>
                    </div>
                    <div className="att-time-box att-time-total">
                      <span className="att-time-label">Tổng giờ tăng ca</span>
                      <span className="att-time-value">{calculateTotalTime(record.ot_check_in_time, record.ot_check_out_time)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="att-section">
            <h3 className="att-section-title"><EnvironmentOutlined /> Địa điểm</h3>
            <div className="att-location-box">
              <p><strong>Văn phòng:</strong> Trụ sở chính</p>
              <p><strong>Địa chỉ IP:</strong> 192.168.1.100</p>
            </div>
          </div>

          <div className="att-section">
            <h3 className="att-section-title"><PictureOutlined /> Minh chứng hình ảnh</h3>
            <div className="att-proof-grid">
              <div className="att-proof-item">
                <span className="att-proof-label">Lúc vào (Check-in)</span>
                <img src="https://ui-avatars.com/api/?name=IN&background=e2e8f0&color=64748b&size=150" alt="Check-in proof" />
              </div>
              <div className="att-proof-item">
                <span className="att-proof-label">Lúc ra (Check-out)</span>
                <img src="https://ui-avatars.com/api/?name=OUT&background=e2e8f0&color=64748b&size=150" alt="Check-out proof" />
              </div>
            </div>
          </div>

        </div>
        
        <div className="att-drawer-footer">
          <button type="button" className="att-btn-cancel" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </>
  );
}
