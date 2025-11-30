import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CSpinner,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CFormLabel,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilXCircle } from '@coreui/icons'
import { toast } from 'react-toastify'
import { DateTime, Duration } from 'luxon' // Import Duration
import { getOtRequests, updateOtRequestStatus } from '../../../services/otRequest.service'
import { getStaffDetails } from '../../../services/staff.service'

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'

// Hàm helper để format Duration thành chuỗi H giờ M phút
const formatDurationObj = (isoDurationString) => {
  if (!isoDurationString) return 'N/A'
  // TypeORM interval trả về object { hours, minutes, seconds }
  // Hoặc có thể trả về string ISO 8601 PThhHmmMss.millisecondsS
  // Cần xử lý cả hai trường hợp
  if (typeof isoDurationString === 'object') {
    const { hours = 0, minutes = 0 } = isoDurationString
    return `${hours} giờ ${minutes} phút`
  }
  // Xử lý string ISO Duration (ví dụ: '01:15:00') - cần parse đúng
  try {
    const parts = isoDurationString.split(':')
    const hours = parseInt(parts[0] || '0', 10)
    const minutes = parseInt(parts[1] || '0', 10)
    // const seconds = parseInt(parts[2] || '0', 10); // Có thể bỏ qua giây
    return `${hours} giờ ${minutes} phút`
  } catch (e) {
    console.error('Error parsing duration string:', isoDurationString, e)
    return 'Lỗi định dạng'
  }
}

const formatTime = (isoString) => {
  if (!isoString) return 'N/A'
  // Chuyển đổi từ ISO (đã bao gồm múi giờ) về múi giờ VN
  return DateTime.fromISO(isoString).setZone(VN_TIMEZONE).toFormat('HH:mm:ss')
}

const OtRequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [action, setAction] = useState(null) // 'approve' or 'reject'
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [staffRates, setStaffRates] = useState(null) // Lưu rates của nhân viên được chọn
  const [loadingModalData, setLoadingModalData] = useState(false)
  const [selectedRoleKey, setSelectedRoleKey] = useState('')
  const [multiplier, setMultiplier] = useState(1)

  const fetchPendingRequests = async () => {
    setLoading(true)
    try {
      const data = await getOtRequests('pending')
      setRequests(data)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách yêu cầu OT.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const openModal = async (request, selectedAction) => {
    setSelectedRequest(request)
    setAction(selectedAction)
    setNotes('')
    setSelectedRoleKey('')
    setMultiplier(1)

    if (selectedAction === 'approve') {
      // Tải `rates` của nhân viên để hiển thị trong dropdown
      setLoadingModalData(true)
      try {
        const staffDetails = await getStaffDetails(request.staffId) // Cần tạo hàm này trong staff.service.js
        setStaffRates(staffDetails.rates || {})
      } catch (e) {
        toast.error('Lỗi tải chi tiết nhân viên.')
        closeModal()
      } finally {
        setLoadingModalData(false)
      }
    }
  }

  const closeModal = () => {
    setSelectedRequest(null)
    setAction(null)
    setNotes('')
    setStaffRates(null)
    setSelectedRoleKey('')
    setMultiplier(1)
  }

  const handleConfirmAction = async () => {
    if (!selectedRequest || !action) return

    setIsSubmitting(true)
    try {
      // 1. Tạo payload cơ bản
      const payload = {
        status: action === 'approve' ? 'approved' : 'rejected',
        notes: notes || null,
      }

      // 2. Nếu là Duyệt (approve), bổ sung thêm thông tin rate
      if (action === 'approve') {
        if (!selectedRoleKey) {
          toast.error('Vui lòng chọn mức thù lao áp dụng.')
          setIsSubmitting(false)
          return
        }
        // --- THÊM CÁC DÒNG NÀY ---
        payload.approvedRoleKey = selectedRoleKey
        payload.approvedMultiplier = parseFloat(multiplier) || 1 // Mặc định là 1 nếu không nhập
      }

      // 3. Gửi payload đầy đủ đi
      await updateOtRequestStatus(selectedRequest.id, payload)

      toast.success(`Đã ${action === 'approve' ? 'phê duyệt' : 'từ chối'} yêu cầu OT thành công!`)
      closeModal()
      fetchPendingRequests()
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatSchedules = (schedules) => {
    if (!schedules || schedules.length === 0) {
      return <small className="text-muted">Không có lịch</small>
    }
    return schedules.map((sch) => {
      if (sch.classSession) {
        return (
          <div key={sch.id} className="mb-1">
            <CBadge color="primary">{sch.roleKey}</CBadge>
            <span className="ms-1">
              {sch.classSession.class?.className || 'Lớp học'} ({sch.classSession.startTime})
            </span>
          </div>
        )
      } else if (sch.shift) {
        return (
          <div key={sch.id} className="mb-1">
            <CBadge color="success">{sch.roleKey || 'part-time'}</CBadge>
            <span className="ms-1">
              {sch.shift.name} ({sch.shift.startTime} - {sch.shift.endTime})
            </span>
          </div>
        )
      }
      return null
    })
  }

  // --- THÊM HÀM HELPER MỚI: Hiển thị giờ In/Out ---
  const formatCheckInOut = (attendances) => {
    if (!attendances || attendances.length === 0) {
      return 'N/A'
    }
    const firstCheckIn = attendances.find((a) => a.type === 'check-in')
    const lastCheckOut = [...attendances].reverse().find((a) => a.type === 'check-out')

    const inTime = firstCheckIn ? formatTime(firstCheckIn.timestamp) : '??:??'
    const outTime = lastCheckOut ? formatTime(lastCheckOut.timestamp) : '??:??'

    return `${inTime} - ${outTime}`
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Phê duyệt Yêu cầu Làm thêm giờ (OT)</strong>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner />
            ) : (
              <CTable hover responsive bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nhân viên</CTableHeaderCell>
                    <CTableHeaderCell>Ngày</CTableHeaderCell>
                    <CTableHeaderCell>Giờ làm (In-Out)</CTableHeaderCell>
                    <CTableHeaderCell>Lịch trình trong ngày</CTableHeaderCell>
                    <CTableHeaderCell>Thời gian OT (Phát hiện)</CTableHeaderCell>
                    <CTableHeaderCell>Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {requests.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan="4" className="text-center text-muted">
                        Không có yêu cầu OT nào đang chờ duyệt.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                  {requests.map((req) => (
                    <CTableRow key={req.id}>
                      <CTableDataCell>{req.staff?.fullName || 'N/A'}</CTableDataCell>
                      <CTableDataCell>
                        {DateTime.fromISO(req.date).toFormat('dd/MM/yyyy')}
                      </CTableDataCell>
                      <CTableDataCell>{formatCheckInOut(req.attendances)}</CTableDataCell>
                      <CTableDataCell>{formatSchedules(req.schedules)}</CTableDataCell>
                      <CTableDataCell>{formatDurationObj(req.detectedDuration)}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="success"
                          className="me-2"
                          onClick={() => openModal(req, 'approve')}
                        >
                          <CIcon icon={cilCheckCircle} className="me-1" /> Duyệt
                        </CButton>
                        <CButton size="sm" color="danger" onClick={() => openModal(req, 'reject')}>
                          <CIcon icon={cilXCircle} className="me-1" /> Từ chối
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal Xác nhận Phê duyệt/Từ chối */}
      <CModal visible={!!selectedRequest} onClose={closeModal} alignment="center">
        <CModalHeader>
          <CModalTitle>{action === 'approve' ? 'Phê duyệt' : 'Từ chối'} Yêu cầu OT</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Nhân viên: <strong>{selectedRequest?.staff?.fullName}</strong>
            <br />
            Ngày:{' '}
            <strong>
              {selectedRequest ? DateTime.fromISO(selectedRequest.date).toFormat('dd/MM/yyyy') : ''}
            </strong>
          </p>
          <hr />
          {/* --- THÊM DỮ LIỆU MỚI VÀO MODAL --- */}
          Giờ làm thực tế: <strong>{formatCheckInOut(selectedRequest?.attendances)}</strong>
          <br />
          Lịch trình trong ngày:
          <div className="ps-3 mt-2 mb-2">{formatSchedules(selectedRequest?.schedules)}</div>
          Thời gian OT phát hiện:{' '}
          <strong>{formatDurationObj(selectedRequest?.detectedDuration)}</strong>
          <hr />
          <p>
            Bạn có chắc chắn muốn <strong>{action === 'approve' ? 'phê duyệt' : 'từ chối'}</strong>{' '}
            yêu cầu này không?
          </p>
          {action === 'approve' &&
            (loadingModalData ? (
              <CSpinner />
            ) : (
              <>
                <hr />
                <div className="mb-3">
                  <CFormLabel htmlFor="approvedRoleKey">Áp dụng Mức thù lao</CFormLabel>
                  <CFormSelect
                    id="approvedRoleKey"
                    value={selectedRoleKey}
                    onChange={(e) => setSelectedRoleKey(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn Rate Cơ sở --</option>
                    {/* Lặp qua các key của object rates */}
                    {staffRates && Object.keys(staffRates).length > 0 ? (
                      Object.entries(staffRates).map(([key, rate]) => (
                        <option key={key} value={key}>
                          {key} ({parseInt(rate).toLocaleString('vi-VN')} VNĐ/giờ)
                        </option>
                      ))
                    ) : (
                      <option disabled>Nhân viên này không có rate.</option>
                    )}
                  </CFormSelect>
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="multiplier">Hệ số nhân (Mặc định: 1)</CFormLabel>
                  <CFormInput
                    id="multiplier"
                    type="number"
                    step="0.1"
                    min="1"
                    value={multiplier}
                    onChange={(e) => setMultiplier(e.target.value)}
                  />
                </div>
              </>
            ))}
          <div className="mt-3">
            <CFormLabel htmlFor="notes">Ghi chú (tùy chọn)</CFormLabel>
            <CFormTextarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal} disabled={isSubmitting}>
            Hủy
          </CButton>
          <CButton
            color={action === 'approve' ? 'success' : 'danger'}
            onClick={handleConfirmAction}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CSpinner size="sm" />
            ) : action === 'approve' ? (
              'Xác nhận Duyệt'
            ) : (
              'Xác nhận Từ chối'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default OtRequestsPage
