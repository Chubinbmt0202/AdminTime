import React, { useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import ShiftCard from './ShiftCard';
import { shiftApi } from '../../api/shift.api';
import {
  CarryOutOutlined,
  SunOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import { Spin, message } from 'antd';

const ShiftList: React.FC = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const response = await shiftApi.getAllShifts();
      console.log("data ca làm:", response.data)
      if (response && response.success) {
        setShifts(response.data || []);
      } else if (Array.isArray(response)) {
        // Fallback in case the response is directly an array
        setShifts(response);
      } else if (response && response.data) {
        setShifts(response.data);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      message.error('Lỗi khi tải danh sách ca làm việc');
    } finally {
      setLoading(false);
    }
  };

  const mapShiftToCard = (shift: any, index: number) => {
    // Handling different potential time formats
    const startStr = shift.start_time ? shift.start_time.toString().substring(0, 5) : (shift.gio_bat_dau ? shift.gio_bat_dau.toString().substring(0, 5) : '');
    const endStr = shift.end_time ? shift.end_time.toString().substring(0, 5) : (shift.gio_ket_thuc ? shift.gio_ket_thuc.toString().substring(0, 5) : '');

    let icon = <CarryOutOutlined />;
    const nameLower = (shift.shift_name || '').toLowerCase();
    if (nameLower.includes('sáng')) icon = <SunOutlined />;
    else if (nameLower.includes('chiều')) icon = <CloudOutlined />;

    return {
      title: shift.shift_name || 'Ca làm việc chưa xác định',
      subtitle: shift.description || (shift.la_mac_dinh ? 'Mặc định' : ''),
      startTime: startStr || 'Chưa cấu hình',
      endTime: endStr || 'Chưa cấu hình',
      has_lunch_break: shift.has_lunch_break,
      workingDays: `${shift.so_cong !== undefined ? shift.so_cong : 1.0} công`,
      status: shift.trang_thai === 1 || shift.trang_thai === true ? 'Đang áp dụng' : 'Không áp dụng',
      icon: icon,
      iconBg: index % 3 === 0 ? '#3b82f6' : index % 3 === 1 ? '#f59e0b' : '#fb923c',
      isDefault: shift.la_mac_dinh === 1 || shift.la_mac_dinh === true
    };
  };

  return (
    <div className="shift-list-section">
      <div className="content-header">
        <h2>Danh sách các ca làm việc</h2>
        <div className="search-wrapper">
          <SearchOutlined className="search-icon" />
          <input type="text" className="search-input" placeholder="Tìm kiếm ca làm..." />
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="shift-grid">
          {shifts.map((shift, index) => {
            const mappedShift = mapShiftToCard(shift, index);
            return <ShiftCard lunchBreak={shift.has_lunch_break} key={shift.id_ca_lam_viec || shift.id || index} {...mappedShift} />;
          })}
          {shifts.length === 0 && (
            <div style={{ padding: '20px', color: '#6b7280' }}>Không có ca làm việc nào.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftList;
