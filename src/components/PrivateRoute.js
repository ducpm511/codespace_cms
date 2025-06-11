import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import DefaultLayout from '../layout/DefaultLayout' // Đảm bảo đường dẫn đúng

const PrivateRoute = () => {
  const isAuthenticated = localStorage.getItem('accessToken')
  const location = useLocation()

  return isAuthenticated ? (
    <DefaultLayout /> // Thay vì <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  )
}

export default PrivateRoute
