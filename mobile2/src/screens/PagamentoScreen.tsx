import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSession } from '../auth/session';
import type { AppStackParamList } from '../navigation/types';
import { ApiError, createAssinatura, createMatricula, createPagamento, listPlanos } from '../services/api';
import type { MetodoPagamento, Plano } from '../services/types';
import { addMonths } from '../utils/dates';

type Props = NativeStackScreenProps<AppStackParamList, 'Pagamento'>;

const metodos: MetodoPagamento[] = ['PIX', 'CARTAO', 'BOLETO'];

export default function PagamentoScreen({ route, navigation }: Props) {
  const { idCurso } = route.params;
  const { user } = useSession();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [matriculaFeita, setMatriculaFeita] = useState(false);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [planoEscolhido, setPlanoEscolhido] = useState<Plano | null>(null);
  const [assinaturaId, setAssinaturaId] = useState<number | null>(null);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    void iniciar();
  }, []);

  async function iniciar() {
    setBusy(true);
    setError('');
    try {
      await createMatricula(user.userId, idCurso);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAviso('Você já estava matriculado neste curso.');
      } else {
        setError(err instanceof Error ? err.message : 'Não foi possível confirmar a matrícula.');
        setBusy(false);
        return;
      }
    }
    setMatriculaFeita(true);
    try {
      setPlanos(await listPlanos());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os planos.');
    } finally {
      setBusy(false);
    }
  }

  async function escolherPlano(plano: Plano) {
    setBusy(true);
    setError('');
    try {
      const dataInicio = new Date().toISOString();
      const dataFim = addMonths(dataInicio, plano.DuracaoMeses);
      const assinatura = await createAssinatura(user.userId, plano.ID_Plano, dataInicio, dataFim);
      setPlanoEscolhido(plano);
      setAssinaturaId(assinatura.ID_Assinatura);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a assinatura.');
    } finally {
      setBusy(false);
    }
  }

  async function pagar(metodo: MetodoPagamento) {
    if (!assinaturaId || !planoEscolhido) return;
    setBusy(true);
    setError('');
    try {
      const idTransacaoGateway = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await createPagamento(assinaturaId, Number(planoEscolhido.Preco), new Date().toISOString(), metodo, idTransacaoGateway);
      setConcluido(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível registrar o pagamento.');
    } finally {
      setBusy(false);
    }
  }

  if (concluido) {
    return (
      <View style={styles.center}>
        <Text style={styles.titulo}>Pagamento confirmado!</Text>
        <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('Tabs', { screen: 'Meus Cursos' })}>
          <Text style={styles.botaoTexto}>Ir para Meus Cursos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}
      {error ? <Text style={styles.erro}>{error}</Text> : null}
      {busy && <ActivityIndicator size="large" />}

      {!busy && matriculaFeita && !assinaturaId && (
        <>
          <Text style={styles.secao}>Escolha um plano</Text>
          {planos.map(plano => (
            <View key={plano.ID_Plano} style={styles.card}>
              <Text style={styles.cardTitulo}>{plano.Nome}</Text>
              {plano.Descricao ? <Text style={styles.descricao}>{plano.Descricao}</Text> : null}
              <Text style={styles.meta}>R$ {plano.Preco} · {plano.DuracaoMeses} meses</Text>
              <TouchableOpacity style={styles.botao} onPress={() => void escolherPlano(plano)}>
                <Text style={styles.botaoTexto}>Escolher</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {!busy && assinaturaId && planoEscolhido && (
        <>
          <Text style={styles.secao}>Forma de pagamento</Text>
          <Text style={styles.meta}>{planoEscolhido.Nome} · R$ {planoEscolhido.Preco}</Text>
          {metodos.map(metodo => (
            <TouchableOpacity key={metodo} style={styles.botao} onPress={() => void pagar(metodo)}>
              <Text style={styles.botaoTexto}>{metodo}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  secao: { fontSize: 18, fontWeight: 'bold' },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', gap: 4 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold' },
  descricao: { color: '#636e72' },
  meta: { color: '#636e72' },
  botao: { marginTop: 8, height: 44, borderRadius: 8, backgroundColor: '#6c5ce7', justifyContent: 'center', alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  erro: { color: '#d63031' },
  aviso: { color: '#e17055' },
});
