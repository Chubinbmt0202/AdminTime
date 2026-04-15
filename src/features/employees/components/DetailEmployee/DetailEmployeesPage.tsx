import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    EditOutlined,
    DownloadOutlined,
    ToolOutlined,
    EnvironmentOutlined,
    UserOutlined,
    CalendarOutlined,
    SmileOutlined,
    FileTextOutlined,
    CheckCircleFilled,
    InfoCircleOutlined,
    LoadingOutlined,
    SettingOutlined,
    FilterOutlined,
    SendOutlined,
    LoginOutlined,
    StopOutlined,
    CloseOutlined
} from '@ant-design/icons';
import './DetailEmployeesPage.css';
import { useToast } from '../../../../components/common/Toast/Toast';
import { attendanceService, type AttendanceRecord } from '../../../../services/attendance.service';
import { employeeApi } from '../../api/employee.api';

const initialFormData = {
    full_name: 'Đang tải...',
    id: '',
    username: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    department: '',
    title: '',
    joinDate: '',
    manager: '',
    du_lieu_khuon_mat: null as any
};

type FieldKey = keyof typeof initialFormData;

// Helpers for history tab
const formatHistoryDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

const getVietnameseDay = (dateString: string | null) => {
    if (!dateString) return '---';
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const date = new Date(dateString);
    return days[date.getDay()];
};

const getHistoryStatusLabel = (status: string | null) => {
    switch (status) {
        case 'present': return 'Đúng giờ';
        case 'late': return 'Đi muộn';
        case 'half_day': return 'Nửa ngày';
        case null: return 'Chưa chấm công';
        default: return status;
    }
};

const getHistoryStatusType = (status: string | null) => {
    switch (status) {
        case 'present': return 'success';
        case 'late': return 'warning';
        case 'half_day': return 'info';
        case null: return 'danger';
        default: return 'default';
    }
};

const formatHistoryTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const calculateDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return '--h';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '--h';

    const diffHours = diffMs / (1000 * 60 * 60);
    return `${diffHours.toFixed(1)}h`;
};

