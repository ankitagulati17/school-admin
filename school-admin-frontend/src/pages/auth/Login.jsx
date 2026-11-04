import { useState } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton, Divider
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Logo / Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              bgcolor: '#2563eb',
              borderRadius: 2,
              mb: 2,
            }}
          >
            <SchoolIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            School Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sign in to your account
          </Typography>
        </Box>

        {/* Card */}
        <Card elevation={0} sx={{ p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.8rem' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ mb: 0.75 }}>
                  Username
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter your username"
                  required
                  autoFocus
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ mb: 0.75 }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter your password"
                  required
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small">
                          {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ py: 1.1, fontWeight: 600 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {/* Role reference */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Roles: Admin · Principal · Teacher · Clerk · Student
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
