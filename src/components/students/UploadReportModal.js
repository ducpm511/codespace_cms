// src/components/students/UploadReportModal.js
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
import {
  uploadPdf,
  createStudentReport,
  updateStudentReport,
} from '../../services/student-report.service'
import { getAllStudents } from '../../services/student.service'
import { getAllClasses } from '../../services/class.service'

const UploadReportModal = ({ visible, onClose, onSuccess, initialData = null }) => {
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
    const fetchDataAndInitForm = async () => {
      try {
        const [studentsData, classesData] = await Promise.all([getAllStudents(), getAllClasses()])
        setStudents(studentsData)
        setClasses(classesData)

        if (initialData) {
          // Chế độ chỉnh sửa
          setSelectedStudentId(initialData.student?.id?.toString() || '')
          setSelectedClassId(initialData.class?.id?.toString() || '')

          console.log('Initial data:', initialData)

          setPdfInputs(
            (initialData.files || []).map((f, i) => ({
              fileUrl: f.fileUrl || f,
              testType: f.testType || initialData.pdfTestTypes?.[i] || 'midterm',
              score: f.score || initialData.pdfScores?.[i] || '',
              name: f.fileName || `File ${i + 1}`,
            })),
          )

          setYoutubeLinks(
            (initialData.links || [])
              .filter((link) => link.type === 'YOUTUBE')
              .map((link) => link.urlOrEmbedCode),
          )

          setScratchProjects(
            (initialData.links || [])
              .filter((link) => link.type === 'SCRATCH_EMBED')
              .map((project) => ({
                embedCode: project.urlOrEmbedCode,
                projectName: project.projectName || '',
                description: project.description || '',
              })),
          )
        } else {
          // Chế độ tạo mới
          setSelectedStudentId('')
          setSelectedClassId('')
          setPdfInputs([])
          setYoutubeLinks([''])
          setScratchProjects([{ embedCode: '', projectName: '', description: '' }])
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu hoặc khởi tạo form:', err)
      }
    }

    if (visible) {
      fetchDataAndInitForm()
    }
  }, [visible, initialData])

  const handleUpload = async () => {
    if (!selectedStudentId || !selectedClassId) {
      alert('Hãy chọn học sinh và lớp học')
      return
    }

    setLoading(true)

    try {
      const pdfFiles = []

      for (const pdfInput of pdfInputs) {
        const { file, fileUrl, testType, score } = pdfInput

        let finalUrl = fileUrl

        // Nếu không có fileUrl (tức là file mới), thì upload
        if (!fileUrl && file) {
          const { secure_url } = await uploadPdf(file)
          finalUrl = secure_url
        }

        if (!finalUrl) continue

        pdfFiles.push({
          id: pdfInput.id, // file cũ sẽ có id
          fileUrl: finalUrl,
          testType,
          score: parseFloat(score),
        })
      }

      const payload = {
        studentId: parseInt(selectedStudentId),
        classId: parseInt(selectedClassId),
        pdfFiles,
        youtubeLinks: youtubeLinks.filter((link) => !!link),
        scratchProjects: scratchProjects.filter((proj) => proj.embedCode?.trim() !== ''),
      }

      if (initialData?.id) {
        await updateStudentReport(initialData.id, payload)
      } else {
        await createStudentReport(payload)
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Lỗi khi upload:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files)

    const newInputs = files.map((file) => ({
      file,
      fileUrl: null, // File mới nên chưa có URL
      testType: 'midterm',
      score: '',
      name: file.name,
    }))

    // Giữ lại file cũ
    setPdfInputs((prev) => [...prev, ...newInputs])
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
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
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
                <strong>{pdf.name}</strong>
              </div>
              <CFormSelect
                className="mb-2"
                value={pdf.testType}
                onChange={(e) => updatePdfInput(index, 'testType', e.target.value)}
              >
                <option value="midterm">Giữa kỳ</option>
                <option value="final">Cuối kỳ</option>
                <option value="certificate">Chứng chỉ (không cần nhập số điểm)</option>
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
          {loading ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Đang lưu...
            </>
          ) : initialData ? (
            'Lưu thay đổi'
          ) : (
            'Tạo báo cáo'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default UploadReportModal
