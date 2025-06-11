// src/views/pages/parents/ParentsPage.js
import React, { useState, useEffect, useCallback } from 'react'
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
  CFormInput,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
} from '@coreui/react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Import service của bạn
import {
  getAllParents,
  createParent,
  updateParent,
  deleteParent,
} from '../../../services/parent.service'
import AddParentForm from '../../../components/parents/AddParentForm' // Sẽ tạo file này sau

/**
 * @typedef {Object} Parent
 * @property {number} id
 * @property {string} fullName
 * @property {string} phoneNumber
 * @property {string} address
 * @property {string} [job]
 */

/**
 * @typedef {Object} UpdateParentDto
 * @property {string} [fullName]
 * @property {string} [phoneNumber]
 * @property {string} [address]
 * @property {string} [job]
 */

const ParentsPage = () => {
  /** @type {Parent[]} */
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState('') // Tìm kiếm theo tên hoặc số điện thoại
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  /** @type {Parent | null} */
  const [selectedParent, setSelectedParent] = useState(null)

  const [editFullName, setEditFullName] = useState('')
  const [editPhoneNumber, setEditPhoneNumber] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editJob, setEditJob] = useState('')

  const [page, setPage] = useState(1)
  const parentsPerPage = 10
  const [totalItems, setTotalItems] = useState(0)

  const fetchParents = useCallback(
    async (currentPage, search = '') => {
      setLoading(true)
      try {
        const allData = await getAllParents()

        let filteredData = allData

        if (search) {
          filteredData = allData.filter(
            (p) =>
              p.fullName.toLowerCase().includes(search.toLowerCase()) ||
              p.phoneNumber.includes(search),
          )
        }

        setTotalItems(filteredData.length)
        const startIndex = (currentPage - 1) * parentsPerPage
        const endIndex = startIndex + parentsPerPage
        setParents(filteredData.slice(startIndex, endIndex))
      } catch (error) {
        console.error('Error fetching parents:', error)
        toast.error(error.message || 'Có lỗi khi lấy danh sách phụ huynh.')
      } finally {
        setLoading(false)
      }
    },
    [parentsPerPage],
  )

  useEffect(() => {
    fetchParents(page, searchName)
  }, [fetchParents, page, searchName])

  const handleSearch = (e) => {
    setSearchName(e.target.value)
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleParentAdded = () => {
    setIsAddModalOpen(false)
    toast.success('Phụ huynh đã được thêm thành công!')
    fetchParents(page, searchName)
  }

  const handleEditClick = (parentItem) => {
    setSelectedParent(parentItem)
    setEditFullName(parentItem.fullName)
    setEditPhoneNumber(parentItem.phoneNumber)
    setEditAddress(parentItem.address)
    setEditJob(parentItem.job || '') // Đảm bảo có giá trị mặc định cho job (tùy chọn)
    setIsEditModalOpen(true)
  }

  const handleUpdateParent = async () => {
    if (!selectedParent) return

    try {
      /** @type {UpdateParentDto} */
      const updateDto = {
        fullName: editFullName,
        phoneNumber: editPhoneNumber,
        address: editAddress,
        job: editJob,
      }
      await updateParent(selectedParent.id, updateDto)
      setIsEditModalOpen(false)
      toast.success('Cập nhật thông tin phụ huynh thành công!')
      fetchParents(page, searchName)
    } catch (error) {
      console.error('Error updating parent:', error)
      toast.error(error.message || 'Có lỗi khi cập nhật phụ huynh.')
    }
  }

  const handleDeleteClick = (parentItem) => {
    setSelectedParent(parentItem)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedParent) return

    try {
      await deleteParent(selectedParent.id)
      setIsDeleteModalOpen(false)
      toast.success('Xóa phụ huynh thành công!')
      fetchParents(page, searchName)
    } catch (error) {
      console.error('Error deleting parent:', error)
      toast.error(error.message || 'Có lỗi khi xóa phụ huynh.')
    }
  }

  const totalPages = Math.ceil(totalItems / parentsPerPage)

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quản Lý Phụ Huynh</strong>
          </CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <CFormInput
                type="text"
                placeholder="Tìm kiếm theo tên hoặc SĐT..."
                value={searchName}
                onChange={handleSearch}
                className="w-25"
              />
              <CButton color="primary" onClick={() => setIsAddModalOpen(true)}>
                <CIcon icon={cilPlus} className="me-2" />
                Thêm phụ huynh
              </CButton>
            </div>

            {loading ? (
              <p>Đang tải danh sách phụ huynh...</p>
            ) : (
              <>
                <CTable hover responsive bordered className="text-center">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col" className="text-center">
                        STT
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Họ và Tên
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Số Điện Thoại
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Địa Chỉ
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Nghề Nghiệp
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Hành động
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {parents.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={6} className="text-center">
                          Không có dữ liệu phụ huynh.
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      parents.map((parentItem, index) => (
                        <CTableRow key={parentItem.id}>
                          <CTableDataCell>{(page - 1) * parentsPerPage + index + 1}</CTableDataCell>
                          <CTableDataCell>{parentItem.fullName}</CTableDataCell>
                          <CTableDataCell>{parentItem.phoneNumber}</CTableDataCell>
                          <CTableDataCell>{parentItem.address}</CTableDataCell>
                          <CTableDataCell>{parentItem.job || 'N/A'}</CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditClick(parentItem)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(parentItem)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>

                {totalPages > 1 && (
                  <CPagination align="center" aria-label="Page navigation example">
                    <CPaginationItem
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Trước
                    </CPaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <CPaginationItem
                        key={i + 1}
                        active={i + 1 === page}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </CPaginationItem>
                    ))}
                    <CPaginationItem
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                    >
                      Sau
                    </CPaginationItem>
                  </CPagination>
                )}
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal Thêm Phụ Huynh */}
      <CModal visible={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>Thêm phụ huynh mới</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <AddParentForm onParentAdded={handleParentAdded} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsAddModalOpen(false)}>
            Hủy
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Chỉnh Sửa Phụ Huynh */}
      <CModal visible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>Chỉnh sửa thông tin phụ huynh</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedParent && (
            <CForm>
              <div className="mb-3">
                <CFormLabel htmlFor="editFullName">Họ và Tên</CFormLabel>
                <CFormInput
                  type="text"
                  id="editFullName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="editPhoneNumber">Số Điện Thoại</CFormLabel>
                <CFormInput
                  type="text"
                  id="editPhoneNumber"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="editAddress">Địa Chỉ</CFormLabel>
                <CFormInput
                  type="text"
                  id="editAddress"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="editJob">Nghề Nghiệp (Tùy chọn)</CFormLabel>
                <CFormInput
                  type="text"
                  id="editJob"
                  value={editJob}
                  onChange={(e) => setEditJob(e.target.value)}
                />
              </div>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsEditModalOpen(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleUpdateParent}>
            Lưu thay đổi
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Xác Nhận Xóa */}
      <CModal visible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa phụ huynh "{selectedParent?.fullName}" (SĐT:{' '}
          {selectedParent?.phoneNumber})?
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

export default ParentsPage
