import { useState, useEffect, useMemo } from 'react';
import {
    DownloadOutlined,
    SyncOutlined,
    SearchOutlined,
    FilterOutlined,
    EyeOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import './LogsPage.css';
import { attendanceService, type AttendanceRecord } from '../../services/attendance.service';

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

export default function LogsPage() {
    const [search, setSearch] = useState('');
    // Use local date (YYYY-MM-DD) as default to avoid UTC off-by-one errors
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [logs, setLogs] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);


    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await attendanceService.getDailyAttendance(selectedDate);
            if (response.success) {
                setLogs(response.data);
                console.log('API Original Data:', response.data);
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

        // 1. First Pass: Collect all unique employees (default to absent)
        logs.forEach(log => {
            if (!empMap.has(log.employee_id)) {
                empMap.set(log.employee_id, {
                    ...log,
                    log_date: null,
                    check_in_time: null,
                    check_out_time: null,
                    status: null
                });
            }
        });

        // 2. Second Pass: Override with actual log for the selectedDate if it exists
        logs.forEach(log => {
            if (isSameDay(log.log_date, selectedDate)) {
                empMap.set(log.employee_id, log);
            }
        });

        return Array.from(empMap.values());
    }, [logs, selectedDate]);

    const filteredLogs = dailyLogs.filter(log => {
        // 1. Search Filter
        const matchesSearch = log.full_name.toLowerCase().includes(search.toLowerCase()) ||
            log.username.toLowerCase().includes(search.toLowerCase());

        // 2. Status Filter
        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'absent' ? log.status === null : log.status === selectedStatus);

        return matchesSearch && matchesStatus;
    });

    console.log('Filtered attendance data (for selectedDate):', filteredLogs);

    // Calculate dynamic stats based on the normalized daily data
    const stats = {
        total: dailyLogs.length,
        present: dailyLogs.filter(l => l.status === 'present').length,
        late: dailyLogs.filter(l => l.status === 'late').length,
        absent: dailyLogs.filter(l => l.status === null).length
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
                    <button className="btn-primary">
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
                        <CalendarOutlined className="input-icon" />
                        <input
                            type="date"
                            className="log-input date-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="search-wrap">
                        <SearchOutlined className="input-icon" />
                        <input
                            type="text"
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
                                        <span className={`log-badge badge-${getStatusType(log.status)}`}>
                                            {getStatusLabel(log.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-action-view" title="Xem chi tiết">
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
        </div>
    );
}