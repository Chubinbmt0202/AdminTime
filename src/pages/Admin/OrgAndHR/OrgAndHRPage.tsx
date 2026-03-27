import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TeamOutlined,
  ApartmentOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UserAddOutlined,
  MoreOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  CrownOutlined,
  CodeOutlined,
  BulbOutlined,
  DollarOutlined,
  SettingOutlined,
  AuditOutlined,
  DesktopOutlined,
  RobotOutlined,
  ShareAltOutlined,
  FundProjectionScreenOutlined
} from '@ant-design/icons';
import './OrgAndHRPage.css';
import { departmentApi } from '../../../features/departments/api/department.api';
import { employeeApi } from '../../../features/employees/api/employee.api';
import type { Department } from '../../../types/department.types';
import type { Employee } from '../../../features/employees/types';
import { Spin } from 'antd'; // Assuming antd is used since icons are from antd
import AddDepartmentDrawer from '../../../features/departments/components/AddDepartmentDrawer';

export default function OrgAndHRPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isAddDeptDrawerOpen, setIsAddDeptDrawerOpen] = useState(false);

  const getDeptIcon = (mo_ta: string | null) => {
    const name = mo_ta?.toLowerCase() || '';
    if (name.includes('giám đốc')) return <CrownOutlined className="tree-icon" />;
    if (name.includes('it')) return <CodeOutlined className="tree-icon" />;
    if (name.includes('r&d') || name.includes('nghiên cứu')) return <RobotOutlined className="tree-icon" />;
    if (name.includes('marketing')) return <BulbOutlined className="tree-icon" />;
    if (name.includes('sales') || name.includes('bán hàng')) return <DollarOutlined className="tree-icon" />;
    if (name.includes('nhân sự') || name.includes('hr')) return <TeamOutlined className="tree-icon" />;
    if (name.includes('admin') || name.includes('hành chính')) return <SettingOutlined className="tree-icon" />;
    if (name.includes('kế toán')) return <AuditOutlined className="tree-icon" />;
    if (name.includes('vận hành')) return <ShareAltOutlined className="tree-icon" />;
    if (name.includes('công nghệ')) return <DesktopOutlined className="tree-icon" />;
    if (name.includes('kinh doanh')) return <FundProjectionScreenOutlined className="tree-icon" />;
    return <ApartmentOutlined className="tree-icon" />;
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      if (response.success) {
        setDepartments(response.data);
        if (response.data.length > 0 && selectedDeptId === null) {
          setSelectedDeptId(response.data[0].id_phong_ban);
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployeesByDept = async () => {
      if (selectedDeptId === null) return;
      setLoadingEmployees(true);
      try {
        const response = await employeeApi.getByDepartment(selectedDeptId);
        if (response.success) {
          setEmployees(response.data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployeesByDept();
  }, [selectedDeptId]);

  return (
    <div className="org-hr-container">
      {/* Top Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <TeamOutlined />
          </div>
          <div className="stat-content">
            <span className="stat-label">TỔNG NHÂN VIÊN</span>
            <div className="stat-value">120</div>
            <div className="stat-sub">
              <span className="working"><span className="dot"></span> 115 Đang làm</span>
              <span className="divider"></span>
              <span className="resigned"><span className="dot"></span> 5 Đã nghỉ</span>
            </div>
          </div>
          <button className="stat-more-btn">Tổng quát</button>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <ApartmentOutlined />
          </div>
          <div className="stat-content">
            <span className="stat-label">CƠ CẤU TỔ CHỨC</span>
            <div className="stat-value">8 <span className="unit">Phòng ban</span></div>
            <div className="stat-info">
              <ApartmentOutlined /> Quy mô: 2 chi nhánh chính
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content chart-container">
            <span className="stat-label">TỶ LỆ THEO PHÒNG BAN</span>
            <div className="donut-chart-wrapper">
              <div className="donut-chart">
                <svg viewBox="0 0 36 36" className="circular-chart blue">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray="40, 100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <ul className="chart-legend">
                <li><span className="legend-dot it"></span> IT <strong>40%</strong></li>
                <li><span className="legend-dot sales"></span> Sales <strong>25%</strong></li>
                <li><span className="legend-dot marketing"></span> Marketing <strong>20%</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="stat-card growth-card">
          <div className="growth-header">
            <span className="growth-label">TĂNG TRƯỞNG NHÂN SỰ</span>
            <div className="growth-value">+5% <ArrowUpOutlined /></div>
            <span className="growth-comparison">So với tháng trước</span>
          </div>
          <div className="growth-chart-bg">
            <div className="wave"></div>
          </div>
        </div>
      </div>

      <div className="main-content-layout">
        {/* Left Column: Organization Tree */}
        <aside className="org-sidebar">
          <div className="org-header">
            <h3>Cơ cấu tổ chức</h3>
            <PlusCircleOutlined className="add-icon" onClick={() => setIsAddDeptDrawerOpen(true)} style={{ cursor: 'pointer' }} />
          </div>

          <div className="org-tree">
            {loading ? (
              <div className="loading-wrapper"><Spin size="small" /> Đang tải...</div>
            ) : (
              <>
                {departments.map(dept => (
                  <div
                    key={dept.id_phong_ban}
                    className={`tree-item ${selectedDeptId === dept.id_phong_ban ? 'active' : ''}`}
                    onClick={() => setSelectedDeptId(dept.id_phong_ban)}
                  >
                    {getDeptIcon(dept.mo_ta)} {dept.ten_phong_ban}
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>

        {/* Right Column: Employee Table */}
        <div className="employee-section">
          <div className="employee-toolbar">
            <div>
              <span>Phòng ban: Marketing</span>
            </div>
            <div className="search-box">
              <SearchOutlined />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="filter-select">
              <option>Trạng thái</option>
            </select>
            <button className="add-employee-btn">
              <UserAddOutlined /> Thêm nhân viên
            </button>
          </div>

          <div className="table-wrapper">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>MÃ NV</th>
                  <th>HỌ VÀ TÊN</th>
                  <th>CHỨC VỤ</th>
                  <th>SỐ ĐIỆN THOẠI</th>
                  <th>EMAIL</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loadingEmployees ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                      <Spin /> Đang tải nhân viên...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                      Không có nhân viên nào trong phòng ban này.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id_nhan_vien}>
                      <td><span className="emp-id">#{emp.id_nhan_vien}</span></td>
                      <td>
                        <div className="name-cell">
                          <img src={`https://i.pravatar.cc/150?u=${emp.id_nhan_vien}`} alt={emp.full_name} className="emp-avatar" />
                          <div>
                            <div className="emp-name">{emp.full_name}</div>
                            <div className="emp-email">{emp.username}@timemaster.vn</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="emp-role">{emp.role_name}</span></td>
                      <td><span className={`dept-badge ${emp.phone_number?.toLowerCase().replace(' ', '-')}`}>{emp.phone_number}</span></td>
                      <td><span className="emp-email">{emp.email}</span></td>
                      <td>
                        <span className={`status-badge ${emp.trang_thai ? 'active' : 'resigned'}`}>
                          <span className="dot"></span> {emp.trang_thai ? 'Hoạt động' : 'Đã nghỉ việc'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="more-action-btn"
                            title="Xem chi tiết"
                            onClick={() => navigate(`/admin/employees/${emp.id_nhan_vien}`)}
                          >
                            <EyeOutlined />
                          </button>
                          <button className="more-action-btn"><MoreOutlined /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span className="pagination-info">Hiển thị 1-10 của 120 nhân sự</span>
            <div className="page-controls">
              <button className="page-btn disabled">&lt;</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">&gt;</button>
            </div>
          </div>
        </div>
      </div>

      <AddDepartmentDrawer
        open={isAddDeptDrawerOpen}
        onClose={() => setIsAddDeptDrawerOpen(false)}
        onSuccess={fetchDepartments}
      />
    </div>
  );
}
