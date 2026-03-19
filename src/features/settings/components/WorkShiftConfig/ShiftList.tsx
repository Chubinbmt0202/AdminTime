import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import ShiftCard from './ShiftCard';
import {
  CarryOutOutlined,
  SunOutlined,
  CloudOutlined,
} from '@ant-design/icons';

const ShiftList: React.FC = () => {
  const shifts = [
    {
      title: 'Ca hành chính',
      subtitle: 'Mặc định',
      timeRange: '08:00 - 17:00',
      lunchBreak: '12:00 - 13:00',
      workingDays: '1.0 công',
      status: 'Đang áp dụng',
      icon: <CarryOutOutlined />,
      iconBg: '#3b82f6',
      isDefault: true
    },
    {
      title: 'Ca sáng',
      subtitle: 'Làm việc bán thời gian',
      timeRange: '08:00 - 12:00',
      lunchBreak: 'Không',
      workingDays: '0.5 công',
      status: '12 người',
      icon: <SunOutlined />,
      iconBg: '#f59e0b'
    },
    {
      title: 'Ca chiều',
      subtitle: 'Làm việc bán thời gian',
      timeRange: '13:00 - 17:00',
      lunchBreak: 'Không',
      workingDays: '0.5 công',
      status: '8 người',
      icon: <CloudOutlined />,
      iconBg: '#fb923c'
    },
  ];

  return (
    <div className="shift-list-section">
      <div className="content-header">
        <h2>Danh sách các ca làm việc</h2>
        <div className="search-wrapper">
          <SearchOutlined className="search-icon" />
          <input type="text" className="search-input" placeholder="Tìm kiếm ca làm..." />
        </div>
      </div>
      <div className="shift-grid">
        {shifts.map((shift, index) => (
          <ShiftCard key={index} {...shift} />
        ))}
      </div>
    </div>
  );
};

export default ShiftList;
