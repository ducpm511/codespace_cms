import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormCheck,
  CAlert,
  CSpinner,
} from '@coreui/react'
import { toast } from 'react-toastify'
import {
  getStudentSessionsForAttendance,
  manualAttendance,
} from '../../services/attendance.service'

const AttendanceModal = ({ visible, onClose, student }) => {
  const [sessions, setSessions] = useState([])
  const [selectedSessionIds, setSelectedSessionIds] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Chỉ fetch dữ liệu khi modal được mở và có thông tin học sinh
    if (visible && student) {
      const fetchSessions = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const data = await getStudentSessionsForAttendance(student.id)
          setSessions(data)
        } catch (err) {
          setError('Không thể tải danh sách buổi học. Vui lòng thử lại.')
          console.error(err)
        } finally {
          setIsLoading(false)
        }
      }
      fetchSessions()
    } else {
      // Reset state khi modal đóng
      setSessions([])
      setSelectedSessionIds([])
      setError(null)
    }
  }, [visible, student])

  const handleCheckboxChange = (sessionId) => {
    setSelectedSessionIds((prevSelected) => {
      if (prevSelected.includes(sessionId)) {
        return prevSelected.filter((id) => id !== sessionId)
      } else {
        return [...prevSelected, sessionId]
      }
    })
  }

  const handleSubmit = async () => {
    if (selectedSessionIds.length === 0) {
      toast.warn('Vui lòng chọn ít nhất một buổi học để điểm danh.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        studentId: student.id,
        sessionIds: selectedSessionIds,
      }
      await manualAttendance(payload)
      toast.success(`Điểm danh thành công cho học sinh ${student.fullName}!`)
      onClose() // Đóng modal sau khi thành công
    } catch (err) {
      toast.error(err.message || 'Điểm danh thất bại. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!student) {
    return null
  }
  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>Điểm danh cho học sinh: {student?.fullName || ''}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {isLoading && (
          <div className="text-center">
            <CSpinner />
          </div>
        )}
        {error && <CAlert color="danger">{error}</CAlert>}
        {!isLoading && !error && (
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ width: '5%' }}></CTableHeaderCell>
                <CTableHeaderCell>Buổi</CTableHeaderCell>
                <CTableHeaderCell>Ngày học</CTableHeaderCell>
                <CTableHeaderCell>Thời gian</CTableHeaderCell>
                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {sessions.length > 0 ? (
                sessions.map((session) => {
                  const studentAttendance = session.attendances.find(
                    (att) => att.studentId === student.id,
                  )

                  return (
                    <CTableRow key={session.id}>
                      <CTableDataCell className="text-center">
                        <CFormCheck
                          id={`session-${session.id}`}
                          checked={selectedSessionIds.includes(session.id)}
                          // Vô hiệu hóa checkbox nếu học sinh đã điểm danh cho buổi này
                          disabled={studentAttendance?.status === 'present'}
                          onChange={() => handleCheckboxChange(session.id)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>Buổi {session.sessionNumber}</CTableDataCell>
                      <CTableDataCell>
                        {new Date(session.sessionDate).toLocaleDateString('vi-VN')}
                      </CTableDataCell>
                      <CTableDataCell>{`${session.startTime}`}</CTableDataCell>
                      <CTableDataCell>
                        {/* Sử dụng biến studentAttendance đã tìm được */}
                        {studentAttendance?.status === 'present' ? (
                          <span className="text-success">Đã điểm danh</span>
                        ) : (
                          <span className="text-danger">Chưa điểm danh</span>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="4" className="text-center">
                    Không có buổi học nào cần điểm danh.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Hủy
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={isSubmitting || isLoading}>
          {isSubmitting ? <CSpinner size="sm" /> : 'Lưu điểm danh'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

AttendanceModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.shape({
    id: PropTypes.number,
    fullName: PropTypes.string,
  }),
}

export default AttendanceModal
