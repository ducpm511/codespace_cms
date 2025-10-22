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
        breakDuration: initialData.breakDuration || '01:30:00',
        otMultiplier: initialData.otMultiplier || 1.5,
      })
    } else {
      // Reset form for 'add' mode
      setFormData({
        name: '',
        startTime: '08:00:00',
        endTime: '17:30:00',
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
      if (mode === 'add') {
        await createShift(formData)
        toast.success('Thêm ca làm việc thành công!')
      } else {
        await updateShift(initialData.id, formData)
        toast.success('Cập nhật ca làm việc thành công!')
      }
      onSuccess()
    } catch (error) {
      toast.error(error.message || 'Đã có lỗi xảy ra.')
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
          {/* <div className="mb-3">
            <CFormLabel htmlFor="breakDuration">Giờ nghỉ (HH:mm:ss)</CFormLabel>
            <CFormInput
              id="breakDuration"
              type="time"
              step="1"
              value={formData.breakDuration}
              onChange={handleChange}
              required
            />
          </div> */}
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
