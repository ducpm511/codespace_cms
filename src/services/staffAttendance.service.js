import apiClient from '../utils/apiClient'

/**
 * Gửi dữ liệu quét QR lên server để chấm công.
 * @param {string} qrCodeData Dữ liệu từ mã QR
 * @param {boolean} confirm Cờ xác nhận check-out
 * @returns {Promise<any>}
 */
export const scanStaffAttendance = (qrCodeData, confirm = false) => {
  return apiClient('/staff-attendances/scan', {
    method: 'POST',
    body: JSON.stringify({ qrCodeData, confirm }),
  })
}

/**
 * Lấy danh sách chấm công của 1 nhân viên theo ngày
 * @param {string} staffId
 * @param {string} date (YYYY-MM-DD)
 */
export const getAttendanceByDate = (staffId, date) => {
  const params = new URLSearchParams({ staffId, date }).toString()
  return apiClient(`/staff-attendances/manual?${params}`)
}

/**
 * Admin tạo một bản ghi chấm công mới
 * @param {object} data
 * @param {number} data.staffId
 * @param {string} data.timestamp (Chuỗi ISO đầy đủ, vd: '2025-11-16T10:30:00.000Z')
 * @param {'check-in' | 'check-out'} data.type
 */
export const createManualAttendance = (data) => {
  return apiClient('/staff-attendances/manual', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Admin cập nhật giờ của một bản ghi chấm công
 * @param {number} id
 * @param {object} data
 * @param {string} data.timestamp (Chuỗi ISO đầy đủ)
 */
export const updateManualAttendance = (id, data) => {
  return apiClient(`/staff-attendances/manual/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Admin xóa một bản ghi chấm công
 * @param {number} id
 */
export const deleteManualAttendance = (id) => {
  return apiClient(`/staff-attendances/manual/${id}`, {
    method: 'DELETE',
  })
}
