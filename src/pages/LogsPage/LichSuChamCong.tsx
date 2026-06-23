import { useState, useEffect, useMemo } from 'react';
import {
    DownloadOutlined,
    SyncOutlined,
    SearchOutlined,
    FilterOutlined,
    EyeOutlined
} from '@ant-design/icons';
import './LichSuChamCong.css';
import { attendanceService, type AttendanceRecord } from '../../services/dichVuChamCong';
import DrawerChiTietChamCong from '../../features/employees/components/DetailEmployee/DrawerChiTietChamCong';
import { xuatRaExcel } from '../../utils/tienIchXuatFile';

const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const getStatusLabel = (status: string | null) => {
    switch (status) {
        case 'present': return 'Đúng giờ';
        case 'late': return 'Đi muộn';
        case 'half_day': return 'Nửa ngày';
        case null: return 'Chưa chấm công';
        default: return status;
    }
};

const getStatusType = (status: string | null) => {
    switch (status) {
        case 'present': return 'success';
        case 'late': return 'warning';
        case 'half_day': return 'info';
        case null: return 'danger';
        default: return 'success';
    }
};

const getOtBadge = (log: AttendanceRecord) => {
    if (!log.has_ot) return <span className="text-muted">--</span>;
    
    const start = log.ot_start_time ? log.ot_start_time.substring(0, 5) : '';
    const end = log.ot_expected_end_time ? log.ot_expected_end_time.substring(0, 5) : '';
    const rangeStr = `${start} - ${end}`;
    
    switch (log.ot_status) {
        case 'DA_DUYET':
            return (
                <div className="ot-info-badge approved">
                    <span className="ot-range">{rangeStr}</span>
                    <span className="ot-status-label text-green">Đã duyệt</span>
                </div>
            );
        case 'CHO_DUYET':
            return (
                <div className="ot-info-badge pending">
                    <span className="ot-range">{rangeStr}</span>
                    <span className="ot-status-label text-orange">Chờ duyệt</span>
                </div>
            );
        case 'TU_CHOI':
            return (
                <div className="ot-info-badge rejected">
                    <span className="ot-range">{rangeStr}</span>
                    <span className="ot-status-label text-red">Từ chối</span>
                </div>
            );
        default:
            return <span className="text-muted">--</span>;
    }
};


