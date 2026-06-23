import { useState, useEffect, useCallback } from 'react';
import { SyncOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { leaveTypeApi, type LeaveType } from '../../api/loaiNghi.api';
import { useThongBao } from '../../../../components/common/Toast/ThongBaoToast';
import './CauHinhLoaiNghi.css';

export default function CauHinhLoaiNghiPage() {
    const toast = useThongBao();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<LeaveType>>({});

    const taiDanhSachLoaiNghi = useCallback(async () => {
        setLoading(true);
        try {
            const res = await leaveTypeApi.layTatCa();
            if (res.success) {
                setLeaveTypes(res.data || []);
            } else {
                throw new Error(res.message || 'Lỗi khi tải danh sách loại phép');
            }
        } catch (err: any) {
            toast.error('Lỗi', err.message);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        taiDanhSachLoaiNghi();
    }, [taiDanhSachLoaiNghi]);

    const xuLyClickSua = (record: LeaveType) => {
        setEditingId(record.id_loai_phep);
        setEditForm(record);
    };

    const xuLyHuySua = () => {
        setEditingId(null);
        setEditForm({});
    };

    const xuLyLuu = async (id: string) => {
        if (!editForm.ten_phep || editForm.so_ngay_toi_da === undefined) {
            toast.error('Lỗi', 'Vui lòng nhập đủ tên phép và số ngày tối đa');
            return;
        }

        setLoading(true);
        try {
            const res = await leaveTypeApi.capNhat(id, editForm as Omit<LeaveType, 'id_loai_phep'>);
            if (res.success) {
                toast.success('Thành công', 'Đã cập nhật loại đơn từ');
                setEditingId(null);
                setEditForm({});
                await taiDanhSachLoaiNghi();
            } else {
                throw new Error(res.message || 'Lỗi khi cập nhật loại đơn từ');
            }
        } catch (err: any) {
            toast.error('Lỗi', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="leave-type-page">
            <div className="leave-type-header">
                <div>
                    <h1>Thiết lập Đơn từ</h1>
                    <p>Quản lý các loại đơn từ, số ngày nghỉ phép tối đa trong năm và thiết lập tính lương.</p>
                </div>
                <button className="btn-secondary" onClick={taiDanhSachLoaiNghi} disabled={loading}>
                    <SyncOutlined spin={loading} /> Làm mới
                </button>
            </div>

            <div className="leave-type-content">
                <table className="leave-type-table">
                    <thead>
                        <tr>
                            <th>MÃ LOẠI</th>
                            <th>TÊN LOẠI PHÉP</th>
                            <th>SỐ LẦN/NGÀY TỐI ĐA</th>
                            <th>CÓ LƯƠNG</th>
                            <th>MÔ TẢ</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && leaveTypes.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</td>
                            </tr>
                        ) : leaveTypes.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Không có loại đơn từ nào.</td>
                            </tr>
                        ) : (
                            leaveTypes.map(type => {
                                const isEditing = editingId === type.id_loai_phep;
                                return (
                                    <tr key={type.id_loai_phep} className={isEditing ? 'editing-row' : ''}>
                                        <td className="fw-600">{type.id_loai_phep}</td>

                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={editForm.ten_phep}
                                                    onChange={e => setEditForm({ ...editForm, ten_phep: e.target.value })}
                                                />
                                            ) : (
                                                <span className="fw-600">{type.ten_phep}</span>
                                            )}
                                        </td>

                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: '80px' }}
                                                    value={editForm.so_ngay_toi_da}
                                                    onChange={e => setEditForm({ ...editForm, so_ngay_toi_da: Number(e.target.value) })}
                                                />
                                            ) : (
                                                <span className="badge-days">{type.so_ngay_toi_da} ngày</span>
                                            )}
                                        </td>

                                        <td>
                                            {isEditing ? (
                                                <select
                                                    className="form-input"
                                                    value={editForm.co_luong ? 'true' : 'false'}
                                                    onChange={e => setEditForm({ ...editForm, co_luong: e.target.value === 'true' })}
                                                >
                                                    <option value="true">Có</option>
                                                    <option value="false">Không</option>
                                                </select>
                                            ) : (
                                                <span className={`badge-salary ${type.co_luong ? 'yes' : 'no'}`}>
                                                    {type.co_luong ? 'Có lương' : 'Không lương'}
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={editForm.mo_ta}
                                                    onChange={e => setEditForm({ ...editForm, mo_ta: e.target.value })}
                                                />
                                            ) : (
                                                <span className="text-gray">{type.mo_ta}</span>
                                            )}
                                        </td>

                                        <td>
                                            {isEditing ? (
                                                <div className="action-buttons">
                                                    <button className="btn-icon btn-save" onClick={() => xuLyLuu(type.id_loai_phep)} title="Lưu">
                                                        <SaveOutlined />
                                                    </button>
                                                    <button className="btn-icon btn-cancel" onClick={xuLyHuySua} title="Hủy">
                                                        <CloseOutlined />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn-icon btn-edit" onClick={() => xuLyClickSua(type)} title="Chỉnh sửa">
                                                    <EditOutlined /> Sửa
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
