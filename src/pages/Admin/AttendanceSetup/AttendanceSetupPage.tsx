import { useState } from 'react';
import { 
  WifiOutlined, 
  GlobalOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleFilled,
  AimOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import './AttendanceSetupPage.css';

interface WifiConfig {
  id: number;
  ssid: string;
  bssid: string;
  office: string;
  status: 'active' | 'disabled';
}

const mockWifiConfigs: WifiConfig[] = [
  {
    id: 1,
    ssid: 'TimeMaster_HQ_Main',
    bssid: 'E4:5F:01:22:A3:B1',
    office: 'Trụ sở chính (Quận 1)',
    status: 'active'
  },
  {
    id: 2,
    ssid: 'TimeMaster_R&D',
    bssid: 'F2:33:88:AA:CC:09',
    office: 'VP Công nghệ (Quận 7)',
    status: 'active'
  },
  {
    id: 3,
    ssid: 'Guest_Network',
    bssid: 'AA:BB:CC:11:22:33',
    office: 'Tất cả chi nhánh',
    status: 'disabled'
  }
];

export default function AttendanceSetupPage() {
  const [activeTab, setActiveTab] = useState<'wifi' | 'gps'>('wifi');
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [radius, setRadius] = useState(150);

  return (
    <div className="attendance-setup-container">
      <div className="setup-header">
        <h1 className="setup-title">Cấu hình Chấm công</h1>
        <p className="setup-description">
          Quản lý các phương thức xác thực và địa điểm làm việc cho nhân viên. Các thay đổi sẽ 
          được áp dụng ngay lập tức cho toàn bộ hệ thống.
        </p>
      </div>

      <div className="setup-tabs">
        <button 
          className={`tab-item ${activeTab === 'wifi' ? 'active' : ''}`}
          onClick={() => setActiveTab('wifi')}
        >
          Cấu hình WiFi
        </button>
        <button 
          className={`tab-item ${activeTab === 'gps' ? 'active' : ''}`}
          onClick={() => setActiveTab('gps')}
        >
          Cấu hình GPS
        </button>
      </div>

      <div className="setup-content">
        {/* WiFi Section */}
        {activeTab === 'wifi' && (
          <div className="setup-section">
          <div className="section-header">
            <div className="section-info">
              <div className="section-icon wifi">
                <WifiOutlined />
              </div>
              <div className="section-text">
                <h3>Cấu hình WiFi</h3>
                <p>Cho phép nhân viên chấm công khi kết nối đúng WiFi</p>
              </div>
            </div>
            <div className="section-actions">
              <div className="toggle-wrapper">
                <span>Bật/Tắt chấm công qua WiFi</span>
                <label className="switch">
                  <input type="checkbox" checked={wifiEnabled} onChange={() => setWifiEnabled(!wifiEnabled)} />
                  <span className="slider round"></span>
                </label>
              </div>
              <button className="btn-primary">
                <PlusOutlined /> Thêm Wifi mới
              </button>
            </div>
          </div>

          <div className="wifi-table-wrapper">
            <table className="setup-table">
              <thead>
                <tr>
                  <th>TÊN WIFI (SSID)</th>
                  <th>ĐỊA CHỈ MAC (BSSID)</th>
                  <th>VĂN PHÒNG ÁP DỤNG</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {mockWifiConfigs.map((config) => (
                  <tr key={config.id}>
                    <td>
                      <div className="wifi-name">
                        <WifiOutlined className={config.status === 'disabled' ? 'disabled' : ''} />
                        {config.ssid}
                      </div>
                    </td>
                    <td><code className="mac-address">{config.bssid}</code></td>
                    <td>
                      <span className={`office-tag ${config.office.includes('Tất cả') ? 'all' : ''}`}>
                        {config.office}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${config.status}`}>
                        <span className="dot"></span> 
                        {config.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit"><EditOutlined /></button>
                        <button className="action-btn delete"><DeleteOutlined /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* GPS Section */}
        {activeTab === 'gps' && (
          <div className="setup-section">
          <div className="section-header">
            <div className="section-info">
              <div className="section-icon gps">
                <GlobalOutlined />
              </div>
              <div className="section-text">
                <h3>Cấu hình GPS</h3>
                <p>Định vị chính xác vị trí chấm công của nhân viên trên bản đồ</p>
              </div>
            </div>
            <div className="section-actions">
              <div className="toggle-wrapper">
                <span>Bật/Tắt chấm công qua GPS</span>
                <label className="switch">
                  <input type="checkbox" checked={gpsEnabled} onChange={() => setGpsEnabled(!gpsEnabled)} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="gps-content-grid">
            <div className="location-list">
              <h4 className="list-title">DANH SÁCH ĐỊA ĐIỂM</h4>
              
              <div className="location-card active">
                <div className="card-header">
                  <h5>Văn phòng Bitexco</h5>
                  <CheckCircleFilled className="check-icon" />
                </div>
                <p className="card-address">Tòa nhà Bitexco, Hải Triều, Bến Nghé, Quận 1, TP. HCM</p>
                <div className="card-meta">
                  <span><EnvironmentOutlined /> 10.7715° N, 106.7042° E</span>
                  <span className="radius-info"><AimOutlined /> Bán kính: 150m</span>
                </div>
              </div>

              <div className="location-card">
                <div className="card-header">
                  <h5>Chi nhánh Hà Nội</h5>
                  <button className="card-more"><MoreOutlined /></button>
                </div>
                <p className="card-address">Tòa nhà Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội</p>
                <div className="card-meta">
                  <span><EnvironmentOutlined /> 21.0173° N, 105.7838° E</span>
                  <span className="radius-info"><AimOutlined /> Bán kính: 200m</span>
                </div>
              </div>

              <button className="add-location-btn">
                <PlusOutlined /> Thêm địa điểm GPS mới
              </button>
            </div>

            <div className="map-container">
              <div className="map-view-mock">
                <div className="map-label">Đang xem: Bitexco Tower</div>
                
                {/* Mock Map UI */}
                <div className="mock-map-elements">
                   <div className="map-marker-v">
                      <div className="marker-pin"></div>
                      <div className="marker-radius" style={{ width: radius * 1.5, height: radius * 1.5 }}></div>
                   </div>
                </div>

                <div className="map-controls">
                  <button className="map-ctrl-btn">+</button>
                  <button className="map-ctrl-btn">-</button>
                  <button className="map-ctrl-btn active"><AimOutlined /></button>
                </div>
              </div>

              <div className="radius-config">
                <div className="radius-header">
                  <span><AimOutlined /> Điều chỉnh bán kính hợp lệ</span>
                  <span className="radius-value">{radius}m</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  step="10" 
                  value={radius} 
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="radius-slider"
                />
                <div className="slider-labels">
                   <span>0m</span>
                   <span>100m</span>
                   <span>200m</span>
                   <span>300m</span>
                   <span>400m</span>
                   <span>500m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-footer">
            <button className="btn-ghost">Hủy bỏ</button>
            <button className="btn-primary">Lưu tọa độ</button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

function MoreOutlined() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}
