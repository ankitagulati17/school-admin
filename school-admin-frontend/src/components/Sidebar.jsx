import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Box, Avatar, Chip
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import ClassIcon from '@mui/icons-material/Class'
import ScienceIcon from '@mui/icons-material/Science'
import PaymentIcon from '@mui/icons-material/Payment'
import EventNoteIcon from '@mui/icons-material/EventNote'
import BarChartIcon from '@mui/icons-material/BarChart'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AssessmentIcon from '@mui/icons-material/Assessment'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PersonIcon from '@mui/icons-material/Person'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ALL_LINKS = [
  { label: 'Dashboard',       path: '/dashboard',   icon: <DashboardIcon fontSize="small" />,    roles: ['ADMIN','PRINCIPAL','TEACHER','CLERK','STUDENT'] },
  { label: 'User Management', path: '/users',        icon: <PeopleIcon fontSize="small" />,       roles: ['ADMIN'] },
  { label: 'Classes',         path: '/classes',      icon: <ClassIcon fontSize="small" />,        roles: ['ADMIN'] },
  { label: 'Sections',        path: '/sections',     icon: <SchoolIcon fontSize="small" />,       roles: ['ADMIN'] },
  { label: 'Subjects',        path: '/subjects',     icon: <ScienceIcon fontSize="small" />,      roles: ['ADMIN'] },
  { label: 'Admission',       path: '/admission',    icon: <SchoolIcon fontSize="small" />,       roles: ['CLERK','ADMIN'] },
  { label: 'Fee Payment',     path: '/fees',         icon: <PaymentIcon fontSize="small" />,      roles: ['CLERK','ADMIN','PRINCIPAL'] },
  { label: 'Attendance',      path: '/attendance',   icon: <EventNoteIcon fontSize="small" />,    roles: ['TEACHER','ADMIN'] },
  { label: 'Performance',     path: '/performance',  icon: <EmojiEventsIcon fontSize="small" />,  roles: ['TEACHER','ADMIN','PRINCIPAL'] },
  { label: 'Syllabus',        path: '/syllabus',     icon: <MenuBookIcon fontSize="small" />,     roles: ['TEACHER','ADMIN','PRINCIPAL'] },
  { label: 'Class Schedule',  path: '/schedule',     icon: <CalendarMonthIcon fontSize="small" />,roles: ['PRINCIPAL','ADMIN'] },
  { label: 'Reports',         path: '/reports',      icon: <AssessmentIcon fontSize="small" />,   roles: ['PRINCIPAL','ADMIN','CLERK'] },
  { label: 'Analysis',        path: '/analysis',     icon: <BarChartIcon fontSize="small" />,     roles: ['PRINCIPAL','ADMIN'] },
  { label: 'My Portal',       path: '/student',      icon: <PersonIcon fontSize="small" />,       roles: ['STUDENT'] },
]

const ROLE_COLORS = {
  ADMIN: '#818cf8', PRINCIPAL: '#60a5fa', TEACHER: '#34d399',
  CLERK: '#fbbf24', STUDENT: '#38bdf8',
}

export default function Sidebar({ drawerWidth, mobileOpen, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const links = ALL_LINKS.filter(l => l.roles.includes(user?.role))
  const roleColor = ROLE_COLORS[user?.role] || '#94a3b8'

  const content = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e293b',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#334155', borderRadius: 2 },
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#2563eb',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SchoolIcon sx={{ fontSize: 18, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
              School Admin
            </Typography>
            <Typography sx={{ fontSize: 10, color: '#64748b', lineHeight: 1 }}>
              Management System
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#334155' }} />

      {/* User info */}
      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: '#334155', color: roleColor }}>
            {user?.fullName?.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {user?.fullName}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              sx={{ height: 16, fontSize: 9, fontWeight: 600, bgcolor: '#334155', color: roleColor, border: 'none', mt: 0.25 }}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#334155' }} />

      {/* Nav */}
      <List dense sx={{ px: 1.5, py: 1.5, flex: 1 }}>
        {links.map(({ label, path, icon }) => {
          const isActive = location.pathname === path
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(path); onClose() }}
                sx={{
                  borderRadius: 1.5,
                  py: 0.9,
                  px: 1.5,
                  bgcolor: isActive ? '#2563eb' : 'transparent',
                  '&:hover': { bgcolor: isActive ? '#2563eb' : '#334155' },
                  transition: 'background-color 0.12s',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: isActive ? '#fff' : '#cbd5e1',
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#fff' : '#cbd5e1',
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* Footer */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography sx={{ fontSize: 10, color: '#475569' }}>
          AY 2024–25
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 'none' } }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none' } }}
        open
      >
        {content}
      </Drawer>
    </Box>
  )
}
