import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CSpinner,
  CFormText,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { createRole, updateRole } from '../../../services/role.service' // Cần thêm các hàm này vào service

const AddEditRoleModal = ({ visible, onClose, mode, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', key: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({ name: initialData.name || '', key: initialData.key || '' })
    } else {
      setFormData({ name: '', key: '' })
    }
  }, [mode, initialData, visible])

  const handleChange = (e) => {
    const { id, value } = e.target
    // Tự động chuyển key thành chữ thường, không dấu, thay khoảng trắng bằng gạch ngang
    if (id === 'key') {
      const formattedKey = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng gạch ngang
        .replace(/[^a-z0-9-]/g, '') // Chỉ giữ lại chữ thường, số, gạch ngang
      setFormData({ ...formData, [id]: formattedKey })
    } else {
      setFormData({ ...formData, [id]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.key) {
      toast.error('Vui lòng điền đầy đủ Tên và Key.')
      return
    }
    setIsSubmitting(true)
    try {
      if (mode === 'add') {
        await createRole(formData)
        toast.success('Thêm vai trò thành công!')
      } else {
        await updateRole(initialData.id, formData)
        toast.success('Cập nhật vai trò thành công!')
      }
      onSuccess()
    } catch (error) {
      toast.error(error.message || 'Đã có lỗi xảy ra.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} alignment="center">
      <CForm onSubmit={handleSubmit}>
        <CModalHeader>
          <CModalTitle>{mode === 'add' ? 'Thêm vai trò mới' : 'Chỉnh sửa vai trò'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="name">Tên Vai trò (Hiển thị)</CFormLabel>
            <CFormInput id="name" value={formData.name} onChange={handleChange} required />
            <CFormText>Ví dụ: Giáo viên, Trợ giảng</CFormText>
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="key">Key Định danh (Hệ thống)</CFormLabel>
            <CFormInput id="key" value={formData.key} onChange={handleChange} required />
            <CFormText>
              Chỉ chứa chữ thường, số, dấu gạch ngang (vd: teacher, teaching-assistant). Key này sẽ
              được dùng để liên kết mức lương và phân công.
            </CFormText>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Hủy
          </CButton>
          <CButton color="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <CSpinner size="sm" /> : 'Lưu'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default AddEditRoleModal
