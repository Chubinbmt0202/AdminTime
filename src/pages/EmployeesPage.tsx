import { useState, useMemo } from 'react'
import {
  SearchOutlined,
  DownloadOutlined,
  UserAddOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  FilterOutlined,
  ImportOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import './EmployeesPage.css'

type FaceStatus = 'registered' | 'unregistered'

interface Employee {
  id: string
  name: string
  role: string
  department: string
  faceStatus: FaceStatus
  createdAt: string
  performance: number
  avatar: string
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: '#ENG-9042', name: 'Jordan Smith', role: 'Senior Software Architect', department: 'Engineering', faceStatus: 'registered', createdAt: '12/05/2023', performance: 92, avatar: 'JS' },
  { id: '#PRO-1234', name: 'Sarah Chen', role: 'Principal Designer', department: 'Design', faceStatus: 'registered', createdAt: '15/06/2023', performance: 100, avatar: 'SC' },
  { id: '#LGL-7721', name: 'Elena Rodriguez', role: 'General Counsel', department: 'Legal', faceStatus: 'unregistered', createdAt: '20/08/2023', performance: 78, avatar: 'ER' },
  { id: '#OPS-0001', name: 'Marcus Aurelius', role: 'Chief Operations Officer', department: 'Operations', faceStatus: 'registered', createdAt: '10/01/2023', performance: 95, avatar: 'MA' },
  { id: '#ENG-3301', name: 'Aiko Tanaka', role: 'Frontend Developer', department: 'Engineering', faceStatus: 'registered', createdAt: '03/02/2024', performance: 88, avatar: 'AT' },
  { id: '#MKT-5502', name: 'Lucas Oliveira', role: 'Marketing Manager', department: 'Marketing', faceStatus: 'unregistered', createdAt: '22/03/2024', performance: 74, avatar: 'LO' },
  { id: '#HR-0099', name: 'Priya Sharma', role: 'HR Business Partner', department: 'HR', faceStatus: 'registered', createdAt: '08/09/2023', performance: 91, avatar: 'PS' },
  { id: '#FIN-2210', name: 'David Park', role: 'Senior Accountant', department: 'Finance', faceStatus: 'registered', createdAt: '14/11/2023', performance: 85, avatar: 'DP' },
  { id: '#ENG-4480', name: 'Sofia Müller', role: 'DevOps Engineer', department: 'Engineering', faceStatus: 'unregistered', createdAt: '01/04/2024', performance: 69, avatar: 'SM' },
  { id: '#DES-0820', name: 'Carlos Mendez', role: 'UX Researcher', department: 'Design', faceStatus: 'registered', createdAt: '19/07/2023', performance: 97, avatar: 'CM' },
]

const DEPARTMENTS = ['Tất cả phòng ban', 'Engineering', 'Design', 'Legal', 'Operations', 'Marketing', 'HR', 'Finance']
const ROLES = ['Tất cả vai trò', 'Senior Software Architect', 'Principal Designer', 'General Counsel', 'Chief Operations Officer', 'Frontend Developer', 'Marketing Manager', 'HR Business Partner', 'Senior Accountant', 'DevOps Engineer', 'UX Researcher']
const STATUSES = ['Tất cả trạng thái', 'Đã đăng ký', 'Chưa đăng ký']

