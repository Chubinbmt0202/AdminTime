import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  StarOutlined,
  UserOutlined,
  IdcardOutlined,
  SmileOutlined,
  ArrowUpOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import './AdminDetailEmployeePage.css';
import { employeeApi } from '../../../features/employees/api/employee.api';

export default function AdminDetailEmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await employeeApi.getByID(id);
        if (res.success) {
          setEmployee(res.data);
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-detail-loading">
        <LoadingOutlined spin style={{ fontSize: 40, color: '#2563eb' }} />
        <p>Đang tải dữ liệu nhân viên...</p>
      </div>
    );
  }

  if (!employee) {
    return <div className="admin-detail-error">Không tìm thấy nhân viên. <button onClick={() => navigate(-1)}>Quay lại</button></div>;
  }

  const joinDate = employee.created_at ? new Date(employee.created_at).toLocaleDateString('vi-VN') : '12/01/2020';

  return (
    <div className="admin-emp-detail-container">
      {/* HEADER SECTION */}
      <div className="aed-header-card">
        <div className="aed-user-main">
          <div className="aed-avatar-wrap">
            <img src={`https://ui-avatars.com/api/?name=${employee.full_name}&background=0D8ABC&color=fff&size=120`} alt="Avatar" />
            <div className="aed-online-dot"></div>
          </div>
          <div className="aed-user-info">
            <div className="aed-name-row">
              <h1>{employee.full_name || 'Loading...'}</h1>
              <span className={`aed-status-badge ${employee.trang_thai === 'active' || employee.trang_thai === true ? 'active' : 'inactive'}`}>
                {employee.trang_thai === 'active' || employee.trang_thai === true ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <p className="aed-role-title">{employee.title || employee.role || 'Chưa cập nhật'}</p>
            <div className="aed-meta-row">
              <span className="aed-meta-item"><IdcardOutlined /> #{employee.ma_nhan_vien || employee.nhan_vien_id || id}</span>
              <span className="aed-meta-item"><UserOutlined /> Trụ sở chính, TP.HCM</span>
            </div>
          </div>
        </div>
        <div className="aed-header-actions">
          <button className="aed-btn-outline"><EditOutlined /> Cập nhật chức vụ</button>
          <button className="aed-btn-primary"><UserOutlined /> Chỉnh sửa hồ sơ</button>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="aed-stats-grid">
        <div className="aed-stat-card">
          <div className="aed-stat-top">
            <div className="aed-stat-icon-wrap" style={{ color: '#3b82f6', background: '#eff6ff' }}><CalendarOutlined /></div>
            <span className="aed-stat-trend positive"><ArrowUpOutlined /> 2%</span>
          </div>
          <div className="aed-stat-body">
            <p>Tỷ lệ chuyên cần</p>
            <h3>98%</h3>
          </div>
        </div>

        <div className="aed-stat-card">
          <div className="aed-stat-top">
            <div className="aed-stat-icon-wrap" style={{ color: '#f59e0b', background: '#fef3c7' }}><ClockCircleOutlined /></div>
            <span className="aed-stat-note">Tháng này</span>
          </div>
          <div className="aed-stat-body">
            <p>Tổng số giờ làm</p>
            <h3>168h</h3>
          </div>
        </div>

        <div className="aed-stat-card">
          <div className="aed-stat-top">
            <div className="aed-stat-icon-wrap" style={{ color: '#64748b', background: '#f1f5f9' }}><FileTextOutlined /></div>
            <span className="aed-stat-note text-red">12/15 ngày</span>
          </div>
          <div className="aed-stat-body">
            <p>Ngày phép còn lại</p>
            <h3>12 Ngày</h3>
          </div>
        </div>

        <div className="aed-stat-card">
          <div className="aed-stat-top">
            <div className="aed-stat-icon-wrap" style={{ color: '#3b82f6', background: '#eff6ff' }}><StarOutlined /></div>
            <span className="aed-stat-badge top">TOP</span>
          </div>
          <div className="aed-stat-body">
            <p>Điểm hiệu suất</p>
            <h3>A+</h3>
          </div>
        </div>
      </div>

      {/* MID SECTION: INFO BLOCKS */}
      <div className="aed-mid-grid">
        {/* Personal Info */}
        <div className="aed-info-card">
          <div className="aed-card-header">
            <h4><UserOutlined /> Thông tin cá nhân</h4>
            <a href="#" className="aed-link">Chỉnh sửa</a>
          </div>
          <div className="aed-info-grid">
            <div className="info-item">
              <label>HỌ VÀ TÊN</label>
              <span>{employee.full_name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>NGÀY SINH</label>
              <span>{employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
            </div>
            <div className="info-item">
              <label>GIỚI TÍNH</label>
              <span>{employee.gender || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-item">
              <label>EMAIL</label>
              <span>{employee.email || `${employee.username || ''}@timemaster.vn`}</span>
            </div>
            <div className="info-item">
              <label>SỐ ĐIỆN THOẠI</label>
              <span>{employee.phone_number || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-item">
              <label>ĐỊA CHỈ</label>
              <span>{employee.address || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Work / Face Info col */}
        <div className="aed-right-col">
          <div className="aed-work-card">
            <h4><IdcardOutlined /> Thông tin công việc</h4>
            <div className="aed-info-grid">
              <div className="info-item">
                <label>PHÒNG BAN</label>
                <span className="fw-600">{employee.department_name || employee.department || `Mã phòng: ${employee.department_id || 'Chưa phân bổ'}`}</span>
              </div>
              <div className="info-item">
                <label>VỊ TRÍ HIỆN TẠI</label>
                <span className="text-blue fw-600">{employee.title || employee.role || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <label>NGÀY GIA NHẬP</label>
                <span className="fw-600">{employee.start_date ? new Date(employee.start_date).toLocaleDateString('vi-VN') : joinDate}</span>
              </div>
              <div className="info-item">
                <label>LOẠI HỢP ĐỒNG</label>
                <span className="fw-600">Vô thời hạn</span>
              </div>
            </div>
          </div>

          <div className="aed-face-card">
            <div className="face-icon-box"><SmileOutlined /></div>
            <div className="face-text">
              <h5>Dữ liệu khuôn mặt</h5>
              <p>{employee.is_face_updated ? 'Đã đăng ký hệ thống Smart-Check' : 'Chưa đăng ký khuôn mặt'}</p>
            </div>
            <div className="face-confidence">
              {employee.is_face_updated ? (
                <>
                  <span className="conf-value" style={{ color: '#22c55e' }}><UserOutlined className="check-icon" /> Sẵn sàng</span>
                  <span className="conf-label">TRẠNG THÁI</span>
                </>
              ) : (
                <>
                  <span className="conf-value" style={{ color: '#ef4444' }}>Trống</span>
                  <span className="conf-label">TRẠNG THÁI</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="aed-bottom-grid">
        {/* Chart */}
        <div className="aed-chart-card">
          <div className="aed-card-header no-border">
            <div>
              <h4>Xu hướng hiệu suất</h4>
              <p className="sub-text">Dữ liệu 6 tháng gần nhất</p>
            </div>
            <div className="legend">
              <span className="dot blue"></span> KPI
              <span className="dot gray ml-3"></span> Trung bình
            </div>
          </div>
          <div className="aed-chart-placeholder">
            {/* Mock chart layout just to look like the image visually */}
            <div className="mock-chart-lines">
              {/* Very basic manual scatter plot simulation to match layout */}
            </div>
            <div className="chart-x-axis">
              <span>Tháng 1</span>
              <span>Tháng 2</span>
              <span>Tháng 3</span>
              <span>Tháng 4</span>
              <span>Tháng 5</span>
              <span className="current">Hiện tại</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="aed-activity-card">
          <h4>Hoạt động gần đây</h4>
          <div className="activity-timeline">

            <div className="timeline-item">
              <div className="t-dot green"></div>
              <div className="t-content">
                <h5>Chấm công vào</h5>
                <p>08:30 AM - Hôm nay</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="t-dot blue"></div>
              <div className="t-content">
                <h5>Yêu cầu nghỉ phép được duyệt</h5>
                <p>04:15 PM - Hôm qua</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="t-dot gray"></div>
              <div className="t-content">
                <h5>Hoàn thành báo cáo tháng</h5>
                <p>09:00 AM - 12/10/2023</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="t-dot red"></div>
              <div className="t-content">
                <h5>Tham gia cuộc họp quý</h5>
                <p>02:00 PM - 11/10/2023</p>
              </div>
            </div>

          </div>
          <a href="#" className="aed-view-all">Xem tất cả hoạt động &rarr;</a>
        </div>
      </div>
    </div>
  );
}
