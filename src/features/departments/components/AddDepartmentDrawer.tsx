import { useState } from 'react';
import { Drawer, Form, Input, Button, message, Row, Col } from 'antd';
import { InfoCircleOutlined, SearchOutlined, AppstoreAddOutlined, CloseOutlined } from '@ant-design/icons';
import { departmentApi } from '../api/department.api';

interface AddDepartmentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDepartmentDrawer({ open, onClose, onSuccess }: AddDepartmentDrawerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await departmentApi.create({ mo_ta: values.ten_phong_ban || values.mo_ta, ...values });
      if (response.success) {
        message.success('Thêm phòng ban thành công');
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi thêm phòng ban');
      }
    } catch (error: any) {
      console.error('Error adding department:', error);
      message.error(error.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={null}
      closable={false}
      size={480}
      open={open}
      onClose={onClose}
      destroyOnClose
      styles={{
        body: { padding: '28px 32px' }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>Thêm phòng ban mới</h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
            Điền các thông tin cần thiết để khởi tạo một bộ phận mới trong hệ thống.
          </p>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined style={{ fontSize: '16px' }} />}
          onClick={onClose}
          style={{ color: '#9ca3af', marginTop: '-4px', marginRight: '-8px' }}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="ten_phong_ban"
              label={<span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px', color: '#374151' }}>TÊN PHÒNG BAN</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}
            >
              <Input
                placeholder="Vd: Marketing"
                size="large"
                style={{ backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '14px', color: '#374151' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="truong_bo_phan"
          label={<span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px', color: '#374151', marginTop: '8px', display: 'block' }}>CHỈ ĐỊNH TRƯỞNG BỘ PHẬN</span>}
        >
          <Input
            prefix={<SearchOutlined style={{ color: '#9ca3af', marginRight: '4px' }} />}
            suffix={<span style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>⌘ K</span>}
            placeholder="Tìm kiếm nhân viên theo tên hoặc mã..."
            size="large"
            style={{ backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '14px' }}
          />
        </Form.Item>

        <Form.Item
          name="mo_ta_chuc_nang"
          label={<span style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px', color: '#374151', marginTop: '8px', display: 'block' }}>MÔ TẢ CHỨC NĂNG</span>}
        >
          <Input.TextArea
            placeholder="Nhập các chức năng chính, quyền hạn và nhiệm vụ của phòng ban này..."
            rows={4}
            style={{ backgroundColor: '#f9fafb', border: 'none', borderRadius: '6px', resize: 'none', fontSize: '14px', padding: '12px' }}
          />
        </Form.Item>

        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginTop: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: '#1d4ed8', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
            <InfoCircleOutlined style={{ marginRight: '6px', fontSize: '14px' }} />
            LƯU Ý HỆ THỐNG
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
            Khi tạo phòng ban mới, hệ thống sẽ tự động khởi tạo cấu trúc cây thư mục nhân sự tương ứng. Quyền hạn của trưởng bộ phận sẽ được mặc định cấp dựa trên vai trò 'Department Manager'.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={onClose}
            type="text"
            style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}
          >
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            size="large"
            icon={<AppstoreAddOutlined />}
            style={{ backgroundColor: '#1d4ed8', borderRadius: '6px', fontWeight: 600, fontSize: '14px', padding: '0 24px', height: '44px' }}
          >
            Tạo phòng ban
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
