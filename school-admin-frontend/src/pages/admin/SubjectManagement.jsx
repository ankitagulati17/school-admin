import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, CircularProgress, MenuItem, Grid, Alert, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import { getClasses } from '../../api/classApi'
import { getSubjectsByClass, addSubject, updateSubject, deleteSubject } from '../../api/subjectApi'
import { toast } from 'react-toastify'
import { PageHeader, EmptyState, TableCard, SectionLabel } from '../../components/ui'

export default function SubjectManagement() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', classId: '' })
  const [error, setError] = useState(null)

  const loadClasses = async () => {
    try {
      const { data } = await getClasses()
      setClasses(Array.isArray(data) ? data : [])
    } catch { setError('Failed to load classes') }
  }

  const loadSubjects = async (classId) => {
    if (!classId) { setSubjects([]); return }
    setLoading(true); setError(null)
    try {
      const { data } = await getSubjectsByClass(classId)
      setSubjects(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load subjects for this class')
      toast.error('Failed to load subjects')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadClasses() }, [])

  const handleClassChange = (classId) => { setSelectedClass(classId); loadSubjects(classId) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      if (!form.name.trim()) { toast.error('Subject name is required'); setSubmitting(false); return }
      if (!form.code.trim()) { toast.error('Subject code is required'); setSubmitting(false); return }
      if (!selectedClass) { toast.error('Please select a class first'); setSubmitting(false); return }
      const payload = { name: form.name, code: form.code, classId: Number(selectedClass) }
      editId ? await updateSubject(editId, payload) : await addSubject(payload)
      toast.success(editId ? 'Subject updated successfully' : 'Subject added successfully')
      setForm({ name: '', code: '', classId: '' }); setOpen(false); setEditId(null)
      if (selectedClass) loadSubjects(selectedClass)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try { await deleteSubject(id); toast.success('Subject deleted'); if (selectedClass) loadSubjects(selectedClass) }
      catch (err) { toast.error(err.response?.data?.message || 'Failed to delete subject') }
    }
  }

  const openDialog = (subjectData) => {
    setEditId(subjectData?.id || null)
    setForm({ name: subjectData?.name || '', code: subjectData?.code || '', classId: selectedClass })
    setOpen(true)
  }

  const selectedClassName = classes.find(c => c.id === Number(selectedClass))?.className || ''

  return (
    <Box>
      <PageHeader
        title="Subject Management"
        subtitle="Create and manage subjects for each class"
        action={{ label: 'Add Subject', icon: <AddIcon fontSize="small" />, onClick: () => openDialog(null), disabled: !selectedClass }}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <SectionLabel>Select a class to manage its subjects</SectionLabel>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" select label="Class" value={selectedClass} onChange={e => handleClassChange(e.target.value)}>
                <MenuItem value="">— Select a class —</MenuItem>
                {Array.isArray(classes) && classes.map(c => <MenuItem key={c.id} value={c.id}>{c.className}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
          {!selectedClass && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Select a class to view or add subjects
            </Typography>
          )}
        </CardContent>
      </Card>

      {error && selectedClass && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      {!selectedClass ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<MenuBookOutlinedIcon sx={{ fontSize: 40 }} />}
              message="No class selected"
              hint="Choose a class from the dropdown above to view and manage its subjects"
            />
          </CardContent>
        </Card>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
      ) : subjects.length > 0 ? (
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Subjects for <strong>{selectedClassName}</strong> — {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableCard>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.map(s => (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                      <TableCell>
                        <Box sx={{ bgcolor: '#f0fdf4', color: '#16a34a', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                          {s.code}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>{selectedClassName}</TableCell>
                      <TableCell>
                        <IconButton size="small" sx={{ color: '#2563eb' }} onClick={() => openDialog(s)} title="Edit subject">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#dc2626' }} onClick={() => handleDelete(s.id)} title="Delete subject">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableCard>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon={<MenuBookOutlinedIcon sx={{ fontSize: 40 }} />}
              message={`No subjects for ${selectedClassName}`}
              hint='Click "Add Subject" to create the first subject for this class'
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>{editId ? 'Edit Subject' : 'Add New Subject'}</Typography>
          {selectedClassName && <Typography variant="body2" color="text.secondary">For class: {selectedClassName}</Typography>}
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth size="small"
              label="Subject Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., English, Mathematics"
              autoFocus
            />
            <TextField
              fullWidth size="small"
              label="Subject Code"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g., ENG, MATH"
              helperText="Short unique identifier (auto-uppercase)"
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting || !form.name.trim() || !form.code.trim()}>
              {submitting ? <CircularProgress size={18} color="inherit" /> : (editId ? 'Update' : 'Add Subject')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
