import React, { useState } from 'react';
import {
  DownloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import './WorkShiftConfigPage.css';
import ShiftList from './ShiftList';
import HolidaysWeekends from './HolidaysWeekends';

const WorkShiftConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shifts' | 'rules' | 'holidays'>('shifts');

  return (
    <div className="config-page">
      <header className="config-header">
        <div className="header-title">
          <h1>Cấu hình giờ làm việc</h1>
          <p>Thiết lập các ca làm, quy định và lịch nghỉ lễ của công ty</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <DownloadOutlined /> Xuất báo cáo
          </button>
          <button className="btn btn-primary">
            <PlusOutlined /> Thêm ca làm việc mới
          </button>
        </div>
      </header>

      <div className="main-content-wrapper">
        <div className="tab-content">
          {activeTab === 'shifts' && <ShiftList />}

          {activeTab === 'holidays' && (
            <div className="secondary-sections" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
              <HolidaysWeekends />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkShiftConfigPage;
