import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { departmentApi } from '../../features/departments/api/phongBan.api';
import type { Department } from '../../types/kieuPhongBan';

export default function QuanLyPhongBanPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [form] = Form.useForm();

    const taiDanhSachPhongBan = async () => {
        setLoading(true);
        try {
            const res = await departmentApi.layTatCa();
            if (res.success) {
                setDepartments(res.data);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách phòng ban');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        taiDanhSachPhongBan();
    }, []);

    const hienThiModal = (dept?: Department) => {
        setEditingDept(dept || null);
        if (dept) {
            form.setFieldsValue({
                ten_phong_ban: dept.ten_phong_ban,
                mo_ta: dept.mo_ta,
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const xuLyHuy = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingDept(null);
    };

    const xuLyGui = async () => {
        try {
            const values = await form.validateFields();
            if (editingDept) {
                const res = await departmentApi.capNhat(editingDept.id_phong_ban, values);
                if (res.success) {
                    message.success('Cập nhật phòng ban thành công');
                } else {
                    message.error(res.message || 'Lỗi cập nhật phòng ban');
                }
            } else {
                const res = await departmentApi.taoMoi(values);
                if (res.success) {
                    message.success('Thêm phòng ban thành công');
                } else {
                    message.error(res.message || 'Lỗi thêm phòng ban');
                }
            }
            setIsModalVisible(false);
            taiDanhSachPhongBan();
        } catch (error) {
            console.error('Lỗi validate hoặc lưu dữ liệu:', error);
        }
    };

    const xuLyXoa = async (id: string) => {
        try {
            const res = await departmentApi.xoa(id);
            if (res.success) {
                message.success('Xóa phòng ban thành công');
                taiDanhSachPhongBan();
            } else {
                message.error(res.message || 'Không thể xóa phòng ban');
            }
        } catch (error: any) {
             const errorMsg = error.response?.data?.message || 'Lỗi xóa phòng ban';
             message.error(errorMsg);
        }
    };

    const columns = [
        {
            title: 'Mã Phòng Ban',
            dataIndex: 'id_phong_ban',
            key: 'id_phong_ban',
        },
        {
            title: 'Tên Phòng Ban',
            dataIndex: 'ten_phong_ban',
            key: 'ten_phong_ban',
            render: (text: string, record: Department) => text || record.mo_ta || 'N/A'
        },
        {
            title: 'Mô Tả',
            dataIndex: 'mo_ta',
            key: 'mo_ta',
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'ngay_tao',
            key: 'ngay_tao',
            render: (text: string) => text ? new Date(text).toLocaleDateString('vi-VN') : 'N/A'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Department) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => hienThiModal(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa phòng ban này?"
                        onConfirm={() => xuLyXoa(record.id_phong_ban)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Quản lý Phòng Ban</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => hienThiModal()}>
                    Thêm Phòng Ban
                </Button>
            </div>
            <Table 
                columns={columns} 
                dataSource={departments} 
                rowKey="id_phong_ban" 
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingDept ? 'Sửa Phòng Ban' : 'Thêm Phòng Ban'}
                open={isModalVisible}
                onOk={xuLyGui}
                onCancel={xuLyHuy}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="ten_phong_ban"
                        label="Tên Phòng Ban"
                        rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}
                    >
                        <Input placeholder="Nhập tên phòng ban" />
                    </Form.Item>
                    <Form.Item
                        name="mo_ta"
                        label="Mô Tả"
                    >
                        <Input.TextArea rows={4} placeholder="Nhập mô tả" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
