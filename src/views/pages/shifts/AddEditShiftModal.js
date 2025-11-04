import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CSpinner,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { createShift, updateShift } from '../../../services/shift.service'

// --- THÊM HÀM HELPER NÀY ---
// Hàm này sẽ chuyển đổi object {hours, minutes} thành chuỗi "HH:mm:ss"
const formatDurationToString = (duration) => {
  // Nếu là string rồi (ví dụ: "01:30:00"), trả về luôn
  if (typeof duration === 'string') {
    return duration
  }
  // Nếu là object, chuyển đổi
  if (duration && typeof duration === 'object') {
    const hours = String(duration.hours || 0).padStart(2, '0')
    const minutes = String(duration.minutes || 0).padStart(2, '0')
    const seconds = String(duration.seconds || 0).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }
  // Fallback nếu là null hoặc undefined
  return '00:00:00'
}

const AddEditShiftModal = ({ visible, onClose, mode, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    startTime: '08:00:00',
    endTime: '17:30:00',
    breakDuration: '01:30:00',
    otMultiplier: 1.5,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        startTime: initialData.startTime || '08:00:00',
        endTime: initialData.endTime || '17:30:00',
        // --- SỬA LẠI DÒNG NÀY ---
        // Chuyển đổi object {hours, minutes} thành chuỗi "HH:mm:ss"
        breakDuration: formatDurationToString(initialData.breakDuration),
        otMultiplier: initialData.otMultiplier || 1.5,
      })
    } else {
      // Reset form for 'add' mode
      setFormData({
        name: '',
        startTime: '08:00:00',
        endTime: '17:30:00',
        breakDuration: '01:30:00',
        otMultiplier: 1.5,
      })
    }
  }, [mode, initialData, visible])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Đảm bảo otMultiplier là số (input có thể trả về string)
      // và breakDuration là chuỗi HH:mm:ss (đã được xử lý bởi input type="time")
      const payload = {
        ...formData,
        otMultiplier: parseFloat(formData.otMultiplier),
      }

      if (mode === 'add') {
        await createShift(payload)
        toast.success('Thêm ca làm việc thành công!')
      } else {
        await updateShift(initialData.id, payload)
        toast.success('Cập nhật ca làm việc thành công!')
      }
      onSuccess()
    } catch (error) {
      // Lấy lỗi validation từ server (nếu có)
      const errorMessage = error.data?.message?.join(', ') || error.message || 'Đã có lỗi xảy ra.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} alignment="center">
      <CForm onSubmit={handleSubmit}>
        <CModalHeader>
          <CModalTitle>
            {mode === 'add' ? 'Thêm ca làm việc mới' : 'Chỉnh sửa ca làm việc'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="name">Tên ca</CFormLabel>
            <CFormInput id="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="startTime">Giờ bắt đầu (HH:mm:ss)</CFormLabel>
            <CFormInput
              id="startTime"
              type="time"
              step="1"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="endTime">Giờ kết thúc (HH:mm:ss)</CFormLabel>
            <CFormInput
              id="endTime"
              type="time"
              step="1"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="breakDuration">Giờ nghỉ (HH:mm:ss)</CFormLabel>
            <CFormInput
              id="breakDuration"
              type="time"
              step="1"
              value={formData.breakDuration}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="otMultiplier">Hệ số OT</CFormLabel>
            <CFormInput
              id="otMultiplier"
              type="number"
              step="0.1"
              min="1"
              value={formData.otMultiplier}
              onChange={handleChange}
              required
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Hủy
          </CButton>
          <CButton color="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <CSpinner size="sm" /> : 'Lưu'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default AddEditShiftModal
