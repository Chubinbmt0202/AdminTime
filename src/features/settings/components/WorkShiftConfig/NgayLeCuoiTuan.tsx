import React from 'react';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';

const HolidaysWeekends: React.FC = () => {
  const weekendDays = [
    { label: 'Thứ 2', selected: false },
    { label: 'Thứ 3', selected: false },
    { label: 'Thứ 4', selected: false },
    { label: 'Thứ 5', selected: false },
    { label: 'Thứ 6', selected: false },
    { label: 'Thứ 7', selected: true },
    { label: 'Chủ Nhật', selected: true },
  ];

  const holidays = [
    { name: 'Tết Dương Lịch', date: '01/01/2024', badge: 'Được hưởng lương' },
    { name: 'Tết Nguyên Đán', date: '08/02/2024 - 14/02/2024', badge: 'Được hưởng lương' },
    { name: 'Giỗ tổ Hùng Vương', date: '18/04/2024', badge: 'Được hưởng lương' },
  ];

  return (
    <div className="section-box">
      <div className="section-box-header">
        <CalendarOutlined className="icon" />
        <h3>Lịch nghỉ & Cuối tuần</h3>
      </div>

      <div className="control-group">
        <label>Ngày nghỉ cuối tuần (mặc định không tính công)</label>
        <div className="day-selector">
          {weekendDays.map((day, index) => (
            <button key={index} className={`day-btn ${day.selected ? 'selected' : ''}`}>
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>Ngày nghỉ lễ trong năm</label>
          <button className="add-holiday-btn">
            <PlusOutlined /> Thêm ngày lễ
          </button>
        </div>
        
        <div className="holiday-list">
          {holidays.map((holiday, index) => (
            <div key={index} className="holiday-item">
              <div className="holiday-info">
                <h4>{holiday.name}</h4>
                <p>{holiday.date}</p>
              </div>
              <span className="holiday-badge">{holiday.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HolidaysWeekends;
