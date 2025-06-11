import React, { useState, useEffect, useRef } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CFormFeedback,
  CFormSelect,
  CFormCheck,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { toast } from 'react-toastify' // Sử dụng react-toastify
import 'react-toastify/dist/ReactToastify.css' // Import CSS cho react-toastify
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Đảm bảo đường dẫn này chính xác
import {
  createStudent,
  updateStudent,
  createStudentWithParent,
  getAllParents,
} from '../../services/student.service'
// Đảm bảo đường dẫn này chính xác
import { getAllClasses } from '../../services/class.service'

const AddEditStudentForm = ({ mode, initialData, onFormSuccess }) => {
  // Student states
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState(null) // Sử dụng Date object
  const [age, setAge] = useState('') // Calculated automatically
  const [gender, setGender] = useState('')

  // Class selection (Many-to-Many) states
  const [allClasses, setAllClasses] = useState([])
  const [selectedClassIds, setSelectedClassIds] = useState([]) // Array of selected class IDs

  // Parent states
  const [parentInputType, setParentInputType] = useState('existing') // 'existing' or 'new'
  const [allParents, setAllParents] = useState([])

  // Existing Parent (search box + dropdown) states
  const [parentSearchTerm, setParentSearchTerm] = useState('')
  const [filteredParents, setFilteredParents] = useState([])
  const [selectedParent, setSelectedParent] = useState(null) // Object Parent
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false)
  const parentInputRef = useRef(null)

  // New Parent states
  const [newParentFullName, setNewParentFullName] = useState('')
  const [newParentPhoneNumber, setNewParentPhoneNumber] = useState('')
  const [newParentEmail, setNewParentEmail] = useState('')
  const [newParentAddress, setNewParentAddress] = useState('')
  const [newParentJob, setNewParentJob] = useState('')

  // General form states
  const [formValidated, setFormValidated] = useState(false) // Để quản lý trạng thái validation
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Fetch all classes and parents once when component mounts
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const classesResponse = await getAllClasses() // Lấy phản hồi đầy đủ
        // Đảm bảo truy cập đúng thuộc tính 'data'
        setAllClasses(classesResponse.data || [])
        console.log('[AddEditStudentForm] All classes fetched:', classesResponse.data) // DEBUG LOG

        const parentsResponse = await getAllParents() // Lấy phản hồi đầy đủ
        console.log('[AddEditStudentForm] Parents response from API:', parentsResponse) // DEBUG LOG: Log phản hồi thô từ API

        // CẬP NHẬT QUAN TRỌNG TẠI ĐÂY:
        // Kiểm tra nếu parentsResponse có thuộc tính 'data' (phản hồi API dạng { data: [...] })
        // Nếu không có, giả định parentsResponse đã là mảng dữ liệu
        const fetchedParentsData =
          parentsResponse && parentsResponse.data ? parentsResponse.data : parentsResponse
        setAllParents(fetchedParentsData || [])
        console.log(
          '[AddEditStudentForm] allParents state after setting:',
          fetchedParentsData || [],
        ) // DEBUG LOG
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dropdown:', error)
        toast.error('Có lỗi khi tải danh sách lớp học hoặc phụ huynh.')
        setAllClasses([]) // Đảm bảo các mảng state không bị undefined khi lỗi
        setAllParents([])
      }
    }
    fetchDropdownData()
  }, []) // Dependency array rỗng, chỉ chạy một lần khi component mount

  // 2. Load initial student data (for edit mode) or reset form (for add mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFullName(initialData.fullName || '')
      setDateOfBirth(initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : null)
      setGender(initialData.gender || '')

      // Populate selected classes (Many-to-Many)
      setSelectedClassIds(initialData.classes ? initialData.classes.map((cls) => cls.id) : [])

      // For edit mode, always default to existing parent selection
      setParentInputType('existing')
      if (initialData.parent) {
        setSelectedParent(initialData.parent)
        setParentSearchTerm(`${initialData.parent.fullName} (${initialData.parent.phoneNumber})`)
      } else {
        setSelectedParent(null)
        setParentSearchTerm('')
      }
    } else {
      // Reset form for add mode
      setFullName('')
      setDateOfBirth(null)
      setAge('') // Age is calculated, so reset it
      setGender('')
      setSelectedClassIds([])

      // Reset parent states
      setParentInputType('existing') // Default to existing parent for new student
      setParentSearchTerm('')
      setSelectedParent(null)
      setNewParentFullName('')
      setNewParentPhoneNumber('')
      setNewParentEmail('')
      setNewParentAddress('')
      setNewParentJob('')
    }
    setFormValidated(false) // Reset validation state
  }, [mode, initialData])

  // 3. Calculate age based on dateOfBirth
  useEffect(() => {
    if (dateOfBirth) {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      setAge(calculatedAge.toString())
    } else {
      setAge('')
    }
  }, [dateOfBirth])

  // --- Logic for Parent Search/Dropdown ---
  const handleParentSearchChange = (e) => {
    const term = e.target.value
    setParentSearchTerm(term)
    setSelectedParent(null) // Reset selection when user types

    // DEBUG LOG: Kiểm tra giá trị allParents tại thời điểm hàm được gọi
    console.log('[handleParentSearchChange] Current allParents state:', allParents)

    const parentsToFilter = allParents || [] // Đảm bảo allParents là mảng
    console.log(
      '[handleParentSearchChange] Filtering parents with term:',
      term,
      'from',
      parentsToFilter.length,
      'parents',
    )

    if (term.length > 0) {
      const results = parentsToFilter.filter((p) => {
        // DEBUG LOG: Kiểm tra giá trị fullName và phoneNumber của từng phụ huynh
        const parentFullName = p.fullName
        const parentPhoneNumber = p.phoneNumber

        const matchFullName =
          parentFullName && parentFullName.toLowerCase().includes(term.toLowerCase())
        const matchPhoneNumber = parentPhoneNumber && String(parentPhoneNumber).includes(term) // Chuyển đổi phoneNumber thành chuỗi

        console.log(
          `  - Checking Parent: ${parentFullName}, Phone: ${parentPhoneNumber} | Match FullName: ${matchFullName}, Match PhoneNumber: ${matchPhoneNumber}`,
        )

        return matchFullName || matchPhoneNumber
      })
      setFilteredParents(results)
      console.log('[handleParentSearchChange] Filtered results:', results) // DEBUG LOG: Kết quả sau khi lọc
    } else {
      setFilteredParents(parentsToFilter) // Show all when no search term
      console.log(
        '[handleParentSearchChange] No search term, showing all parents:',
        parentsToFilter,
      ) // DEBUG LOG
    }
    setIsParentDropdownOpen(true) // Always open dropdown when typing
  }

  const handleSelectParent = (parent) => {
    setSelectedParent(parent)
    setParentSearchTerm(`${parent.fullName} (${parent.phoneNumber})`)
    setIsParentDropdownOpen(false) // Close dropdown after selection
  }

  // Used onMouseDown to prevent onBlur from triggering immediately
  const handleDropdownMouseDown = (e) => {
    e.preventDefault() // Prevent blur event of the input
  }

  const handleInputBlur = (setInputOpenState) => () => {
    // Only close dropdown after a short delay to allow click
    setTimeout(() => {
      setInputOpenState(false)
    }, 150) // Adjust delay if needed
  }

  // --- Logic for Class Multi-Select Checkboxes ---
  const handleClassCheckboxChange = (classId) => {
    setSelectedClassIds((prevSelected) =>
      prevSelected.includes(classId)
        ? prevSelected.filter((id) => id !== classId)
        : [...prevSelected, classId],
    )
  }

  // --- Form Validation Logic ---
  const validateForm = () => {
    let isValid = true

    // Validate student core fields
    if (!fullName.trim()) {
      isValid = false
      toast.error('Họ và Tên Học sinh không được để trống.')
    }
    if (!dateOfBirth) {
      isValid = false
      toast.error('Ngày Sinh không được để trống.')
    }
    if (!age) {
      isValid = false
      toast.error('Ngày Sinh không hợp lệ.')
    }
    if (!gender) {
      isValid = false
      toast.error('Giới Tính không được để trống.')
    }

    // Validate parent fields based on selection type
    if (mode === 'add') {
      if (parentInputType === 'existing') {
        if (!selectedParent) {
          isValid = false
          toast.error('Vui lòng chọn một phụ huynh hiện có.')
        }
      } else {
        // parentInputType === 'new'
        if (!newParentFullName.trim()) {
          isValid = false
          toast.error('Tên Phụ huynh mới không được để trống.')
        }
        if (!newParentPhoneNumber.trim()) {
          isValid = false
          toast.error('Số điện thoại Phụ huynh mới không được để trống.')
        }
        if (newParentPhoneNumber.trim() && !/^\d{10,11}$/.test(newParentPhoneNumber)) {
          isValid = false
          toast.error('Số điện thoại Phụ huynh mới không hợp lệ (10 hoặc 11 chữ số).')
        }
        if (newParentEmail.trim() && !/\S+@\S+\.\S+/.test(newParentEmail)) {
          isValid = false
          toast.error('Email Phụ huynh mới không hợp lệ.')
        }
      }
    } else {
      // mode === 'edit'
      // Trong chế độ chỉnh sửa, nếu học sinh có parentId, thì phải có selectedParent.
      // Nếu initialData.parentId là null, tức là học sinh không có phụ huynh, thì selectedParent cũng nên là null.
      if (initialData.parentId && !selectedParent) {
        isValid = false
        toast.error('Học sinh phải có phụ huynh được chọn.')
      }
    }

    // Class selection: If you require at least one class
    // if (selectedClassIds.length === 0) { isValid = false; toast.error('Vui lòng chọn ít nhất một lớp học.'); }

    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormValidated(true)

    if (isSubmitting) return

    if (!validateForm()) {
      setIsSubmitting(false) // Ensure button is re-enabled if validation fails
      return
    }

    setIsSubmitting(true)

    try {
      const studentCoreData = {
        fullName,
        dateOfBirth: dateOfBirth.toISOString(), // Convert Date object to ISO string
        age: parseInt(age, 10),
        gender,
        classIds: selectedClassIds, // Send array of class IDs
      }

      let payload
      let savedStudent

      if (mode === 'add') {
        if (parentInputType === 'existing') {
          payload = { ...studentCoreData, parentId: selectedParent.id }
        } else {
          // parentInputType === 'new'
          const newParentData = {
            fullName: newParentFullName,
            phoneNumber: newParentPhoneNumber,
            email: newParentEmail.trim() || undefined,
            address: newParentAddress.trim() || undefined,
            job: newParentJob.trim() || undefined,
          }
          payload = { ...studentCoreData, newParent: newParentData }
        }
        // Gọi hàm createStudentWithParent nếu có newParent, hoặc createStudent nếu chỉ có parentId
        if (payload.newParent) {
          savedStudent = await createStudentWithParent(payload)
        } else {
          savedStudent = await createStudent(payload)
        }
      } else {
        // mode === 'edit'
        payload = { ...studentCoreData, parentId: selectedParent ? selectedParent.id : null }
        savedStudent = await updateStudent(initialData.id, payload)
      }

      onFormSuccess(savedStudent) // Call callback to refresh list and close modal
      toast.success(mode === 'add' ? 'Thêm học sinh thành công!' : 'Cập nhật học sinh thành công!')
    } catch (error) {
      console.error(`Lỗi khi ${mode === 'add' ? 'thêm' : 'cập nhật'} học sinh:`, error)
      toast.error(
        error.message || `Có lỗi xảy ra khi ${mode === 'add' ? 'thêm' : 'cập nhật'} học sinh.`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CForm className={formValidated ? 'was-validated' : ''} onSubmit={handleSubmit} noValidate>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="fullName">
            Họ và Tên Học sinh <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <CFormFeedback invalid>Vui lòng nhập Họ và Tên Học sinh.</CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="dateOfBirth">
            Ngày Sinh <span className="text-danger">*</span>
          </CFormLabel>
          <DatePicker
            id="dateOfBirth"
            selected={dateOfBirth}
            onChange={(date) => setDateOfBirth(date)}
            dateFormat="dd/MM/yyyy"
            className={`form-control ${formValidated && !dateOfBirth ? 'is-invalid' : ''}`}
            placeholderText="Chọn ngày sinh"
            required
            disabled={isSubmitting}
          />
          <CFormFeedback
            invalid
            style={{ display: formValidated && !dateOfBirth ? 'block' : 'none' }}
          >
            Vui lòng chọn Ngày Sinh.
          </CFormFeedback>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="age">
            Tuổi <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput type="number" id="age" value={age} readOnly required disabled />
          <CFormFeedback invalid>Tuổi không hợp lệ.</CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="gender">
            Giới Tính <span className="text-danger">*</span>
          </CFormLabel>
          <CFormSelect
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="">Chọn giới tính...</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </CFormSelect>
          <CFormFeedback invalid>Vui lòng chọn Giới Tính.</CFormFeedback>
        </CCol>
      </CRow>

      {/* Class Multi-Select (checkboxes) */}
      <div className="mb-3">
        <CFormLabel>Chọn lớp học (có thể chọn nhiều)</CFormLabel>
        <div className="border p-2 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {allClasses.length === 0 ? (
            <p className="text-muted">Đang tải lớp học...</p>
          ) : (
            allClasses.map((cls) => (
              <CFormCheck
                key={cls.id}
                id={`class-${cls.id}`}
                label={`${cls.className} (${cls.classCode})`}
                checked={selectedClassIds.includes(cls.id)}
                onChange={() => handleClassCheckboxChange(cls.id)}
                disabled={isSubmitting}
                className="mb-1"
              />
            ))
          )}
        </div>
        {/* Uncomment the line below if at least one class is required */}
        {/* {formValidated && selectedClassIds.length === 0 && <CFormFeedback invalid style={{ display: 'block' }}>Vui lòng chọn ít nhất một lớp học.</CFormFeedback>} */}
      </div>

      {/* Parent Selection / Creation */}
      <CRow className="mb-3">
        <CCol xs={12}>
          <CFormLabel>
            Phụ huynh <span className="text-danger">*</span>
          </CFormLabel>
          {mode === 'add' && (
            <div className="d-flex mb-2">
              <CFormCheck
                type="radio"
                name="parentInputType"
                id="existingParentRadio"
                value="existing"
                label="Chọn phụ huynh hiện có"
                checked={parentInputType === 'existing'}
                onChange={() => {
                  setParentInputType('existing')
                  // Clear new parent fields when switching to existing
                  setNewParentFullName('')
                  setNewParentPhoneNumber('')
                  setNewParentEmail('')
                  setNewParentAddress('')
                  setNewParentJob('')
                }}
                className="me-3"
                disabled={isSubmitting}
              />
              <CFormCheck
                type="radio"
                name="parentInputType"
                id="newParentRadio"
                value="new"
                label="Thêm phụ huynh mới"
                checked={parentInputType === 'new'}
                onChange={() => {
                  setParentInputType('new')
                  // Clear existing parent selection when switching to new
                  setParentSearchTerm('')
                  setSelectedParent(null)
                }}
                disabled={isSubmitting}
              />
            </div>
          )}

          {(parentInputType === 'existing' || mode === 'edit') && (
            <div className="position-relative">
              <CFormInput
                type="text"
                id="parentSelection"
                placeholder="Tìm kiếm và chọn phụ huynh (Tên hoặc SĐT)..."
                value={parentSearchTerm}
                onChange={handleParentSearchChange}
                onFocus={() => setIsParentDropdownOpen(true)}
                onBlur={handleInputBlur(setIsParentDropdownOpen)}
                required={parentInputType === 'existing' || mode === 'edit'}
                ref={parentInputRef}
                className={
                  formValidated &&
                  !selectedParent &&
                  (parentInputType === 'existing' || mode === 'edit')
                    ? 'is-invalid'
                    : ''
                }
                disabled={isSubmitting}
              />
              {isParentDropdownOpen && filteredParents.length > 0 && (
                <CListGroup
                  className="position-absolute w-100 z-index-1000"
                  style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6' }}
                  onMouseDown={handleDropdownMouseDown} // Prevent blur on dropdown click
                >
                  {filteredParents.map((parent) => (
                    <CListGroupItem
                      key={parent.id}
                      onClick={() => handleSelectParent(parent)}
                      active={selectedParent && selectedParent.id === parent.id}
                      className="cursor-pointer"
                    >
                      {parent.fullName} ({parent.phoneNumber})
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
              <CFormFeedback
                invalid
                style={{
                  display:
                    formValidated &&
                    !selectedParent &&
                    (parentInputType === 'existing' || mode === 'edit')
                      ? 'block'
                      : 'none',
                }}
              >
                Vui lòng chọn một Phụ huynh hiện có.
              </CFormFeedback>
            </div>
          )}

          {parentInputType === 'new' && mode === 'add' && (
            <>
              <CFormInput
                type="text"
                className={`mb-2 ${formValidated && !newParentFullName.trim() ? 'is-invalid' : ''}`}
                placeholder="Họ và Tên Phụ huynh mới *"
                value={newParentFullName}
                onChange={(e) => setNewParentFullName(e.target.value)}
                required={parentInputType === 'new'}
                disabled={isSubmitting}
              />
              <CFormFeedback
                invalid
                style={{ display: formValidated && !newParentFullName.trim() ? 'block' : 'none' }}
              >
                Vui lòng nhập Họ và Tên Phụ huynh.
              </CFormFeedback>

              <CFormInput
                type="text"
                className={`mb-2 ${formValidated && (!newParentPhoneNumber.trim() || !/^\d{10,11}$/.test(newParentPhoneNumber)) ? 'is-invalid' : ''}`}
                placeholder="Số điện thoại Phụ huynh mới (10 hoặc 11 chữ số) *"
                value={newParentPhoneNumber}
                onChange={(e) => setNewParentPhoneNumber(e.target.value)}
                required={parentInputType === 'new'}
                disabled={isSubmitting}
              />
              <CFormFeedback
                invalid
                style={{
                  display:
                    formValidated &&
                    (!newParentPhoneNumber.trim() || !/^\d{10,11}$/.test(newParentPhoneNumber))
                      ? 'block'
                      : 'none',
                }}
              >
                Vui lòng nhập Số điện thoại Phụ huynh hợp lệ.
              </CFormFeedback>

              <CFormInput
                type="email"
                className={`mb-2 ${formValidated && newParentEmail.trim() && !/\S+@\S+\.\S+/.test(newParentEmail) ? 'is-invalid' : ''}`}
                placeholder="Email Phụ huynh mới (Tùy chọn)"
                value={newParentEmail}
                onChange={(e) => setNewParentEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <CFormFeedback
                invalid
                style={{
                  display:
                    formValidated && newParentEmail.trim() && !/\S+@\S+\.\S+/.test(newParentEmail)
                      ? 'block'
                      : 'none',
                }}
              >
                Vui lòng nhập Email Phụ huynh hợp lệ.
              </CFormFeedback>

              <CFormInput
                type="text"
                className={`mb-2`}
                placeholder="Địa chỉ Phụ huynh mới (Tùy chọn)"
                value={newParentAddress}
                onChange={(e) => setNewParentAddress(e.target.value)}
                disabled={isSubmitting}
              />
              <CFormInput
                type="text"
                className={`mb-2`}
                placeholder="Nghề nghiệp Phụ huynh mới (Tùy chọn)"
                value={newParentJob}
                onChange={(e) => setNewParentJob(e.target.value)}
                disabled={isSubmitting}
              />
            </>
          )}
        </CCol>
      </CRow>

      <CButton type="submit" color="primary" className="mt-3" disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : mode === 'add' ? 'Thêm học sinh' : 'Cập nhật học sinh'}
      </CButton>
    </CForm>
  )
}

export default AddEditStudentForm
