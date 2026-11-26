import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCarregamento } from '../hooks/useCarregamento';
import type { AppStackParamList } from '../navigation/types';
import { listAulas, listCursos, listModulos } from '../services/api';
import type { Aula, Curso, Modulo } from '../services/types';
import { cores, estilos } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'CursoDetail'>;

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
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);

  const { loading, refreshing, error, recarregar } = useCarregamento(async () => {
    const [cursos, modulosResult, aulasResult] = await Promise.all([listCursos(), listModulos(), listAulas()]);
    setCurso(cursos.find(item => item.ID_Curso === idCurso) ?? null);
    setModulos(modulosResult.filter(item => item.ID_Curso === idCurso).sort((a, b) => a.Ordem - b.Ordem));
    setAulas(aulasResult);
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: 'bold' },
  aula: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8, gap: 2 },
  link: { color: cores.primaria, fontWeight: 'bold' },
});
