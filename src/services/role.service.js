import apiClient from '../utils/apiClient'

export const getAllRoles = () => {
  return apiClient('/roles')
}
export const createRole = (roleData) => {
  return apiClient('/roles', {
    method: 'POST',
    body: JSON.stringify(roleData),
  })
}

export const updateRole = (id, roleData) => {
  return apiClient(`/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(roleData),
  })
}

export const deleteRole = (id) => {
  return apiClient(`/roles/${id}`, {
    method: 'DELETE',
  })
}
