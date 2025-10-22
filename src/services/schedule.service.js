import apiClient from '../utils/apiClient'

/**
 * Lấy tất cả các buổi học để hiển thị lên lịch.
 */
export const getAllClassSessions = () => {
  return apiClient('/class-sessions')
}

/**
 * Lấy tất cả các lịch phân công đã có.
 */
export const getAllStaffSchedules = () => {
  return apiClient('/staff-schedules')
}

export const assignStaffToSession = (assignmentData) => {
  return apiClient('/staff-schedules', {
    method: 'POST',
    body: JSON.stringify(assignmentData),
  })
}

export const assignShiftRange = (assignmentData) => {
  return apiClient('/staff-schedules/assign-shift-range', {
    method: 'POST',
    body: JSON.stringify(assignmentData),
  })
}

export const bulkAssignStaffToSession = (payload) => {
  return apiClient('/staff-schedules/bulk-assign-session', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Cập nhật ca làm việc cho một lịch phân công đã có.
 * @param {number} scheduleId ID của bản ghi StaffSchedule
 * @param {object} data Dữ liệu cập nhật (chỉ chứa shiftId mới)
 * @param {number} data.shiftId ID của ca làm việc mới
 * @returns {Promise<any>}
 */
export const updateShiftAssignment = (scheduleId, data) => {
  return apiClient(`/staff-schedules/${scheduleId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Xóa một lịch phân công ca làm việc.
 * @param {number} scheduleId ID của bản ghi StaffSchedule
 * @returns {Promise<any>}
 */
export const deleteShiftAssignment = (scheduleId) => {
  return apiClient(`/staff-schedules/${scheduleId}`, {
    method: 'DELETE',
  })
}
