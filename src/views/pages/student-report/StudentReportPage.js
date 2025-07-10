import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import { getAllClasses } from '../../../services/class.service'
import { getStudentReports, deleteStudentReport } from '../../../services/student-report.service'
import UploadReportModal from '../../../components/students/UploadReportModal'

const StudentReportsPage = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [classes, setClasses] = useState([])
  const [showModal, setShowModal] = useState(false)

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await getStudentReports({ search, classId: selectedClassId })
      setReports(res.data || [])
    } catch (error) {
      console.error('Lỗi khi tải báo cáo:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getAllClasses()
        setClasses(data)
      } catch (error) {
        console.error('Lỗi khi tải lớp học:', error)
      }
    }
    fetchClasses()
    fetchReports()
  }, [])

  useEffect(() => {
    fetchReports()
  }, [search, selectedClassId])

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá báo cáo này?')) return
    try {
      await deleteStudentReport(id)
      fetchReports()
    } catch (error) {
      console.error('Lỗi khi xoá báo cáo:', error)
    }
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Danh sách báo cáo học sinh</strong>
          <CButton color="primary" onClick={() => setShowModal(true)}>
            + Tạo báo cáo
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex mb-3 gap-3">
            <CFormInput
              placeholder="Tìm theo tên học sinh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <CFormSelect
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">Tất cả lớp</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className}
                </option>
              ))}
            </CFormSelect>
          </div>

          {loading ? (
            <CSpinner />
          ) : (
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Học sinh</CTableHeaderCell>
                  <CTableHeaderCell>Lớp</CTableHeaderCell>
                  <CTableHeaderCell>File PDF</CTableHeaderCell>
                  <CTableHeaderCell>Link YouTube</CTableHeaderCell>
                  <CTableHeaderCell>Mã nhúng Scratch</CTableHeaderCell>
                  <CTableHeaderCell>Link chia sẻ</CTableHeaderCell>
                  <CTableHeaderCell>Thao tác</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {reports.map((report) => (
                  <CTableRow key={report.id}>
                    <CTableDataCell>{report.id}</CTableDataCell>
                    <CTableDataCell>{report.student?.fullName}</CTableDataCell>
                    <CTableDataCell>{report.class?.className}</CTableDataCell>
                    <CTableDataCell>
                      {report.pdfUrls?.map((url, idx) => (
                        <div key={idx}>
                          <a href={url} target="_blank" rel="noreferrer">
                            PDF {idx + 1}
                          </a>
                        </div>
                      ))}
                    </CTableDataCell>
                    <CTableDataCell>
                      {report.youtubeLinks?.map((url, idx) => (
                        <div key={idx}>
                          <a href={url} target="_blank" rel="noreferrer">
                            YouTube {idx + 1}
                          </a>
                        </div>
                      ))}
                    </CTableDataCell>
                    <CTableDataCell>
                      {report.scratchEmbeds?.map((embed, idx) => (
                        <div key={idx}>{embed}</div>
                      ))}
                    </CTableDataCell>
                    <CTableDataCell>
                      {report.accessToken ? (
                        <a
                          href={`http://localhost:3001/student-reports/${report.accessToken}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Xem
                        </a>
                      ) : (
                        '—'
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton color="danger" size="sm" onClick={() => handleDelete(report.id)}>
                        Xoá
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <UploadReportModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchReports}
      />
    </>
  )
}

export default StudentReportsPage
