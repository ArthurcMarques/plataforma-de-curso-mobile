import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppStackParamList, TabParamList } from '../navigation/types';
import { listCursos, listMatriculas } from '../services/api';
import type { Curso, Matricula } from '../services/types';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Meus Cursos'>,
    NativeStackNavigationProp<AppStackParamList>
  >;
};

export default function MeusCursosScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  async function carregar() {
    try {
      const [matriculasResult, cursosResult] = await Promise.all([listMatriculas(), listCursos()]);
      setMatriculas(matriculasResult);
      setCursos(cursosResult);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar seus cursos.');
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

  const meusCursos = matriculas
    .map(matricula => cursos.find(curso => curso.ID_Curso === matricula.ID_Curso))
    .filter((curso): curso is Curso => curso != null);

  return (
    <ScrollView
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void recarregar()} />}
    >
      {meusCursos.length === 0 && <Text>Você ainda não está matriculado em nenhum curso.</Text>}
      {meusCursos.map(curso => (
        <View key={curso.ID_Curso} style={styles.card}>
          <Text style={styles.titulo}>{curso.Titulo}</Text>
          <Text style={styles.meta}>{curso.Nivel} · {curso.TotalAulas} aulas</Text>
          <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('CursoDetail', { idCurso: curso.ID_Curso })}>
            <Text style={styles.botaoTexto}>Ver curso</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  conteudo: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', gap: 4 },
  titulo: { fontSize: 16, fontWeight: 'bold' },
  meta: { color: '#636e72' },
  botao: { marginTop: 8, height: 44, borderRadius: 8, backgroundColor: '#6c5ce7', justifyContent: 'center', alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  erro: { color: '#d63031' },
});
