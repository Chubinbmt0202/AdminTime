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
  FundProjectionScreenOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import './OrgAndHRPage.css';
import { departmentApi } from '../../../features/departments/api/department.api';
import { employeeApi } from '../../../features/employees/api/employee.api';
import { shiftApi } from '../../../features/settings/api/shift.api';
import type { Department } from '../../../types/department.types';
import type { Employee } from '../../../features/employees/types';
import { Spin, Popconfirm, message } from 'antd';
import AddDepartmentDrawer from '../../../features/departments/components/AddDepartmentDrawer';

const ROLE_MAP: Record<string, string> = {
  'Admin': 'Quản trị viên',
  'Manager': 'Quản lý nhân sự',
  'Employee': 'Nhân viên'
};
const getRoleNameVN = (roleName?: string | null) => roleName ? (ROLE_MAP[roleName] || roleName) : '';

export default function OrgAndHRPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<number | string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isAddDeptDrawerOpen, setIsAddDeptDrawerOpen] = useState(false);
  const [editingDeptData, setEditingDeptData] = useState<Department | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);

  const openAddDrawer = () => {
    setEditingDeptData(null);
    setIsAddDeptDrawerOpen(true);
  };

  const openEditDrawer = (dept: Department) => {
    setEditingDeptData(dept);
    setIsAddDeptDrawerOpen(true);
  };

  const handleDeleteDept = async (id: string) => {
    try {
      const res = await departmentApi.delete(id);
      if (res.success) {
        message.success('Xóa phòng ban thành công');
        fetchInitialData();
        if (selectedDeptId === id) {
          setSelectedDeptId(null);
        }
      } else {
        message.error(res.message || 'Không thể xóa phòng ban');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Lỗi xóa phòng ban';
      message.error(errorMsg);
    }
  };

  const getAvatarInitials = (name: string) => {
    if (!name) return 'UN';
    const words = name.trim().split(' ').filter(w => w.length > 0);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    if (!name) return '#ccc';
    const colors = ['#5145cd', '#0a93a6', '#099268', '#d97706', '#dc2626', '#4f46e5', '#db2777', '#7c3aed'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getDeptIcon = (nameInput: string | null) => {
    const name = nameInput?.toLowerCase() || '';
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

  const fetchInitialData = async () => {
    try {
      const [deptRes, empRes, shiftRes] = await Promise.all([
        departmentApi.getAll(),
        employeeApi.getAll(),
        shiftApi.getAllShifts()
      ]);
      console.log("Dữ liệu phòng ban", deptRes.data);
      if (deptRes.success) {
        setDepartments(deptRes.data);
        if (deptRes.data.length > 0 && selectedDeptId === null) {
          setSelectedDeptId(deptRes.data[0].id_phong_ban);
        }
      }
      if (empRes.success) {
        setAllEmployees(empRes.data);
      }
      if (shiftRes.success) {
        setShifts(shiftRes.data);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchEmployeesByDept = async () => {
      if (selectedDeptId === null) return;
      setLoadingEmployees(true);
      try {
        const response = await employeeApi.getByDepartment(selectedDeptId as number);
        console.log("Dữ liệu nhân viên", response.data);
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

  const totalEmp = allEmployees.length;
  const workingEmp = allEmployees.filter(e => e.trang_thai).length;
  const resignedEmp = totalEmp - workingEmp;

  const deptCounts = allEmployees.reduce((acc, emp) => {
    const deptName = emp.department_name || 'Khác';
    acc[deptName] = (acc[deptName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDepts = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const legendClasses = ['it', 'sales', 'marketing'];

  const selectedDeptName = (() => {
    if (selectedDeptId === null) return 'Tất cả';
    const dept = departments.find(d => d.id_phong_ban === selectedDeptId);
    return dept ? (dept.ten_phong_ban || dept.mo_ta) : 'Phòng ban';
  })();

  const availableRoles = Array.from(new Set(allEmployees.map(e => getRoleNameVN(e.role_name)).filter(Boolean)));

  const filteredEmployees = employees.filter(emp => {
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchName = emp.full_name?.toLowerCase().includes(lowerSearch);
      const matchId = String(emp.id_nhan_vien).includes(lowerSearch);
      if (!matchName && !matchId) return false;
    }
    
    if (selectedStatus !== 'all') {
      const isWorking = selectedStatus === 'active';
      if (emp.trang_thai !== isWorking) return false;
    }
    
    if (selectedRole !== 'all') {
      if (getRoleNameVN(emp.role_name) !== selectedRole) return false;
    }
    
    return true;
  });

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
            <div className="stat-value">{totalEmp}</div>
            <div className="stat-sub">
              <span className="working"><span className="dot"></span> {workingEmp} Đang làm</span>
              <span className="divider"></span>
              <span className="resigned"><span className="dot"></span> {resignedEmp} Đã nghỉ</span>
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
            <div className="stat-value">{departments.length} <span className="unit">Phòng ban</span></div>
            <div className="stat-info">
              <ApartmentOutlined /> Quy mô: {departments.length > 0 ? departments.length : 0} phòng ban chính
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
                {topDepts.map(([name, count], index) => {
                  const percentage = totalEmp > 0 ? Math.round((count / totalEmp) * 100) : 0;
                  return (
                    <li key={name}>
                      <span className={`legend-dot ${legendClasses[index % legendClasses.length]}`}></span> {name} <strong>{percentage}%</strong>
                    </li>
                  );
                })}
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
            <PlusCircleOutlined className="add-icon" onClick={openAddDrawer} style={{ cursor: 'pointer' }} />
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
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getDeptIcon(dept.ten_phong_ban || dept.mo_ta)} <span style={{ marginLeft: '8px' }}>{dept.ten_phong_ban || dept.mo_ta}</span>
                      </div>
                      {dept.id_ca_lam_viec && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', marginLeft: '24px' }}>
                          Ca làm: {
                            (() => {
                              const s = shifts.find(shift => (shift.id_ca_lam_viec || shift.id) === dept.id_ca_lam_viec);
                              return s ? (s.shift_name || s.ten_ca) : 'N/A';
                            })()
                          }
                        </div>
                      )}
                    </div>
                    {selectedDeptId === dept.id_phong_ban && (
                      <div className="dept-actions" style={{ display: 'flex', gap: '8px', paddingLeft: '8px' }}>
                        <EditOutlined 
                          onClick={(e) => { e.stopPropagation(); openEditDrawer(dept); }} 
                          style={{ color: '#1890ff' }} 
                        />
                        <Popconfirm 
                          title="Xóa phòng ban này?" 
                          onConfirm={(e) => { e?.stopPropagation(); handleDeleteDept(dept.id_phong_ban); }} 
                          onCancel={(e) => e?.stopPropagation()}
                        >
                          <DeleteOutlined onClick={(e) => e.stopPropagation()} style={{ color: '#ff4d4f' }} />
                        </Popconfirm>
                      </div>
                    )}
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
              <span>Phòng ban: {selectedDeptName}</span>
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
            <select className="filter-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="all">Trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Đã nghỉ việc</option>
            </select>
            <select className="filter-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
              <option value="all">Tất cả vai trò</option>
              {availableRoles.map(role => (
                <option key={role as string} value={role as string}>{role as string}</option>
              ))}
            </select>
            <button className="add-employee-btn" onClick={() => navigate('/employees')}>
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
                  <th>PHÒNG BAN</th>
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
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                      Không tìm thấy nhân viên nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id_nhan_vien}>
                      <td><span className="emp-id">#{emp.id_nhan_vien}</span></td>
                      <td>
                        <div className="name-cell">
                          {emp.hinh_anh ? (
                            <img src={emp.hinh_anh} alt={emp.full_name} className="emp-avatar" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div className="emp-avatar-initials" style={{ backgroundColor: getAvatarColor(emp.full_name) }}>
                              {getAvatarInitials(emp.full_name)}
                            </div>
                          )}
                          <div>
                            <div className="emp-name">{emp.full_name}</div>
                            <div className="emp-email">{emp.username}@timemaster.vn</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="emp-role">{getRoleNameVN(emp.role_name)}</span></td>
                      <td><span className={`dept-badge ${emp.department_name ? emp.department_name.toLowerCase().replace(/\s+/g, '-') : 'other'}`}>{emp.department_name || 'Chưa phân bổ'}</span></td>
                      <td><span className="emp-phone">{emp.phone_number || 'N/A'}</span></td>
                      <td><span className="emp-email">{emp.email}</span></td>
                      <td>
                        <span className={`status-badge ${emp.trang_thai ? 'active' : 'resigned'}`}>
                          <span className="dot"></span> {emp.trang_thai ? 'Hoạt động' : 'Đã nghỉ việc'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => navigate(`/employees/${emp.id_nhan_vien}`)}
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
            <span className="pagination-info">Hiển thị {filteredEmployees.length} nhân sự</span>
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
        onSuccess={fetchInitialData}
        initialData={editingDeptData}
      />
    </div>
  );
}
