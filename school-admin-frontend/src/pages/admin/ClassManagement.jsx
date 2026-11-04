import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, CircularProgress, Chip, Grid, Alert, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined'
import { getClasses, addClass, updateClass, deleteClass } from '../../api/classApi'
import { getSections } from '../../api/studentApi'
import { toast } from 'react-toastify'
import { PageHeader, EmptyState, TableCard } from '../../components/ui'

export default function ClassManagement() {
  const [classes, setClasses] = useState([])
  const [sectionCounts, setSectionCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ className: '' })
  const [error, setError] = useState(null)

  const loadClasses = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await getClasses()
      const classesArray = Array.isArray(data) ? data : []
      setClasses(classesArray)
      const counts = {}
      for (const c of classesArray) {
        try {
          const { data: sections } = await getSections(c.id)
          counts[c.id] = Array.isArray(sections) ? sections.length : 0
        } catch { counts[c.id] = 0 }
      }
      setSectionCounts(counts)
    } catch {
      setError('Failed to load classes. Please try again.')
      toast.error('Failed to load classes')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadClasses() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (!form.className.trim()) { toast.error('Class name is required'); setSubmitting(false); return }
      editId
        ? await updateClass(editId, { className: form.className })
        : await addClass({ className: form.className })
      toast.success(editId ? 'Class updated successfully' : 'Class added successfully')
      setForm({ className: '' }); setOpen(false); setEditId(null); loadClasses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save class')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try { await deleteClass(id); toast.success('Class deleted'); loadClasses() }
      catch (err) { toast.error(err.response?.data?.message || 'Failed to delete class') }
    }
  }

  const openDialog = (classData) => {
    setEditId(classData?.id || null)
    setForm({ className: classData?.className || '' })
    setOpen(true)
  }

  return (
    <Box>
      <PageHeader
        title="Class Management"
        subtitle="Manage school classes and their sections"
        action={{ label: 'Add New Class', icon: <AddIcon fontSize="small" />, onClick: () => openDialog(null) }}
      />

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
      ) : classes.length > 0 ? (
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {classes.length} class{classes.length !== 1 ? 'es' : ''} found
              </Typography>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon fontSize="small" />} onClick={loadClasses} disabled={loading}>
                Refresh
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableCard>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Class Name</TableCell>
                    <TableCell>Sections</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{c.className}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${sectionCounts[c.id] || 0} section${(sectionCounts[c.id] || 0) !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, border: 'none' }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" sx={{ color: '#2563eb' }} onClick={() => openDialog(c)} title="Edit class">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#dc2626' }} onClick={() => handleDelete(c.id)} title="Delete class">
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
              icon={<ClassOutlinedIcon sx={{ fontSize: 40 }} />}
              message="No classes found"
              hint='Click "Add New Class" to create your first class'
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>{editId ? 'Edit Class' : 'Add New Class'}</Typography>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2.5 }}>
            <TextField
              fullWidth size="small"
              label="Class Name"
              value={form.className}
              onChange={e => setForm({ className: e.target.value })}
              placeholder="e.g., Class 1, Class 5, Class 10"
              helperText="Enter the class name"
              autoFocus
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting || !form.className.trim()}>
              {submitting ? <CircularProgress size={18} color="inherit" /> : (editId ? 'Update' : 'Add Class')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
