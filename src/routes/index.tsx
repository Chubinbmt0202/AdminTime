import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import EmployeesPage from '../pages/Employees/EmployeesPage';
import DetailEmployeesPage from '../features/employees/components/DetailEmployee/DetailEmployeesPage';
import LogsPage from '../pages/LogsPage/LogsPage';
import WorkShiftConfigPage from '../features/settings/components/WorkShiftConfig/WorkShiftConfigPage';


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
            <Route path="/" element={<MainLayout />}>
                <Route index element={<PlaceholderPage title="Dashboard" />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="employees/:id" element={<DetailEmployeesPage />} />
                <Route path="logs" element={<LogsPage />} />
                <Route path="leave-requests" element={<PlaceholderPage title="Leave Requests" />} />
                <Route path="reports" element={<PlaceholderPage title="Reports" />} />
                <Route path="settings" element={<WorkShiftConfigPage />} />

            </Route>
        </Routes>
    );
}