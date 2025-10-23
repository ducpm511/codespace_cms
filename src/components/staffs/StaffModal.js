import React, { useState, useEffect } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect, // Needed for dropdown
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CFormFeedback,
  CSpinner, // Added for loading state
  CAlert, // Added for error state
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus } from '@coreui/icons' // Added cilPlus
import { toast } from 'react-toastify' // Added toast

// --- IMPORT SERVICE ĐỂ LẤY ROLES ---
import { getAllRoles } from '../../services/role.service' // Adjust path if needed

const StaffModal = ({ visible, onClose, onSave, initialData = null, isEditing = false }) => {
  // State for personal info (no changes needed here)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [identityCardNumber, setIdentityCardNumber] = useState('')
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('')
  const [title, setTitle] = useState('Giáo viên')

  // State for rates - Use 'roleKey'
  const [rates, setRates] = useState([{ roleKey: '', rate: '' }])

  // --- State for roles dropdown ---
  const [roleList, setRoleList] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [validated, setValidated] = useState(false)

  // --- Update useEffect to fetch roles ---
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingRoles(true)
      setLoadError('')
      try {
        const roles = await getAllRoles()
        setRoleList(roles)
      } catch (err) {
        setLoadError('Lỗi tải danh sách vai trò.')
        setRoleList([])
        toast.error('Không thể tải danh sách vai trò. Vui lòng thử lại.') // Notify user
      } finally {
        setLoadingRoles(false)
      }
    }

    if (visible) {
      fetchDropdownData() // Fetch roles when modal becomes visible

      if (initialData) {
        // Set personal info (no changes)
        setFullName(initialData.fullName || '')
        setEmail(initialData.email || '')
        setTitle(initialData.title || 'Giáo viên')
        setPhoneNumber(initialData.phoneNumber || '')
        setDateOfBirth(initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '')
        setAddress(initialData.address || '')
        setIdentityCardNumber(initialData.identityCardNumber || '')
        setEmergencyContactNumber(initialData.emergencyContactNumber || '')

        // Convert rates object to array using 'roleKey'
        if (initialData.rates && typeof initialData.rates === 'object') {
          const ratesArray = Object.entries(initialData.rates).map(([key, rateValue]) => ({
            roleKey: key,
            rate: rateValue || '',
          })) // Ensure rate is string initially for input
          setRates(ratesArray.length > 0 ? ratesArray : [{ roleKey: '', rate: '' }])
        } else {
          setRates([{ roleKey: '', rate: '' }])
        }
      } else {
        // Reset form
        setFullName('')
        setEmail('')
        setPhoneNumber('')
        setDateOfBirth('')
        setAddress('')
        setIdentityCardNumber('')
        setEmergencyContactNumber('')
        setTitle('Giáo viên')
        setRates([{ roleKey: '', rate: '' }])
      }
      setValidated(false)
    }
  }, [initialData, visible])

  // --- Rate management functions (use 'roleKey') ---
  const handleRateChange = (index, field, value) => {
    const updatedRates = [...rates]
    updatedRates[index][field] = value
    setRates(updatedRates)
  }

  const addRate = () => {
    setRates([...rates, { roleKey: '', rate: '' }])
  }

  const removeRate = (index) => {
    const updatedRates = [...rates]
    updatedRates.splice(index, 1)
    // Ensure there's always at least one empty row if all are removed
    if (updatedRates.length === 0) {
      setRates([{ roleKey: '', rate: '' }])
    } else {
      setRates(updatedRates)
    }
  }

  // --- Update handleSubmit ---
  const handleSubmit = (event) => {
    const form = event.currentTarget
    event.preventDefault()
    event.stopPropagation()

    if (form.checkValidity() === false) {
      // Browser validation handles feedback
    } else {
      // Convert rates array back to object, using 'roleKey'
      const ratesObject = rates
        .filter((r) => r.roleKey && r.rate) // Filter valid rows
        .reduce((acc, curr) => {
          if (acc[curr.roleKey]) {
            toast.warn(
              `Vai trò "${roleList.find((rl) => rl.key === curr.roleKey)?.name || curr.roleKey}" bị lặp lại, chỉ lấy giá trị cuối cùng.`,
            )
          }
          // Ensure rate is stored as a number
          const rateValue = parseFloat(curr.rate)
          if (!isNaN(rateValue)) {
            acc[curr.roleKey] = rateValue
          } else {
            toast.warn(
              `Mức lương không hợp lệ cho vai trò "${roleList.find((rl) => rl.key === curr.roleKey)?.name || curr.roleKey}".`,
            )
          }
          return acc
        }, {})

      // Send null if no valid rates were entered (for full-time staff)
      const finalRates = Object.keys(ratesObject).length > 0 ? ratesObject : null

      const userData = {
        fullName,
        email,
        phoneNumber,
        dateOfBirth,
        address,
        identityCardNumber,
        emergencyContactNumber,
        title,
        rates: finalRates, // Send object or null
      }
      onSave(userData) // Call parent save function
    }
    setValidated(true)
  }

  return (
    <CModal size="lg" visible={visible} onClose={onClose} scrollable>
      <CModalHeader>
        <CModalTitle>{isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</CModalTitle>
      </CModalHeader>
      <CForm noValidate validated={validated} onSubmit={handleSubmit}>
        <CModalBody>
          {/* Personal Info Fields (uncomment and keep your existing fields) */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="fullName">
                Họ và tên <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập họ và tên.</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="dateOfBirth">
                Ngày sinh <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng chọn ngày sinh.</CFormFeedback>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="email">
                Email <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập email hợp lệ.</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="phoneNumber">
                Số điện thoại <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập số điện thoại.</CFormFeedback>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="address">
                Địa chỉ <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập địa chỉ.</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="identityCardNumber">
                Số CMND/CCCD <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                id="identityCardNumber"
                value={identityCardNumber}
                onChange={(e) => setIdentityCardNumber(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập số CMND/CCCD.</CFormFeedback>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="title">
                Vị trí <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập vị trí.</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="emergencyContactNumber">
                SĐT liên hệ khẩn cấp <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                id="emergencyContactNumber"
                value={emergencyContactNumber}
                onChange={(e) => setEmergencyContactNumber(e.target.value)}
                required
              />
              <CFormFeedback invalid>Vui lòng nhập SĐT khẩn cấp.</CFormFeedback>
            </CCol>
          </CRow>

          {/* --- UPDATED RATES SECTION --- */}
          <hr className="my-4" />
          <h5>Mức thù lao theo vai trò</h5>
          <p className="text-muted small">
            Dành cho nhân viên part-time, giáo viên, trợ giảng. Bỏ trống nếu là nhân viên full-time.
          </p>
          {loadError && <CAlert color="danger">{loadError}</CAlert>}
          {loadingRoles ? (
            <CSpinner size="sm" />
          ) : (
            rates.map((r, index) => (
              <CRow key={index} className="mb-2 align-items-center">
                <CCol md={5}>
                  <CFormLabel htmlFor={`rate-roleKey-${index}`} className="visually-hidden">
                    Vai trò
                  </CFormLabel>
                  {/* --- Use Dropdown for Role --- */}
                  <CFormSelect
                    id={`rate-roleKey-${index}`}
                    value={r.roleKey}
                    onChange={(e) => handleRateChange(index, 'roleKey', e.target.value)}
                    // Make role required if rate is filled, or if it's not the only empty row
                    required={!!r.rate || rates.length > 1}
                  >
                    <option value="">-- Chọn Vai trò --</option>
                    {roleList.map((role) => (
                      <option key={role.key} value={role.key}>
                        {role.name}
                      </option>
                    ))}
                  </CFormSelect>
                  <CFormFeedback invalid>Vui lòng chọn vai trò.</CFormFeedback>
                </CCol>
                <CCol md={5}>
                  <CFormLabel htmlFor={`rate-value-${index}`} className="visually-hidden">
                    Mức lương/giờ
                  </CFormLabel>
                  <CFormInput
                    id={`rate-value-${index}`}
                    type="number"
                    placeholder="Mức lương/giờ (vd: 50000)"
                    value={r.rate}
                    onChange={(e) => handleRateChange(index, 'rate', e.target.value)}
                    min="0" // Prevent negative rates
                    // Make rate required if role is selected, or if it's not the only empty row
                    required={!!r.roleKey || rates.length > 1}
                  />
                  <CFormFeedback invalid>Vui lòng nhập mức lương hợp lệ.</CFormFeedback>
                </CCol>
                <CCol md={2}>
                  <CButton
                    color="danger"
                    variant="outline"
                    onClick={() => removeRate(index)}
                    // Allow deleting the last row only if it's empty
                    disabled={rates.length === 1 && (!!rates[0].roleKey || !!rates[0].rate)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CCol>
              </CRow>
            ))
          )}
          {!loadingRoles && (
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              onClick={addRate}
              className="mt-2"
            >
              <CIcon icon={cilPlus} /> Thêm mức thù lao
            </CButton>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Hủy
          </CButton>
          <CButton color="primary" type="submit">
            {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default StaffModal
