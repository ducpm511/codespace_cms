import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { DateTime } from 'luxon'
import { getAllShifts } from '../../../services/shift.service' // Lấy danh sách ca mới
import { updateShiftAssignment, deleteShiftAssignment } from '../../../services/schedule.service'

const EditDeleteShiftAssignmentModal = ({ visible, onClose, eventData, onSuccess }) => {
  const [shiftList, setShiftList] = useState([])
  const [loadingShifts, setLoadingShifts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false) // State riêng cho xóa
  const [error, setError] = useState('')

  // State cho dropdown chọn ca mới
  const [selectedShiftId, setSelectedShiftId] = useState('')

  useEffect(() => {
    if (visible && eventData?.resource?.schedule) {
      // Đặt giá trị ban đầu cho dropdown
      setSelectedShiftId(eventData.resource.schedule.shiftId || '')
      setError('')

      // Tải danh sách các ca làm việc có sẵn
      const fetchShifts = async () => {
        setLoadingShifts(true)
        try {
          const shifts = await getAllShifts()
          setShiftList(shifts)
        } catch (err) {
          setError('Không thể tải danh sách ca làm việc.')
          setShiftList([]) // Reset nếu lỗi
        } finally {
          setLoadingShifts(false)
        }
      }
      fetchShifts()
    }
  }, [visible, eventData])

  const handleUpdate = async () => {
    if (!selectedShiftId) {
      setError('Vui lòng chọn một ca làm việc.')
      return
    }
    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        shiftId: parseInt(selectedShiftId, 10),
      }
      await updateShiftAssignment(eventData.resource.schedule.id, payload)
      toast.success('Cập nhật ca làm việc thành công!')
      onSuccess() // Gọi callback để đóng modal và tải lại lịch
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    // Thêm xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lịch làm việc này không?`)) {
      return
    }

    setIsDeleting(true)
    setError('')
    try {
      await deleteShiftAssignment(eventData.resource.schedule.id)
      toast.success('Xóa lịch làm việc thành công!')
      onSuccess() // Gọi callback
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Có lỗi xảy ra khi xóa.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const schedule = eventData?.resource?.schedule

  return (
    <CModal visible={visible} onClose={onClose} alignment="center">
      <CModalHeader>
        <CModalTitle>Chỉnh sửa/Xóa Lịch làm việc</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {loadingShifts ? (
          <CSpinner />
        ) : schedule ? (
          <>
            <p>
              <strong>Nhân viên:</strong> {schedule.staff?.fullName || 'N/A'}
              <br />
              <strong>Ngày:</strong> {DateTime.fromISO(schedule.date).toFormat('dd/MM/yyyy')}
              <br />
              <strong>Ca hiện tại:</strong> {schedule.shift?.name || 'N/A'} (
              {schedule.shift?.startTime} - {schedule.shift?.endTime})
            </p>
            <hr />
            <div className="mb-3">
              <CFormLabel htmlFor="newShiftId">Chọn Ca làm việc mới</CFormLabel>
              <CFormSelect
                id="newShiftId"
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                disabled={isSubmitting || isDeleting}
              >
                <option value="">-- Chọn ca mới --</option>
                {shiftList.map((sh) => (
                  <option key={sh.id} value={sh.id}>
                    {sh.name} ({sh.startTime} - {sh.endTime})
                  </option>
                ))}
              </CFormSelect>
            </div>
          </>
        ) : (
          <p>Không có thông tin lịch làm việc.</p>
        )}
      </CModalBody>
      <CModalFooter className="justify-content-between">
        {/* Nút Xóa căn trái */}
        <CButton
          color="danger"
          variant="outline"
          onClick={handleDelete}
          disabled={isSubmitting || isDeleting || loadingShifts || !schedule}
        >
          {isDeleting ? <CSpinner size="sm" /> : 'Xóa Lịch này'}
        </CButton>
        {/* Các nút căn phải */}
        <div>
          <CButton color="secondary" onClick={onClose} className="me-2">
            Hủy
          </CButton>
          <CButton
            color="primary"
            onClick={handleUpdate}
            disabled={isSubmitting || isDeleting || loadingShifts || !schedule || !selectedShiftId}
          >
            {isSubmitting ? <CSpinner size="sm" /> : 'Lưu Thay đổi'}
          </CButton>
        </div>
      </CModalFooter>
    </CModal>
  )
}

export default EditDeleteShiftAssignmentModal
