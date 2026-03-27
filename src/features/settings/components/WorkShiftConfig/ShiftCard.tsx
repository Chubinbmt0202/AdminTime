import React from 'react';
import {
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';



interface ShiftCardProps {
  title: string;
  subtitle?: string;
  timeRange?: string; // Left for backwards compatibility
  startTime?: string;
  endTime?: string;
  lunchBreak: any;
  workingDays: number | string;
  status: string;
  icon: React.ReactNode;
  iconBg: string;
  isDefault?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ShiftCard: React.FC<ShiftCardProps> = ({
  title,
  subtitle,
  timeRange,
  startTime,
  endTime,
  lunchBreak,
  workingDays,
  status,
  icon,
  iconBg,
  isDefault,
  onEdit,
  onDelete
}) => {
  return (
    <div className="shift-card">
      <div className="card-header">
        <div className="card-info">
          <div className="icon-box" style={{ backgroundColor: iconBg, color: '#fff' }}>
            {icon}
          </div>
          <div className="card-meta">
            <h3>{title}</h3>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
            {isDefault && <span className="badge badge-default">Mặc định</span>}
          </div>
        </div>
        <div className="card-actions">
          <button className="action-btn" onClick={onEdit} title="Chỉnh sửa"><EditOutlined /></button>
          <button className="action-btn" onClick={onDelete} title="Xóa"><DeleteOutlined /></button>
        </div>
      </div>

      <div className="card-body">
        <div className="info-group">
          <label>Giờ vào ca</label>
          <div className="info-value">{startTime || (timeRange ? timeRange.split(' - ')[0] : 'Chưa cấu hình')}</div>
        </div>
        <div className="info-group">
          <label>Giờ ra ca</label>
          <div className="info-value">{endTime || (timeRange ? timeRange.split(' - ')[1] : 'Chưa cấu hình')}</div>
        </div>
        <div className="info-group">
          <label>Nghỉ trưa</label>
          <div className="info-value">{lunchBreak ? 'Có' : 'Không'}</div>
        </div>
        <div className="info-group">
          <label>Số công tính</label>
          <div className="info-value">{workingDays}</div>
        </div>
        <div className="info-group">
          <label>Tình trạng / NV áp dụng</label>
          <div className={`info-value ${status.includes('áp dụng') ? 'status-active' : 'status-inactive'}`}>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;
