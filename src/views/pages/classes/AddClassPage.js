// src/views/pages/classes/AddClassPage.js
import React from 'react'
import AddClassForm from '../../../components/classes/AddClassForm'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { toast } from 'react-toastify' // Import toast

const AddClassPage = () => {
  // Đổi tên hàm từ handleClassAdded thành handleClassSaved để khớp với prop name trong AddClassForm
  const handleClassSaved = (savedClass) => {
    // console.log(`Lớp học "${savedClass.className}" đã được thêm/cập nhật thành công! (ID: ${savedClass.id})`)
    toast.success(`Lớp học "${savedClass.className}" đã được lưu thành công!`) // Thông báo toast thay vì alert
    // Xử lý sau khi lưu thành công (ví dụ: chuyển hướng, cập nhật danh sách, đóng modal nếu đang dùng modal)
    // Hiện tại, AddClassPage chỉ hiển thị form, không có logic đóng modal.
    // Nếu bạn muốn đóng modal sau khi lưu, logic đó sẽ nằm ở component cha của AddClassPage.
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Thêm/Cập nhật lớp học</strong>
          </CCardHeader>
          <CCardBody>
            {/* Truyền prop là onClassSaved để khớp với AddClassForm */}
            <AddClassForm onClassSaved={handleClassSaved} />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddClassPage
