import { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, TextField, MenuItem, Button, Card, CardContent,
  CircularProgress, Divider, Table, TableHead, TableRow, TableCell, TableBody, Chip
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import { getAcademicAnalysis, getFinancialAnalysis } from '../../api/analysisApi'
import { toast } from 'react-toastify'
import { PageHeader } from '../../components/ui'

const YEARS = ['2024-2025', '2023-2024']
const COLORS = ['#1565c0','#2e7d32','#e65100','#7b1fa2','#c62828','#00838f']

export default function Analysis() {
  const [year, setYear] = useState('2024-2025')
  const [academic, setAcademic] = useState(null)
  const [financial, setFinancial] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [a, f] = await Promise.allSettled([getAcademicAnalysis(year), getFinancialAnalysis(year)])
      setAcademic(a.status === 'fulfilled' ? (a.value?.data || null) : null)
      setFinancial(f.status === 'fulfilled' ? (f.value?.data || null) : null)
    } catch { toast.error('Failed to load analysis') }
    setLoading(false)
  }

  useEffect(() => { load() }, [year])

  const chartData = academic?.classwisePerformance?.map(c => ({
    name: c.className,
    'Avg %': c.averagePercentage,
    'Records': c.totalRecords,
  })) || []

  const pieData = financial ? [
    { name: 'Collected', value: financial.totalCollected },
    { name: 'Pending',   value: financial.totalPending },
  ] : []

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#111827' }}>Analysis</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            Academic performance and fee collection analytics
          </Typography>
        </Box>
        <TextField select label="Academic Year" value={year} onChange={e=>setYear(e.target.value)} size="small" sx={{ minWidth: 150 }}>
          {Array.isArray(YEARS) ? YEARS.map(y=><MenuItem key={y} value={y}>{y}</MenuItem>) : null}
        </TextField>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          {financial && [
            ['Total Students', academic?.totalStudents, '#1565c0'],
            ['Fee Collected', `₹${financial.totalCollected?.toLocaleString()}`, '#2e7d32'],
            ['Fee Pending', `₹${financial.totalPending?.toLocaleString()}`, '#e65100'],
            ['Collection Rate', `${financial.collectionRatePercent}%`, '#7b1fa2'],
          ].map(([label, val, color]) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Card sx={{ borderRadius:3, boxShadow:2, borderLeft:`4px solid ${color}` }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color }}>{val}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Academic Performance Bar Chart */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius:3, boxShadow:2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Classwise Average Performance</Typography>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top:10, right:20, left:0, bottom:5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize:11 }} />
                      <YAxis domain={[0,100]} unit="%" />
                      <Tooltip formatter={(v) => [`${v}%`]} />
                      <Legend />
                      <Bar dataKey="Avg %" fill="#1565c0" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>No performance data for this year</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Pie Chart */}
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius:3, boxShadow:2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Fee Collection Status</Typography>
                {pieData[0]?.value > 0 || pieData[1]?.value > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={i===0?'#1565c0':'#90caf9'} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`₹${v?.toLocaleString()}`]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>No fee data for this year</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Class-wise detail table */}
          {academic?.classwisePerformance?.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius:3, boxShadow:2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Class-wise Academic Details</Typography>
                  <Divider sx={{ mb:2 }} />
                  <Box sx={{ overflow:'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f6fa' }}>
                          {['Class','Avg Score (%)','Total Records','Pass Count'].map(h => (
                            <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {academic.classwisePerformance.map((c) => (
                          <TableRow key={c.classId} hover>
                            <TableCell sx={{ fontWeight: 500 }}>{c.className}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${c.averagePercentage}%`}
                                size="small"
                                sx={{
                                  bgcolor: c.averagePercentage >= 60 ? '#f0fdf4' : c.averagePercentage > 0 ? '#fef2f2' : '#f1f5f9',
                                  color: c.averagePercentage >= 60 ? '#16a34a' : c.averagePercentage > 0 ? '#dc2626' : '#6b7280',
                                  fontWeight: 700,
                                  border: 'none',
                                }}
                              />
                            </TableCell>
                            <TableCell>{c.totalRecords}</TableCell>
                            <TableCell>{c.passCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  )
}
