import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../auth/session';
import { useCarregamento } from '../hooks/useCarregamento';
import { createAvaliacao, deleteAvaliacao, listAvaliacoes, listCursos, listMatriculas, updateAvaliacao } from '../services/api';
import { cursosMatriculados } from '../services/selectors';
import type { Avaliacao, Curso, Matricula } from '../services/types';
import { cores, estilos } from '../theme';

const notas = [1, 2, 3, 4, 5];

export default function AvaliacoesScreen() {
  const { user } = useSession();
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [salvandoCurso, setSalvandoCurso] = useState<number | null>(null);
  // Só guarda o que o usuário editou nesta sessão; sem entrada aqui, o padrão vem da avaliação já salva.
  const [rascunhos, setRascunhos] = useState<Record<number, { nota: number; comentario: string }>>({});

  const { loading, refreshing, error: erroCarregamento, recarregar } = useCarregamento(async () => {
    const [matriculasResult, cursosResult, avaliacoesResult] = await Promise.all([listMatriculas(), listCursos(), listAvaliacoes()]);
    setMatriculas(matriculasResult);
    setCursos(cursosResult);
    setAvaliacoes(avaliacoesResult);
  }, 'Não foi possível carregar as avaliações.');

  const [erroSalvar, setErroSalvar] = useState('');
  const error = erroCarregamento || erroSalvar;

  function rascunho(idCurso: number, existente: Avaliacao | undefined) {
    return rascunhos[idCurso] ?? { nota: existente?.Nota ?? 5, comentario: existente?.Comentario ?? '' };
  }

  function atualizarRascunho(idCurso: number, existente: Avaliacao | undefined, patch: Partial<{ nota: number; comentario: string }>) {
    setRascunhos(current => ({ ...current, [idCurso]: { ...rascunho(idCurso, existente), ...patch } }));
  }

  async function salvar(idCurso: number, avaliacaoExistente: Avaliacao | undefined) {
    const { nota, comentario } = rascunho(idCurso, avaliacaoExistente);
    setSalvandoCurso(idCurso);
    setErroSalvar('');
    try {
      const salva = avaliacaoExistente
        ? await updateAvaliacao(avaliacaoExistente.ID_Avaliacao, nota, comentario || undefined)
        : await createAvaliacao(user.userId, idCurso, nota, comentario || undefined);
      setAvaliacoes(current => [...current.filter(item => item.ID_Curso !== idCurso), salva]);
    } catch (err) {
      setErroSalvar(err instanceof Error ? err.message : 'Não foi possível salvar a avaliação.');
    } finally {
      setSalvandoCurso(null);
    }
  }

  async function excluir(avaliacaoExistente: Avaliacao) {
    setSalvandoCurso(avaliacaoExistente.ID_Curso);
    setErroSalvar('');
    try {
      await deleteAvaliacao(avaliacaoExistente.ID_Avaliacao);
      setAvaliacoes(current => current.filter(item => item.ID_Avaliacao !== avaliacaoExistente.ID_Avaliacao));
    } catch (err) {
      setErroSalvar(err instanceof Error ? err.message : 'Não foi possível excluir a avaliação.');
    } finally {
      setSalvandoCurso(null);
    }
  }

  if (loading) return <View style={estilos.center}><ActivityIndicator size="large" /></View>;

  const meusCursos = cursosMatriculados(matriculas, cursos);

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void recarregar()} />}
    >
      {error ? <Text style={estilos.erro}>{error}</Text> : null}
      {meusCursos.length === 0 && <Text>Matricule-se em um curso para poder avaliá-lo.</Text>}
      {meusCursos.map(curso => {
        const avaliacaoExistente = avaliacoes.find(item => item.ID_Curso === curso.ID_Curso);
        const draft = rascunho(curso.ID_Curso, avaliacaoExistente);
        const salvando = salvandoCurso === curso.ID_Curso;
        return (
          <View key={curso.ID_Curso} style={estilos.card}>
            <Text style={estilos.cardTitulo}>{curso.Titulo}</Text>
            <View style={styles.notas}>
              {notas.map(valor => (
                <TouchableOpacity
                  key={valor}
                  disabled={salvando}
                  style={[styles.nota, draft.nota === valor && styles.notaAtiva]}
                  onPress={() => atualizarRascunho(curso.ID_Curso, avaliacaoExistente, { nota: valor })}
                >
                  <Text style={[styles.notaTexto, draft.nota === valor && styles.notaTextoAtivo]}>{valor}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={estilos.input}
              placeholder="Comentário (opcional)"
              editable={!salvando}
              value={draft.comentario}
              onChangeText={texto => atualizarRascunho(curso.ID_Curso, avaliacaoExistente, { comentario: texto })}
              multiline
            />
            <View style={styles.botoes}>
              <TouchableOpacity style={[estilos.botao, styles.botaoFlex]} disabled={salvando} onPress={() => void salvar(curso.ID_Curso, avaliacaoExistente)}>
                {salvando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botaoTexto}>{avaliacaoExistente ? 'Atualizar' : 'Avaliar'}</Text>}
              </TouchableOpacity>
              {avaliacaoExistente && (
                <TouchableOpacity style={styles.botaoExcluir} disabled={salvando} onPress={() => void excluir(avaliacaoExistente)}>
                  <Text style={estilos.botaoTexto}>Excluir</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = {
  notas: { flexDirection: 'row' as const, gap: 8 },
  nota: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: cores.borda, justifyContent: 'center' as const, alignItems: 'center' as const },
  notaAtiva: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  notaTexto: { fontWeight: 'bold' as const, color: '#2d3436' },
  notaTextoAtivo: { color: '#fff' },
  botoes: { flexDirection: 'row' as const, gap: 8 },
  botaoFlex: { flex: 1, marginTop: 0 },
  botaoExcluir: { height: 44, paddingHorizontal: 16, borderRadius: 8, backgroundColor: cores.perigo, justifyContent: 'center' as const, alignItems: 'center' as const },
};
