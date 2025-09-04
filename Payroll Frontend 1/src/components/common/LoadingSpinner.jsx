import React from 'react'

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        style={{
          width: '30px',
          height: '30px',
          border: '3px solid #ddd',
          borderTop: '3px solid #333',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && <div style={{ marginTop: '10px', color: '#555' }}>{text}</div>}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default LoadingSpinner
