import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { SessionUser } from './src/auth/session';
import { SessionContext } from './src/auth/session';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { clearToken, getSession, getToken } from './src/services/api';

type Status = 'loading' | 'signedOut' | 'signedIn';

export default function App() {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    void restoreSession();
  }, []);

  // Token salvo (AsyncStorage) é revalidado contra /auth/me a cada abertura do app.
  async function restoreSession() {
    const token = await getToken();
    if (!token) {
      setStatus('signedOut');
      return;
    }
    try {
      setUser(await getSession(token));
      setStatus('signedIn');
    } catch {
      await clearToken();
      setStatus('signedOut');
    }
  }

  async function logout() {
    await clearToken();
    setUser(null);
    setStatus('signedOut');
  }

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'signedOut' || !user) {
    return (
      <>
        <NavigationContainer>
          <AuthNavigator onLoggedIn={() => void restoreSession()} />
        </NavigationContainer>
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <SessionContext.Provider value={{ user, logout: () => void logout() }}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </SessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
