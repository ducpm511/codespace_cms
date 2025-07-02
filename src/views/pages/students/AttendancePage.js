// src/views/pages/attendance/AttendancePage.js
import React, { useState, useEffect, useCallback } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAlert,
  CSpinner,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import { toast } from 'react-toastify'
import QrScanner from 'react-qr-barcode-scanner'
import apiClient from '../../../utils/apiClient'
import CIcon from '@coreui/icons-react'
import { cilQrCode } from '@coreui/icons'

const AttendancePage = () => {
  const [scanResult, setScanResult] = useState('')
  const [attendanceStatus, setAttendanceStatus] = useState(null) // { success: boolean, message: string, studentName?: string, attendanceTime?: string, isExisting: boolean }
  const [isScanning, setIsScanning] = useState(true)
  const [processingScan, setProcessingScan] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [attendanceData, setAttendanceData] = useState(null)

  // useEffect để reset trạng thái sau khi hiển thị kết quả
  useEffect(() => {
    let timer
    if (attendanceStatus) {
      // Đã có kết quả điểm danh (thành công hoặc từ bản ghi cũ)
      setIsScanning(false) // Tạm dừng quét
      timer = setTimeout(() => {
        setScanResult('')
        setAttendanceStatus(null)
        setCameraError(null)
        setIsScanning(true) // Bắt đầu quét lại
      }, 5000) // Vẫn 5 giây cho thành công/hiển thị lại
    }
    return () => clearTimeout(timer)
  }, [attendanceStatus])

  // Xử lý kết quả quét từ QrScanner
  const handleScanResult = useCallback(
    async (resultData) => {
      if (processingScan || !isScanning || !resultData || resultData.text === scanResult) {
        return
      }

      setProcessingScan(true)
      setScanResult(resultData.text)

      try {
        const response = await apiClient('/attendances/qr-scan', {
          method: 'POST',
          body: JSON.stringify({ qrCodeData: resultData.text }),
        })

        setAttendanceData(response) // Lưu toàn bộ response vào state
        const studentName = response.attendance.student?.fullName || 'Không xác định'
        const attendanceTime = new Date(response.attendance.attendanceTime).toLocaleTimeString(
          'vi-VN',
        )
        toast.success(`Đã điểm danh cho ${studentName} vào lúc ${attendanceTime}.`)

        // setAttendanceStatus({
        //   success: true, // Luôn là true vì backend không ném lỗi Conflict
        //   message: `Học sinh ${response.student.fullName} đã điểm danh vào lúc ${new Date(response.attendanceTime).toLocaleTimeString('vi-VN')}.`,
        //   studentName: response.student.fullName,
        //   attendanceTime: new Date(response.attendanceTime).toLocaleTimeString('vi-VN'),
        //   // Bạn có thể thêm isExisting: true/false từ backend để tùy chỉnh thông báo
        //   // Ví dụ: `response.isNew ? 'Điểm danh thành công!' : 'Học sinh đã điểm danh hôm nay!'`
        // })

        // toast.success(`Đã điểm danh cho ${response.student.fullName}!`)
      } catch (err) {
        console.error('Lỗi khi điểm danh (API):', err)
        const errorMessage = err.message || 'Có lỗi xảy ra khi điểm danh.'
        setAttendanceData(null) // Reset nếu có lỗi
        setScanResult('') // Reset scanResult để có thể quét lại ngay lập tức nếu muốn
        // Không setCameraError ở đây nữa, chỉ hiển thị toast
        toast.error(errorMessage)
      } finally {
        setProcessingScan(false)
      }
    },
    [isScanning, processingScan, scanResult],
  )

  // ... (handleScanError và phần còn lại của JSX không thay đổi nhiều) ...
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Điểm danh bằng QR Code</strong>
          </CCardHeader>
          <CCardBody className="text-center">
            <p className="lead">Di chuyển mã QR của học sinh vào khung quét.</p>
            <div style={{ width: '100%', maxWidth: '400px', margin: 'auto', position: 'relative' }}>
              {/* Camera luôn được bật khi isScanning là true */}
              {isScanning ? (
                <QrScanner
                  onUpdate={(err, result) => {
                    if (result) {
                      handleScanResult(result)
                    }
                    // if (err) { handleScanError(err); } // Loại bỏ gọi handleScanError
                  }}
                  facingMode="environment"
                  delay={300} // Độ trễ giữa các lần quét
                  style={{ width: '100%', height: 'auto', maxWidth: 400 }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    paddingTop: '75%', // Tỷ lệ khung hình 4:3
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    borderRadius: '8px',
                    flexDirection: 'column',
                    color: '#6c757d',
                  }}
                >
                  {processingScan ? (
                    <>
                      <CSpinner color="primary" />
                      <p className="mt-2 text-muted">Đang xử lý...</p>
                    </>
                  ) : (
                    // Hiển thị thông báo kết quả điểm danh nếu có, hoặc thông báo chờ
                    <p className="text-muted">
                      {attendanceData
                        ? 'Đã hiển thị kết quả. Camera sẽ khởi động lại sau giây lát.'
                        : 'Camera đã tắt. Vui lòng đợi hoặc thử lại.'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Hiển thị thông tin điểm danh và lịch sử */}
            {attendanceData && (
              <CAlert color="success" className="mt-3 text-start">
                <h4 className="alert-heading">Kết quả điểm danh:</h4>
                <p>
                  Học sinh:{' '}
                  <strong>{attendanceData.attendance.student?.fullName || 'Không xác định'}</strong>
                </p>
                <p>
                  Thời gian:{' '}
                  <strong>
                    {new Date(attendanceData.attendance.attendanceTime).toLocaleTimeString('vi-VN')}
                  </strong>
                </p>
                <p>
                  Trạng thái:{' '}
                  <strong>
                    {attendanceData.attendance.status === 'present' ? 'Có mặt' : 'Vắng mặt'}
                  </strong>
                </p>

                {attendanceData.history && attendanceData.history.length > 0 && (
                  <div className="mt-4">
                    <h5>
                      Lịch sử điểm danh của{' '}
                      {attendanceData.attendance.student?.fullName || 'học sinh này'} trong lớp:
                    </h5>
                    <CTable responsive striped hover>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Buổi học số</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Lớp</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Ngày</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Giờ học</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Trạng thái</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Thời gian quét</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {attendanceData.history.map((record, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>{record.sessionNumber}</CTableDataCell>
                            <CTableDataCell>
                              {record.className} ({record.classCode})
                            </CTableDataCell>
                            <CTableDataCell>{record.sessionDate}</CTableDataCell>
                            <CTableDataCell>{record.sessionStartTime}</CTableDataCell>
                            <CTableDataCell>
                              {record.status === 'present'
                                ? 'Có mặt'
                                : record.status === 'absent'
                                  ? 'Vắng mặt'
                                  : record.status}
                            </CTableDataCell>
                            <CTableDataCell>
                              {record.attendanceTime
                                ? new Date(record.attendanceTime).toLocaleTimeString('vi-VN')
                                : 'N/A'}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                )}
              </CAlert>
            )}
            {/* Thông báo khi không quét và không có lỗi/kết quả */}
            {!isScanning && !attendanceData && !processingScan && (
              <div className="mt-3 text-muted">Hệ thống đang chờ để quét lại.</div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AttendancePage
