import type { ThemeId } from './project';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  color: string;
  dark: string;
  paper: string;
  ink: string;
}

export const themes: Record<ThemeId, ThemeDefinition> = {
  'district-office': {
    id: 'district-office', label: 'Kantor Kecamatan', color: '#a33c35', dark: '#27312b', paper: '#f0e7d2', ink: '#202820',
  },
  'crimson-office': {
    id: 'crimson-office', label: 'Crimson Office', color: '#9f2635', dark: '#34171d', paper: '#f4e8df', ink: '#2f2023',
  },
};

export function isThemeId(value: string): value is ThemeId {
  return value in themes;
}
