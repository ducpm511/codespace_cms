import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner'
import { toast } from 'react-toastify'
import { scanStaffAttendance } from '../../../services/staffAttendance.service'

const StaffScannerPage = () => {
  const [isScanning, setIsScanning] = useState(true)
  const [scanError, setScanError] = useState('')
  const [lastActionMessage, setLastActionMessage] = useState('') // State mới để hiển thị thông báo

  // State cho modal xác nhận
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)
  const [checkoutInfo, setCheckoutInfo] = useState(null) // Lưu thông tin để xác nhận checkout

  const handleScan = async (err, result) => {
    if (result && isScanning) {
      setIsScanning(false)
      const qrCodeData = result.text

      try {
        const response = await scanStaffAttendance(qrCodeData)

        if (response.status === 'confirm_checkout') {
          // Mở modal xác nhận thay vì dùng window.confirm
          setCheckoutInfo({
            message: response.message,
            qrCodeData,
            staffName: response.staff.fullName,
          })
          setIsConfirmModalVisible(true)
        } else {
          // Xử lý check-in hoặc check-out thành công
          const message = `${response.staff.fullName} ${response.status === 'checked_in' ? 'check-in' : 'check-out'} lúc ${new Date(response.timestamp).toLocaleTimeString('vi-VN')}`
          setLastActionMessage(message)
          toast.success(message)
          resetScanner()
        }
      } catch (error) {
        const errorMessage = error.data?.message || error.message || 'Có lỗi xảy ra.'
        setScanError(errorMessage)
        toast.error(errorMessage)
        resetScanner()
      }
    }
  }

  const handleConfirmCheckout = async () => {
    if (!checkoutInfo) return

    try {
      const checkoutResponse = await scanStaffAttendance(checkoutInfo.qrCodeData, true)
      const message = `${checkoutResponse.staff.fullName} check-out lúc ${new Date(checkoutResponse.timestamp).toLocaleTimeString('vi-VN')}`
      setLastActionMessage(message)
      toast.success(message)
    } catch (error) {
      const errorMessage = error.data?.message || error.message || 'Lỗi khi xác nhận check-out.'
      setScanError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsConfirmModalVisible(false)
      setCheckoutInfo(null)
      resetScanner()
    }
  }

  // Hàm để reset trạng thái cho lần quét tiếp theo
  const resetScanner = () => {
    setTimeout(() => {
      setIsScanning(true)
      setScanError('')
    }, 3000) // Cho phép quét lại sau 3 giây
  }

  const handleCloseConfirmModal = () => {
    setIsConfirmModalVisible(false)
    setCheckoutInfo(null)
    resetScanner() // Reset để người dùng có thể quét lại nếu họ không muốn check-out
  }

  return (
    <>
      <CCard>
        <CCardHeader>
          <strong>Chấm công bằng Mã QR</strong>
        </CCardHeader>
        <CCardBody className="text-center">
          <h4>Vui lòng đưa mã QR của bạn vào camera</h4>
          <div style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
            <BarcodeScannerComponent onUpdate={handleScan} facingMode="user" />
          </div>

          {/* Hiển thị thông báo thân thiện hơn */}
          {lastActionMessage && (
            <CAlert color="success" className="mt-3">
              {lastActionMessage}
            </CAlert>
          )}
          {scanError && (
            <CAlert color="danger" className="mt-3">
              {scanError}
            </CAlert>
          )}
          {!isScanning && !lastActionMessage && !scanError && (
            <p className="mt-3 text-info">Đang xử lý...</p>
          )}
        </CCardBody>
      </CCard>

      {/* Modal xác nhận Check-out */}
      <CModal visible={isConfirmModalVisible} onClose={handleCloseConfirmModal} alignment="center">
        <CModalHeader>
          <CModalTitle>Xác nhận Check-out</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Nhân viên: <strong>{checkoutInfo?.staffName}</strong>
          </p>
          {checkoutInfo?.message}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseConfirmModal}>
            Không
          </CButton>
          <CButton color="primary" onClick={handleConfirmCheckout}>
            Có, Check-out
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default StaffScannerPage
