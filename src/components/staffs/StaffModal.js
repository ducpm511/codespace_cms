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
import CIcon from '@coreui/icons-react' // --- THÊM MỚI
import { cilTrash } from '@coreui/icons'

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

  const [rates, setRates] = useState([{ role: '', rate: '' }])

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

      if (initialData.rates && typeof initialData.rates === 'object') {
        const ratesArray = Object.entries(initialData.rates).map(([role, rate]) => ({ role, rate }))
        setRates(ratesArray.length > 0 ? ratesArray : [{ role: '', rate: '' }])
      } else {
        setRates([{ role: '', rate: '' }])
      }
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
      setRates([{ role: '', rate: '' }])
    }
    // Reset trạng thái validation khi modal mở/đóng hoặc dữ liệu thay đổi
    setValidated(false)
  }, [initialData, visible])

  const handleRateChange = (index, field, value) => {
    const updatedRates = [...rates]
    updatedRates[index][field] = value
    setRates(updatedRates)
  }

  const addRate = () => {
    setRates([...rates, { role: '', rate: '' }])
  }

  const removeRate = (index) => {
    const updatedRates = [...rates]
    updatedRates.splice(index, 1)
    setRates(updatedRates)
  }

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
      const ratesObject = rates
        .filter((r) => r.role && r.rate) // Lọc ra các dòng có đủ dữ liệu
        .reduce((acc, curr) => {
          acc[curr.role] = parseFloat(curr.rate)
          return acc
        }, {})

      const userData = {
        fullName,
        email,
        phoneNumber,
        dateOfBirth,
        address,
        identityCardNumber,
        emergencyContactNumber,
        title,
        rates: ratesObject, // Thêm rates vào payload
      }
      onSave(userData)
    }
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

          <hr className="my-4" />
          <h5>Mức thù lao theo vai trò</h5>
          <p className="text-muted small">
            Dành cho nhân viên part-time, giáo viên, trợ giảng. Bỏ trống nếu là nhân viên full-time.
          </p>

          {rates.map((r, index) => (
            <CRow key={index} className="mb-2 align-items-center">
              <CCol md={5}>
                <CFormLabel htmlFor={`rate-role-${index}`} className="visually-hidden">
                  Vai trò
                </CFormLabel>
                <CFormInput
                  id={`rate-role-${index}`}
                  placeholder="Vai trò (vd: part-time, teacher)"
                  value={r.role}
                  onChange={(e) => handleRateChange(index, 'role', e.target.value)}
                />
              </CCol>
              <CCol md={5}>
                <CFormLabel htmlFor={`rate-value-${index}`} className="visually-hidden">
                  Mức lương
                </CFormLabel>
                <CFormInput
                  id={`rate-value-${index}`}
                  type="number"
                  placeholder="Mức lương/giờ (vd: 50000)"
                  value={r.rate}
                  onChange={(e) => handleRateChange(index, 'rate', e.target.value)}
                />
              </CCol>
              <CCol md={2}>
                <CButton
                  color="danger"
                  variant="outline"
                  onClick={() => removeRate(index)}
                  disabled={rates.length <= 1}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CCol>
            </CRow>
          ))}
          <CButton color="secondary" variant="outline" size="sm" onClick={addRate} className="mt-2">
            + Thêm mức thù lao
          </CButton>
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
