import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilInstitution,
  cilPeople,
  cilUser,
  cilQrCode,
  cilCalendarCheck,
  cilClipboard,
  cilMoodGood,
  cilAvTimer,
  cilCalendar,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Lớp học',
  },
  {
    component: CNavItem,
    name: 'Quản lý lớp học',
    to: '/classes',
    icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Phụ huynh',
  },
  {
    component: CNavItem,
    name: 'Quản lý phụ huynh',
    to: '/parents',
    icon: <CIcon icon={cilMoodGood} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Học sinh',
  },
  {
    component: CNavItem,
    name: 'Quản lý học sinh',
    to: '/students',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Tạo QR Code',
    to: '/students/qr-code',
    icon: <CIcon icon={cilQrCode} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Điểm danh',
    to: '/students/attendance',
    icon: <CIcon icon={cilCalendarCheck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Quản lý báo cáo học sinh',
    to: '/student-reports',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Users',
  },
  {
    component: CNavItem,
    name: 'Quản lý người dùng',
    to: '/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Quản lý vai trò',
    to: '/roles',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Quản lý nhân viên',
    to: '/staffs',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Quản lý ca làm việc',
    to: '/shifts',
    icon: <CIcon icon={cilAvTimer} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Phân công Lịch làm việc',
    to: '/schedules/weekly',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Check-in Check-out',
    to: '/staff-attendance',
    icon: <CIcon icon={cilQrCode} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Quản lý chấm công',
    to: '/staff-attendance/manage',
    icon: <CIcon icon={cilCalendarCheck} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Lương',
  },
  {
    component: CNavItem,
    name: 'Báo cáo Lương',
    to: '/payroll',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Duyệt OT',
    to: '/ot-requests',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
]

export default _nav
