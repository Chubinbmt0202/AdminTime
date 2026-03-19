import React from 'react';
import { 
  TeamOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  UserAddOutlined,
  CalendarOutlined,
  SendOutlined,
  HistoryOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { Progress, Avatar, Button, Card, Row, Col, Space, Typography } from 'antd';
import './DashboardPage.css';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const today = "Thứ Hai, ngày 24 tháng 5 năm 2024";

  // Mock data for stat cards
  const stats = [
    { title: 'TỔNG SỐ NHÂN VIÊN', value: '1,248', trend: '+12%', icon: <TeamOutlined />, color: '#2563eb' },
    { title: 'CHUYÊN CẦN HÔM NAY', value: '94.2%', trend: 'Ổn định', icon: <CheckCircleOutlined />, color: '#10b981' },
    { title: 'ĐƠN TỪ CHỜ DUYỆT', value: '24', trend: 'Cần xử lý', icon: <ClockCircleOutlined />, color: '#f59e0b' },
    { title: 'NHÂN VIÊN MỚI (THÁNG)', value: '18', trend: 'Gia nhập', icon: <UserAddOutlined />, color: '#8b5cf6' },
  ];

  // Mock data for leave requests
  const leaveRequests = [
    { name: 'Lê Hoàng Nam', reason: 'Nghỉ phép năm • 2 ngày', avatar: 'https://i.pravatar.cc/150?u=1' },
    { name: 'Nguyễn Thu Thủy', reason: 'Nghỉ ốm • 1 ngày', avatar: 'https://i.pravatar.cc/150?u=2' },
    { name: 'Trần Anh Đức', reason: 'Thai sản • 6 tháng', avatar: 'https://i.pravatar.cc/150?u=3' },
  ];

  // Mock data for activities
  const activities = [
    { user: 'Phạm Minh Quang', action: 'vừa chấm công vào', detail: 'Văn phòng Miền Nam • 08:05 AM', type: 'attendance' },
    { user: 'Đặng Thị Mai', action: 'gửi đơn xin nghỉ phép', detail: 'Phòng Marketing • 09:12 AM', type: 'leave' },
    { user: 'Phòng HR', action: 'đã phê duyệt đơn của Hoàng Trung', detail: 'Trụ sở chính • 09:45 AM', type: 'system' },
  ];

  // Mock data for department structure
  const structure = [
    { dept: 'PHÒNG KỸ THUẬT', percent: 35 },
    { dept: 'PHÒNG KINH DOANH', percent: 28 },
    { dept: 'MARKETING', percent: 15 },
    { dept: 'HR & VẬN HÀNH', percent: 12 },
    { dept: 'KHÁC', percent: 10 },
  ];

  return (
    <div className="dashboard-container">
      {/* Upper Header */}
      <div className="dashboard-header">
        <div className="header-titles">
          <Title level={2}>Tổng quan Hệ thống</Title>
          <Text type="secondary">Chào buổi sáng, hôm nay là {today}</Text>
        </div>
        <div className="header-actions">
          <Button icon={<CalendarOutlined />}>Xem báo cáo tháng</Button>
          <Button type="primary" icon={<UserAddOutlined />}>Tạo nhân viên mới</Button>
        </div>
      </div>

      {/* Stat Cards Section */}
      <div className="stat-cards-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-info">
              <Text className="stat-title">{stat.title}</Text>
              <div className="stat-main">
                <span className="stat-value">{stat.value}</span>
                <span className={`stat-trend ${stat.trend.includes('+') ? 'up' : ''}`}>{stat.trend}</span>
              </div>
            </div>
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Lists Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column */}
        <div className="grid-left">
          
          {/* Attendance Bar Chart */}
          <Card className="chart-card dashboard-widget">
            <div className="widget-header">
              <Title level={4}>Phân tích Chấm công</Title>
              <Text type="secondary">7 NGÀY VỪA QUA</Text>
              <div className="chart-legend">
                <span><span className="dot on-time"></span> Đúng giờ</span>
                <span><span className="dot late"></span> Đi muộn</span>
              </div>
            </div>
            <div className="bar-chart">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
                <div key={day} className="bar-group">
                  <div className="bar-rail">
                    <div className="bar on-time" style={{ height: `${60 + Math.random() * 30}%` }}></div>
                    <div className="bar late" style={{ height: `${10 + Math.random() * 20}%` }}></div>
                  </div>
                  <Text className="bar-label">{day}</Text>
                </div>
              ))}
            </div>
          </Card>

          {/* Leave Requests List */}
          <Card className="list-card dashboard-widget">
            <div className="widget-header">
              <Title level={4}>Đơn xin nghỉ mới nhất</Title>
              <Button type="link">Tất cả đơn từ</Button>
            </div>
            <div className="leave-list">
              {leaveRequests.map((req, i) => (
                <div key={i} className="leave-item">
                  <Avatar src={req.avatar} size={48} />
                  <div className="leave-info">
                    <Text className="leave-name">{req.name}</Text>
                    <Text type="secondary" className="leave-reason">{req.reason}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="activity-card dashboard-widget">
            <Title level={4}>Hoạt động Gần đây</Title>
            <div className="activity-timeline">
              {activities.map((act, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-icon-wrap ${act.type}`}>
                    {act.type === 'attendance' && <HistoryOutlined />}
                    {act.type === 'leave' && <CalendarOutlined />}
                    {act.type === 'system' && <CheckCircleOutlined />}
                  </div>
                  <div className="activity-content">
                    <Text className="activity-text">
                      <span className="heavy">{act.user}</span> {act.action}
                    </Text>
                    <Text type="secondary" className="activity-detail">{act.detail}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="grid-right">
          
          {/* Current Status Circular Chart */}
          <div className="status-card-wrap">
            <Card className="status-card dashboard-widget">
              <Title level={4} className="white">Trạng thái hiện tại</Title>
              <Text className="white opacity-70">HÔM NAY - 10:30 AM</Text>
              
              <div className="circular-chart-wrap">
                <svg viewBox="0 0 100 100" className="circular-chart">
                  <circle cx="50" cy="50" r="40" className="circle-bg" />
                  <circle cx="50" cy="50" r="40" className="circle-progress" strokeDasharray="251.2" strokeDashoffset="15" />
                </svg>
                <div className="chart-center">
                  <span className="percent">94%</span>
                  <span className="label">CÓ MẶT</span>
                </div>
              </div>

              <div className="status-stats">
                <div className="status-row"><span className="dot has"></span> Có mặt <strong>1,175</strong></div>
                <div className="status-row"><span className="dot late"></span> Đi muộn <strong>42</strong></div>
                <div className="status-row"><span className="dot absent"></span> Vắng mặt <strong>31</strong></div>
              </div>
            </Card>
          </div>

          {/* HR Structure */}
          <Card className="structure-card dashboard-widget">
            <Title level={4}>Cơ cấu Nhân sự</Title>
            <div className="structure-list">
              {structure.map((item, i) => (
                <div key={i} className="structure-item">
                  <div className="structure-header">
                    <Text className="dept-name">{item.dept}</Text>
                    <Text className="dept-percent">{item.percent}%</Text>
                  </div>
                  <Progress percent={item.percent} showInfo={false} strokeColor="#2563eb" />
                </div>
              ))}
            </div>
          </Card>

          {/* Violation Alerts */}
          <Card className="alert-card dashboard-widget">
            <Title level={4}><span className="alert-icon">⚠️</span> Cảnh báo Vi phạm</Title>
            <div className="alert-list">
              {[
                { initial: 'VH', name: 'Vương Huy', count: 5 },
                { initial: 'TP', name: 'Trần Phương', count: 4 },
              ].map((alert, i) => (
                <div key={i} className="alert-item">
                  <Avatar className="alert-avatar">{alert.initial}</Avatar>
                  <div className="alert-info">
                    <Text className="alert-name">{alert.name}</Text>
                    <Text type="danger" className="alert-count">Đi muộn {alert.count} lần trong tháng</Text>
                  </div>
                  <Button type="link" className="reminder-btn">Gửi nhắc nhở</Button>
                </div>
              ))}
            </div>
            <Button block className="view-discipline-btn">Xem danh sách kỷ luật</Button>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
