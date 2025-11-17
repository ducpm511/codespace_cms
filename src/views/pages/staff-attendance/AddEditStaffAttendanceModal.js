import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CAlert,
} from '@coreui/react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'
import {
  createManualAttendance,
  updateManualAttendance,
} from '../../../services/staffAttendance.service'
import { getAllStaff } from '../../../services/staff.service' // Lấy danh sách nhân viên

const AddEditAttendanceModal = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  selectedDate,
  staffIdFromPage,
}) => {
  const [staffList, setStaffList] = useState([])
  const [loadingStaff, setLoadingStaff] = useState(false)

  // Form State
  const [staffId, setStaffId] = useState('')
  const [type, setType] = useState('check-in')
  const [timestamp, setTimestamp] = useState(new Date()) // Giờ sẽ được chọn

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!initialData

  useEffect(() => {
    // Tải danh sách nhân viên khi modal mở
    const fetchStaff = async () => {
      setLoadingStaff(true)
      try {
        const staff = await getAllStaff()
        setStaffList(staff)
      } catch (err) {
        setError('Không thể tải danh sách nhân viên.')
      } finally {
        setLoadingStaff(false)
      }
    }

    if (visible) {
      fetchStaff()
      setError('')
      setIsSubmitting(false)

      if (isEditing) {
        // Chế độ Sửa
        setStaffId(initialData.staffId)
        setType(initialData.type)
        setTimestamp(new Date(initialData.timestamp)) // Load giờ cũ
      } else {
        // Chế độ Thêm
        setStaffId(staffIdFromPage || '') // Tự động chọn nhân viên nếu đã lọc
        setType('check-in')
        // Đặt giờ mặc định là 8:00 sáng của ngày đã chọn
        const defaultTime = new Date(selectedDate || new Date())
        defaultTime.setHours(8, 0, 0, 0)
        setTimestamp(defaultTime)
      }
    }
  }, [visible, initialData, isEditing, staffIdFromPage, selectedDate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!staffId || !timestamp || !type) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }

    setIsSubmitting(true)
    setError('')

    // TUÂN THỦ QUY TẮC VÀNG: Gửi chuỗi ISO 8601 đầy đủ
    const payload = {
      staffId: parseInt(staffId, 10),
      timestamp: timestamp.toISOString(), // '2025-11-16T10:30:00.000Z'
      type: type,
    }

    try {
      if (isEditing) {
        await updateManualAttendance(initialData.id, { timestamp: payload.timestamp })
        toast.success('Cập nhật chấm công thành công!')
      } else {
        await createManualAttendance(payload)
        toast.success('Thêm chấm công thành công!')
      }
      onSuccess() // Gọi callback để tải lại dữ liệu và đóng modal
    } catch (err) {
      const errorMessage = err.data?.message?.join(', ') || err.message || 'Có lỗi xảy ra.'
      setError(errorMessage)
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
            {isEditing ? 'Sửa bản ghi Chấm công' : 'Thêm Chấm công Thủ công'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {loadingStaff ? (
            <CSpinner />
          ) : (
            <>
              <div className="mb-3">
                <CFormLabel htmlFor="staffId">Nhân viên</CFormLabel>
                <CFormSelect
                  id="staffId"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  disabled={isEditing || loadingStaff} // Không cho đổi nhân viên khi sửa
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </CFormSelect>
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="type">Loại chấm công</CFormLabel>
                <CFormSelect
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isEditing} // Không cho đổi loại khi sửa
                  required
                >
                  <option value="check-in">Check-in</option>
                  <option value="check-out">Check-out</option>
                </CFormSelect>
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="timestamp" className="d-block">
                  Thời gian (Ngày và Giờ)
                </CFormLabel>
                <DatePicker
                  id="timestamp"
                  selected={timestamp}
                  onChange={(date) => setTimestamp(date)}
                  showTimeSelect // Bật chọn giờ
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  className="form-control" // Style của CoreUI
                  wrapperClassName="d-block" // Hiển thị full-width
                />
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </CButton>
          <CButton color="primary" type="submit" disabled={isSubmitting || loadingStaff}>
            {isSubmitting ? <CSpinner size="sm" /> : 'Lưu'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default AddEditAttendanceModal
