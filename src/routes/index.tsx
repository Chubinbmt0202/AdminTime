import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import EmployeesPage from '../pages/Employees/EmployeesPage';
import DetailEmployeesPage from '../features/employees/components/DetailEmployee/DetailEmployeesPage';
import LogsPage from '../pages/LogsPage/LogsPage';
import WorkShiftConfigPage from '../features/settings/components/WorkShiftConfig/WorkShiftConfigPage';
import ApplicationPage from '../pages/Application/ApplicationPage';
import LoginPage from '../pages/Login/LoginPage';
import RequireAuth from '../auth/RequireAuth';
import { useAuth } from '../auth/AuthContext';
import OrgAndHRPage from '../pages/Admin/OrgAndHR/OrgAndHRPage';


function PlaceholderPage({ title }: { title: string }) {
    return (
        <div style={{ padding: '32px' }}>
            <h1 style={{ color: '#1e293b', fontFamily: 'inherit' }}>{title}</h1>
        </div>
    );
}

export default function AppRoutes() {
    const { role } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<RequireAuth />}>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={role === 'can_bo_nhan_su' ? <DashboardPage /> : <PlaceholderPage title="Dashboard" />} />
                    <Route path="director" element={role === 'giam_doc' ? <PlaceholderPage title="Trang chủ Giám đốc" /> : <PlaceholderPage title="Unauthorized" />} />
                    <Route path="hr" element={role === 'can_bo_nhan_su' ? <DashboardPage /> : <PlaceholderPage title="Trang chủ Nhân sự" />} />
                    <Route path="admin" element={role === 'quan_tri_vien' ? <PlaceholderPage title="Trang chủ Quản trị" /> : <PlaceholderPage title="Unauthorized" />} />
                    <Route path="admin/org-hr" element={<OrgAndHRPage />} />
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