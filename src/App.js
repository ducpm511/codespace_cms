import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom' // Import Navigate
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css' // Rất quan trọng!

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

// Components
const PrivateRoute = React.lazy(() => import('./components/PrivateRoute')) // Import PrivateRoute

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route
            path="*"
            element={
              <PrivateRoute>
                <DefaultLayout />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />{' '}
          {/* Chuyển hướng đến dashboard sau khi đăng nhập */}
        </Routes>
        <ToastContainer
          position="top-right" // Vị trí mặc định của toast
          autoClose={3000} // Thời gian tự động đóng (ms)
          hideProgressBar={false} // Hiển thị thanh tiến trình
          newestOnTop={false} // Toast mới nhất không ở trên cùng
          closeOnClick // Đóng toast khi click
          rtl={false} // Hỗ trợ ngôn ngữ đọc từ phải sang trái
          pauseOnFocusLoss // Tạm dừng khi focus ra ngoài cửa sổ
          draggable // Cho phép kéo toast
          pauseOnHover // Tạm dừng khi di chuột qua
        />
      </Suspense>
    </BrowserRouter>
  )
}

export default App
