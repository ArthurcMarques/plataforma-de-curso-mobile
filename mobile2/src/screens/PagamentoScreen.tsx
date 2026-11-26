import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../auth/session';
import AssinaturaForm from '../components/AssinaturaForm';
import type { AppStackParamList } from '../navigation/types';
import { ApiError, createMatricula } from '../services/api';

type Props = NativeStackScreenProps<AppStackParamList, 'Pagamento'>;

export default function PagamentoScreen({ route, navigation }: Props) {
  const { idCurso } = route.params;
  const { user } = useSession();
  const [matriculando, setMatriculando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    void matricular();
  }, []);

  async function matricular() {
    try {
      await createMatricula(user.userId, idCurso);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAviso('Você já estava matriculado neste curso.');
      } else {
        setError(err instanceof Error ? err.message : 'Não foi possível confirmar a matrícula.');
      }
    } finally {
      setMatriculando(false);
    }
  }

  if (matriculando) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text style={styles.erro}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}
      <AssinaturaForm onConcluido={() => navigation.navigate('Tabs', { screen: 'Meus Cursos' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  erro: { color: '#d63031' },
  aviso: { color: '#e17055' },
});
