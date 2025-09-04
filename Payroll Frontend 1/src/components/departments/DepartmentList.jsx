import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { departmentService } from '../../services/departmentService'
import LoadingSpinner from '../common/LoadingSpinner'
import ConfirmModal from '../common/ConfirmModal'
import { getErrorMessage, filterBy } from '../../utils/helpers'

const DepartmentList = () => {
  const [departments, setDepartments] = useState([])
  const [filteredDepartments, setFilteredDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, department: null })

  const navigate = useNavigate()

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    const filtered = filterBy(departments, searchTerm, ['departmentName', 'description'])
    setFilteredDepartments(filtered)
  }, [departments, searchTerm])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await departmentService.getAllDepartments()
      setDepartments(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDepartment = async () => {
    try {
      await departmentService.deleteDepartment(deleteModal.department.departmentId)
      setDepartments(departments.filter(dept => dept.departmentId !== deleteModal.department.departmentId))
      setDeleteModal({ show: false, department: null })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading departments..." />
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Departments</h3>
        <Link to="/departments/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i> Add Department
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button type="button" className="btn-close float-end" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredDepartments.length === 0 ? (
        <div className="text-center p-5">
          <i className="bi bi-building fs-1 text-muted mb-3"></i>
          <h5>No departments found</h5>
          <p className="text-muted">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding a new department.'}
          </p>
          {!searchTerm && (
            <Link to="/departments/new" className="btn btn-primary">
              <i className="bi bi-plus-circle me-1"></i> Add Department
            </Link>
          )}
        </div>
      ) : (
        <div className="row g-3">
          {filteredDepartments.map((department) => (
            <div key={department.departmentId} className="col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{department.departmentName}</h5>
                  <p className="card-text text-muted">
                    {department.description || 'No description available'}
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <small className="text-muted">ID: {department.departmentId}</small>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => navigate(`/departments/edit/${department.departmentId}`)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setDeleteModal({ show: true, department })}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, department: null })}
        onConfirm={handleDeleteDepartment}
        title="Delete Department"
        message={`Are you sure you want to delete the ${deleteModal.department?.departmentName} department?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

export default DepartmentList
