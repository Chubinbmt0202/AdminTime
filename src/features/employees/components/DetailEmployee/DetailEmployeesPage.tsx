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
    StopOutlined
} from '@ant-design/icons';
import './DetailEmployeesPage.css';
import { useToast } from '../../../../components/common/Toast/Toast';

// Khởi tạo form trống ban đầu (để không bị flash dữ liệu giả trước khi API load xong)
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
    manager: ''
};

// Dữ liệu mẫu cho Lịch sử chấm công (Có thể thay bằng API sau)
const historyRecords = [
    { id: 1, date: '20/10/2023', day: 'Thứ Sáu', timeIn: '08:05', timeOut: '17:30', total: '8.5h', status: 'Đúng giờ', statusType: 'success', proofs: ['https://i.pravatar.cc/150?u=p1', 'https://i.pravatar.cc/150?u=p2'] },
    { id: 2, date: '19/10/2023', day: 'Thứ Năm', timeIn: '08:45', timeOut: '17:35', total: '7.8h', status: 'Đi muộn (45p)', statusType: 'warning', isLateIn: true, proofs: ['https://i.pravatar.cc/150?u=p3'] },
    { id: 3, date: '18/10/2023', day: 'Thứ Tư', timeIn: '07:55', timeOut: '17:30', total: '8.5h', status: 'Đúng giờ', statusType: 'success', proofs: ['https://i.pravatar.cc/150?u=p4'] },
    { id: 4, date: '17/10/2023', day: 'Thứ Ba', timeIn: '--:--', timeOut: '--:--', total: '0h', status: 'Nghỉ phép (P)', statusType: 'default', note: 'Đã duyệt (ID: #AL-102)' },
    { id: 5, date: '16/10/2023', day: 'Thứ Hai', timeIn: '08:00', timeOut: '16:30', total: '7.5h', status: 'Về sớm (30p)', statusType: 'warning', isEarlyOut: true, proofs: ['https://i.pravatar.cc/150?u=p5'] },
];

type FieldKey = keyof typeof initialFormData;

export default function DetailEmployeesPage() {
    const { id } = useParams(); // Lấy ID từ URL (VD: http://localhost:5173/employees/10 -> id = 10)
    const toast = useToast();

    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu API

    // Trạng thái bật/tắt toàn bộ chế độ edit
    const [isEditing, setIsEditing] = useState(false);
    const [isRequestingFaceUpdate, setIsRequestingFaceUpdate] = useState(false);

    // Lưu trữ dữ liệu thông tin nhân viên
    const [formData, setFormData] = useState(initialFormData);

    // Lưu trữ field nào đang được click để biến thành Input
    const [activeEditField, setActiveEditField] = useState<FieldKey | null>(null);

    const [isRequestingInfoUpdate, setIsRequestingInfoUpdate] = useState(false);

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
            if (!id) return;
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3001/api/employees/getByID/${id}`);
                const json = await res.json();

                if (json.success) {
                    // Cập nhật dữ liệu từ API vào state
                    // (Lưu ý: Bạn hãy map đúng các trường (fields) từ DB của bạn trả về vào đây)
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
                        manager: json.data.manager || 'Chưa cập nhật'
                    });
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

    const handleRequestFaceUpdate = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isRequestingFaceUpdate) return;

        setIsRequestingFaceUpdate(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(
                'Đã gửi yêu cầu',
                `Nhân viên ${formData.full_name} sẽ nhận được thông báo cập nhật khuôn mặt trên ứng dụng.`
            );
        } catch (error) {
            toast.error('Lỗi', 'Không thể gửi yêu cầu, vui lòng thử lại sau.');
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
                return (
                    <div className="history-tab-wrapper">
                        {/* 1. Summary & Filters */}
                        <div className="history-top-bar">
                            <div className="history-summary-cards">
                                <div className="h-card">
                                    <span className="h-card-title">TỔNG CỘNG</span>
                                    <span className="h-card-value text-blue">22/23</span>
                                    <span className="h-card-desc">Ngày làm việc</span>
                                </div>
                                <div className="h-card">
                                    <span className="h-card-title">ĐI MUỘN</span>
                                    <span className="h-card-value text-orange">2</span>
                                    <span className="h-card-desc">Số lần trong tháng</span>
                                </div>
                                <div className="h-card">
                                    <span className="h-card-title">VỀ SỚM</span>
                                    <span className="h-card-value text-orange">1</span>
                                    <span className="h-card-desc">Số lần trong tháng</span>
                                </div>
                                <div className="h-card">
                                    <span className="h-card-title">NGHỈ PHÉP</span>
                                    <span className="h-card-value text-green">1</span>
                                    <span className="h-card-desc">Đã phê duyệt</span>
                                </div>
                            </div>

                            <div className="history-filters">
                                <select className="emp-select h-select">
                                    <option>Tháng 10/2023</option>
                                    <option>Tháng 09/2023</option>
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
                                    <span><span className="dot dot-green"></span> Đúng giờ</span>
                                    <span><span className="dot dot-orange"></span> Đi muộn</span>
                                    <span><span className="dot dot-gray"></span> Nghỉ</span>
                                </div>
                            </div>
                            <div className="history-table-wrap">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>NGÀY</th>
                                            <th>THỨ</th>
                                            <th>GIỜ VÀO</th>
                                            <th>GIỜ RA</th>
                                            <th>TỔNG GIỜ</th>
                                            <th>TRẠNG THÁI</th>
                                            <th>MINH CHỨNG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyRecords.map(record => (
                                            <tr key={record.id}>
                                                <td className="fw-600">{record.date}</td>
                                                <td className="text-gray">{record.day}</td>
                                                <td className={`fw-600 ${record.isLateIn ? 'text-orange' : ''}`}>
                                                    {record.timeIn}
                                                </td>
                                                <td className={`fw-600 ${record.isEarlyOut ? 'text-orange' : ''}`}>
                                                    {record.timeOut}
                                                </td>
                                                <td>{record.total}</td>
                                                <td>
                                                    <span className={`h-badge badge-${record.statusType}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {record.proofs ? (
                                                        <div className="proof-images">
                                                            {record.proofs.map((img, idx) => (
                                                                <img key={idx} src={img} alt="proof" />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="h-note">{record.note}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="h-pagination-wrap">
                                <span className="h-pag-text">Hiển thị 1-5 trong số 22 ngày công</span>
                                <div className="h-pag-controls">
                                    <button className="h-pag-btn disabled">Trước</button>
                                    <button className="h-pag-btn active">1</button>
                                    <button className="h-pag-btn">2</button>
                                    <button className="h-pag-btn">3</button>
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
                                <span className="status-tag success mr-2">
                                    <CheckCircleFilled /> Đã đăng ký
                                </span>
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
        </div>
    );
}