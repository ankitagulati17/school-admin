import { Box, Typography, Button, Divider } from '@mui/material'

/**
 * Consistent page header used across all pages.
 * Props: title, subtitle, action (optional button config: { label, icon, onClick })
 */
export function PageHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#111827', fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Button
            variant="contained"
            startIcon={action.icon}
            onClick={action.onClick}
            sx={{ flexShrink: 0 }}
          >
            {action.label}
          </Button>
        )}
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Box>
  )
}

/**
 * Wraps a table with a white card and consistent border/shadow.
 */
export function TableCard({ children, sx = {} }) {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

/**
 * Empty state shown when a table has no data.
 */
export function EmptyState({ icon, message, hint }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        color: 'text.secondary',
      }}
    >
      {icon && (
        <Box sx={{ mb: 1.5, color: '#d1d5db', display: 'flex', justifyContent: 'center' }}>
          {icon}
        </Box>
      )}
      <Typography variant="body1" fontWeight={500} color="text.primary">
        {message}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Box>
  )
}

/**
 * Section label inside a filter/form card.
 */
export function SectionLabel({ children }) {
  return (
    <Typography
      variant="caption"
      sx={{
        display: 'block',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontSize: 10,
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  )
}
