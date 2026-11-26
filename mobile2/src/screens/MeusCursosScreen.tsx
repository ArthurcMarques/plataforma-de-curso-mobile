import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useCarregamento } from '../hooks/useCarregamento';
import type { AppStackParamList, TabParamList } from '../navigation/types';
import { listCursos, listMatriculas } from '../services/api';
import { cursosMatriculados } from '../services/selectors';
import type { Curso, Matricula } from '../services/types';
import { estilos } from '../theme';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Meus Cursos'>,
    NativeStackNavigationProp<AppStackParamList>
  >;
};

export default function MeusCursosScreen({ navigation }: Props) {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  const { loading, refreshing, error, recarregar } = useCarregamento(async () => {
    const [matriculasResult, cursosResult] = await Promise.all([listMatriculas(), listCursos()]);
    setMatriculas(matriculasResult);
    setCursos(cursosResult);
  }, 'Não foi possível carregar seus cursos.');

  if (loading) return <View style={estilos.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={estilos.center}><Text style={estilos.erro}>{error}</Text></View>;

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void recarregar()} />}
    >
      {matriculas.length === 0 && <Text>Você ainda não está matriculado em nenhum curso.</Text>}
      {cursosMatriculados(matriculas, cursos).map(curso => (
        <View key={curso.ID_Curso} style={estilos.card}>
          <Text style={estilos.cardTitulo}>{curso.Titulo}</Text>
          <Text style={estilos.meta}>{curso.Nivel} · {curso.TotalAulas} aulas</Text>
          <TouchableOpacity style={estilos.botao} onPress={() => navigation.navigate('CursoDetail', { idCurso: curso.ID_Curso })}>
            <Text style={estilos.botaoTexto}>Ver curso</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
