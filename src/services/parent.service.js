// src/services/parent.service.js
import apiClient from '../utils/apiClient' // Đảm bảo đường dẫn đúng

/**
 * @typedef {Object} Parent
 * @property {number} id
 * @property {string} fullName
 * @property {string} phoneNumber
 * @property {string} address
 * @property {string} [job]
 */

/**
 * @typedef {Object} CreateParentDto
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

/**
 * Lấy tất cả danh sách phụ huynh.
 * @returns {Promise<Parent[]>}
 */
export const getAllParents = async () => {
  try {
    const data = await apiClient('/parents', {
      method: 'GET',
    })
    return data
  } catch (error) {
    console.error('Error in getAllParents:', error)
    throw error
  }
}

/**
 * Tạo một phụ huynh mới.
 * @param {CreateParentDto} parentData - Dữ liệu phụ huynh mới.
 * @returns {Promise<Parent>}
 */
export const createParent = async (parentData) => {
  try {
    const data = await apiClient('/parents', {
      method: 'POST',
      body: JSON.stringify(parentData),
    })
    return data
  } catch (error) {
    console.error('Error in createParent:', error)
    throw error
  }
}

/**
 * Cập nhật thông tin phụ huynh.
 * @param {number} id - ID của phụ huynh cần cập nhật.
 * @param {UpdateParentDto} parentData - Dữ liệu phụ huynh cần cập nhật.
 * @returns {Promise<Parent>}
 */
export const updateParent = async (id, parentData) => {
  try {
    const data = await apiClient(`/parents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(parentData),
    })
    return data
  } catch (error) {
    console.error('Error in updateParent:', error)
    throw error
  }
}

/**
 * Xóa một phụ huynh.
 * @param {number} id - ID của phụ huynh cần xóa.
 * @returns {Promise<{ message: string }>}
 */
export const deleteParent = async (id) => {
  try {
    await apiClient(`/parents/${id}`, {
      method: 'DELETE',
    })
    return { message: 'Xóa phụ huynh thành công.' }
  } catch (error) {
    console.error('Error in deleteParent:', error)
    throw error
  }
}

/**
 * Lấy danh sách học sinh của một phụ huynh.
 * @param {number} parentId - ID của phụ huynh.
 * @returns {Promise<StudentEntity[]>} // Giả định StudentEntity giống backend
 */
export const getStudentsByParentId = async (parentId) => {
  try {
    const data = await apiClient(`/parents/${parentId}/students`, {
      method: 'GET',
    })
    return data
  } catch (error) {
    console.error(`Error in getStudentsByParentId for parent ${parentId}:`, error)
    throw error
  }
}
