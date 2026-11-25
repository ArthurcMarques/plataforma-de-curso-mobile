import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppStackParamList, TabParamList } from '../navigation/types';
import { listCursos, listMatriculas, listTrilhaCursos, listTrilhas } from '../services/api';
import type { Curso, Matricula, Trilha, TrilhaCurso } from '../services/types';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Catálogo'>,
    NativeStackNavigationProp<AppStackParamList>
  >;
};

// Cada seção tem sua própria cor de destaque para ficar claro, ao rolar a tela, em qual seção se está.
const corCursos = '#00b894';
const corTrilhas = '#6c5ce7';

export default function CatalogoScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [trilhaCursos, setTrilhaCursos] = useState<TrilhaCurso[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);

  async function carregar() {
    try {
      const [trilhasResult, trilhaCursosResult, cursosResult, matriculasResult] =
        await Promise.all([listTrilhas(), listTrilhaCursos(), listCursos(), listMatriculas()]);
      setTrilhas(trilhasResult);
      setTrilhaCursos(trilhaCursosResult);
      setCursos(cursosResult);
      setMatriculas(matriculasResult);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o catálogo.');
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
      <View style={[styles.secaoHeader, { backgroundColor: corCursos }]}>
        <Ionicons name="book" size={18} color="#fff" />
        <Text style={styles.secaoTitulo}>Cursos</Text>
      </View>
      {cursos.length === 0 && <Text>Nenhum curso disponível.</Text>}
      {cursos.map(curso => {
        const matriculado = matriculas.some(item => item.ID_Curso === curso.ID_Curso);
        return (
          <View key={curso.ID_Curso} style={[styles.card, { borderLeftColor: corCursos }]}>
            <Text style={styles.titulo}>{curso.Titulo}</Text>
            {curso.Descricao ? <Text style={styles.descricao}>{curso.Descricao}</Text> : null}
            <Text style={styles.meta}>{curso.Nivel} · {curso.TotalAulas} aulas · {curso.TotalHoras}h</Text>
            {matriculado ? (
              <>
                <Text style={[styles.badge, { color: corCursos }]}>Matriculado</Text>
                <TouchableOpacity style={[styles.botao, { backgroundColor: corCursos }]} onPress={() => navigation.navigate('CursoDetail', { idCurso: curso.ID_Curso })}>
                  <Text style={styles.botaoTexto}>Ver curso</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.botao, { backgroundColor: corCursos }]} onPress={() => navigation.navigate('Pagamento', { idCurso: curso.ID_Curso })}>
                <Text style={styles.botaoTexto}>Matricular-me</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      <View style={[styles.secaoHeader, { backgroundColor: corTrilhas, marginTop: 24 }]}>
        <Ionicons name="trail-sign" size={18} color="#fff" />
        <Text style={styles.secaoTitulo}>Trilhas</Text>
      </View>
      {trilhas.length === 0 && <Text>Nenhuma trilha cadastrada.</Text>}
      {trilhas.map(trilha => {
        const cursosDaTrilha = trilhaCursos
          .filter(item => item.ID_Trilha === trilha.ID_Trilha)
          .sort((a, b) => a.Ordem - b.Ordem)
          .map(item => cursos.find(curso => curso.ID_Curso === item.ID_Curso))
          .filter((curso): curso is Curso => curso != null);
        return (
          <View key={trilha.ID_Trilha} style={[styles.card, { borderLeftColor: corTrilhas }]}>
            <Text style={styles.titulo}>{trilha.Titulo}</Text>
            {trilha.Descricao ? <Text style={styles.descricao}>{trilha.Descricao}</Text> : null}
            {cursosDaTrilha.map((curso, index) => (
              <Text key={curso.ID_Curso} style={styles.item}>{index + 1}. {curso.Titulo}</Text>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  conteudo: { padding: 16, gap: 12 },
  secaoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', borderLeftWidth: 4, gap: 4 },
  titulo: { fontSize: 16, fontWeight: 'bold' },
  descricao: { color: '#636e72' },
  meta: { color: '#636e72' },
  item: { marginLeft: 8 },
  badge: { fontWeight: 'bold' },
  botao: { marginTop: 8, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  erro: { color: '#d63031' },
});
