import { useState, useMemo, useEffect } from 'react';
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
} from '@ant-design/icons';

// Import từ cấu trúc mới
import { useThongBao } from '../../components/common/Toast/ThongBaoToast';
import DrawerThemNhanVien from '../../features/employees/components/DrawerThemNhanVien';
import { employeeApi } from '../../features/employees/api/nhanVien.api';
import type { Employee } from '../../features/employees/types';
import { STATUSES, AVATAR_COLORS, PAGE_SIZE_OPTIONS } from '../../constants';
import { dinhDangNgay } from '../../utils/tienIchNgay';
import { layChuCaiDau } from '../../utils/tienIchChuoi';
import { xuatRaExcel } from '../../utils/tienIchXuatFile';
import './QuanLyNhanVien.css';
import { useNavigate } from 'react-router-dom';

const ROLE_MAP: Record<string, string> = {
  'Admin': 'Quản trị viên',
  'Manager': 'Quản lý nhân sự',
  'Employee': 'Nhân viên'
};
const getRoleNameVN = (roleName?: string | null) => roleName ? (ROLE_MAP[roleName] || roleName) : '';

export default function QuanLyNhanVienPage() {
  const toast = useThongBao();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigator = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Tất cả trạng thái');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // State xác nhận xoá
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lấy danh sách vai trò động từ dữ liệu API
  const roleOptions = useMemo(() => {
    const roles = [...new Set(employees.map(e => getRoleNameVN(e.role_name)).filter(Boolean))];
    return ['Tất cả vai trò', ...roles.sort()];
  }, [employees]);

  const [role, setRole] = useState('Tất cả vai trò');

  // Lấy dữ liệu thông qua API Service
  const taiDanhSachNhanVien = async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await employeeApi.layTatCa();
      if (!json.success) throw new Error(json.message || 'Lỗi không xác định');
      console.log("Dữ liệu nhân viên nè", json.data);
      setEmployees(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối tới server';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiDanhSachNhanVien();
  }, []);

  const filtered = useMemo(() => {
    return employees.filter(emp => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (emp.full_name ?? '').toLowerCase().includes(q) ||
        (emp.username ?? '').toLowerCase().includes(q) ||
        String(emp.id_nhan_vien).includes(q) ||
        getRoleNameVN(emp.role_name).toLowerCase().includes(q);
      const matchRole = role === 'Tất cả vai trò' || getRoleNameVN(emp.role_name) === role;
      const hasFaceData = emp.du_lieu_khuon_mat && Object.keys(emp.du_lieu_khuon_mat).length > 0;
      const matchStatus =
        status === 'Tất cả trạng thái' ||
        (status === 'Đã đăng ký' && hasFaceData) ||
        (status === 'Chưa đăng ký' && !hasFaceData);
      return matchSearch && matchRole && matchStatus;
    });
  }, [employees, search, role, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const xuLyTimKiem = (v: string) => { setSearch(v); setPage(1); };
  const handleRole = (v: string) => { setRole(v); setPage(1); };
  const handleStatus = (v: string) => { setStatus(v); setPage(1); };

  const allChecked = paginated.length > 0 && paginated.every(e => selected.has(e.id_nhan_vien));
  const someChecked = paginated.some(e => selected.has(e.id_nhan_vien));

  const toggleAll = () => {
    if (allChecked) {
      const next = new Set(selected);
      paginated.forEach(e => next.delete(e.id_nhan_vien));
      setSelected(next);
    } else {
      const next = new Set(selected);
      paginated.forEach(e => next.add(e.id_nhan_vien));
      setSelected(next);
    }
  };

  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  // Xóa nhân viên thông qua API Service
  const xuLyXoa = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const json = await employeeApi.xoa(String(confirmDelete.id_nhan_vien));
      if (!json.success) throw new Error(json.message || 'Xóa thất bại');
      toast.success('Xóa nhân viên thành công', `Đã xóa ${confirmDelete.full_name}`);

      // Xóa khỏi selected nếu có
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(confirmDelete.id_nhan_vien);
        return next;
      });
      taiDanhSachNhanVien();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      toast.error('Không thể xóa nhân viên', msg);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (page > 4) pages.push('...');
      if (page > 3 && page < totalPages - 2) pages.push(page);
      if (page < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  const mapEmployeeToExport = (emp: Employee) => ({
    'Mã NV': emp.id_nhan_vien,
    'Tên đăng nhập': emp.username,
    'Họ và tên': emp.full_name,
    'Vai trò': getRoleNameVN(emp.role_name),
    'Dữ liệu khuôn mặt': (emp.du_lieu_khuon_mat && Object.keys(emp.du_lieu_khuon_mat).length > 0) ? 'Đã đăng ký' : 'Chưa đăng ký',
    'Ngày tạo': dinhDangNgay(emp.created_at)
  });

  const handleExportAll = () => {
    const data = filtered.map(mapEmployeeToExport);
    xuatRaExcel(data, 'Danh_Sach_Nhan_Vien');
  };

  const handleExportSelected = () => {
    const data = employees.filter(e => selected.has(e.id_nhan_vien)).map(mapEmployeeToExport);
    xuatRaExcel(data, 'Danh_Sach_Nhan_Vien_Da_Chon');
  };

  function handleDetailEmployee(id: number): void {
    // chuyển sang trang chi tiết nhân viên
    navigator(`/employees/${id}`);
  }

  return (
    <>
      <div className="emp-page">
        {/* ThanhTieuDe */}
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
            <button className="btn-secondary" onClick={taiDanhSachNhanVien} disabled={loading}>
              <ReloadOutlined spin={loading} />
            </button>
            <button className="btn-secondary" onClick={handleExportAll}>
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
              onChange={e => xuLyTimKiem(e.target.value)}
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
              <button className="bulk-btn" onClick={handleExportSelected}><DownloadOutlined /> Xuất file</button>
              <button className="bulk-btn bulk-btn-danger" onClick={() => {
                // Bulk delete logic could be implemented here
              }}><DeleteOutlined /> Xóa</button>
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
              <button className="btn-secondary" style={{ marginTop: 12 }} onClick={taiDanhSachNhanVien}>
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
                      ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>ID</th>
                  <th>USERNAME</th>
                  <th>HỌ VÀ TÊN</th>
                  <th>THÔNG TIN LIÊN HỆ</th>
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
                  <tr key={emp.id_nhan_vien} className={selected.has(emp.id_nhan_vien) ? 'row-selected' : ''}>
                    <td className="col-check">
                      <input
                        type="checkbox"
                        className="emp-checkbox"
                        checked={selected.has(emp.id_nhan_vien)}
                        onChange={() => toggleOne(emp.id_nhan_vien)}
                      />
                    </td>
                    <td className="col-id">#{emp.id_nhan_vien}</td>
                    <td className="col-username">{emp.username}</td>
                    <td className="col-name">
                      {emp.hinh_anh ? (
                        <img src={emp.hinh_anh} alt={emp.full_name} className="emp-avatar" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div
                          className="emp-avatar"
                          style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                        >
                          {layChuCaiDau(emp.full_name)}
                        </div>
                      )}
                      <span className="emp-name">{emp.full_name}</span>
                    </td>
                    <td className="col-contact">
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', color: '#475569' }}>
                        <span>{emp.email || 'Chưa có Email'}</span>
                        <span>{emp.phone_number || 'Chưa có SĐT'}</span>
                      </div>
                    </td>
                    {
                      emp.role_name === 'Admin' ? (
                        <td className="col-role"><span className="role-admin">Quản trị viên</span></td>
                      ) : emp.role_name === 'Manager' ? (
                        <td className="col-role"><span className="role-manager">Quản lý nhân sự</span></td>
                      ) : (
                        <td className="col-role"><span className="role-employee">Nhân viên</span></td>
                      )
                    }
                    <td className="col-face">
                      {(emp.du_lieu_khuon_mat && Object.keys(emp.du_lieu_khuon_mat).length > 0) ? (
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
                    <td className="col-date">{dinhDangNgay(emp.created_at)}</td>
                    <td className="col-action">
                      <div className="row-actions">
                        <button className="row-btn" title="Xem" onClick={() => handleDetailEmployee(emp.id_nhan_vien)}><EyeOutlined /></button>
                        <button className="row-btn" title="Sửa" onClick={() => handleDetailEmployee(emp.id_nhan_vien)}><EditOutlined /></button>
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
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
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

      <DrawerThemNhanVien
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          taiDanhSachNhanVien();
          setDrawerOpen(false);
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
              Bạn có chắc chắn muốn xoá <strong>{confirmDelete.full_name}</strong> (#{confirmDelete.id_nhan_vien})?
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
                onClick={xuLyXoa}
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
  );
}