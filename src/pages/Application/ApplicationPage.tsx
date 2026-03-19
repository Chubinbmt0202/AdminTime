import { useState } from 'react';
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
    WarningOutlined
} from '@ant-design/icons';
import './ApplicationPage.css';

const mockLeaveRequests = [
    {
        id: 'LV-001',
        employeeName: 'Nguyễn Văn A',
        employeeId: 'EMP-1001',
        leaveType: 'Nghỉ phép năm',
        time: '18/03/2026 - 19/03/2026',
        reason: 'Việc gia đình',
        status: 'pending'
    },
    {
        id: 'LV-002',
        employeeName: 'Trần Thị B',
        employeeId: 'EMP-1002',
        leaveType: 'Nghỉ ốm',
        time: '18/03/2026 (Sáng)',
        reason: 'Đi khám bệnh định kỳ',
        status: 'approved'
    },
    {
        id: 'LV-003',
        employeeName: 'Lê Hoàng C',
        employeeId: 'EMP-1005',
        leaveType: 'Nghỉ không lương',
        time: '20/03/2026 - 25/03/2026',
        reason: 'Du lịch nước ngoài',
        status: 'rejected'
    },
    {
        id: 'LV-004',
        employeeName: 'Phạm Thị D',
        employeeId: 'EMP-1008',
        leaveType: 'Nghỉ thai sản',
        time: '01/04/2026 - 01/10/2026',
        reason: 'Nghỉ sinh em bé theo quy định',
        status: 'pending'
    }
];

const getStatusLabel = (status: string | null) => {
    switch (status) {
        case 'approved': return 'Đã duyệt';
        case 'pending': return 'Chờ duyệt';
        case 'rejected': return 'Từ chối';
        case null: return 'Không xác định';
        default: return status;
    }
};

