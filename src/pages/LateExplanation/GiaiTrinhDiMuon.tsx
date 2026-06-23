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
import './LateExplanationPage.css';
import { lateExplanationApi } from '../../features/lateExplanations/api/lateExplanation.api';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/date';
import type { LateExplanation } from '../../features/lateExplanations/types';
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

type ConfirmAction = 'approve' | 'reject' | null;

interface ConfirmModalProps {
    isOpen: boolean;
    action: ConfirmAction;
    employeeName?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmModal({ isOpen, action, employeeName, onConfirm, onCancel }: ConfirmModalProps) {
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
                        ? <>Bạn có chắc chắn muốn <strong>phê duyệt</strong> giải trình đi trễ của <strong>{employeeName}</strong>?</>
                        : <>Bạn có chắc chắn muốn <strong>từ chối</strong> giải trình đi trễ của <strong>{employeeName}</strong>? Hành động này không thể hoàn tác.</>
                    }
                </p>

                <div className="confirm-divider" />

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

export default function LateExplanationPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedLog, setSelectedLog] = useState<LateExplanation | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [explanations, setExplanations] = useState<LateExplanation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ghiChuDuyet, setGhiChuDuyet] = useState('');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const fetchExplanations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await lateExplanationApi.getAll();
            if (res.success) {
                setExplanations(res.data);
            } else {
                throw new Error(res.message || 'Lỗi khi tải danh sách giải trình');
            }
        } catch (err: any) {
            setError(err.message);
            toast.error('Lỗi', err.message);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchExplanations();
    }, [fetchExplanations]);

    const handleViewDetails = (log: LateExplanation) => {
        setSelectedLog(log);
        setGhiChuDuyet(log.ghi_chu || '');
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedLog(null);
        setGhiChuDuyet('');
    };

    const openConfirm = (action: ConfirmAction) => {
        setConfirmAction(action);
        setConfirmOpen(true);
    };

    const handleConfirmCancel = () => {
        setConfirmOpen(false);
        setConfirmAction(null);
    };

    const handleConfirmOk = async () => {
        if (!selectedLog || !user?.id_nhan_vien) return;

        setLoading(true);
        try {
            const status = confirmAction === 'approve' ? 'approved' : 'rejected';
            const res = await lateExplanationApi.updateStatus({
                id_giai_trinh: selectedLog.id_giai_trinh,
                status: status,
                id_nguoi_duyet: user.id_nhan_vien,
                ghi_chu: ghiChuDuyet || (status === 'approved' ? 'Đã duyệt' : 'Từ chối')
            });

            if (res.success) {
                toast.success('Thành công', res.message || 'Đã cập nhật trạng thái giải trình');
                await fetchExplanations();
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

    const filteredExplanations = useMemo(() => {
        return explanations.filter(req => {
            const empName = req.ho_ten_nhan_vien || '';
            const matchSearch = empName.toLowerCase().includes(search.toLowerCase()) ||
                req.id_giai_trinh.toLowerCase().includes(search.toLowerCase());
            const matchStatus = selectedStatus === 'all' ||
                (selectedStatus === 'approved' && req.trang_thai === true) ||
                (selectedStatus === 'pending' && req.trang_thai === null) ||
                (selectedStatus === 'rejected' && req.trang_thai === false);
            return matchSearch && matchStatus;
        });
    }, [explanations, search, selectedStatus]);

    const stats = useMemo(() => {
        return {
            total: explanations.length,
            pending: explanations.filter(r => r.trang_thai === null).length,
            approved: explanations.filter(r => r.trang_thai === true).length,
            rejected: explanations.filter(r => r.trang_thai === false).length,
        };
    }, [explanations]);

    const handleExport = () => {
        if (!filteredExplanations || filteredExplanations.length === 0) {
            toast.error('Lỗi', 'Không có dữ liệu để xuất');
            return;
        }

        const data = filteredExplanations.map(log => ({
            'Mã giải trình': log.id_giai_trinh,
            'Mã NV': log.id_nhan_vien,
            'Họ và tên': log.ho_ten_nhan_vien || 'Unknown',
            'Ngày giải trình': formatDate(log.ngay_giai_trinh),
            'Giờ vào trễ': new Date(log.gio_vao_tre).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            'Lý do': log.ly_do,
            'Ngày tạo': formatDate(log.ngay_tao),
            'Trạng thái': getStatusLabel(log.trang_thai)
        }));

        exportToExcel(data, 'Danh_Sach_Giai_Trinh_Di_Tre');
    };

    return (
        <div className="logs-page">
            <div className="logs-header">
                <div className="logs-header-left">
                    <h1 className="logs-title">Quản lý giải trình đi trễ</h1>
                    <p className="logs-subtitle">Theo dõi và phê duyệt các giải trình đi trễ quá giờ của nhân viên.</p>
                </div>
                <div className="logs-header-actions">
                    <button className="btn-secondary" onClick={fetchExplanations} disabled={loading}>
                        <SyncOutlined spin={loading} /> Làm mới
                    </button>
                    <button className="btn-primary" onClick={handleExport}>
                        <DownloadOutlined /> Xuất báo cáo
                    </button>
                </div>
            </div>

            <div className="logs-summary-cards">
                <div className="log-card">
                    <span className="log-card-title">TỔNG SỐ GIẢI TRÌNH</span>
                    <span className="log-card-value text-blue">{stats.total}</span>
                    <span className="log-card-desc">Giải trình đi trễ</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">CHỜ DUYỆT</span>
                    <span className="log-card-value text-orange">{stats.pending}</span>
                    <span className="log-card-desc">Tỷ lệ: {stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">ĐÃ CHẤP NHẬN</span>
                    <span className="log-card-value text-green">{stats.approved}</span>
                    <span className="log-card-desc">Tỷ lệ: {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">BỊ TỪ CHỐI</span>
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
                            placeholder="Tìm tên nhân viên, mã đơn..."
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
                </div>
            </div>

            <div className="logs-table-wrap">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th>MÃ GIẢI TRÌNH</th>
                            <th>NHÂN VIÊN</th>
                            <th>NGÀY GIAI TRÌNH</th>
                            <th>GIỜ VÀO TRỄ</th>
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
                        ) : filteredExplanations.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-20">Không tìm thấy giải trình nào.</td>
                            </tr>
                        ) : filteredExplanations.map((log) => (
                            <tr key={log.id_giai_trinh}>
                                <td className="fw-600">{log.id_giai_trinh}</td>
                                <td>
                                    <div className="log-emp-info">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(log.ho_ten_nhan_vien || '')}&background=random`}
                                            alt={log.ho_ten_nhan_vien}
                                            className="log-avatar"
                                        />
                                        <div>
                                            <div className="log-emp-name">{log.ho_ten_nhan_vien}</div>
                                            <div className="log-emp-id">{log.id_nhan_vien}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="fw-600">{formatDate(log.ngay_giai_trinh)}</td>
                                <td className="fw-600">
                                    {new Date(log.gio_vao_tre).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
                    <h2>Chi tiết giải trình đi trễ</h2>
                    <button className="btn-close-drawer" onClick={closeDrawer}>
                        <CloseOutlined />
                    </button>
                </div>

                <div className="drawer-body">
                    {selectedLog ? (
                        <>
                            <div className="drawer-profile-card">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedLog.ho_ten_nhan_vien || '')}&background=random`}
                                    alt="avatar"
                                    className="profile-avatar"
                                />
                                <div className="profile-info">
                                    <h3 className="profile-name">{selectedLog.ho_ten_nhan_vien}</h3>
                                    <p className="profile-meta">Mã NV: {selectedLog.id_nhan_vien}</p>
                                    <p className="profile-meta">{selectedLog.ten_phong_ban || 'Phòng ban chưa cập nhật'}</p>
                                </div>
                            </div>

                            <div className="drawer-section">
                                <h4 className="section-title">THÔNG TIN GIẢI TRÌNH</h4>
                                <div className="info-grid">
                                    <div className="info-block">
                                        <span className="info-label">Ngày ghi nhận</span>
                                        <span className="info-value fw-600">{formatDate(selectedLog.ngay_giai_trinh)}</span>
                                    </div>
                                    <div className="info-block">
                                        <span className="info-label">Giờ thực tế vào trễ</span>
                                        <span className="info-value fw-600">
                                            {new Date(selectedLog.gio_vao_tre).toLocaleTimeString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-block mt-16">
                                    <span className="info-label">Lý do giải trình</span>
                                    <span className="info-value text-gray">{selectedLog.ly_do}</span>
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
                                            <div className="tl-title">Khởi tạo giải trình</div>
                                            <div className="tl-meta">Bởi {selectedLog.ho_ten_nhan_vien} • {formatDate(selectedLog.ngay_tao)}</div>
                                            <div className="tl-comment">"{selectedLog.ly_do}"</div>
                                        </div>
                                    </div>
                                    {selectedLog.trang_thai !== null && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content">
                                                <div className="tl-title">Đã xử lý giải trình</div>
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

                            {selectedLog.trang_thai === null && (
                                <div className="drawer-section">
                                    <h4 className="section-title">PHẢN HỒI CỦA HR (Ghi chú)</h4>
                                    <textarea
                                        className="log-input"
                                        style={{ height: '80px', width: '100%', resize: 'none', padding: '8px' }}
                                        placeholder="Nhập ghi chú hoặc phản hồi khi duyệt đơn giải trình này..."
                                        value={ghiChuDuyet}
                                        onChange={(e) => setGhiChuDuyet(e.target.value)}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <p>Đang tải dữ liệu...</p>
                    )}
                </div>

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

            <ConfirmModal
                isOpen={confirmOpen}
                action={confirmAction}
                employeeName={selectedLog?.ho_ten_nhan_vien}
                onConfirm={handleConfirmOk}
                onCancel={handleConfirmCancel}
            />
        </div>
    );
}
