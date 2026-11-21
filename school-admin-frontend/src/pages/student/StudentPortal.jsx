import { useEffect, useState } from 'react'
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Grid, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, CircularProgress,
  LinearProgress, TextField, MenuItem, Avatar, Divider, Paper
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import EventNoteIcon from '@mui/icons-material/EventNote'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PersonIcon from '@mui/icons-material/Person'
import HomeIcon from '@mui/icons-material/Home'
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import StarIcon from '@mui/icons-material/Star'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { getMyProfile } from '../../api/studentApi'
import { getMyAttendance, getMyAttendanceSummary } from '../../api/attendanceApi'
import { getMyPerformance } from '../../api/performanceApi'
import { toast } from 'react-toastify'
import { EmptyState } from '../../components/ui'

const YEARS = ['2024-2025', '2023-2024']

const STATUS_META = {
  PRESENT: { bgcolor: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '✓' },
  ABSENT:  { bgcolor: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✗' },
  LATE:    { bgcolor: '#fffbeb', color: '#d97706', border: '#fde68a', icon: '~' },
  LEAVE:   { bgcolor: '#f0f9ff', color: '#0891b2', border: '#bae6fd', icon: 'L' },
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
  return str.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

function getGrade(pct) {
  if (pct >= 90) return { letter: 'A+', color: '#16a34a', bg: '#f0fdf4' }
  if (pct >= 75) return { letter: 'A',  color: '#16a34a', bg: '#f0fdf4' }
  if (pct >= 60) return { letter: 'B',  color: '#2563eb', bg: '#eff6ff' }
  if (pct >= 50) return { letter: 'C',  color: '#d97706', bg: '#fffbeb' }
  if (pct >= 35) return { letter: 'D',  color: '#ea580c', bg: '#fff7ed' }
  return { letter: 'F', color: '#dc2626', bg: '#fef2f2' }
}

function InfoRow({ label, value, icon }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.2,
      borderBottom: '1px solid #f3f4f6', '&:last-child': { borderBottom: 'none' } }}>
      {icon && <Box sx={{ color: '#9ca3af', mt: 0.2, flexShrink: 0 }}>{icon}</Box>}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3, mb: 0.3 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} sx={{ color: '#111827', wordBreak: 'break-word' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  )
}

