import React from 'react'

const DashboardCard = ({ 
  title, 
  value, 
  subtitle = '',
  onClick = null
}) => {
  return (
    <div 
      style={{
        border: '1px solid #ddd',
        borderRadius: '6px',
        padding: '16px',
        margin: '10px 0',
        backgroundColor: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left'
      }}
      onClick={onClick}
    >
      <h5 style={{ margin: 0, color: '#000' }}>{title}</h5>
      <h2 style={{ margin: '8px 0', color: '#000' }}>{value}</h2>
      {subtitle && <p style={{ margin: 0, color: '#555' }}>{subtitle}</p>}
    </div>
  )
}

export default DashboardCard
