import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// const AddClassPage = React.lazy(() => import('./views/pages/classes/AddClassPage'))
const ClassesPage = React.lazy(() => import('./views/pages/classes/ClassesPage'))
const ParentsPage = React.lazy(() => import('./views/pages/parents/ParentsPage'))
const StudentsPage = React.lazy(() => import('./views/pages/students/StudentsPage'))
const QRCodePage = React.lazy(() => import('./views/pages/students/StudentQRCodePage'))
const AttendancePage = React.lazy(() => import('./views/pages/students/AttendancePage'))
const UsersPage = React.lazy(() => import('./views/pages/users/UsersPage'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/classes', name: 'Add Class', element: ClassesPage },
  { path: '/parents', name: 'Parents', element: ParentsPage },
  { path: '/students', name: 'Students', element: StudentsPage },
  { path: '/students/qr-code', name: 'QR Code', element: QRCodePage },
  { path: '/students/attendance', name: 'Attendance', element: AttendancePage },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users', element: UsersPage },
]

export default routes
