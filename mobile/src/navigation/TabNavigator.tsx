import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NamedScreen from '../screens/NamedScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Menu de navegação inferior: trocar de aba não empilha telas, diferente do Stack.
export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Cursos" component={NamedScreen} />
      <Tab.Screen name="Matrículas" component={NamedScreen} />
      <Tab.Screen name="Perfil" component={NamedScreen} />
    </Tab.Navigator>
  );
}
