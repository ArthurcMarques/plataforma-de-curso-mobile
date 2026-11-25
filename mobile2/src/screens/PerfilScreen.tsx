import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { profileNames, useSession } from '../auth/session';

// Único lugar que mostra dados reais da sessão (vindos de /auth/me) e faz logout.
export default function PerfilScreen() {
  const { user, logout } = useSession();
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Perfil</Text>
      <Text style={styles.linha}>{user.name}</Text>
      <Text style={styles.linha}>{user.email}</Text>
      <Text style={styles.linha}>{profileNames[user.perfil]}</Text>
      <TouchableOpacity style={styles.botaoSair} onPress={logout}>
        <Text style={styles.botaoTexto}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  linha: { fontSize: 16 },
  botaoSair: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: '#d63031' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
});
