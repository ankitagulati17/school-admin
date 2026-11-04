import {
  AppBar, Toolbar, IconButton, Typography, Box,
  Avatar, Menu, MenuItem, Divider, Chip
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LogoutIcon from '@mui/icons-material/Logout'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ROLE_COLORS = {
  ADMIN: '#818cf8', PRINCIPAL: '#60a5fa', TEACHER: '#34d399',
  CLERK: '#fbbf24', STUDENT: '#38bdf8',
}

export default function Navbar({ drawerWidth, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState(null)

  const roleColor = ROLE_COLORS[user?.role] || '#94a3b8'

  const handleLogout = () => {
    setAnchor(null)
    logout()
    navigate('/login')
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        color: '#111827',
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, sm: 3 } }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' }, color: '#374151' }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="subtitle1"
          sx={{ flex: 1, fontWeight: 600, color: '#111827', fontSize: 15 }}
        >
          School Administration System
        </Typography>

        {/* User menu trigger */}
        <Box
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            '&:hover': { bgcolor: '#f9fafb' },
            transition: 'background-color 0.12s',
          }}
        >
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: '#1e293b',
              color: roleColor,
            }}
          >
            {user?.fullName?.charAt(0)}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
              {user?.fullName}
            </Typography>
            <Typography sx={{ fontSize: 10, color: '#6b7280', lineHeight: 1 }}>
              {user?.role}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#9ca3af', display: { xs: 'none', sm: 'block' } }} />
        </Box>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          PaperProps={{
            elevation: 2,
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
              {user?.fullName}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              sx={{ mt: 0.5, height: 18, fontSize: 10, fontWeight: 600, bgcolor: '#f1f5f9', color: '#374151' }}
            />
          </Box>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{ gap: 1.5, py: 1.1, fontSize: 13, color: '#dc2626', '&:hover': { bgcolor: '#fef2f2' } }}
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
