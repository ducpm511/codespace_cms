// src/components/classes/AddClassForm.js
import React, { useState, useEffect } from 'react'
import {
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CFormFeedback,
} from '@coreui/react'
import { cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'
import { createClass, updateClass, getScheduleFromSessions } from '../../services/class.service'

const daysOfWeekOptions = [
  { label: 'Thứ Hai', value: 'Monday' },
  { label: 'Thứ Ba', value: 'Tuesday' },
  { label: 'Thứ Tư', value: 'Wednesday' },
  { label: 'Thứ Năm', value: 'Thursday' },
  { label: 'Thứ Sáu', value: 'Friday' },
  { label: 'Thứ Bảy', value: 'Saturday' },
  { label: 'Chủ Nhật', value: 'Sunday' },
]

const AddClassForm = ({ mode = 'add', initialData = {}, setIsAddEditModalOpen }) => {
  const [className, setClassName] = useState('')
  const [classCode, setClassCode] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [totalSessions, setTotalSessions] = useState('')
  const [scheduleList, setScheduleList] = useState([{ day: '', time: '' }])

  const [formValidated, setFormValidated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchSchedule = async () => {
      if (mode === 'edit' && initialData) {
        setClassName(initialData.className || '')
        setClassCode(initialData.classCode || '')
        setAcademicYear(initialData.academicYear || '')
        setStartDate(initialData.startDate ? new Date(initialData.startDate) : null)
        setTotalSessions(initialData.totalSessions || '')

        if (initialData.schedule && initialData.schedule.length > 0) {
          console.log('Lịch học từ dữ liệu ban đầu:', initialData.schedule)
          setScheduleList(initialData.schedule)
        } else {
          console.log(
            'Không có lịch học trong dữ liệu ban đầu, sử dụng lịch từ các buổi học.',
            initialData.id,
          )
          try {
            const schedule = await getScheduleFromSessions(initialData.id)
            setScheduleList(schedule)
          } catch (err) {
            console.error('Lỗi khi lấy lịch từ session:', err)
            setScheduleList([{ day: '', time: '' }])
          }
        }
      } else {
        setClassName('')
        setClassCode('')
        setAcademicYear('')
        setStartDate(null)
        setTotalSessions('')
        setScheduleList([{ day: '', time: '' }])
      }

      setFormValidated(false)
      setIsSubmitting(false)
    }

    fetchSchedule()
  }, [mode, JSON.stringify(initialData)])

  const handleScheduleChange = (index, field, value) => {
    const updated = [...scheduleList]
    updated[index][field] = value
    console.log(`Cập nhật lịch học tại chỉ mục ${index}:`, updated[index])
    setScheduleList(updated)
  }

  const addScheduleItem = () => {
    setScheduleList([...scheduleList, { day: '', time: '' }])
  }

  const removeScheduleItem = (index) => {
    const updated = [...scheduleList]
    updated.splice(index, 1)
    setScheduleList(updated)
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

    const isSchedulingInfoProvided =
      startDate || totalSessions || scheduleList.some((s) => s.day || s.time)

    if (isSchedulingInfoProvided) {
      if (!startDate) {
        isValid = false
        toast.error('Vui lòng cung cấp Ngày bắt đầu nếu bạn muốn thiết lập lịch học.')
      }
      if (!totalSessions || parseInt(totalSessions, 10) <= 0) {
        isValid = false
        toast.error('Tổng số buổi học phải là số nguyên dương.')
      }
      const hasInvalidSchedule = scheduleList.some((s) => !s.day || !s.time)
      if (hasInvalidSchedule) {
        isValid = false
        toast.error('Mỗi lịch học cần có đầy đủ ngày và giờ.')
      }
    }
    return isValid
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormValidated(true)
    if (isSubmitting) return
    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }
    setIsSubmitting(true)

    const classData = {
      className,
      classCode,
      academicYear,
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      totalSessions: totalSessions ? parseInt(totalSessions, 10) : null,
      schedule: scheduleList
        .filter((s) => s.day && s.time)
        .map((s) => ({
          day: s.day,
          time: s.time,
        })),
    }

    try {
      let savedClass
      if (mode === 'add') {
        savedClass = await createClass(classData)
        toast.success('Lớp học đã được thêm thành công!')
      } else {
        savedClass = await updateClass(initialData.id, classData)
        toast.success('Lớp học đã được cập nhật thành công!')
      }
      setIsAddEditModalOpen(false)
    } catch (error) {
      console.error(`Lỗi khi ${mode === 'add' ? 'thêm' : 'cập nhật'} lớp học:`, error)
      toast.error(error.message || `Có lỗi khi ${mode === 'add' ? 'thêm' : 'cập nhật'} lớp học.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <CModalHeader>
        <CModalTitle>{mode === 'add' ? 'Thêm lớp học' : 'Chỉnh sửa lớp học'}</CModalTitle>
      </CModalHeader>
      <CForm className={formValidated ? 'was-validated' : ''} onSubmit={handleSubmit} noValidate>
        <CModalBody>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <CFormFeedback invalid>Vui lòng nhập Năm học.</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="startDate">Ngày bắt đầu:</CFormLabel>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                className={`form-control ${formValidated && startDate === null && scheduleList.length > 0 ? 'is-invalid' : ''}`}
                placeholderText="Chọn ngày bắt đầu (tùy chọn)"
                disabled={isSubmitting}
              />
              <CFormFeedback invalid>
                Vui lòng chọn ngày bắt đầu nếu thiết lập lịch học.
              </CFormFeedback>
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
                disabled={isSubmitting}
                className={
                  formValidated && startDate && (!totalSessions || totalSessions <= 0)
                    ? 'is-invalid'
                    : ''
                }
              />
              <CFormFeedback invalid>Tổng số buổi học phải là số nguyên dương.</CFormFeedback>
            </CCol>
          </CRow>

          <CFormLabel>Lịch học (ngày + giờ)</CFormLabel>
          {scheduleList.map((item, index) => (
            <CRow key={index} className="mb-2">
              <CCol md={5}>
                <select
                  className="form-control"
                  value={item.day}
                  onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Chọn ngày</option>
                  {daysOfWeekOptions.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </CCol>
              <CCol md={5}>
                <CFormInput
                  type="time"
                  value={item.time}
                  onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                  step="1"
                  disabled={isSubmitting}
                  required
                />
              </CCol>
              <CCol md={2}>
                <CButton
                  color="danger"
                  onClick={() => removeScheduleItem(index)}
                  disabled={isSubmitting}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CCol>
            </CRow>
          ))}
          <CButton
            color="primary"
            onClick={addScheduleItem}
            disabled={isSubmitting}
            className="mb-3"
          >
            + Thêm lịch học
          </CButton>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" className="mt-3" onClick={() => setIsAddEditModalOpen(false)}>
            Hủy
          </CButton>
          <CButton type="submit" color="primary" className="mt-3" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : mode === 'add' ? 'Thêm lớp học' : 'Cập nhật lớp học'}
          </CButton>
        </CModalFooter>
      </CForm>
    </>
  )
}

export default AddClassForm
