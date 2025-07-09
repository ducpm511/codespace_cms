import apiClient from '../utils/apiClient'

export const getUsers = async ({ page = 1, limit = 10, search = '', role = '' }) => {
  const params = new URLSearchParams()
  if (page) params.append('page', page)
  if (limit) params.append('limit', limit)
  if (search) params.append('search', search)
  if (role) params.append('role', role)

  return await apiClient(`/users?${params.toString()}`, {
    method: 'GET',
  })
}

export const createUser = async (userData) => {
  return await apiClient('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

export const updateUser = async (id, userData) => {
  return await apiClient(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  })
}

export const deleteUser = async (id) => {
  return await apiClient(`/users/${id}`, {
    method: 'DELETE',
  })
}
