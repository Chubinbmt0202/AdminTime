import { useState, useEffect, useMemo } from 'react';
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
    CloseOutlined,
    TeamOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ChiTietNhanVienPage.css';
import { useThongBao } from '../../../../components/common/Toast/ThongBaoToast';
import { attendanceService, type AttendanceRecord } from '../../../../services/dichVuChamCong';
import { employeeApi } from '../../api/nhanVien.api';
import { departmentApi } from '../../../departments/api/phongBan.api';
import type { Department } from '../../../../types/kieuPhongBan';
import { vaiTroApi, type Role } from '../../../../features/roles/api/vaiTro.api';
import DrawerChiTietChamCong from './DrawerChiTietChamCong';
import { xuatRaExcel } from '../../../../utils/tienIchXuatFile';

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
    department_id: '',
    title: '',
    joinDate: '',
    manager: '',
    du_lieu_khuon_mat: null as any,
    hinh_anh: '',
    ngay_cap_nhat_khuon_mat: null as string | null,
    status: true,
    login_devices: [] as any[]
};

type FieldKey = keyof typeof initialFormData;

// Helpers for history tab
const formatHistoryDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

const formatFaceRegistrationDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Chưa cập nhật';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
        return 'Chưa cập nhật';
    }
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

const calculateLateMinutes = (checkIn: string | null) => {
    if (!checkIn) return 0;
    const date = new Date(checkIn);
    const diffMs = date.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0, 0).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes > 0 ? diffMinutes : 0;
};

const getOtBadge = (log: AttendanceRecord) => {
    if (!log.has_ot) return <span className="text-muted">--</span>;

    const start = log.ot_start_time ? log.ot_start_time.substring(0, 5) : '';
    const end = log.ot_expected_end_time ? log.ot_expected_end_time.substring(0, 5) : '';
    const rangeStr = `${start} - ${end}`;

    switch (log.ot_status) {
        case 'DA_DUYET':
            return (
                <span className="text-green" style={{ fontWeight: 600 }}>
                    {rangeStr} (Đã duyệt)
                </span>
            );
        case 'CHO_DUYET':
            return (
                <span className="text-orange" style={{ fontWeight: 600 }}>
                    {rangeStr} (Chờ duyệt)
                </span>
            );
        case 'TU_CHOI':
            return (
                <span className="text-red" style={{ fontWeight: 600 }}>
                    {rangeStr} (Từ chối)
                </span>
            );
        default:
            return <span className="text-muted">--</span>;
    }
};

