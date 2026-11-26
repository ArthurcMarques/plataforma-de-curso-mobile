import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSession } from '../auth/session';
import AssinaturaForm from '../components/AssinaturaForm';
import type { AppStackParamList } from '../navigation/types';
import { ApiError, createMatricula } from '../services/api';
import { estilos } from '../theme';

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

  if (matriculando) return <View style={estilos.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={estilos.center}><Text style={estilos.erro}>{error}</Text></View>;

  return (
    <View style={estilos.conteudo}>
      {aviso ? <Text style={estilos.aviso}>{aviso}</Text> : null}
      <AssinaturaForm onConcluido={() => navigation.navigate('Tabs', { screen: 'Meus Cursos' })} />
    </View>
  );
}
