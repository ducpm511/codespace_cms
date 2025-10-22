import apiClient from '../utils/apiClient'

/**
 * Lấy báo cáo lương theo khoảng thời gian và nhân viên.
 * @param {object} params
 * @param {string} params.fromDate - 'YYYY-MM-DD'
 * @param {string} params.toDate - 'YYYY-MM-DD'
 * @param {string} [params.staffId] - ID của nhân viên (tùy chọn)
 * @returns {Promise<any>}
 */
export const getPayrollReport = (params) => {
  const query = new URLSearchParams(params).toString()
  return apiClient(`/payroll/report?${query}`)
}
