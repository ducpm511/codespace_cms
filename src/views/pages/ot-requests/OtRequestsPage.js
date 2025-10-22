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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilXCircle } from '@coreui/icons'
import { toast } from 'react-toastify'
import { DateTime, Duration } from 'luxon' // Import Duration
import { getOtRequests, updateOtRequestStatus } from '../../../services/otRequest.service'

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

const OtRequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [action, setAction] = useState(null) // 'approve' or 'reject'
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const openModal = (request, selectedAction) => {
    setSelectedRequest(request)
    setAction(selectedAction)
    setNotes('') // Reset notes
  }

  const closeModal = () => {
    setSelectedRequest(null)
    setAction(null)
    setNotes('')
  }

  const handleConfirmAction = async () => {
    if (!selectedRequest || !action) return

    setIsSubmitting(true)
    try {
      const payload = {
        status: action === 'approve' ? 'approved' : 'rejected',
        notes: notes || null,
      }
      await updateOtRequestStatus(selectedRequest.id, payload)
      toast.success(`Đã ${action === 'approve' ? 'phê duyệt' : 'từ chối'} yêu cầu OT thành công!`)
      closeModal()
      fetchPendingRequests() // Tải lại danh sách
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra.')
    } finally {
      setIsSubmitting(false)
    }
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
            Bạn có chắc chắn muốn <strong>{action === 'approve' ? 'phê duyệt' : 'từ chối'}</strong>{' '}
            yêu cầu làm thêm giờ của nhân viên <strong>{selectedRequest?.staff?.fullName}</strong>{' '}
            vào ngày{' '}
            <strong>
              {selectedRequest ? DateTime.fromISO(selectedRequest.date).toFormat('dd/MM/yyyy') : ''}
            </strong>{' '}
            với thời gian là <strong>{formatDurationObj(selectedRequest?.detectedDuration)}</strong>
            ?
          </p>
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
