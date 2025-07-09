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
} from '@coreui/react'

const UserModal = ({ visible, onClose, onSave, initialData = null, isEditing = false }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('USER')

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName || '')
      setLastName(initialData.lastName || '')
      setEmail(initialData.email || '')
      setRole(initialData.role || 'USER')
      setPassword('')
    } else {
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setRole('USER')
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    const userData = {
      firstName,
      lastName,
      email,
      role,
      ...(isEditing ? {} : { password }),
    }
    onSave(userData)
  }

  return (
    <CModal visible={visible} onClose={onClose} scrollable>
      <CModalHeader>
        <CModalTitle>{isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="firstName">Họ</CFormLabel>
              <CFormInput
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="lastName">Tên</CFormLabel>
              <CFormInput
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
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
            </CCol>
            {!isEditing && (
              <CCol md={6}>
                <CFormLabel htmlFor="password">Mật khẩu</CFormLabel>
                <CFormInput
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </CCol>
            )}
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="role">Vai trò</CFormLabel>
              <CFormSelect id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Hủy
        </CButton>
        <CButton color="primary" onClick={handleSubmit}>
          {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default UserModal
