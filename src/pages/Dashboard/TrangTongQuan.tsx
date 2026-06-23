import React, { useState, useEffect } from 'react';
import {
  TeamOutlined,
  ClockCircleOutlined,
  UserDeleteOutlined,
  LaptopOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  FileTextOutlined,
  UserAddOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Button, Badge, Avatar, List, Tag, Spin, message, Tabs } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './DashboardPage.css';

import { employeeApi } from '../../features/employees/api/employee.api';
import { attendanceService } from '../../services/attendance.service';
import { leaveApi } from '../../features/leaves/api/leave.api';
import { overtimeApi } from '../../features/overtime/api/overtime.api';
import { lateExplanationApi } from '../../features/lateExplanations/api/lateExplanation.api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444', '#f43f5e', '#14b8a6'];

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Flash Stats data
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);

  // Charts data
  const [trendData, setTrendData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  // Quick Approvals data
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [pendingOT, setPendingOT] = useState<any[]>([]);
  const [pendingLate, setPendingLate] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Employee headcount
        const empRes = await employeeApi.getAll();
        if (empRes.success && empRes.data) {
          setTotalEmployees(empRes.data.length);
        }

        // 2. Today's attendance
        const dateStr = new Date().toISOString().split('T')[0];
        const attRes = await attendanceService.getDailyAttendance(dateStr);
        if (attRes.success && attRes.data) {
          setTodayAttendance(attRes.data);
        }

        // 3. Trend Data
        const trendRes = await attendanceService.getAttendanceTrend(7);
        if (trendRes.success && trendRes.data) {
          setTrendData(trendRes.data.trend.map((t: any) => ({
            date: t.log_date,
            present: parseInt(t.total_present)
          })));

          setPieData(trendRes.data.lateByDept.map((p: any) => ({
            name: p.ten_phong_ban || 'Khác',
            value: parseInt(p.late_count)
          })));
        }

        // 4. Quick Approvals
        const [leavesRes, otRes, lateRes] = await Promise.all([
          leaveApi.getAll(),
          overtimeApi.getAll(),
          lateExplanationApi.getAll()
        ]);

        if (leavesRes.success) {
          setPendingLeaves(leavesRes.data.filter(l => l.trang_thai === null));
        }
        if (otRes.success) {
          setPendingOT(otRes.data.filter(o => o.trang_thai === 'CHO_DUYET'));
        }
        if (lateRes.success) {
          setPendingLate(lateRes.data.filter(la => la.trang_thai === null));
        }

      } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleApprove = async (type: string, id: string) => {
    // In real scenario, call update API here, then refetch
    message.success(`Đã phê duyệt ${type} ${id}`);
  };

  const currentDateStr = new Date().toLocaleDateString('vi-VN');

  // Compute Flash Stats
  const presentCount = todayAttendance.filter(a => a.check_in_time !== null).length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const absentCount = Math.max(0, totalEmployees - presentCount);
  const workingCount = todayAttendance.filter(a => a.check_in_time !== null && a.check_out_time === null).length;

  // Merge Real-time Logs (Live Feed) & Notifications
  const notifications: any[] = [];

  todayAttendance.filter(a => a.check_in_time !== null).forEach(a => {
    notifications.push({
      id: `chk-${a.employee_id}-${a.check_in_time}`,
      type: 'check_in',
      avatar: a.url_anh_vao,
      title: a.full_name,
      desc: 'Điểm danh khuôn mặt',
      time: a.check_in_time,
      status: a.status
    });
  });

  pendingLeaves.forEach(l => {
    notifications.push({
      id: `leave-${l.id_don_xin_nghi}`,
      type: 'leave',
      title: l.ho_ten_nhan_vien,
      desc: `Xin nghỉ phép từ ${new Date(l.ngay_bat_dau).toLocaleDateString()} đến ${new Date(l.ngay_ket_thuc).toLocaleDateString()}`,
      time: l.ngay_tao || new Date().toISOString()
    });
  });

  pendingOT.forEach(o => {
    notifications.push({
      id: `ot-${o.id_don_ot}`,
      type: 'ot',
      title: o.ho_va_ten || o.ho_ten_nhan_vien,
      desc: `Xin làm thêm ngày ${new Date(o.ngay_dang_ky_ot).toLocaleDateString()}`,
      time: o.ngay_tao || new Date().toISOString()
    });
  });

  pendingLate.forEach(la => {
    notifications.push({
      id: `late-${la.id_giai_trinh}`,
      type: 'explanation',
      title: la.ho_ten_nhan_vien,
      desc: `Giải trình đi trễ ngày ${new Date(la.ngay_giai_trinh).toLocaleDateString()}`,
      time: la.ngay_tao || new Date().toISOString()
    });
  });

  const unifiedFeed = notifications
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 15);

  if (loading) {
    return <div className="dashboard-loading"><Spin size="large" /></div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-titles">
          <h2>Tổng quan chấm công</h2>
          <p className="subtitle">Tình hình nhân sự ngày {currentDateStr}</p>
        </div>
      </div>

      {/* 1. Flash Stats */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Đi làm hôm nay</span>
            <div className="stat-icon blue-icon"><TeamOutlined /></div>
          </div>
          <div className="stat-value-wrap">
            <span className="stat-val-main">{presentCount}</span><span className="stat-val-sub">/{totalEmployees}</span>
          </div>
          <div className="stat-trend normal-text">Tỷ lệ: {totalEmployees ? Math.round((presentCount / totalEmployees) * 100) : 0}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Đi muộn / Về sớm</span>
            <div className="stat-icon orange-icon"><ClockCircleOutlined /></div>
          </div>
          <div className="stat-value-wrap">
            <span className="stat-val-main">{lateCount}</span>
          </div>
          <div className="stat-trend orange-text">{lateCount > 0 ? 'Cần nhắc nhở' : 'Tốt'}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Vắng mặt</span>
            <div className="stat-icon red-icon"><UserDeleteOutlined /></div>
          </div>
          <div className="stat-value-wrap">
            <span className="stat-val-main">{absentCount}</span>
          </div>
          <div className="stat-trend red-text">Chưa check-in</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Đang làm việc</span>
            <div className="stat-icon lightblue-icon"><LaptopOutlined /></div>
          </div>
          <div className="stat-value-wrap">
            <span className="stat-val-main">{workingCount}</span>
          </div>
          <div className="stat-trend normal-text">Có mặt tại văn phòng</div>
        </div>
      </div>

      {/* Main Grid: Charts & Logs */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>

        {/* Left Column: Charts */}
        <div className="col-left" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3>Xu hướng đi làm (7 ngày)</h3>
            </div>
            <div style={{ width: '100%', height: 250, marginTop: 16 }}>
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="present" name="Số người đi làm" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3>Tỷ lệ đi muộn theo phòng ban</h3>
            </div>
            <div style={{ width: '100%', height: 250, marginTop: 16 }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  Chưa có dữ liệu đi muộn
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Unified Live Feed */}
        <div className="col-right">
          <div className="dashboard-card live-feed-card" style={{ height: '100%' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h3>Hoạt động thời gian thực & Thông báo</h3>
            </div>

            <div className="live-feed-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '700px' }}>
              {unifiedFeed.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>Chưa có hoạt động nào.</div>
              ) : (
                unifiedFeed.map((log) => (
                  <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    {log.type === 'check_in' && <Avatar src={log.avatar} size="large" icon={<TeamOutlined />} />}
                    {log.type === 'leave' && <Avatar style={{ backgroundColor: '#8b5cf6' }} size="large" icon={<FileTextOutlined />} />}
                    {log.type === 'ot' && <Avatar style={{ backgroundColor: '#f59e0b' }} size="large" icon={<ClockCircleOutlined />} />}
                    {log.type === 'explanation' && <Avatar style={{ backgroundColor: '#ef4444' }} size="large" icon={<ExclamationCircleFilled />} />}
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{log.title}</div>
                      <div style={{ fontSize: '13px', color: '#475569' }}>
                        {log.desc}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        {new Date(log.time).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    
                    <div>
                      {log.type === 'check_in' && (
                        log.status === 'late' ? <Tag color="error">Đi muộn</Tag> : <Tag color="success">Đúng giờ</Tag>
                      )}
                      {log.type === 'leave' && <Tag color="purple">Nghỉ phép</Tag>}
                      {log.type === 'ot' && <Tag color="warning">Làm thêm</Tag>}
                      {log.type === 'explanation' && <Tag color="red">Giải trình</Tag>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
