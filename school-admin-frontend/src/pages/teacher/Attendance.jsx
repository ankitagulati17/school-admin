import { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, TextField, MenuItem, Button, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress,
  Tabs, Tab, IconButton, Divider
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import EventNoteIcon from '@mui/icons-material/EventNote'
import { markAttendance, getAttendanceByClassSectionDate, deleteAttendance } from '../../api/attendanceApi'
import { getStudentsByClassSection, getClasses, getSections } from '../../api/studentApi'
import { toast } from 'react-toastify'
import { PageHeader, TableCard, EmptyState, SectionLabel } from '../../components/ui'

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE']
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
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export default function Attendance() {
  const [tab, setTab] = useState(0)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [existing, setExisting] = useState([])
  const [filter, setFilter] = useState({ classId: '', sectionId: '', date: new Date().toISOString().split('T')[0] })
  const [loading, setLoading] = useState(false)

  useEffect(() => { getClasses().then(r => setClasses(r.data)).catch(() => {}) }, [])

  const handleClassChange = async (classId) => {
    setFilter(f => ({ ...f, classId, sectionId: '' }))
    setStudents([])
    setSections([])
    if (classId) {
      try {
        const { data } = await getSections(classId)
        setSections(data)
      } catch { toast.error('Failed to load sections'); setSections([]) }
    }
  }

  const loadStudents = async () => {
    if (!filter.classId || !filter.sectionId) return
    setLoading(true)
    try {
      const [sRes, aRes] = await Promise.allSettled([
        getStudentsByClassSection(filter.classId, filter.sectionId),
        getAttendanceByClassSectionDate(filter.classId, filter.sectionId, filter.date)
      ])
      setStudents(sRes.status === 'fulfilled' ? (sRes.value?.data || []) : [])
      setExisting(aRes.status === 'fulfilled' ? (aRes.value?.data || []) : [])
      const map = {}
      if (sRes.status === 'fulfilled') sRes.value.data.forEach(s => { map[s.id] = 'PRESENT' })
      if (aRes.status === 'fulfilled') aRes.value.data.forEach(a => { map[a.student.id] = a.status })
      setAttendance(map)
    } catch { toast.error('Failed to load') }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!students.length) return
    setLoading(true)
    try {
      const entries = students.map(s => ({ studentId: s.id, status: attendance[s.id] || 'PRESENT' }))
      await markAttendance({ classId: Number(filter.classId), sectionId: Number(filter.sectionId), date: filter.date, entries })
      toast.success('Attendance saved successfully')
      loadStudents()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try { await deleteAttendance(id); toast.success('Record deleted'); loadStudents() }
    catch { toast.error('Failed to delete') }
  }

  const presentCount = Object.values(attendance).filter(v => v === 'PRESENT').length
  const absentCount = Object.values(attendance).filter(v => v === 'ABSENT').length

  return (
    <Box>
      <PageHeader title="Attendance" subtitle="Mark and review daily student attendance" />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid #e5e7eb', '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: 14 } }}
      >
        <Tab label="Mark Attendance" />
        <Tab label="View Records" />
      </Tabs>

      {/* Filter card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <SectionLabel>Filter by class, section and date</SectionLabel>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" select label="Class" value={filter.classId} onChange={e => handleClassChange(e.target.value)}>
                {Array.isArray(classes) && classes.map(c => <MenuItem key={c.id} value={c.id}>{c.className}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" select label="Section" value={filter.sectionId} onChange={e => setFilter(f => ({ ...f, sectionId: e.target.value }))} disabled={!filter.classId}>
                {Array.isArray(sections) && sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" label="Date" type="date" InputLabelProps={{ shrink: true }} value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" fullWidth onClick={loadStudents} disabled={!filter.classId || !filter.sectionId}>
                Load Students
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
      ) : tab === 0 ? (
        students.length > 0 ? (
          <TableCard>
            <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total: <strong style={{ color: '#111827' }}>{students.length}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Present: <strong style={{ color: '#16a34a' }}>{presentCount}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Absent: <strong style={{ color: '#dc2626' }}>{absentCount}</strong>
                </Typography>
              </Box>
              <Button variant="contained" size="small" startIcon={<SaveIcon fontSize="small" />} onClick={handleSubmit}>
                Save Attendance
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  {['#', 'Adm No', 'Student Name', 'Status'].map(h => <TableCell key={h}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s, i) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ color: '#9ca3af', fontSize: 13 }}>{i + 1}</TableCell>
                    <TableCell sx={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 13 }}>{s.admissionNumber}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={attendance[s.id] || 'PRESENT'}
                        onChange={e => setAttendance(a => ({ ...a, [s.id]: e.target.value }))}
                        sx={{ minWidth: 130 }}
                      >
                        {STATUS_OPTIONS.map(o => (
                          <MenuItem key={o} value={o}>
                            <Chip
                              label={toTitleCase(o)}
                              size="small"
                              sx={{ bgcolor: STATUS_STYLES[o]?.bgcolor, color: STATUS_STYLES[o]?.color, fontWeight: 600, border: 'none' }}
                            />
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        ) : (
          <EmptyState
            icon={<EventNoteIcon sx={{ fontSize: 40 }} />}
            message="No students loaded"
            hint="Select a class, section and date above, then click Load Students"
          />
        )
      ) : (
        existing.length > 0 ? (
          <TableCard>
            <Table>
              <TableHead>
                <TableRow>
                  {['#', 'Student', 'Admission No', 'Date', 'Status', 'Action'].map(h => <TableCell key={h}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {existing.map((a, i) => (
                  <TableRow key={a.id} hover>
                    <TableCell sx={{ color: '#9ca3af', fontSize: 13 }}>{i + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{a.student?.name}</TableCell>
                    <TableCell sx={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 13 }}>{a.student?.admissionNumber}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{formatDate(a.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={toTitleCase(a.status)}
                        size="small"
                        sx={{ bgcolor: STATUS_STYLES[a.status]?.bgcolor, color: STATUS_STYLES[a.status]?.color, fontWeight: 600, border: 'none' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" sx={{ color: '#dc2626' }} onClick={() => handleDelete(a.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        ) : (
          <EmptyState
            icon={<EventNoteIcon sx={{ fontSize: 40 }} />}
            message="No records found"
            hint="Select filters above and click Load Students to view attendance records"
          />
        )
      )}
    </Box>
  )
}
