import { useState } from 'react';
import {
    EditOutlined,
    DownloadOutlined,
    ToolOutlined,
    EnvironmentOutlined,
    UserOutlined,
    CalendarOutlined,
    SmileOutlined,
    WalletOutlined,
    FileTextOutlined,
    RiseOutlined,
    CheckCircleFilled,
    InfoCircleOutlined,
    LoadingOutlined,
    ArrowRightOutlined,
    FilterOutlined
} from '@ant-design/icons';
import './DetailEmployeesPage.css';
import { useToast } from '../../components/common/Toast/Toast';

const initialFormData = {
    email: 'jordan.smith@company.com',
    phone: '+84 901 234 567',
    dob: '15/05/1990',
    gender: 'Nam',
    address: '123 Đường Láng, Phường Láng Thượng, Quận Đống Đa, Hà Nội',
    department: 'Engineering (Kỹ thuật)',
    title: 'Senior Software Architect',
    joinDate: '12/01/2020',
    manager: 'Elena Rodriguez'
};

// Dữ liệu mẫu cho Lịch sử chấm công
const historyRecords = [
    { id: 1, date: '20/10/2023', day: 'Thứ Sáu', timeIn: '08:05', timeOut: '17:30', total: '8.5h', status: 'Đúng giờ', statusType: 'success', proofs: ['https://i.pravatar.cc/150?u=p1', 'https://i.pravatar.cc/150?u=p2'] },
    { id: 2, date: '19/10/2023', day: 'Thứ Năm', timeIn: '08:45', timeOut: '17:35', total: '7.8h', status: 'Đi muộn (45p)', statusType: 'warning', isLateIn: true, proofs: ['https://i.pravatar.cc/150?u=p3'] },
    { id: 3, date: '18/10/2023', day: 'Thứ Tư', timeIn: '07:55', timeOut: '17:30', total: '8.5h', status: 'Đúng giờ', statusType: 'success', proofs: ['https://i.pravatar.cc/150?u=p4'] },
    { id: 4, date: '17/10/2023', day: 'Thứ Ba', timeIn: '--:--', timeOut: '--:--', total: '0h', status: 'Nghỉ phép (P)', statusType: 'default', note: 'Đã duyệt (ID: #AL-102)' },
    { id: 5, date: '16/10/2023', day: 'Thứ Hai', timeIn: '08:00', timeOut: '16:30', total: '7.5h', status: 'Về sớm (30p)', statusType: 'warning', isEarlyOut: true, proofs: ['https://i.pravatar.cc/150?u=p5'] },
];

type FieldKey = keyof typeof initialFormData;