const AVATAR_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#db2777', '#2563eb', '#65a30d', '#ea580c',
]

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('Tất cả phòng ban')
  const [role, setRole] = useState('Tất cả vai trò')
  const [status, setStatus] = useState('Tất cả trạng thái')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    return MOCK_EMPLOYEES.filter(emp => {
      const q = search.toLowerCase()
      const matchSearch = !q || emp.name.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q) || emp.role.toLowerCase().includes(q)
      const matchDept = department === 'Tất cả phòng ban' || emp.department === department
      const matchRole = role === 'Tất cả vai trò' || emp.role === role
      const matchStatus =
        status === 'Tất cả trạng thái' ||
        (status === 'Đã đăng ký' && emp.faceStatus === 'registered') ||
        (status === 'Chưa đăng ký' && emp.faceStatus === 'unregistered')
      return matchSearch && matchDept && matchRole && matchStatus
    })
  }, [search, department, role, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Reset về trang 1 khi filter thay đổi
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleDept = (v: string) => { setDepartment(v); setPage(1) }
  const handleRole = (v: string) => { setRole(v); setPage(1) }
  const handleStatus = (v: string) => { setStatus(v); setPage(1) }

  const allChecked = paginated.length > 0 && paginated.every(e => selected.has(e.id))
  const someChecked = paginated.some(e => selected.has(e.id))

  const toggleAll = () => {
    if (allChecked) {
      const next = new Set(selected)
      paginated.forEach(e => next.delete(e.id))
      setSelected(next)
    } else {
      const next = new Set(selected)
      paginated.forEach(e => next.add(e.id))
      setSelected(next)
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const clearSelection = () => setSelected(new Set())

  const getPageNumbers = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1, 2, 3)
      if (page > 4) pages.push('...')
      if (page > 3 && page < totalPages - 2) pages.push(page)
      if (page < totalPages - 3) pages.push('...')
      pages.push(totalPages - 1, totalPages)
    }
    return [...new Set(pages)]
  }

  return (
    <div className="emp-page">
      {/* Header */}
      <div className="emp-header">
        <div className="emp-header-left">
          <h1 className="emp-title">Danh sách nhân viên</h1>
          <p className="emp-subtitle">Quản lý và theo dõi {MOCK_EMPLOYEES.length.toLocaleString()} nhân viên trong hệ thống.</p>
        </div>
        <div className="emp-header-actions">
          <button className="btn-secondary">
            <ImportOutlined /> Xuất dữ liệu nhân viên
          </button>
          <button className="btn-primary">
            <UserAddOutlined /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="emp-filters">
        <div className="emp-search-wrap">
          <SearchOutlined className="emp-search-icon" />
          <input
            className="emp-search"
            placeholder="Tìm theo tên, mã NV hoặc email..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <select className="emp-select" value={department} onChange={e => handleDept(e.target.value)}>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="emp-select" value={role} onChange={e => handleRole(e.target.value)}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="emp-select" value={status} onChange={e => handleStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-icon" title="Bộ lọc nâng cao"><FilterOutlined /></button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="emp-bulk-bar">
          <span className="emp-bulk-count">{selected.size} ĐÃ CHỌN</span>
          <div className="emp-bulk-actions">
            <button className="bulk-btn"><DownloadOutlined /> Xuất file</button>
            <button className="bulk-btn"><CheckCircleFilled style={{ color: '#2563eb' }} /> Trạng thái</button>
            <button className="bulk-btn bulk-btn-danger"><DeleteOutlined /> Xóa</button>
          </div>
          <button className="bulk-close" onClick={clearSelection}>✕</button>
        </div>
      )}

      {/* Table */}
      <div className="emp-table-wrap">
        <table className="emp-table">
          <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  className="emp-checkbox"
                  checked={allChecked}
                  ref={el => { if (el) el.indeterminate = someChecked && !allChecked }}
                  onChange={toggleAll}
                />
              </th>
              <th>MÃ NHÂN VIÊN</th>
              <th>HỌ VÀ TÊN</th>
              <th>VAI TRÒ</th>
              <th>DỮ LIỆU KHUÔN MẶT</th>
              <th>NGÀY TẠO</th>
              <th>HIỆU SUẤT</th>
              <th className="col-action"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="emp-empty">Không tìm thấy nhân viên nào.</td>
              </tr>
            ) : paginated.map((emp, idx) => (
              <tr key={emp.id} className={selected.has(emp.id) ? 'row-selected' : ''}>
                <td className="col-check">
                  <input
                    type="checkbox"
                    className="emp-checkbox"
                    checked={selected.has(emp.id)}
                    onChange={() => toggleOne(emp.id)}
                  />
                </td>
                <td className="col-id">{emp.id}</td>
                <td className="col-name">
                  <div
                    className="emp-avatar"
                    style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                  >
                    {emp.avatar}
                  </div>
                  <span className="emp-name">{emp.name}</span>
                </td>
                <td className="col-role">{emp.role}</td>
                <td className="col-face">
                  {emp.faceStatus === 'registered' ? (
                    <span className="face-badge face-registered">
                      <CheckCircleFilled />
                      Đã đăng ký
                    </span>
                  ) : (
                    <span className="face-badge face-unregistered">
                      <CloseCircleFilled />
                      Chưa đăng ký
                    </span>
                  )}
                </td>
                <td className="col-date">{emp.createdAt}</td>
                <td className="col-perf">
                  <div className="perf-wrap">
                    <div className="perf-bar-track">
                      <div
                        className="perf-bar-fill"
                        style={{
                          width: `${emp.performance}%`,
                          background: emp.performance >= 90
                            ? '#2563eb'
                            : emp.performance >= 75
                              ? '#0891b2'
                              : '#f59e0b',
                        }}
                      />
                    </div>
                    <span className="perf-pct">{emp.performance}%</span>
                  </div>
                </td>
                <td className="col-action">
                  <div className="row-actions">
                    <button className="row-btn" title="Xem"><EyeOutlined /></button>
                    <button className="row-btn" title="Sửa"><EditOutlined /></button>
                    <button className="row-btn row-btn-danger" title="Xóa"><DeleteOutlined /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="emp-pagination">
        <div className="pag-info">
          Hiển thị {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} trong số {filtered.length} kết quả
          <span className="pag-per-page">
            &nbsp;· Mỗi trang:
            <select
              className="pag-size-select"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
            >
              {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </span>
        </div>
        <div className="pag-controls">
          <button className="pag-btn" onClick={() => setPage(1)} disabled={page === 1}><DoubleLeftOutlined /></button>
          <button className="pag-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><LeftOutlined /></button>
          {getPageNumbers().map((p, i) =>
            p === '...'
              ? <span key={`dots-${i}`} className="pag-dots">…</span>
              : <button
                key={p}
                className={`pag-btn ${page === p ? 'pag-btn-active' : ''}`}
                onClick={() => setPage(p as number)}
              >{p}</button>
          )}
          <button className="pag-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><RightOutlined /></button>
          <button className="pag-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}><DoubleRightOutlined /></button>
        </div>
      </div>
    </div>
  )
}
