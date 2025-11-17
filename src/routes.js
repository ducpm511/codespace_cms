import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// const AddClassPage = React.lazy(() => import('./views/pages/classes/AddClassPage'))
const ClassesPage = React.lazy(() => import('./views/pages/classes/ClassesPage'))
const ParentsPage = React.lazy(() => import('./views/pages/parents/ParentsPage'))
const StudentsPage = React.lazy(() => import('./views/pages/students/StudentsPage'))
const QRCodePage = React.lazy(() => import('./views/pages/students/StudentQRCodePage'))
const AttendancePage = React.lazy(() => import('./views/pages/students/AttendancePage'))
const UsersPage = React.lazy(() => import('./views/pages/users/UsersPage'))
const StaffsPage = React.lazy(() => import('./views/pages/staffs/StaffsPage'))
const StudentReportPage = React.lazy(() => import('./views/pages/student-report/StudentReportPage'))
const ClassSessionPage = React.lazy(() => import('./views/pages/classes/ClassSessionPage'))
const ShiftsPage = React.lazy(() => import('./views/pages/shifts/ShiftsPage'))
const WeeklySchedulePage = React.lazy(() => import('./views/pages/schedules/WeeklySchedulePage'))
const StaffScannerPage = React.lazy(() => import('./views/pages/staff-attendance/StaffScannerPage'))
const PayrollReportPage = React.lazy(() => import('./views/pages/payroll/PayrollReportPage'))
const RolePage = React.lazy(() => import('./views/pages/roles/RolePage'))
const OtRequestsPage = React.lazy(() => import('./views/pages/ot-requests/OtRequestsPage'))
const ManageAttendancePage = React.lazy(
  () => import('./views/pages/staff-attendance/ManageAttendancePage'),
)

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/classes', name: 'Classes', element: ClassesPage },
  { path: '/parents', name: 'Parents', element: ParentsPage },
  { path: '/students', name: 'Students', element: StudentsPage },
  { path: '/students/qr-code', name: 'QR Code', element: QRCodePage },
  { path: '/students/attendance', name: 'Attendance', element: AttendancePage },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users', element: UsersPage },
  { path: '/staffs', name: 'Staffs', element: StaffsPage },
  { path: '/student-reports', name: 'Student Reports', element: StudentReportPage },
  { path: '/classes/:classId/sessions', name: 'Class Sessions', element: ClassSessionPage },
  { path: '/shifts', name: 'Quản lý Ca làm việc', element: ShiftsPage },
  { path: '/schedules/weekly', name: 'Phân công Lịch làm việc', element: WeeklySchedulePage },
  { path: '/staff-attendance', name: 'Chấm công', element: StaffScannerPage },
  { path: '/payroll', name: 'Báo cáo Lương', element: PayrollReportPage },
  { path: '/roles', name: 'Quản lý vai trò', element: RolePage },
  { path: '/ot-requests', name: 'Duyệt OT', element: OtRequestsPage },
  { path: '/staff-attendance/manage', name: 'Quản lý chấm công', element: ManageAttendancePage },
]

export default routes
