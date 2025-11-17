import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CSpinner,
  CFormLabel,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'
import { DateTime } from 'luxon'

import { getAllStaff } from '../../../services/staff.service'
import {
  getAttendanceByDate,
  deleteManualAttendance,
} from '../../../services/staffAttendance.service'
import AddEditAttendanceModal from './AddEditStaffAttendanceModal'

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'

const ManageAttendancePage = () => {
  const [staffList, setStaffList] = useState([])
  const [loadingStaff, setLoadingStaff] = useState(true)

  // Filters
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Data
  const [records, setRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(false)

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [formMode, setFormMode] = useState('add')

  // Tải danh sách nhân viên 1 lần khi component mount
  useEffect(() => {
    const fetchStaff = async () => {
      setLoadingStaff(true)
      try {
        const staff = await getAllStaff()
        setStaffList(staff)
      } catch (error) {
        toast.error('Không thể tải danh sách nhân viên.')
      } finally {
        setLoadingStaff(false)
      }
    }
    fetchStaff()
  }, [])

  // Hàm tìm kiếm (gọi API)
  const handleSearch = async () => {
    if (!selectedStaffId || !selectedDate) {
      toast.warn('Vui lòng chọn nhân viên và ngày để xem.')
      return
    }
    setLoadingRecords(true)
    try {
      // TUÂN THỦ QUY TẮC VÀNG: Gửi chuỗi YYYY-MM-DD
      const dateStr = DateTime.fromJSDate(selectedDate).toFormat('yyyy-MM-dd')
      const data = await getAttendanceByDate(selectedStaffId, dateStr)
      setRecords(data)
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tải dữ liệu chấm công.')
    } finally {
      setLoadingRecords(false)
    }
  }

  // --- Modal Handlers ---
  const handleOpenAddModal = () => {
    setFormMode('add')
    setCurrentRecord(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (record) => {
    setFormMode('edit')
    setCurrentRecord(record)
    setIsModalOpen(true)
  }

  const handleOpenDeleteModal = (record) => {
    setCurrentRecord(record)
    setIsDeleteModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsModalOpen(false)
    setIsDeleteModalOpen(false)
    setCurrentRecord(null)
  }

  const handleOperationSuccess = () => {
    handleCloseModals()
    handleSearch() // Tải lại dữ liệu sau khi Thêm/Sửa/Xóa thành công
  }

  const handleConfirmDelete = async () => {
    if (!currentRecord) return
    try {
      await deleteManualAttendance(currentRecord.id)
      toast.success('Xóa bản ghi thành công!')
      handleOperationSuccess()
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa.')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quản lý Chấm công Thủ công</strong>
          </CCardHeader>
          <CCardBody>
            {/* --- BỘ LỌC --- */}
            <CRow className="mb-3 align-items-end">
              <CCol md={4}>
                <CFormLabel htmlFor="staffSelect">Nhân viên</CFormLabel>
                <CFormSelect
                  id="staffSelect"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  disabled={loadingStaff}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel htmlFor="dateSelect">Ngày</CFormLabel>
                <DatePicker
                  id="dateSelect"
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                />
              </CCol>
              <CCol md={3}>
                <CButton
                  color="primary"
                  onClick={handleSearch}
                  disabled={loadingRecords || !selectedStaffId}
                >
                  {loadingRecords ? <CSpinner size="sm" /> : 'Tìm kiếm'}
                </CButton>
              </CCol>
            </CRow>

            <hr />

            {/* --- BẢNG KẾT QUẢ --- */}
            <div className="d-flex justify-content-end mb-3">
              <CButton color="success" onClick={handleOpenAddModal} disabled={!selectedStaffId}>
                <CIcon icon={cilPlus} className="me-2" />
                Thêm bản ghi
              </CButton>
            </div>

            <CTable hover responsive bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Thời gian (Giờ:Phút:Giây)</CTableHeaderCell>
                  <CTableHeaderCell>Loại</CTableHeaderCell>
                  <CTableHeaderCell>Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loadingRecords ? (
                  <CTableRow>
                    <CTableDataCell colSpan={3} className="text-center">
                      <CSpinner />
                    </CTableDataCell>
                  </CTableRow>
                ) : records.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={3} className="text-center text-muted">
                      Không có dữ liệu.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  records.map((record) => (
                    <CTableRow key={record.id}>
                      <CTableDataCell>
                        {DateTime.fromISO(record.timestamp, { zone: 'utc' })
                          .setZone(VN_TIMEZONE)
                          .toFormat('HH:mm:ss')}
                      </CTableDataCell>
                      <CTableDataCell>
                        {record.type === 'check-in' ? 'Check-in' : 'Check-out'}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="info"
                          className="me-2"
                          onClick={() => handleOpenEditModal(record)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          onClick={() => handleOpenDeleteModal(record)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* --- CÁC MODALS --- */}
      <AddEditAttendanceModal
        visible={isModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleOperationSuccess}
        initialData={currentRecord}
        selectedDate={selectedDate}
        staffIdFromPage={selectedStaffId} // Truyền staffId đã chọn vào modal
      />

      <CModal visible={isDeleteModalOpen} onClose={handleCloseModals}>
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa bản ghi chấm công
          <strong> {currentRecord?.type}</strong> lúc
          <strong>
            {' '}
            {currentRecord
              ? DateTime.fromISO(currentRecord.timestamp).setZone(VN_TIMEZONE).toFormat('HH:mm:ss')
              : ''}
          </strong>
          ?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModals}>
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

export default ManageAttendancePage
