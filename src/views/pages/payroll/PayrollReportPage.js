import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CSpinner,
  CFormLabel,
  CFormSelect,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'

import { getPayrollReport } from '../../../services/payroll.service'
import { getAllStaff } from '../../../services/staff.service' // Tái sử dụng service đã có

const PayrollReportPage = () => {
  const [reportData, setReportData] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(false)

  // Filters state
  const [fromDate, setFromDate] = useState(new Date())
  const [toDate, setToDate] = useState(new Date())
  const [selectedStaffId, setSelectedStaffId] = useState('')

  useEffect(() => {
    // Tải danh sách nhân viên để hiển thị trong bộ lọc
    const fetchStaff = async () => {
      try {
        const staff = await getAllStaff()
        setStaffList(staff)
      } catch (error) {
        toast.error('Không thể tải danh sách nhân viên.')
      }
    }
    fetchStaff()
  }, [])

  const handleGenerateReport = async () => {
    setLoading(true)
    setReportData([])
    try {
      const params = {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
      }
      if (selectedStaffId) {
        params.staffId = selectedStaffId
      }
      const data = await getPayrollReport(params)
      setReportData(data)
      if (data.length === 0) {
        toast.info('Không tìm thấy dữ liệu chấm công trong khoảng thời gian này.')
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tạo báo cáo.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Báo cáo Lương</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-4 align-items-end">
              <CCol md={3}>
                <CFormLabel>Từ ngày</CFormLabel>
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Đến ngày</CFormLabel>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Nhân viên (để trống để xem tất cả)</CFormLabel>
                <CFormSelect
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  <option value="">Tất cả Nhân viên</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CButton
                  color="primary"
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? <CSpinner size="sm" /> : 'Xem Báo cáo'}
                </CButton>
              </CCol>
            </CRow>

            {/* Display Report */}
            {reportData.length > 0 && (
              <CAccordion alwaysOpen>
                {reportData.map((staffReport, index) => (
                  <CAccordionItem key={staffReport.staffId} itemKey={index}>
                    <CAccordionHeader>
                      <div className="d-flex justify-content-between w-100 me-3">
                        <span>{staffReport.fullName}</span>
                        <strong>Tổng lương: {formatCurrency(staffReport.totalPay)}</strong>
                      </div>
                    </CAccordionHeader>
                    <CAccordionBody>
                      <CTable small bordered>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Ngày</CTableHeaderCell>
                            <CTableHeaderCell>Check-in</CTableHeaderCell>
                            <CTableHeaderCell>Check-out</CTableHeaderCell>
                            <CTableHeaderCell>Chi tiết công</CTableHeaderCell>
                            <CTableHeaderCell>Tổng tiền ngày</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {staffReport.dailyBreakdown.map((day) => (
                            <CTableRow key={day.date}>
                              <CTableDataCell>
                                {new Date(day.date).toLocaleDateString('vi-VN')}
                              </CTableDataCell>
                              <CTableDataCell>{day.checkIn}</CTableDataCell>
                              <CTableDataCell>{day.checkOut}</CTableDataCell>
                              <CTableDataCell>
                                {day.blocks.map((block, i) => (
                                  <div key={i}>
                                    {block.type}: {Math.round(block.duration)} phút (
                                    {formatCurrency(block.pay)})
                                  </div>
                                ))}
                              </CTableDataCell>
                              <CTableDataCell>{formatCurrency(day.dailyPay)}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </CAccordionBody>
                  </CAccordionItem>
                ))}
              </CAccordion>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PayrollReportPage
