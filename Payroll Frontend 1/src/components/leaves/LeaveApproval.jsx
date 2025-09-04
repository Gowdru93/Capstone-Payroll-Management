import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { leaveService } from '../../services/leaveService'
import { employeeService } from '../../services/employeeService'
import LoadingSpinner from '../common/LoadingSpinner'
import ConfirmModal from '../common/ConfirmModal'
import { formatDate, getErrorMessage } from '../../utils/helpers'

const LeaveApproval = () => {
  const { user } = useAuth()
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [adminEmployee, setAdminEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionModal, setActionModal] = useState({ show: false, leave: null, action: null })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [pendingData, employeeData] = await Promise.all([
        leaveService.getPendingLeaveRequests(),
        employeeService.getEmployeeByUserId(user.id)
      ])
      setPendingLeaves(pendingData)
      setAdminEmployee(employeeData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveAction = async () => {
    try {
      const { leave, action } = actionModal
      await leaveService.updateLeaveRequestStatus(
        leave.leaveId,
        action,
        adminEmployee.employeeId
      )
      setPendingLeaves(pendingLeaves.filter(l => l.leaveId !== leave.leaveId))
      setActionModal({ show: false, leave: null, action: null })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading pending leave requests..." />
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5">Leave Approval</h2>
        <span className="badge bg-secondary">
          {pendingLeaves.length} Pending
        </span>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button type="button" className="btn-close float-end" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">Pending Leave Requests</h6>
        </div>
        <div className="card-body p-0">
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-4">
              <span className="text-success">✓</span>
              <p className="mb-0">No pending requests</p>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {pendingLeaves.map((leave) => (
                <li key={leave.leaveId} className="list-group-item">
                  <div className="mb-2">
                    <strong>Employee #{leave.employeeId}</strong>  
                    <div className="small text-muted">
                      Applied {formatDate(leave.appliedDate)}
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="badge bg-light text-dark me-2">{leave.leaveType}</span>
                    <span className="badge bg-info">
                      {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                    </span>
                  </div>
                  <div className="small text-muted mb-2">
                    <strong>Period:</strong> {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                  </div>
                  <div className="small text-muted mb-3">
                    <strong>Reason:</strong> {leave.reason}
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => setActionModal({ show: true, leave, action: 'APPROVED' })}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setActionModal({ show: true, leave, action: 'REJECTED' })}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmModal
        show={actionModal.show}
        onHide={() => setActionModal({ show: false, leave: null, action: null })}
        onConfirm={handleLeaveAction}
        title={`${actionModal.action === 'APPROVED' ? 'Approve' : 'Reject'} Leave`}
        message={`Are you sure you want to ${actionModal.action?.toLowerCase()} this leave request for Employee #${actionModal.leave?.employeeId}?`}
        confirmText={actionModal.action === 'APPROVED' ? 'Approve' : 'Reject'}
        variant={actionModal.action === 'APPROVED' ? 'success' : 'danger'}
      />
    </div>
  )
}

export default LeaveApproval
