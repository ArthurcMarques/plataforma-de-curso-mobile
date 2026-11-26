import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSession } from '../auth/session';
import { createAssinatura, createPagamento, listPlanos } from '../services/api';
import type { MetodoPagamento, Plano } from '../services/types';
import { estilos } from '../theme';
import { addMonths } from '../utils/dates';

// `planos` é opcional: quem já tiver a lista carregada (AssinaturaScreen) evita um fetch duplicado;
// sem ela (PagamentoScreen), o componente busca sozinho.
type Props = { onConcluido: () => void; planos?: Plano[] };

const metodos: MetodoPagamento[] = ['PIX', 'CARTAO', 'BOLETO'];

// Fluxo de assinar um plano e pagar; reaproveitado pela matrícula (PagamentoScreen) e pela
// assinatura avulsa (AssinaturaScreen) — a única diferença entre as duas é o que acontece antes/depois.
export default function AssinaturaForm({ onConcluido, planos: planosVindosDoPai }: Props) {
  const { user } = useSession();
  const [busy, setBusy] = useState(!planosVindosDoPai);
  const [error, setError] = useState('');
  const [planos, setPlanos] = useState<Plano[]>(planosVindosDoPai ?? []);
  const [assinatura, setAssinatura] = useState<{ id: number; plano: Plano } | null>(null);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    if (!planosVindosDoPai) void run('Não foi possível carregar os planos.', async () => setPlanos(await listPlanos()));
  }, []);

  async function run(mensagemPadrao: string, acao: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await acao();
    } catch (err) {
      setError(err instanceof Error ? err.message : mensagemPadrao);
    } finally {
      setBusy(false);
    }
  }

  function escolherPlano(plano: Plano) {
    return run('Não foi possível criar a assinatura.', async () => {
      const dataInicio = new Date().toISOString();
      const dataFim = addMonths(dataInicio, plano.DuracaoMeses);
      const criada = await createAssinatura(user.userId, plano.ID_Plano, dataInicio, dataFim);
      setAssinatura({ id: criada.ID_Assinatura, plano });
    });
  }

  function pagar(metodo: MetodoPagamento) {
    if (!assinatura) return Promise.resolve();
    return run('Não foi possível registrar o pagamento.', async () => {
      const idTransacaoGateway = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await createPagamento(assinatura.id, Number(assinatura.plano.Preco), new Date().toISOString(), metodo, idTransacaoGateway);
      setConcluido(true);
    });
  }

  if (concluido) {
    return (
      <View style={[estilos.center, { gap: 16, padding: 16 }]}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Pagamento confirmado!</Text>
        <TouchableOpacity style={estilos.botao} onPress={onConcluido}>
          <Text style={estilos.botaoTexto}>Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {error ? <Text style={estilos.erro}>{error}</Text> : null}
      {busy && <ActivityIndicator size="large" />}

      {!busy && !assinatura && (
        <>
          <Text style={estilos.secao}>Escolha um plano</Text>
          {planos.map(plano => (
            <View key={plano.ID_Plano} style={estilos.card}>
              <Text style={estilos.cardTitulo}>{plano.Nome}</Text>
              {plano.Descricao ? <Text style={estilos.descricao}>{plano.Descricao}</Text> : null}
              <Text style={estilos.meta}>R$ {plano.Preco} · {plano.DuracaoMeses} meses</Text>
              <TouchableOpacity style={estilos.botao} onPress={() => void escolherPlano(plano)}>
                <Text style={estilos.botaoTexto}>Escolher</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {!busy && assinatura && (
        <>
          <Text style={estilos.secao}>Forma de pagamento</Text>
          <Text style={estilos.meta}>{assinatura.plano.Nome} · R$ {assinatura.plano.Preco}</Text>
          {metodos.map(metodo => (
            <TouchableOpacity key={metodo} style={estilos.botao} onPress={() => void pagar(metodo)}>
              <Text style={estilos.botaoTexto}>{metodo}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
}
