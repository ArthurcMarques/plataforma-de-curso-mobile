import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

// Carrega dados toda vez que a tela ganha foco e expõe um recarregar() para o pull-to-refresh.
// `carregar` deve ele mesmo atualizar o(s) estado(s) da tela; aqui só controlam loading/refreshing/error.
export function useCarregamento(carregar: () => Promise<void>, mensagemErro: string, deps: unknown[] = []) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const executar = useCallback(async () => {
    try {
      await carregar();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : mensagemErro);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      executar().finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [executar]),
  );

  async function recarregar() {
    setRefreshing(true);
    await executar();
    setRefreshing(false);
  }

  return { loading, refreshing, error, recarregar };
}
