// EditSessionModal.js
import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormLabel,
  CFormInput,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import apiClient from '../../utils/apiClient'
import { DateTime } from 'luxon' // Sử dụng Luxon đã cài đặt

const EditSessionModal = ({ visible, onClose, session, onSuccess }) => {
  const [sessionDate, setSessionDate] = useState(null)
  const [startTime, setStartTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      setSessionDate(new Date(session.sessionDate))
      setStartTime(session.startTime ? session.startTime.substring(0, 5) : '00:00')
      setError('')
    }
  }, [session])

  const handleSubmit = async () => {
    if (!session || !sessionDate || !startTime) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      // ĐÂY LÀ LOGIC CHUẨN XÁC NHẤT
      const payload = {
        // Dùng Luxon để format ngày đã chọn ra chuỗi 'yyyy-MM-dd' một cách an toàn
        // Thao tác này không bị ảnh hưởng bởi việc chuyển đổi múi giờ sang UTC
        sessionDate: DateTime.fromJSDate(sessionDate).toFormat('yyyy-MM-dd'),
        startTime: `${startTime}:00`,
      }

      await apiClient(`/class-sessions/${session.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      toast.success('Cập nhật buổi học thành công!')
      onSuccess()
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} alignment="center">
      <CModalHeader>
        <CModalTitle>Chỉnh sửa Buổi học số {session?.sessionNumber}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        <div className="mb-3">
          <CFormLabel htmlFor="sessionDate">Ngày học</CFormLabel>
          <DatePicker
            id="sessionDate"
            selected={sessionDate}
            onChange={(date) => setSessionDate(date)}
            dateFormat="dd/MM/yyyy"
            className="form-control"
            wrapperClassName="d-block"
          />
        </div>
        <div className="mb-3">
          <CFormLabel htmlFor="startTime">Giờ học (HH:mm)</CFormLabel>
          <CFormInput
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Hủy
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <CSpinner size="sm" /> : 'Lưu thay đổi'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default EditSessionModal
