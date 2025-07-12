// src/views/pages/student-report/StudentReportPage.js
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { getAllClasses } from '../../../services/class.service'
import { getStudentReports, deleteStudentReport } from '../../../services/student-report.service'
import UploadReportModal from '../../../components/students/UploadReportModal'
import { QRCodeCanvas } from 'qrcode.react'
import { useRef } from 'react'

const StudentReportsPage = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [classes, setClasses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [qrData, setQrData] = useState(null)

  const qrRef = useRef(null)

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

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return alert('Không tìm thấy mã QR')

    const pngUrl = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    const studentName = qrData?.student?.fullName?.replace(/\s+/g, '_') || 'student'
    downloadLink.href = pngUrl
    downloadLink.download = `${studentName}_qr-code.png`
    downloadLink.click()
  }

  // Sắp xếp danh sách báo cáo theo id tăng dần
  const sortedReports = [...reports].sort((a, b) => a.id - b.id)

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
                  <CTableHeaderCell>Link chia sẻ</CTableHeaderCell>
                  <CTableHeaderCell>Thao tác</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {sortedReports.map((report) => (
                  <CTableRow key={report.id}>
                    <CTableDataCell>{report.id}</CTableDataCell>
                    <CTableDataCell>{report.student?.fullName}</CTableDataCell>
                    <CTableDataCell>{report.class?.className}</CTableDataCell>
                    <CTableDataCell>
                      {report.files?.map((file, idx) => (
                        <div key={idx}>
                          <a href={file.fileUrl} target="_blank" rel="noreferrer">
                            PDF {idx + 1}
                          </a>
                        </div>
                      ))}
                    </CTableDataCell>

                    <CTableDataCell>
                      {report.accessToken ? (
                        <a
                          href={`https://codespace.edu.vn/student-reports/${report.accessToken}`}
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
                      <CButton
                        color="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setEditData(report)
                          setShowModal(true)
                        }}
                      >
                        Sửa
                      </CButton>

                      <CButton
                        color="info"
                        size="sm"
                        className="me-2"
                        onClick={() =>
                          report.accessToken &&
                          setQrData(
                            `https://codespace.edu.vn/student-reports/${report.accessToken}`,
                          )
                        }
                      >
                        QR
                      </CButton>

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
        onClose={() => {
          setShowModal(false)
          setEditData(null)
        }}
        onSuccess={fetchReports}
        initialData={editData}
      />
      <CModal visible={!!qrData} onClose={() => setQrData(null)}>
        <CModalHeader>
          <CModalTitle>Mã QR chia sẻ</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center" ref={qrRef}>
          {qrData && (
            <>
              <QRCodeCanvas value={qrData} size={256} />
              <p className="mt-3">
                <a href={qrData} target="_blank" rel="noreferrer">
                  {qrData}
                </a>
              </p>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setQrData(null)}>
            Đóng
          </CButton>
          <CButton color="primary" onClick={downloadQR}>
            Tải mã QR
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default StudentReportsPage
