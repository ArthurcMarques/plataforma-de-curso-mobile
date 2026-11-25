import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Login</Text>
      <TouchableOpacity style={styles.botao} onPress={() => navigation.replace('Principal')}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold' },
  botao: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: '#6c5ce7' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
});
