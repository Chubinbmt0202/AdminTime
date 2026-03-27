import React, { useState, useEffect } from 'react';
import {
  CloseOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { shiftApi } from '../../api/shift.api';
import { message } from 'antd';
import './AddShiftDrawer.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

const AddShiftDrawer: React.FC<Props> = ({ open, onClose, onSuccess, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shiftName: '',
    shiftType: 'fixed',
    startTime: '08:00',
    endTime: '17:00',
    hasBreak: true,
    breakStart: '12:00',
    breakEnd: '13:00',
    workingDays: '1.0',
    lateGrace: '15',
    earlyGrace: '5',
    checkInBefore: '60',
    checkOutAfter: '120',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        shiftName: initialData.shift_name || initialData.ten_ca || '',
        shiftType: 'fixed',
        startTime: initialData.start_time || (initialData.gio_bat_dau ? initialData.gio_bat_dau.substring(0, 5) : '08:00'),
        endTime: initialData.end_time || (initialData.gio_ket_thuc ? initialData.gio_ket_thuc.substring(0, 5) : '17:30'),
        hasBreak: initialData.has_lunch_break !== undefined ? initialData.has_lunch_break : (initialData.has_lunch_break_old ?? true),
        breakStart: initialData.lunch_start_time || (initialData.gio_bat_dau_nghi ? initialData.gio_bat_dau_nghi.substring(0, 5) : '12:00'),
        breakEnd: initialData.lunch_end_time || (initialData.gio_ket_thuc_nghi ? initialData.gio_ket_thuc_nghi.substring(0, 5) : '13:00'),
        workingDays: initialData.coefficient?.toString() || initialData.so_cong?.toString() || '1.0',
        lateGrace: initialData.late_tolerance_mins?.toString() || '15',
        earlyGrace: '5',
        checkInBefore: '60',
        checkOutAfter: '120',
      });
    } else {
      setForm({
        shiftName: '',
        shiftType: 'fixed',
        startTime: '08:00',
        endTime: '17:00',
        hasBreak: true,
        breakStart: '12:00',
        breakEnd: '13:00',
        workingDays: '1.0',
        lateGrace: '15',
        earlyGrace: '5',
        checkInBefore: '60',
        checkOutAfter: '120',
      });
    }
  }, [initialData, open]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        shift_name: form.shiftName,
        start_time: form.startTime,
        end_time: form.endTime,
        late_tolerance_mins: parseInt(form.lateGrace),
        coefficient: parseFloat(form.workingDays),
        has_lunch_break: form.hasBreak,
        lunch_start_time: form.hasBreak ? form.breakStart : null,
        lunch_end_time: form.hasBreak ? form.breakEnd : null
      };

      let response;
      if (initialData?.id_ca_lam_viec || initialData?.id) {
        response = await shiftApi.updateShift(initialData.id_ca_lam_viec || initialData.id, payload);
      } else {
        response = await shiftApi.addShift(payload);
      }

      if (response.success) {
        message.success(initialData ? 'Cập nhật ca làm việc thành công' : 'Thêm ca làm việc thành công');
        onSuccess?.();
        onClose();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      console.error('Error saving shift:', error);
      message.error(error.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`drawer-overlay ${open ? 'drawer-overlay-visible' : ''}`}
        onClick={onClose}
      />
      <div className={`drawer-panel ${open ? 'drawer-panel-open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <h2>{initialData ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}</h2>
            <p>Thiết lập thông số và quy tắc cho ca làm việc.</p>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>

        <div className="drawer-body">
          <div className="sections-horizontal-wrapper">
            {/* Section 1: Thông tin chung */}
            <section className="drawer-section-shift">
              <div className="section-header-shift">
                <div className="section-number">1</div>
                <h3>Thông tin chung</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tên ca làm việc <span className="required">*</span></label>
                  <input
                    type="text"
                    name="shiftName"
                    className="form-input"
                    placeholder="VD: Ca Sáng Văn Phòng"
                    value={form.shiftName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Loại ca</label>
                  <select
                    name="shiftType"
                    className="form-input form-select"
                    value={form.shiftType}
                    onChange={handleChange}
                  >
                    <option value="fixed">Ca cố định</option>
                    <option value="flexible">Ca linh hoạt</option>
                    <option value="split">Ca gãy</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section 2: Cấu hình thời gian */}
            <section className="drawer-section-shift">
              <div className="section-header-shift">
                <div className="section-number">2</div>
                <h3>Cấu hình thời gian</h3>
              </div>

              <div className="section-box">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">GIỜ VÀO CA</label>
                    <div className="time-input-wrapper">
                      <input
                        type="text"
                        name="startTime"
                        className="form-input"
                        value={form.startTime}
                        onChange={handleChange}
                      />
                      <ClockCircleOutlined className="time-icon" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">GIỜ RA CA</label>
                    <div className="time-input-wrapper">
                      <input
                        type="text"
                        name="endTime"
                        className="form-input"
                        value={form.endTime}
                        onChange={handleChange}
                      />
                      <ClockCircleOutlined className="time-icon" />
                    </div>
                  </div>
                </div>

                <div className="switch-row">
                  <div className="switch-info">
                    <CoffeeOutlined className="switch-icon" />
                    <div className="switch-text">
                      <h4>Nghỉ giữa ca</h4>
                      <p>Cấu hình thời gian nghỉ trưa hoặc nghỉ ngơi</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="hasBreak"
                      checked={form.hasBreak}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {form.hasBreak && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Bắt đầu nghỉ</label>
                      <div className="time-input-wrapper">
                        <input
                          type="text"
                          name="breakStart"
                          className="form-input"
                          value={form.breakStart}
                          onChange={handleChange}
                        />
                        <ClockCircleOutlined className="time-icon" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kết thúc nghỉ</label>
                      <div className="time-input-wrapper">
                        <input
                          type="text"
                          name="breakEnd"
                          className="form-input"
                          value={form.breakEnd}
                          onChange={handleChange}
                        />
                        <ClockCircleOutlined className="time-icon" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="sections-horizontal-wrapper">
            {/* Section 3: Quy định chấm công */}
            <section className="drawer-section-shift">
              <div className="section-header-shift">
                <div className="section-number">3</div>
                <h3>Quy định chấm công</h3>
              </div>

              <div className="form-row form-row-3col">
                <div className="form-group">
                  <label className="form-label">Số công tính</label>
                  <input
                    type="text"
                    name="workingDays"
                    className="form-input"
                    value={form.workingDays}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Đi muộn (phút)</label>
                  <input
                    type="text"
                    name="lateGrace"
                    className="form-input"
                    value={form.lateGrace}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Về sớm (phút)</label>
                  <input
                    type="text"
                    name="earlyGrace"
                    className="form-input"
                    value={form.earlyGrace}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="advanced-params">
                <div className="advanced-params-header">
                  <SettingOutlined />
                  <span>THÔNG SỐ NÂNG CAO</span>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Mở chấm công vào trước (phút)</label>
                    <input
                      type="text"
                      name="checkInBefore"
                      className="form-input form-input-white"
                      value={form.checkInBefore}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đóng chấm công ra sau (phút)</label>
                    <input
                      type="text"
                      name="checkOutAfter"
                      className="form-input form-input-white"
                      value={form.checkOutAfter}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Tùy chọn áp dụng */}
            <section className="drawer-section-shift">
              <div className="section-header-shift">
                <div className="section-number">4</div>
                <h3>Tùy chọn áp dụng</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Đối tượng áp dụng</label>
                <div className="audience-selector">
                  <div className="audience-tag tag-blue">
                    Toàn công ty <span className="tag-close">×</span>
                  </div>
                  <div className="audience-tag tag-dashed">
                    Thêm bộ phận +
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>Hủy bỏ</button>
          <button className="btn-save" onClick={handleSave} disabled={loading}>
            {loading ? 'Đang lưu...' : initialData ? 'Cập nhật ca làm việc' : 'Lưu ca làm việc'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddShiftDrawer;
