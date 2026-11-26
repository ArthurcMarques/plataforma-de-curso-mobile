import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import AssinaturaForm from '../components/AssinaturaForm';
import { listAssinaturas, listPagamentos, listPlanos } from '../services/api';
import type { Assinatura, Pagamento, Plano } from '../services/types';

export default function AssinaturaScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);

  async function carregar() {
    try {
      const [assinaturasResult, pagamentosResult, planosResult] = await Promise.all([listAssinaturas(), listPagamentos(), listPlanos()]);
      setAssinaturas(assinaturasResult);
      setPagamentos(pagamentosResult);
      setPlanos(planosResult);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar sua assinatura.');
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
      <Text style={styles.secao}>Minhas assinaturas</Text>
      {assinaturas.length === 0 && <Text>Nenhuma assinatura ainda.</Text>}
      {assinaturas.map(assinatura => {
        const plano = planos.find(item => item.ID_Plano === assinatura.ID_Plano);
        const pagamentosDaAssinatura = pagamentos.filter(item => item.ID_Assinatura === assinatura.ID_Assinatura);
        return (
          <View key={assinatura.ID_Assinatura} style={styles.card}>
            <Text style={styles.cardTitulo}>{plano?.Nome ?? 'Plano'}</Text>
            <Text style={styles.meta}>{assinatura.DataInicio.slice(0, 10)} até {assinatura.DataFim.slice(0, 10)}</Text>
            {pagamentosDaAssinatura.map(pagamento => (
              <Text key={pagamento.ID_Pagamento} style={styles.meta}>
                R$ {pagamento.ValorPago} · {pagamento.MetodoPagamento} · {pagamento.DataPagamento.slice(0, 10)}
              </Text>
            ))}
          </View>
        );
      })}

      <Text style={styles.secao}>Assinar um novo plano</Text>
      <AssinaturaForm onConcluido={() => void recarregar()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  conteudo: { padding: 16, gap: 12 },
  secao: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', gap: 4 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold' },
  meta: { color: '#636e72' },
  erro: { color: '#d63031' },
});
