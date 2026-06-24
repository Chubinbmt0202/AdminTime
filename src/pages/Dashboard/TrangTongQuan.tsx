import React, { useState, useEffect } from 'react';
import {
  TeamOutlined,
  ClockCircleOutlined,
  UserDeleteOutlined,
  LaptopOutlined,
  ExclamationCircleFilled,
  FileTextOutlined,
  UserAddOutlined,
  BellOutlined,
  SettingOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  WifiOutlined
} from '@ant-design/icons';
import { Button, Badge, Avatar, Tag, Spin, Select, Progress, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import './TrangTongQuan.css';

import { employeeApi } from '../../features/employees/api/nhanVien.api';
import { attendanceService } from '../../services/dichVuChamCong';
import { leaveApi } from '../../features/leaves/api/donXinNghi.api';
import { overtimeApi } from '../../features/overtime/api/tangCa.api';
import { lateExplanationApi } from '../../features/lateExplanations/api/giaiTrinhDiMuon.api';
import { xuatBaoCaoNhieuSheet } from '../../utils/tienIchXuatFile';

const { Option } = Select;

// Constants
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const TrangTongQuanPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Filters State
  const [timeFilter, setTimeFilter] = useState('today');
  const [deptFilter, setDeptFilter] = useState('all');

  // Stats Data
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);

  // Charts Data
  const [trendData, setTrendData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);

  // Workflow Data
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [pendingOT, setPendingOT] = useState<any[]>([]);
  const [pendingLate, setPendingLate] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Headcount
        const empRes = await employeeApi.layTatCa();
        if (empRes.success && empRes.data) {
          setTotalEmployees(empRes.data.length);
        }

        // Today's attendance
        const dateStr = new Date().toISOString().split('T')[0];
        const attRes = await attendanceService.layChamCongHangNgay(dateStr);
        if (attRes.success && attRes.data) {
          setTodayAttendance(attRes.data);
        }

        // Trend Data
        const trendRes = await attendanceService.layXuHuongChamCong(7);
        if (trendRes.success && trendRes.data) {
          setTrendData(trendRes.data.trend.map((t: any) => ({
            date: t.log_date,
            present: parseInt(t.total_present)
          })));

          setPieData([
            { name: 'Phép năm', value: 45 },
            { name: 'Nghỉ ốm', value: 20 },
            { name: 'Việc riêng', value: 15 },
            { name: 'Thai sản', value: 10 },
            { name: 'Khác', value: 10 },
          ]);

          // Mocking Bar Chart Data since API doesn't fully provide this right now
          setBarData([
            { name: 'Phòng IT', onTime: 40, late: 2 },
            { name: 'Phòng Kế toán', onTime: 12, late: 4 },
            { name: 'Phòng HCNS', onTime: 15, late: 1 },
            { name: 'Phòng Sale', onTime: 30, late: 10 },
          ]);
        }

        // Quick Approvals
        const [leavesRes, otRes, lateRes] = await Promise.all([
          leaveApi.layTatCa(),
          overtimeApi.layTatCa(),
          lateExplanationApi.layTatCa()
        ]);

        if (leavesRes.success) setPendingLeaves(leavesRes.data.filter(l => l.trang_thai === null));
        if (otRes.success) setPendingOT(otRes.data.filter(o => o.trang_thai === 'CHO_DUYET'));
        if (lateRes.success) setPendingLate(lateRes.data.filter(la => la.trang_thai === null));

      } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [timeFilter, deptFilter]);

  // Derived Metrics
  const presentCount = todayAttendance.filter(a => a.check_in_time !== null).length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const forgotCheckInOutCount = todayAttendance.filter(a => a.check_in_time !== null && a.check_out_time === null && new Date().getHours() > 20).length; // Mock logic
  const absentCount = Math.max(0, totalEmployees - presentCount);

  // Mock data for Absence Breakdown
  const absentWithLeave = Math.floor(absentCount * 0.4);
  const absentWithoutLeave = absentCount - absentWithLeave;

  const presentRate = totalEmployees ? Math.round((presentCount / totalEmployees) * 100) : 0;

  // Unified Feed with Mock Security Alerts
  const unifiedFeed: any[] = [];
  todayAttendance.filter(a => a.check_in_time !== null).forEach(a => {
    unifiedFeed.push({
      id: `chk-${a.employee_id}-${a.check_in_time}`,
      type: 'check_in',
      avatar: a.url_anh_vao,
      title: a.full_name,
      desc: `Chấm công ${a.check_in_type === 'WIFI' ? 'Wifi' : 'FaceID'} - ${a.ip_address || 'Văn phòng chính'}`,
      time: a.check_in_time,
      status: a.status
    });
  });

  // Thêm một số mock alert an ninh
  if (unifiedFeed.length > 2) {
    unifiedFeed.push({
      id: 'alert-mock-1',
      type: 'security_alert',
      title: 'Cảnh báo An ninh',
      desc: 'Phát hiện chấm công sai vị trí GPS nhiều lần (Nguyễn Văn A)',
      time: new Date().toISOString(),
      status: 'danger'
    });
  }

  const sortedFeed = unifiedFeed
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 15);

  const handleExportReport = () => {
    try {
      message.loading({ content: 'Đang chuẩn bị xuất báo cáo...', key: 'exportReport' });

      // Sheet 1: Tổng quan
      const summaryData = [
        { 'Chỉ số': 'Tổng nhân sự', 'Giá trị': totalEmployees, 'Đơn vị': 'Nhân viên' },
        { 'Chỉ số': 'Đã chấm công hôm nay', 'Giá trị': presentCount, 'Đơn vị': 'Nhân viên' },
        { 'Chỉ số': 'Tỷ lệ hiện diện', 'Giá trị': `${presentRate}%`, 'Đơn vị': '%' },
        { 'Chỉ số': 'Vắng mặt', 'Giá trị': absentCount, 'Đơn vị': 'Nhân viên' },
        { 'Chỉ số': 'Vắng mặt (Có phép)', 'Giá trị': absentWithLeave, 'Đơn vị': 'Nhân viên' },
        { 'Chỉ số': 'Vắng mặt (Không phép)', 'Giá trị': absentWithoutLeave, 'Đơn vị': 'Nhân viên' },
        { 'Chỉ số': 'Đi muộn/Về sớm', 'Giá trị': lateCount, 'Đơn vị': 'Lượt' },
        { 'Chỉ số': 'Quên check-in/out', 'Giá trị': forgotCheckInOutCount, 'Đơn vị': 'Lượt' },
        { 'Chỉ số': 'Số ca đang tăng ca (OT)', 'Giá trị': pendingOT.length, 'Đơn vị': 'Lượt' },
        { 'Chỉ số': 'Đơn xin nghỉ phép chưa duyệt', 'Giá trị': pendingLeaves.length, 'Đơn vị': 'Đơn' },
        { 'Chỉ số': 'Giải trình đi muộn chưa duyệt', 'Giá trị': pendingLate.length, 'Đơn vị': 'Đơn' }
      ];

      // Sheet 2: Chi tiết chấm công
      const attendanceData = todayAttendance.map((a) => ({
        'Mã Nhân viên': a.employee_id,
        'Họ và tên': a.full_name,
        'Tên đăng nhập': a.username || '',
        'Ngày': a.log_date || new Date().toISOString().split('T')[0],
        'Giờ vào': a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--',
        'Giờ ra': a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--',
        'Trạng thái': a.status === 'present' ? 'Đúng giờ' : a.status === 'late' ? 'Đi muộn' : a.status === 'half_day' ? 'Nửa ngày' : a.check_in_time ? 'Đã chấm công' : 'Chưa chấm công',
        'Hình thức check-in': a.check_in_type || 'WIFI',
        'Địa chỉ IP/Vị trí': a.ip_address || 'Văn phòng chính'
      }));

      // Sheet 3: Đơn xin nghỉ phép chờ duyệt
      const leavesData = pendingLeaves.map((l) => ({
        'Mã đơn': l.id_don_xin_nghi,
        'Nhân viên': l.ho_ten_nhan_vien,
        'Loại phép': l.ten_phep || 'Nghỉ phép',
        'Ngày bắt đầu': l.ngay_bat_dau ? new Date(l.ngay_bat_dau).toLocaleDateString('vi-VN') : '',
        'Ngày kết thúc': l.ngay_ket_thuc ? new Date(l.ngay_ket_thuc).toLocaleDateString('vi-VN') : '',
        'Lý do': l.ly_do || '',
        'Ngày tạo': l.ngay_tao ? new Date(l.ngay_tao).toLocaleDateString('vi-VN') : ''
      }));

      // Sheet 4: Giải trình đi muộn chờ duyệt
      const lateExplanationsData = pendingLate.map((la) => ({
        'Mã giải trình': la.id_giai_trinh,
        'Nhân viên': la.ho_ten_nhan_vien,
        'Ngày giải trình': la.ngay_giai_trinh ? new Date(la.ngay_giai_trinh).toLocaleDateString('vi-VN') : '',
        'Giờ thực tế vào': la.gio_vao_tre ? new Date(la.gio_vao_tre).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
        'Lý do': la.ly_do || '',
        'Ngày tạo': la.ngay_tao ? new Date(la.ngay_tao).toLocaleDateString('vi-VN') : ''
      }));

      // Sheet 5: Đăng ký tăng ca chờ duyệt
      const overtimeData = pendingOT.map((o) => ({
        'Mã đơn': o.id_don_ot,
        'Nhân viên': o.ho_va_ten || o.ho_ten_nhan_vien || 'Chưa rõ',
        'Ngày tăng ca': o.ngay_dang_ky_ot ? new Date(o.ngay_dang_ky_ot).toLocaleDateString('vi-VN') : '',
        'Khung giờ': `${o.gio_bat_dau || ''} - ${o.gio_ket_thuc_du_kien || ''}`,
        'Số giờ': o.so_gio || 0,
        'Lý do': o.ly_do || '',
        'Ngày tạo': o.ngay_tao ? new Date(o.ngay_tao).toLocaleDateString('vi-VN') : ''
      }));

      const dateStr = new Date().toLocaleDateString('en-CA');
      xuatBaoCaoNhieuSheet([
        { name: 'Tổng quan', data: summaryData },
        { name: 'Chi tiết Chấm công', data: attendanceData },
        { name: 'Nghỉ phép chờ duyệt', data: leavesData },
        { name: 'Giải trình đi muộn chờ duyệt', data: lateExplanationsData },
        { name: 'Đơn tăng ca chờ duyệt', data: overtimeData }
      ], `Bao_Cao_Tong_Quan_${dateStr}`);

      message.success({ content: 'Xuất báo cáo thành công!', key: 'exportReport', duration: 2 });
    } catch (err) {
      console.error('Lỗi khi xuất báo cáo:', err);
      message.error({ content: 'Lỗi khi xuất báo cáo!', key: 'exportReport', duration: 2 });
    }
  };

  if (loading) {
    return <div className="dashboard-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  return (
    <div className="dashboard-container">
      {/* I. Khu vực Thanh công cụ & Bộ lọc */}
      <div className="top-bar">
        <div className="header-titles">
          <h2>Tổng quan Chấm công & Nhân sự</h2>
          <p className="subtitle">Theo dõi tình hình hoạt động trực tiếp</p>
        </div>

        <div className="top-filters">
          <Button type="primary" icon={<DownloadOutlined />} size="large" className="btn-export" onClick={handleExportReport}>
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="dashboard-content-layout">
        <div className="main-column">

          {/* II. Khối Chỉ số Cốt lõi Trong ngày */}
          <div className="metrics-grid">
            {/* Tổng quan hiện diện */}
            <div className="metric-card presence-card">
              <div className="metric-header">
                <h3>Chấm công hôm nay</h3>
                <TeamOutlined className="icon-blue" />
              </div>
              <div className="metric-body">
                <div className="metric-main-val">
                  {presentCount} <span>/ {totalEmployees}</span>
                </div>
                <div className="metric-progress">
                  <div className="progress-labels">
                    <span>Tỷ lệ</span>
                    <span>{presentRate}%</span>
                  </div>
                  <Progress percent={presentRate} showInfo={false} strokeColor="#3b82f6" />
                </div>
              </div>
            </div>

            {/* Chỉ số tuân thủ */}
            <div className="metric-card compliance-card">
              <div className="metric-header">
                <h3>Chỉ số</h3>
                <ClockCircleOutlined className="icon-orange" />
              </div>
              <div className="metric-body">
                <div className="compliance-stats">
                  <div className="c-stat">
                    <Badge color="orange" text="Đi muộn/Về sớm" />
                    <strong>{lateCount}</strong>
                  </div>
                  <div className="c-stat">
                    <Badge color="red" text="Quên Check-in/out" />
                    <strong>{forgotCheckInOutCount}</strong>
                  </div>
                </div>
                {lateCount > 0 && <Tag color="warning" className="alert-tag">Cần nhắc nhở</Tag>}
              </div>
            </div>

            {/* Chỉ số vắng mặt */}
            <div className="metric-card absent-card">
              <div className="metric-header">
                <h3>Vắng mặt</h3>
                <UserDeleteOutlined className="icon-red" />
              </div>
              <div className="metric-body">
                <div className="metric-main-val text-red">
                  {absentCount} <span>Nhân sự</span>
                </div>
                <div className="absent-breakdown">
                  <span><Tag color="purple">Có phép</Tag> {absentWithLeave}</span>
                  <span><Tag color="error">Không phép</Tag> {absentWithoutLeave}</span>
                </div>
              </div>
            </div>

            {/* Trạng thái Tăng ca */}
            <div className="metric-card overtime-card">
              <div className="metric-header">
                <h3>Tăng ca</h3>
                <LaptopOutlined className="icon-teal" />
              </div>
              <div className="metric-body">
                <div className="metric-main-val text-teal">
                  {pendingOT.length} <span>Đang OT</span>
                </div>
                <p className="metric-desc">Ghi nhận trong ngày hôm nay</p>
              </div>
            </div>
          </div>

          {/* III. Khối Cần Xử Lý Ngay (Pending Approvals Workflow) */}
          <div className="workflow-section">
            <h3 className="section-title">Cần xử lý ngay</h3>
            <div className="workflow-grid">
              {/* Xin nghỉ phép */}
              <div className="workflow-card">
                <div className="w-card-header">
                  <h4><FileTextOutlined style={{ color: '#8b5cf6' }} /> Đơn xin nghỉ phép</h4>
                  <Badge count={pendingLeaves.length} style={{ backgroundColor: '#8b5cf6' }} />
                </div>
                <div className="w-card-list">
                  {pendingLeaves.slice(0, 3).map(l => (
                    <div className="w-item" key={l.id_don_xin_nghi}>
                      <div className="w-item-info">
                        <strong>{l.ho_ten_nhan_vien}</strong>
                        <p>{new Date(l.ngay_bat_dau).toLocaleDateString()} - {new Date(l.ngay_ket_thuc).toLocaleDateString()}</p>
                      </div>
                      <div className="w-item-actions">
                        <Button size="small" type="primary" className="btn-approve">Duyệt</Button>
                      </div>
                    </div>
                  ))}
                  {pendingLeaves.length === 0 && <p className="empty-text">Không có đơn mới</p>}
                </div>
                <Button type="link" className="view-all-btn">Xem tất cả</Button>
              </div>

              {/* Giải trình */}
              <div className="workflow-card">
                <div className="w-card-header">
                  <h4><ExclamationCircleFilled style={{ color: '#ef4444' }} /> Giải trình đi muộn</h4>
                  <Badge count={pendingLate.length} style={{ backgroundColor: '#ef4444' }} />
                </div>
                <div className="w-card-list">
                  {pendingLate.slice(0, 3).map(la => (
                    <div className="w-item" key={la.id_giai_trinh}>
                      <div className="w-item-info">
                        <strong>{la.ho_ten_nhan_vien}</strong>
                        <p>Lý do: {la.ly_do?.substring(0, 20)}...</p>
                      </div>
                      <div className="w-item-actions">
                        <Button size="small" type="primary" className="btn-approve">Duyệt</Button>
                      </div>
                    </div>
                  ))}
                  {pendingLate.length === 0 && <p className="empty-text">Không có đơn mới</p>}
                </div>
                <Button type="link" className="view-all-btn">Xem tất cả</Button>
              </div>

              {/* Yêu cầu Tăng ca */}
              <div className="workflow-card">
                <div className="w-card-header">
                  <h4><ClockCircleOutlined style={{ color: '#f59e0b' }} /> Yêu cầu Tăng ca</h4>
                  <Badge count={pendingOT.length} style={{ backgroundColor: '#f59e0b' }} />
                </div>
                <div className="w-card-list">
                  {pendingOT.slice(0, 3).map(o => (
                    <div className="w-item" key={o.id_don_ot}>
                      <div className="w-item-info">
                        <strong>{o.ho_va_ten || o.ho_ten_nhan_vien}</strong>
                        <p>{new Date(o.ngay_dang_ky_ot).toLocaleDateString()} ({o.so_gio}h)</p>
                      </div>
                      <div className="w-item-actions">
                        <Button size="small" type="primary" className="btn-approve">Duyệt</Button>
                      </div>
                    </div>
                  ))}
                  {pendingOT.length === 0 && <p className="empty-text">Không có yêu cầu mới</p>}
                </div>
                <Button type="link" className="view-all-btn">Xem tất cả</Button>
              </div>
            </div>
          </div>

          {/* IV. Khối Biểu đồ Phân tích (HR Analytics) */}
          <div className="analytics-section">
            <h3 className="section-title">Phân tích Chuyên sâu</h3>
            <div className="analytics-grid">
              <div className="chart-card dual-bar-chart">
                <div className="chart-wrapper">
                  <ResponsiveContainer>
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="onTime" name="Đúng giờ" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="late" name="Đi muộn" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột Sidebar (Phải) */}
        <div className="sidebar-column">

          {/* V. Khối Hoạt động & Cảnh báo (Live Feed & Alerts) */}
          <div className="live-feed-card">
            <div className="feed-header">
              <h3>Hoạt động Thời gian thực</h3>
              <Badge status="processing" text="Live" />
            </div>
            <div className="feed-list">
              {sortedFeed.map((log) => (
                <div key={log.id} className={`feed-item ${log.type === 'security_alert' ? 'alert-danger' : ''}`}>
                  {log.type === 'check_in' && <Avatar src={log.avatar} size="large" icon={<TeamOutlined />} />}
                  {log.type === 'security_alert' && <Avatar style={{ backgroundColor: '#ef4444' }} size="large" icon={<EnvironmentOutlined />} />}

                  <div className="feed-info">
                    <div className="feed-title">{log.title}</div>
                    <div className="feed-desc">{log.desc}</div>
                    <div className="feed-time">{new Date(log.time).toLocaleString('vi-VN')}</div>
                  </div>

                  <div className="feed-status">
                    {log.type === 'check_in' && (
                      log.status === 'late' ? <Tag color="error">Đi muộn</Tag> : <Tag color="success">Thành công</Tag>
                    )}
                    {log.type === 'security_alert' && <Tag color="red">Cảnh báo</Tag>}
                  </div>
                </div>
              ))}
              {sortedFeed.length === 0 && <p className="empty-text">Chưa có hoạt động nào</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrangTongQuanPage;
