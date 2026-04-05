import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Button, message } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  SafetyCertificateOutlined,
  WifiOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { officeApi } from '../../../features/offices/api/office.api';
import type { Office } from '../../../features/offices/types';
import './AddWifiPage.css';

const AddWifiPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const wifiToEdit = (location.state as any)?.wifi;

  const [form] = Form.useForm();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffices();
    if (id && wifiToEdit) {
      form.setFieldsValue({
        ssid: wifiToEdit.wifiName,
        bssid: wifiToEdit.wifiAddress,
        branch: wifiToEdit.id_van_phong,
        status: wifiToEdit.status === 'active'
      });
    }
  }, [id, wifiToEdit]);

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const response = await officeApi.getAll();
      if (response.success) {
        setOffices(response.data);
      } else {
        message.error(response.message || 'Không thể tải danh sách chi nhánh');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        id_van_phong: values.branch,
        wifiName: values.ssid,
        wifiAddress: values.bssid
      };

      let response;
      if (id) {
        response = await officeApi.updateWifi(id, payload);
      } else {
        response = await officeApi.addWifi(payload);
      }

      if (response.success) {
        message.success(response.message || (id ? 'Cập nhật WiFi thành công' : 'Thêm cấu hình WiFi thành công'));
        navigate('/admin/attendance-setup', { state: { activeTab: 'wifi' } });
      } else {
        message.error(response.message || 'Lỗi khi lưu WiFi');
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      message.error(error.message || 'Lỗi hệ thống khi lưu WiFi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/attendance-setup');
  };

  return (
    <div className="add-wifi-container">
      <div className="add-wifi-page-header">
        <h1>{id ? 'Cập nhật mạng WiFi' : 'Thêm mạng WiFi mới'}</h1>
        <p>
          {id
            ? 'Cập nhật cấu hình điểm truy cập cho địa điểm văn phòng này.'
            : 'Cấu hình điểm truy cập mới cho hệ thống chấm công của văn phòng.'}
          Đảm bảo địa chỉ MAC chính xác để xác thực vị trí.
        </p>
      </div>

      <div className="add-wifi-content">
        {/* Left Form Area */}
        <div className="add-wifi-form-section">
          <div className="wifi-form-card">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ status: true, branch: 'Headquarters - District 1' }}
            >
              <div className="wifi-form-row">
                <Form.Item
                  name="ssid"
                  label={<span className="wifi-form-label">Tên WiFi (SSID)</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập Tên WiFi' }]}
                >
                  <Input placeholder="Ví dụ: Office_Main_5G" className="wifi-input" />
                </Form.Item>

                <Form.Item
                  name="bssid"
                  label={<span className="wifi-form-label">Địa chỉ MAC (BSSID)</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ MAC' }]}
                >
                  <Input placeholder="00:1A:2B:3C:4D:5E" className="wifi-input" />
                </Form.Item>
              </div>

              <div className="wifi-form-row">
                <Form.Item
                  name="branch"
                  label={<span className="wifi-form-label">Chi nhánh / Văn phòng</span>}
                >
                  <Select className="wifi-select" loading={loading} placeholder="Chọn một văn phòng">
                    {offices.map((office) => (
                      <Select.Option key={office.id_van_phong} value={office.id_van_phong}>
                        {office.locationname || office.address}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="wifi-form-footer">
                <Button className="btn-wifi-cancel" onClick={handleCancel}>
                  Hủy bỏ
                </Button>
                <Button type="primary" className="btn-wifi-save" onClick={handleSave} loading={loading}>
                  {id ? 'Cập nhật mạng' : 'Lưu mạng'}
                </Button>
              </div>
            </Form>
          </div>
        </div>

        {/* Right Info Area */}
        <div className="add-wifi-info-section">
          <div className="info-card why-mac-card">
            <div className="info-icon-wrapper">
              <SafetyCertificateOutlined />
            </div>
            <h3>Tại sao cần Địa chỉ MAC?</h3>
            <p>
              Địa chỉ MAC (BSSID) đóng vai trò là mã định danh phần cứng duy nhất cho bộ định tuyến của bạn.
              Không giống như tên SSID có thể bị giả mạo, địa chỉ MAC đảm bảo nhân viên
              thực sự có mặt tại địa điểm chi nhánh cụ thể khi thực hiện chấm công.
            </p>
            <div className="security-protocol">
              <CheckCircleOutlined /> Giao thức bảo mật V3.4
            </div>
          </div>

          <div className="info-card preview-card">
            <div className="preview-header">XEM TRƯỚC CẤU HÌNH</div>
            <div className="preview-main">
              <div className="preview-strength">
                <div className="strength-label">ĐỘ MẠNH TÍN HIỆU</div>
                <div className="strength-value">Tuyệt vời</div>
              </div>
              <WifiOutlined className="preview-wifi-icon" />
            </div>
            <div className="strength-bar"></div>

            <div className="preview-pills">
              <span className="pill">BẢO MẬT WPA3</span>
              <span className="pill">DOANH NGHIỆP</span>
            </div>
          </div>

          <div className="quick-tips">
            <div className="tips-header">MẸO NHANH</div>
            <ul className="tips-list">
              <li>
                <CheckCircleOutlined className="tip-icon" />
                Sử dụng IP tĩnh cho gateway để tránh bị gián đoạn chấm công.
              </li>
              <li>
                <CheckCircleOutlined className="tip-icon" />
                Đảm bảo băng tần 5GHz hoạt động để đồng bộ sinh trắc học nhanh hơn.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWifiPage;
