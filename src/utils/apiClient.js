// src/utils/apiClient.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000' // Đảm bảo có fallback URL

// Hàm này lấy token từ localStorage.
const getToken = () => {
  return localStorage.getItem('accessToken')
}

const getRefreshToken = () => {
  return localStorage.getItem('refreshToken')
}

// Hàm mới để làm mới token
const refreshAuthTokens = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    console.error('Không có refresh token. Chuyển hướng đến trang đăng nhập.')
    // Chuyển hướng người dùng đến trang đăng nhập
    window.location.href = '/login'
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`, // Gửi refresh token trong Authorization header
      },
      // body: JSON.stringify({ refreshToken }), // Backend của bạn nhận refresh token qua header, không cần body
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Lỗi khi làm mới token.')
    }

    const data = await response.json()
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return data.accessToken // Trả về access token mới
  } catch (error) {
    console.error('Làm mới token thất bại:', error)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login' // Chuyển hướng nếu làm mới thất bại
    return null
  }
}

/**
 * Hàm trợ giúp để thực hiện các HTTP request.
 * @param {string} endpoint Đường dẫn API (ví dụ: '/classes')
 * @param {Object} options Tùy chọn cho request (method, headers, body, _retry)
 * @returns {Promise<any>} Dữ liệu trả về từ API
 * @throws {Error} Nếu request không thành công
 */
const apiClient = async (endpoint, options = {}) => {
  const token = getToken()
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Xử lý lỗi 401 (Unauthorized)
    if (response.status === 401 && !options._retry) {
      options._retry = true // Đánh dấu là đã thử lại
      console.warn('Access token hết hạn hoặc không hợp lệ. Đang cố gắng làm mới...')

      const newAccessToken = await refreshAuthTokens()

      if (newAccessToken) {
        // Cập nhật token trong header và thử lại request gốc
        config.headers['Authorization'] = `Bearer ${newAccessToken}`
        response = await fetch(`${API_BASE_URL}${endpoint}`, config) // Thử lại request
      } else {
        // Không thể làm mới token, dừng lại
        throw new Error('Không thể làm mới token. Vui lòng đăng nhập lại.')
      }
    }

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        // Nếu server không trả về JSON, vẫn throw lỗi
        throw new Error(`Lỗi mạng hoặc server không phản hồi JSON. Status: ${response.status}`)
      }

      const errorMessage = errorData.message || `Lỗi API: ${response.statusText}`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = errorData
      throw error
    }

    if (response.status === 204) {
      return null
    }

    const data = await response.json()
    console.log('API Client: Received data for', endpoint, data)
    return data
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
    }
    console.error('API Client Error:', error) // Đổi err thành error
    throw error
  }
}

export default apiClient
