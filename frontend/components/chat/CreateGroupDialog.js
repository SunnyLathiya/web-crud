'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AppButton from '@/components/common/AppButton';
import AppTextField from '@/components/common/AppTextField';
import { getErrorMessage } from '@/utils/format';

export default function CreateGroupDialog({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onCreate({ name: name.trim(), description: description.trim() });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create the group'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { component: 'form', onSubmit: handleSubmit } }}
    >
      <DialogTitle>Create a group</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <AppTextField
            label="Group name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            inputProps={{ minLength: 2, maxLength: 40 }}
          />
          <AppTextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={2}
            inputProps={{ maxLength: 200 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <AppButton type="submit" loading={loading}>
          Create
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}
