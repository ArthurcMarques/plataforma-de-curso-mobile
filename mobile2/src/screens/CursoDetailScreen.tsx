import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppStackParamList } from '../navigation/types';
import { listAulas, listCursos, listModulos } from '../services/api';
import type { Aula, Curso, Modulo } from '../services/types';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);

  async function carregar() {
    try {
      const [cursos, modulosResult, aulasResult] = await Promise.all([listCursos(), listModulos(), listAulas()]);
      setCurso(cursos.find(item => item.ID_Curso === idCurso) ?? null);
      setModulos(modulosResult.filter(item => item.ID_Curso === idCurso).sort((a, b) => a.Ordem - b.Ordem));
      setAulas(aulasResult);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o curso.');
    }
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      carregar().finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [idCurso]),
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
      <Text style={styles.titulo}>{curso?.Titulo}</Text>
      {curso?.Descricao ? <Text style={styles.descricao}>{curso.Descricao}</Text> : null}
      {modulos.length === 0 && <Text>Nenhum módulo disponível.</Text>}
      {modulos.map(modulo => (
        <View key={modulo.ID_Modulo} style={styles.card}>
          <Text style={styles.moduloTitulo}>{modulo.Ordem}. {modulo.Titulo}</Text>
          {aulas
            .filter(aula => aula.ID_Modulo === modulo.ID_Modulo)
            .sort((a, b) => a.Ordem - b.Ordem)
            .map(aula => {
              const url = contentUrl(aula.URL_Conteudo);
              return (
                <View key={aula.ID_Aula} style={styles.aula}>
                  <Text>{aula.Titulo}</Text>
                  <Text style={styles.meta}>{aula.TipoConteudo} · {aula.DuracaoMinutos ?? '-'} min</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  conteudo: { padding: 16, gap: 12 },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  descricao: { color: '#636e72' },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', gap: 8 },
  moduloTitulo: { fontSize: 16, fontWeight: 'bold' },
  aula: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8, gap: 2 },
  meta: { color: '#636e72' },
  link: { color: '#6c5ce7', fontWeight: 'bold' },
  erro: { color: '#d63031' },
});
