import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { employeeService } from '../../services/employeeService'
import { departmentService } from '../../services/departmentService'
import { jobRoleService } from '../../services/jobRoleService'
import LoadingSpinner from '../common/LoadingSpinner'
import { getErrorMessage, validatePhone } from '../../utils/helpers'

const EmployeeForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    hireDate: '',
    departmentId: '',
    jobId: '',
    leaveBalance: 20
  })

  const [departments, setDepartments] = useState([])
  const [jobRoles, setJobRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFormData()
  }, [id])

  const loadFormData = async () => {
    try {
      setLoading(true)
      const [departmentsData, jobRolesData] = await Promise.all([
        departmentService.getAllDepartments(),
        jobRoleService.getAllJobRoles()
      ])
      setDepartments(departmentsData)
      setJobRoles(jobRolesData)

      if (isEdit) {
        const employee = await employeeService.getEmployeeById(id)
        setFormData({
          userId: employee.userId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          dateOfBirth: employee.dateOfBirth || '',
          phoneNumber: employee.phoneNumber || '',
          address: employee.address || '',
          hireDate: employee.hireDate,
          departmentId: employee.departmentId || '',
          jobId: employee.jobId || '',
          leaveBalance: employee.leaveBalance || 20
        })
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) return setError('First name is required')
    if (!formData.lastName.trim()) return setError('Last name is required')
    if (!formData.hireDate) return setError('Hire date is required')
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      return setError('Please enter a valid phone number')
    }
    if (!isEdit && !formData.userId) return setError('User ID is required')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return

    try {
      setSubmitLoading(true)
      const submitData = {
        ...formData,
        departmentId: formData.departmentId || null,
        jobId: formData.jobId || null
      }
      if (isEdit) {
        await employeeService.updateEmployee(id, submitData)
      } else {
        await employeeService.createEmployee(submitData)
      }
      navigate('/employees')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading form data..." />

  return (
    <div className="page-transition">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </h1>
        <button 
          type="button" 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/employees')}
        >
          <i className="bi bi-arrow-left-circle me-2"></i>
          Back
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-person-fill me-2"></i>
                Employee Details
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {!isEdit && (
                    <div className="col-md-12">
                      <label htmlFor="userId" className="form-label">User ID *</label>
                      <input
                        type="number"
                        className="form-control"
                        id="userId"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        required
                        disabled={submitLoading}
                      />
                      <div className="form-text">Enter the linked User ID</div>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={submitLoading}
                      placeholder="10-digit number"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={submitLoading}
                    ></textarea>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="hireDate" className="form-label">Hire Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      id="hireDate"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={handleChange}
                      required
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="leaveBalance" className="form-label">Leave Balance</label>
                    <input
                      type="number"
                      className="form-control"
                      id="leaveBalance"
                      name="leaveBalance"
                      value={formData.leaveBalance}
                      onChange={handleChange}
                      min="0"
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="departmentId" className="form-label">Department</label>
                    <select
                      className="form-select"
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      disabled={submitLoading}
                    >
                      <option value="">Select</option>
                      {departments.map((dept) => (
                        <option key={dept.departmentId} value={dept.departmentId}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="jobId" className="form-label">Job Role</label>
                    <select
                      className="form-select"
                      id="jobId"
                      name="jobId"
                      value={formData.jobId}
                      onChange={handleChange}
                      disabled={submitLoading}
                    >
                      <option value="">Select</option>
                      {jobRoles.map((job) => (
                        <option key={job.jobId} value={job.jobId}>
                          {job.jobTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className={`bi ${isEdit ? 'bi-save' : 'bi-person-plus'} me-2`}></i>
                        {isEdit ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/employees')}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeForm
