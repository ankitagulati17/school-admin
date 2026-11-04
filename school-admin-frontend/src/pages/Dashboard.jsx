import { useEffect, useState } from 'react'
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress,
  Button, Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import PaymentIcon from '@mui/icons-material/Payment'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import ClassIcon from '@mui/icons-material/Class'
import EventNoteIcon from '@mui/icons-material/EventNote'
import BarChartIcon from '@mui/icons-material/BarChart'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SchoolIcon from '@mui/icons-material/School'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getAdmissionReport } from '../api/reportApi'
import { getFeeSummary } from '../api/feeApi'

const QUICK_ACTIONS = {
  ADMIN: [
    { label: 'User Management', path: '/users' },
    { label: 'Classes', path: '/classes' },
    { label: 'Sections', path: '/sections' },
    { label: 'Subjects', path: '/subjects' },
  ],
  PRINCIPAL: [
    { label: 'Class Schedule', path: '/schedule' },
    { label: 'Reports', path: '/reports' },
    { label: 'Analysis', path: '/analysis' },
    { label: 'Fee Overview', path: '/fees' },
  ],
  TEACHER: [
    { label: 'Mark Attendance', path: '/attendance' },
    { label: 'Performance', path: '/performance' },
    { label: 'Syllabus', path: '/syllabus' },
  ],
  CLERK: [
    { label: 'New Admission', path: '/admission' },
    { label: 'Fee Payment', path: '/fees' },
    { label: 'Reports', path: '/reports' },
  ],
}

const MODULE_INFO = [
  { icon: <ManageAccountsIcon sx={{ fontSize: 18, color: '#2563eb' }} />, label: 'User Management', desc: 'Manage admin, teachers, clerks and students' },
  { icon: <SchoolIcon sx={{ fontSize: 18, color: '#16a34a' }} />, label: 'Admission Module', desc: 'Enroll new students with full details' },
  { icon: <PaymentIcon sx={{ fontSize: 18, color: '#d97706' }} />, label: 'Fee Payment', desc: 'Process payments and generate receipts' },
  { icon: <EventNoteIcon sx={{ fontSize: 18, color: '#7c3aed' }} />, label: 'Attendance', desc: 'Daily attendance tracking by class & section' },
  { icon: <BarChartIcon sx={{ fontSize: 18, color: '#0891b2' }} />, label: 'Analysis', desc: 'Academic & financial analytics with charts' },
  { icon: <MenuBookIcon sx={{ fontSize: 18, color: '#db2777' }} />, label: 'Syllabus', desc: 'Track topic coverage and completion' },
]

function StatCard({ title, value, icon, iconBg, iconColor, note, isMissing }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              bgcolor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ color: iconColor, display: 'flex' }}>{icon}</Box>
          </Box>
        </Box>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color: isMissing ? '#d1d5db' : '#111827', lineHeight: 1.1 }}>
          {value ?? '—'}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mt: 0.5 }}>
          {title}
        </Typography>
        {note && (
          <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.4 }}>
            {note}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'STUDENT') { setLoading(false); return }
    const load = async () => {
      try {
        const [admissionRes, feeRes] = await Promise.allSettled([
          getAdmissionReport(),
          getFeeSummary('2024-2025'),
        ])
        setStats({
          totalStudents: admissionRes.value?.data?.totalStudents,
          totalCollected: feeRes.value?.data?.totalCollected,
          totalPending: feeRes.value?.data?.totalPending,
        })
      } catch (_) {}
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (user?.role === 'STUDENT') {
    return (
      <Box sx={{ maxWidth: 480 }}>
        <Box sx={{ width: 48, height: 48, bgcolor: '#eff6ff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <PersonIcon sx={{ fontSize: 26, color: '#2563eb' }} />
        </Box>
        <Typography variant="h5" gutterBottom>Welcome, {user?.fullName}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          View your profile, attendance records and performance from your student portal.
        </Typography>
        <Button variant="contained" endIcon={<ArrowForwardIcon fontSize="small" />} onClick={() => navigate('/student')}>
          Open Student Portal
        </Button>
      </Box>
    )
  }

  const quickActions = QUICK_ACTIONS[user?.role] || []

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h5" sx={{ color: '#111827' }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Welcome back, {user?.fullName} — Academic Year 2024–25
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents?.toLocaleString()}
            note="Enrolled this year"
            icon={<PeopleIcon sx={{ fontSize: 24 }} />}
            iconBg="#eff6ff" iconColor="#2563eb"
            isMissing={!stats.totalStudents}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Fee Collected"
            value={stats.totalCollected != null ? `₹${stats.totalCollected.toLocaleString()}` : 'No data'}
            note="Academic year 2024–25"
            icon={<PaymentIcon sx={{ fontSize: 24 }} />}
            iconBg="#f0fdf4" iconColor="#16a34a"
            isMissing={stats.totalCollected == null}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Fee Pending"
            value={stats.totalPending != null ? `₹${stats.totalPending.toLocaleString()}` : 'No data'}
            note="Awaiting payment"
            icon={<PendingActionsIcon sx={{ fontSize: 24 }} />}
            iconBg="#fffbeb" iconColor="#d97706"
            isMissing={stats.totalPending == null}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Academic Year"
            value="2024–25"
            note="Current session active"
            icon={<CalendarTodayIcon sx={{ fontSize: 24 }} />}
            iconBg="#f5f3ff" iconColor="#7c3aed"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Quick Access */}
        {quickActions.length > 0 && (
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>Quick Access</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Jump to your most-used modules.
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {quickActions.map(({ label, path }) => (
                    <Button
                      key={path}
                      variant="outlined"
                      fullWidth
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      onClick={() => navigate(path)}
                      sx={{
                        justifyContent: 'space-between',
                        borderColor: '#e5e7eb',
                        color: '#374151',
                        bgcolor: '#fff',
                        fontWeight: 500,
                        fontSize: 13,
                        py: 1,
                        '&:hover': { borderColor: '#2563eb', color: '#2563eb', bgcolor: '#eff6ff' },
                        transition: 'all 0.12s',
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* System modules overview */}
        <Grid item xs={12} md={quickActions.length > 0 ? 7 : 12}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>System Modules</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                All modules available in this system.
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense disablePadding>
                {MODULE_INFO.map(({ icon, label, desc }) => (
                  <ListItem key={label} disablePadding sx={{ mb: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
                        {icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      secondary={desc}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: '#111827' }}
                      secondaryTypographyProps={{ fontSize: 11, color: '#9ca3af' }}
                    />
                    <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a', flexShrink: 0 }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
