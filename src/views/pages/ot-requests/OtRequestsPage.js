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
  CFormSelect,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilXCircle, cilPlus, cilTrash, cilPencil } from '@coreui/icons'
import { toast } from 'react-toastify'
import { DateTime } from 'luxon'
import { getOtRequests, updateOtRequestStatus } from '../../../services/otRequest.service' // Đảm bảo đường dẫn đúng
import { getStaffDetails, getAllStaff } from '../../../services/staff.service'

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'

// --- HELPER FUNCTIONS ---

// Format hiển thị Duration (Hỗ trợ cả object đơn và mảng breakdown)
const formatDurationObj = (duration) => {
  if (!duration) return 'N/A'

  // 1. Nếu là mảng breakdown (từ backend trả về)
  if (Array.isArray(duration)) {
    return duration.map((d) => `${d.role}: ${d.duration} (x${d.multiplier})`).join(', ')
  }

  // 2. Nếu là object interval { hours, minutes }
  if (typeof duration === 'object') {
    const { hours = 0, minutes = 0 } = duration
    // Chỉ hiển thị số > 0 cho gọn
    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}p`)
    return parts.join(' ') || '0p'
  }

  // 3. Xử lý string ISO (fallback)
  try {
    const parts = duration.split(':')
    const hours = parseInt(parts[0] || '0', 10)
    const minutes = parseInt(parts[1] || '0', 10)

    const displayParts = []
    if (hours > 0) displayParts.push(`${hours}h`)
    if (minutes > 0) displayParts.push(`${minutes}p`)
    return displayParts.join(' ') || '0p'
  } catch (e) {
    return 'Lỗi định dạng'
  }
}

const formatTime = (isoString) => {
  if (!isoString) return 'N/A'
  return DateTime.fromISO(isoString).setZone(VN_TIMEZONE).toFormat('HH:mm:ss')
}

// Hàm helper để tách giờ/phút từ dữ liệu gốc
const parseDurationToNumbers = (isoDurationString) => {
  let h = 0
  let m = 0
  if (!isoDurationString) return { h, m }

  if (typeof isoDurationString === 'object') {
    h = isoDurationString.hours || 0
    m = isoDurationString.minutes || 0
    return { h, m }
  }

  try {
    if (typeof isoDurationString === 'string' && isoDurationString.includes(':')) {
      const parts = isoDurationString.split(':')
      h = parseInt(parts[0], 10) || 0
      m = parseInt(parts[1], 10) || 0
    }
  } catch (e) {}

  return { h, m }
}

const OtRequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [action, setAction] = useState(null) // 'approve', 'reject', 'edit'
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data modal
  const [staffRates, setStaffRates] = useState(null)
  const [loadingModalData, setLoadingModalData] = useState(false)

  // Filter
  const [staffList, setStaffList] = useState([])
  const [filterStaffId, setFilterStaffId] = useState('')

  // --- STATE MỚI CHO SPLIT OT ---
  // Thay vì manualHours/Minutes lẻ, dùng mảng object
  const [otItems, setOtItems] = useState([{ role: '', hours: 0, minutes: 0, multiplier: 1 }])

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await getAllStaff()
        setStaffList(data)
      } catch (e) {
        console.error('Lỗi tải danh sách nhân viên', e)
      }
    }
    fetchStaff()
  }, [])

  const fetchPendingRequests = async () => {
    setLoading(true)
    try {
      // Nếu muốn xem cả approved để sửa thì có thể cần sửa tham số này hoặc tạo tab
      // Ở đây giả sử 'pending' trả về cả pending và approved gần đây hoặc API hỗ trợ filter status
      const data = await getOtRequests('pending', filterStaffId || null)
      setRequests(data)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách yêu cầu OT.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingRequests()
  }, [filterStaffId])

  // Tính tổng phút đang nhập trong modal để đối chiếu
  const calculateTotalMinutes = () => {
    return otItems.reduce((acc, item) => acc + item.hours * 60 + item.minutes, 0)
  }

  const openModal = async (request, selectedAction) => {
    setSelectedRequest(request)
    setAction(selectedAction)
    setNotes(request.notes || '')

    // Reset form về mặc định
    setOtItems([{ role: '', hours: 0, minutes: 0, multiplier: 1}])

    if (selectedAction === 'approve' || selectedAction === 'edit') {
      setLoadingModalData(true)
      try {
        // 1. Tải rates
        const staffDetails = await getStaffDetails(request.staffId)
        setStaffRates(staffDetails.rates || {})

        // 2. Fill dữ liệu vào Form
        // Nếu request đã có breakdown (tức là đã duyệt và đang sửa lại), load breakdown đó
        if (request.breakdown && Array.isArray(request.breakdown) && request.breakdown.length > 0) {
          const items = request.breakdown.map((b) => {
            const { h, m } = parseDurationToNumbers(b.duration)
            return {
              role: b.role,
              hours: h,
              minutes: m,
              multiplier: b.multiplier || 1,
            }
          })
          setOtItems(items)
        } else {
          // Nếu chưa có breakdown (mới detected), lấy detectedDuration làm dòng mặc định
          const { h, m } = parseDurationToNumbers(request.detectedDuration)
          setOtItems([
            { role: '', hours: h, minutes: m, multiplier: 1 }, // Default multiplier
          ])
        }
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
    setOtItems([{ role: '', hours: 0, minutes: 0, multiplier: 1 }])
  }

  // --- CÁC HÀM QUẢN LÝ DYNAMIC LIST ---
  const updateOtItem = (index, field, value) => {
    const newItems = [...otItems]
    newItems[index][field] = value
    setOtItems(newItems)
  }

  const addOtItem = () => {
    setOtItems([...otItems, { role: '', hours: 0, minutes: 0, multiplier: 1 }])
  }

  const removeOtItem = (index) => {
    if (otItems.length > 1) {
      const newItems = otItems.filter((_, i) => i !== index)
      setOtItems(newItems)
    }
  }
  // ------------------------------------

  const handleConfirmAction = async () => {
    if (!selectedRequest || !action) return

    setIsSubmitting(true)
    try {
      const payload = {
        status: action === 'reject' ? 'rejected' : 'approved',
        notes: notes || null,
      }

      if (action === 'approve' || action === 'edit') {
        // Validate: Role bắt buộc cho mọi dòng
        if (otItems.some((item) => !item.role)) {
          toast.error('Vui lòng chọn mức thù lao (Rate) cho tất cả các dòng.')
          setIsSubmitting(false)
          return
        }

        // Tạo mảng breakdown gửi về server
        const breakdown = otItems.map((item) => ({
          role: item.role,
          duration: `${String(item.hours).padStart(2, '0')}:${String(item.minutes).padStart(2, '0')}`,
          multiplier: parseFloat(item.multiplier) || 1,
        }))

        payload.breakdown = breakdown

        // Các trường flat (cho tương thích ngược / hiển thị đơn giản)
        // Lấy dòng đầu tiên làm đại diện
        payload.approvedRoleKey = breakdown[0].role
        payload.approvedMultiplier = breakdown[0].multiplier
        payload.approvedDuration = breakdown[0].duration
      }

      await updateOtRequestStatus(selectedRequest.id, payload)

      toast.success(`Thao tác thành công!`)
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

  // Helper render chi tiết OT trong bảng
  const renderOtDetailsInTable = (request) => {
    // Nếu đã duyệt và có breakdown, hiển thị chi tiết
    if (request.status === 'approved' && request.breakdown && request.breakdown.length > 0) {
      return (
        <div>
          {request.breakdown.map((b, idx) => (
            <div key={idx} style={{ fontSize: '0.85em', marginBottom: '2px' }}>
              <CBadge color="info" shape="rounded-pill" className="me-1">
                {b.role}
              </CBadge>
              {b.duration} <span className="text-muted small">(x{b.multiplier})</span>
            </div>
          ))}
        </div>
      )
    }
    // Mặc định hiện detected hoặc approved duration cũ
    return formatDurationObj(
      request.status === 'approved' ? request.approvedDuration : request.detectedDuration,
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Phê duyệt Yêu cầu Làm thêm giờ (OT)</strong>
              </div>
              <div style={{ width: '300px' }}>
                <CFormSelect
                  size="sm"
                  value={filterStaffId}
                  onChange={(e) => setFilterStaffId(e.target.value)}
                >
                  <option value="">-- Tất cả nhân viên --</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName} ({staff.email})
                    </option>
                  ))}
                </CFormSelect>
              </div>
            </div>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center">
                <CSpinner />
              </div>
            ) : (
              <CTable hover responsive bordered align="middle">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nhân viên</CTableHeaderCell>
                    <CTableHeaderCell>Ngày</CTableHeaderCell>
                    <CTableHeaderCell>Giờ làm (In-Out)</CTableHeaderCell>
                    <CTableHeaderCell>Ca phân công</CTableHeaderCell>
                    <CTableHeaderCell>Thời gian OT</CTableHeaderCell>
                    <CTableHeaderCell>Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {requests.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center text-muted">
                        Không có yêu cầu OT nào.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                  {requests.map((req) => (
                    <CTableRow key={req.id}>
                      <CTableDataCell>
                        <div className="fw-bold">{req.staff?.fullName || 'N/A'}</div>
                        <small className="text-muted">{req.staff?.email}</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        {DateTime.fromISO(req.date).toFormat('dd/MM/yyyy')}
                      </CTableDataCell>
                      <CTableDataCell>{formatCheckInOut(req.attendances)}</CTableDataCell>
                      <CTableDataCell>{formatSchedules(req.schedules)}</CTableDataCell>

                      {/* Cột hiển thị OT chi tiết */}
                      <CTableDataCell>{renderOtDetailsInTable(req)}</CTableDataCell>

                      <CTableDataCell>
                        {req.status === 'pending' ? (
                          <>
                            <CTooltip content="Duyệt">
                              <CButton
                                size="sm"
                                color="success"
                                className="me-2 text-white"
                                onClick={() => openModal(req, 'approve')}
                              >
                                <CIcon icon={cilCheckCircle} />
                              </CButton>
                            </CTooltip>
                            <CTooltip content="Từ chối">
                              <CButton
                                size="sm"
                                color="danger"
                                className="text-white"
                                onClick={() => openModal(req, 'reject')}
                              >
                                <CIcon icon={cilXCircle} />
                              </CButton>
                            </CTooltip>
                          </>
                        ) : (
                          // Nếu đã duyệt rồi, cho phép sửa lại
                          req.status === 'approved' && (
                            <CTooltip content="Chỉnh sửa">
                              <CButton
                                size="sm"
                                color="warning"
                                className="text-white"
                                onClick={() => openModal(req, 'edit')}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                            </CTooltip>
                          )
                        )}
                        {req.status === 'rejected' && <CBadge color="danger">Đã từ chối</CBadge>}
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
      <CModal visible={!!selectedRequest} onClose={closeModal} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>
            {action === 'reject' ? 'Từ chối OT' : 'Phê duyệt OT (Chi tiết)'}
          </CModalTitle>
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
          Giờ làm thực tế: <strong>{formatCheckInOut(selectedRequest?.attendances)}</strong>
          <br />
          OT Hệ thống phát hiện:{' '}
          <strong className="text-primary">
            {formatDurationObj(selectedRequest?.detectedDuration)}
          </strong>
          {(action === 'approve' || action === 'edit') &&
            (loadingModalData ? (
              <div className="text-center py-3">
                <CSpinner />
              </div>
            ) : (
              <div className="bg-light p-3 rounded border mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <CFormLabel className="fw-bold text-primary mb-0">
                    Chi tiết Duyệt (Split OT)
                  </CFormLabel>
                  <small className="text-dark fw-bold">
                    Tổng: {Math.floor(calculateTotalMinutes() / 60)}h {calculateTotalMinutes() % 60}
                    p
                  </small>
                </div>

                {/* --- DANH SÁCH DÒNG OT --- */}
                {otItems.map((item, index) => (
                  <div key={index} className="p-2 mb-2 bg-white border rounded shadow-sm">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="fw-bold text-muted">Phần #{index + 1}</small>
                      {otItems.length > 1 && (
                        <CButton
                          color="danger"
                          size="sm"
                          variant="ghost"
                          className="py-0"
                          onClick={() => removeOtItem(index)}
                        >
                          <CIcon icon={cilTrash} size="sm" />
                        </CButton>
                      )}
                    </div>

                    <CRow className="g-2">
                      {/* Cột 1: Chọn Rate */}
                      <CCol md={5}>
                        <CFormSelect
                          size="sm"
                          value={item.role}
                          onChange={(e) => updateOtItem(index, 'role', e.target.value)}
                        >
                          <option value="">-- Chọn Rate --</option>
                          {staffRates &&
                            Object.entries(staffRates).map(([key, rate]) => (
                              <option key={key} value={key}>
                                {key} ({parseInt(rate).toLocaleString('vi-VN')} đ)
                              </option>
                            ))}
                        </CFormSelect>
                      </CCol>

                      {/* Cột 2: Thời gian */}
                      <CCol md={4}>
                        <CInputGroup size="sm">
                          <CFormInput
                            type="number"
                            min="0"
                            placeholder="Giờ"
                            value={item.hours}
                            onChange={(e) =>
                              updateOtItem(
                                index,
                                'hours',
                                Math.max(0, parseInt(e.target.value) || 0),
                              )
                            }
                          />
                          <CInputGroupText className="px-1">:</CInputGroupText>
                          <CFormInput
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Phút"
                            value={item.minutes}
                            onChange={(e) =>
                              updateOtItem(
                                index,
                                'minutes',
                                Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
                              )
                            }
                          />
                        </CInputGroup>
                      </CCol>

                      {/* Cột 3: Hệ số */}
                      <CCol md={3}>
                        <CInputGroup size="sm">
                          <CInputGroupText className="px-1">x</CInputGroupText>
                          <CFormInput
                            type="number"
                            step="0.1"
                            placeholder="Hệ số"
                            value={item.multiplier}
                            onChange={(e) => updateOtItem(index, 'multiplier', e.target.value)}
                          />
                        </CInputGroup>
                      </CCol>
                    </CRow>
                  </div>
                ))}

                <CButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  className="w-100 mt-2"
                  onClick={addOtItem}
                >
                  <CIcon icon={cilPlus} className="me-1" /> Thêm phần OT khác
                </CButton>
              </div>
            ))}
          <div className="mt-3">
            <CFormLabel htmlFor="notes">Ghi chú (tùy chọn)</CFormLabel>
            <CFormTextarea
              id="notes"
              rows={2}
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
            color={action === 'reject' ? 'danger' : 'success'}
            onClick={handleConfirmAction}
            disabled={isSubmitting}
            className="text-white"
          >
            {isSubmitting ? (
              <CSpinner size="sm" />
            ) : action === 'reject' ? (
              'Xác nhận Từ chối'
            ) : (
              'Xác nhận Duyệt'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default OtRequestsPage
