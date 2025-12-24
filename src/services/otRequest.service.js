import apiClient from '../utils/apiClient'

/**
 * Lấy danh sách yêu cầu OT (có thể lọc theo trạng thái).
 * @param {string} [status] - 'pending', 'approved', 'rejected' (tùy chọn)
 * @returns {Promise<any>}
 */
export const getOtRequests = (status, staffId) => {
  const params = status ? new URLSearchParams({ status, staffId }).toString() : ''
  return apiClient(`/ot-requests?${params}`)
}

/**
 * Cập nhật trạng thái của một yêu cầu OT.
 * @param {number} id ID của yêu cầu OT
 * @param {object} data Dữ liệu cập nhật
 * @param {'approved' | 'rejected'} data.status Trạng thái mới
 * @param {string} [data.notes] Ghi chú của người duyệt (tùy chọn)
 * @returns {Promise<any>}
 */
export const updateOtRequestStatus = (id, data) => {
  return apiClient(`/ot-requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
