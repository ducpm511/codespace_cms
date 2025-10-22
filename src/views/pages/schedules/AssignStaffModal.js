import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CListGroup,
  CListGroupItem,
  CButton,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CAlert,
  CRow,
  CCol,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { DateTime } from 'luxon'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus } from '@coreui/icons'

import { getAllStaff } from '../../../services/staff.service'
import { getAllRoles } from '../../../services/role.service' // <-- DÙNG SERVICE MỚI
import { bulkAssignStaffToSession } from '../../../services/schedule.service' // <-- DÙNG HÀM API MỚI

const AssignStaffModal = ({ visible, onClose, eventData, onSuccess }) => {
  const [staffList, setStaffList] = useState([])
  const [roleList, setRoleList] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // State cho danh sách phân công hiện tại trong modal
  // Mỗi phần tử là object { staffId: '', roleKey: '' }
  const [currentAssignments, setCurrentAssignments] = useState([])

  useEffect(() => {
    if (visible && eventData) {
      const fetchData = async () => {
        setLoading(true)
        setError('')
        try {
          const [staff, roles] = await Promise.all([getAllStaff(), getAllRoles()])
          setStaffList(staff)
          setRoleList(roles)

          // Lấy thông tin phân công cũ từ resource
          const initialAssignments = (eventData.resource.assignments || []).map((a) => ({
            staffId: a.staffId || '', // Đảm bảo có giá trị khởi tạo
            roleKey: a.roleKey || '', // Đảm bảo có giá trị khởi tạo
          }))
          // Nếu không có phân công cũ, thêm 1 dòng trống
          setCurrentAssignments(
            initialAssignments.length > 0 ? initialAssignments : [{ staffId: '', roleKey: '' }],
          )
        } catch (err) {
          setError('Không thể tải dữ liệu nhân viên hoặc vai trò.')
          setStaffList([])
          setRoleList([])
          setCurrentAssignments([{ staffId: '', roleKey: '' }]) // Khởi tạo dòng trống nếu lỗi
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [visible, eventData])

  const addAssignmentRow = () => {
    setCurrentAssignments([...currentAssignments, { staffId: '', roleKey: '' }])
  }

  const removeAssignmentRow = (index) => {
    const updated = [...currentAssignments]
    updated.splice(index, 1)
    setCurrentAssignments(updated)
  }

  const handleAssignmentChange = (index, field, value) => {
    const updated = [...currentAssignments]
    updated[index][field] = value
    setCurrentAssignments(updated)
  }

  const handleSubmit = async () => {
    // Lọc ra các phân công hợp lệ (có cả staffId và roleKey)
    const validAssignments = currentAssignments
      .filter((a) => a.staffId && a.roleKey)
      .map((a) => ({ staffId: parseInt(a.staffId), roleKey: a.roleKey }))

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        classSessionId: eventData.resource.session.id,
        assignments: validAssignments, // Gửi mảng phân công đã lọc
      }

      await bulkAssignStaffToSession(payload) // Gọi API mới
      toast.success('Cập nhật phân công thành công!')
      onSuccess()
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Có lỗi xảy ra.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CModal size="lg" visible={visible} onClose={onClose} alignment="center">
      <CModalHeader>
        <CModalTitle>Phân công Nhân sự</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {loading ? (
          <CSpinner />
        ) : (
          <>
            <p>
              <strong>Lớp:</strong> {eventData?.resource.session.class.className}
              <br />
              <strong>Thời gian:</strong>{' '}
              {DateTime.fromJSDate(eventData?.start).toFormat('HH:mm dd/MM/yyyy')}
            </p>
            <hr />
            <h6>Danh sách phân công:</h6>
            {currentAssignments.length === 0 && (
              <p className="text-muted">Chưa có phân công nào.</p>
            )}
            {currentAssignments.map((assignment, index) => (
              <CRow key={index} className="mb-2 align-items-center">
                <CCol md={5}>
                  <CFormSelect
                    aria-label="Chọn nhân viên"
                    value={assignment.staffId}
                    onChange={(e) => handleAssignmentChange(index, 'staffId', e.target.value)}
                  >
                    <option value="">-- Chọn Nhân viên --</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={5}>
                  <CFormSelect
                    aria-label="Chọn vai trò"
                    value={assignment.roleKey}
                    onChange={(e) => handleAssignmentChange(index, 'roleKey', e.target.value)}
                  >
                    <option value="">-- Chọn Vai trò --</option>
                    {/* Sử dụng roleList từ API */}
                    {roleList.map((role) => (
                      <option key={role.key} value={role.key}>
                        {role.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2}>
                  <CButton
                    color="danger"
                    variant="outline"
                    onClick={() => removeAssignmentRow(index)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CCol>
              </CRow>
            ))}
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              onClick={addAssignmentRow}
              className="mt-2"
            >
              <CIcon icon={cilPlus} /> Thêm phân công
            </CButton>
          </>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Hủy
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={isSubmitting || loading}>
          {isSubmitting ? <CSpinner /> : 'Lưu Phân công'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default AssignStaffModal
