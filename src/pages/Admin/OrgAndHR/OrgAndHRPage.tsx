import { useState } from 'react';
import { 
  TeamOutlined, 
  ApartmentOutlined, 
  PlusCircleOutlined,
  SearchOutlined,
  UserAddOutlined,
  MoreOutlined,
  CaretDownOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import './OrgAndHRPage.css';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'resigned';
  avatar: string;
}

const mockEmployees: Employee[] = [
  {
    id: '#TM120',
    name: 'Nguyễn Văn An',
    email: 'an.nv@timemaster.vn',
    role: 'Trưởng phòng IT',
    department: 'PHÒNG IT',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: '#TM121',
    name: 'Trần Thị Bình',
    email: 'binh.tt@timemaster.vn',
    role: 'Chuyên viên Marketing',
    department: 'MARKETING',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: '#TM122',
    name: 'Lê Mạnh Cường',
    email: 'cuong.lm@timemaster.vn',
    role: 'Nhân viên Vận hành',
    department: 'ADMIN',
    status: 'resigned',
    avatar: 'https://i.pravatar.cc/150?u=3'
  }
];

export default function OrgAndHRPage() {
  const [searchTerm, setSearchTerm] = useState('');

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
            <PlusCircleOutlined className="add-icon" />
          </div>

          <div className="org-tree">
             <div className="tree-item active">
               <ApartmentOutlined className="tree-icon" /> Ban Giám đốc
             </div>
             
             <div className="tree-group">
               <div className="tree-item group-parent">
                 <CaretDownOutlined /> KHỐI CÔNG NGHỆ
               </div>
               <div className="tree-item child active">
                 <span className="bullet"></span> Phòng IT
               </div>
               <div className="tree-item child">
                 <span className="bullet"></span> Phòng R&D
               </div>
             </div>

             <div className="tree-group">
               <div className="tree-item group-parent">
                 <CaretDownOutlined /> KHỐI KINH DOANH
               </div>
               <div className="tree-item child">
                 <span className="bullet"></span> Marketing
               </div>
               <div className="tree-item child">
                 <span className="bullet"></span> Sales
               </div>
             </div>

             <div className="tree-group">
               <div className="tree-item group-parent">
                 <CaretDownOutlined /> KHỐI VẬN HÀNH
               </div>
               <div className="tree-item child">
                 <span className="bullet"></span> Nhân sự (HR)
               </div>
               <div className="tree-item child">
                 <span className="bullet"></span> Admin
               </div>
             </div>
          </div>
        </aside>

        {/* Right Column: Employee Table */}
        <div className="employee-section">
          <div className="employee-toolbar">
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
              <option>Tất cả phòng ban</option>
            </select>
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
                  <th>PHÒNG BAN</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {mockEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td><span className="emp-id">{emp.id}</span></td>
                    <td>
                      <div className="name-cell">
                        <img src={emp.avatar} alt={emp.name} className="emp-avatar" />
                        <div>
                          <div className="emp-name">{emp.name}</div>
                          <div className="emp-email">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="emp-role">{emp.role}</span></td>
                    <td><span className={`dept-badge ${emp.department.toLowerCase().replace(' ', '-')}`}>{emp.department}</span></td>
                    <td>
                       <span className={`status-badge ${emp.status}`}>
                         <span className="dot"></span> {emp.status === 'active' ? 'Hoạt động' : 'Đã nghỉ việc'}
                       </span>
                    </td>
                    <td>
                      <button className="more-action-btn"><MoreOutlined /></button>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
