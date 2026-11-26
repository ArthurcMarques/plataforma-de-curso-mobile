import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AuthStackParamList } from '../navigation/types';
import { login } from '../services/api';
import { registerForPushNotificationsAsync } from '../services/push';
import { authStyles as styles } from './authStyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'> & { onLoggedIn: () => void };

export default function LoginScreen({ navigation, onLoggedIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function entrar() {
    setBusy(true);
    setError('');
    try {
      const pushToken = await registerForPushNotificationsAsync();
      await login(email.trim(), password, pushToken);
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Entrar na plataforma</Text>
      {error ? <Text style={styles.erro}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!busy}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        editable={!busy}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.botao} disabled={busy} onPress={() => void entrar()}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Entrar</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}
