import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar')
    const mainContent = document.querySelector('.main-content')

    if (sidebar) sidebar.classList.toggle('collapsed')
    if (mainContent) mainContent.classList.toggle('expanded')
  }

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #ddd', padding: '10px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={toggleSidebar} 
            style={{ background: 'none', border: '1px solid #ccc', padding: '5px 10px', cursor: 'pointer' }}
          >
            ☰
          </button>
          <h4 style={{ margin: 0 }}>Dashboard</h4>
        </div>

        {/* Right side */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ background: 'none', border: '1px solid #ccc', padding: '5px 10px', cursor: 'pointer' }}
          >
            {user?.username || 'User'}
          </button>

          {showDropdown && (
            <div style={{ 
              position: 'absolute', 
              right: 0, 
              top: '100%', 
              background: 'white', 
              border: '1px solid #ddd', 
              padding: '10px',
              marginTop: '5px',
              minWidth: '150px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>{user?.username}</strong><br />
                <small>{user?.email}</small>
              </div>
              <button 
                style={{ display: 'block', width: '100%', padding: '5px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => {
                  setShowDropdown(false)
                  navigate('/employees/profile/' + user?.id)
                }}
              >
                Profile
              </button>
              <button 
                style={{ display: 'block', width: '100%', padding: '5px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowDropdown(false)}
              >
                Settings
              </button>
              <hr />
              <button 
                style={{ display: 'block', width: '100%', padding: '5px', textAlign: 'left', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Header
