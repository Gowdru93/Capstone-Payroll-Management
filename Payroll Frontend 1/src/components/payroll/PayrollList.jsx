import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { payrollService } from '../../services/payrollService'
import { employeeService } from '../../services/employeeService'
import LoadingSpinner from '../common/LoadingSpinner'
import { formatDate, formatCurrency, getStatusBadgeClass, getErrorMessage, getMonthName } from '../../utils/helpers'
import { ROLES, MONTHS, YEARS } from '../../utils/constants'

const PayrollList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === ROLES.ADMIN

  const [payrolls, setPayrolls] = useState([])
  const [filteredPayrolls, setFilteredPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')

  useEffect(() => {
    loadPayrolls()
  }, [user])

  useEffect(() => {
    let filtered = payrolls
    if (filterMonth) filtered = filtered.filter(p => p.month === parseInt(filterMonth))
    if (filterYear) filtered = filtered.filter(p => p.year === parseInt(filterYear))
    setFilteredPayrolls(filtered)
  }, [payrolls, filterMonth, filterYear])

  const loadPayrolls = async () => {
    try {
      setLoading(true)
      setError('')
      if (isAdmin) {
        const data = await payrollService.getAllPayrolls()
        setPayrolls(data)
      } else {
        const employee = await employeeService.getEmployeeByUserId(user.id)
        const data = await payrollService.getPayrollsByEmployee(employee.employeeId)
        setPayrolls(data)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayroll = async (payrollId) => {
    try {
      await payrollService.processPayroll(payrollId)
      loadPayrolls()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingSpinner text="Loading payroll records..." />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0">
          {isAdmin ? 'Payroll Management' : 'My Payroll Records'}
        </h1>
        {isAdmin && (
          <Link to="/payroll/new" className="btn btn-primary btn-sm">
            Generate Payroll
          </Link>
        )}
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between">
          <span>{error}</span>
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h6 className="mb-0">Payroll Records ({filteredPayrolls.length})</h6>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">All Years</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {filteredPayrolls.length === 0 ? (
            <div className="text-center py-4">
              <h6>No payroll records found</h6>
              <p className="text-muted small">
                {filterMonth || filterYear ? 'Try adjusting your filters' : 'No payroll records available'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-striped mb-0">
                <thead>
                  <tr>
                    {isAdmin && <th>Employee</th>}
                    <th>Period</th>
                    <th>Basic Salary</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map((payroll) => (
                    <tr key={payroll.payrollId}>
                      {isAdmin && <td>Employee #{payroll.employeeId}</td>}
                      <td>
                        {getMonthName(payroll.month)} {payroll.year}
                        <br />
                        <small className="text-muted">Generated: {formatDate(payroll.generatedDate)}</small>
                      </td>
                      <td>{formatCurrency(payroll.baseSalary)}</td>
                      <td>{formatCurrency(payroll.allowances)}</td>
                      <td>{formatCurrency(payroll.deductions)}</td>
                      <td>
                        <strong className="text-success">{formatCurrency(payroll.netSalary)}</strong>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(payroll.status)}>
                          {payroll.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate(`/payroll/details/${payroll.payrollId}`)}
                          >
                            View
                          </button>
                          {isAdmin && payroll.status === 'PENDING' && (
                            <button
                              className="btn btn-outline-success"
                              onClick={() => handleProcessPayroll(payroll.payrollId)}
                            >
                              Process
                            </button>
                          )}
                          <button
                            className="btn btn-outline-dark"
                            onClick={() => window.print()}
                          >
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PayrollList