export default function LichSuChamCongPage() {
    const [search, setSearch] = useState('');
    // Use local date (YYYY-MM-DD) as default to avoid UTC off-by-one errors
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [logs, setLogs] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Trạng thái cho Drawer chi tiết chấm công
    const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
    const [isAttendanceDrawerOpen, setIsAttendanceDrawerOpen] = useState(false);

    const handleViewAttendanceDetail = (record: AttendanceRecord) => {
        setSelectedAttendance(record);
        setIsAttendanceDrawerOpen(true);
    };


    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await attendanceService.layChamCongHangNgay(selectedDate);
            if (response.success) {
                setLogs(response.data);
                // console.log('API Original Data:', response.data);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [selectedDate]);

    // Helper to check if ISO date matches YYYY-MM-DD in local time
    const isSameDay = (isoString: string | null, targetDate: string) => {
        if (!isoString) return false;
        const date = new Date(isoString);
        return date.toLocaleDateString('en-CA') === targetDate;
    };

    // Normalize data: Ensure one entry per employee for the selected day
    const dailyLogs = useMemo(() => {
        const empMap = new Map<number, AttendanceRecord>();

        // 1. First Pass: Build a list of all unique employees seen in the API response.
        // We initialize them all as "Chưa chấm công" (absent) for the current selected context.
        logs.forEach(log => {
            if (!empMap.has(log.employee_id)) {
                empMap.set(log.employee_id, {
                    employee_id: log.employee_id,
                    full_name: log.full_name,
                    username: log.username,
                    log_date: selectedDate,
                    check_in_time: null,
                    check_out_time: null,
                    status: null
                });
            }
        });

        // 2. Second Pass: If an employee has a log entry that matches the selected date,
        // we use that full record (showing their check-in/out times and status).
        logs.forEach(log => {
            if (isSameDay(log.log_date, selectedDate)) {
                empMap.set(log.employee_id, log);
            }
        });

        return Array.from(empMap.values());
    }, [logs, selectedDate]);

    const filteredLogs = dailyLogs.filter(log => {
        // 1. Search Filter
        const matchesSearch = (log.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (log.username ?? '').toLowerCase().includes(search.toLowerCase());

        // 2. Status Filter
        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'absent' ? log.status === null : log.status === selectedStatus);

        return matchesSearch && matchesStatus;
    });

    // console.log(`Displayed logs for ${selectedDate}:`, filteredLogs);

    const stats = {
        total: dailyLogs.length,
        present: dailyLogs.filter(l => l.status === 'present').length,
        late: dailyLogs.filter(l => l.status === 'late').length,
        absent: dailyLogs.filter(l => l.status === null).length
    };

    const handleExport = () => {
        if (!filteredLogs || filteredLogs.length === 0) {
            console.warn('Không có dữ liệu để xuất');
            return;
        }

        const data = filteredLogs.map(log => ({
            'Mã NV': log.employee_id,
            'Họ và tên': log.full_name,
            'Tên đăng nhập': log.username,
            'Ngày': log.log_date,
            'Giờ vào': formatTime(log.check_in_time),
            'Giờ ra': formatTime(log.check_out_time),
            'Trạng thái': getStatusLabel(log.status),
            'Tăng ca': log.has_ot ? 'Có' : 'Không',
            'Trạng thái tăng ca': log.has_ot ? (log.ot_status === 'DA_DUYET' ? 'Đã duyệt' : log.ot_status === 'CHO_DUYET' ? 'Chờ duyệt' : log.ot_status === 'TU_CHOI' ? 'Từ chối' : 'Không rõ') : 'Không'
        }));

        xuatRaExcel(data, `Cham_Cong_${selectedDate}`);
    };

    return (
        <div className="logs-page">
            {/* 1. HEADER */}
            <div className="logs-header">
                <div className="logs-header-left">
                    <h1 className="logs-title">Quản lý chấm công</h1>
                    <p className="logs-subtitle">Theo dõi và quản lý dữ liệu chấm công hàng ngày của toàn bộ nhân viên.</p>
                </div>
                <div className="logs-header-actions">
                    <button className="btn-secondary" onClick={fetchLogs}>
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
                    <span className="log-card-title">TỔNG NHÂN SỰ</span>
                    <span className="log-card-value text-blue">{stats.total}</span>
                    <span className="log-card-desc">Đã chấm công: {stats.total - stats.absent}</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">ĐÚNG GIỜ</span>
                    <span className="log-card-value text-green">{stats.present}</span>
                    <span className="log-card-desc">Tỷ lệ: {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">ĐI MUỘN</span>
                    <span className="log-card-value text-orange">{stats.late}</span>
                    <span className="log-card-desc">Tỷ lệ: {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%</span>
                </div>
                <div className="log-card">
                    <span className="log-card-title">Chưa chấm công</span>
                    <span className="log-card-value text-red">{stats.absent}</span>
                    <span className="log-card-desc">Tỷ lệ: {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%</span>
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
                        <option value="present">Đúng giờ</option>
                        <option value="late">Đi muộn</option>
                        <option value="absent">Chưa chấm công</option>
                    </select>

                    <button className="btn-icon-filter">
                        <FilterOutlined />
                    </button>
                </div>
            </div>

            {/* 4. TABLE */}
            <div className="logs-table-wrap">
                {loading ? (
                    <div className="loading-state">Đang tải dữ liệu...</div>
                ) : (
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>NHÂN VIÊN</th>
                                <th>USERNAME</th>
                                <th>GIỜ VÀO</th>
                                <th>GIỜ RA</th>
                                <th>TĂNG CA</th>
                                <th>TRẠNG THÁI</th>
                                <th>CHI TIẾT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="log-emp-info">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(log.full_name)}&background=random`} alt={log.full_name} className="log-avatar" />
                                            <div>
                                                <div className="log-emp-name">{log.full_name}</div>
                                                <div className="log-emp-id">#{log.employee_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{log.username}</td>
                                    <td className="fw-600">{formatTime(log.check_in_time)}</td>
                                    <td className="fw-600">{formatTime(log.check_out_time)}</td>
                                    <td>
                                        {getOtBadge(log)}
                                    </td>
                                    <td>
                                        <span className={`log-badge badge-${getStatusType(log.status)}`}>
                                            {getStatusLabel(log.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-action-view" title="Xem chi tiết" onClick={() => handleViewAttendanceDetail(log)}>
                                            <EyeOutlined /> Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 5. PAGINATION */}
            <div className="logs-pagination">
                <span className="pag-text">Hiển thị {filteredLogs.length} trong số {dailyLogs.length} nhân viên</span>
                <div className="pag-controls">
                    <button className="pag-btn disabled">Trước</button>
                    <button className="pag-btn active">1</button>
                    <button className="pag-btn">Sau</button>
                </div>
            </div>

            <DrawerChiTietChamCong
                open={isAttendanceDrawerOpen}
                onClose={() => setIsAttendanceDrawerOpen(false)}
                record={selectedAttendance}
            />
        </div>
    );
}