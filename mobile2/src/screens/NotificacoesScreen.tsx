import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useCarregamento } from '../hooks/useCarregamento';
import { listNotificacoes } from '../services/api';
import type { Notificacao } from '../services/types';
import { estilos } from '../theme';

export default function NotificacoesScreen() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const { loading, refreshing, error, recarregar } = useCarregamento(async () => {
    const resultado = await listNotificacoes();
    setNotificacoes([...resultado].sort((a, b) => b.DataEnvio.localeCompare(a.DataEnvio)));
  }, 'Não foi possível carregar as notificações.');

  if (loading) return <View style={estilos.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={estilos.center}><Text style={estilos.erro}>{error}</Text></View>;

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void recarregar()} />}
    >
      {notificacoes.length === 0 && <Text>Nenhuma notificação por aqui ainda.</Text>}
      {notificacoes.map(notificacao => (
        <View key={notificacao.ID_Notificacao} style={estilos.card}>
          <Text>{notificacao.Mensagem}</Text>
          <Text style={[estilos.meta, { fontSize: 12 }]}>{notificacao.DataEnvio.slice(0, 10)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
