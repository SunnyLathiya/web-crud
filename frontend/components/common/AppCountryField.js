'use client';

import Autocomplete from '@mui/material/Autocomplete';
import COUNTRIES from '@/constants/countries';
import AppTextField from './AppTextField';

export default function AppCountryField({ value, onChange }) {
  return (
    <Autocomplete
      freeSolo
      options={COUNTRIES}
      value={value || ''}
      inputValue={value || ''}
      onInputChange={(event, nextValue) => onChange(nextValue)}
      renderInput={(params) => (
        <AppTextField {...params} label="Country" name="country" required />
      )}
    />
  );
}
