import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardCard from './DashboardCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { employeeService } from '../../services/employeeService'
import { leaveService } from '../../services/leaveService'
import { payrollService } from '../../services/payrollService'
import { formatDate, formatCurrency, getStatusBadgeClass, getErrorMessage } from '../../utils/helpers'

const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState(null)
  const [dashboardStats, setDashboardStats] = useState({
    leaveBalance: 0,
    pendingLeaves: 0,
    recentPayrolls: 0,
    totalLeavesTaken: 0
  })
  const [recentLeaves, setRecentLeaves] = useState([])
  const [recentPayrolls, setRecentPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const employee = await employeeService.getEmployeeByUserId(user.id)
      setEmployeeData(employee)

      const leaves = await leaveService.getLeaveRequestsByEmployee(employee.employeeId)
      const pendingLeaves = leaves.filter(leave => leave.status === 'PENDING')
      const approvedLeaves = leaves.filter(leave => leave.status === 'APPROVED')
      setRecentLeaves(leaves.slice(0, 3))

      const payrolls = await payrollService.getPayrollsByEmployee(employee.employeeId)
      setRecentPayrolls(payrolls.slice(0, 3))

      setDashboardStats({
        leaveBalance: employee.leaveBalance || 0,
        pendingLeaves: pendingLeaves.length,
        recentPayrolls: payrolls.filter(p => 
          new Date(p.generatedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        totalLeavesTaken: approvedLeaves.length
      })

    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button className="btn btn-link p-0 ms-2" onClick={loadDashboardData}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="container py-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-black">Welcome, {employeeData?.firstName}!</h1>
          <p className="text-muted mb-0">
            {employeeData?.jobTitle || 'Employee'} • {employeeData?.departmentName || 'No Department'}
          </p>
        </div>
        <div className="text-muted">
          <i className="bi bi-calendar3 me-2"></i>
          {formatDate(new Date())}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <DashboardCard title="Leave Balance" value={dashboardStats.leaveBalance} subtitle="Days remaining" />
        </div>
        <div className="col-md-3">
          <DashboardCard title="Pending Leaves" value={dashboardStats.pendingLeaves} subtitle="Awaiting approval" />
        </div>
        <div className="col-md-3">
          <DashboardCard title="Recent Payrolls" value={dashboardStats.recentPayrolls} subtitle="Last 30 days" />
        </div>
        <div className="col-md-3">
          <DashboardCard title="Leaves Taken" value={dashboardStats.totalLeavesTaken} subtitle="This year" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <button className="btn btn-outline-primary w-100 p-3" onClick={() => navigate('/leaves/new')}>
                    Apply for Leave
                  </button>
                </div>
                <div className="col-md-6">
                  <button className="btn btn-outline-success w-100 p-3" onClick={() => navigate('/payroll')}>
                    View Payslips
                  </button>
                </div>
                <div className="col-md-6">
                  <button className="btn btn-outline-info w-100 p-3" onClick={() => navigate(`/employees/profile/${employeeData?.employeeId}`)}>
                    My Profile
                  </button>
                </div>
                <div className="col-md-6">
                  <button className="btn btn-outline-warning w-100 p-3" onClick={() => navigate('/leaves')}>
                    Leave History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Leaves */}
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Recent Leave Requests</h5>
            </div>
            <div className="card-body">
              {recentLeaves.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentLeaves.map((leave) => (
                    <div key={leave.leaveId} className="list-group-item border-0 px-0 py-3">
                      <h6 className="mb-1">{leave.leaveType}</h6>
                      <p className="mb-1 text-muted small">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                      <span className={getStatusBadgeClass(leave.status)}>{leave.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <p>No leave requests</p>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/leaves/new')}>
                    Apply for Leave
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      {recentPayrolls.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Recent Payslips</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Basic Salary</th>
                        <th>Allowances</th>
                        <th>Deductions</th>
                        <th>Net Salary</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayrolls.map((payroll) => (
                        <tr key={payroll.payrollId}>
                          <td><strong>{payroll.month}/{payroll.year}</strong></td>
                          <td>{formatCurrency(payroll.baseSalary)}</td>
                          <td>{formatCurrency(payroll.allowances)}</td>
                          <td>{formatCurrency(payroll.deductions)}</td>
                          <td><strong className="text-success">{formatCurrency(payroll.netSalary)}</strong></td>
                          <td><span className={getStatusBadgeClass(payroll.status)}>{payroll.status}</span></td>
                          <td>
                            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/payroll/details/${payroll.payrollId}`)}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeDashboard
