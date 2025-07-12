import apiClient from '../utils/apiClient'

// Lấy danh sách báo cáo (có phân trang, tìm kiếm theo tên học sinh, lọc theo classId)
export const getStudentReports = async ({ page = 1, limit = 10, search = '', classId = '' }) => {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('limit', limit)
  if (search) params.append('search', search)
  if (classId) params.append('classId', classId)

  return await apiClient(`/student-reports?${params.toString()}`, {
    method: 'GET',
  })
}

// Xoá báo cáo
export const deleteStudentReport = async (id) => {
  return await apiClient(`/student-reports/${id}`, {
    method: 'DELETE',
  })
}

// Upload file PDF (trả về link)
export const uploadPdf = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return await apiClient('/student-reports/upload-pdf', {
    method: 'POST',
    body: formData,
    headers: {
      // FormData sẽ tự đặt Content-Type là multipart/form-data
      // nên KHÔNG cần đặt Content-Type ở đây
    },
  })
}

// Tạo report mới
export const createStudentReport = async ({
  studentId,
  classId,
  pdfFiles = [],
  youtubeLinks = [],
  scratchProjects = [],
}) => {
  const payload = {
    studentId,
    classId,
    pdfFiles, // mỗi phần tử: { url, type, score }
    youtubeLinks,
    scratchProjects, // mỗi phần tử: { embedCode, name, description }
  }

  console.log('Payload gửi lên:', payload)

  return await apiClient('/student-reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Cập nhật report
export const updateStudentReport = async (
  id,
  { studentId, classId, pdfFiles = [], youtubeLinks = [], scratchProjects = [] },
) => {
  const payload = {
    studentId,
    classId,
    pdfFiles,
    youtubeLinks,
    scratchProjects,
  }

  return await apiClient(`/student-reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
