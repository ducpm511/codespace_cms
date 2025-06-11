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
  CFormLabel, // Import CFormLabel for edit modal
  CFormCheck, // Import CFormCheck for edit modal
} from '@coreui/react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm } from '@coreui/react'
import DatePicker from 'react-datepicker' // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  getAllClasses,
  createClass, // Vẫn import nếu bạn có AddClassForm riêng
  updateClass,
  deleteClass,
} from '../../../services/class.service'
import AddClassForm from '../../../components/classes/AddClassForm' // Đảm bảo đúng đường dẫn

// Định nghĩa cấu trúc đối tượng Class bằng JSDoc
/**
 * @typedef {Object} Class
 * @property {number} id
 * @property {string} className
 * @property {string} classCode
 * @property {string} [academicYear]
 * @property {string} [startDate] - Định dạng ISO 8601 string (YYYY-MM-DD)
 * @property {number} [totalSessions]
 * @property {string[]} [scheduleDays] - Mảng các chuỗi ngày (ví dụ: ['Monday', 'Friday'])
 * @property {string} [scheduleTime] - Định dạng HH:MM:SS
 */

/**
 * @typedef {Object} UpdateClassDto
 * @property {string} [className]
 * @property {string} [classCode]
 * @property {string} [academicYear]
 * @property {string} [startDate]
 * @property {number} [totalSessions]
 * @property {string[]} [scheduleDays]
 * @property {string} [scheduleTime]
 */

