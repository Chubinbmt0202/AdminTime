import { useState, useMemo, useEffect } from 'react'
import {
  SearchOutlined,
  DownloadOutlined,
  UserAddOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ReloadOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useToast } from '../components/Toast'
import './EmployeesPage.css'
import AddEmployeeDrawer from './AddEmployeeDrawer'

// Khớp với response từ API backend
interface Employee {
  id: number
  username: string
  full_name: string
  role: string
  is_face_updated: boolean
  created_at: string
}

const STATUSES = ['Tất cả trạng thái', 'Đã đăng ký', 'Chưa đăng ký']

const AVATAR_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#db2777', '#2563eb', '#65a30d', '#ea580c',
]

const PAGE_SIZE_OPTIONS = [10, 20, 50]

// Lấy 2 chữ đầu tên để làm avatar
function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Format ngày từ ISO string
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function EmployeesPage() {
  const toast = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Tất cả trạng thái')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // State xác nhận xoá
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Lấy danh sách vai trò động từ dữ liệu API
  const roleOptions = useMemo(() => {
    const roles = [...new Set(employees.map(e => e.role).filter(Boolean))]
    return ['Tất cả vai trò', ...roles.sort()]
  }, [employees])

  const [role, setRole] = useState('Tất cả vai trò')

  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:3001/api/employees/getAll')
      if (!res.ok) throw new Error(`Lỗi ${res.status}: ${res.statusText}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Lỗi không xác định')
      setEmployees(json.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối tới server'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const filtered = useMemo(() => {
    return employees.filter(emp => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        emp.full_name.toLowerCase().includes(q) ||
        emp.username.toLowerCase().includes(q) ||
        String(emp.id).includes(q) ||
        emp.role.toLowerCase().includes(q)
      const matchRole = role === 'Tất cả vai trò' || emp.role === role
      const matchStatus =
        status === 'Tất cả trạng thái' ||
        (status === 'Đã đăng ký' && emp.is_face_updated) ||
        (status === 'Chưa đăng ký' && !emp.is_face_updated)
      return matchSearch && matchRole && matchStatus
    })
  }, [employees, search, role, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
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

  const toggleOne = (id: number) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const clearSelection = () => setSelected(new Set())

  // Xóa nhân viên
  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`http://localhost:3001/api/employees/delete/${confirmDelete.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Xóa thất bại')
      toast.success('Xóa nhân viên thành công', `Đã xóa ${confirmDelete.full_name}`)
      // Xóa khỏi selected nếu có
      setSelected(prev => {
        const next = new Set(prev)
        next.delete(confirmDelete.id)
        return next
      })
      fetchEmployees()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định'
      toast.error('Không thể xóa nhân viên', msg)
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }

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
    <>
      <div className="emp-page">
        {/* Header */}
        <div className="emp-header">
          <div className="emp-header-left">
            <h1 className="emp-title">Danh sách nhân viên</h1>
            <p className="emp-subtitle">
              {loading
                ? 'Đang tải dữ liệu...'
                : error
                  ? 'Không thể tải dữ liệu'
                  : `Quản lý và theo dõi ${employees.length.toLocaleString()} nhân viên trong hệ thống.`
              }
            </p>
          </div>
          <div className="emp-header-actions">
            <button className="btn-secondary" onClick={fetchEmployees} disabled={loading}>
              <ReloadOutlined spin={loading} />
            </button>
            <button className="btn-secondary">
              <DownloadOutlined /> Xuất dữ liệu nhân viên
            </button>
            <button className="btn-primary" onClick={() => setDrawerOpen(true)}>
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
              placeholder="Tìm theo tên, username, mã NV, vai trò..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select className="emp-select" value={role} onChange={e => handleRole(e.target.value)}>
            {roleOptions.map(r => <option key={r}>{r}</option>)}
          </select>
          <select className="emp-select" value={status} onChange={e => handleStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="emp-bulk-bar">
            <span className="emp-bulk-count">{selected.size} ĐÃ CHỌN</span>
            <div className="emp-bulk-actions">
              <button className="bulk-btn"><DownloadOutlined /> Xuất file</button>
              <button className="bulk-btn bulk-btn-danger"><DeleteOutlined /> Xóa</button>
            </div>
            <button className="bulk-close" onClick={clearSelection}>✕</button>
          </div>
        )}

        {/* Table */}
        <div className="emp-table-wrap">
          {/* Loading state */}
          {loading && (
            <div className="emp-loading">
              <LoadingOutlined style={{ fontSize: 32, color: '#2563eb' }} spin />
              <span>Đang tải danh sách nhân viên...</span>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="emp-error">
              <span className="emp-error-icon">⚠️</span>
              <span>{error}</span>
              <button className="btn-secondary" style={{ marginTop: 12 }} onClick={fetchEmployees}>
                <ReloadOutlined /> Thử lại
              </button>
            </div>
          )}

          {/* Table content */}
          {!loading && !error && (
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
                  <th>ID</th>
                  <th>USERNAME</th>
                  <th>HỌ VÀ TÊN</th>
                  <th>VAI TRÒ</th>
                  <th>DỮ LIỆU KHUÔN MẶT</th>
                  <th>NGÀY TẠO</th>
                  <th className="col-action">HÀNH ĐỘNG</th>
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
                    <td className="col-id">#{emp.id}</td>
                    <td className="col-username">{emp.username}</td>
                    <td className="col-name">
                      <div
                        className="emp-avatar"
                        style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                      >
                        {getInitials(emp.full_name)}
                      </div>
                      <span className="emp-name">{emp.full_name}</span>
                    </td>
                    <td className="col-role">{emp.role || <span className="col-empty">—</span>}</td>
                    <td className="col-face">
                      {emp.is_face_updated ? (
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
                    <td className="col-date">{formatDate(emp.created_at)}</td>
                    <td className="col-action">
                      <div className="row-actions">
                        <button className="row-btn" title="Xem"><EyeOutlined /></button>
                        <button className="row-btn" title="Sửa"><EditOutlined /></button>
                        <button className="row-btn row-btn-danger" title="Xóa" onClick={() => setConfirmDelete(emp)}><DeleteOutlined /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && (
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
        )}
      </div>

      <AddEmployeeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          fetchEmployees()
          setDrawerOpen(false)
        }}
      />

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <>
          <div className="confirm-overlay" onClick={() => !deleting && setConfirmDelete(null)} />
          <div className="confirm-dialog">
            <div className="confirm-icon">
              <ExclamationCircleOutlined />
            </div>
            <h3 className="confirm-title">Xác nhận xoá nhân viên</h3>
            <p className="confirm-message">
              Bạn có chắc chắn muốn xoá <strong>{confirmDelete.full_name}</strong> (#{confirmDelete.id})?
              <br />Hành động này không thể hoàn tác.
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-btn-cancel"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >
                Huỷ bỏ
              </button>
              <button
                className="confirm-btn-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? <><LoadingOutlined spin /> Đang xoá...</>
                  : <><DeleteOutlined /> Xoá nhân viên</>
                }
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
