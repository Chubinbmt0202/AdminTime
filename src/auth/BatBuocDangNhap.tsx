import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useXacThuc } from './ContextXacThuc';

export default function YeuCauDangNhap() {
  const { isAuthenticated } = useXacThuc();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

