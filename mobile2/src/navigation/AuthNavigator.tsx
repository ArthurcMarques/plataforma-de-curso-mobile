import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type Props = { onLoggedIn: () => void };

export default function AuthNavigator({ onLoggedIn }: Props) {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => <LoginScreen {...props} onLoggedIn={onLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Registro" component={RegisterScreen} options={{ title: 'Cadastro' }} />
    </Stack.Navigator>
  );
}
