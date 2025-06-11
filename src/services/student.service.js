// src/services/student.service.js
import apiClient from '../utils/apiClient' // Đảm bảo đường dẫn đúng tới apiClient

// Hàm lấy tất cả học sinh
export const getAllStudents = async (query = {}) => {
  try {
    const queryString = new URLSearchParams(query).toString()
    const url = `/students${queryString ? `?${queryString}` : ''}`
    const data = await apiClient(url, {
      method: 'GET',
    })
    // Trả về toàn bộ response, giả định backend trả về { data: [...], total: ... }
    return data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách học sinh:', error)
    throw error
  }
}

// Hàm thêm học sinh mới (có thể dùng kèm phụ huynh mới)
// studentData có thể chứa:
//   fullName, dateOfBirth, age, gender, classCode (optional)
//   parentId (nếu chọn phụ huynh hiện có, optional)
//   newParent {fullName, phoneNumber, email, address} (nếu tạo phụ huynh mới, optional)
export const createStudent = async (studentData) => {
  try {
    const data = await apiClient('/students', {
      // Endpoint mặc định cho tạo học sinh
      method: 'POST',
      body: JSON.stringify(studentData),
    })
    return data
  } catch (error) {
    console.error('Lỗi khi thêm học sinh:', error)
    throw error
  }
}

// Hàm mới: Tạo học sinh kèm phụ huynh (có thể là phụ huynh mới hoặc hiện có)
export const createStudentWithParent = async (payload) => {
  try {
    // Endpoint này được định nghĩa ở backend là /students/create-with-parent
    const data = await apiClient('/students/create-with-parent', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return data
  } catch (error) {
    console.error('Lỗi khi thêm học sinh kèm phụ huynh:', error)
    throw error
  }
}

// Hàm cập nhật học sinh
// studentData có thể chứa:
//   fullName, dateOfBirth, age, gender, classCode (optional)
//   parentId (có thể là null để gỡ gán phụ huynh, optional)
export const updateStudent = async (id, studentData) => {
  try {
    const data = await apiClient(`/students/${id}`, {
      method: 'PATCH', // Sử dụng PATCH để cập nhật một phần
      body: JSON.stringify(studentData),
    })
    return data
  } catch (error) {
    console.error('Lỗi khi cập nhật học sinh:', error)
    throw error
  }
}

// Hàm xóa học sinh
export const deleteStudent = async (id) => {
  try {
    await apiClient(`/students/${id}`, {
      method: 'DELETE',
    })
    return { message: 'Xóa học sinh thành công.' }
  } catch (error) {
    console.error('Lỗi khi xóa học sinh:', error)
    throw error
  }
}

// Hàm lấy tất cả phụ huynh (cần cho AddEditStudentForm)
// Giả định bạn có ParentEntity và ParentController ở backend
export const getAllParents = async () => {
  try {
    const data = await apiClient('/parents', {
      // Endpoint API cho phụ huynh
      method: 'GET',
    })
    return data // Trả về toàn bộ response, giả định backend trả về { data: [...], total: ... }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phụ huynh:', error)
    throw error
  }
}
