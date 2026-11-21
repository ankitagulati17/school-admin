import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Chip, IconButton, CircularProgress, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { PageHeader, TableCard, EmptyState } from '../../components/ui'

const ROLES = ['ADMIN', 'PRINCIPAL', 'TEACHER', 'CLERK', 'STUDENT']
const ROLE_STYLES = {
  ADMIN:     { bgcolor: '#faf5ff', color: '#7c3aed' },
  PRINCIPAL: { bgcolor: '#eff6ff', color: '#2563eb' },
  TEACHER:   { bgcolor: '#f0fdf4', color: '#16a34a' },
  CLERK:     { bgcolor: '#fffbeb', color: '#d97706' },
  STUDENT:   { bgcolor: '#f0f9ff', color: '#0891b2' },
}

const ADD_INIT = { username: '', password: '', fullName: '', email: '', role: 'TEACHER', studentId: '' }
const EDIT_INIT = { fullName: '', email: '', role: 'TEACHER', password: '', studentId: '' }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Add dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(ADD_INIT)

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState(EDIT_INIT)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/auth/users')
      setUsers(data)
    } catch { toast.error('Failed to load users') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...addForm }
      if (payload.role !== 'STUDENT') delete payload.studentId
      else if (!payload.studentId) { toast.error('Student ID is required'); setSubmitting(false); return }
      await api.post('/auth/register', payload)
      toast.success('User created successfully')
      setAddOpen(false)
      setAddForm(ADD_INIT)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating user') }
    setSubmitting(false)
  }

  const openEdit = (user) => {
    setEditId(user.id)
    setEditForm({ fullName: user.fullName, email: user.email || '', role: user.role, password: '', studentId: user.studentId || '' })
    setEditOpen(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...editForm }
      if (!payload.password) delete payload.password
      if (payload.role !== 'STUDENT') delete payload.studentId
      await api.put(`/auth/users/${editId}`, payload)
      toast.success('User updated successfully')
      setEditOpen(false)
      setEditId(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error updating user') }
    setSubmitting(false)
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.fullName}" (${user.username})? This cannot be undone.`)) return
    try {
      await api.delete(`/auth/users/${user.id}`)
      toast.success('User deleted')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error deleting user') }
  }

  const toggleStatus = async (id) => {
    try {
      await api.put(`/auth/users/${id}/toggle`)
      toast.success('Status updated')
      load()
    } catch { toast.error('Error updating status') }
  }

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="Manage system users and their roles"
        action={{ label: 'Add User', icon: <AddIcon fontSize="small" />, onClick: () => setAddOpen(true) }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <TableCard>
          {users.length === 0 ? (
            <EmptyState
              icon={<PeopleOutlineIcon sx={{ fontSize: 40 }} />}
              message="No users found"
              hint='Click "Add User" to create your first user'
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {['#', 'Full Name', 'Username', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u, i) => {
                  const rs = ROLE_STYLES[u.role] || {}
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ color: '#9ca3af', fontSize: 13 }}>{i + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{u.fullName}</TableCell>
                      <TableCell sx={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 13 }}>{u.username}</TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>{u.email || '—'}</TableCell>
                      <TableCell>
                        <Chip label={u.role} size="small" sx={{ bgcolor: rs.bgcolor, color: rs.color, fontWeight: 600, border: 'none' }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.active ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{ bgcolor: u.active ? '#f0fdf4' : '#f9fafb', color: u.active ? '#16a34a' : '#9ca3af', fontWeight: 600, border: 'none' }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" sx={{ color: '#2563eb' }} onClick={() => openEdit(u)} title="Edit user">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#dc2626' }} onClick={() => handleDelete(u)} title="Delete user">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => toggleStatus(u.id)}
                          title={u.active ? 'Deactivate user' : 'Activate user'}
                          sx={{ color: u.active ? '#16a34a' : '#9ca3af' }}
                        >
                          {u.active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TableCard>
      )}

      {/* Add User Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Add New User</Typography>
          <Typography variant="body2" color="text.secondary">Fill in the details to create a new system user.</Typography>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleAdd}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2.5 }}>
            <TextField size="small" label="Full Name" required value={addForm.fullName} onChange={e => setAddForm({ ...addForm, fullName: e.target.value })} />
            <TextField size="small" label="Username" required value={addForm.username} onChange={e => setAddForm({ ...addForm, username: e.target.value })} />
            <TextField size="small" label="Email" type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} />
            <TextField size="small" label="Password" type="password" required value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} />
            <TextField size="small" select label="Role" required value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}>
              {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            {addForm.role === 'STUDENT' && (
              <TextField size="small" label="Student ID" value={addForm.studentId} onChange={e => setAddForm({ ...addForm, studentId: e.target.value })} helperText="Link this account to an existing student record" />
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setAddOpen(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={18} color="inherit" /> : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Edit User</Typography>
          <Typography variant="body2" color="text.secondary">Leave password blank to keep it unchanged.</Typography>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleEdit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2.5 }}>
            <TextField size="small" label="Full Name" required value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
            <TextField size="small" label="Email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            <TextField size="small" label="New Password" type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} helperText="Leave blank to keep current password" />
            <TextField size="small" select label="Role" required value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
              {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            {editForm.role === 'STUDENT' && (
              <TextField size="small" label="Student ID" value={editForm.studentId} onChange={e => setEditForm({ ...editForm, studentId: e.target.value })} helperText="Link to an existing student record" />
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditOpen(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={18} color="inherit" /> : 'Update User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
