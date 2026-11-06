'use client';

import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CircularProgress from '@mui/material/CircularProgress';
import AppNavbar from '@/components/common/AppNavbar';
import AppTextField from '@/components/common/AppTextField';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import { useAuth } from '@/context/AuthContext';
import adminService from '@/services/adminService';
import { formatDate, fullName, getErrorMessage } from '@/utils/format';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [target, setTarget] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.users();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load users'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter((person) => {
      const haystack = `${person.firstName} ${person.lastName} ${person.email} ${person.country}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [query, users]);

  const blockedCount = users.filter((person) => person.isBlocked).length;
  const memberCount = users.filter((person) => person.role === 'user').length;

  async function toggleBlock(person) {
    setPendingId(person.id);
    try {
      const updated = await adminService.setBlocked(person.id, !person.isBlocked);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice(updated.isBlocked ? `${fullName(updated)} is blocked` : `${fullName(updated)} can sign in again`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update this user'));
    } finally {
      setPendingId('');
    }
  }

  async function confirmDelete() {
    if (!target) return;
    setPendingId(target.id);
    try {
      await adminService.remove(target.id);
      setUsers((current) => current.filter((item) => item.id !== target.id));
      setNotice(`${fullName(target)} was deleted`);
      setTarget(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this user'));
    } finally {
      setPendingId('');
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppNavbar />
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 4 } }}>
        <PageHeader
          title="People"
          subtitle="Review registered accounts, then block or delete a user."
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
          <StatCard label="Registered" value={users.length} />
          <StatCard label="Members" value={memberCount} />
          <StatCard label="Blocked" value={blockedCount} />
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
          <AppTextField
            placeholder="Filter by name, email, or country"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ mb: 2 }}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={loadUsers}>Retry</Button>}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((person) => {
                    const canModerate = person.role === 'user' && person.id !== user?.id;
                    return (
                      <TableRow key={person.id} hover>
                        <TableCell>{fullName(person)}</TableCell>
                        <TableCell>{person.email}</TableCell>
                        <TableCell>{person.country}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{person.role}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={person.isBlocked ? 'Blocked' : 'Active'}
                            color={person.isBlocked ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDate(person.createdAt)}</TableCell>
                        <TableCell align="right">
                          {canModerate ? (
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                color={person.isBlocked ? 'success' : 'warning'}
                                startIcon={person.isBlocked ? <LockOpenIcon /> : <BlockIcon />}
                                disabled={pendingId === person.id}
                                onClick={() => toggleBlock(person)}
                              >
                                {person.isBlocked ? 'Unblock' : 'Block'}
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteOutlineIcon />}
                                disabled={pendingId === person.id}
                                onClick={() => setTarget(person)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Protected
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography color="text.secondary" sx={{ py: 3 }} align="center">
                          No accounts match this filter.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this account?"
        description={target ? `${fullName(target)} and their direct messages will be removed.` : ''}
        confirmLabel="Delete user"
        loading={pendingId === target?.id}
        onClose={() => setTarget(null)}
        onConfirm={confirmDelete}
      />
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3000}
        onClose={() => setNotice('')}
        message={notice}
      />
    </Box>
  );
}
