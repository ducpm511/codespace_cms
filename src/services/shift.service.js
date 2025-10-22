import apiClient from '../utils/apiClient';

export const getAllShifts = () => {
  return apiClient('/shifts');
};

export const createShift = (shiftData) => {
  return apiClient('/shifts', {
    method: 'POST',
    body: JSON.stringify(shiftData),
  });
};

export const updateShift = (id, shiftData) => {
  return apiClient(`/shifts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(shiftData),
  });
};

export const deleteShift = (id) => {
  return apiClient(`/shifts/${id}`, {
    method: 'DELETE',
  });
};