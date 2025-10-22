import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { toast } from 'react-toastify'
import { getAllRoles, deleteRole } from '../../../services/role.service' // Service đã tạo
import AddEditRoleModal from './AddEditRoleModal' // Sẽ tạo ở bước 2

const RolesPage = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState(null)
  const [formMode, setFormMode] = useState('add') // 'add' hoặc 'edit'

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const data = await getAllRoles()
      setRoles(data)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách vai trò.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleOpenAddModal = () => {
    setFormMode('add')
    setCurrentRole(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (role) => {
    setFormMode('edit')
    setCurrentRole(role)
    setIsModalOpen(true)
  }

  const handleOpenDeleteModal = (role) => {
    setCurrentRole(role)
    setIsDeleteModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentRole(null)
  }

  const handleOperationSuccess = () => {
    handleCloseModal()
    fetchRoles()
  }

  const handleConfirmDelete = async () => {
    if (!currentRole) return
    try {
      await deleteRole(currentRole.id) // Cần thêm hàm deleteRole vào service
      toast.success('Xóa vai trò thành công!')
      setIsDeleteModalOpen(false)
      fetchRoles()
    } catch (error) {
      toast.error('Lỗi khi xóa vai trò.')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Quản lý Vai trò Nhân viên</strong>
            <CButton color="primary" onClick={handleOpenAddModal}>
              <CIcon icon={cilPlus} className="me-2" />
              Thêm vai trò mới
            </CButton>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner />
            ) : (
              <CTable hover responsive bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Tên Vai trò</CTableHeaderCell>
                    <CTableHeaderCell>Key Định danh</CTableHeaderCell>
                    <CTableHeaderCell>Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {roles.map((role) => (
                    <CTableRow key={role.id}>
                      <CTableDataCell>{role.name}</CTableDataCell>
                      <CTableDataCell>
                        <code>{role.key}</code>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="info"
                          className="me-2"
                          onClick={() => handleOpenEditModal(role)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          onClick={() => handleOpenDeleteModal(role)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <AddEditRoleModal
        visible={isModalOpen}
        onClose={handleCloseModal}
        mode={formMode}
        initialData={currentRole}
        onSuccess={handleOperationSuccess}
      />

      <CModal visible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa vai trò "<strong>{currentRole?.name}</strong>"? Key{' '}
          <code>{currentRole?.key}</code> sẽ bị xóa.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleConfirmDelete}>
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default RolesPage
