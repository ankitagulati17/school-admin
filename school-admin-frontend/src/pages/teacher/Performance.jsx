import { useEffect, useState } from 'react'
import {
  Box, Grid, TextField, MenuItem, Button, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { recordPerformance, updatePerformance, getPerformanceByStudentYear, deletePerformance } from '../../api/performanceApi'
import { getStudents, getClasses, getSubjects } from '../../api/studentApi'
import { toast } from 'react-toastify'
import { PageHeader, TableCard, EmptyState, SectionLabel } from '../../components/ui'

const EXAM_TYPES = ['CLASS_TEST', 'UNIT_TEST', 'MIDTERM', 'FINAL', 'ASSIGNMENT']
const TERMS = ['Term 1', 'Term 2', 'Term 3']
const YEARS = ['2024-2025', '2023-2024']
const INIT = { studentId: '', subjectId: '', examType: 'CLASS_TEST', marks: '', maxMarks: '100', term: 'Term 1', academicYear: '2024-2025', remarks: '' }

function toTitleCase(str) {
  if (!str) return ''
  return str.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

function gradeStyle(pct) {
  if (pct >= 75) return { bgcolor: '#f0fdf4', color: '#16a34a' }
  if (pct >= 50) return { bgcolor: '#eff6ff', color: '#2563eb' }
  if (pct >= 35) return { bgcolor: '#fffbeb', color: '#d97706' }
  return { bgcolor: '#fef2f2', color: '#dc2626' }
}

export default function Performance() {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(INIT)
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ studentId: '', academicYear: '2024-2025' })

  useEffect(() => {
    Promise.allSettled([getStudents(), getClasses()]).then(([s, c]) => {
      setStudents(s.status === 'fulfilled' ? (s.value?.data || []) : [])
      setClasses(c.status === 'fulfilled' ? (c.value?.data || []) : [])
    }).catch(() => {})
  }, [])

  const handleClassChange = async (classId) => {
    if (classId) {
      try { const { data } = await getSubjects(classId); setSubjects(data) }
      catch { toast.error('Failed to load subjects'); setSubjects([]) }
    }
  }

  const loadRecords = async () => {
    if (!filter.studentId) return
    setLoading(true)
    try {
      const { data } = await getPerformanceByStudentYear(filter.studentId, filter.academicYear)
      setRecords(data)
    } catch { toast.error('Failed to load') }
    setLoading(false)
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, studentId: Number(form.studentId), subjectId: Number(form.subjectId), marks: Number(form.marks), maxMarks: Number(form.maxMarks) }
      editId ? await updatePerformance(editId, payload) : await recordPerformance(payload)
      toast.success(editId ? 'Record updated' : 'Record saved')
      setOpen(false); setEditId(null); setForm(INIT); loadRecords()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try { await deletePerformance(id); toast.success('Deleted'); loadRecords() }
    catch { toast.error('Delete failed') }
  }

  const openEdit = (r) => {
    setEditId(r.id)
    setForm({ studentId: r.student?.id, subjectId: r.subject?.id, examType: r.examType, marks: r.marks, maxMarks: r.maxMarks, term: r.term, academicYear: r.academicYear, remarks: r.remarks || '' })
    setOpen(true)
  }

  return (
    <Box>
      <PageHeader
        title="Student Performance"
        subtitle="Record and review exam results and grades"
        action={{ label: 'Add Record', icon: <AddIcon fontSize="small" />, onClick: () => { setEditId(null); setForm(INIT); setOpen(true) } }}
      />

      {/* Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <SectionLabel>Search by student</SectionLabel>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={5}>
              <TextField fullWidth size="small" select label="Student" value={filter.studentId} onChange={e => setFilter(f => ({ ...f, studentId: e.target.value }))}>
                {Array.isArray(students) ? students.filter(s => s.active).map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.name} ({s.admissionNumber})</MenuItem>
                )) : null}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" select label="Academic Year" value={filter.academicYear} onChange={e => setFilter(f => ({ ...f, academicYear: e.target.value }))}>
                {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="contained" fullWidth onClick={loadRecords} disabled={!filter.studentId}>
                Load
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
      ) : records.length > 0 ? (
        <TableCard>
          <Table>
            <TableHead>
              <TableRow>
                {['Subject', 'Exam Type', 'Marks', 'Max', 'Percentage', 'Term', 'Remarks', 'Actions'].map(h => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map(r => {
                const pct = Math.round(r.marks / r.maxMarks * 100)
                const gs = gradeStyle(pct)
                return (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{r.subject?.name}</TableCell>
                    <TableCell>
                      <Chip label={toTitleCase(r.examType)} size="small" sx={{ bgcolor: '#f1f5f9', color: '#374151', fontWeight: 500, border: 'none', fontSize: 11 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{r.marks}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{r.maxMarks}</TableCell>
                    <TableCell>
                      <Chip label={`${pct}%`} size="small" sx={{ bgcolor: gs.bgcolor, color: gs.color, fontWeight: 700, border: 'none' }} />
                    </TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{r.term}</TableCell>
                    <TableCell sx={{ color: '#6b7280', fontSize: 13 }}>{r.remarks || '—'}</TableCell>
                    <TableCell>
                      <IconButton size="small" sx={{ color: '#6b7280' }} onClick={() => openEdit(r)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#dc2626' }} onClick={() => handleDelete(r.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableCard>
      ) : (
        <EmptyState
          icon={<EmojiEventsIcon sx={{ fontSize: 40 }} />}
          message="No performance records"
          hint="Select a student above and click Load to view their records"
        />
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>{editId ? 'Edit' : 'Add'} Performance Record</Typography>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2.5 }}>
            <TextField size="small" select label="Student" required value={form.studentId} onChange={set('studentId')}>
              {Array.isArray(students) ? students.filter(s => s.active).map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>) : null}
            </TextField>
            <TextField size="small" select label="Class (to load subjects)" onChange={e => handleClassChange(e.target.value)} defaultValue="">
              {Array.isArray(classes) ? classes.map(c => <MenuItem key={c.id} value={c.id}>{c.className}</MenuItem>) : null}
            </TextField>
            <TextField size="small" select label="Subject" required value={form.subjectId} onChange={set('subjectId')}>
              {Array.isArray(subjects) ? subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>) : null}
            </TextField>
            <TextField size="small" select label="Exam Type" value={form.examType} onChange={set('examType')}>
              {EXAM_TYPES.map(t => <MenuItem key={t} value={t}>{toTitleCase(t)}</MenuItem>)}
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField fullWidth size="small" label="Marks" type="number" required value={form.marks} onChange={set('marks')} /></Grid>
              <Grid item xs={6}><TextField fullWidth size="small" label="Max Marks" type="number" required value={form.maxMarks} onChange={set('maxMarks')} /></Grid>
            </Grid>
            <TextField size="small" select label="Term" value={form.term} onChange={set('term')}>
              {TERMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Remarks (optional)" value={form.remarks} onChange={set('remarks')} />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={18} color="inherit" /> : (editId ? 'Update' : 'Save Record')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
