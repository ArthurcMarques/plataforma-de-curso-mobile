import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../auth/session';
import { createAvaliacao, deleteAvaliacao, listAvaliacoes, listCursos, listMatriculas, updateAvaliacao } from '../services/api';
import type { Avaliacao, Curso, Matricula } from '../services/types';

const notas = [1, 2, 3, 4, 5];

export default function AvaliacoesScreen() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [salvandoCurso, setSalvandoCurso] = useState<number | null>(null);
  const [rascunhos, setRascunhos] = useState<Record<number, { nota: number; comentario: string }>>({});

  async function carregar() {
    try {
      const [matriculasResult, cursosResult, avaliacoesResult] = await Promise.all([listMatriculas(), listCursos(), listAvaliacoes()]);
      setMatriculas(matriculasResult);
      setCursos(cursosResult);
      setAvaliacoes(avaliacoesResult);
      setRascunhos(current => {
        const atualizado = { ...current };
        for (const avaliacao of avaliacoesResult) {
          if (!atualizado[avaliacao.ID_Curso]) {
            atualizado[avaliacao.ID_Curso] = { nota: avaliacao.Nota, comentario: avaliacao.Comentario ?? '' };
          }
        }
        return atualizado;
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as avaliações.');
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

  function rascunho(idCurso: number) {
    return rascunhos[idCurso] ?? { nota: 5, comentario: '' };
  }

  function atualizarRascunho(idCurso: number, patch: Partial<{ nota: number; comentario: string }>) {
    setRascunhos(current => ({ ...current, [idCurso]: { ...rascunho(idCurso), ...patch } }));
  }

  async function salvar(idCurso: number, avaliacaoExistente: Avaliacao | undefined) {
    const { nota, comentario } = rascunho(idCurso);
    setSalvandoCurso(idCurso);
    try {
      if (avaliacaoExistente) {
        await updateAvaliacao(avaliacaoExistente.ID_Avaliacao, nota, comentario || undefined);
      } else {
        await createAvaliacao(user.userId, idCurso, nota, comentario || undefined);
      }
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a avaliação.');
    } finally {
      setSalvandoCurso(null);
    }
  }

  async function excluir(avaliacaoExistente: Avaliacao) {
    setSalvandoCurso(avaliacaoExistente.ID_Curso);
    try {
      await deleteAvaliacao(avaliacaoExistente.ID_Avaliacao);
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a avaliação.');
    } finally {
      setSalvandoCurso(null);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  const meusCursos = matriculas
    .map(matricula => cursos.find(curso => curso.ID_Curso === matricula.ID_Curso))
    .filter((curso): curso is Curso => curso != null);

  return (
    <ScrollView
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void recarregar()} />}
    >
      {error ? <Text style={styles.erro}>{error}</Text> : null}
      {meusCursos.length === 0 && <Text>Matricule-se em um curso para poder avaliá-lo.</Text>}
      {meusCursos.map(curso => {
        const avaliacaoExistente = avaliacoes.find(item => item.ID_Curso === curso.ID_Curso);
        const draft = rascunho(curso.ID_Curso);
        const salvando = salvandoCurso === curso.ID_Curso;
        return (
          <View key={curso.ID_Curso} style={styles.card}>
            <Text style={styles.titulo}>{curso.Titulo}</Text>
            <View style={styles.notas}>
              {notas.map(valor => (
                <TouchableOpacity
                  key={valor}
                  disabled={salvando}
                  style={[styles.nota, draft.nota === valor && styles.notaAtiva]}
                  onPress={() => atualizarRascunho(curso.ID_Curso, { nota: valor })}
                >
                  <Text style={[styles.notaTexto, draft.nota === valor && styles.notaTextoAtivo]}>{valor}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Comentário (opcional)"
              editable={!salvando}
              value={draft.comentario}
              onChangeText={texto => atualizarRascunho(curso.ID_Curso, { comentario: texto })}
              multiline
            />
            <View style={styles.botoes}>
              <TouchableOpacity style={styles.botao} disabled={salvando} onPress={() => void salvar(curso.ID_Curso, avaliacaoExistente)}>
                {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>{avaliacaoExistente ? 'Atualizar' : 'Avaliar'}</Text>}
              </TouchableOpacity>
              {avaliacaoExistente && (
                <TouchableOpacity style={styles.botaoExcluir} disabled={salvando} onPress={() => void excluir(avaliacaoExistente)}>
                  <Text style={styles.botaoTexto}>Excluir</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  conteudo: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', gap: 8 },
  titulo: { fontSize: 16, fontWeight: 'bold' },
  notas: { flexDirection: 'row', gap: 8 },
  nota: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#dfe6e9', justifyContent: 'center', alignItems: 'center' },
  notaAtiva: { backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' },
  notaTexto: { fontWeight: 'bold', color: '#2d3436' },
  notaTextoAtivo: { color: '#fff' },
  input: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9' },
  botoes: { flexDirection: 'row', gap: 8 },
  botao: { flex: 1, height: 44, borderRadius: 8, backgroundColor: '#6c5ce7', justifyContent: 'center', alignItems: 'center' },
  botaoExcluir: { height: 44, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#d63031', justifyContent: 'center', alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  erro: { color: '#d63031' },
});
