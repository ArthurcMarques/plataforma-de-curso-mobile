import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      {/* Principal é o menu de abas (navegação aninhada) */}
      <Stack.Screen name="Principal" component={TabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
