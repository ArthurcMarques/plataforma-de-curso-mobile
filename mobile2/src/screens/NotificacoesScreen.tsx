import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { listNotificacoes } from '../services/api';
import type { Notificacao } from '../services/types';

export default function NotificacoesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  async function carregar() {
    try {
      const result = await listNotificacoes();
      setNotificacoes([...result].sort((a, b) => b.DataEnvio.localeCompare(a.DataEnvio)));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as notificações.');
    }
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      carregar().finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, []),
  );

  async function recarregar() {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text style={styles.erro}>{error}</Text></View>;

  return (
    <ScrollView
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void recarregar()} />}
    >
      {notificacoes.length === 0 && <Text>Nenhuma notificação por aqui ainda.</Text>}
      {notificacoes.map(notificacao => (
        <View key={notificacao.ID_Notificacao} style={styles.card}>
          <Text>{notificacao.Mensagem}</Text>
          <Text style={styles.data}>{notificacao.DataEnvio.slice(0, 10)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  conteudo: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', gap: 4 },
  data: { color: '#636e72', fontSize: 12 },
  erro: { color: '#d63031' },
});
