import React, { useState, useEffect, useMemo } from 'react'
import { CCard, CCardBody, CCardHeader, CSpinner, CButton } from '@coreui/react'
import { Calendar, luxonLocalizer } from 'react-big-calendar'
import { DateTime } from 'luxon'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getAllClassSessions, getAllStaffSchedules } from '../../../services/schedule.service'
import AssignStaffModal from './AssignStaffModal'
import AssignShiftModal from './AssignShiftModal'
import EditDeleteShiftAssignmentModal from './EditDeleteShiftAssignmentModal'

const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 })

// --- THÊM MỚI: Hàm tạo màu ngẫu nhiên ---
const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// --- THÊM MỚI: Màu mặc định cho các sự kiện chưa được phân công ---
const UNASSIGNED_COLOR = '#6c757d' // Màu xám

const WeeklySchedulePage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAssignStaffModalVisible, setIsAssignStaffModalVisible] = useState(false)
  const [isAssignShiftModalVisible, setIsAssignShiftModalVisible] = useState(false)
  const [isEditShiftModalVisible, setIsEditShiftModalVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // --- THÊM MỚI: Map để lưu màu cho mỗi nhân viên ---
  const staffColorMap = useMemo(() => new Map(), []) // Dùng useMemo để map không bị reset mỗi lần render

  const fetchScheduleData = async () => {
    setLoading(true)
    staffColorMap.clear() // Xóa map cũ trước khi fetch mới
    try {
      const [sessionsResponse, schedulesResponse] = await Promise.all([
        getAllClassSessions(),
        getAllStaffSchedules(),
      ])

      // 1. Xử lý các buổi dạy học (Class Sessions)
      const classSessionEvents = sessionsResponse.map((session) => {
        const assignments = schedulesResponse.filter(
          (schedule) => schedule.classSessionId === session.id,
        )

        let title = `${session.class.className}`
        let eventColor = UNASSIGNED_COLOR // Mặc định là màu xám

        if (assignments.length > 0) {
          const assignmentsText = assignments
            .map((a) => {
              // Gán màu nếu nhân viên chưa có màu
              if (a.staff && !staffColorMap.has(a.staffId)) {
                staffColorMap.set(a.staffId, getRandomColor())
              }
              // Ưu tiên màu của giáo viên nếu có
              if (a.roleKey === 'teacher' && a.staff) {
                eventColor = staffColorMap.get(a.staffId) || UNASSIGNED_COLOR
              } else if (eventColor === UNASSIGNED_COLOR && a.staff) {
                // Nếu chưa có màu GV, lấy màu TG
                eventColor = staffColorMap.get(a.staffId) || UNASSIGNED_COLOR
              }
              return `${a.staff?.fullName || 'N/A'} (${a.roleKey})`
            })
            .join(', ')
          title += ` - ${assignmentsText}`
        } else {
          title += ' - Chưa phân công'
        }

        const startDateTime = DateTime.fromISO(`${session.sessionDate}T${session.startTime}`)
        const endDateTime = startDateTime.plus({ minutes: 90 })

        return {
          title,
          start: startDateTime.toJSDate(),
          end: endDateTime.toJSDate(),
          resource: { type: 'CLASS_SESSION', session, assignments },
          color: eventColor, // Gán màu đã xác định
        }
      })

      // 2. Xử lý các ca làm việc đã phân công (Shift Assignments)
      const shiftAssignmentEvents = schedulesResponse
        .filter((schedule) => schedule.shiftId && schedule.staff)
        .map((schedule) => {
          // Gán màu nếu nhân viên chưa có màu
          if (!staffColorMap.has(schedule.staffId)) {
            staffColorMap.set(schedule.staffId, getRandomColor())
          }
          const staffColor = staffColorMap.get(schedule.staffId) || UNASSIGNED_COLOR

          const startDateTime = DateTime.fromISO(`${schedule.date}T${schedule.shift.startTime}`)
          const endDateTime = DateTime.fromISO(`${schedule.date}T${schedule.shift.endTime}`)

          return {
            title: `${schedule.staff.fullName} - Ca: ${schedule.shift.name}`,
            start: startDateTime.toJSDate(),
            end: endDateTime.toJSDate(),
            resource: { type: 'SHIFT', schedule },
            color: staffColor, // Gán màu của nhân viên
          }
        })

      setEvents([...classSessionEvents, ...shiftAssignmentEvents])
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu lịch:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScheduleData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Chỉ chạy fetch khi component mount

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    if (event.resource.type === 'CLASS_SESSION') {
      setIsAssignStaffModalVisible(true)
    } else if (event.resource.type === 'SHIFT') {
      setIsEditShiftModalVisible(true)
    }
  }

  const handleSelectSlot = () => {
    // Check roles or permissions if necessary before opening
    setIsAssignShiftModalVisible(true)
  }

  const handleSuccess = () => {
    setIsAssignStaffModalVisible(false)
    setIsAssignShiftModalVisible(false)
    setIsEditShiftModalVisible(false)
    setSelectedEvent(null)
    fetchScheduleData() // Tải lại để cập nhật màu sắc và thông tin
  }

  const eventPropGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white', // Chữ màu trắng để dễ đọc trên nền màu
      border: '0px',
      display: 'block',
    }
    return { style }
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Lịch làm việc Tuần</strong>
          <CButton color="primary" onClick={handleSelectSlot}>
            {' '}
            {/* Sửa lại: Dùng handleSelectSlot */}+ Gán ca làm việc
          </CButton>
        </CCardHeader>
        <CCardBody style={{ height: '75vh' }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <CSpinner />
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              defaultView="week"
              views={['month', 'week', 'day']} // Cho phép các view khác nhau
              step={30} // Chia slot thành 30 phút
              timeslots={2} // Hiển thị 2 slot mỗi giờ
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              style={{ height: '100%' }}
              eventPropGetter={eventPropGetter}
            />
          )}
        </CCardBody>
      </CCard>

      {/* Modals */}
      {selectedEvent && isAssignStaffModalVisible && (
        <AssignStaffModal
          visible={isAssignStaffModalVisible}
          onClose={() => setIsAssignStaffModalVisible(false)}
          eventData={selectedEvent}
          onSuccess={handleSuccess}
        />
      )}

      <AssignShiftModal
        visible={isAssignShiftModalVisible}
        onClose={() => setIsAssignShiftModalVisible(false)}
        onSuccess={handleSuccess}
      />

      {selectedEvent && isEditShiftModalVisible && (
        <EditDeleteShiftAssignmentModal
          visible={isEditShiftModalVisible}
          onClose={() => setIsEditShiftModalVisible(false)}
          eventData={selectedEvent}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

export default WeeklySchedulePage
