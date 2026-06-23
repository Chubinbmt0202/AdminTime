import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    DownloadOutlined,
    SyncOutlined,
    SearchOutlined,
    EyeOutlined,
    CloseOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import '../Application/QuanLyDonTu.css';
import { overtimeApi } from '../../features/overtime/api/tangCa.api';
import { dinhDangNgay } from '../../utils/tienIchNgay';
import type { OvertimeRequest } from '../../features/overtime/types';
import { useThongBao } from '../../components/common/Toast/ThongBaoToast';
import { xuatRaExcel } from '../../utils/tienIchXuatFile';

const getStatusLabel = (status: string) => {
    if (status === 'DA_DUYET') return 'Đã duyệt';
    if (status === 'TU_CHOI') return 'Từ chối';
    return 'Chờ duyệt';
};

const getStatusType = (status: string) => {
    if (status === 'DA_DUYET') return 'success';
    if (status === 'TU_CHOI') return 'danger';
    return 'warning';
};

// ---- CONFIRM MODAL COMPONENT ----
type ConfirmAction = 'approve' | 'reject' | null;

interface ConfirmModalProps {
    isOpen: boolean;
    action: ConfirmAction;
    employeeName?: string;
    onConfirm: (ghiChu: string) => void;
    onCancel: () => void;
}

function ConfirmModal({ isOpen, action, employeeName, onConfirm, onCancel }: ConfirmModalProps) {
    const [ghiChu, setGhiChu] = useState('');

    useEffect(() => {
        if (!isOpen) setGhiChu('');
    }, [isOpen]);

    if (!isOpen) return null;

    const isApprove = action === 'approve';

    return (
        <>
            <div className="confirm-backdrop" onClick={onCancel} />
            <div className="confirm-modal">
                <div className={`confirm-icon-wrap ${isApprove ? 'icon-approve' : 'icon-reject'}`}>
                    {isApprove
                        ? <CheckCircleOutlined className="confirm-icon" />
                        : <WarningOutlined className="confirm-icon" />
                    }
                </div>
                <h3 className="confirm-title">
                    {isApprove ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
                </h3>
                <p className="confirm-desc">
                    {isApprove
                        ? <>Bạn có chắc chắn muốn <strong>phê duyệt</strong> đơn xin tăng ca của <strong>{employeeName}</strong>?</>
                        : <>Bạn có chắc chắn muốn <strong>từ chối</strong> đơn xin tăng ca của <strong>{employeeName}</strong>? Hành động này không thể hoàn tác.</>
                    }
                </p>
                <div style={{ marginTop: '16px' }}>
                    <textarea 
                        placeholder="Ghi chú (tuỳ chọn)" 
                        value={ghiChu}
                        onChange={(e) => setGhiChu(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        rows={3}
                    />
                </div>
                <div className="confirm-divider" />
                <div className="confirm-actions">
                    <button className="confirm-btn-cancel" onClick={onCancel}>
                        Huỷ bỏ
                    </button>
                    <button
                        className={`confirm-btn-main ${isApprove ? 'btn-confirm-approve' : 'btn-confirm-reject'}`}
                        onClick={() => onConfirm(ghiChu)}
                    >
                        {isApprove
                            ? <><CheckCircleOutlined /> Phê duyệt</>
                            : <><CloseCircleOutlined /> Từ chối</>
                        }
                    </button>
                </div>
            </div>
        </>
    );
}

// ---- MAIN PAGE ----
export default function YeuCauTangCaPage() {
    const toast = useThongBao();
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedLog, setSelectedLog] = useState<OvertimeRequest | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Confirm modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await overtimeApi.layTatCa();
            if (res.success) {
                setOvertimeRequests(res.data || []);
            } else {
                throw new Error(res.message || 'Lỗi khi tải danh sách đơn xin tăng ca');
            }
        } catch (err: any) {
            setError(err.message);
            toast.error('Lỗi', err.message);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleViewDetails = (log: OvertimeRequest) => {
        setSelectedLog(log);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedLog(null);
    };

    const openConfirm = (action: ConfirmAction) => {
        setConfirmAction(action);
        setConfirmOpen(true);
    };

    const handleConfirmCancel = () => {
        setConfirmOpen(false);
        setConfirmAction(null);
    };

    const handleConfirmOk = async (ghiChu: string) => {
        if (!selectedLog) return;

        setLoading(true);
        try {
            const status = confirmAction === 'approve' ? 'DA_DUYET' : 'TU_CHOI';
            const res = await overtimeApi.capNhatTrangThai({
                id_don_ot: selectedLog.id_don_ot,
                status: status,
                ghi_chu: ghiChu
            });

            if (res.success) {
                toast.success('Thành công', res.message || 'Đã cập nhật trạng thái đơn');
                await fetchRequests();
            } else {
                throw new Error(res.message || 'Lỗi khi cập nhật trạng thái');
            }
        } catch (err: any) {
            toast.error('Lỗi', err.message);
        } finally {
            setLoading(false);
            setConfirmOpen(false);
            setConfirmAction(null);
            closeDrawer();
        }
    };

    const filteredRequests = useMemo(() => {
        return overtimeRequests.filter(req => {
            const matchSearch = (req.ho_va_ten || '').toLowerCase().includes(search.toLowerCase()) ||
                req.id_don_ot.toLowerCase().includes(search.toLowerCase());
            const matchStatus = selectedStatus === 'all' || req.trang_thai === selectedStatus;
            return matchSearch && matchStatus;
        });
    }, [overtimeRequests, search, selectedStatus]);

    const stats = useMemo(() => {
        return {
            total: overtimeRequests.length,
            pending: overtimeRequests.filter(r => r.trang_thai === 'CHO_DUYET').length,
            approved: overtimeRequests.filter(r => r.trang_thai === 'DA_DUYET').length,
            rejected: overtimeRequests.filter(r => r.trang_thai === 'TU_CHOI').length,
        };
    }, [overtimeRequests]);

    const handleExport = () => {
        if (!filteredRequests || filteredRequests.length === 0) {
            toast.error('Lỗi', 'Không có dữ liệu để xuất');
            return;
        }

        const data = filteredRequests.map(log => ({
            'Mã đơn': log.id_don_ot,
            'Mã NV': log.id_nhan_vien,
            'Họ và tên': log.ho_va_ten || 'Unknown',
            'Ngày tăng ca': dinhDangNgay(log.ngay_dang_ky_ot),
            'Khung giờ': `${log.gio_bat_dau} - ${log.gio_ket_thuc_du_kien}`,
            'Lý do': log.ly_do,
            'Ngày nộp đơn': dinhDangNgay(log.ngay_tao),
            'Trạng thái': getStatusLabel(log.trang_thai)
        }));

        xuatRaExcel(data, 'Danh_Sach_Don_Tang_Ca');
    };

    return (
        <div className="logs-page">
            <div className="logs-header">
                <div className="logs-header-left">
                    <h1 className="logs-title">Quản lý đơn xin tăng ca</h1>
                    <p className="logs-subtitle">Theo dõi và quản lý dữ liệu đơn xin tăng ca của toàn bộ nhân viên.</p>
                </div>
                <div className="logs-header-actions">
                    <button className="btn-secondary" onClick={fetchRequests} disabled={loading}>
                        <SyncOutlined spin={loading} /> Làm mới
                    </button>
                    <button className="btn-primary" onClick={handleExport}>
                        <DownloadOutlined /> Xuất báo cáo
                    </button>
                </div>
            </div>

            <div className="logs-summary-cards">
                <div className="log-card">
                    <span className="log-card-title">TỔNG NHẬN ĐƠN TỪ</span>
                    <span className="log-card-value text-blue">{stats.total}</span>
                    <span className="log-card-desc">Đơn từ trong hệ thống</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">CHỜ DUYỆT</span>
                    <span className="log-card-value text-orange">{stats.pending}</span>
                    <span className="log-card-desc">Tỷ lệ: {stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">ĐÃ DUYỆT</span>
                    <span className="log-card-value text-green">{stats.approved}</span>
                    <span className="log-card-desc">Tỷ lệ: {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">TỪ CHỐI</span>
                    <span className="log-card-value text-red">{stats.rejected}</span>
                    <span className="log-card-desc">Tỷ lệ: {stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0}%</span>
                </div>
            </div>

            <div className="logs-filters">
                <div className="filter-group">
                    <div className="search-wrap">
                        <SearchOutlined className="input-icon" />
                        <input
                            type="text"
                            style={{ padding: "0 16px 0 38px" }}
                            className="log-input search-input"
                            placeholder="Tìm theo tên, mã đơn..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-group">
                    <select
                        className="log-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="all">Mọi trạng thái</option>
                        <option value="DA_DUYET">Đã duyệt</option>
                        <option value="CHO_DUYET">Chờ duyệt</option>
                        <option value="TU_CHOI">Từ chối</option>
                    </select>
                    <button className="btn-icon-filter" onClick={fetchRequests} disabled={loading}>
                        <SyncOutlined spin={loading} />
                    </button>
                </div>
            </div>

            <div className="logs-table-wrap">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th>MÃ ĐƠN TỪ</th>
                            <th>HỌ VÀ TÊN</th>
                            <th>NGÀY TĂNG CA</th>
                            <th>THỜI GIAN</th>
                            <th>LÝ DO</th>
                            <th>TRẠNG THÁI</th>
                            <th>CHI TIẾT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-20">
                                    <LoadingOutlined style={{ fontSize: 24 }} spin />
                                    <p>Đang tải dữ liệu...</p>
                                </td>
                            </tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-20">Không có đơn xin tăng ca nào.</td>
                            </tr>
                        ) : filteredRequests.map((log) => (
                            <tr key={log.id_don_ot}>
                                <td className="fw-600">{log.id_don_ot}</td>
                                <td>
                                    <div className="log-emp-info">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(log.ho_va_ten || 'Unknown')}&background=random`}
                                            alt={log.ho_va_ten}
                                            className="log-avatar"
                                        />
                                        <div>
                                            <div className="log-emp-name">{log.ho_va_ten}</div>
                                            <div className="log-emp-id">{log.id_nhan_vien}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="fw-600">{dinhDangNgay(log.ngay_dang_ky_ot)}</td>
                                <td className="fw-600">
                                    {log.gio_bat_dau} - {log.gio_ket_thuc_du_kien}
                                </td>
                                <td>{log.ly_do}</td>
                                <td>
                                    <span className={`log-badge badge-${getStatusType(log.trang_thai)}`}>
                                        {getStatusLabel(log.trang_thai)}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-action-view" title="Xem chi tiết" onClick={() => handleViewDetails(log)}>
                                        <EyeOutlined /> Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isDrawerOpen && (
                <div className="drawer-overlay-application" onClick={closeDrawer}></div>
            )}

            <div className={`drawer-container ${isDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h2>Chi tiết đơn tăng ca</h2>
                    <button className="btn-close-drawer" onClick={closeDrawer}>
                        <CloseOutlined />
                    </button>
                </div>

                <div className="drawer-body">
                    {selectedLog ? (
                        <>
                            <div className="drawer-profile-card">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedLog.ho_va_ten || 'Unknown')}&background=random`}
                                    alt="avatar"
                                    className="profile-avatar"
                                />
                                <div className="profile-info">
                                    <h3 className="profile-name">{selectedLog.ho_va_ten}</h3>
                                    <p className="profile-meta">Mã NV: {selectedLog.id_nhan_vien}</p>
                                    <p className="profile-meta">{selectedLog.ten_phong_ban || 'Phòng ban chưa cập nhật'}</p>
                                </div>
                            </div>

                            <div className="drawer-section">
                                <h4 className="section-title">THÔNG TIN TĂNG CA</h4>
                                <div className="info-grid">
                                    <div className="info-block">
                                        <span className="info-label">Ngày tăng ca</span>
                                        <span className="info-value fw-600">
                                            {dinhDangNgay(selectedLog.ngay_dang_ky_ot)}
                                        </span>
                                    </div>
                                    <div className="info-block">
                                        <span className="info-label">Khung giờ</span>
                                        <span className="info-value fw-600">
                                            {selectedLog.gio_bat_dau} - {selectedLog.gio_ket_thuc_du_kien}
                                        </span>
                                    </div>
                                    <div className="info-block">
                                        <span className="info-label">Lý do</span>
                                        <span className="info-value text-gray">{selectedLog.ly_do}</span>
                                    </div>
                                    <div className="info-block">
                                        <span className="info-label">Ngày nộp đơn</span>
                                        <span className="info-value text-gray">{dinhDangNgay(selectedLog.ngay_tao)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="drawer-section">
                                <div className="section-header-flex">
                                    <h4 className="section-title">LỊCH SỬ PHÊ DUYỆT</h4>
                                    <span className={`status-badge-${getStatusType(selectedLog.trang_thai)}`}>
                                        {getStatusLabel(selectedLog.trang_thai)}
                                    </span>
                                </div>
                                <div className="approval-timeline">
                                    <div className="timeline-item completed">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <div className="tl-title">Khởi tạo đơn</div>
                                            <div className="tl-meta">Bởi {selectedLog.ho_va_ten} • {dinhDangNgay(selectedLog.ngay_tao)}</div>
                                            <div className="tl-comment">"{selectedLog.ly_do}"</div>
                                        </div>
                                    </div>
                                    {selectedLog.trang_thai !== 'CHO_DUYET' && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content">
                                                <div className="tl-title">Đã được xử lý</div>
                                                <div className="tl-meta">Hệ thống</div>
                                                <div className="tl-comment">Đơn đã {getStatusLabel(selectedLog.trang_thai).toLowerCase()}</div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedLog.trang_thai === 'CHO_DUYET' && (
                                        <div className="timeline-item pending">
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content">
                                                <div className="tl-title">Đang chờ phê duyệt</div>
                                                <div className="tl-meta">Chờ Quản lý/HR xử lý...</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>Đang tải dữ liệu...</p>
                    )}
                </div>

                <div className="drawer-footer drawer-actions-split">
                    {selectedLog?.trang_thai === 'CHO_DUYET' ? (
                        <>
                            <button className="btn-action-reject" onClick={() => openConfirm('reject')} disabled={loading}>
                                <CloseCircleOutlined /> Từ chối
                            </button>
                            <button className="btn-action-approve" onClick={() => openConfirm('approve')} disabled={loading}>
                                <CheckCircleOutlined /> Phê duyệt
                            </button>
                        </>
                    ) : (
                        <button className="btn-action-view" style={{ width: '100%' }} onClick={closeDrawer}>
                            Đóng
                        </button>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmOpen}
                action={confirmAction}
                employeeName={selectedLog?.ho_va_ten}
                onConfirm={handleConfirmOk}
                onCancel={handleConfirmCancel}
            />
        </div>
    );
}
