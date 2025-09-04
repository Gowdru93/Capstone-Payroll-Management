import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobRoleService } from '../../services/jobRoleService'
import LoadingSpinner from '../common/LoadingSpinner'
import { getErrorMessage } from '../../utils/helpers'

const JobRoleForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    jobTitle: '',
    baseSalary: '',
    description: ''
  })

  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadJobRole()
    }
  }, [id])

  const loadJobRole = async () => {
    try {
      setLoading(true)
      const jobRole = await jobRoleService.getJobRoleById(id)
      setFormData({
        jobTitle: jobRole.jobTitle,
        baseSalary: jobRole.baseSalary,
        description: jobRole.description || ''
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.jobTitle.trim()) {
      setError('Job title is required')
      return false
    }
    if (!formData.baseSalary || formData.baseSalary <= 0) {
      setError('Base salary must be greater than 0')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    try {
      setSubmitLoading(true)
      if (isEdit) {
        await jobRoleService.updateJobRole(id, formData)
      } else {
        await jobRoleService.createJobRole(formData)
      }
      navigate('/jobroles')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading job role data..." />
  }

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{isEdit ? 'Edit Job Role' : 'Add Job Role'}</h2>
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={() => navigate('/jobroles')}
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button
            type="button"
            className="btn-close float-end"
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header">
              <h6>Job Role Information</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="jobTitle" className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    disabled={submitLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="baseSalary" className="form-label">Base Salary *</label>
                  <input
                    type="number"
                    className="form-control"
                    id="baseSalary"
                    name="baseSalary"
                    value={formData.baseSalary}
                    onChange={handleChange}
                    disabled={submitLoading}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={submitLoading}
                  ></textarea>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={submitLoading}
                  >
                    {submitLoading
                      ? isEdit ? 'Updating...' : 'Creating...'
                      : isEdit ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => navigate('/jobroles')}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6>Instructions</h6>
            </div>
            <div className="card-body">
              <ul className="mb-0">
                <li>Job title is required and must be unique.</li>
                <li>Base salary should be standard for this role.</li>
                <li>Description helps employees understand the role.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobRoleForm
