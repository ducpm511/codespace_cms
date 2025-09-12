import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil } from '@coreui/icons'
import apiClient from '../../../utils/apiClient'
import { useParams } from 'react-router-dom'
import EditSessionModal from '../../../components/classSessions/EditSessionModal'

const ClassSessionPage = () => {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const { classId } = useParams()

  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

  useEffect(() => {
    fetchAttendanceMatrix()
  }, [classId])

  const fetchAttendanceMatrix = async () => {
    setLoading(true)
    try {
      const data = await apiClient(`/classes/${classId}/attendance-matrix`)
      console.log('Attendance Matrix Data:', data)
      setStudents(data.students)
      setSessions(data.sessions)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu điểm danh:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEditModal = (session) => {
    setSelectedSession(session)
    setIsEditModalVisible(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false)
    setSelectedSession(null)
  }

  const handleSessionUpdated = () => {
    handleCloseEditModal()
    // Tải lại dữ liệu ma trận sau khi cập nhật thành công
    fetchAttendanceMatrix()
  }

  const isStudentPresent = (studentId, session) => {
    return session.attendances.some((a) => a.studentId === studentId && a.status === 'present')
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Danh sách điểm danh</strong>
          <CButton color="primary" onClick={() => alert('TODO: Mở modal chỉnh sửa buổi học')}>
            Chỉnh sửa buổi học
          </CButton>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center">
              <CSpinner />
            </div>
          ) : (
            <CTable bordered hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col" style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>
                    Học sinh
                  </CTableHeaderCell>
                  {sessions.map((session) => (
                    <CTableHeaderCell key={session.id}>
                      Buổi {session.sessionNumber}
                      <br />
                      <small>{new Date(session.sessionDate).toLocaleDateString('vi-VN')}</small>
                      <CButton
                        size="sm"
                        color="light"
                        className="ms-2 border-0"
                        onClick={() => handleOpenEditModal(session)}
                        title="Chỉnh sửa buổi học"
                      >
                        <CIcon icon={cilPencil} size="sm" />
                      </CButton>
                    </CTableHeaderCell>
                  ))}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {students.map((student) => (
                  <CTableRow key={student.id}>
                    <CTableHeaderCell style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>
                      {student.fullName}
                    </CTableHeaderCell>
                    {sessions.map((session) => (
                      <CTableDataCell key={session.id} className="text-center">
                        {isStudentPresent(student.id, session) ? '✅' : ''}
                      </CTableDataCell>
                    ))}
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
      {selectedSession && (
        <EditSessionModal
          visible={isEditModalVisible}
          onClose={handleCloseEditModal}
          session={selectedSession}
          onSuccess={handleSessionUpdated}
        />
      )}
    </>
  )
}

export default ClassSessionPage