const ClassesPage = () => {
  /** @type {Class[]} */
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCode, setSearchCode] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  /** @type {Class | null} */
  const [selectedClass, setSelectedClass] = useState(null)

  const [editClassName, setEditClassName] = useState('')
  const [editClassCode, setEditClassCode] = useState('')
  const [editAcademicYear, setEditAcademicYear] = useState('')
  // New states for editing schedule
  const [editStartDate, setEditStartDate] = useState(null) // Date object
  const [editTotalSessions, setEditTotalSessions] = useState('')
  const [editScheduleDays, setEditScheduleDays] = useState([])
  const [editScheduleTime, setEditScheduleTime] = useState('')

  const [page, setPage] = useState(1)
  const classesPerPage = 10
  const [totalItems, setTotalItems] = useState(0)

  // Danh sách các ngày trong tuần để hiển thị checkbox trong modal edit
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleEditDayChange = (day) => {
    setEditScheduleDays((prevDays) =>
      prevDays.includes(day) ? prevDays.filter((d) => d !== day) : [...prevDays, day],
    )
  }

  const fetchClasses = useCallback(
    async (currentPage, search = '') => {
      setLoading(true)
      console.log(`[ClassesPage] Fetching classes for page ${currentPage} with search "${search}"`)
      try {
        const allData = await getAllClasses() // Lấy tất cả dữ liệu lớp học
        console.log('[ClassesPage] Raw data fetched:', allData)

        let filteredData = allData

        if (search) {
          filteredData = allData.filter((c) =>
            c.classCode.toLowerCase().includes(search.toLowerCase()),
          )
        }

        setTotalItems(filteredData.length)
        const startIndex = (currentPage - 1) * classesPerPage
        const endIndex = startIndex + classesPerPage
        const pagedClasses = filteredData.slice(startIndex, endIndex)

        setClasses(pagedClasses)
        console.log('[ClassesPage] Classes state updated:', pagedClasses)
      } catch (error) {
        console.error('[ClassesPage] Error fetching classes:', error)
        toast.error(error.message || 'Có lỗi khi lấy danh sách lớp học.')
      } finally {
        setLoading(false)
      }
    },
    [classesPerPage],
  )

  useEffect(() => {
    fetchClasses(page, searchCode)
  }, [fetchClasses, page, searchCode])

  // Modified handleClassAdded to accept newClass from AddClassForm
  const handleClassAdded = (newClass) => {
    console.log('[ClassesPage] handleClassAdded called with newClass:', newClass)
    setIsAddModalOpen(false) // Đóng modal
    toast.success('Lớp học đã được thêm thành công!')

    // Optimistically add the new class if it belongs to the current page and there's space
    // This provides immediate feedback to the user
    if (newClass) {
      // If on the first page and there's room, add optimistically
      if (page === 1 && classes.length < classesPerPage) {
        setClasses((prevClasses) => {
          const updatedClasses = [newClass, ...prevClasses]
          return updatedClasses.slice(0, classesPerPage) // Ensure max items per page
        })
        setTotalItems((prevTotalItems) => prevTotalItems + 1) // Update total items count
        console.log(
          '[ClassesPage] Optimistically added new class. Triggering re-fetch for consistency.',
        )
        // Still re-fetch to ensure pagination and filtering are correct,
        // especially if a class was pushed off the current page or filtering is active.
        fetchClasses(page, searchCode)
      } else {
        // If not on page 1 or current page is full, just re-fetch
        console.log('[ClassesPage] New class added, re-fetching data.')
        fetchClasses(page, searchCode)
      }
    } else {
      // Fallback if newClass is somehow null/undefined, just re-fetch
      console.log('[ClassesPage] New class object was null, forcing re-fetch.')
      fetchClasses(page, searchCode)
    }
  }

  const handleSearch = (e) => {
    setSearchCode(e.target.value)
    setPage(1) // Reset về trang 1 khi tìm kiếm
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleEditClick = (classItem) => {
    setSelectedClass(classItem)
    setEditClassName(classItem.className)
    setEditClassCode(classItem.classCode)
    setEditAcademicYear(classItem.academicYear || '')
    // Populate new schedule states for editing
    setEditStartDate(classItem.startDate ? new Date(classItem.startDate) : null)
    setEditTotalSessions(classItem.totalSessions ? classItem.totalSessions.toString() : '')
    setEditScheduleDays(classItem.scheduleDays || [])
    setEditScheduleTime(classItem.scheduleTime || '')
    setIsEditModalOpen(true)
  }

  const handleUpdateClass = async () => {
    if (!selectedClass) return

    try {
      /** @type {UpdateClassDto} */
      const updateDto = {
        className: editClassName,
        classCode: editClassCode,
        academicYear: editAcademicYear.trim() || undefined,
        // Include new schedule fields
        startDate: editStartDate ? editStartDate.toISOString().split('T')[0] : undefined,
        totalSessions: editTotalSessions ? parseInt(editTotalSessions, 10) : undefined,
        scheduleDays: editScheduleDays.length > 0 ? editScheduleDays : undefined,
        scheduleTime: editScheduleTime.trim() || undefined,
      }
      console.log('[ClassesPage] Attempting to update class with data:', updateDto)
      await updateClass(selectedClass.id, updateDto)
      setIsEditModalOpen(false)
      toast.success('Cập nhật lớp học thành công!')
      fetchClasses(page, searchCode) // Refresh data
    } catch (error) {
      console.error('[ClassesPage] Error updating class:', error)
      toast.error(error.message || 'Có lỗi khi cập nhật lớp học.')
    }
  }

  const handleDeleteClick = (classItem) => {
    setSelectedClass(classItem)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedClass) return

    try {
      console.log(`[ClassesPage] Attempting to delete class with ID: ${selectedClass.id}`)
      await deleteClass(selectedClass.id)
      setIsDeleteModalOpen(false)
      toast.success('Xóa lớp học thành công!')
      // After deleting, re-fetch to ensure the list is up-to-date and pagination correct
      fetchClasses(page, searchCode)
    } catch (error) {
      console.error('[ClassesPage] Error deleting class:', error)
      toast.error(error.message || 'Có lỗi khi xóa lớp học.')
    }
  }

  const totalPages = Math.ceil(totalItems / classesPerPage)

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quản Lý Lớp Học</strong>
          </CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <CFormInput
                type="text"
                placeholder="Tìm kiếm theo mã lớp..."
                value={searchCode}
                onChange={handleSearch}
                className="w-25"
              />
              <CButton color="primary" onClick={() => setIsAddModalOpen(true)}>
                <CIcon icon={cilPlus} className="me-2" />
                Thêm lớp học
              </CButton>
            </div>

            {loading ? (
              <p>Đang tải danh sách lớp học...</p>
            ) : (
              <>
                <CTable hover responsive bordered className="text-center">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col" className="text-center">
                        STT
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Tên lớp
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Mã lớp
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Năm học
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Ngày bắt đầu
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Tổng buổi
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Lịch học
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Giờ học
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center">
                        Hành động
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {classes.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={9} className="text-center">
                          Không có dữ liệu lớp học.
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      classes.map((classItem, index) => (
                        <CTableRow key={classItem.id}>
                          <CTableDataCell>{(page - 1) * classesPerPage + index + 1}</CTableDataCell>
                          <CTableDataCell>{classItem.className}</CTableDataCell>
                          <CTableDataCell>{classItem.classCode}</CTableDataCell>
                          <CTableDataCell>{classItem.academicYear || 'N/A'}</CTableDataCell>
                          <CTableDataCell>
                            {classItem.startDate
                              ? new Date(classItem.startDate).toLocaleDateString('vi-VN')
                              : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>{classItem.totalSessions || 'N/A'}</CTableDataCell>
                          <CTableDataCell>
                            {classItem.scheduleDays?.join(', ') || 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>{classItem.scheduleTime || 'N/A'}</CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditClick(classItem)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(classItem)}
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

      {/* Modal Thêm Lớp Học */}
      <CModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        scrollable
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Thêm lớp học mới</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* onClassAdded giờ truyền tham số newClass */}
          <AddClassForm onClassSaved={handleClassAdded} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsAddModalOpen(false)}>
            Hủy
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Chỉnh Sửa Lớp Học */}
      <CModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        scrollable
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Chỉnh sửa lớp học</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedClass && (
            <CForm>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="editClassName">Tên lớp</CFormLabel>
                  <CFormInput
                    type="text"
                    id="editClassName"
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="editClassCode">Mã lớp</CFormLabel>
                  <CFormInput
                    type="text"
                    id="editClassCode"
                    value={editClassCode}
                    onChange={(e) => setEditClassCode(e.target.value)}
                    required
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="editAcademicYear">Năm học</CFormLabel>
                  <CFormInput
                    type="text"
                    id="editAcademicYear"
                    value={editAcademicYear}
                    onChange={(e) => setEditAcademicYear(e.target.value)}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="editStartDate">Ngày bắt đầu</CFormLabel>
                  <DatePicker
                    id="editStartDate"
                    selected={editStartDate}
                    onChange={(date) => setEditStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    placeholderText="Chọn ngày bắt đầu"
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="editTotalSessions">Tổng số buổi học</CFormLabel>
                  <CFormInput
                    type="number"
                    id="editTotalSessions"
                    value={editTotalSessions}
                    onChange={(e) => setEditTotalSessions(e.target.value)}
                    min="1"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="editScheduleTime">Giờ học</CFormLabel>
                  <CFormInput
                    type="time"
                    id="editScheduleTime"
                    value={editScheduleTime}
                    onChange={(e) => setEditScheduleTime(e.target.value)}
                  />
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormLabel>Các ngày trong tuần</CFormLabel>
                <CRow>
                  {daysOfWeek.map((day) => (
                    <CCol xs={6} sm={4} md={3} lg={2} key={day}>
                      <CFormCheck
                        id={`edit-day-${day}`}
                        label={day}
                        checked={editScheduleDays.includes(day)}
                        onChange={() => handleEditDayChange(day)}
                      />
                    </CCol>
                  ))}
                </CRow>
              </div>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsEditModalOpen(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleUpdateClass}>
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
          Bạn có chắc chắn muốn xóa lớp học "{selectedClass?.className}" (Mã:{' '}
          {selectedClass?.classCode})?
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

export default ClassesPage
