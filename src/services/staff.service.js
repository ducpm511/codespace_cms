import apiClient from '../utils/apiClient'

export const getStaffs = async ({ page = 1, limit = 10, search = '', role = '' }) => {
  const params = new URLSearchParams()
  if (page) params.append('page', page)
  if (limit) params.append('limit', limit)
  if (search) params.append('search', search)
  if (role) params.append('role', role)

  return await apiClient(`/staffs?${params.toString()}`, {
    method: 'GET',
  })
}

export const getAllStaff = () => {
  return apiClient('/staffs', {
    method: 'GET',
  })
}

export const getStaffDetails = async (id) => {
  return await apiClient(`/staffs/${id}`, {
    method: 'GET',
  })
}

export const createStaff = async (staffData) => {
  return await apiClient('/staffs', {
    method: 'POST',
    body: JSON.stringify(staffData),
  })
}

export const updateStaff = async (id, staffData) => {
  return await apiClient(`/staffs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(staffData),
  })
}

export const deleteStaff = async (id) => {
  return await apiClient(`/staffs/${id}`, {
    method: 'DELETE',
  })
}
