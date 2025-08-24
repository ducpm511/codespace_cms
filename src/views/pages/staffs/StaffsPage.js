// src/views/pages/staffs/StaffsPage.js
import React, { useEffect, useState, useRef } from 'react'
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
import { cilPencil, cilPlus, cilTrash, cilQrCode } from '@coreui/icons'
import { toast } from 'react-toastify'
import { getStaffs, createStaff, updateStaff, deleteStaff } from '../../../services/staff.service'
import StaffModal from '../../../components/staffs/StaffModal'
import { QRCodeCanvas } from 'qrcode.react'

const StaffsPage = () => {
  const [staffs, setStaffs] = useState([])
  const [page, setPage] = useState(1)
  const staffsPerPage = 10
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [qrData, setQrData] = useState(null)
  const qrRef = useRef(null)
  const fetchStaffs = async () => {
    try {
      const response = await getStaffs({ page, limit: staffsPerPage, search })
      const data = response

      console.log('Dữ liệu nhân viên:', response)
      setStaffs(data)
      // setTotalItems(meta.total)
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error)
      toast.error('Lỗi khi tải danh sách người dùng')
    }
  }

  useEffect(() => {
    fetchStaffs()
  }, [page, search, roleFilter])

  const handleAddClick = () => {
    setIsEditing(false)
    setSelectedStaff(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (staff) => {
    setIsEditing(true)
    setSelectedStaff(staff)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
    try {
      await deleteStaff(id)
      toast.success('Xóa người dùng thành công')
      fetchStaffs()
    } catch (error) {
      toast.error('Lỗi khi xóa người dùng')
    }
  }

  const handleSaveStaff = async (staffData) => {
    try {
      if (isEditing) {
        await updateStaff(selectedStaff.id, staffData)
        toast.success('Cập nhật người dùng thành công')
      } else {
        await createStaff(staffData)
        toast.success('Thêm người dùng thành công')
      }
      setIsModalOpen(false)
      fetchStaffs()
    } catch (error) {
      toast.error('Lỗi khi lưu người dùng')
    }
  }

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return alert('Không tìm thấy mã QR')

    const pngUrl = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    const staffName = selectedStaff?.fullName?.replace(/\s+/g, '_') || 'staff'
    downloadLink.href = pngUrl
    downloadLink.download = `${staffName}_qr-code.png`
    downloadLink.click()
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quản lý nhân viên</strong>
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
                <option value="TEACHER">Giáo viên</option>
                <option value="TEACHING_ASSISTANT">Trợ giảng</option>
                <option value="ADMIN">Quản trị viên</option>
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
                  <CTableHeaderCell>SĐT</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Vai trò</CTableHeaderCell>
                  <CTableHeaderCell>Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {staffs.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={5} className="text-center">
                      Không có dữ liệu nhân viên.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  staffs.map((u, idx) => (
                    <CTableRow key={u.id}>
                      <CTableDataCell>{(page - 1) * staffsPerPage + idx + 1}</CTableDataCell>
                      <CTableDataCell>{u.fullName}</CTableDataCell>
                      <CTableDataCell>{u.phoneNumber}</CTableDataCell>
                      <CTableDataCell>{u.email}</CTableDataCell>
                      <CTableDataCell>{u.title}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="info"
                          className="me-2"
                          onClick={() => handleEditClick(u)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          size="sm"
                          className="me-2"
                          color="danger"
                          onClick={() => handleDelete(u.id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                        <CButton
                          color="info"
                          size="sm"
                          className="me-2"
                          onClick={() =>
                            u.id && setQrData(`staff_id:${u.id}`, u && setSelectedStaff(u))
                          }
                        >
                          <CIcon icon={cilQrCode} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>

            <CPagination align="center" className="mt-3">
              {[...Array(Math.ceil(totalItems / staffsPerPage))].map((_, i) => (
                <CPaginationItem key={i} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </CPaginationItem>
              ))}
            </CPagination>
          </CCardBody>
        </CCard>
      </CCol>

      <StaffModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
        initialData={selectedStaff}
        isEditing={isEditing}
      />

      <CModal visible={!!qrData} onClose={() => setQrData(null)}>
        <CModalHeader>
          <CModalTitle>Mã QR nhân viên</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center" ref={qrRef}>
          {qrData && (
            <>
              <QRCodeCanvas value={qrData} size={256} />
              <p className="mt-3">
                <a href={qrData} target="_blank" rel="noreferrer">
                  {qrData}
                </a>
              </p>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setQrData(null)}>
            Đóng
          </CButton>
          <CButton color="primary" onClick={downloadQR}>
            Tải mã QR
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default StaffsPage
