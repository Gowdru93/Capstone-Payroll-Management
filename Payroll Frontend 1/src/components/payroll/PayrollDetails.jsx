import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { payrollService } from '../../services/payrollService'
import { employeeService } from '../../services/employeeService'
import LoadingSpinner from '../common/LoadingSpinner'
import { formatDate, formatCurrency, getStatusBadgeClass, getErrorMessage, getMonthName } from '../../utils/helpers'

const PayrollDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [payroll, setPayroll] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPayrollDetails()
  }, [id])

  const loadPayrollDetails = async () => {
    try {
      setLoading(true)
      const payrollData = await payrollService.getPayrollById(id)
      const employeeData = await employeeService.getEmployeeById(payrollData.employeeId)
      
      setPayroll(payrollData)
      setEmployee(employeeData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <LoadingSpinner text="Loading payroll details..." />
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button className="btn btn-link p-0 ms-2" onClick={loadPayrollDetails}>
          Try again
        </button>
      </div>
    )
  }

  if (!payroll || !employee) {
    return (
      <div className="text-center py-5">
        <h5>Payroll record not found</h5>
        <button className="btn btn-secondary" onClick={() => navigate('/payroll')}>
          Back to Payroll
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <h1 className="h4 mb-0">Payroll Details</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-dark" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i>
            Print
          </button>
          <button 
            className="btn btn-outline-dark"
            onClick={() => navigate('/payroll')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>
        </div>
      </div>

      <div className="card payslip">
        <div className="card-header bg-dark text-white">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="mb-0">
                <i className="bi bi-building me-2"></i>
                Payroll Management
              </h5>
              <small>Salary Slip</small>
            </div>
            <div className="col-md-6 text-md-end">
              <h6 className="mb-0">{getMonthName(payroll.month)} {payroll.year}</h6>
              <small>Generated: {formatDate(payroll.generatedDate)}</small>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <h6 className="mb-3">Employee Information</h6>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td>Employee ID</td>
                    <td>{employee.employeeId}</td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td>{employee.firstName} {employee.lastName}</td>
                  </tr>
                  <tr>
                    <td>Department</td>
                    <td>{employee.departmentName || 'Not assigned'}</td>
                  </tr>
                  <tr>
                    <td>Position</td>
                    <td>{employee.jobTitle || 'Not assigned'}</td>
                  </tr>
                  <tr>
                    <td>Join Date</td>
                    <td>{formatDate(employee.hireDate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h6 className="mb-3">Payroll Information</h6>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td>Payroll ID</td>
                    <td>{payroll.payrollId}</td>
                  </tr>
                  <tr>
                    <td>Pay Period</td>
                    <td>{getMonthName(payroll.month)} {payroll.year}</td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>
                      <span className={getStatusBadgeClass(payroll.status)}>
                        {payroll.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Generated</td>
                    <td>{formatDate(payroll.generatedDate)}</td>
                  </tr>
                  {payroll.processedDate && (
                    <tr>
                      <td>Processed</td>
                      <td>{formatDate(payroll.processedDate)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <h6 className="mb-3">Salary Breakdown</h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td className="text-end">{formatCurrency(payroll.baseSalary)}</td>
                </tr>
                <tr>
                  <td>Allowances</td>
                  <td className="text-end">+{formatCurrency(payroll.allowances)}</td>
                </tr>
                <tr>
                  <td>Deductions</td>
                  <td className="text-end">-{formatCurrency(payroll.deductions)}</td>
                </tr>
                <tr className="table-light">
                  <td className="fw-bold">NET SALARY</td>
                  <td className="text-end fw-bold">
                    {formatCurrency(payroll.netSalary)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-top pt-3 mt-4">
            <small className="text-muted">
              <strong>Note:</strong> This is a system-generated payslip. No signature is required.
            </small>
          </div>
        </div>

        <div className="card-footer text-center">
          <small className="text-muted">
            © 2024 Payroll Management System
          </small>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .card { border: none !important; box-shadow: none !important; }
          .payslip { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}

export default PayrollDetails
