import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CursoDetailScreen from '../screens/CursoDetailScreen';
import PagamentoScreen from '../screens/PagamentoScreen';
import TabNavigator from './TabNavigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="CursoDetail" component={CursoDetailScreen} options={{ title: 'Curso' }} />
      <Stack.Screen name="Pagamento" component={PagamentoScreen} options={{ title: 'Matrícula e pagamento' }} />
    </Stack.Navigator>
  );
}
