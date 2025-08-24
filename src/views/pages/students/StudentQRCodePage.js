// src/views/pages/students/StudentQRCodePage.js
import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CFormLabel,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { QRCodeCanvas } from 'qrcode.react'
import { cilSearch, cilQrCode } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { getAllStudents } from '../../../services/student.service' // Đảm bảo đường dẫn này đúng

const StudentQRCodePage = () => {
  const [searchStudentTerm, setSearchStudentTerm] = useState('')
  const [filteredStudents, setFilteredStudents] = useState([])
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null) // Học sinh được chọn để tạo QR

  const [allStudents, setAllStudents] = useState([]) // Cache tất cả học sinh để tìm kiếm
  const inputRef = useRef(null) // Ref cho input để xử lý blur

  // Fetch tất cả học sinh một lần để dùng cho search dropdown
  const fetchAllStudents = useCallback(async () => {
    try {
      // Lấy tất cả học sinh (có thể cần một API endpoint riêng để lấy toàn bộ không phân trang)
      // Hiện tại, chúng ta sẽ dùng getAllStudents và lấy hết trang đầu tiên.
      // Hoặc bạn có thể thêm query { limit: 9999 } nếu backend hỗ trợ.
      const response = await getAllStudents({ page: 1, limit: 100 }) // Lấy số lượng lớn
      const studentsArray = Array.isArray(response) ? response : response?.data || []
      setAllStudents(studentsArray)
    } catch (error) {
      console.error('Error fetching all students:', error)
      setAllStudents([]) // Reset nếu có lỗi
      toast.error('Có lỗi khi tải danh sách học sinh.')
    }
  }, [])

  useEffect(() => {
    fetchAllStudents()
  }, [fetchAllStudents])

  // Logic cho Student Search/Dropdown
  const handleStudentSearchChange = (e) => {
    const term = e.target.value
    setSearchStudentTerm(term)
    setSelectedStudent(null) // Reset selection khi người dùng gõ
    if (term.length > 0) {
      const results = allStudents.filter(
        (student) =>
          student.fullName.toLowerCase().includes(term.toLowerCase()) ||
          (student.classCode && student.classCode.toLowerCase().includes(term.toLowerCase())) ||
          String(student.id).includes(term), // Tìm kiếm theo ID học sinh
      )
      setFilteredStudents(results)
    } else {
      setFilteredStudents(allStudents) // Hiển thị tất cả khi không có tìm kiếm
    }
    setIsStudentDropdownOpen(true)
  }

  const handleSelectStudent = (student) => {
    console.log('Selected student:', student) // DEBUG LOG
    setSelectedStudent(student)
    setSearchStudentTerm(`${student.fullName} (ID: ${student.id})`) // Hiển thị thông tin đã chọn
    setIsStudentDropdownOpen(false)
  }

  const handleDropdownMouseDown = (e) => {
    e.preventDefault() // Ngăn chặn sự kiện blur của input
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsStudentDropdownOpen(false)
    }, 150)
  }

  // Dữ liệu sẽ được mã hóa vào QR Code
  // Định dạng: student_id:ID của học sinh
  const qrCodeValue = selectedStudent ? `student_id:${selectedStudent.id}` : ''

  const downloadQRCode = () => {
    const canvas = document.getElementById('student-qrcode-canvas')
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `${selectedStudent.fullName}_QRCode.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } else {
      toast.error('Không tìm thấy QR Code để tải xuống.')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Tạo Mã QR Code cho Học Sinh</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="studentSearch">Tìm kiếm Học Sinh</CFormLabel>
                <div className="position-relative">
                  <CFormInput
                    type="text"
                    id="studentSearch"
                    placeholder="Nhập tên, mã lớp hoặc ID để tìm kiếm..."
                    value={searchStudentTerm}
                    onChange={handleStudentSearchChange}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    onBlur={handleInputBlur}
                    ref={inputRef}
                  />
                  {isStudentDropdownOpen && filteredStudents.length > 0 && (
                    <CListGroup
                      className="position-absolute w-100 z-index-1000"
                      style={{ maxHeight: '200px', overflowY: 'auto' }}
                      onMouseDown={handleDropdownMouseDown}
                    >
                      {filteredStudents.map((student) => (
                        <CListGroupItem
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          active={selectedStudent && selectedStudent.id === student.id}
                          className="cursor-pointer"
                        >
                          {student.fullName} (ID: {student.id}, Lớp: {student.classCode || 'N/A'})
                        </CListGroupItem>
                      ))}
                    </CListGroup>
                  )}
                </div>
              </CCol>
            </CRow>

            {selectedStudent && (
              <CCard className="mt-4">
                <CCardHeader>
                  <strong>Thông tin Học Sinh và QR Code</strong>
                </CCardHeader>
                <CCardBody className="text-center">
                  <h5>Học sinh: {selectedStudent.fullName}</h5>
                  <p>Mã HS: {selectedStudent.id}</p>
                  <p>
                    Ngày sinh: {new Date(selectedStudent.dateOfBirth).toLocaleDateString('vi-VN')}
                  </p>
                  <p>Giới tính: {selectedStudent.gender}</p>
                  <div>
                    Lớp:
                    {Array.isArray(selectedStudent.classes) &&
                    selectedStudent.classes.length > 0 ? (
                      <ul style={{ listStyle: 'inside', paddingLeft: 0 }}>
                        {selectedStudent.classes.map((cls, idx) => (
                          <li key={cls.id || idx}>
                            {cls.name || cls.className || cls.classCode || 'Tên lớp không xác định'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span> Không có dữ liệu lớp học.</span>
                    )}
                  </div>
                  <p>Phụ huynh: {selectedStudent.parent?.fullName || 'N/A'}</p>

                  <div className="mt-4">
                    <h6>Mã QR Code:</h6>
                    <div
                      style={{
                        padding: '10px',
                        display: 'inline-block',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                      }}
                    >
                      <QRCodeCanvas
                        id="student-qrcode-canvas" // ID để tải xuống
                        value={qrCodeValue}
                        size={256}
                        level="H" // Mức độ sửa lỗi cao
                        includeMargin={true}
                      />
                    </div>
                    <div className="mt-3">
                      <CButton color="primary" onClick={downloadQRCode}>
                        <CIcon icon={cilQrCode} className="me-2" />
                        Tải xuống QR Code
                      </CButton>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            )}

            {!selectedStudent && searchStudentTerm.length > 0 && filteredStudents.length === 0 && (
              <div className="mt-3 text-center text-muted">
                Không tìm thấy học sinh nào phù hợp với "{searchStudentTerm}".
              </div>
            )}
            {!selectedStudent && searchStudentTerm.length === 0 && (
              <div className="mt-3 text-center text-muted">
                Vui lòng tìm kiếm và chọn một học sinh để tạo QR Code.
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentQRCodePage
