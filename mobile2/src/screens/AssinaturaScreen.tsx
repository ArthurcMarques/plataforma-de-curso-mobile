import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import AssinaturaForm from '../components/AssinaturaForm';
import { useCarregamento } from '../hooks/useCarregamento';
import { listAssinaturas, listPagamentos, listPlanos } from '../services/api';
import type { Assinatura, Pagamento, Plano } from '../services/types';
import { estilos } from '../theme';

export default function AssinaturaScreen() {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);

  const { loading, refreshing, error, recarregar } = useCarregamento(async () => {
    const [assinaturasResult, pagamentosResult, planosResult] = await Promise.all([listAssinaturas(), listPagamentos(), listPlanos()]);
    setAssinaturas(assinaturasResult);
    setPagamentos(pagamentosResult);
    setPlanos(planosResult);
  }, 'Não foi possível carregar sua assinatura.');

  if (loading) return <View style={estilos.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={estilos.center}><Text style={estilos.erro}>{error}</Text></View>;

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void recarregar()} />}
    >
      <Text style={estilos.secao}>Minhas assinaturas</Text>
      {assinaturas.length === 0 && <Text>Nenhuma assinatura ainda.</Text>}
      {assinaturas.map(assinatura => {
        const plano = planos.find(item => item.ID_Plano === assinatura.ID_Plano);
        const pagamentosDaAssinatura = pagamentos.filter(item => item.ID_Assinatura === assinatura.ID_Assinatura);
        return (
          <View key={assinatura.ID_Assinatura} style={estilos.card}>
            <Text style={estilos.cardTitulo}>{plano?.Nome ?? 'Plano'}</Text>
            <Text style={estilos.meta}>{assinatura.DataInicio.slice(0, 10)} até {assinatura.DataFim.slice(0, 10)}</Text>
            {pagamentosDaAssinatura.map(pagamento => (
              <Text key={pagamento.ID_Pagamento} style={estilos.meta}>
                R$ {pagamento.ValorPago} · {pagamento.MetodoPagamento} · {pagamento.DataPagamento.slice(0, 10)}
              </Text>
            ))}
          </View>
        );
      })}

      <Text style={estilos.secao}>Assinar um novo plano</Text>
      <AssinaturaForm planos={planos} onConcluido={() => void recarregar()} />
    </ScrollView>
  );
}
