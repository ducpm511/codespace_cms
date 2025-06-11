// src/components/parents/AddParentForm.js
import React, { useState } from 'react'
import { CForm, CFormInput, CFormLabel, CButton } from '@coreui/react'
import { toast } from 'react-toastify'

import { createParent } from '../../services/parent.service' // Import service của bạn

const AddParentForm = ({ onParentAdded }) => {
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [job, setJob] = useState('') // Tùy chọn

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation cơ bản
    if (!fullName.trim() || !phoneNumber.trim() || !address.trim()) {
      toast.error('Vui lòng điền đầy đủ Họ và Tên, Số Điện Thoại và Địa Chỉ.')
      return
    }

    try {
      const newParentData = { fullName, phoneNumber, address, job: job.trim() ? job : undefined } // Gửi job nếu có, không thì undefined
      await createParent(newParentData)

      onParentAdded()
      toast.success('Thêm phụ huynh thành công!')
      // Reset form
      setFullName('')
      setPhoneNumber('')
      setAddress('')
      setJob('')
    } catch (error) {
      console.error('Error adding parent:', error)
      toast.error(error.message || 'Có lỗi khi thêm phụ huynh.')
    }
  }

  return (
    <CForm onSubmit={handleSubmit}>
      <div className="mb-3">
        <CFormLabel htmlFor="fullName">Họ và Tên</CFormLabel>
        <CFormInput
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <CFormLabel htmlFor="phoneNumber">Số Điện Thoại</CFormLabel>
        <CFormInput
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <CFormLabel htmlFor="address">Địa Chỉ</CFormLabel>
        <CFormInput
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <CFormLabel htmlFor="job">Nghề Nghiệp (Tùy chọn)</CFormLabel>
        <CFormInput type="text" id="job" value={job} onChange={(e) => setJob(e.target.value)} />
      </div>
      <CButton type="submit" color="primary" className="mt-3">
        Thêm phụ huynh
      </CButton>
    </CForm>
  )
}

export default AddParentForm