export default function DetailEmployeesPage() {
    const [activeTab, setActiveTab] = useState('info');

    const toast = useToast()

    // Trạng thái bật/tắt toàn bộ chế độ edit
    const [isEditing, setIsEditing] = useState(false);
    const [isRequestingFaceUpdate, setIsRequestingFaceUpdate] = useState(false);

    // Lưu trữ dữ liệu thông tin nhân viên
    const [formData, setFormData] = useState(initialFormData);

    // Lưu trữ field nào đang được click để biến thành Input
    const [activeEditField, setActiveEditField] = useState<FieldKey | null>(null);

    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
        setActiveEditField(null); // Tắt input nếu đang mở dở
    };

    const handleRequestFaceUpdate = async (e: React.MouseEvent) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>
        if (isRequestingFaceUpdate) return;

        setIsRequestingFaceUpdate(true);
        try {
            // Giả lập gọi API mất 1 giây (Sau này bạn thay bằng hàm fetch API thật)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Thông báo thành công
            toast.success(
                'Đã gửi yêu cầu',
                `Nhân viên ${formData.email} sẽ nhận được thông báo cập nhật khuôn mặt trên ứng dụng.`
            );
        } catch (error) {
            toast.error('Lỗi', 'Không thể gửi yêu cầu, vui lòng thử lại sau.');
        } finally {
            setIsRequestingFaceUpdate(false);
        }
    };

    // Hàm Helper để render linh hoạt giữa Text và Input
    const renderEditableValue = (key: FieldKey, customDisplay?: React.ReactNode) => {
        if (activeEditField === key) {
            return (
                <input
                    className="inline-input"
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    onBlur={() => setActiveEditField(null)} // Click ra ngoài thì tắt input
                    onKeyDown={(e) => e.key === 'Enter' && setActiveEditField(null)} // Nhấn Enter thì tắt input
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

    // Hàm quản lý nội dung hiển thị dựa trên Tab đang active
    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <>
                        {/* Card: Thông tin cá nhân */}
                        <div className="info-card">
                            <div className="card-header">
                                <FileTextOutlined className="card-icon" />
                                <h2>Thông tin cá nhân</h2>
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

                        {/* Card: Thông tin công việc */}
                        <div className="info-card">
                            <div className="card-header">
                                <RiseOutlined className="card-icon" />
                                <h2>Thông tin công việc</h2>
                            </div>
                            <div className="card-content grid-2-cols">
                                <div className="info-item">
                                    <span className="info-label">PHÒNG BAN</span>
                                    <span className="info-value">
                                        {renderEditableValue('department', <span><span className="dot-blue"></span> {formData.department}</span>)}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">CHỨC VỤ</span>
                                    <span className="info-value">{renderEditableValue('title')}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">NGÀY THAM GIA</span>
                                    <span className="info-value">{renderEditableValue('joinDate')}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">NGƯỜI QUẢN LÝ</span>
                                    <span className="info-value manager-wrap">
                                        {renderEditableValue('manager', (
                                            <div className="manager-info">
                                                <img src="https://i.pravatar.cc/150?u=elena" alt="Manager" className="manager-avatar" />
                                                {formData.manager}
                                            </div>
                                        ))}
                                    </span>
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
                            <span className="status-tag success">
                                <CheckCircleFilled /> Đã đăng ký
                            </span>
                        </div>
                        <div className="card-content face-data-wrap">
                            <div className="face-image-box">
                                <img src="https://i.pravatar.cc/300?u=jordan" alt="Face Data" />
                                <span className="preview-label">Preview Mode</span>
                            </div>

                            <div className="face-details">
                                <div className="face-stats grid-2-cols">
                                    <div className="stat-box">
                                        <span className="info-label">NGÀY ĐĂNG KÝ</span>
                                        <span className="info-value large">15/01/2020 09:30</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="info-label">ĐỘ TIN CẬY</span>
                                        <span className="info-value large text-success">98.4%</span>
                                    </div>
                                </div>

                                <p className="face-note">
                                    <InfoCircleOutlined /> Dữ liệu khuôn mặt được sử dụng cho mục đích chấm công và bảo mật truy cập tại văn phòng. Toàn bộ dữ liệu được mã hóa và bảo mật theo tiêu chuẩn công ty.
                                </p>

                                <a
                                    href="#"
                                    className={`update-link ${isRequestingFaceUpdate ? 'disabled' : ''}`}
                                    onClick={handleRequestFaceUpdate}
                                >
                                    {isRequestingFaceUpdate ? (
                                        <><LoadingOutlined spin /> Đang gửi yêu cầu...</>
                                    ) : (
                                        <>Yêu cầu cập nhật lại dữ liệu <ArrowRightOutlined /></>
                                    )}
                                </a>
                            </div>
                        </div>
                    </div>
                );

            case 'salary':
                return (
                    <div className="info-card">
                        <div className="card-header">
                            <WalletOutlined className="card-icon" />
                            <h2>Lương & Phúc lợi</h2>
                        </div>
                        <div className="card-content">
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                <WalletOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                                <p>Thông tin về lương, thưởng và phúc lợi của nhân viên sẽ hiển thị tại đây.</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="detail-page">
            {/* 1. HEADER CARD */}
            <div className="detail-header-card">
                <div className="header-info-wrap">
                    <div className="header-avatar">
                        <img src="https://i.pravatar.cc/150?u=jordan" alt="Jordan Smith" />
                        <div className="status-badge-icon"><CheckCircleFilled /></div>
                    </div>
                    <div className="header-text">
                        <h1 className="employee-name">Jordan Smith</h1>
                        <div className="employee-tags">
                            <span className="tag-id">#ENG-9042</span>
                            <span className="tag-status"><span className="status-dot"></span> Đang hoạt động</span>
                        </div>
                        <div className="employee-meta">
                            <span><ToolOutlined /> {formData.department}</span>
                            <span><EnvironmentOutlined /> Hà Nội, VN</span>
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
                        <button className={`nav-item ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => setActiveTab('salary')}>
                            <WalletOutlined /> Lương & Phúc lợi
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