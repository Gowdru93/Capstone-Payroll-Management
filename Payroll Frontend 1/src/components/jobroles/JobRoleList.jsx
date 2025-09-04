import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jobRoleService } from '../../services/jobRoleService'
import ConfirmModal from '../common/ConfirmModal'
import { getErrorMessage, filterBy, formatCurrency } from '../../utils/helpers'

const JobRoleList = () => {
  const [jobRoles, setJobRoles] = useState([])
  const [filteredJobRoles, setFilteredJobRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, jobRole: null })

  const navigate = useNavigate()

  useEffect(() => {
    loadJobRoles()
  }, [])

  useEffect(() => {
    const filtered = filterBy(jobRoles, searchTerm, ['jobTitle', 'description'])
    setFilteredJobRoles(filtered)
  }, [jobRoles, searchTerm])

  const loadJobRoles = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await jobRoleService.getAllJobRoles()
      setJobRoles(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJobRole = async () => {
    try {
      await jobRoleService.deleteJobRole(deleteModal.jobRole.jobId)
      setJobRoles(jobRoles.filter(job => job.jobId !== deleteModal.jobRole.jobId))
      setDeleteModal({ show: false, jobRole: null })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return <div className="text-center py-5">Loading job roles...</div>
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Job Roles</h2>
        <Link to="/jobroles/new" className="btn btn-success btn-sm">
          + Add Job Role
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button type="button" className="btn-close float-end" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Job Roles ({filteredJobRoles.length})</span>
          <input
            type="text"
            className="form-control form-control-sm w-50"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="card-body p-0">
          {filteredJobRoles.length === 0 ? (
            <div className="text-center py-4">
              <p className="mb-2">No job roles found</p>
              {!searchTerm && (
                <Link to="/jobroles/new" className="btn btn-success btn-sm">
                  + Add Job Role
                </Link>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Base Salary</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobRoles.map((jobRole) => (
                    <tr key={jobRole.jobId}>
                      <td>{jobRole.jobTitle} <small className="text-muted">(ID: {jobRole.jobId})</small></td>
                      <td>{formatCurrency(jobRole.baseSalary)}</td>
                      <td>{jobRole.description || 'No description'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => navigate(`/jobroles/edit/${jobRole.jobId}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteModal({ show: true, jobRole })}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, jobRole: null })}
        onConfirm={handleDeleteJobRole}
        title="Delete Job Role"
        message={`Are you sure you want to delete the ${deleteModal.jobRole?.jobTitle} job role?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

export default JobRoleList
