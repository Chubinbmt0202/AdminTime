import React from 'react';
import { 
  CopyOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';



interface ShiftCardProps {
  title: string;
  subtitle?: string;
  timeRange: string;
  lunchBreak: string;
  workingDays: number | string;
  status: string;
  icon: React.ReactNode;
  iconBg: string;
  isDefault?: boolean;
}

const ShiftCard: React.FC<ShiftCardProps> = ({
  title,
  subtitle,
  timeRange,
  lunchBreak,
  workingDays,
  status,
  icon,
  iconBg,
  isDefault
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
          <button className="action-btn"><CopyOutlined /></button>
          <button className="action-btn"><EditOutlined /></button>
          <button className="action-btn"><DeleteOutlined /></button>
        </div>
      </div>

      <div className="card-body">
        <div className="info-group">
          <label>Thời gian</label>
          <div className="info-value">{timeRange}</div>
        </div>
        <div className="info-group">
          <label>Nghỉ trưa</label>
          <div className="info-value">{lunchBreak}</div>
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
