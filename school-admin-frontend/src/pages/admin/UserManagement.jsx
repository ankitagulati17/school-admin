import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Chip, IconButton, CircularProgress, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
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

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'TEACHER', studentId: '' })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/auth/users')
      setUsers(data)
    } catch { toast.error('Failed to load users') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...form }
      if (payload.role !== 'STUDENT') delete payload.studentId
      else if (!payload.studentId) { toast.error('Student ID is required'); setSubmitting(false); return }
      await api.post('/auth/register', payload)
      toast.success('User created successfully')
      setOpen(false)
      setForm({ username: '', password: '', fullName: '', email: '', role: 'TEACHER', studentId: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating user') }
    setSubmitting(false)
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
        action={{ label: 'Add User', icon: <AddIcon fontSize="small" />, onClick: () => setOpen(true) }}
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
                  {['#', 'Full Name', 'Username', 'Email', 'Role', 'Status', 'Action'].map(h => (
                    <TableCell key={h}>{h}</TableCell>
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
                        <Chip
                          label={u.role}
                          size="small"
                          sx={{ bgcolor: rs.bgcolor, color: rs.color, fontWeight: 600, border: 'none' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.active ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: u.active ? '#f0fdf4' : '#f9fafb',
                            color: u.active ? '#16a34a' : '#9ca3af',
                            fontWeight: 600,
                            border: 'none',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleStatus(u.id)}
                          title={u.active ? 'Deactivate user' : 'Activate user'}
                          sx={{ color: u.active ? '#16a34a' : '#dc2626' }}
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Add New User</Typography>
          <Typography variant="body2" color="text.secondary">Fill in the details to create a new system user.</Typography>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2.5 }}>
            <TextField size="small" label="Full Name" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
            <TextField size="small" label="Username" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <TextField size="small" label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <TextField size="small" label="Password" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <TextField size="small" select label="Role" required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            {form.role === 'STUDENT' && (
              <TextField size="small" label="Student ID" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} helperText="Link this account to an existing student record" />
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={18} color="inherit" /> : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
