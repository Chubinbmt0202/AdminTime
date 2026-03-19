import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import EmployeesPage from '../pages/Employees/EmployeesPage';
import DetailEmployeesPage from '../features/employees/components/DetailEmployee/DetailEmployeesPage';
import LogsPage from '../pages/LogsPage/LogsPage';
import WorkShiftConfigPage from '../features/settings/components/WorkShiftConfig/WorkShiftConfigPage';
import ApplicationPage from '../pages/Application/ApplicationPage';
import LoginPage from '../pages/Login/LoginPage';
import RequireAuth from '../auth/RequireAuth';


function PlaceholderPage({ title }: { title: string }) {
    return (
        <div style={{ padding: '32px' }}>
            <h1 style={{ color: '#1e293b', fontFamily: 'inherit' }}>{title}</h1>
        </div>
    );
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage  /> }  />

            <Route element={<RequireAuth />}>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<PlaceholderPage title="Dashboard" />} />
                    <Route path="director" element={<PlaceholderPage title="Trang chủ Giám đốc" />} />
                    <Route path="director/reports" element={<PlaceholderPage title="Báo cáo & phân tích (Giám đốc)" />} />
                    <Route path="hr" element={<PlaceholderPage title="Trang chủ Nhân sự" />} />
                    <Route path="admin" element={<PlaceholderPage title="Trang chủ Quản trị" />} />
                    <Route path="admin/org-hr" element={<PlaceholderPage title="Tổ chức và nhân sự (Quản trị)" />} />
                    <Route path="admin/attendance-setup" element={<PlaceholderPage title="Thiết lập chấm công (Quản trị)" />} />
                    <Route path="admin/security" element={<PlaceholderPage title="Giám sát an ninh (Quản trị)" />} />
                    <Route path="admin/system-settings" element={<PlaceholderPage title="Cài đặt hệ thống (Quản trị)" />} />
                    <Route path="employees" element={<EmployeesPage />} />
                    <Route path="employees/:id" element={<DetailEmployeesPage />} />
                    <Route path="logs" element={<LogsPage />} />
                    <Route path="leave-requests" element={<ApplicationPage />} />
                    <Route path="reports" element={<PlaceholderPage title="Reports" />} />
                    <Route path="settings" element={<WorkShiftConfigPage />} />

                </Route>
            </Route>
        </Routes>
    );
}