function SectionCard({ title, icon, children, accent = '#2563eb' }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 1.8, display: 'flex', alignItems: 'center', gap: 1.5,
        borderBottom: '1px solid #f1f5f9', bgcolor: '#fafafa' }}>
        <Box sx={{ color: accent, display: 'flex' }}>{icon}</Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#111827' }}>{title}</Typography>
      </Box>
      <CardContent sx={{ p: 2.5 }}>{children}</CardContent>
    </Card>
  )
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  const presentDays = summary?.presentDays ?? 0
  const totalDays = summary?.totalDays ?? 0
  const absentDays = summary?.absentDays ?? 0
  const attPct = totalDays > 0 ? Math.round(presentDays / totalDays * 100) : 0
  const attColor = attPct >= 75 ? '#16a34a' : attPct >= 60 ? '#d97706' : '#dc2626'
  const attBg = attPct >= 75 ? '#f0fdf4' : attPct >= 60 ? '#fffbeb' : '#fef2f2'

  // Performance stats
  const avgPct = performance.length > 0
    ? Math.round(performance.reduce((s, r) => s + (r.marks / r.maxMarks * 100), 0) / performance.length)
    : null
  const bestSubject = performance.length > 0
    ? performance.reduce((best, r) => (r.marks / r.maxMarks > best.marks / best.maxMarks ? r : best), performance[0])
    : null

  // Initials for avatar
  const initials = profile.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
        borderRadius: 4, p: { xs: 2.5, sm: 3.5 }, mb: 3,
        display: 'flex', alignItems: 'center', gap: 3,
        boxShadow: '0 4px 24px rgba(37,99,235,0.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decorative circles */}
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 80, width: 200, height: 200,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />

        <Avatar sx={{
          bgcolor: 'rgba(255,255,255,0.15)',
          border: '3px solid rgba(255,255,255,0.3)',
          width: 72, height: 72, fontSize: 26, fontWeight: 800,
          color: '#fff', flexShrink: 0,
          backdropFilter: 'blur(8px)',
        }}>
          {initials}
        </Avatar>

        <Box sx={{ flex: 1, zIndex: 1 }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', letterSpacing: '-0.3px' }}>
            {profile.name}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Chip
              icon={<SchoolIcon sx={{ fontSize: '14px !important', color: '#bfdbfe !important' }} />}
              label={`${profile.schoolClass?.className} — Section ${profile.section?.name}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#e0f2fe', border: 'none',
                fontSize: 12, fontWeight: 500, backdropFilter: 'blur(4px)' }}
            />
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: '14px !important', color: '#bfdbfe !important' }} />}
              label={`Adm: ${profile.admissionNumber}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#e0f2fe', border: 'none',
                fontSize: 12, fontWeight: 500, backdropFilter: 'blur(4px)' }}
            />
          </Box>
        </Box>

        {/* Quick attendance badge on hero */}
        {totalDays > 0 && (
          <Box sx={{ textAlign: 'center', zIndex: 1, flexShrink: 0 }}>
            <Box sx={{
              width: 68, height: 68, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
            }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#fff', lineHeight: 1 }}>{attPct}%</Typography>
              <Typography variant="caption" sx={{ color: '#bfdbfe', fontSize: 9, lineHeight: 1 }}>Attend.</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Quick Stats ─────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: 'Class & Section',
            value: `${profile.schoolClass?.className}`,
            sub: `Section ${profile.section?.name}`,
            icon: <SchoolIcon />, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
          },
          {
            label: 'Attendance',
            value: totalDays > 0 ? `${attPct}%` : 'No data',
            sub: totalDays > 0 ? `${presentDays} / ${totalDays} days` : 'Not recorded yet',
            icon: <EventNoteIcon />, color: attColor, bg: attBg, border: attPct >= 75 ? '#bbf7d0' : attPct >= 60 ? '#fde68a' : '#fecaca',
          },
          {
            label: 'Avg Performance',
            value: avgPct != null ? `${avgPct}%` : '—',
            sub: avgPct != null ? getGrade(avgPct).letter + ' Grade' : 'No records yet',
            icon: <EmojiEventsIcon />, color: '#9333ea', bg: '#fdf4ff', border: '#e9d5ff',
          },
        ].map(({ label, value, sub, icon, color, bg, border }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card sx={{
              borderRadius: 3, border: `1px solid ${border}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
                      {label.toUpperCase()}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color, mt: 0.3, lineHeight: 1.2 }}>
                      {value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {sub}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: bg, color, p: 1.2, borderRadius: 2, display: 'flex' }}>
                    {icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2, borderBottom: '1px solid #e5e7eb',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: 14, minHeight: 52 },
            '& .Mui-selected': { fontWeight: 700 },
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="My Profile" />
          <Tab icon={<EventNoteIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Attendance" />
          <Tab icon={<EmojiEventsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Performance" />
        </Tabs>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>

          {/* ── TAB 0: Profile ───────────────────────────────────── */}
          {tab === 0 && (
            <Grid container spacing={2.5}>
              {/* Personal */}
              <Grid item xs={12} md={6}>
                <SectionCard title="Personal Information" icon={<PersonIcon fontSize="small" />} accent="#2563eb">
                  <InfoRow label="Full Name" value={profile.name} />
                  <InfoRow label="Admission Number" value={profile.admissionNumber} />
                  <InfoRow label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
                  <InfoRow label="Gender" value={profile.gender} />
                  <InfoRow label="Blood Group" value={
                    profile.bloodGroup
                      ? <Chip label={profile.bloodGroup} size="small"
                          sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 700, border: 'none', height: 22 }} />
                      : '—'
                  } />
                  <InfoRow label="Admission Date" value={formatDate(profile.admissionDate)} />
                </SectionCard>
              </Grid>

              {/* Academic */}
              <Grid item xs={12} md={6}>
                <SectionCard title="Academic Details" icon={<SchoolIcon fontSize="small" />} accent="#9333ea">
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <Paper elevation={0} sx={{ flex: 1, bgcolor: '#eff6ff', borderRadius: 2, p: 1.5, textAlign: 'center', border: '1px solid #bfdbfe' }}>
                      <Typography variant="h6" fontWeight={800} sx={{ color: '#2563eb' }}>
                        {profile.schoolClass?.className?.replace('Class ', '')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Class</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ flex: 1, bgcolor: '#fdf4ff', borderRadius: 2, p: 1.5, textAlign: 'center', border: '1px solid #e9d5ff' }}>
                      <Typography variant="h6" fontWeight={800} sx={{ color: '#9333ea' }}>
                        {profile.section?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Section</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ flex: 1, bgcolor: '#f0fdf4', borderRadius: 2, p: 1.5, textAlign: 'center', border: '1px solid #bbf7d0' }}>
                      <Typography variant="h6" fontWeight={800} sx={{ color: '#16a34a' }}>
                        {attPct > 0 ? `${attPct}%` : '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Attendance</Typography>
                    </Paper>
                  </Box>
                  {profile.previousSchool && <InfoRow label="Previous School" value={profile.previousSchool} />}
                  {profile.previousClass && <InfoRow label="Previous Class" value={profile.previousClass} />}
                  {profile.previousPercentage && <InfoRow label="Previous Score" value={`${profile.previousPercentage}%`} />}
                  {!profile.previousSchool && !profile.previousClass && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>No previous academic history.</Typography>
                  )}
                </SectionCard>
              </Grid>

              {/* Address */}
              <Grid item xs={12} md={6}>
                <SectionCard title="Address" icon={<HomeIcon fontSize="small" />} accent="#16a34a">
                  <InfoRow label="Street" value={profile.address} />
                  <InfoRow label="City" value={profile.city} />
                  <InfoRow label="State" value={profile.state} />
                  <InfoRow label="Pincode" value={profile.pincode} />
                </SectionCard>
              </Grid>

              {/* Family */}
              <Grid item xs={12} md={6}>
                <SectionCard title="Parent / Guardian" icon={<FamilyRestroomIcon fontSize="small" />} accent="#d97706">
                  <InfoRow label="Father's Name" value={profile.fatherName} />
                  <InfoRow label="Mother's Name" value={profile.motherName} />
                  <InfoRow label="Occupation" value={profile.parentOccupation} />
                  <InfoRow label="Contact" value={profile.parentContact} />
                  <InfoRow label="Email" value={profile.parentEmail} />
                </SectionCard>
              </Grid>
            </Grid>
          )}

          {/* ── TAB 1: Attendance ────────────────────────────────── */}
          {tab === 1 && (
            <Box>
              {/* Summary strip */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Total Days', value: totalDays, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <CalendarTodayIcon fontSize="small" /> },
                  { label: 'Present', value: presentDays, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: <CheckCircleIcon fontSize="small" /> },
                  { label: 'Absent', value: absentDays, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: <CancelIcon fontSize="small" /> },
                  { label: 'Attendance %', value: `${attPct}%`, color: attColor, bg: attBg, border: attPct >= 75 ? '#bbf7d0' : '#fde68a', icon: <TrendingUpIcon fontSize="small" /> },
                ].map(({ label, value, color, bg, border, icon }) => (
                  <Grid item xs={6} sm={3} key={label}>
                    <Card sx={{ borderRadius: 3, border: `1px solid ${border}`, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
                          <Box sx={{ color, opacity: 0.7 }}>{icon}</Box>
                        </Box>
                        <Typography variant="h5" fontWeight={800} sx={{ color }}>{value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Progress bar */}
              {totalDays > 0 && (
                <Card sx={{ borderRadius: 3, mb: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Attendance Progress</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: attColor }}>{attPct}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate" value={attPct}
                      sx={{ height: 10, borderRadius: 5, bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': { bgcolor: attColor, borderRadius: 5 } }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">0%</Typography>
                      <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 500 }}>75% required</Typography>
                      <Typography variant="caption" color="text.secondary">100%</Typography>
                    </Box>
                    {attPct < 75 && totalDays > 0 && (
                      <Box sx={{ mt: 1.5, bgcolor: '#fffbeb', borderRadius: 2, px: 2, py: 1, border: '1px solid #fde68a' }}>
                        <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 500 }}>
                          ⚠ You need {75 - attPct}% more attendance to meet the minimum requirement.
                        </Typography>
                      </Box>
                    )}
                    {attPct >= 75 && (
                      <Box sx={{ mt: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, px: 2, py: 1, border: '1px solid #bbf7d0' }}>
                        <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 500 }}>
                          ✓ Great! You have met the minimum attendance requirement.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Attendance records */}
              {Array.isArray(attendance) && attendance.length > 0 ? (
                <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', overflow: 'hidden' }}>
                  <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#fafafa', borderBottom: '1px solid #e5e7eb',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Recent Records</Typography>
                    <Chip label={`Last ${Math.min(attendance.length, 30)} entries`} size="small"
                      sx={{ bgcolor: '#f1f5f9', color: '#6b7280', border: 'none', fontSize: 11 }} />
                  </Box>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: 13 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: 13 }}>Day</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: 13 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendance.slice(-30).reverse().map(a => {
                        const meta = STATUS_META[a.status] || STATUS_META.ABSENT
                        const dateObj = Array.isArray(a.date)
                          ? new Date(a.date[0], a.date[1] - 1, a.date[2])
                          : new Date(a.date)
                        const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' })
                        return (
                          <TableRow key={a.id} hover sx={{ '& td': { py: 1.2 } }}>
                            <TableCell sx={{ color: '#374151', fontWeight: 500, fontSize: 13 }}>
                              {formatDate(a.date)}
                            </TableCell>
                            <TableCell sx={{ color: '#9ca3af', fontSize: 13 }}>{dayName}</TableCell>
                            <TableCell>
                              <Box sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                px: 1.5, py: 0.4, borderRadius: 10,
                                bgcolor: meta.bgcolor, border: `1px solid ${meta.border}`,
                              }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: meta.color }}>
                                  {meta.icon}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: meta.color }}>
                                  {toTitleCase(a.status)}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <EmptyState
                  icon={<EventNoteIcon sx={{ fontSize: 40 }} />}
                  message="No attendance records yet"
                  hint="Your daily attendance will appear here once your teacher marks it"
                />
              )}
            </Box>
          )}

          {/* ── TAB 2: Performance ───────────────────────────────── */}
          {tab === 2 && (
            <Box>
              {/* Year picker + summary */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Academic Performance</Typography>
                  <Typography variant="caption" color="text.secondary">Your exam results and scores</Typography>
                </Box>
                <TextField size="small" select label="Academic Year" value={year}
                  onChange={e => { setYear(e.target.value) }} sx={{ minWidth: 160 }}>
                  {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </TextField>
              </Box>

              {/* Performance summary cards */}
              {performance.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #bfdbfe', boxShadow: 'none', bgcolor: '#eff6ff' }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="caption" color="text.secondary">Total Exams</Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#2563eb' }}>{performance.length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ borderRadius: 3, border: `1px solid ${getGrade(avgPct).bg === '#fef2f2' ? '#fecaca' : '#bbf7d0'}`, boxShadow: 'none', bgcolor: getGrade(avgPct).bg }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="caption" color="text.secondary">Average Score</Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: getGrade(avgPct).color }}>{avgPct}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #e9d5ff', boxShadow: 'none', bgcolor: '#fdf4ff' }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="caption" color="text.secondary">Grade</Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#9333ea' }}>{getGrade(avgPct).letter}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #fde68a', boxShadow: 'none', bgcolor: '#fffbeb' }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="caption" color="text.secondary">Best Subject</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#d97706', mt: 0.5, lineHeight: 1.3 }}>
                          {bestSubject?.subject?.name || '—'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
              ) : performance.length > 0 ? (
                <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', overflow: 'hidden' }}>
                  <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Exam Results</Typography>
                  </Box>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        {['Subject', 'Exam Type', 'Term', 'Marks', 'Grade'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, color: '#374151', fontSize: 13 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performance.map(r => {
                        const pct = Math.round(r.marks / r.maxMarks * 100)
                        const grade = getGrade(pct)
                        return (
                          <TableRow key={r.id} hover sx={{ '& td': { py: 1.5 } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {bestSubject?.id === r.id && (
                                  <StarIcon sx={{ fontSize: 14, color: '#d97706' }} />
                                )}
                                <Typography variant="body2" fontWeight={600} sx={{ color: '#111827' }}>
                                  {r.subject?.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={toTitleCase(r.examType)} size="small"
                                sx={{ bgcolor: '#f1f5f9', color: '#374151', border: 'none', fontWeight: 500, fontSize: 12 }} />
                            </TableCell>
                            <TableCell sx={{ color: '#6b7280', fontSize: 13 }}>{r.term}</TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={700} sx={{ color: '#111827' }}>
                                  {r.marks} <Typography component="span" variant="caption" color="text.secondary">/ {r.maxMarks}</Typography>
                                </Typography>
                                <LinearProgress variant="determinate" value={pct}
                                  sx={{ height: 4, borderRadius: 2, mt: 0.5, bgcolor: '#f1f5f9',
                                    '& .MuiLinearProgress-bar': { bgcolor: grade.color, borderRadius: 2 } }} />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                px: 1.5, py: 0.4, borderRadius: 10,
                                bgcolor: grade.bg, border: `1px solid ${grade.color}22`,
                              }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: grade.color, fontSize: 13 }}>
                                  {grade.letter}
                                </Typography>
                                <Typography variant="caption" sx={{ color: grade.color, fontWeight: 500 }}>
                                  {pct}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <EmptyState
                  icon={<EmojiEventsIcon sx={{ fontSize: 40 }} />}
                  message={`No performance records for ${year}`}
                  hint="Your exam results will appear here once entered by your teacher"
                />
              )}
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  )
}
