import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CFormCheck,
} from '@coreui/react'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { getAllStaff } from '../../../services/staff.service'
import { getAllShifts } from '../../../services/shift.service'
import { assignShiftRange } from '../../../services/schedule.service'

const daysOfWeekOptions = [
  { label: 'Chủ Nhật', value: 0 },
  { label: 'Thứ Hai', value: 1 },
  { label: 'Thứ Ba', value: 2 },
  { label: 'Thứ Tư', value: 3 },
  { label: 'Thứ Năm', value: 4 },
  { label: 'Thứ Sáu', value: 5 },
  { label: 'Thứ Bảy', value: 6 },
]

const AssignShiftModal = ({ visible, onClose, onSuccess }) => {
  const [staffList, setStaffList] = useState([])
  const [shiftList, setShiftList] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedShiftId, setSelectedShiftId] = useState('')
  const [fromDate, setFromDate] = useState(new Date())
  const [toDate, setToDate] = useState(new Date())
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]) // Mặc định chọn T2-T6

  useEffect(() => {
    if (visible) {
      const fetchData = async () => {
        setLoading(true)
        try {
          const [staff, shifts] = await Promise.all([getAllStaff(), getAllShifts()])
          setStaffList(staff)
          setShiftList(shifts)
        } catch (err) {
          setError('Không thể tải dữ liệu nhân viên hoặc ca làm việc.')
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [visible])

  const handleDayChange = (dayValue) => {
    setSelectedDays((prevDays) =>
      prevDays.includes(dayValue)
        ? prevDays.filter((d) => d !== dayValue)
        : [...prevDays, dayValue],
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedStaffId || !selectedShiftId || !fromDate || !toDate || selectedDays.length === 0) {
      setError('Vui lòng điền đầy đủ tất cả các trường.')
      return
    }
    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        staffId: parseInt(selectedStaffId, 10),
        shiftId: parseInt(selectedShiftId, 10),
        fromDate: fromDate.toISOString().split('T')[0], // YYYY-MM-DD
        toDate: toDate.toISOString().split('T')[0], // YYYY-MM-DD
        daysOfWeek: selectedDays,
      }
      await assignShiftRange(payload)
      toast.success('Gán ca làm việc hàng loạt thành công!')
      onSuccess()
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Có lỗi xảy ra.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CModal size="lg" visible={visible} onClose={onClose} alignment="center">
      <CForm onSubmit={handleSubmit}>
        <CModalHeader>
          <CModalTitle>Gán Ca làm việc hàng loạt</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {loading ? (
            <CSpinner />
          ) : (
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="staffId">Chọn Nhân viên</CFormLabel>
                <CFormSelect
                  id="staffId"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="shiftId">Chọn Ca làm việc</CFormLabel>
                <CFormSelect
                  id="shiftId"
                  value={selectedShiftId}
                  onChange={(e) => setSelectedShiftId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn --</option>
                  {shiftList.map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name} ({sh.startTime} - {sh.endTime})
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="fromDate">Từ ngày</CFormLabel>
                <DatePicker
                  id="fromDate"
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  selectsStart
                  startDate={fromDate}
                  endDate={toDate}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="toDate">Đến ngày</CFormLabel>
                <DatePicker
                  id="toDate"
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  selectsEnd
                  startDate={fromDate}
                  endDate={toDate}
                  minDate={fromDate}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                />
              </CCol>
              <CCol xs={12} className="mb-3">
                <CFormLabel>Chọn các ngày trong tuần</CFormLabel>
                <div className="d-flex flex-wrap">
                  {daysOfWeekOptions.map((day) => (
                    <CFormCheck
                      key={day.value}
                      id={`day-${day.value}`}
                      label={day.label}
                      checked={selectedDays.includes(day.value)}
                      onChange={() => handleDayChange(day.value)}
                      className="me-3"
                    />
                  ))}
                </div>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Hủy
          </CButton>
          <CButton color="primary" type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? <CSpinner size="sm" /> : 'Lưu'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default AssignShiftModal
