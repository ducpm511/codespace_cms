// src/services/class.service.js
import apiClient from '../utils/apiClient' // Import apiClient

// Hàm lấy tất cả lớp học
export const getAllClasses = async () => {
  try {
    const data = await apiClient('/classes', {
      method: 'GET',
    })
    return data
  } catch (error) {
    console.error('Error in getAllClasses:', error)
    throw error
  }
}

// Hàm thêm lớp học
export const createClass = async (classData) => {
  try {
    const data = await apiClient('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    })
    console.log('Class created successfully:', data)
    return data
  } catch (error) {
    console.error('Error in createClass:', error)
    throw error
  }
}

// Hàm cập nhật lớp học
// classData có thể chứa className, classCode, academicYear
export const updateClass = async (id, classData) => {
  try {
    const data = await apiClient(`/classes/${id}`, {
      // Endpoint API cho cập nhật lớp học
      method: 'PATCH', // Sử dụng PATCH cho cập nhật một phần
      body: JSON.stringify(classData),
    })
    return data
  } catch (error) {
    console.error('Lỗi khi cập nhật lớp học:', error)
    throw error
  }
}

// Hàm xóa lớp học
export const deleteClass = async (id) => {
  try {
    await apiClient(`/classes/${id}`, {
      method: 'DELETE',
    })
    return { message: 'Xóa lớp học thành công.' }
  } catch (error) {
    console.error('Error in deleteClass:', error)
    throw error
  }
}

export const getScheduleFromSessions = async (id) => {
  try {
    const data = await apiClient(`/class-sessions/schedule/${id}`, {
      method: 'GET',
    })
    return data
  } catch (error) {
    console.error('Error in getScheduleFromSessions:', error)
    throw error
  }
}
