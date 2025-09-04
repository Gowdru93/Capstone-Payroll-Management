import React from 'react'

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Yes',
  cancelText = 'No'
}) => {
  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ background: 'white', padding: '20px', borderRadius: '5px', width: '300px' }}>
        <h4>{title}</h4>
        <p>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onHide}>{cancelText}</button>
          <button onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
