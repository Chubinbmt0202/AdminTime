import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import type { Role } from '../../auth/auth.types';
import './LoginPage.css';

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return 'Đăng nhập thất bại. Vui lòng thử lại.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from && typeof state.from === 'string' ? state.from : '/';
  }, [location.state]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const roleHome = (role: Role) => {
    switch (role) {
      case 'giam_doc':
        return '/director';
      case 'can_bo_nhan_su':
        return '/hr';
      case 'quan_tri_vien':
        return '/admin';
      default:
        return '/';
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login({ username, password, remember });
      alert('Đăng nhập thành công');
      // ưu tiên quay lại trang đang định vào; nếu không có thì về home theo role
      const target = from && from !== '/login' ? from : roleHome(user.role);
      navigate(target, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-brand">MindCheck</div>
          <h1 className="login-hero-title">
            Kiến tạo tương lai
            <br />
            quản trị nhân sự.
          </h1>
          <p className="login-hero-subtitle">
            Hệ thống quản lý chấm công thông minh, minh bạch
            <br />
            và hiệu quả dành cho doanh nghiệp hiện đại.
          </p>

          <div className="login-feature-grid">
            <div className="login-feature-card">
              <div className="login-feature-title">Tốc độ vượt trội</div>
              <div className="login-feature-desc">Xử lý dữ liệu thời gian thực.</div>
            </div>
            <div className="login-feature-card">
              <div className="login-feature-title">Bảo mật tối đa</div>
              <div className="login-feature-desc">Mã hóa chuẩn doanh nghiệp.</div>
            </div>
          </div>

          <div className="login-footer">© 2026 MindCheck. All rights reserved.</div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <h2 className="login-title">Chào mừng trở lại</h2>
          <p className="login-subtitle">Vui lòng nhập thông tin để truy cập hệ thống của bạn.</p>

          <form className="login-form" onSubmit={onSubmit}>
            <label className="login-label">
              TÊN ĐĂNG NHẬP
              <input
                className="login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nguyen.van.a"
                autoComplete="username"
                required
              />
            </label>

            <label className="login-label">
              MẬT KHẨU
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            <div className="login-row">
              <label className="login-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Ghi nhớ đăng nhập
              </label>
              <button type="button" className="login-link" onClick={() => alert('Chưa hỗ trợ')}>
                Quên mật khẩu?
              </button>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

