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
