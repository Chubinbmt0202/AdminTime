import React, { useState } from 'react';
import {
  DownloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import './WorkShiftConfigPage.css';
import ShiftList from './ShiftList';
import HolidaysWeekends from './HolidaysWeekends';
import AddShiftDrawer from './AddShiftDrawer';

const WorkShiftConfigPage: React.FC = () => {
  const [activeTab] = useState<'shifts' | 'rules' | 'holidays'>('shifts');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setSelectedShift(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (shift: any) => {
    setSelectedShift(shift);
    setIsDrawerOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

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
          <button className="btn btn-primary" onClick={handleAdd}>
            <PlusOutlined /> Thêm ca làm việc mới
          </button>
        </div>
      </header>

      <div className="main-content-wrapper">
        <div className="tab-content">
          {activeTab === 'shifts' && (
            <ShiftList 
              refreshKey={refreshKey} 
              onEdit={handleEdit} 
            />
          )}

          {activeTab === 'holidays' && (
            <div className="secondary-sections" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
              <HolidaysWeekends />
            </div>
          )}
        </div>
      </div>

      <AddShiftDrawer 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={handleSuccess}
        initialData={selectedShift}
      />
    </div>
  );
};

export default WorkShiftConfigPage;
