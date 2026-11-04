import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, CircularProgress, MenuItem, Grid, Alert, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import { getClasses } from '../../api/classApi'
import { getSectionsByClass, addSection, updateSection, deleteSection } from '../../api/sectionApi'
import { toast } from 'react-toastify'
import { PageHeader, EmptyState, TableCard, SectionLabel } from '../../components/ui'

export default function SectionManagement() {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', classId: '' })
  const [error, setError] = useState(null)

  const loadClasses = async () => {
    try {
      const { data } = await getClasses()
      setClasses(Array.isArray(data) ? data : [])
    } catch { setError('Failed to load classes') }
  }

  const loadSections = async (classId) => {
    if (!classId) { setSections([]); return }
    setLoading(true); setError(null)
    try {
      const { data } = await getSectionsByClass(classId)
      setSections(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load sections for this class')
      toast.error('Failed to load sections')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadClasses() }, [])

  const handleClassChange = (classId) => { setSelectedClass(classId); loadSections(classId) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      if (!form.name.trim()) { toast.error('Section name is required'); setSubmitting(false); return }
      const payload = { name: form.name, classId: Number(selectedClass) }
      editId ? await updateSection(editId, payload) : await addSection(payload)
      toast.success(editId ? 'Section updated successfully' : 'Section added successfully')
      setForm({ name: '', classId: '' }); setOpen(false); setEditId(null); loadSections(selectedClass)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save section')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try { await deleteSection(id); toast.success('Section deleted'); loadSections(selectedClass) }
      catch (err) { toast.error(err.response?.data?.message || 'Failed to delete section') }
    }
  }

  const openDialog = (sectionData) => {
    setEditId(sectionData?.id || null)
    setForm({ name: sectionData?.name || '', classId: selectedClass })
    setOpen(true)
  }

  const selectedClassName = classes.find(c => c.id === Number(selectedClass))?.className || ''

  return (
    <Box>
      <PageHeader
        title="Section Management"
        subtitle="Create and manage sections within each class"
        action={{ label: 'Add Section', icon: <AddIcon fontSize="small" />, onClick: () => openDialog(null), disabled: !selectedClass }}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <SectionLabel>Select a class to manage its sections</SectionLabel>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" select label="Class" value={selectedClass} onChange={e => handleClassChange(e.target.value)}>
                <MenuItem value="">— Select a class —</MenuItem>
                {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.className}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && selectedClass && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      {!selectedClass ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<AccountTreeOutlinedIcon sx={{ fontSize: 40 }} />}
              message="No class selected"
              hint="Choose a class from the dropdown above to view and manage its sections"
            />
          </CardContent>
        </Card>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
      ) : sections.length > 0 ? (
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sections for <strong>{selectedClassName}</strong> — {sections.length} section{sections.length !== 1 ? 's' : ''}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableCard>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Section Name</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sections.map(s => (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>{s.schoolClass?.className}</TableCell>
                      <TableCell>
                        <IconButton size="small" sx={{ color: '#2563eb' }} onClick={() => openDialog(s)} title="Edit section">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#dc2626' }} onClick={() => handleDelete(s.id)} title="Delete section">
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
              icon={<AccountTreeOutlinedIcon sx={{ fontSize: 40 }} />}
              message={`No sections for ${selectedClassName}`}
              hint='Click "Add Section" to create the first section for this class'
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>{editId ? 'Edit Section' : 'Add New Section'}</Typography>
          <Typography variant="body2" color="text.secondary">For class: {selectedClassName}</Typography>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2.5 }}>
            <TextField
              fullWidth size="small"
              label="Section Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., A, B, C"
              autoFocus
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting || !form.name.trim()}>
              {submitting ? <CircularProgress size={18} color="inherit" /> : (editId ? 'Update' : 'Add Section')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
