import React, { useState } from 'react';
import { 
  TeamOutlined, 
  ClockCircleOutlined, 
  UserDeleteOutlined, 
  CalendarOutlined,
  WifiOutlined,
  SyncOutlined,
  UserAddOutlined,
  GiftOutlined,
  ExclamationCircleFilled,
  FileTextOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Button, Progress, Badge, Select } from 'antd';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const [chartFilter, setChartFilter] = useState('week');

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-titles">
          <h2>Bức tranh Chấm công</h2>
          <p className="subtitle">Tổng quan tình hình nhân sự ngày hôm nay, 24/10/2023</p>
        </div>
        <div className="header-actions">
          <Button className="btn-wifi">Cập nhật WiFi</Button>
          <Button type="primary" className="btn-add-employee" icon={<UserAddOutlined />}>
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        {/* Sĩ số hôm nay */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Sĩ số hôm nay</span>
            <div className="stat-icon blue-icon"><TeamOutlined /></div>
          </div>
          <div className="stat-value-wrap">
            <span className="stat-val-main">248</span><span className="stat-val-sub">/256</span>
          </div>
          <div className="stat-trend up">+2% so với hôm qua</div>
        </div>

        {/* Đi muộn */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Đi muộn</span>
            <div className="stat-icon orange-icon"><ClockCircleOutlined /></div>
          </div>
          <div className="stat-value-wrap">
            <span className="stat-val-main">12</span>
          </div>
          <div className="stat-trend orange-text">Cần nhắc nhở (3)</div>
        </div>

        {/* Vắng mặt */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Vắng mặt</span>
            <div className="stat-icon red-icon"><UserDeleteOutlined /></div>
          </div>
          <div className="stat-value-wrap">
            <span className="stat-val-main">3</span>
          </div>
          <div className="stat-trend red-text">Chưa rõ lý do (1)</div>
        </div>

        {/* Nghỉ phép */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Nghỉ phép (Đã duyệt)</span>
            <div className="stat-icon lightblue-icon"><CalendarOutlined /></div>
          </div>
          <div className="stat-value-wrap">
            <span className="stat-val-main">5</span>
          </div>
          <div className="stat-trend normal-text">Có phép hợp lệ</div>
        </div>
      </div>

      {/* Main Grid 2 Columns */}
      <div className="main-grid">
        {/* Left Column (2/3) */}
        <div className="col-left">
          {/* Trend Chart */}
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3>Biểu đồ xu hướng</h3>
              <Select
                value={chartFilter}
                onChange={setChartFilter}
                style={{ width: 120, background: '#f8fafc', borderRadius: '8px' }}
                bordered={false}
                options={[
                  { value: 'day', label: 'Theo Ngày' },
                  { value: 'week', label: 'Theo Tuần' },
                  { value: 'month', label: 'Theo Tháng' },
                ]}
              />
            </div>
            <div className="bar-chart-container">
              <div className="chart-bars">
                <div className="chart-col">
                  <div className="bar" style={{ height: '60%' }}></div>
                  <span className="day-label">Thứ 2</span>
                </div>
                <div className="chart-col">
                  <div className="bar" style={{ height: '65%' }}></div>
                  <span className="day-label">Thứ 3</span>
                </div>
                <div className="chart-col">
                  <div className="bar active-bar" style={{ height: '90%' }}></div>
                  <span className="day-label">Thứ 4</span>
                </div>
                <div className="chart-col">
                  <div className="bar" style={{ height: '55%' }}></div>
                  <span className="day-label">Thứ 5</span>
                </div>
                <div className="chart-col">
                  <div className="bar" style={{ height: '60%' }}></div>
                  <span className="day-label">Thứ 6</span>
                </div>
              </div>
            </div>
          </div>

          {/* HR Summary */}
          <div className="dashboard-card hr-summary-card">
            <div className="card-header">
              <h3>Tóm tắt Nhân sự</h3>
              <span className="subtitle">Tháng 10, 2023</span>
            </div>
            
            <div className="hr-list">
              <div className="hr-item">
                <div className="hr-item-left">
                  <div className="hr-icon"><GiftOutlined /></div>
                  <span className="hr-text">Lịch sinh nhật sắp tới</span>
                </div>
                <div className="hr-val bold-text">5 người</div>
              </div>

              <div className="hr-item">
                <div className="hr-item-left">
                  <div className="hr-icon"><UserAddOutlined /></div>
                  <span className="hr-text">Nhân viên mới</span>
                </div>
                <div className="hr-val blue-text">+8 trong tháng</div>
              </div>
            </div>

            <div className="hr-progress-section">
              <div className="progress-labels">
                <span>Tổng trưởng nhân sự</span>
                <span className="progress-val">15%</span>
              </div>
              <Progress percent={15} showInfo={false} strokeColor="#2563eb" trailColor="#e2e8f0" />
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="col-right">
          {/* Alerts and Tasks */}
          <div className="dashboard-card alerts-card">
            <h3 className="card-header">Cảnh báo & Công việc</h3>
            
            <div className="alert-list">
              <div className="alert-item red-alert">
                <div className="alert-icon-wrap"><ExclamationCircleFilled className="icon-red" /></div>
                <div className="alert-content">
                  <div className="alert-title">Cảnh báo dữ liệu khuôn mặt</div>
                  <div className="alert-desc">3 nhân viên mới chưa đăng ký sinh trắc học.</div>
                  <div className="alert-action red-action">Xử lý ngay</div>
                </div>
              </div>

              <div className="alert-item normal-alert">
                <div className="alert-icon-wrap"><FileTextOutlined className="icon-blue" /></div>
                <div className="alert-content">
                  <div className="alert-title">Yêu cầu chờ duyệt (Nghỉ phép)</div>
                  <div className="alert-desc">Phòng Marketing, IT</div>
                </div>
                <Badge count={4} color="#2563eb" className="custom-badge" />
              </div>

              <div className="alert-item normal-alert">
                <div className="alert-icon-wrap"><InfoCircleOutlined className="icon-gray" /></div>
                <div className="alert-content">
                  <div className="alert-title">Giải trình chấm công</div>
                  <div className="alert-desc">Quên check-in, check-out lỗi mạng</div>
                </div>
                <Badge count={12} color="#f1f5f9" style={{ color: '#475569', boxShadow: 'none' }} className="custom-badge-gray" />
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="dashboard-card system-card">
            <h3 className="card-header">Tình trạng Hệ thống</h3>
            
            <div className="sys-status-grid">
              <div className="sys-item">
                <div className="sys-item-top">
                  <div className="sys-icon blue"><WifiOutlined /></div>
                  <div className="dot green"></div>
                </div>
                <div className="sys-name">Điểm phát WiFi</div>
                <div className="sys-desc">4/4 Đang hoạt động</div>
              </div>

              <div className="sys-item">
                <div className="sys-item-top">
                  <div className="sys-icon blue"><CheckCircleOutlined /></div>
                  <div className="dot green"></div>
                </div>
                <div className="sys-name">Vùng GPS</div>
                <div className="sys-desc">Hoạt động bình thường</div>
              </div>
            </div>

            <div className="sys-item full-width mt-12">
              <div className="sys-item-left">
                <div className="sys-icon gray"><SyncOutlined /></div>
                <div className="sys-info">
                  <div className="sys-name">Đồng bộ dữ liệu máy chấm công</div>
                  <div className="sys-desc">Cập nhật lần cuối: 5 phút trước</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
