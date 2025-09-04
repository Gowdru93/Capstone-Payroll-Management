import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardCard from './DashboardCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { employeeService } from '../../services/employeeService'
import { leaveService } from '../../services/leaveService'
import { payrollService } from '../../services/payrollService'
import { formatDate, getErrorMessage } from '../../utils/helpers'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    recentPayrolls: 0,
    activeEmployees: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [employees, pendingLeaves, payrolls] = await Promise.all([
        employeeService.getAllEmployees(),
        leaveService.getPendingLeaveRequests(),
        payrollService.getAllPayrolls()
      ])

      setDashboardData({
        totalEmployees: employees.length,
        pendingLeaves: pendingLeaves.length,
        recentPayrolls: payrolls.filter(p => 
          new Date(p.generatedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        activeEmployees: employees.filter(e => e.leaveBalance > 0).length
      })

      // Example activities
      setRecentActivities([
        { id: 1, type: 'leave', message: 'New leave request submitted', time: new Date() },
        { id: 2, type: 'payroll', message: 'Payroll processed for March', time: new Date() },
        { id: 3, type: 'employee', message: 'New employee onboarded', time: new Date() }
      ])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
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
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0" >Admin Dashboard</h1>
        <div className="text-muted">{formatDate(new Date())}</div>
      </div>

      {/* Dashboard Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <DashboardCard
            title="Total Employees"
            value={dashboardData.totalEmployees}
            onClick={() => navigate('/employees')}
          />
        </div>
        <div className="col-md-3">
          <DashboardCard
            title="Pending Leaves"
            value={dashboardData.pendingLeaves}
            onClick={() => navigate('/leaves/approval')}
          />
        </div>
        <div className="col-md-3">
          <DashboardCard
            title="Recent Payrolls"
            value={dashboardData.recentPayrolls}
            onClick={() => navigate('/payroll')}
          />
        </div>
        <div className="col-md-3">
          <DashboardCard
            title="Active Employees"
            value={dashboardData.activeEmployees}
          />
        </div>
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/employees/new')}
                >
                  Add Employee
                </button>
                <button 
                  className="btn btn-outline-success"
                  onClick={() => navigate('/payroll/new')}
                >
                  Generate Payroll
                </button>
                <button 
                  className="btn btn-outline-warning"
                  onClick={() => navigate('/leaves/approval')}
                >
                  Approve Leaves
                </button>
                <button 
                  className="btn btn-outline-info"
                  onClick={() => navigate('/departments/new')}
                >
                  Add Department
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Recent Activities</h5>
            </div>
            <div className="card-body">
              {recentActivities.length > 0 ? (
                <ul className="list-unstyled mb-0">
                  {recentActivities.map((activity) => (
                    <li key={activity.id} className="mb-3">
                      <p className="mb-1">{activity.message}</p>
                      <small className="text-muted">{formatDate(activity.time)}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No recent activities</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
