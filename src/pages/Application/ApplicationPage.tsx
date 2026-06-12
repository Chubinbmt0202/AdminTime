import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    DownloadOutlined,
    SyncOutlined,
    SearchOutlined,
    FilterOutlined,
    EyeOutlined,
    CloseOutlined,
    PaperClipOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    LoadingOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import './ApplicationPage.css';
import { leaveApi } from '../../features/leaves/api/leave.api';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/date';
import type { LeaveRequest } from '../../features/leaves/types';
import { useToast } from '../../components/common/Toast/Toast';
import { exportToExcel } from '../../utils/exportUtils';

const getStatusLabel = (status: boolean | null) => {
    if (status === true) return 'Đã duyệt';
    if (status === false) return 'Từ chối';
    return 'Chờ duyệt';
};

const getStatusType = (status: boolean | null) => {
    if (status === true) return 'success';
    if (status === false) return 'danger';
    return 'warning';
};

// ---- CONFIRM MODAL COMPONENT ----
type ConfirmAction = 'approve' | 'reject' | null;

interface ConfirmModalProps {
    isOpen: boolean;
    action: ConfirmAction;
    employeeName?: string;
    leaveType?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmModal({ isOpen, action, employeeName, leaveType, onConfirm, onCancel }: ConfirmModalProps) {
    if (!isOpen) return null;

    const isApprove = action === 'approve';

    return (
        <>
            {/* Backdrop */}
            <div className="confirm-backdrop" onClick={onCancel} />

            {/* Modal */}
            <div className="confirm-modal">
                {/* Icon */}
                <div className={`confirm-icon-wrap ${isApprove ? 'icon-approve' : 'icon-reject'}`}>
                    {isApprove
                        ? <CheckCircleOutlined className="confirm-icon" />
                        : <WarningOutlined className="confirm-icon" />
                    }
                </div>

                {/* Title */}
                <h3 className="confirm-title">
                    {isApprove ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
                </h3>

                {/* Description */}
                <p className="confirm-desc">
                    {isApprove
                        ? <>Bạn có chắc chắn muốn <strong>phê duyệt</strong> đơn xin nghỉ của <strong>{employeeName}</strong> ({leaveType})?</>
                        : <>Bạn có chắc chắn muốn <strong>từ chối</strong> đơn xin nghỉ của <strong>{employeeName}</strong> ({leaveType})? Hành động này không thể hoàn tác.</>
                    }
                </p>

                {/* Divider */}
                <div className="confirm-divider" />

                {/* Actions */}
                <div className="confirm-actions">
                    <button className="confirm-btn-cancel" onClick={onCancel}>
                        Huỷ bỏ
                    </button>
                    <button
                        className={`confirm-btn-main ${isApprove ? 'btn-confirm-approve' : 'btn-confirm-reject'}`}
                        onClick={onConfirm}
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
export default function ApplicationPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedLog, setSelectedLog] = useState<LeaveRequest | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Confirm modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const fetchLeaveRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await leaveApi.getAll();
            if (res.success) {
                setLeaveRequests(res.data);
            } else {
                throw new Error(res.message || 'Lỗi khi tải danh sách đơn xin nghỉ');
            }
        } catch (err: any) {
            setError(err.message);
            toast.error('Lỗi', err.message);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const handleViewDetails = (log: LeaveRequest) => {
        setSelectedLog(log);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedLog(null);
    };

    // Mở modal xác nhận
    const openConfirm = (action: ConfirmAction) => {
        setConfirmAction(action);
        setConfirmOpen(true);
    };

    // Huỷ modal
    const handleConfirmCancel = () => {
        setConfirmOpen(false);
        setConfirmAction(null);
    };

    // Xác nhận hành động
    const handleConfirmOk = async () => {
        if (!selectedLog || !user?.id_nhan_vien) return;

        setLoading(true);
        try {
            const status = confirmAction === 'approve' ? 'approved' : 'rejected';
            const res = await leaveApi.updateStatus({
                id_don_xin_nghi: selectedLog.id_don_xin_nghi,
                status: status,
                id_nguoi_duyet: user.id_nhan_vien,
                ghi_chu: status === 'approved' ? 'Đã duyệt' : 'Từ chối'
            });

            if (res.success) {
                toast.success('Thành công', res.message || 'Đã cập nhật trạng thái đơn');
                await fetchLeaveRequests();
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
        return leaveRequests.filter(req => {
            const matchSearch = req.ho_ten_nhan_vien.toLowerCase().includes(search.toLowerCase()) ||
                req.id_don_xin_nghi.toLowerCase().includes(search.toLowerCase());
            const matchStatus = selectedStatus === 'all' ||
                (selectedStatus === 'approved' && req.trang_thai === true) ||
                (selectedStatus === 'pending' && req.trang_thai === null) ||
                (selectedStatus === 'rejected' && req.trang_thai === false);
            return matchSearch && matchStatus;
        });
    }, [leaveRequests, search, selectedStatus]);

    const stats = useMemo(() => {
        return {
            total: leaveRequests.length,
            pending: leaveRequests.filter(r => r.trang_thai === null).length,
            approved: leaveRequests.filter(r => r.trang_thai === true).length,
            rejected: leaveRequests.filter(r => r.trang_thai === false).length,
        };
    }, [leaveRequests]);

    const handleExport = () => {
        if (!filteredRequests || filteredRequests.length === 0) {
            toast.error('Lỗi', 'Không có dữ liệu để xuất');
            return;
        }

        const data = filteredRequests.map(log => ({
            'Mã đơn': log.id_don_xin_nghi,
            'Mã NV': log.id_nguoi_dung,
            'Họ và tên': log.ho_ten_nhan_vien || 'Unknown',
            'Loại phép': log.ten_phep,
            'Ngày bắt đầu': formatDate(log.ngay_bat_dau),
            'Ngày kết thúc': formatDate(log.ngay_ket_thuc),
            'Lý do': log.ly_do,
            'Ngày nộp đơn': formatDate(log.ngay_tao),
            'Trạng thái': getStatusLabel(log.trang_thai)
        }));

        exportToExcel(data, 'Danh_Sach_Don_Xin_Nghi');
    };

    return (
        <div className="logs-page">
            {/* 1. HEADER */}
            <div className="logs-header">
                <div className="logs-header-left">
                    <h1 className="logs-title">Quản lý đơn xin nghỉ</h1>
                    <p className="logs-subtitle">Theo dõi và quản lý dữ liệu đơn xin nghỉ của toàn bộ nhân viên.</p>
                </div>
                <div className="logs-header-actions">
                    <button className="btn-secondary" onClick={fetchLeaveRequests} disabled={loading}>
                        <SyncOutlined spin={loading} /> Làm mới
                    </button>
                    <button className="btn-primary" onClick={handleExport}>
                        <DownloadOutlined /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* 2. SUMMARY CARDS */}
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

            {/* 3. FILTERS */}
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
                        <option value="approved">Đã duyệt</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="rejected">Từ chối</option>
                    </select>
                    <button className="btn-icon-filter" onClick={fetchLeaveRequests} disabled={loading}>
                        <SyncOutlined spin={loading} />
                    </button>
                </div>
            </div>

            {/* 4. TABLE */}
            <div className="logs-table-wrap">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th>MÃ ĐƠN TỪ</th>
                            <th>HỌ VÀ TÊN</th>
                            <th>LOẠI ĐƠN TỪ</th>
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
                                <td colSpan={7} className="text-center py-20">Không có đơn xin nghỉ nào.</td>
                            </tr>
                        ) : filteredRequests.map((log) => (
                            <tr key={log.id_don_xin_nghi}>
                                <td className="fw-600">{log.id_don_xin_nghi}</td>
                                <td>
                                    <div className="log-emp-info">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(log.ho_ten_nhan_vien)}&background=random`}
                                            alt={log.ho_ten_nhan_vien}
                                            className="log-avatar"
                                        />
                                        <div>
                                            <div className="log-emp-name">{log.ho_ten_nhan_vien}</div>
                                            <div className="log-emp-id">{log.id_nguoi_dung}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{log.ten_phep}</td>
                                <td className="fw-600">
                                    {formatDate(log.ngay_bat_dau)} - {formatDate(log.ngay_ket_thuc)}
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

            {/* 5. PAGINATION */}
            <div className="logs-pagination">
                <span className="pag-text">Hiển thị {filteredRequests.length} trong số {leaveRequests.length} đơn</span>
                <div className="pag-controls">
                    <button className="pag-btn disabled">Trước</button>
                    <button className="pag-btn active">1</button>
                    <button className="pag-btn disabled">Sau</button>
                </div>
            </div>

            {/* DRAWER OVERLAY */}
            {isDrawerOpen && (
                <div className="drawer-overlay-application" onClick={closeDrawer}></div>
            )}

            {/* DRAWER */}
            <div className={`drawer-container ${isDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h2>Chi tiết đơn từ</h2>
                    <button className="btn-close-drawer" onClick={closeDrawer}>
                        <CloseOutlined />
                    </button>
                </div>

                <div className="drawer-body">
                    {selectedLog ? (
                        <>
                            {/* 1. Thông tin nhân sự */}
                            <div className="drawer-profile-card">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedLog.ho_ten_nhan_vien)}&background=random`}
                                    alt="avatar"
                                    className="profile-avatar"
                                />
                                <div className="profile-info">
                                    <h3 className="profile-name">{selectedLog.ho_ten_nhan_vien}</h3>
                                    <p className="profile-meta">Mã NV: {selectedLog.id_nguoi_dung}</p>
                                    <p className="profile-meta">{selectedLog.ten_phong_ban || 'Phòng ban chưa cập nhật'}</p>
                                </div>
                            </div>

                            {/* 2. Thông tin nghỉ phép */}
                            <div className="drawer-section">
                                <h4 className="section-title">THÔNG TIN NGHỈ PHÉP</h4>
                                <div className="info-block mb-16">
                                    <span className="info-label">Loại đơn</span>
                                    <span className="badge-leave-type">{selectedLog.ten_phep}</span>
                                </div>
                                <div className="info-grid">
                                    <div className="info-block">
                                        <span className="info-label">Thời gian</span>
                                        <span className="info-value fw-600">
                                            {formatDate(selectedLog.ngay_bat_dau)} - {formatDate(selectedLog.ngay_ket_thuc)}
                                        </span>
                                    </div>
                                    <div className="info-block">
                                        <span className="info-label">Lý do</span>
                                        <span className="info-value text-gray">{selectedLog.ly_do}</span>
                                    </div>
                                </div>
                                <div className="info-block mt-16">
                                    <span className="info-label">Đính kèm</span>
                                    <div className="attachment-box">
                                        <div className="attachment-name">
                                            <PaperClipOutlined style={{ color: '#1890ff' }} />
                                            <span>{selectedLog.url_minh_chung ? 'minh_chung.png' : 'Không có đính kèm'}</span>
                                        </div>
                                        {selectedLog.url_minh_chung && (
                                            <DownloadOutlined
                                                className="dl-icon"
                                                onClick={() => window.open(selectedLog.url_minh_chung!, '_blank')}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Lịch sử phê duyệt */}
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
                                            <div className="tl-meta">Bởi {selectedLog.ho_ten_nhan_vien} • {formatDate(selectedLog.ngay_tao)}</div>
                                            <div className="tl-comment">"{selectedLog.ly_do}"</div>
                                        </div>
                                    </div>
                                    {selectedLog.trang_thai !== null && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content">
                                                <div className="tl-title">Đã được xử lý</div>
                                                <div className="tl-meta">Người duyệt: {selectedLog.ten_nguoi_duyet || 'Admin'} • {selectedLog.ngay_duyet ? formatDate(selectedLog.ngay_duyet) : ''}</div>
                                                <div className="tl-comment">"{selectedLog.ghi_chu}"</div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedLog.trang_thai === null && (
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

                {/* DRAWER FOOTER */}
                <div className="drawer-footer drawer-actions-split">
                    {selectedLog?.trang_thai === null ? (
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

            {/* ---- CONFIRM MODAL ---- */}
            <ConfirmModal
                isOpen={confirmOpen}
                action={confirmAction}
                employeeName={selectedLog?.ho_ten_nhan_vien}
                leaveType={selectedLog?.ten_phep}
                onConfirm={handleConfirmOk}
                onCancel={handleConfirmCancel}
            />
        </div>
    );
}