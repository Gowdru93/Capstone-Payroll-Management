import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { employeeService } from '../../services/employeeService'
import { leaveService } from '../../services/leaveService'
import { payrollService } from '../../services/payrollService'
import LoadingSpinner from '../common/LoadingSpinner'
import { formatDate, formatCurrency, getStatusBadgeClass, getErrorMessage } from '../../utils/helpers'

const EmployeeProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEmployeeData()
  }, [id])

  const loadEmployeeData = async () => {
    try {
      setLoading(true)
      const employeeData = await employeeService.getEmployeeById(id)

      const [leaveData, payrollData] = await Promise.all([
        leaveService.getLeaveRequestsByEmployee(id).catch(() => []),
        payrollService.getPayrollsByEmployee(id).catch(() => [])
      ])

      setEmployee(employeeData)
      setLeaves(leaveData.slice(0, 5))
      setPayrolls(payrollData.slice(0, 5))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading employee profile..." />
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button className="btn btn-link p-0 ms-2" onClick={loadEmployeeData}>
          Try again
        </button>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-4">
        <h5>Employee not found</h5>
        <button className="btn btn-secondary" onClick={() => navigate('/employees')}>
          Back to Employees
        </button>
      </div>
    )
  }

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Employee Profile</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-dark"
            onClick={() => navigate(`/employees/edit/${id}`)}
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-outline-dark"
            onClick={() => navigate('/employees')}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Left Column */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body text-center">
              <div
                className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '70px', height: '70px', fontSize: '1.5rem' }}
              >
                {employee.firstName?.charAt(0)}
                {employee.lastName?.charAt(0)}
              </div>
              <h5 className="mb-1">
                {employee.firstName} {employee.lastName}
              </h5>
              <p className="text-muted">{employee.jobTitle || 'No Job Title'}</p>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6>Contact Information</h6>
            </div>
            <div className="card-body">
              <p><strong>ID:</strong> {employee.employeeId}</p>
              {employee.phoneNumber && <p><strong>Phone:</strong> {employee.phoneNumber}</p>}
              {employee.address && <p><strong>Address:</strong> {employee.address}</p>}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header">
              <h6>Employee Details</h6>
            </div>
            <div className="card-body">
              <p><strong>Department:</strong> {employee.departmentName || 'Not assigned'}</p>
              <p><strong>Job Title:</strong> {employee.jobTitle || 'Not assigned'}</p>
              <p><strong>Hire Date:</strong> {formatDate(employee.hireDate)}</p>
              {employee.dateOfBirth && (
                <p><strong>Date of Birth:</strong> {formatDate(employee.dateOfBirth)}</p>
              )}
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">
              <h6>Recent Leave Requests</h6>
            </div>
            <div className="card-body">
              {leaves.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Period</th>
                      <th>Status</th>
                      <th>Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave.leaveId}>
                        <td>{leave.leaveType}</td>
                        <td>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</td>
                        <td>{leave.status}</td>
                        <td>{formatDate(leave.appliedDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">No leave requests found</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h6>Recent Payrolls</h6>
            </div>
            <div className="card-body">
              {payrolls.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Basic Salary</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((payroll) => (
                      <tr key={payroll.payrollId}>
                        <td>{payroll.month}/{payroll.year}</td>
                        <td>{formatCurrency(payroll.baseSalary)}</td>
                        <td>{formatCurrency(payroll.netSalary)}</td>
                        <td>{payroll.status}</td>
                        <td>{formatDate(payroll.generatedDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">No payroll records found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeProfile
