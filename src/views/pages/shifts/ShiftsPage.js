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
import { getAllShifts, deleteShift } from '../../../services/shift.service'
import AddEditShiftModal from '../shifts/AddEditShiftModal' // Sẽ tạo ở bước 3

const ShiftsPage = () => {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentShift, setCurrentShift] = useState(null) // Dùng cho sửa/xóa
  const [formMode, setFormMode] = useState('add') // 'add' hoặc 'edit'

  const fetchShifts = async () => {
    setLoading(true)
    try {
      const data = await getAllShifts()
      setShifts(data)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách ca làm việc.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShifts()
  }, [])

  const handleOpenAddModal = () => {
    setFormMode('add')
    setCurrentShift(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (shift) => {
    setFormMode('edit')
    setCurrentShift(shift)
    setIsModalOpen(true)
  }

  const handleOpenDeleteModal = (shift) => {
    setCurrentShift(shift)
    setIsDeleteModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentShift(null)
  }

  const handleOperationSuccess = () => {
    handleCloseModal()
    fetchShifts() // Tải lại danh sách sau khi thêm/sửa thành công
  }

  const handleConfirmDelete = async () => {
    if (!currentShift) return
    try {
      await deleteShift(currentShift.id)
      toast.success('Xóa ca làm việc thành công!')
      setIsDeleteModalOpen(false)
      fetchShifts() // Tải lại danh sách
    } catch (error) {
      toast.error('Lỗi khi xóa ca làm việc.')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Quản lý Ca làm việc</strong>
            <CButton color="primary" onClick={handleOpenAddModal}>
              <CIcon icon={cilPlus} className="me-2" />
              Thêm ca mới
            </CButton>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner />
            ) : (
              <CTable hover responsive bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Tên ca</CTableHeaderCell>
                    <CTableHeaderCell>Giờ bắt đầu</CTableHeaderCell>
                    <CTableHeaderCell>Giờ kết thúc</CTableHeaderCell>
                    <CTableHeaderCell>Hệ số OT</CTableHeaderCell>
                    <CTableHeaderCell>Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {shifts.map((shift) => (
                    <CTableRow key={shift.id}>
                      <CTableDataCell>{shift.name}</CTableDataCell>
                      <CTableDataCell>{shift.startTime}</CTableDataCell>
                      <CTableDataCell>{shift.endTime}</CTableDataCell>
                      <CTableDataCell>{shift.otMultiplier}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="info"
                          className="me-2"
                          onClick={() => handleOpenEditModal(shift)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          onClick={() => handleOpenDeleteModal(shift)}
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

      {/* Modal Thêm/Sửa */}
      <AddEditShiftModal
        visible={isModalOpen}
        onClose={handleCloseModal}
        mode={formMode}
        initialData={currentShift}
        onSuccess={handleOperationSuccess}
      />

      {/* Modal Xác nhận Xóa */}
      <CModal visible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa ca làm việc "<strong>{currentShift?.name}</strong>"?
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

export default ShiftsPage