const getStatusType = (status: string | null) => {
    switch (status) {
        case 'approved': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'danger';
        default: return 'info';
    }
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
export default function LogsPage() {
    const [search, setSearch] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Confirm modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const handleViewDetails = (log: any) => {
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
    const handleConfirmOk = () => {
        if (confirmAction === 'approve') {
            // TODO: Gọi API phê duyệt
            console.log('Đã phê duyệt đơn:', selectedLog?.id);
        } else if (confirmAction === 'reject') {
            // TODO: Gọi API từ chối
            console.log('Đã từ chối đơn:', selectedLog?.id);
        }
        setConfirmOpen(false);
        setConfirmAction(null);
        closeDrawer();
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
                    <button className="btn-secondary">
                        <SyncOutlined /> Làm mới
                    </button>
                    <button className="btn-primary">
                        <DownloadOutlined /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* 2. SUMMARY CARDS */}
            <div className="logs-summary-cards">
                <div className="log-card">
                    <span className="log-card-title">TỔNG NHÂN ĐƠN TỪ</span>
                    <span className="log-card-value text-blue">12</span>
                    <span className="log-card-desc">Đã chấm công: 10</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">CHỜ DUYỆT</span>
                    <span className="log-card-value text-orange">10</span>
                    <span className="log-card-desc">Tỷ lệ: 83%</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">ĐÃ DUYỆT</span>
                    <span className="log-card-value text-green">2</span>
                    <span className="log-card-desc">Tỷ lệ: 17%</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">TỪ CHỐI</span>
                    <span className="log-card-value text-red">0</span>
                    <span className="log-card-desc">Tỷ lệ: 0%</span>
                </div>
            </div>

            {/* 3. FILTERS */}
            <div className="logs-filters">
                <div className="filter-group">
                    <div className="date-picker-wrap">
                        <input
                            type="date"
                            className="log-input date-input"
                            style={{ width: "170px" }}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="search-wrap">
                        <SearchOutlined className="input-icon" />
                        <input
                            type="text"
                            style={{ padding: "0 16px 0 38px" }}
                            className="log-input search-input"
                            placeholder="Tìm theo tên, username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-group">
                    <select className="log-select" disabled>
                        <option>Tất cả phòng ban</option>
                        <option>Engineering</option>
                        <option>Marketing</option>
                        <option>Design</option>
                    </select>
                    <select
                        className="log-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="all">Mọi trạng thái</option>
                        <option value="present">Đã duyệt</option>
                        <option value="late">Chờ duyệt</option>
                        <option value="absent">Từ chối</option>
                    </select>
                    <button className="btn-icon-filter">
                        <FilterOutlined />
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
                        {mockLeaveRequests.map((log, idx) => (
                            <tr key={idx}>
                                <td className="fw-600">{log.id}</td>
                                <td>
                                    <div className="log-emp-info">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(log.employeeName)}&background=random`}
                                            alt={log.employeeName}
                                            className="log-avatar"
                                        />
                                        <div>
                                            <div className="log-emp-name">{log.employeeName}</div>
                                            <div className="log-emp-id">{log.employeeId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{log.leaveType}</td>
                                <td className="fw-600">{log.time}</td>
                                <td>{log.reason}</td>
                                <td>
                                    <span className={`log-badge badge-${getStatusType(log.status)}`}>
                                        {getStatusLabel(log.status)}
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
                <span className="pag-text">Hiển thị 0 trong số 0 nhân viên</span>
                <div className="pag-controls">
                    <button className="pag-btn disabled">Trước</button>
                    <button className="pag-btn active">1</button>
                    <button className="pag-btn">Sau</button>
                </div>
            </div>

            {/* DRAWER OVERLAY */}
            {isDrawerOpen && (
                <div className="drawer-overlay" onClick={closeDrawer}></div>
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
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedLog.employeeName)}&background=random`}
                                    alt="avatar"
                                    className="profile-avatar"
                                />
                                <div className="profile-info">
                                    <h3 className="profile-name">{selectedLog.employeeName}</h3>
                                    <p className="profile-meta">Mã NV: {selectedLog.employeeId}</p>
                                    <p className="profile-meta">Phòng Kỹ thuật</p>
                                </div>
                            </div>

                            {/* 2. Thông tin nghỉ phép */}
                            <div className="drawer-section">
                                <h4 className="section-title">THÔNG TIN NGHỈ PHÉP</h4>
                                <div className="info-block mb-16">
                                    <span className="info-label">Loại đơn</span>
                                    <span className="badge-leave-type">{selectedLog.leaveType}</span>
                                </div>
                                <div className="info-grid">
                                    <div className="info-block">
                                        <span className="info-label">Thời gian</span>
                                        <span className="info-value fw-600">{selectedLog.time}</span>
                                    </div>
                                    <div className="info-block">
                                        <span className="info-label">Lý do</span>
                                        <span className="info-value text-gray">{selectedLog.reason}</span>
                                    </div>
                                </div>
                                <div className="info-block mt-16">
                                    <span className="info-label">Đính kèm</span>
                                    <div className="attachment-box">
                                        <div className="attachment-name">
                                            <PaperClipOutlined style={{ color: '#1890ff' }} />
                                            <span>medical_certificate.pdf</span>
                                        </div>
                                        <DownloadOutlined className="dl-icon" />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Lịch sử phê duyệt */}
                            <div className="drawer-section">
                                <div className="section-header-flex">
                                    <h4 className="section-title">LỊCH SỬ PHÊ DUYỆT</h4>
                                    <span className={`status-badge-${getStatusType(selectedLog.status)}`}>
                                        {getStatusLabel(selectedLog.status)}
                                    </span>
                                </div>
                                <div className="approval-timeline">
                                    <div className="timeline-item completed">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <div className="tl-title">Khởi tạo đơn</div>
                                            <div className="tl-meta">Bởi {selectedLog.employeeName} • 09/10/2023 14:30</div>
                                            <div className="tl-comment">"Gửi sớm để team sắp xếp người thay thế."</div>
                                        </div>
                                    </div>
                                    <div className="timeline-item completed">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <div className="tl-title">Quản lý trực tiếp đã duyệt</div>
                                            <div className="tl-meta">Trần Minh Cường • 09/10/2023 16:00</div>
                                            <div className="tl-comment">"Đã xác nhận bàn giao công việc ổn định."</div>
                                        </div>
                                    </div>
                                    <div className="timeline-item pending">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <div className="tl-title">Chờ Nhân sự (HR) phê duyệt</div>
                                            <div className="tl-meta">Đang chờ xử lý...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>Đang tải dữ liệu...</p>
                    )}
                </div>

                {/* DRAWER FOOTER — gọi openConfirm thay vì đóng thẳng */}
                <div className="drawer-footer drawer-actions-split">
                    <button className="btn-action-reject" onClick={() => openConfirm('reject')}>
                        <CloseCircleOutlined /> Từ chối
                    </button>
                    <button className="btn-action-approve" onClick={() => openConfirm('approve')}>
                        <CheckCircleOutlined /> Phê duyệt
                    </button>
                </div>
            </div>

            {/* ---- CONFIRM MODAL ---- */}
            <ConfirmModal
                isOpen={confirmOpen}
                action={confirmAction}
                employeeName={selectedLog?.employeeName}
                leaveType={selectedLog?.leaveType}
                onConfirm={handleConfirmOk}
                onCancel={handleConfirmCancel}
            />
        </div>
    );
}