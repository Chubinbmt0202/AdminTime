import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { officeApi } from '../../../features/offices/api/office.api';
import type { Office } from '../../../features/offices/types';
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
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './AttendanceSetupPage.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapUpdater = ({ center }: { center: { lat: number, lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    if (center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'wifi' | 'gps'>('wifi');
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [radius] = useState(150);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [activeOfficeId, setActiveOfficeId] = useState<number | null>(null);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setLoadingOffices(true);
    try {
      const response = await officeApi.getAll();
      console.log("Dữ liệu chi nhánh", response.data);
      if (response.success) {
        setOffices(response.data);
        if (response.data.length > 0) {
          setActiveOfficeId(response.data[0].id_van_phong);
        }
      } else {
        message.error(response.message || 'Không thể tải danh sách chi nhánh');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ');
    } finally {
      setLoadingOffices(false);
    }
  };

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
                <button className="add-location-btn" onClick={() => navigate('/admin/attendance-setup/add-gps')}>
                  <PlusOutlined /> Thêm địa điểm GPS mới
                </button>
              </div>
            </div>

            <div className="gps-content-grid">
              <div className="location-list">
                <h4 className="list-title">DANH SÁCH ĐỊA ĐIỂM</h4>

                {loadingOffices ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
                ) : offices.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>Chưa có địa điểm nào</div>
                ) : (
                  offices.map((office) => (
                    <div 
                      key={office.id_van_phong} 
                      className={`location-card ${activeOfficeId === office.id_van_phong ? 'active' : ''}`}
                      onClick={() => setActiveOfficeId(office.id_van_phong)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-header">
                        <h5>{office.locationname}</h5>
                        {activeOfficeId === office.id_van_phong ? (
                          <CheckCircleFilled className="check-icon" />
                        ) : (
                          <button className="card-more" onClick={(e) => e.stopPropagation()}><MoreOutlined /></button>
                        )}
                      </div>
                      <p className="card-address">{office.address}</p>
                      {office.id_gps ? (
                        <div className="card-meta">
                          <span><EnvironmentOutlined /> {office.latitude}° N, {office.longitude}° E</span>
                          <span className="radius-info"><AimOutlined /> Bán kính: {office.radius}m</span>
                        </div>
                      ) : (
                        <div className="card-meta" style={{ color: '#f59e0b' }}>
                          <span>Chưa cấu hình GPS</span>
                        </div>
                      )}
                    </div>
                  ))
                )}


              </div>

              <div className="map-container">
                {(() => {
                  const activeOffice = offices.find(o => o.id_van_phong === activeOfficeId);
                  const lat = activeOffice?.latitude ? parseFloat(activeOffice.latitude) : null;
                  const lng = activeOffice?.longitude ? parseFloat(activeOffice.longitude) : null;
                  
                  if (activeOffice && lat && lng) {
                    return (
                      <div className="gps-map-full-container" style={{ position: 'relative', height: '100%', minHeight: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <div className="map-label" style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          Đang xem: {activeOffice.locationname}
                        </div>
                        <MapContainer 
                          center={[lat, lng]} 
                          zoom={16} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <MapUpdater center={{ lat, lng }} />
                          <Marker position={[lat, lng]} />
                          <Circle 
                            center={[lat, lng]} 
                            radius={activeOffice.radius || 100} 
                            pathOptions={{
                              fillColor: '#3b82f6',
                              fillOpacity: 0.2,
                              color: '#3b82f6',
                              weight: 2,
                              opacity: 0.8
                            }} 
                          />
                        </MapContainer>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="map-view-mock" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', background: '#f3f4f6', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ color: '#6b7280', fontWeight: 500 }}>Chưa có tọa độ GPS cho văn phòng này</p>
                    </div>
                  );
                })()}
              </div>
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
