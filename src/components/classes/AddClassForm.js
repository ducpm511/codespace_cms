// src/components/classes/AddClassForm.js
import React, { useState, useEffect } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow, // Import CRow để sắp xếp layout
  CCol, // Import CCol để sắp xếp layout
  CFormFeedback, // Import CFormFeedback để hiển thị lỗi validation
  CFormCheck, // Để chọn ngày trong tuần
} from '@coreui/react'
import DatePicker from 'react-datepicker' // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css' // Import CSS cho DatePicker
import { toast } from 'react-toastify'
import { createClass, updateClass } from '../../services/class.service' // Import createClass và updateClass

const daysOfWeekOptions = [
  { label: 'Thứ Hai', value: 'Monday' },
  { label: 'Thứ Ba', value: 'Tuesday' },
  { label: 'Thứ Tư', value: 'Wednesday' },
  { label: 'Thứ Năm', value: 'Thursday' },
  { label: 'Thứ Sáu', value: 'Friday' },
  { label: 'Thứ Bảy', value: 'Saturday' },
  { label: 'Chủ Nhật', value: 'Sunday' },
]

const AddClassForm = ({ mode = 'add', initialData = {}, onClassSaved }) => {
  const [className, setClassName] = useState('')
  const [classCode, setClassCode] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  // Scheduling fields
  const [startDate, setStartDate] = useState(null) // Date object
  const [totalSessions, setTotalSessions] = useState('')
  const [scheduleDays, setScheduleDays] = useState([]) // Array of strings (e.g., ['Monday', 'Friday'])
  const [scheduleTime, setScheduleTime] = useState('') // String 'HH:MM'

  const [formValidated, setFormValidated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // This is the key state for disabling inputs

  useEffect(() => {
    // console.log('useEffect triggered for mode:', mode, 'initialData:', initialData); // Để gỡ lỗi
    if (mode === 'edit' && initialData) {
      setClassName(initialData.className || '')
      setClassCode(initialData.classCode || '')
      setAcademicYear(initialData.academicYear || '')
      // Đảm bảo startDate là Date object nếu tồn tại
      setStartDate(initialData.startDate ? new Date(initialData.startDate) : null)
      setTotalSessions(initialData.totalSessions || '')
      setScheduleDays(initialData.scheduleDays || [])
      setScheduleTime(initialData.scheduleTime || '')
    } else {
      // Reset form for 'add' mode
      setClassName('')
      setClassCode('')
      setAcademicYear('')
      setStartDate(null)
      setTotalSessions('')
      setScheduleDays([])
      setScheduleTime('')
    }
    setFormValidated(false) // Reset validation on data change
    setIsSubmitting(false) // Ensure inputs are enabled when data changes or mode changes
  }, [mode, JSON.stringify(initialData)]) // THAY ĐỔI LỚN NHẤT: Sử dụng JSON.stringify để theo dõi nội dung của initialData

  const handleScheduleDayChange = (dayValue) => {
    setScheduleDays((prevDays) =>
      prevDays.includes(dayValue)
        ? prevDays.filter((day) => day !== dayValue)
        : [...prevDays, dayValue],
    )
  }

  const validateForm = () => {
    let isValid = true
    if (!className.trim()) {
      isValid = false
      toast.error('Tên lớp học không được để trống.')
    }
    if (!classCode.trim()) {
      isValid = false
      toast.error('Mã lớp học không được để trống.')
    }
    if (!academicYear.trim()) {
      isValid = false
      toast.error('Năm học không được để trống.')
    }

    // Validate scheduling fields if they are intended to be required for generating sessions
    // If any scheduling field is given, all must be given.
    const isSchedulingInfoProvided =
      startDate || totalSessions || scheduleDays.length > 0 || scheduleTime

    if (isSchedulingInfoProvided) {
      if (!startDate) {
        isValid = false
        toast.error('Vui lòng cung cấp Ngày bắt đầu nếu bạn muốn thiết lập lịch học.')
      }
      if (!totalSessions || parseInt(totalSessions, 10) <= 0) {
        isValid = false
        toast.error('Tổng số buổi học phải là số nguyên dương.')
      }
      if (scheduleDays.length === 0) {
        isValid = false
        toast.error('Vui lòng chọn ít nhất một ngày trong tuần.')
      }
      if (!scheduleTime) {
        isValid = false
        toast.error('Vui lòng nhập thời gian học.')
      }
    }
    return isValid
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormValidated(true) // Kích hoạt hiển thị lỗi validation của form CoreUI

    if (isSubmitting) return // Ngăn chặn gửi nhiều lần nếu đang trong quá trình submit

    // Kiểm tra validation trước khi đặt isSubmitting = true
    if (!validateForm()) {
      setIsSubmitting(false) // Đảm bảo inputs không bị vô hiệu hóa nếu form không hợp lệ
      return
    }

    setIsSubmitting(true) // Bắt đầu trạng thái submit

    const classData = {
      className,
      classCode,
      academicYear,
      // Convert Date object to ISO string if not null
      startDate: startDate ? startDate.toISOString().split('T')[0] : null, // Chỉ lấy phần ngày-MM-DD
      totalSessions: totalSessions ? parseInt(totalSessions, 10) : null,
      scheduleDays: scheduleDays.length > 0 ? scheduleDays : null,
      scheduleTime: scheduleTime || null,
    }

    try {
      let savedClass
      if (mode === 'add') {
        savedClass = await createClass(classData)
        toast.success('Lớp học đã được thêm thành công!')
      } else {
        savedClass = await updateClass(initialData.id, classData) // Sử dụng updateClass
        toast.success('Lớp học đã được cập nhật thành công!')
      }
      onClassSaved(savedClass) // Gọi callback để refresh list và đóng modal
    } catch (error) {
      console.error(`Lỗi khi ${mode === 'add' ? 'thêm' : 'cập nhật'} lớp học:`, error)
      toast.error(error.message || `Có lỗi khi ${mode === 'add' ? 'thêm' : 'cập nhật'} lớp học.`)
    } finally {
      setIsSubmitting(false) // Luôn bật lại inputs sau khi submit hoàn tất (thành công hoặc lỗi)
    }
  }

  return (
    <CForm className={formValidated ? 'was-validated' : ''} onSubmit={handleSubmit} noValidate>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="className">
            Tên lớp <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            id="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            disabled={isSubmitting} // Sử dụng trạng thái để vô hiệu hóa
          />
          <CFormFeedback invalid>Vui lòng nhập Tên lớp.</CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="classCode">
            Mã lớp <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            id="classCode"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            required
            disabled={isSubmitting} // Sử dụng trạng thái để vô hiệu hóa
          />
          <CFormFeedback invalid>Vui lòng nhập Mã lớp.</CFormFeedback>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="academicYear">
            Năm học <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            id="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            required
            disabled={isSubmitting} // Sử dụng trạng thái để vô hiệu hóa
          />
          <CFormFeedback invalid>Vui lòng nhập Năm học.</CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="startDate">Ngày bắt đầu</CFormLabel>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            className={`form-control ${formValidated && startDate === null && (totalSessions || scheduleDays.length > 0 || scheduleTime) ? 'is-invalid' : ''}`}
            placeholderText="Chọn ngày bắt đầu (tùy chọn)"
            disabled={isSubmitting} // Sử dụng trạng thái để vô hiệu hóa
          />
          <CFormFeedback invalid>Vui lòng chọn ngày bắt đầu nếu thiết lập lịch học.</CFormFeedback>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="totalSessions">Tổng số buổi học</CFormLabel>
          <CFormInput
            type="number"
            id="totalSessions"
            value={totalSessions}
            onChange={(e) => setTotalSessions(e.target.value)}
            placeholder="Ví dụ: 48"
            disabled={isSubmitting} // Sử dụng trạng thái để vô hiệu hóa
            className={
              formValidated && startDate && (!totalSessions || totalSessions <= 0)
                ? 'is-invalid'
                : ''
            }
          />
          <CFormFeedback invalid>Tổng số buổi học phải là số nguyên dương.</CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="scheduleTime">Thời gian học (HH:MM:SS)</CFormLabel>
          <CFormInput
            type="time"
            id="scheduleTime"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            step="1" // Để hiển thị giây
            disabled={isSubmitting} // Sử dụng trạng thái để vô hiệu hóa
            className={formValidated && startDate && !scheduleTime ? 'is-invalid' : ''}
          />
          <CFormFeedback invalid>Vui lòng nhập thời gian học.</CFormFeedback>
        </CCol>
      </CRow>

      <div className="mb-3">
        <CFormLabel>Các ngày trong tuần</CFormLabel>
        <CRow>
          {daysOfWeekOptions.map((day) => (
            <CCol xs={6} sm={4} md={3} lg={2} key={day.value}>
              <CFormCheck
                id={`day-${day.value}`}
                label={day.label}
                checked={scheduleDays.includes(day.value)}
                onChange={() => handleScheduleDayChange(day.value)}
                disabled={isSubmitting} // Sử dụng trạng thái để vô hiệu hóa
                className="mb-1"
              />
            </CCol>
          ))}
        </CRow>
        <CFormFeedback
          invalid
          style={{
            display: formValidated && startDate && scheduleDays.length === 0 ? 'block' : 'none',
          }}
        >
          Vui lòng chọn ít nhất một ngày trong tuần.
        </CFormFeedback>
      </div>

      <CButton type="submit" color="primary" className="mt-3" disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : mode === 'add' ? 'Thêm lớp học' : 'Cập nhật lớp học'}
      </CButton>
    </CForm>
  )
}

export default AddClassForm
