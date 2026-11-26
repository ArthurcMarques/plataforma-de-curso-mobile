import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCarregamento } from '../hooks/useCarregamento';
import type { AppStackParamList, TabParamList } from '../navigation/types';
import { listCursos, listMatriculas, listTrilhaCursos, listTrilhas } from '../services/api';
import type { Curso, Matricula, Trilha, TrilhaCurso } from '../services/types';
import { estilos } from '../theme';

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
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [trilhaCursos, setTrilhaCursos] = useState<TrilhaCurso[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);

  const { loading, refreshing, error, recarregar } = useCarregamento(async () => {
    const [trilhasResult, trilhaCursosResult, cursosResult, matriculasResult] =
      await Promise.all([listTrilhas(), listTrilhaCursos(), listCursos(), listMatriculas()]);
    setTrilhas(trilhasResult);
    setTrilhaCursos(trilhaCursosResult);
    setCursos(cursosResult);
    setMatriculas(matriculasResult);
  }, 'Não foi possível carregar o catálogo.');

  // Monta os mapas uma vez por carregamento em vez de cruzar as listas inteiras a cada trilha renderizada.
  const { cursoPorId, cursosPorTrilha } = useMemo(() => {
    const cursoPorId = new Map(cursos.map(curso => [curso.ID_Curso, curso]));
    const porTrilha = new Map<number, TrilhaCurso[]>();
    for (const item of trilhaCursos) {
      const grupo = porTrilha.get(item.ID_Trilha) ?? [];
      grupo.push(item);
      porTrilha.set(item.ID_Trilha, grupo);
    }
    for (const grupo of porTrilha.values()) grupo.sort((a, b) => a.Ordem - b.Ordem);
    return { cursoPorId, cursosPorTrilha: porTrilha };
  }, [cursos, trilhaCursos]);

  if (loading) return <View style={estilos.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={estilos.center}><Text style={estilos.erro}>{error}</Text></View>;

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
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
          <View key={curso.ID_Curso} style={[estilos.card, { borderLeftWidth: 4, borderLeftColor: corCursos }]}>
            <Text style={estilos.cardTitulo}>{curso.Titulo}</Text>
            {curso.Descricao ? <Text style={estilos.descricao}>{curso.Descricao}</Text> : null}
            <Text style={estilos.meta}>{curso.Nivel} · {curso.TotalAulas} aulas · {curso.TotalHoras}h</Text>
            {matriculado && <Text style={[styles.badge, { color: corCursos }]}>Matriculado</Text>}
            <TouchableOpacity
              style={[estilos.botao, { backgroundColor: corCursos }]}
              onPress={() => navigation.navigate(matriculado ? 'CursoDetail' : 'Pagamento', { idCurso: curso.ID_Curso })}
            >
              <Text style={estilos.botaoTexto}>{matriculado ? 'Ver curso' : 'Matricular-me'}</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={[styles.secaoHeader, { backgroundColor: corTrilhas, marginTop: 24 }]}>
        <Ionicons name="trail-sign" size={18} color="#fff" />
        <Text style={styles.secaoTitulo}>Trilhas</Text>
      </View>
      {trilhas.length === 0 && <Text>Nenhuma trilha cadastrada.</Text>}
      {trilhas.map(trilha => {
        const cursosDaTrilha = (cursosPorTrilha.get(trilha.ID_Trilha) ?? [])
          .map(item => cursoPorId.get(item.ID_Curso))
          .filter((curso): curso is Curso => curso != null);
        return (
          <View key={trilha.ID_Trilha} style={[estilos.card, { borderLeftWidth: 4, borderLeftColor: corTrilhas }]}>
            <Text style={estilos.cardTitulo}>{trilha.Titulo}</Text>
            {trilha.Descricao ? <Text style={estilos.descricao}>{trilha.Descricao}</Text> : null}
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
  secaoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  item: { marginLeft: 8 },
  badge: { fontWeight: 'bold' },
});
