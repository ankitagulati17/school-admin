import { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, TextField, MenuItem, Button, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress,
  Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material'
import ReceiptIcon from '@mui/icons-material/Receipt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PaymentIcon from '@mui/icons-material/Payment'
import { processFee, getAllFees, approveFee } from '../../api/feeApi'
import { getStudents } from '../../api/studentApi'
import { toast } from 'react-toastify'
import { PageHeader, TableCard, EmptyState, SectionLabel } from '../../components/ui'

const FEE_TYPES = ['Tuition Fee', 'Exam Fee', 'Library Fee', 'Sports Fee', 'Transport Fee', 'Miscellaneous']
const PAYMENT_MODES = ['Cash', 'Cheque', 'Online Transfer', 'UPI', 'DD']
const STATUS_OPTS = ['PAID', 'PENDING', 'PARTIAL']
const STATUS_STYLES = {
  PAID:    { bgcolor: '#f0fdf4', color: '#16a34a' },
  PENDING: { bgcolor: '#fffbeb', color: '#d97706' },
  PARTIAL: { bgcolor: '#f0f9ff', color: '#0891b2' },
  WAIVED:  { bgcolor: '#f9fafb', color: '#6b7280' },
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

const INIT = { studentId: '', amount: '', feeType: 'Tuition Fee', paymentDate: new Date().toISOString().split('T')[0], paymentMode: 'Cash', status: 'PAID', remarks: '', academicYear: '2024-2025' }

export default function FeePayment() {
  const [tab, setTab] = useState(0)
  const [form, setForm] = useState(INIT)
  const [students, setStudents] = useState([])
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [approveDialog, setApproveDialog] = useState({ open: false, feeId: null, studentName: '' })
  const [approving, setApproving] = useState(false)

  const loadFees = async () => {
    setListLoading(true)
    try {
      const [f, s] = await Promise.allSettled([getAllFees(), getStudents()])
      setFees(f.status === 'fulfilled' ? (f.value?.data || []) : [])
      setStudents(s.status === 'fulfilled' ? (s.value?.data || []) : [])
    } catch { toast.error('Failed to load data') }
    setListLoading(false)
  }

  useEffect(() => { loadFees() }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.studentId) { toast.error('Please select a student'); return }
    if (!amount || amount <= 0) { toast.error('Amount must be greater than 0'); return }
    if (amount > 1000000) { toast.error('Amount seems too large. Please verify.'); return }
    setLoading(true)
    try {
      const { data } = await processFee({ ...form, studentId: Number(form.studentId), amount: Number(form.amount) })
      toast.success(`Fee processed! Receipt: ${data.receiptNumber}`)
      setForm(INIT)
      loadFees()
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed') }
    setLoading(false)
  }

  const handleApproveConfirm = async () => {
    setApproving(true)
    try {
      await approveFee(approveDialog.feeId)
      toast.success(`Payment approved for ${approveDialog.studentName}`)
      setApproveDialog({ open: false, feeId: null, studentName: '' })
      loadFees()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve') }
    setApproving(false)
  }

  const totalCollected = fees.filter(f => f.status === 'PAID').reduce((s, f) => s + f.amount, 0)
  const totalPending = fees.filter(f => f.status === 'PENDING').reduce((s, f) => s + f.amount, 0)

  const tableData = tab === 1 ? fees : fees.filter(f => f.status === 'PENDING')

  return (
    <Box>
      <PageHeader title="Fee Payment" subtitle="Process payments and view fee records" />

      {/* Summary cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, bgcolor: '#f0fdf4', color: '#16a34a' },
          { label: 'Total Pending', value: `₹${totalPending.toLocaleString()}`, bgcolor: '#fffbeb', color: '#d97706' },
          { label: 'Total Records', value: fees.length, bgcolor: '#eff6ff', color: '#2563eb' },
        ].map(({ label, value, bgcolor, color }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{label}</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color }}>{value}</Typography>
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
        <Tab label="Process Payment" />
        <Tab label="Payment History" />
        <Tab label="Pending Payments" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <SectionLabel>New fee payment</SectionLabel>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" select required label="Student" value={form.studentId} onChange={set('studentId')}>
                    {Array.isArray(students) ? students.filter(s => s.active).map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.name} ({s.admissionNumber})</MenuItem>
                    )) : null}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" select label="Fee Type" value={form.feeType} onChange={set('feeType')}>
                    {FEE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" required label="Amount (₹)" type="number" value={form.amount} onChange={set('amount')}
                    inputProps={{ min: 1 }}
                    error={form.amount !== '' && Number(form.amount) <= 0}
                    helperText={form.amount !== '' && Number(form.amount) <= 0 ? 'Amount must be greater than 0' : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" select label="Payment Mode" value={form.paymentMode} onChange={set('paymentMode')}>
                    {PAYMENT_MODES.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" select label="Status" value={form.status} onChange={set('status')}>
                    {STATUS_OPTS.map(s => <MenuItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Payment Date" type="date" InputLabelProps={{ shrink: true }} value={form.paymentDate} onChange={set('paymentDate')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Academic Year" value={form.academicYear} onChange={set('academicYear')} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Remarks (optional)" value={form.remarks} onChange={set('remarks')} />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }} />
                  <Button variant="contained" type="submit" startIcon={<ReceiptIcon fontSize="small" />} disabled={loading}>
                    {loading ? <CircularProgress size={18} color="inherit" /> : 'Process Payment & Generate Receipt'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {tab !== 0 && (
        listLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
        ) : tableData.length === 0 ? (
          <EmptyState
            icon={<PaymentIcon sx={{ fontSize: 40 }} />}
            message={tab === 2 ? 'No pending payments' : 'No payment records found'}
          />
        ) : (
          <TableCard>
            <Table>
              <TableHead>
                <TableRow>
                  {['Receipt No', 'Student', 'Fee Type', 'Amount', 'Mode', 'Date', 'Status', 'Action'].map(h => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map(f => (
                  <TableRow key={f.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: '#6b7280' }}>{f.receiptNumber}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{f.student?.name}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{f.feeType}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₹{f.amount?.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{f.paymentMode}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{formatDate(f.paymentDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={f.status.charAt(0) + f.status.slice(1).toLowerCase()}
                        size="small"
                        sx={{ bgcolor: STATUS_STYLES[f.status]?.bgcolor, color: STATUS_STYLES[f.status]?.color, fontWeight: 600, border: 'none' }}
                      />
                    </TableCell>
                    <TableCell>
                      {f.status === 'PENDING' && (
                        <IconButton
                          size="small"
                          sx={{ color: '#16a34a' }}
                          onClick={() => setApproveDialog({ open: true, feeId: f.id, studentName: f.student?.name })}
                          title="Approve payment"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        )
      )}

      <Dialog open={approveDialog.open} onClose={() => setApproveDialog({ open: false, feeId: null, studentName: '' })} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>Approve Payment</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2">
            Approve payment for <strong>{approveDialog.studentName}</strong>? This will change the status from <strong>PENDING</strong> to <strong>PAID</strong>.
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setApproveDialog({ open: false, feeId: null, studentName: '' })} sx={{ color: '#6b7280' }}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleApproveConfirm} disabled={approving}>
            {approving ? <CircularProgress size={18} color="inherit" /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
