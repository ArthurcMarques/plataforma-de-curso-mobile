import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CatalogoScreen from '../screens/CatalogoScreen';
import MeusCursosScreen from '../screens/MeusCursosScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

// Mapa: nome da aba -> ícone ativo (aba selecionada) e inativo (contorno).
const icones: Record<keyof TabParamList, { ativo: IconName; inativo: IconName }> = {
  'Catálogo': { ativo: 'book', inativo: 'book-outline' },
  'Meus Cursos': { ativo: 'school', inativo: 'school-outline' },
  'Notificações': { ativo: 'notifications', inativo: 'notifications-outline' },
  Perfil: { ativo: 'person', inativo: 'person-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icone = icones[route.name as keyof TabParamList];
          return <Ionicons name={focused ? icone.ativo : icone.inativo} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Meus Cursos" component={MeusCursosScreen} />
      <Tab.Screen name="Catálogo" component={CatalogoScreen} />
      <Tab.Screen name="Notificações" component={NotificacoesScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
