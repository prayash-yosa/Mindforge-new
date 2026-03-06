import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mindforge/server_ip';

interface ServerState {
  serverIp: string;
  isConnected: boolean | null;
  setServerIp: (ip: string) => Promise<void>;
  checkConnection: () => Promise<void>;
  getApiUrl: (port: number) => string;
}

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

const ServerContext = createContext<ServerState>({
  serverIp: defaultHost,
  isConnected: null,
  setServerIp: async () => {},
  checkConnection: async () => {},
  getApiUrl: () => '',
});

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [serverIp, setIp] = useState(defaultHost);
  const [isConnected, setConnected] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setIp(saved);
      setLoaded(true);
    });
  }, []);

  const getApiUrl = useCallback(
    (port: number) => `http://${serverIp}:${port}`,
    [serverIp],
  );

  const checkConnection = useCallback(async () => {
    setConnected(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`http://${serverIp}:3004/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setConnected(res.ok);
    } catch {
      setConnected(false);
    }
  }, [serverIp]);

  useEffect(() => {
    if (loaded) checkConnection();
  }, [loaded, serverIp, checkConnection]);

  const setServerIp = useCallback(async (ip: string) => {
    const trimmed = ip.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    setIp(trimmed);
    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
  }, []);

  return (
    <ServerContext.Provider
      value={{ serverIp, isConnected, setServerIp, checkConnection, getApiUrl }}
    >
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  return useContext(ServerContext);
}
