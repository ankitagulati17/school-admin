import { useEffect, useState } from 'react'
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Grid, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, CircularProgress,
  LinearProgress, TextField, MenuItem, Avatar, Divider
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import EventNoteIcon from '@mui/icons-material/EventNote'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { getMyProfile } from '../../api/studentApi'
import { getMyAttendance, getMyAttendanceSummary } from '../../api/attendanceApi'
import { getMyPerformance } from '../../api/performanceApi'
import { toast } from 'react-toastify'
import { TableCard, EmptyState } from '../../components/ui'

const YEARS = ['2024-2025', '2023-2024']
const STATUS_STYLES = {
  PRESENT: { bgcolor: '#f0fdf4', color: '#16a34a' },
  ABSENT:  { bgcolor: '#fef2f2', color: '#dc2626' },
  LATE:    { bgcolor: '#fffbeb', color: '#d97706' },
  LEAVE:   { bgcolor: '#f0f9ff', color: '#0891b2' },
}

function formatDate(d) {
  if (!d) return '—'
  if (Array.isArray(d)) {
    const [y, m, day] = d
    return `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
  }
  const parts = String(d).split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return d
}

function toTitleCase(str) {
  if (!str) return ''
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\b(\w)/g, (_, c) => c.toUpperCase())
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

function gradeChipStyle(pct) {
  if (pct >= 75) return { bgcolor: '#f0fdf4', color: '#16a34a' }
  if (pct >= 50) return { bgcolor: '#eff6ff', color: '#2563eb' }
  if (pct >= 35) return { bgcolor: '#fffbeb', color: '#d97706' }
  return { bgcolor: '#fef2f2', color: '#dc2626' }
}

export default function StudentPortal() {
  const [tab, setTab] = useState(0)
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [summary, setSummary] = useState(null)
  const [performance, setPerformance] = useState([])
  const [year, setYear] = useState('2024-2025')
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadProfile(); loadAttendance() }, [])
  useEffect(() => { if (tab === 2) loadPerformance() }, [tab, year])

  const loadProfile = async () => {
    try { const { data } = await getMyProfile(); setProfile(data) }
    catch { toast.error('Failed to load profile') }
  }

  const loadAttendance = async () => {
    try {
      const [a, s] = await Promise.allSettled([getMyAttendance(), getMyAttendanceSummary()])
      setAttendance(a.status === 'fulfilled' ? (a.value?.data || []) : [])
      setSummary(s.status === 'fulfilled' ? (s.value?.data || null) : null)
    } catch { /* attendance may be empty */ }
  }

  const loadPerformance = async () => {
    setLoading(true)
    try { const { data } = await getMyPerformance(year); setPerformance(data) }
    catch { toast.error('Failed to load performance') }
    setLoading(false)
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    )
  }

  const presentDays = summary?.presentDays ?? 0
  const totalDays = summary?.totalDays ?? 0
  const attPct = totalDays > 0 ? Math.round(presentDays / totalDays * 100) : 0

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ bgcolor: '#2563eb', width: 56, height: 56, fontSize: 22, fontWeight: 700 }}>
          {profile.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>{profile.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.schoolClass?.className} - Section {profile.section?.name} &nbsp;|&nbsp; Adm: {profile.admissionNumber}
          </Typography>
        </Box>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Class', value: `${profile.schoolClass?.className} — ${profile.section?.name}`, bgcolor: '#eff6ff', color: '#2563eb' },
          { label: 'Attendance', value: `${attPct}%`, bgcolor: attPct >= 75 ? '#f0fdf4' : attPct >= 60 ? '#fffbeb' : '#fef2f2', color: attPct >= 75 ? '#16a34a' : attPct >= 60 ? '#d97706' : '#dc2626' },
          { label: 'Performance Records', value: performance.length || '—', bgcolor: '#fdf4ff', color: '#9333ea' },
        ].map(({ label, value, bgcolor, color }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{label}</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color }}>{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid #e5e7eb', '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: 14 } }}
      >
        <Tab label="My Profile" />
        <Tab label="My Attendance" />
        <Tab label="My Performance" />
      </Tabs>

      {/* Tab 0 — Profile */}
      {tab === 0 && (
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Personal Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {[
                ['Full Name', profile.name],
                ['Admission No.', profile.admissionNumber],
                ['Date of Birth', formatDate(profile.dateOfBirth)],
                ['Gender', profile.gender],
                ['Blood Group', profile.bloodGroup],
                ['Class', `${profile.schoolClass?.className} — Section ${profile.section?.name}`],
                ['Admission Date', formatDate(profile.admissionDate)],
                ['Address', [profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')],
                ['Father', profile.fatherName],
                ['Mother', profile.motherName],
                ['Parent Contact', profile.parentContact],
                ['Parent Email', profile.parentEmail],
              ].map(([label, value]) => value ? (
                <Grid item xs={12} sm={6} key={label}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>{value}</Typography>
                </Grid>
              ) : null)}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tab 1 — Attendance */}
      {tab === 1 && (
        <Box>
          {totalDays > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  {[
                    ['Total Days', totalDays, '#2563eb'],
                    ['Present', presentDays, '#16a34a'],
                    ['Absent', totalDays - presentDays, '#dc2626'],
                  ].map(([label, val, color]) => (
                    <Grid item xs={4} key={label} sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={700} sx={{ color }}>{val}</Typography>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Attendance: {attPct}%</Typography>
                <LinearProgress
                  variant="determinate"
                  value={attPct}
                  sx={{
                    borderRadius: 2, height: 8,
                    bgcolor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: attPct >= 75 ? '#16a34a' : attPct >= 60 ? '#d97706' : '#dc2626'
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}
          {Array.isArray(attendance) && attendance.length > 0 ? (
            <TableCard>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Date', 'Status'].map(h => <TableCell key={h}>{h}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.slice(-30).reverse().map(a => (
                    <TableRow key={a.id} hover>
                      <TableCell sx={{ color: '#6b7280' }}>{formatDate(a.date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={toTitleCase(a.status)}
                          size="small"
                          sx={{ bgcolor: STATUS_STYLES[a.status]?.bgcolor, color: STATUS_STYLES[a.status]?.color, fontWeight: 600, border: 'none' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableCard>
          ) : (
            <EmptyState
              icon={<EventNoteIcon sx={{ fontSize: 40 }} />}
              message="No attendance records found"
              hint="Your attendance records will appear here once marked"
            />
          )}
        </Box>
      )}

      {/* Tab 2 — Performance */}
      {tab === 2 && (
        <Box>
          <Box sx={{ mb: 2.5 }}>
            <TextField size="small" select label="Academic Year" value={year} onChange={e => setYear(e.target.value)} sx={{ minWidth: 160 }}>
              {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
          ) : Array.isArray(performance) && performance.length > 0 ? (
            <TableCard>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Subject', 'Exam Type', 'Marks', 'Max Marks', 'Percentage', 'Term'].map(h => (
                      <TableCell key={h}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performance.map(r => {
                    const pct = Math.round(r.marks / r.maxMarks * 100)
                    return (
                      <TableRow key={r.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{r.subject?.name}</TableCell>
                        <TableCell sx={{ color: '#6b7280' }}>{toTitleCase(r.examType)}</TableCell>
                        <TableCell>{r.marks}</TableCell>
                        <TableCell sx={{ color: '#6b7280' }}>{r.maxMarks}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${pct}%`}
                            size="small"
                            sx={{ ...gradeChipStyle(pct), fontWeight: 600, border: 'none' }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#6b7280' }}>{r.term}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableCard>
          ) : (
            <EmptyState
              icon={<EmojiEventsIcon sx={{ fontSize: 40 }} />}
              message={`No performance records for ${year}`}
              hint="Performance records will appear here once entered by your teacher"
            />
          )}
        </Box>
      )}
    </Box>
  )
}
