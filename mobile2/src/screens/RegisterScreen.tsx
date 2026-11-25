import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AuthStackParamList } from '../navigation/types';
import { register } from '../services/api';
import { registerForPushNotificationsAsync } from '../services/push';

type Props = NativeStackScreenProps<AuthStackParamList, 'Registro'>;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function cadastrar() {
    if (password !== confirm) {
      setError('As senhas não conferem.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const pushToken = await registerForPushNotificationsAsync();
      await register(name.trim(), email.trim(), password, pushToken);
      navigation.replace('Login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar conta</Text>
      {error ? <Text style={styles.erro}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        editable={!busy}
        value={name}
        onChangeText={setName}
      />
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
      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        secureTextEntry
        editable={!busy}
        value={confirm}
        onChangeText={setConfirm}
      />
      <TouchableOpacity style={styles.botao} disabled={busy} onPress={() => void cadastrar()}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Cadastrar</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Já tenho conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  erro: { color: '#d63031' },
  input: { height: 50, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9' },
  botao: { height: 50, marginTop: 8, borderRadius: 8, backgroundColor: '#6c5ce7', justifyContent: 'center', alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  link: { color: '#6c5ce7', fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
});
