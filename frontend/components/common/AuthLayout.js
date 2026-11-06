'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import Logo from './Logo';

const points = [
  { icon: <ForumOutlinedIcon />, text: 'Find someone and talk one to one, live.' },
  { icon: <GroupsOutlinedIcon />, text: 'Create a group, leave it, and pick the history back up.' },
  { icon: <AdminPanelSettingsOutlinedIcon />, text: 'Admins can review, block, or remove accounts.' },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 44%',
          position: 'relative',
          overflow: 'hidden',
          color: '#f4fffd',
          background: 'linear-gradient(165deg, #08332f 0%, #0c6b63 58%, #12897e 100%)',
          p: 6,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Logo size={42} />
          <Typography variant="h5" sx={{ color: '#fff' }}>
            WebChat
          </Typography>
        </Stack>
        <Box>
          <Typography variant="h3" sx={{ color: '#fff', maxWidth: 420, mb: 3 }}>
            A quieter room for people and groups.
          </Typography>
          <Stack spacing={2}>
            {points.map((point) => (
              <Stack key={point.text} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box sx={{ color: '#f0b48a' }}>{point.icon}</Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.88)' }}>{point.text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Messages are stored so a conversation is still there when you come back.
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            bgcolor: 'rgba(224,122,61,0.28)',
            bottom: -80,
            right: -50,
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2.5, sm: 4 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Stack direction="row" spacing={1.25} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 3 }}>
            <Logo />
            <Typography variant="h6">WebChat</Typography>
          </Stack>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
          {footer && <Box sx={{ mt: 2.5 }}>{footer}</Box>}
        </Box>
      </Box>
    </Box>
  );
}
