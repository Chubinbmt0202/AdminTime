import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { officeApi } from '../../../features/offices/api/office.api';
import { Form, Input, Slider, Button, Row, Col, AutoComplete, message } from 'antd';
import {
  CheckCircleOutlined,
  AimOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './AddGPSLocationPage.css';

// Fix for default marker icons in React Leaflet with Vite
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

// Component to dynamically update map center
const MapUpdater = ({ center }: { center: { lat: number, lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

// Component to handle map clicks for dropping a marker
const LocationMarker = ({ 
  position, 
  setPosition, 
  form, 
  setAddressDisplay,
  setSearchValue
}: { 
  position: {lat: number, lng: number}, 
  setPosition: any, 
  form: any, 
  setAddressDisplay: any,
  setSearchValue: any
}) => {
  useMapEvents({
    async click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      form.setFieldsValue({
        latitude: newPos.lat.toFixed(6),
        longitude: newPos.lng.toFixed(6)
      });
      setAddressDisplay('Đang tải địa chỉ...');
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          const address = data.display_name;
          setAddressDisplay(address);
          setSearchValue(address);
          form.setFieldsValue({ address: address });
        } else {
          setAddressDisplay('Vị trí đã chọn trên bản đồ');
        }
      } catch (err) {
        setAddressDisplay('Vị trí đã chọn trên bản đồ');
      }
    },
  });

  return <Marker position={[position.lat, position.lng]} />;
};

const AddGPSLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const officeToEdit = location.state?.office;
  
  const [form] = Form.useForm();
  const [radius, setRadius] = useState<number>(150);
  const [saving, setSaving] = useState(false);

  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lng: 105.7831 });
  const [markerPosition, setMarkerPosition] = useState({ lat: 21.0285, lng: 105.7831 });
  const [addressDisplay, setAddressDisplay] = useState('Chưa xác định');

  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<{ value: string; lat: number; lng: number }[]>([]);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id && officeToEdit) {
      const lat = parseFloat(officeToEdit.latitude);
      const lng = parseFloat(officeToEdit.longitude);
      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      setRadius(parseInt(officeToEdit.radius) || 150);
      setAddressDisplay(officeToEdit.address);
      setSearchValue(officeToEdit.address);
      
      form.setFieldsValue({
        locationName: officeToEdit.locationname,
        address: officeToEdit.address,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          form.setFieldsValue({
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6)
          });
          setAddressDisplay('Vị trí hiện tại của bạn');
          message.success('Đã định vị vị trí hiện tại của bạn');
        },
        (error) => {
          console.error("Error getting current location", error);
          if (error.code === error.PERMISSION_DENIED) {
            message.error('Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép trên trình duyệt.');
          } else {
            message.warning('Không thể lấy vị trí chính xác hiện tại, vui lòng chọn trên bản đồ.');
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      message.error('Trình duyệt của bạn không hỗ trợ chức năng định vị vị trí.');
    }
  }, [form, id, officeToEdit]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    form.setFieldsValue({ address: val });

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (val.length > 2) {
      debounceTimeout.current = setTimeout(async () => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}`);
          const data = await response.json();
          setSuggestions(data.map((item: any) => ({
            value: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          })));
        } catch (error) {
          console.error("Geocoding error: ", error);
        }
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectAddress = (val: string, option: any) => {
    setSearchValue(val);
    form.setFieldsValue({ address: val });
    
    if (option && option.lat && option.lng) {
      const lat = option.lat;
      const lng = option.lng;
      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      form.setFieldsValue({
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      });
      setAddressDisplay(val);
    }
  };

  const handleClose = () => {
    navigate('/admin/attendance-setup');
  };

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      setSaving(true);
      try {
        const payload = {
          locationName: values.locationName,
          address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
          radius: radius
        };
        let response;
        if (id) {
          response = await officeApi.updateGPS(id, payload);
          if (response.success) {
            message.success(response.message || 'Cập nhật vị trí GPS thành công');
            navigate('/admin/attendance-setup');
          } else {
            message.error(response.message || 'Lỗi khi cập nhật vị trí');
          }
        } else {
          response = await officeApi.addGPS(payload);
          if (response.success) {
            message.success(response.message || 'Thêm vị trí GPS thành công');
            navigate('/admin/attendance-setup');
          } else {
            message.error(response.message || 'Lỗi khi thêm vị trí');
          }
        }
      } catch (error: any) {
        message.error(error.message || 'Lỗi hệ thống');
      } finally {
        setSaving(false);
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <div className="add-gps-page-container">
      <div className="add-gps-page-header">
        <h2>{id ? 'Cập nhật địa điểm GPS' : 'Thêm địa điểm GPS mới'}</h2>
        <p>Xác định ranh giới ảo để tự động hóa quy trình chấm công dựa trên vị trí thực tế của nhân viên.</p>
      </div>

      <div className="add-gps-main-content">
        <div className="add-gps-left-column">
          <div className="gps-card">
            <div className="gps-card-header">
              <CheckCircleOutlined className="gps-card-icon" />
              <span className="gps-card-title">Thông tin cơ bản</span>
            </div>

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              className="add-gps-form"
              initialValues={{
                locationName: '',
                address: '',
                longitude: '105.7831',
                latitude: '21.0285'
              }}
            >
              <Form.Item
                name="locationName"
                label={<span className="gps-form-label">TÊN ĐỊA ĐIỂM</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên địa điểm' }]}
              >
                <Input
                  placeholder="Ví dụ: Trụ sở chính - Toà nhà Alpha"
                  className="gps-custom-input"
                />
              </Form.Item>

              <Form.Item
                name="address"
                label={<span className="gps-form-label">ĐỊA CHỈ / TÌM KIẾM</span>}
              >
                <AutoComplete
                  value={searchValue}
                  options={suggestions}
                  onChange={handleSearchChange}
                  onSelect={handleSelectAddress}
                  style={{ width: '100%' }}
                >
                  <Input
                    suffix={<AimOutlined style={{ color: '#9ca3af', fontSize: '18px' }} />}
                    placeholder="Nhập địa chỉ để định vị..."
                    className="gps-custom-input"
                  />
                </AutoComplete>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="longitude"
                    label={<span className="gps-form-label">KINH ĐỘ (LONGITUDE)</span>}
                  >
                    <Input className="gps-custom-input" readOnly />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="latitude"
                    label={<span className="gps-form-label">VĨ ĐỘ (LATITUDE)</span>}
                  >
                    <Input className="gps-custom-input" readOnly />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>

          <div className="gps-card">
            <div className="gps-card-header-flex">
              <div className="gps-card-header-left">
                <div className="gps-card-header-top">
                  <AimOutlined className="gps-card-icon" />
                  <span className="gps-card-title">Bán kính Geofence</span>
                </div>
                <p className="gps-card-subtitle">Phạm vi cho phép chấm công xung quanh điểm</p>
              </div>
              <div className="gps-radius-value-display">
                <span className="gps-radius-num">{radius}</span>
                <span className="gps-radius-unit-text">m</span>
              </div>
            </div>

            <Slider
              min={50}
              max={500}
              value={radius}
              onChange={setRadius}
              tooltip={{ formatter: null }}
              className="gps-slider-styled"
            />

            <div className="gps-slider-labels">
              <span>50M</span>
              <span>150M</span>
              <span>300M</span>
              <span>500M</span>
            </div>

            <div className="gps-info-alert">
              <InfoCircleOutlined className="gps-info-icon" />
              <span>Nhân viên cần ở trong phạm vi này để được hệ thống ghi nhận sự hiện diện hợp lệ.</span>
            </div>
          </div>
        </div>

        <div className="add-gps-right-column">
          <div className="gps-map-full-container" style={{ position: 'relative', height: '100%', minHeight: '400px', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer 
              center={[mapCenter.lat, mapCenter.lng]} 
              zoom={16} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={mapCenter} />
              <LocationMarker 
                position={markerPosition} 
                setPosition={setMarkerPosition} 
                form={form} 
                setAddressDisplay={setAddressDisplay} 
                setSearchValue={setSearchValue}
              />
              <Circle 
                center={[markerPosition.lat, markerPosition.lng]} 
                radius={radius} 
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  color: '#3b82f6',
                  weight: 2,
                  opacity: 0.8
                }} 
              />
            </MapContainer>

            <div className="gps-location-badge" style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000 }}>
              <div className="gps-badge-indicator"></div>
              <div className="gps-badge-text">
                <div className="gps-badge-label">TỌA ĐỘ HIỆN TẠI</div>
                <div className="gps-badge-value" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {addressDisplay}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="add-gps-page-footer">
        <Button onClick={handleClose} className="gps-btn-cancel-new">
          Hủy bỏ
        </Button>
        <Button type="primary" onClick={handleSave} className="gps-btn-save-new" loading={saving}>
          {id ? 'Lưu cập nhật' : 'Lưu địa điểm'}
        </Button>
      </div>
    </div>
  );
};

export default AddGPSLocationPage;