export default function ChiTietNhanVienPage() {
    const { id } = useParams(); // Lấy ID từ URL (VD: http://localhost:5173/employees/10 -> id = 10)
    const toast = useThongBao();

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

    // Trạng thái cho Drawer chi tiết chấm công
    const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
    const [isAttendanceDrawerOpen, setIsAttendanceDrawerOpen] = useState(false);

    const handleViewAttendanceDetail = (record: AttendanceRecord) => {
        setSelectedAttendance(record);
        setIsAttendanceDrawerOpen(true);
    };

    // Lưu trữ dữ liệu thông tin nhân viên
    const [formData, setFormData] = useState(initialFormData);

    // Lưu trữ field nào đang được click để biến thành Input
    const [activeEditField, setActiveEditField] = useState<FieldKey | null>(null);

    const [isRequestingInfoUpdate, setIsRequestingInfoUpdate] = useState(false);

    // States for update processes
    const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

    // Filter states for history
    const monthOptions = useMemo(() => {
        const months = [];
        const currentDate = new Date();
        for (let i = 0; i < 6; i++) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push({
                label: `Tháng ${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
                value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            });
        }
        return months;
    }, []);

    const [selectedMonth, setSelectedMonth] = useState<string>(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    );
    const [selectedHistoryStatus, setSelectedHistoryStatus] = useState<string>('all');

    // States for department settings
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [settingDepartmentId, setSettingDepartmentId] = useState<string>('');
    const [settingRole, setSettingRole] = useState<string>('');
    const [isUpdatingDepartment, setIsUpdatingDepartment] = useState(false);

    useEffect(() => {
        const taiDanhSachKhoiTao = async () => {
            try {
                const [resDept, resRole] = await Promise.all([
                    departmentApi.layTatCa(),
                    vaiTroApi.layTatCa()
                ]);
                if (resDept.success) setDepartments(resDept.data);
                if (resRole.success) setRoles(resRole.data);
            } catch (err) {
                console.error("Lỗi lấy dữ liệu khởi tạo:", err);
            }
        };
        taiDanhSachKhoiTao();
    }, []);

    const handleUpdateDepartment = async () => {
        if (!id) return;
        setIsUpdatingDepartment(true);
        try {
            const res = await employeeApi.capNhat(id, {
                department_id: settingDepartmentId || null,
                role: settingRole || null
            });
            if (res.success) {
                toast.success('Cập nhật phòng ban và chức vụ thành công');
                setFormData(prev => {
                    const dept = departments.find(d => d.id_phong_ban === settingDepartmentId);
                    const deptName = dept ? (dept.ten_phong_ban || dept.mo_ta || 'Phòng ban không tên') : 'Chưa phân phòng';
                    const selectedRole = roles.find(r => r.id_vai_tro === settingRole);
                    return {
                        ...prev,
                        department_id: settingDepartmentId,
                        department: deptName,
                        title: selectedRole ? selectedRole.ten_vai_tro : prev.title
                    };
                });
            } else {
                toast.error(res.message || 'Không thể cập nhật phòng ban và chức vụ');
            }
        } catch (err) {
            console.error('Lỗi cập nhật phòng ban và chức vụ:', err);
            toast.error('Đã xảy ra lỗi hệ thống');
        } finally {
            setIsUpdatingDepartment(false);
        }
    };

    // ================== FETCH ATTENDANCE HISTORY ==================
    const fetchHistory = async () => {
        if (!id) return;
        setHistoryLoading(true);
        try {
            const res = await attendanceService.layLichSuNhanVien(id);
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

    useEffect(() => {
        if (id) {
            fetchHistory();
        }
    }, [id]);

    const handleExportHistory = () => {
        if (!historyLogs || historyLogs.length === 0) {
            toast.error('Lỗi', 'Không có dữ liệu lịch sử để xuất');
            return;
        }

        const data = historyLogs.map(log => ({
            'Ngày': formatHistoryDate(log.log_date),
            'Thứ': getVietnameseDay(log.log_date),
            'Giờ vào': formatHistoryTime(log.check_in_time),
            'Giờ ra': formatHistoryTime(log.check_out_time),
            'Tổng giờ': calculateDuration(log.check_in_time, log.check_out_time),
            'Tăng ca': log.has_ot ? 'Có' : 'Không',
            'Trạng thái': getHistoryStatusLabel(log.status)
        }));

        const employeeName = formData.full_name ? formData.full_name.replace(/\s+/g, '_') : 'Nhan_Vien';
        xuatRaExcel(data, `Lich_Su_Cham_Cong_${employeeName}`);
    };

    const handleRequestInfoUpdate = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isRequestingInfoUpdate || !id) return;

        setIsRequestingInfoUpdate(true);
        try {
            const res = await employeeApi.yeuCauCapNhatThongTin(id);
            if (res.success) {
                toast.success(
                    'Đã gửi yêu cầu',
                    `Nhân viên ${formData.full_name} sẽ nhận được thông báo yêu cầu cập nhật thông tin cá nhân.`
                );
            } else {
                toast.error('Lỗi', res.message || 'Không thể gửi yêu cầu cập nhật thông tin cá nhân.');
            }
        } catch (error) {
            console.error('Failed to request profile update:', error);
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
                        id: json.data.id_nhan_vien || json.data.id || 'Chưa cập nhật',
                        username: json.data.username || 'Chưa cập nhật',
                        full_name: json.data.full_name || 'Chưa cập nhật',
                        email: json.data.email || 'Chưa cập nhật',
                        phone: json.data.phone_number || json.data.phone || 'Chưa cập nhật',
                        dob: json.data.date_of_birth ? json.data.date_of_birth.substring(0, 10) : (json.data.dob || 'Chưa cập nhật'),
                        gender: json.data.gender || 'Chưa cập nhật',
                        address: json.data.address || 'Chưa cập nhật',
                        department: json.data.department_name || json.data.department || 'Chưa cập nhật',
                        department_id: json.data.department_id || '',
                        title: json.data.role_name || 'Chưa cập nhật', // Gán role làm chức vụ
                        joinDate: json.data.created_at ? new Date(json.data.created_at).toLocaleDateString('vi-VN') : 'Chưa cập nhật',
                        manager: json.data.manager || 'Chưa cập nhật',
                        du_lieu_khuon_mat: json.data.du_lieu_khuon_mat,
                        hinh_anh: json.data.hinh_anh || '',
                        ngay_cap_nhat_khuon_mat: json.data.ngay_cap_nhat_khuon_mat || null,
                        status: json.data.trang_thai !== undefined ? json.data.trang_thai : true,
                        login_devices: json.data.login_devices || []
                    });
                    setSettingDepartmentId(json.data.department_id || '');
                    setSettingRole(json.data.id_vai_tro || '');
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
    const handleToggleEdit = async () => {
        if (isEditing) {
            // Đang ở chế độ Edit -> Nhấn hoàn tất -> Lưu dữ liệu
            if (!id) return;
            setIsUpdatingInfo(true);
            try {
                const res = await employeeApi.capNhat(id, {
                    full_name: formData.full_name,
                    email: formData.email === 'Chưa cập nhật' ? null : formData.email,
                    phone_number: formData.phone === 'Chưa cập nhật' ? null : formData.phone,
                    date_of_birth: formData.dob === 'Chưa cập nhật' ? null : formData.dob,
                    gender: formData.gender === 'Chưa cập nhật' ? null : formData.gender,
                    address: formData.address === 'Chưa cập nhật' ? null : formData.address,
                });
                if (res.success) {
                    toast.success('Thành công', 'Cập nhật thông tin cá nhân thành công');
                } else {
                    toast.error('Lỗi', res.message || 'Không thể cập nhật thông tin');
                }
            } catch (err) {
                console.error("Lỗi cập nhật thông tin:", err);
                toast.error('Lỗi', 'Đã xảy ra lỗi hệ thống');
            } finally {
                setIsUpdatingInfo(false);
            }
        }
        setIsEditing(!isEditing);
        setActiveEditField(null);
    };

    const handleUpdateSecurity = async () => {
        if (!id) return;
        if (!newPassword || newPassword.length < 8) {
            toast.error('Lỗi', 'Mật khẩu phải có tối thiểu 8 ký tự');
            return;
        }
        setIsUpdatingSecurity(true);
        try {
            const res = await employeeApi.capNhat(id, { password: newPassword });
            if (res.success) {
                toast.success('Thành công', 'Cập nhật mật khẩu thành công');
                setNewPassword('');
            } else {
                toast.error('Lỗi', res.message || 'Không thể cập nhật mật khẩu');
            }
        } catch (err) {
            console.error("Lỗi cập nhật mật khẩu:", err);
            toast.error('Lỗi', 'Đã xảy ra lỗi hệ thống');
        } finally {
            setIsUpdatingSecurity(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!id) return;
        const newStatus = !formData.status;
        const confirmMsg = newStatus ? "Bạn có chắc chắn muốn kích hoạt lại tài khoản này?" : "Bạn có chắc chắn muốn vô hiệu hoá tài khoản này? Nhân viên sẽ không thể đăng nhập.";
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await employeeApi.capNhat(id, { status: newStatus });
            if (res.success) {
                toast.success('Thành công', newStatus ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hoá tài khoản');
                setFormData(prev => ({ ...prev, status: newStatus }));
            } else {
                toast.error('Lỗi', res.message || 'Thao tác thất bại');
            }
        } catch (err) {
            console.error('Lỗi đổi trạng thái:', err);
            toast.error('Lỗi', 'Đã xảy ra lỗi hệ thống');
        }
    };

    const xuLyYeuCauCapNhatGuongMat = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowFaceConfirm(true);
    };

    const confirmFaceUpdate = async () => {
        if (isRequestingFaceUpdate || !id) return;
        setShowFaceConfirm(false);
        setIsRequestingFaceUpdate(true);
        try {
            const res = await employeeApi.yeuCauCapNhatGuongMat(id);
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
                // Lọc theo tháng
                const monthLogs = historyLogs.filter(log => {
                    if (!log.log_date) return false;
                    return log.log_date.substring(0, 7) === selectedMonth;
                });

                // Lọc tiếp theo trạng thái
                const filteredHistoryLogs = monthLogs.filter(log => {
                    if (selectedHistoryStatus === 'all') return true;
                    if (selectedHistoryStatus === 'present' && log.status === 'present') return true;
                    if (selectedHistoryStatus === 'late_early' && (log.status === 'late' || log.status === 'half_day')) return true;
                    return false;
                });

                // Tính toán sơ bộ từ dữ liệu đã lọc theo tháng
                const stats = {
                    total: monthLogs.length,
                    late: monthLogs.filter(l => l.status === 'late').length,
                    half: monthLogs.filter(l => l.status === 'half_day').length,
                    present: monthLogs.filter(l => l.status === 'present').length,
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
                                <select
                                    className="emp-select h-select"
                                    value={selectedMonth}
                                    onChange={e => setSelectedMonth(e.target.value)}
                                >
                                    {monthOptions.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <select
                                    className="emp-select h-select"
                                    value={selectedHistoryStatus}
                                    onChange={e => setSelectedHistoryStatus(e.target.value)}
                                >
                                    <option value="all">Mọi trạng thái</option>
                                    <option value="present">Đúng giờ</option>
                                    <option value="late_early">Đi muộn / Về sớm</option>
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
                                    <button className="btn-secondary" onClick={handleExportHistory}>
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
                                                <th>TĂNG CA</th>
                                                <th>TRẠNG THÁI</th>
                                                <th>MINH CHỨNG SỐ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredHistoryLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                                        Không tìm thấy lịch sử chấm công
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredHistoryLogs.map((record, idx) => (
                                                    <tr key={idx} onClick={() => handleViewAttendanceDetail(record)} style={{ cursor: 'pointer' }} title="Nhấn để xem chi tiết">
                                                        <td className="fw-600">{formatHistoryDate(record.log_date)}</td>
                                                        <td className="text-gray">{getVietnameseDay(record.log_date)}</td>
                                                        <td className={`fw-600 ${record.status === 'late' ? 'text-orange' : ''}`}>
                                                            {formatHistoryTime(record.check_in_time)}
                                                            {record.status === 'late' && (
                                                                <span style={{ display: 'block', fontSize: '12px', color: '#f97316', fontWeight: 'normal' }}>
                                                                    (Đi muộn {calculateLateMinutes(record.check_in_time)} phút)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="fw-600">
                                                            {formatHistoryTime(record.check_out_time)}
                                                        </td>
                                                        <td className="fw-600">
                                                            {calculateDuration(record.check_in_time, record.check_out_time)}
                                                        </td>
                                                        <td>
                                                            {getOtBadge(record)}
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
                                <span className="h-pag-text">Hiển thị {filteredHistoryLogs.length} ngày công</span>
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
                                    onClick={xuLyYeuCauCapNhatGuongMat}
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
                                <img src={formData.hinh_anh ? formData.hinh_anh : `https://ui-avatars.com/api/?name=${formData.full_name}&background=random&size=300`} alt="Face Data" style={formData.hinh_anh ? { objectFit: 'cover' } : {}} />
                                <span className="preview-label">Preview Mode</span>
                            </div>

                            <div className="face-details">
                                <div className="face-stats grid-2-cols">
                                    <div className="stat-box">
                                        <span className="info-label">NGÀY ĐĂNG KÝ</span>
                                        <span className="info-value large">
                                            {formData.du_lieu_khuon_mat && Object.keys(formData.du_lieu_khuon_mat).length > 0
                                                ? formatFaceRegistrationDate(formData.ngay_cap_nhat_khuon_mat)
                                                : 'Chưa đăng ký'}
                                        </span>
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
                            <div className="card-title-wrap flex-between" style={{ width: '100%' }}>
                                <div className="card-title-wrap">
                                    <SettingOutlined className="card-icon" />
                                    <h2>Cài đặt tài khoản</h2>
                                </div>
                                <button
                                    className={formData.status ? "btn-danger-outline" : "btn-primary"}
                                    onClick={handleToggleStatus}
                                >
                                    {formData.status ? <><StopOutlined /> Vô hiệu hoá tài khoản</> : <><CheckCircleFilled /> Kích hoạt tài khoản</>}
                                </button>
                            </div>
                        </div>
                        <div className="card-content setting-content">
                            <p className="setting-desc">Quản lý thông tin đăng nhập, bảo mật và tùy chỉnh trải nghiệm của bạn.</p>

                            {/* Section: Thông tin đăng nhập */}
                            <div className="setting-section">
                                <h3 className="setting-section-title">
                                    <LoginOutlined /> Thông tin đăng nhập & Bảo mật
                                </h3>

                                <div className="grid-2-cols">
                                    <div className="setting-form-group">
                                        <label>UserName (Tên đăng nhập)</label>
                                        <input type="text" className="setting-input readonly" value={formData.username} readOnly />
                                        <span className="setting-hint">Không thể thay đổi tên đăng nhập.</span>
                                    </div>
                                    <div className="setting-form-group">
                                        <label>Mã định danh (ID)</label>
                                        <input type="text" className="setting-input readonly" value={`${formData.id}`} readOnly />
                                    </div>
                                    <div className="setting-form-group">
                                        <label>Cập nhật lại mật khẩu</label>
                                        <input
                                            type="password"
                                            className="setting-input"
                                            placeholder="Tối thiểu 8 ký tự"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <span className="setting-hint">Bỏ trống nếu không muốn đổi mật khẩu.</span>
                                    </div>
                                </div>

                                <div className="setting-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={handleUpdateSecurity}
                                        disabled={isUpdatingSecurity || !newPassword}
                                    >
                                        {isUpdatingSecurity ? <><LoadingOutlined spin /> Đang cập nhật...</> : 'Lưu thay đổi mật khẩu'}
                                    </button>
                                </div>
                            </div>

                            <hr className="setting-divider" />

                            {/* Section: Thiết bị đăng nhập & WiFi */}
                            <div className="setting-section">
                                <h3 className="setting-section-title">
                                    <LoginOutlined /> Lịch sử đăng nhập & Thiết bị
                                </h3>
                                <p className="setting-desc" style={{ marginBottom: '16px' }}>
                                    Danh sách các thiết bị đã đăng nhập gần đây bằng tài khoản này.
                                </p>
                                
                                <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Thiết bị</th>
                                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Hệ điều hành</th>
                                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Địa chỉ IP</th>
                                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>WiFi (BSSID)</th>
                                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Thời gian đăng nhập</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(!formData.login_devices || formData.login_devices.length === 0) ? (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                                                        Chưa ghi nhận thiết bị đăng nhập nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                formData.login_devices.map((device: any, idx: number) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px 16px', fontWeight: 500, color: '#334155' }}>
                                                            {device.ten_thiet_bi || 'Thiết bị không xác định'}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                                                            {device.he_dieu_hanh || 'N/A'}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace' }}>
                                                            {device.dia_chi_ip || 'N/A'}
                                                        </td>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            {device.dia_chi_wifi ? (
                                                                <span style={{ 
                                                                    backgroundColor: '#eff6ff', 
                                                                    color: '#2563eb', 
                                                                    padding: '4px 8px', 
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    fontFamily: 'monospace'
                                                                }}>
                                                                    {device.dia_chi_wifi}
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: '#94a3b8' }}>N/A</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                                                            {new Date(device.thoi_gian_dang_nhap).toLocaleString('vi-VN')}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <hr className="setting-divider" />

                            {/* Section: Phân bổ phòng ban */}
                            <div className="setting-section">
                                <h3 className="setting-section-title">
                                    <TeamOutlined /> Phân bổ phòng ban & Chức vụ
                                </h3>

                                <div className="grid-2-cols">
                                    <div className="setting-form-group">
                                        <label>Phòng ban trực thuộc</label>
                                        <select
                                            className="setting-input"
                                            value={settingDepartmentId}
                                            onChange={(e) => setSettingDepartmentId(e.target.value)}
                                        >
                                            <option value="">-- Chưa phân phòng --</option>
                                            {departments.map(d => (
                                                <option key={d.id_phong_ban} value={d.id_phong_ban}>{d.ten_phong_ban || d.mo_ta || 'Phòng ban không tên'}</option>
                                            ))}
                                        </select>
                                        <span className="setting-hint">Lưu ý: Chuyển đổi phòng ban sẽ thay đổi quyền lợi tương ứng.</span>
                                    </div>
                                    <div className="setting-form-group">
                                        <label>Chức vụ (Vai trò)</label>
                                        <select
                                            className="setting-input"
                                            value={settingRole}
                                            onChange={(e) => setSettingRole(e.target.value)}
                                        >
                                            <option value="">-- Chọn chức vụ --</option>
                                            {roles.map(r => (
                                                <option key={r.id_vai_tro} value={r.id_vai_tro}>{r.ten_vai_tro}</option>
                                            ))}
                                        </select>
                                        <span className="setting-hint">Vai trò trong hệ thống.</span>
                                    </div>
                                </div>

                                <div className="setting-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={handleUpdateDepartment}
                                        disabled={isUpdatingDepartment}
                                    >
                                        {isUpdatingDepartment ? <><LoadingOutlined spin /> Đang cập nhật...</> : 'Cập nhật phòng ban & chức vụ'}
                                    </button>
                                </div>
                            </div>
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
                        <img src={formData.hinh_anh ? formData.hinh_anh : `https://ui-avatars.com/api/?name=${formData.full_name}&background=random`} alt={formData.full_name} style={formData.hinh_anh ? { objectFit: 'cover' } : {}} />
                        <div className="status-badge-icon"><CheckCircleFilled /></div>
                    </div>
                    <div className="header-text">
                        {/* Đã cập nhật lấy tên thực tế từ API */}
                        <h1 className="employee-name">{renderEditableValue('full_name')}</h1>
                        <div className="employee-tags">
                            <span className="tag-id">#{id}</span>
                            <span className="tag-status">
                                <span className="status-dot" style={{ backgroundColor: formData.status ? '#10b981' : '#ef4444' }}></span>
                                {formData.status ? 'Đang hoạt động' : 'Đã vô hiệu hoá'}
                            </span>
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
                        disabled={isUpdatingInfo}
                    >
                        {isUpdatingInfo ? (
                            <><LoadingOutlined spin /> Đang lưu...</>
                        ) : isEditing ? (
                            <><CheckCircleFilled /> Hoàn tất</>
                        ) : (
                            <><EditOutlined /> Chỉnh sửa</>
                        )}
                    </button>

                    <button className="btn-primary" onClick={handleExportHistory}>
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
                        <h3 className="card-title-small">HIỆU SUẤT TRONG THÁNG</h3>
                        <div className="chart-container">
                            {(() => {
                                const now = new Date();
                                const currentMonth = now.getMonth();
                                const currentYear = now.getFullYear();

                                const currentMonthLogs = historyLogs.filter(log => {
                                    if (!log.log_date) return false;
                                    const date = new Date(log.log_date);
                                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                                });

                                const weeks = [0, 0, 0, 0, 0];
                                currentMonthLogs.forEach(log => {
                                    const date = new Date(log.log_date as string);
                                    const day = date.getDate();
                                    const weekIndex = Math.floor((day - 1) / 7);
                                    if (weekIndex >= 0 && weekIndex < 5) {
                                        if (log.status === 'present') weeks[weekIndex] += 1;
                                        else if (log.status === 'late') weeks[weekIndex] += 0.8;
                                        else if (log.status === 'half_day') weeks[weekIndex] += 0.5;
                                    }
                                });

                                const chartData = weeks.map((w, index) => {
                                    const percent = Math.min((w / 6) * 100, 100);
                                    return {
                                        name: `T${index + 1}`,
                                        percent: percent
                                    };
                                }).filter((item, index) => {
                                    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                    return !(index === 4 && daysInMonth <= 28 && item.percent === 0);
                                });

                                return (
                                    <div style={{ width: '100%', height: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                                <Tooltip
                                                    cursor={{ fill: '#f1f5f9' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                                    formatter={(value: any) => [`${Math.round(Number(value) || 0)}%`, 'Hiệu suất']}
                                                />
                                                <Bar dataKey="percent" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={16} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={5} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                );
                            })()}
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

            <DrawerChiTietChamCong
                open={isAttendanceDrawerOpen}
                onClose={() => setIsAttendanceDrawerOpen(false)}
                record={selectedAttendance}
            />
        </div>
    );
}