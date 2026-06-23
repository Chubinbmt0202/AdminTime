import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message, Button, Popconfirm, Tag } from 'antd';
import { officeApi } from '../../../features/offices/api/office.api';
import type { Office, WifiConfig } from '../../../features/offices/types';
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





export default function AttendanceSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'wifi' | 'gps'>((location.state as any)?.activeTab || 'wifi');
  const [wifiConfigs, setWifiConfigs] = useState<WifiConfig[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeOfficeId, setActiveOfficeId] = useState<number | null>(null);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const [officesRes, wifiRes] = await Promise.all([
        officeApi.getAll(),
        officeApi.getAllWifi()
      ]);

      if (officesRes.success) {
        setOffices(officesRes.data);
        console.log("Dữ liệu phòng", officesRes.data);
        if (officesRes.data.length > 0 && !activeOfficeId) {
          setActiveOfficeId(officesRes.data[0].id_van_phong);
        }
      }

      if (wifiRes.success) {
        const flattenedWifis: WifiConfig[] = [];
        wifiRes.data.forEach((officeItem: any) => {
          if (officeItem.wifis && Array.isArray(officeItem.wifis)) {
            officeItem.wifis.forEach((wifi: any) => {
              flattenedWifis.push({
                ...wifi,
                id_van_phong: officeItem.id_van_phong,
                locationname: officeItem.locationName,
                address: officeItem.address,
                status: 'active'
              });
            });
          }
        });
        setWifiConfigs(flattenedWifis);
        console.log("Dữ liệu wifi đã được chuyển đổi:", flattenedWifis);
      }
    } catch (error) {
      console.error("Fetch error", error);
      message.error('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWifi = async (wifiAddress: string) => {
    const hide = message.loading('Đang xóa cấu hình WiFi...', 0);
    try {
      const response = await officeApi.deleteWifi(wifiAddress);
      hide();
      if (response.success) {
        message.success('Đã xóa WiFi thành công');
        fetchOffices();
      } else {
        message.error(response.message || 'Không thể xóa WiFi');
      }
    } catch (error: any) {
      hide();
      message.error(error.message || 'Lỗi hệ thống');
    }
  };

  return (
    <div className="attendance-setup-container">
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
                <button
                  className="btn-primary"
                  onClick={() => navigate('/admin/attendance-setup/add-wifi')}
                >
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
                    <th>ĐỊA CHỈ</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {wifiConfigs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                        Chưa có cấu hình WiFi nào
                      </td>
                    </tr>
                  ) : (
                    wifiConfigs.map((config, index) => (
                      <tr key={index}>
                        <td>
                          <div className="wifi-name">
                            <WifiOutlined className={config.status === 'inactive' ? 'disabled' : ''} />
                            {config.wifiName}
                          </div>
                        </td>
                        <td><code className="mac-address">{config.wifiAddress}</code></td>
                        <td>
                          <Tag color="blue">{config.locationname || `Văn phòng #${config.id_van_phong}`}</Tag>
                        </td>
                        <td>
                          <span className="card-address" style={{ fontSize: '13px' }}>{config.address || '---'}</span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="action-btn edit"
                              onClick={() => navigate(`/admin/attendance-setup/edit-wifi/${config.id_wifi}`, { state: { wifi: config } })}
                            >
                              <EditOutlined />
                            </button>
                            <Popconfirm
                              title="Xóa cấu hình WiFi"
                              description="Bạn có chắc chắn muốn xóa WiFi này không?"
                              onConfirm={() => handleDeleteWifi(config.wifiAddress)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <button className="action-btn delete"><DeleteOutlined /></button>
                            </Popconfirm>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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

                {loading ? (
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
                      <div className="card-meta">
                        <span><EnvironmentOutlined /> {office.latitude}° N, {office.longitude}° E</span>
                        <span className="radius-info"><AimOutlined /> Bán kính: {office.radius}m</span>
                      </div>

                      {activeOfficeId === office.id_van_phong && (
                        <div className="card-actions-wrapper">
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/attendance-setup/edit-gps/${office.id_van_phong}`, { state: { office } });
                            }}
                          >
                            Cập nhật
                          </Button>
                          <Popconfirm
                            title="Xóa địa điểm GPS"
                            description="Bạn có chắc chắn muốn xóa địa điểm này không?"
                            onConfirm={async (e) => {
                              e?.stopPropagation();
                              const hide = message.loading('Đang xóa địa điểm...', 0);
                              try {
                                const response = await officeApi.deleteGPS(office.id_van_phong);
                                hide();
                                if (response.success) {
                                  message.success(response.message || 'Đã xóa địa điểm thành công');
                                  fetchOffices();
                                } else {
                                  message.error(response.message || 'Không thể xóa địa điểm này');
                                }
                              } catch (error: any) {
                                hide();
                                message.error(error.message || 'Lỗi hệ thống');
                              }
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
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
