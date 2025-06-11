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
  CFormSelect, // Thêm CFormSelect cho lọc giới tính/lớp
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { getAllStudents, deleteStudent } from '../../../services/student.service'
import { getAllClasses } from '../../../services/class.service' // Để lấy danh sách lớp cho filter
import AddEditStudentForm from '../../../components/students/AddEditStudentForm' // Sẽ tạo component này

/**
 * @typedef {Object} Class
 * @property {number} id
 * @property {string} className
 * @property {string} classCode
 */

/**
 * @typedef {Object} Parent
 * @property {number} id
 * @property {string} fullName
 * @property {string} phoneNumber
 * @property {string} [address]
 * @property {string} [job]
 * @property {string} [email]
 */

/**
 * @typedef {Object} Student
 * @property {number} id
 * @property {string} fullName
 * @property {string} dateOfBirth - ISO Date string (YYYY-MM-DD)
 * @property {number} age
 * @property {string} gender
 * @property {Class[]} classes - Mảng các đối tượng lớp học
 * @property {number} [parentId]
 * @property {Parent} [parent]
 */

const StudentsPage = () => {
  /** @type {Student[]} */
  const [students, setStudents] = useState([]) // Students for current page
  const [allStudentsData, setAllStudentsData] = useState([]) // All students for client-side filtering
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('') // Tìm kiếm theo tên
  const [filterClassCode, setFilterClassCode] = useState('') // Lọc theo mã lớp
  const [filterGender, setFilterGender] = useState('') // Lọc theo giới tính
  const [availableClasses, setAvailableClasses] = useState([]) // Danh sách lớp để lọc

  // Unified modal state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  /** @type {Student | null} */
  const [selectedStudent, setSelectedStudent] = useState(null) // Học sinh được chọn để sửa/xóa
  const [formMode, setFormMode] = useState('add') // 'add' hoặc 'edit'

  const [page, setPage] = useState(1)
  const studentsPerPage = 10 // Đặt số lượng học sinh mỗi trang
  const [totalItems, setTotalItems] = useState(0)

  // Function to fetch all students and then apply client-side filtering/pagination
  const fetchAndFilterStudents = useCallback(
    async (currentPage, search = '', classCode = '', gender = '') => {
      setLoading(true)
      try {
        const allData = await getAllStudents() // Fetch ALL students
        setAllStudentsData(allData) // Store all data for filtering

        let filteredData = allData

        // Apply search filter (by full name or class code)
        if (search) {
          filteredData = filteredData.filter(
            (s) =>
              s.fullName.toLowerCase().includes(search.toLowerCase()) ||
              (s.classes &&
                s.classes.some((cls) =>
                  cls.classCode.toLowerCase().includes(search.toLowerCase()),
                )),
          )
        }

        // Apply class code filter
        if (classCode) {
          filteredData = filteredData.filter(
            (s) => s.classes && s.classes.some((cls) => cls.classCode === classCode),
          )
        }

        // Apply gender filter
        if (gender) {
          filteredData = filteredData.filter((s) => s.gender === gender)
        }

        setTotalItems(filteredData.length)
        const startIndex = (currentPage - 1) * studentsPerPage
        const endIndex = startIndex + studentsPerPage
        setStudents(filteredData.slice(startIndex, endIndex))
      } catch (error) {
        console.error('Lỗi khi lấy danh sách học sinh:', error)
        toast.error(error.message || 'Có lỗi khi lấy danh sách học sinh.')
      } finally {
        setLoading(false)
      }
    },
    [studentsPerPage],
  )

  const fetchAvailableClasses = useCallback(async () => {
    try {
      const classes = await getAllClasses()
      setAvailableClasses(classes)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lớp học:', error)
      // Có thể hiển thị toast hoặc xử lý lỗi khác
    }
  }, [])

  useEffect(() => {
    fetchAndFilterStudents(page, searchQuery, filterClassCode, filterGender)
  }, [fetchAndFilterStudents, page, searchQuery, filterClassCode, filterGender])

  useEffect(() => {
    fetchAvailableClasses()
  }, [fetchAvailableClasses])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset trang khi tìm kiếm
  }

  const handleFilterClassCode = (e) => {
    setFilterClassCode(e.target.value)
    setPage(1) // Reset trang khi lọc
  }

  const handleFilterGender = (e) => {
    setFilterGender(e.target.value)
    setPage(1) // Reset trang khi lọc
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  // Callback khi form thêm/sửa hoàn thành
  const handleStudentOperationSuccess = () => {
    setIsAddEditModalOpen(false) // Close the unified modal
    toast.success('Thao tác học sinh thành công!')
    // Re-fetch all data to ensure consistency and correct filtering/pagination
    fetchAndFilterStudents(page, searchQuery, filterClassCode, filterGender)
  }

  // Mở modal thêm học sinh
  const handleAddClick = () => {
    setFormMode('add')
    setSelectedStudent(null) // Đảm bảo không có dữ liệu cũ
    setIsAddEditModalOpen(true)
  }

  // Mở modal chỉnh sửa học sinh
  const handleEditClick = (studentItem) => {
    setFormMode('edit')
    setSelectedStudent(studentItem)
    setIsAddEditModalOpen(true)
  }

  const handleDeleteClick = (studentItem) => {
    setSelectedStudent(studentItem)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return

    try {
      await deleteStudent(selectedStudent.id)
      setIsDeleteModalOpen(false)
      toast.success('Xóa học sinh thành công!')
      // Re-fetch all data to ensure consistency and correct filtering/pagination
      fetchAndFilterStudents(page, searchQuery, filterClassCode, filterGender)
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error(error.message || 'Có lỗi khi xóa học sinh.')
    }
  }

  const totalPages = Math.ceil(totalItems / studentsPerPage)

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quản Lý Học Sinh</strong>
          </CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex gap-2">
                <CFormInput
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mã lớp..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-auto"
                />
                <CFormSelect
                  value={filterClassCode}
                  onChange={handleFilterClassCode}
                  className="w-auto"
                >
                  <option value="">Lọc theo lớp</option>
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.classCode}>
                      {cls.classCode} - {cls.className}
                    </option>
                  ))}
                </CFormSelect>
                <CFormSelect value={filterGender} onChange={handleFilterGender} className="w-auto">
                  <option value="">Lọc theo giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </CFormSelect>
              </div>
              <CButton color="primary" onClick={handleAddClick}>
                <CIcon icon={cilPlus} className="me-2" />
                Thêm học sinh
              </CButton>
            </div>

            {loading ? (
              <p>Đang tải danh sách học sinh...</p>
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
                        Ngày Sinh
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Tuổi
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Giới Tính
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Lớp Học
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Phụ Huynh
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Hành động
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {students.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={8} className="text-center">
                          Không có dữ liệu học sinh.
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      students.map((studentItem, index) => (
                        <CTableRow key={studentItem.id}>
                          <CTableDataCell>
                            {(page - 1) * studentsPerPage + index + 1}
                          </CTableDataCell>
                          <CTableDataCell>{studentItem.fullName}</CTableDataCell>
                          <CTableDataCell>
                            {studentItem.dateOfBirth
                              ? new Date(studentItem.dateOfBirth).toLocaleDateString('vi-VN')
                              : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>{studentItem.age}</CTableDataCell>
                          <CTableDataCell>{studentItem.gender}</CTableDataCell>
                          {/* Display all classes, joined by comma */}
                          <CTableDataCell>
                            {studentItem.classes && studentItem.classes.length > 0
                              ? studentItem.classes
                                  .map((cls) => `${cls.className} (${cls.classCode})`)
                                  .join(', ')
                              : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>
                            {studentItem.parent
                              ? `${studentItem.parent.fullName} (${studentItem.parent.phoneNumber})`
                              : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditClick(studentItem)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(studentItem)}
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

      {/* Modal Thêm/Chỉnh Sửa Học Sinh (Unified Modal) */}
      <CModal
        visible={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        scrollable
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>
            {formMode === 'add' ? 'Thêm học sinh mới' : 'Chỉnh sửa thông tin học sinh'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <AddEditStudentForm
            mode={formMode}
            initialData={selectedStudent}
            onFormSuccess={handleStudentOperationSuccess}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsAddEditModalOpen(false)}>
            Hủy
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Xác Nhận Xóa */}
      <CModal visible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>Bạn có chắc chắn muốn xóa học sinh "{selectedStudent?.fullName}"?</CModalBody>
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

export default StudentsPage
