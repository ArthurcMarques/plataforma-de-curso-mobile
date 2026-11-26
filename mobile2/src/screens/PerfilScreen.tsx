import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { profileNames, useSession } from '../auth/session';
import type { AppStackParamList, TabParamList } from '../navigation/types';
import { updateUsuario } from '../services/api';
import { cores, estilos } from '../theme';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Perfil'>,
    NativeStackNavigationProp<AppStackParamList>
  >;
};

export default function PerfilScreen({ navigation }: Props) {
  const { user, logout } = useSession();
  const [nome, setNome] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [senha, setSenha] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function salvar() {
    setBusy(true);
    setError('');
    setSucesso('');
    try {
      // Senha vazia preserva a atual, mesmo padrão do frontend web.
      await updateUsuario(user.userId, { name: nome, email, password: senha || undefined });
      setSenha('');
      setSucesso('Dados atualizados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar seus dados.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Perfil</Text>
      <Text style={styles.linha}>{profileNames[user.perfil]}</Text>

      {error ? <Text style={estilos.erro}>{error}</Text> : null}
      {sucesso ? <Text style={styles.sucesso}>{sucesso}</Text> : null}

      <TextInput style={estilos.input} placeholder="Nome completo" editable={!busy} value={nome} onChangeText={setNome} />
      <TextInput
        style={estilos.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!busy}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={estilos.input}
        placeholder="Nova senha (deixe em branco para manter)"
        secureTextEntry
        editable={!busy}
        value={senha}
        onChangeText={setSenha}
      />
      <TouchableOpacity style={[estilos.botao, { height: 50 }]} disabled={busy} onPress={() => void salvar()}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botaoTexto}>Salvar</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSecundario} onPress={() => navigation.navigate('Assinatura')}>
        <Text style={styles.botaoSecundarioTexto}>Minha assinatura</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={logout}>
        <Text style={estilos.botaoTexto}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12 },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  linha: { fontSize: 16, textAlign: 'center', color: cores.textoSecundario, marginBottom: 8 },
  botaoSecundario: { height: 50, borderRadius: 8, borderWidth: 1, borderColor: cores.primaria, justifyContent: 'center', alignItems: 'center' },
  botaoSecundarioTexto: { color: cores.primaria, fontWeight: 'bold' },
  botaoSair: { marginTop: 24, height: 50, borderRadius: 8, backgroundColor: cores.perigo, justifyContent: 'center', alignItems: 'center' },
  sucesso: { color: cores.sucesso },
});
