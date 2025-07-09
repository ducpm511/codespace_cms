// src/views/pages/users/UsersPage.js
import React, { useEffect, useState } from 'react'
import {
  CButton,
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
  CPagination,
  CPaginationItem,
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import { toast } from 'react-toastify'
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/user.service'
import UserModal from '../../../components/users/UserModal'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const usersPerPage = 10
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const fetchUsers = async () => {
    try {
      const response = await getUsers({ page, limit: usersPerPage, search, role: roleFilter })
      const { data, meta } = response

      setUsers(data)
      setTotalItems(meta.total)
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error)
      toast.error('Lỗi khi tải danh sách người dùng')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter])

  const handleAddClick = () => {
    setIsEditing(false)
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (user) => {
    setIsEditing(true)
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
    try {
      await deleteUser(id)
      toast.success('Xóa người dùng thành công')
      fetchUsers()
    } catch (error) {
      toast.error('Lỗi khi xóa người dùng')
    }
  }

  const handleSaveUser = async (userData) => {
    try {
      if (isEditing) {
        await updateUser(selectedUser.id, userData)
        toast.success('Cập nhật người dùng thành công')
      } else {
        await createUser(userData)
        toast.success('Thêm người dùng thành công')
      }
      setIsModalOpen(false)
      fetchUsers()
    } catch (error) {
      toast.error('Lỗi khi lưu người dùng')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quản lý người dùng</strong>
          </CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-between mb-3">
              <CFormInput
                placeholder="Tìm kiếm tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="me-2 w-25"
              />
              <CFormSelect
                className="w-25 me-2"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </CFormSelect>
              <CButton onClick={handleAddClick} color="primary">
                <CIcon icon={cilPlus} className="me-2" /> Thêm người dùng
              </CButton>
            </div>

            <CTable bordered hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Họ tên</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Vai trò</CTableHeaderCell>
                  <CTableHeaderCell>Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={5} className="text-center">
                      Không có dữ liệu người dùng.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  users.map((u, idx) => (
                    <CTableRow key={u.id}>
                      <CTableDataCell>{(page - 1) * usersPerPage + idx + 1}</CTableDataCell>
                      <CTableDataCell>
                        {u.firstName} {u.lastName}
                      </CTableDataCell>
                      <CTableDataCell>{u.email}</CTableDataCell>
                      <CTableDataCell>{u.role}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="info"
                          className="me-2"
                          onClick={() => handleEditClick(u)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton size="sm" color="danger" onClick={() => handleDelete(u.id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>

            <CPagination align="center" className="mt-3">
              {[...Array(Math.ceil(totalItems / usersPerPage))].map((_, i) => (
                <CPaginationItem key={i} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </CPaginationItem>
              ))}
            </CPagination>
          </CCardBody>
        </CCard>
      </CCol>

      <UserModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        initialData={selectedUser}
        isEditing={isEditing}
      />
    </CRow>
  )
}

export default UsersPage
