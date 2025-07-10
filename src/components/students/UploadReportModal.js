import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CSpinner,
} from '@coreui/react'
import { uploadPdf, createStudentReport } from '../../services/student-report.service'
import { getAllStudents } from '../../services/student.service'
import { getAllClasses } from '../../services/class.service'

const UploadReportModal = ({ visible, onClose, onSuccess }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [pdfInputs, setPdfInputs] = useState([])
  const [youtubeLinks, setYoutubeLinks] = useState([''])
  const [scratchProjects, setScratchProjects] = useState([
    { embedCode: '', projectName: '', description: '' },
  ])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [studentsData, classesData] = await Promise.all([getAllStudents(), getAllClasses()])
      setStudents(studentsData)
      setClasses(classesData)
    }
    if (visible) fetchData()
  }, [visible])

  const handleUpload = async () => {
    if (!selectedStudentId || !selectedClassId) return alert('Hãy chọn học sinh và lớp học')

    setLoading(true)
    try {
      const pdfFiles = []
      for (const pdfInput of pdfInputs) {
        const { file, testType, score } = pdfInput
        const { secure_url } = await uploadPdf(file)
        pdfFiles.push({ fileUrl: secure_url, testType, score: parseFloat(score) })
      }

      const payload = {
        studentId: parseInt(selectedStudentId),
        classId: parseInt(selectedClassId),
        pdfFiles,
        youtubeLinks: youtubeLinks.filter((l) => l),
        scratchProjects: scratchProjects.filter((p) => p.embedCode),
      }
      await createStudentReport(payload)
      onSuccess()
      onClose()
    } catch (err) {
      alert('Lỗi khi tạo báo cáo')
    } finally {
      setLoading(false)
    }
  }

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files)
    const inputs = files.map((file) => ({ file, testType: 'midterm', score: '' }))
    setPdfInputs(inputs)
  }

  const updatePdfInput = (index, field, value) => {
    setPdfInputs((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const updateScratchProject = (index, field, value) => {
    setScratchProjects((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const addScratchProject = () => {
    setScratchProjects((prev) => [...prev, { embedCode: '', projectName: '', description: '' }])
  }

  const removeScratchProject = (index) => {
    setScratchProjects((prev) => prev.filter((_, i) => i !== index))
  }

  const updateArrayItem = (setter, index, value) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  const removeArrayItem = (setter, index) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  const addArrayItem = (setter) => {
    setter((prev) => [...prev, ''])
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>Tạo báo cáo học sinh</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="mb-3">
          <CFormLabel>Chọn học sinh</CFormLabel>
          <CFormSelect
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">-- Chọn học sinh --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </CFormSelect>
        </div>
        <div className="mb-3">
          <CFormLabel>Chọn lớp học</CFormLabel>
          <CFormSelect value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
            <option value="">-- Chọn lớp học --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className}
              </option>
            ))}
          </CFormSelect>
        </div>

        <div className="mb-3">
          <CFormLabel>File PDF và điểm</CFormLabel>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handlePdfChange}
            className="form-control mb-2"
          />
          {pdfInputs.map((pdf, index) => (
            <div key={index} className="mb-2 border rounded p-2">
              <div>
                <strong>{pdf.file.name}</strong>
              </div>
              <CFormSelect
                className="mb-2"
                value={pdf.testType}
                onChange={(e) => updatePdfInput(index, 'testType', e.target.value)}
              >
                <option value="midterm">Giữa kỳ</option>
                <option value="final">Cuối kỳ</option>
              </CFormSelect>
              <CFormInput
                type="number"
                value={pdf.score}
                onChange={(e) => updatePdfInput(index, 'score', e.target.value)}
                placeholder="Điểm bài test"
              />
            </div>
          ))}
        </div>

        <div className="mb-3">
          <CFormLabel>Link YouTube</CFormLabel>
          {youtubeLinks.map((link, index) => (
            <div key={index} className="d-flex mb-2">
              <CFormInput
                type="text"
                value={link}
                onChange={(e) => updateArrayItem(setYoutubeLinks, index, e.target.value)}
                placeholder="YouTube URL"
              />
              <CButton
                color="danger"
                className="ms-2"
                onClick={() => removeArrayItem(setYoutubeLinks, index)}
              >
                Xoá
              </CButton>
            </div>
          ))}
          <CButton color="secondary" size="sm" onClick={() => addArrayItem(setYoutubeLinks)}>
            + Thêm link
          </CButton>
        </div>

        <div className="mb-3">
          <CFormLabel>Dự án Scratch</CFormLabel>
          {scratchProjects.map((proj, index) => (
            <div key={index} className="border rounded p-2 mb-2">
              <CFormInput
                className="mb-2"
                value={proj.embedCode}
                onChange={(e) => updateScratchProject(index, 'embedCode', e.target.value)}
                placeholder="Mã nhúng"
              />
              <CFormInput
                className="mb-2"
                value={proj.projectName}
                onChange={(e) => updateScratchProject(index, 'projectName', e.target.value)}
                placeholder="Tên dự án"
              />
              <CFormInput
                value={proj.description}
                onChange={(e) => updateScratchProject(index, 'description', e.target.value)}
                placeholder="Mô tả"
              />
              <CButton color="danger" className="mt-2" onClick={() => removeScratchProject(index)}>
                Xoá dự án
              </CButton>
            </div>
          ))}
          <CButton color="secondary" size="sm" onClick={addScratchProject}>
            + Thêm dự án
          </CButton>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={loading}>
          Đóng
        </CButton>
        <CButton color="primary" onClick={handleUpload} disabled={loading}>
          {loading ? <CSpinner size="sm" /> : 'Tạo báo cáo'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default UploadReportModal
