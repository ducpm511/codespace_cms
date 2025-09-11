// Giả định file apiClient nằm trong thư mục utils ở cấp cao hơn
import apiClient from '../utils/apiClient'

/**
 * @typedef {Object} StudentSession
 * @property {number} id - Session ID
 * @property {string} subjectName
 * @property {string} sessionDate - ISO Date string (YYYY-MM-DD)
 * @property {string} startTime
 * @property {string} endTime
 */

/**
 * Lấy danh sách buổi học có thể điểm danh của một học sinh.
 * @param {number} studentId
 * @returns {Promise<StudentSession[]>}
 */
export const getStudentSessionsForAttendance = (studentId) => {
  // Đối với request GET, chỉ cần truyền endpoint.
  return apiClient(`/attendances/student-class-sessions/${studentId}`)
}

/**
 * Gửi yêu cầu điểm danh thủ công.
 * @param {object} payload
 * @param {number} payload.studentId
 * @param {number[]} payload.sessionIds
 * @returns {Promise<any>}
 */
export const manualAttendance = (payload) => {
  // Đối với request POST, cần truyền endpoint và một object options.
  const options = {
    method: 'POST',
    body: JSON.stringify(payload), // Body phải được chuyển thành chuỗi JSON
  }
  return apiClient('/attendances/manual', options)
}
