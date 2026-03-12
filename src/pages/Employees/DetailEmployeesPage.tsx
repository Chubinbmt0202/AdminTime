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
    ArrowRightOutlined
} from '@ant-design/icons';
import './DetailEmployeesPage.css';

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

type FieldKey = keyof typeof initialFormData;

export default function DetailEmployeesPage() {
    const [activeTab, setActiveTab] = useState('info');

    // Trạng thái bật/tắt toàn bộ chế độ edit
    const [isEditing, setIsEditing] = useState(false);

    // Lưu trữ dữ liệu thông tin nhân viên
    const [formData, setFormData] = useState(initialFormData);

    // Lưu trữ field nào đang được click để biến thành Input
    const [activeEditField, setActiveEditField] = useState<FieldKey | null>(null);

    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
        setActiveEditField(null); // Tắt input nếu đang mở dở
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

                    {/* Card: Dữ liệu khuôn mặt */}
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

                                <a href="#" className="update-link">
                                    Cập nhật lại dữ liệu khuôn mặt <ArrowRightOutlined />
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}