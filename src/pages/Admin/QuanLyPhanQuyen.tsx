import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { vaiTroApi } from '../../features/roles/api/vaiTro.api';
import type { Role } from '../../features/roles/api/vaiTro.api';

export default function QuanLyPhanQuyenPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [form] = Form.useForm();

    const taiDanhSachVaiTro = async () => {
        setLoading(true);
        try {
            const res = await vaiTroApi.layTatCa();
            if (res.success) {
                setRoles(res.data);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách vai trò');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        taiDanhSachVaiTro();
    }, []);

    const hienThiModal = (role?: Role) => {
        setEditingRole(role || null);
        if (role) {
            form.setFieldsValue({
                ten_vai_tro: role.ten_vai_tro,
                mo_ta: role.mo_ta,
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const xuLyHuy = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingRole(null);
    };

    const xuLyGui = async () => {
        try {
            const values = await form.validateFields();
            if (editingRole) {
                const res = await vaiTroApi.capNhat(editingRole.id_vai_tro, values);
                if (res.success) {
                    message.success('Cập nhật vai trò thành công');
                } else {
                    message.error(res.message || 'Lỗi cập nhật vai trò');
                }
            } else {
                const res = await vaiTroApi.taoMoi(values);
                if (res.success) {
                    message.success('Thêm vai trò thành công');
                } else {
                    message.error(res.message || 'Lỗi thêm vai trò');
                }
            }
            setIsModalVisible(false);
            taiDanhSachVaiTro();
        } catch (error) {
            console.error('Lỗi validate hoặc lưu dữ liệu:', error);
        }
    };

    const xuLyXoa = async (id: string) => {
        try {
            const res = await vaiTroApi.xoa(id);
            if (res.success) {
                message.success('Xóa vai trò thành công');
                taiDanhSachVaiTro();
            } else {
                message.error(res.message || 'Không thể xóa vai trò');
            }
        } catch (error: any) {
             const errorMsg = error.response?.data?.message || 'Lỗi xóa vai trò';
             message.error(errorMsg);
        }
    };

    const columns = [
        {
            title: 'Mã Vai Trò',
            dataIndex: 'id_vai_tro',
            key: 'id_vai_tro',
        },
        {
            title: 'Tên Vai Trò',
            dataIndex: 'ten_vai_tro',
            key: 'ten_vai_tro',
        },
        {
            title: 'Mô Tả',
            dataIndex: 'mo_ta',
            key: 'mo_ta',
            render: (text: string) => text || 'N/A'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Role) => {
                // Không hiển thị nút sửa/xóa với các role hệ thống
                const isSystemRole = ['VT001', 'VT002', 'VT003'].includes(record.id_vai_tro);
                
                return (
                    <Space size="middle">
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />} 
                            onClick={() => hienThiModal(record)}
                            disabled={isSystemRole}
                        >
                            Sửa
                        </Button>
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa vai trò này?"
                            onConfirm={() => xuLyXoa(record.id_vai_tro)}
                            okText="Có"
                            cancelText="Không"
                            disabled={isSystemRole}
                        >
                            <Button danger icon={<DeleteOutlined />} disabled={isSystemRole}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Quản lý Phân Quyền (Vai trò)</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => hienThiModal()}>
                    Thêm Vai Trò
                </Button>
            </div>
            <Table 
                columns={columns} 
                dataSource={roles} 
                rowKey="id_vai_tro" 
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingRole ? 'Sửa Vai Trò' : 'Thêm Vai Trò'}
                open={isModalVisible}
                onOk={xuLyGui}
                onCancel={xuLyHuy}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="ten_vai_tro"
                        label="Tên Vai Trò"
                        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
                    >
                        <Input placeholder="Ví dụ: Kế toán, Leader..." />
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
