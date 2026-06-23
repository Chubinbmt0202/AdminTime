import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const routeLabels: Record<string, string> = {
  '': 'Trang chủ',
  'director': 'Giám đốc',
  'reports': 'Báo cáo & phân tích',
  'hr': 'Nhân sự',
  'admin': 'Quản trị',
  'org-hr': 'Tổ chức và nhân sự',
  'attendance-setup': 'Thiết lập chấm công',
  // 'security': 'Giám sát an ninh',
  'system-settings': 'Cài đặt hệ thống',
  'shifts': 'Ca làm việc',
  'employees': 'Nhân viên',
  'logs': 'Nhật ký',
  'leave-requests': 'Quản lý đơn từ',
  'settings': 'Cài đặt',
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      <Link to="/" className="breadcrumb-item text-gray">
        {routeLabels['']}
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        // Handle numeric IDs or specific dynamic segments
        let label = routeLabels[value];
        if (!label) {
          if (!isNaN(Number(value))) {
            label = 'Chi tiết';
          } else {
            label = value.charAt(0).toUpperCase() + value.slice(1);
          }
        }

        return (
          <React.Fragment key={to}>
            <span className="breadcrumb-separator">›</span>
            {last ? (
              <span className="breadcrumb-item text-dark">{label}</span>
            ) : (
              <Link to={to} className="breadcrumb-item text-gray">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