export default function DetailEmployeesPage() {
    const { id } = useParams(); // Lấy ID từ URL (VD: http://localhost:5173/employees/10 -> id = 10)
    const toast = useToast();

    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu API

    // History State
    const [historyLogs, setHistoryLogs] = useState<AttendanceRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Face Update Confirmation State
    const [showFaceConfirm, setShowFaceConfirm] = useState(false);

    // Trạng thái bật/tắt toàn bộ chế độ edit
    const [isEditing, setIsEditing] = useState(false);
    const [isRequestingFaceUpdate, setIsRequestingFaceUpdate] = useState(false);

    // Lưu trữ dữ liệu thông tin nhân viên
    const [formData, setFormData] = useState(initialFormData);

    // Lưu trữ field nào đang được click để biến thành Input
    const [activeEditField, setActiveEditField] = useState<FieldKey | null>(null);

    const [isRequestingInfoUpdate, setIsRequestingInfoUpdate] = useState(false);

    // ================== FETCH ATTENDANCE HISTORY ==================
    const fetchHistory = async () => {
        if (!id) return;
        setHistoryLoading(true);
        try {
            const res = await attendanceService.getEmployeeHistory(id);
            console.log("dữ liệu lịch sử chấm công:", res.data)
            if (res.success) {
                setHistoryLogs(Array.isArray(res.data) ? res.data : []);
            } else {
                toast.error('Lỗi', res.message || 'Không thể lấy lịch sử chấm công');
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
            toast.error('Lỗi', 'Lỗi kết nối khi lấy lịch sử chấm công');
        } finally {
            setHistoryLoading(false);
        }
    };

    // Trigger fetch when tab changes to history
    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab, id]);

    const handleRequestInfoUpdate = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isRequestingInfoUpdate) return;

        setIsRequestingInfoUpdate(true);
        try {
            // Giả lập API mất 1 giây
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(
                'Đã gửi yêu cầu',
                `Nhân viên ${formData.full_name} sẽ nhận được thông báo yêu cầu cập nhật thông tin cá nhân.`
            );
        } catch (error) {
            toast.error('Lỗi', 'Không thể gửi yêu cầu, vui lòng thử lại sau.');
        } finally {
            setIsRequestingInfoUpdate(false);
        }
    };

    // ================== FETCH API ==================
    useEffect(() => {
        const fetchEmployeeDetail = async () => {
            console.log("ID: ", id);
            if (!id) return;
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3001/api/employees/getByID/${id}`);
                const json = await res.json();

                if (json.success) {
                    setFormData({
                        ...initialFormData,
                        id: json.data.id || 'Chưa cập nhật',
                        username: json.data.username || 'Chưa cập nhật',
                        full_name: json.data.full_name || 'Chưa cập nhật',
                        email: json.data.email || 'Chưa cập nhật',
                        phone: json.data.phone || 'Chưa cập nhật',
                        dob: json.data.dob || 'Chưa cập nhật',
                        gender: json.data.gender || 'Chưa cập nhật',
                        address: json.data.address || 'Chưa cập nhật',
                        department: json.data.department || 'Chưa cập nhật',
                        title: json.data.role || 'Chưa cập nhật', // Gán role làm chức vụ
                        joinDate: json.data.created_at ? new Date(json.data.created_at).toLocaleDateString('vi-VN') : 'Chưa cập nhật',
                        manager: json.data.manager || 'Chưa cập nhật',
                        du_lieu_khuon_mat: json.data.du_lieu_khuon_mat
                    });
                    console.log("Dữ liệu nhân viên:", json.data);
                } else {
                    toast.error('Lỗi', json.message || 'Không tìm thấy thông tin nhân viên');
                }
            } catch (error) {
                toast.error('Lỗi', 'Không thể kết nối đến server để lấy dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeDetail();
    }, [id]); // Chạy lại nếu id trên URL thay đổi

    // ================== HANDLERS ==================
    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
        setActiveEditField(null);
    };

    const handleRequestFaceUpdate = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowFaceConfirm(true);
    };

    const confirmFaceUpdate = async () => {
        if (isRequestingFaceUpdate || !id) return;
        setShowFaceConfirm(false);
        setIsRequestingFaceUpdate(true);
        try {
            const res = await employeeApi.requestFaceUpdate(Number(id));
            if (res.success) {
                toast.success(
                    'Yêu cầu thành công',
                    `Dữ liệu khuôn mặt cũ của ${formData.full_name} đã được xoá. Nhân viên sẽ nhận được thông báo cập nhật lại.`
                );
            } else {
                toast.error('Lỗi', res.message || 'Không thể gửi yêu cầu cập nhật khuôn mặt.');
            }
        } catch (error) {
            console.error('Failed to request face update:', error);
            toast.error('Lỗi', 'Lỗi kết nối khi gửi yêu cầu cập nhật khuôn mặt.');
        } finally {
            setIsRequestingFaceUpdate(false);
        }
    };

    const renderEditableValue = (key: FieldKey, customDisplay?: React.ReactNode) => {
        if (activeEditField === key) {
            return (
                <input
                    className="inline-input"
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    onBlur={() => setActiveEditField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveEditField(null)}
                    autoFocus
                />
            );
        }

        return (
            <>
                {customDisplay || formData[key]}
                {isEditing && (
                    <EditOutlined
                        className="inline-edit-icon"
                        title="Chỉnh sửa"
                        onClick={() => setActiveEditField(key)}
                    />
                )}
            </>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <>
                        <div className="info-card">
                            <div className="card-header flex-between">
                                <div className="card-title-wrap">
                                    <FileTextOutlined className="card-icon" />
                                    <h2>Thông tin cá nhân</h2>
                                </div>
                                <button
                                    className="btn-secondary"
                                    onClick={handleRequestInfoUpdate}
                                    disabled={isRequestingInfoUpdate}
                                    style={{ fontSize: '13px', padding: '6px 12px', height: 'auto', opacity: isRequestingInfoUpdate ? 0.6 : 1 }}
                                >
                                    {isRequestingInfoUpdate ? (
                                        <><LoadingOutlined spin /> Đang gửi...</>
                                    ) : (
                                        <><SendOutlined /> Yêu cầu cập nhật</>
                                    )}
                                </button>
                            </div>
                            <div className="card-content grid-2-cols">
                                <div className="info-item">
                                    <span className="info-label">EMAIL</span>
                                    <span className="info-value">{renderEditableValue('email')}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">SỐ ĐIỆN THOẠI</span>
                                    <span className="info-value">{renderEditableValue('phone')}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">NGÀY SINH</span>
                                    <span className="info-value">{renderEditableValue('dob')}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">GIỚI TÍNH</span>
                                    <span className="info-value">{renderEditableValue('gender')}</span>
                                </div>
                                <div className="info-item full-width">
                                    <span className="info-label">ĐỊA CHỈ</span>
                                    <span className="info-value">{renderEditableValue('address')}</span>
                                </div>
                            </div>
                        </div>
                    </>
                );

            case 'history':
                // Tính toán sơ bộ từ dữ liệu thật
                const stats = {
                    total: historyLogs.length,
                    late: historyLogs.filter(l => l.status === 'late').length,
                    half: historyLogs.filter(l => l.status === 'half_day').length,
                    present: historyLogs.filter(l => l.status === 'present').length,
                };

                return (
                    <div className="history-tab-wrapper">
                        {/* 1. Summary & Filters */}
                        <div className="history-top-bar">
                            <div className="history-summary-cards">
                                <div className="h-card">
                                    <span className="h-card-title">TỔNG CỘNG</span>
                                    <span className="h-card-value text-blue">{stats.total}</span>
                                    <span className="h-card-desc">Ngày có dữ liệu</span>
                                </div>
                                <div className="h-card">
                                    <span className="h-card-title">ĐÚNG GIỜ</span>
                                    <span className="h-card-value text-green">{stats.present}</span>
                                    <span className="h-card-desc">Số lần trong tháng</span>
                                </div>
                                <div className="h-card">
                                    <span className="h-card-title">ĐI MUỘN</span>
                                    <span className="h-card-value text-orange">{stats.late}</span>
                                    <span className="h-card-desc">Số lần trong tháng</span>
                                </div>
                                <div className="h-card">
                                    <span className="h-card-title">NỬA NGÀY</span>
                                    <span className="h-card-value text-red">{stats.half}</span>
                                    <span className="h-card-desc">Số lần trong tháng</span>
                                </div>
                            </div>

                            <div className="history-filters">
                                <select className="emp-select h-select">
                                    <option>Tháng 03/2026</option>
                                    <option>Tháng 02/2026</option>
                                </select>
                                <select className="emp-select h-select">
                                    <option>Mọi trạng thái</option>
                                    <option>Đúng giờ</option>
                                    <option>Đi muộn / Về sớm</option>
                                </select>
                                <button className="btn-icon h-filter-btn">
                                    <FilterOutlined />
                                </button>
                            </div>
                        </div>

                        {/* 2. Detail Table */}
                        <div className="info-card">
                            <div className="card-header flex-between">
                                <h2>Lịch sử chi tiết</h2>
                                <div className="history-legend">
                                    <button className="btn-secondary">
                                        <DownloadOutlined /> Xuất file excel
                                    </button>
                                </div>
                            </div>
                            <div className="history-table-wrap">
                                {historyLoading ? (
                                    <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
                                        <LoadingOutlined spin style={{ fontSize: '24px', marginRight: '10px' }} />
                                        Đang tải lịch sử...
                                    </div>
                                ) : (
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>NGÀY</th>
                                                <th>THỨ</th>
                                                <th>GIỜ VÀO</th>
                                                <th>GIỜ RA</th>
                                                <th>TỔNG GIỜ</th>
                                                <th>TRẠNG THÁI</th>
                                                <th>MINH CHỨNG SỐ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                                        Không tìm thấy lịch sử chấm công
                                                    </td>
                                                </tr>
                                            ) : (
                                                historyLogs.map((record, idx) => (
                                                    <tr key={idx}>
                                                        <td className="fw-600">{formatHistoryDate(record.log_date)}</td>
                                                        <td className="text-gray">{getVietnameseDay(record.log_date)}</td>
                                                        <td className={`fw-600 ${record.status === 'late' ? 'text-orange' : ''}`}>
                                                            {formatHistoryTime(record.check_in_time)}
                                                        </td>
                                                        <td className="fw-600">
                                                            {formatHistoryTime(record.check_out_time)}
                                                        </td>
                                                        <td className="fw-600">
                                                            {calculateDuration(record.check_in_time, record.check_out_time)}
                                                        </td>
                                                        <td>
                                                            <span className={`h-badge badge-${getHistoryStatusType(record.status)}`}>
                                                                {getHistoryStatusLabel(record.status)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="proof-images">
                                                                {/* Vì API chưa trả về ảnh proofs thật, ta dùng avatar giả lập số lượng */}
                                                                <img src={`https://ui-avatars.com/api/?name=AI&background=random`} alt="proof" title="Face recognition match" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="h-pagination-wrap">
                                <span className="h-pag-text">Hiển thị {historyLogs.length} ngày công</span>
                                <div className="h-pag-controls">
                                    <button className="h-pag-btn disabled">Trước</button>
                                    <button className="h-pag-btn active">1</button>
                                    <button className="h-pag-btn">Sau</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'face':
                return (
                    <div className="info-card">
                        <div className="card-header flex-between">
                            <div className="card-title-wrap">
                                <SmileOutlined className="card-icon" />
                                <h2>Dữ liệu khuôn mặt</h2>
                            </div>
                            <div className='flex'>
                                {(formData.du_lieu_khuon_mat && Object.keys(formData.du_lieu_khuon_mat).length > 0) ? (
                                    <span className="status-tag success mr-2">
                                        <CheckCircleFilled /> Đã đăng ký
                                    </span>
                                ) : (
                                    <span className="status-tag danger mr-2" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                                        <CloseOutlined /> Chưa đăng ký
                                    </span>
                                )}
                                <button
                                    className="btn-secondary"
                                    onClick={handleRequestFaceUpdate}
                                    disabled={isRequestingFaceUpdate}
                                    style={{ fontSize: '13px', padding: '6px 12px', height: 'auto', opacity: isRequestingFaceUpdate ? 0.6 : 1 }}
                                >
                                    {isRequestingFaceUpdate ? (
                                        <><LoadingOutlined spin /> Đang gửi...</>
                                    ) : (
                                        <><SendOutlined /> Yêu cầu cập nhật lại khuôn mặt</>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="card-content face-data-wrap">
                            <div className="face-image-box">
                                <img src={`https://ui-avatars.com/api/?name=${formData.full_name}&background=random&size=300`} alt="Face Data" />
                                <span className="preview-label">Preview Mode</span>
                            </div>

                            <div className="face-details">
                                <div className="face-stats grid-2-cols">
                                    <div className="stat-box">
                                        <span className="info-label">NGÀY ĐĂNG KÝ</span>
                                        <span className="info-value large">15/01/2020 09:30</span>
                                    </div>
                                </div>

                                <p className="face-note">
                                    <InfoCircleOutlined /> Dữ liệu khuôn mặt được sử dụng cho mục đích chấm công và bảo mật truy cập tại văn phòng. Toàn bộ dữ liệu được mã hóa và bảo mật theo tiêu chuẩn công ty.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'setting':
                return (
                    <div className="info-card">
                        <div className="card-header">
                            <div className="card-title-wrap ">
                                <div className="card-title-wrap">
                                    <SettingOutlined className="card-icon" />
                                    <h2>Cài đặt tài khoản</h2>
                                </div>
                                <button className="btn-danger-outline">
                                    <StopOutlined /> Vô hiệu hoá
                                </button>
                            </div>
                        </div>
                        <div className="card-content setting-content">
                            <p className="setting-desc">Quản lý thông tin đăng nhập, bảo mật và tùy chỉnh trải nghiệm của bạn.</p>

                            {/* Section: Thông tin đăng nhập */}
                            <div className="setting-section">
                                <h3 className="setting-section-title">
                                    <LoginOutlined /> Thông tin đăng nhập
                                </h3>

                                <div className="grid-2-cols">
                                    <div className="setting-form-group">
                                        <label>UserName</label>
                                        <input type="text" className="setting-input" defaultValue={formData.username} />
                                        <span className="setting-hint">Dùng để đăng nhập và nhận thông báo hệ thống.</span>
                                    </div>
                                    <div className="setting-form-group">
                                        <label>Tên người dùng (ID)</label>
                                        <input type="text" className="setting-input readonly" defaultValue={`${formData.id}`} readOnly />
                                    </div>
                                    <div className="setting-form-group">
                                        <label>Cập nhật lại mật khẩu</label>
                                        <input type="password" className="setting-input" placeholder="Tối thiểu 8 ký tự" />
                                    </div>
                                </div>

                                <div className="setting-actions">
                                    <button className="btn-primary">Lưu thay đổi</button>
                                </div>
                            </div>

                            <hr className="setting-divider" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Màn hình loading khi gọi API
    if (loading) {
        return (
            <div className="detail-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div style={{ textAlign: 'center', color: '#2563eb' }}>
                    <LoadingOutlined style={{ fontSize: '48px', marginBottom: '16px' }} spin />
                    <h3>Đang tải dữ liệu nhân viên...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="detail-page">
            {/* 1. HEADER CARD */}
            <div className="detail-header-card">
                <div className="header-info-wrap">
                    <div className="header-avatar">
                        <img src={`https://ui-avatars.com/api/?name=${formData.full_name}&background=random`} alt={formData.full_name} />
                        <div className="status-badge-icon"><CheckCircleFilled /></div>
                    </div>
                    <div className="header-text">
                        {/* Đã cập nhật lấy tên thực tế từ API */}
                        <h1 className="employee-name">{renderEditableValue('full_name')}</h1>
                        <div className="employee-tags">
                            <span className="tag-id">#{id}</span>
                            <span className="tag-status"><span className="status-dot"></span> Đang hoạt động</span>
                        </div>
                        <div className="employee-meta">
                            <span><ToolOutlined /> {formData.department}</span>
                            <span><EnvironmentOutlined /> {formData.address.split(',').pop()?.trim()}</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn-secondary ${isEditing ? 'active-edit' : ''}`}
                        onClick={handleToggleEdit}
                    >
                        {isEditing ? (
                            <><CheckCircleFilled /> Hoàn tất</>
                        ) : (
                            <><EditOutlined /> Chỉnh sửa</>
                        )}
                    </button>

                    <button className="btn-primary">
                        <DownloadOutlined /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* 2. BODY LAYOUT */}
            <div className="detail-body">

                {/* SIDEBAR */}
                <div className="detail-sidebar">
                    <nav className="detail-nav">
                        <button className={`nav-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                            <UserOutlined /> Thông tin chung
                        </button>
                        <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                            <CalendarOutlined /> Lịch sử chấm công
                        </button>
                        <button className={`nav-item ${activeTab === 'face' ? 'active' : ''}`} onClick={() => setActiveTab('face')}>
                            <SmileOutlined /> Dữ liệu khuôn mặt
                        </button>
                        <button className={`nav-item ${activeTab === 'setting' ? 'active' : ''}`} onClick={() => setActiveTab('setting')}>
                            <SettingOutlined /> Cài đặt tài khoản
                        </button>
                    </nav>

                    <div className="performance-card">
                        <h3 className="card-title-small">HIỆU SUẤT 6 THÁNG</h3>
                        <div className="chart-container">
                            <div className="bar-wrap"><div className="bar bar-lvl-1" style={{ height: '50%' }}></div><span className="bar-label">Th1</span></div>
                            <div className="bar-wrap"><div className="bar bar-lvl-2" style={{ height: '65%' }}></div><span className="bar-label">Th2</span></div>
                            <div className="bar-wrap"><div className="bar bar-lvl-3" style={{ height: '75%' }}></div><span className="bar-label">Th3</span></div>
                            <div className="bar-wrap"><div className="bar bar-lvl-4" style={{ height: '60%' }}></div><span className="bar-label">Th4</span></div>
                            <div className="bar-wrap"><div className="bar bar-lvl-5" style={{ height: '90%' }}></div><span className="bar-label">Th5</span></div>
                            <div className="bar-wrap"><div className="bar bar-lvl-6" style={{ height: '85%' }}></div><span className="bar-label">Th6</span></div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="detail-main">
                    {renderTabContent()}
                </div>
            </div>

            {/* Premium Confirmation Modal for Face Update */}
            {showFaceConfirm && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <div className="modal-header">
                            <div className="modal-icon-container">
                                <InfoCircleOutlined className="modal-icon-warn" />
                            </div>
                            <h3>Cảnh báo xoá dữ liệu</h3>
                        </div>
                        <div className="modal-body">
                            <p>Bạn đang thực hiện yêu cầu cập nhật khuôn mặt của nhân viên <strong>{formData.full_name}</strong>.</p>
                            <p>Hành động này <strong>sẽ xoá dữ khuôn mặt cũ</strong>. Nhân viên sẽ được yêu cầu quét lại khuôn mặt mới để xác thực danh tính.</p>

                            <div className="modal-alert-box">
                                <p className="modal-alert-text">Xác nhận thực hiện thay đổi này?</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal-cancel" onClick={() => setShowFaceConfirm(false)}>
                                Huỷ
                            </button>
                            <button className="btn-modal-confirm" onClick={confirmFaceUpdate}>
                                <StopOutlined /> Xác nhận xoá
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}