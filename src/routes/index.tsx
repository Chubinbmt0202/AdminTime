import { Routes, Route } from 'react-router-dom';
import BoCucChinh from '../layouts/BoCucChinh';
import TrangTongQuanPage from '../pages/Dashboard/TrangTongQuan';
import QuanLyNhanVienPage from '../pages/Employees/QuanLyNhanVien';
import ChiTietNhanVienPage from '../features/employees/components/DetailEmployee/ChiTietNhanVienPage';
import LichSuChamCongPage from '../pages/LogsPage/LichSuChamCong';
import CauHinhCaLamPage from '../features/settings/components/WorkShiftConfig/CauHinhCaLam';
import QuanLyDonTuPage from '../pages/Application/QuanLyDonTu';
import YeuCauTangCaPage from '../pages/Overtime/YeuCauTangCa';
import GiaiTrinhDiMuonPage from '../pages/LateExplanation/GiaiTrinhDiMuon';
import CauHinhLoaiNghiPage from '../features/settings/components/LeaveTypeConfig/CauHinhLoaiNghi';
import TrangDangNhapPage from '../pages/Login/TrangDangNhap';
import YeuCauDangNhap from '../auth/BatBuocDangNhap';
import { useXacThuc } from '../auth/ContextXacThuc';
import CoCauToChucPage from '../pages/Admin/OrgAndHR/CoCauToChuc';
import ThietLapChamCongPage from '../pages/Admin/AttendanceSetup/ThietLapChamCong';
import ThemViTriGPSPage from '../pages/Admin/AttendanceSetup/ThemViTriGPS';
import ThemWifiPage from '../pages/Admin/AttendanceSetup/ThemWifi';
import QuanLyPhongBanPage from '../pages/Admin/QuanLyPhongBan';
import QuanLyPhanQuyenPage from '../pages/Admin/QuanLyPhanQuyen';


function PlaceholderPage({ title }: { title: string }) {
    return (
        <div style={{ padding: '32px' }}>
            <h1 style={{ color: '#1e293b', fontFamily: 'inherit' }}>{title}</h1>
        </div>
    );
}

export default function AppRoutes() {
    const { role } = useXacThuc();

    return (
        <Routes>
            <Route path="/login" element={<TrangDangNhapPage />} />

            <Route element={<YeuCauDangNhap />}>
                <Route path="/" element={<BoCucChinh />}>
                    <Route index element={(role === 'HR' || role === 'Admin') ? <TrangTongQuanPage /> : <PlaceholderPage title="Dashboard" />} />
                    <Route path="director" element={role === 'Director' ? <PlaceholderPage title="Trang chủ Giám đốc" /> : <PlaceholderPage title="Unauthorized" />} />
                    <Route path="hr" element={role === 'HR' ? <TrangTongQuanPage /> : <PlaceholderPage title="Trang chủ Nhân sự" />} />
                    <Route path="admin" element={role === 'Admin' ? <TrangTongQuanPage /> : <PlaceholderPage title="Unauthorized" />} />
                    <Route path="admin/org-hr" element={<CoCauToChucPage />} />

                    <Route path="admin/attendance-setup" element={<ThietLapChamCongPage />} />
                    <Route path="admin/attendance-setup/add-gps" element={<ThemViTriGPSPage />} />
                    <Route path="admin/attendance-setup/edit-gps/:id" element={<ThemViTriGPSPage />} />
                    <Route path="admin/attendance-setup/add-wifi" element={<ThemWifiPage />} />
                    <Route path="admin/attendance-setup/edit-wifi/:id" element={<ThemWifiPage />} />
                    <Route path="leave-types" element={<CauHinhLoaiNghiPage />} />
                    {/* <Route path="admin/security" element={<PlaceholderPage title="Giám sát an ninh (Quản trị)" />} /> */}
                    <Route path="admin/system-settings" element={<PlaceholderPage title="Cài đặt hệ thống (Quản trị)" />} />
                    <Route path="employees" element={<QuanLyNhanVienPage />} />
                    <Route path="employees/:id" element={<ChiTietNhanVienPage />} />
                    <Route path="logs" element={<LichSuChamCongPage />} />
                    <Route path="leave-requests" element={<QuanLyDonTuPage />} />
                    <Route path="overtime-requests" element={<YeuCauTangCaPage />} />
                    <Route path="late-explanations" element={<GiaiTrinhDiMuonPage />} />
                    <Route path="reports" element={<PlaceholderPage title="Reports" />} />
                    <Route path="admin/shifts" element={<CauHinhCaLamPage />} />
                    <Route path="admin/roles" element={<QuanLyPhanQuyenPage />} />

                </Route>
            </Route>
        </Routes>
    );
}