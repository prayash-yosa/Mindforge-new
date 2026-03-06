/**
 * API base URLs for each role.
 *
 * For local server deployment, set EXPO_PUBLIC_SERVER_IP to your server's IP
 * (e.g., 192.168.1.100). Or use the in-app settings to configure it.
 *
 * Fallbacks:
 *   - EXPO_PUBLIC_SERVER_IP env variable
 *   - Android emulator: 10.0.2.2 (maps to host machine localhost)
 *   - iOS simulator: localhost
 */
import { Platform } from 'react-native';

const getDefaultHost = (): string => {
  const override = process.env.EXPO_PUBLIC_SERVER_IP;
  if (override) return override.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
};

const DEFAULT_HOST = getDefaultHost();

export function buildApiUrls(host: string = DEFAULT_HOST) {
  const base = `http://${host}`;
  return {
    admin: `${base}:3004`,
    student: `${base}:3000`,
    teacher: `${base}:3003`,
    parent: `${base}:3002`,
  } as const;
}

export const API = buildApiUrls();

export const PORTS = {
  student: 3000,
  parent: 3002,
  teacher: 3003,
  admin: 3004,
} as const;
