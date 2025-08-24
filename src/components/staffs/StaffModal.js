// src/components/users/UserModal.js
import React, { useState, useEffect } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CFormFeedback,
} from '@coreui/react'

const StaffModal = ({ visible, onClose, onSave, initialData = null, isEditing = false }) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [identityCardNumber, setIdentityCardNumber] = useState('')
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('')
  const [title, setTitle] = useState('Giáo viên') // Sửa giá trị mặc định để khớp với option

  // THÊM MỚI: State để quản lý validation
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '')
      setEmail(initialData.email || '')
      setTitle(initialData.title || 'Giáo viên')
      setPhoneNumber(initialData.phoneNumber || '')
      // Định dạng lại ngày tháng để input type="date" nhận được
      setDateOfBirth(initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '')
      setAddress(initialData.address || '')
      setIdentityCardNumber(initialData.identityCardNumber || '')
      setEmergencyContactNumber(initialData.emergencyContactNumber || '')
    } else {
      // Reset form khi không có initialData
      setFullName('')
      setEmail('')
      setPhoneNumber('')
      setDateOfBirth('')
      setAddress('')
      setIdentityCardNumber('')
      setEmergencyContactNumber('')
      setTitle('Giáo viên')
    }
    // Reset trạng thái validation khi modal mở/đóng hoặc dữ liệu thay đổi
    setValidated(false)
  }, [initialData, visible])

  // SỬA ĐỔI: Hàm handleSubmit để kiểm tra validation
  const handleSubmit = (event) => {
    const form = event.currentTarget
    // Ngăn form submit ngay lập tức
    event.preventDefault()
    event.stopPropagation()

    // Kiểm tra form có hợp lệ không
    if (form.checkValidity() === false) {
      // Nếu không, chỉ cần set validated thành true để hiển thị lỗi
    } else {
      // Nếu hợp lệ, tạo dữ liệu và gọi onSave
      const userData = {
        fullName,
        email,
        phoneNumber,
        dateOfBirth,
        address,
        identityCardNumber,
        emergencyContactNumber,
        title,
      }
      onSave(userData)
    }

    // Bật chế độ hiển thị lỗi cho các lần submit sau
    setValidated(true)
  }

  return (
    <CModal visible={visible} onClose={onClose} scrollable>
      <CModalHeader>
        <CModalTitle>{isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</CModalTitle>
      </CModalHeader>
      {/* SỬA ĐỔI: Thêm noValidate và các prop cho CForm */}
      <CForm noValidate validated={validated} onSubmit={handleSubmit}>
        <CModalBody>
          {/* Các CRow và CCol giữ nguyên */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="fullName">Họ và tên</CFormLabel>
              <CFormInput
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập họ và tên</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="dateOfBirth">Ngày sinh</CFormLabel>
              <CFormInput
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng chọn ngày sinh</CFormFeedback>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="email">Email</CFormLabel>
              <CFormInput
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập email hợp lệ</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="phoneNumber">Số điện thoại</CFormLabel>
              <CFormInput
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập số điện thoại</CFormFeedback>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="address">Địa chỉ</CFormLabel>
              <CFormInput
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập địa chỉ</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="identityCardNumber">Số CMND/CCCD</CFormLabel>
              <CFormInput
                type="text"
                id="identityCardNumber"
                value={identityCardNumber}
                onChange={(e) => setIdentityCardNumber(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập số CMND/CCCD</CFormFeedback>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="title">Vị trí</CFormLabel>
              <CFormInput
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng điền chức vụ</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="emergencyContactNumber">SĐT liên hệ khẩn cấp</CFormLabel>
              <CFormInput
                type="text"
                id="emergencyContactNumber"
                value={emergencyContactNumber}
                onChange={(e) => setEmergencyContactNumber(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập SĐT khẩn cấp</CFormFeedback>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Hủy
          </CButton>
          {/* SỬA ĐỔI: Thay onClick bằng type="submit" */}
          <CButton color="primary" type="submit">
            {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default StaffModal
