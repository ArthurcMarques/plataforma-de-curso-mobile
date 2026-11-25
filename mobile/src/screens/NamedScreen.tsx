import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList, TabParamList, TelaNome } from '../navigation/types';

// Composto porque a tela vive dentro do menu inferior (Tab), que por sua vez
// é uma tela da pilha principal (Stack); getParent() sobe até a pilha para o logout.
type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, TelaNome>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function NamedScreen({ navigation, route }: Props) {
  function sair() {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.replace('Login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{route.name}</Text>
      <TouchableOpacity style={styles.botaoSair} onPress={sair}>
        <Text style={styles.botaoTexto}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold' },
  botaoSair: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: '#d63031' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
});
