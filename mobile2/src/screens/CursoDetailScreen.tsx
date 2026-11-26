import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../auth/session';
import { useCarregamento } from '../hooks/useCarregamento';
import type { AppStackParamList } from '../navigation/types';
import { createAvaliacao, deleteAvaliacao, listAulas, listAvaliacoes, listCursos, listModulos, updateAvaliacao } from '../services/api';
import type { Aula, Avaliacao, Curso, Modulo } from '../services/types';
import { cores, estilos } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'CursoDetail'>;

const notas = [1, 2, 3, 4, 5];

// Aceita apenas links HTTP/HTTPS para os conteúdos cadastrados, descartando outros protocolos.
function contentUrl(value: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export default function CursoDetailScreen({ route }: Props) {
  const { idCurso } = route.params;
  const { user } = useSession();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);

  const { loading, refreshing, error, recarregar } = useCarregamento(async () => {
    const [cursos, modulosResult, aulasResult, avaliacoesResult] =
      await Promise.all([listCursos(), listModulos(), listAulas(), listAvaliacoes()]);
    setCurso(cursos.find(item => item.ID_Curso === idCurso) ?? null);
    setModulos(modulosResult.filter(item => item.ID_Curso === idCurso).sort((a, b) => a.Ordem - b.Ordem));
    setAulas(aulasResult);
    setAvaliacoes(avaliacoesResult);
  }, 'Não foi possível carregar o curso.', [idCurso]);

  // Agrupa uma vez por módulo em vez de filtrar a lista inteira de aulas a cada módulo renderizado.
  const aulasPorModulo = useMemo(() => {
    const mapa = new Map<number, Aula[]>();
    for (const aula of aulas) {
      const grupo = mapa.get(aula.ID_Modulo) ?? [];
      grupo.push(aula);
      mapa.set(aula.ID_Modulo, grupo);
    }
    for (const grupo of mapa.values()) grupo.sort((a, b) => a.Ordem - b.Ordem);
    return mapa;
  }, [aulas]);

  const avaliacaoExistente = avaliacoes.find(item => item.ID_Curso === idCurso);
  const [draftNota, setDraftNota] = useState<number | null>(null);
  const [draftComentario, setDraftComentario] = useState<string | null>(null);
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState('');
  const nota = draftNota ?? avaliacaoExistente?.Nota ?? 5;
  const comentario = draftComentario ?? avaliacaoExistente?.Comentario ?? '';

  async function salvarAvaliacao() {
    setSalvandoAvaliacao(true);
    setErroAvaliacao('');
    try {
      const salva = avaliacaoExistente
        ? await updateAvaliacao(avaliacaoExistente.ID_Avaliacao, nota, comentario || undefined)
        : await createAvaliacao(user.userId, idCurso, nota, comentario || undefined);
      setAvaliacoes(current => [...current.filter(item => item.ID_Curso !== idCurso), salva]);
      setDraftNota(null);
      setDraftComentario(null);
    } catch (err) {
      setErroAvaliacao(err instanceof Error ? err.message : 'Não foi possível salvar a avaliação.');
    } finally {
      setSalvandoAvaliacao(false);
    }
  }

  async function excluirAvaliacao() {
    if (!avaliacaoExistente) return;
    setSalvandoAvaliacao(true);
    setErroAvaliacao('');
    try {
      await deleteAvaliacao(avaliacaoExistente.ID_Avaliacao);
      setAvaliacoes(current => current.filter(item => item.ID_Avaliacao !== avaliacaoExistente.ID_Avaliacao));
      setDraftNota(null);
      setDraftComentario(null);
    } catch (err) {
      setErroAvaliacao(err instanceof Error ? err.message : 'Não foi possível excluir a avaliação.');
    } finally {
      setSalvandoAvaliacao(false);
    }
  }

  if (loading) return <View style={estilos.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={estilos.center}><Text style={estilos.erro}>{error}</Text></View>;

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void recarregar()} />}
    >
      <Text style={styles.titulo}>{curso?.Titulo}</Text>
      {curso?.Descricao ? <Text style={estilos.descricao}>{curso.Descricao}</Text> : null}
      {modulos.length === 0 && <Text>Nenhum módulo disponível.</Text>}
      {modulos.map(modulo => (
        <View key={modulo.ID_Modulo} style={estilos.card}>
          <Text style={estilos.cardTitulo}>{modulo.Ordem}. {modulo.Titulo}</Text>
          {(aulasPorModulo.get(modulo.ID_Modulo) ?? []).map(aula => {
            const url = contentUrl(aula.URL_Conteudo);
            return (
              <View key={aula.ID_Aula} style={styles.aula}>
                <Text>{aula.Titulo}</Text>
                <Text style={estilos.meta}>{aula.TipoConteudo} · {aula.DuracaoMinutos ?? '-'} min</Text>
                {url && (
                  <TouchableOpacity onPress={() => void Linking.openURL(url)}>
                    <Text style={styles.link}>Abrir conteúdo</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      ))}

      <Text style={estilos.secao}>Sua avaliação</Text>
      {erroAvaliacao ? <Text style={estilos.erro}>{erroAvaliacao}</Text> : null}
      <View style={estilos.card}>
        <View style={styles.notas}>
          {notas.map(valor => (
            <TouchableOpacity
              key={valor}
              disabled={salvandoAvaliacao}
              style={[styles.nota, nota === valor && styles.notaAtiva]}
              onPress={() => setDraftNota(valor)}
            >
              <Text style={[styles.notaTexto, nota === valor && styles.notaTextoAtivo]}>{valor}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={estilos.input}
          placeholder="Comentário (opcional)"
          editable={!salvandoAvaliacao}
          value={comentario}
          onChangeText={setDraftComentario}
          multiline
        />
        <View style={styles.botoes}>
          <TouchableOpacity style={[estilos.botao, styles.botaoFlex]} disabled={salvandoAvaliacao} onPress={() => void salvarAvaliacao()}>
            {salvandoAvaliacao ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botaoTexto}>{avaliacaoExistente ? 'Atualizar' : 'Avaliar'}</Text>}
          </TouchableOpacity>
          {avaliacaoExistente && (
            <TouchableOpacity style={styles.botaoExcluir} disabled={salvandoAvaliacao} onPress={() => void excluirAvaliacao()}>
              <Text style={estilos.botaoTexto}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: 'bold' },
  aula: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8, gap: 2 },
  link: { color: cores.primaria, fontWeight: 'bold' },
  notas: { flexDirection: 'row', gap: 8 },
  nota: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: cores.borda, justifyContent: 'center', alignItems: 'center' },
  notaAtiva: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  notaTexto: { fontWeight: 'bold', color: '#2d3436' },
  notaTextoAtivo: { color: '#fff' },
  botoes: { flexDirection: 'row', gap: 8, marginTop: 8 },
  botaoFlex: { flex: 1, marginTop: 0 },
  botaoExcluir: { height: 44, paddingHorizontal: 16, borderRadius: 8, backgroundColor: cores.perigo, justifyContent: 'center', alignItems: 'center' },
});
