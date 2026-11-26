import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Mostra o alerta mesmo com o app aberto em primeiro plano (padrão do Expo é não mostrar).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Sem EXPO_PUBLIC_EAS_PROJECT_ID configurado (depende de uma conta Expo/EAS), o app segue funcionando
// normalmente só sem notificação push real — a notificação continua disponível na aba Notificações.
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? Constants.expoConfig?.extra?.eas?.projectId;
  console.log('[push] projectId:', projectId);
  if (!projectId) return undefined;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', { name: 'default', importance: Notifications.AndroidImportance.DEFAULT });
    }
    const permissao = await Notifications.getPermissionsAsync();
    console.log('[push] permissao atual:', permissao.status);
    let status = permissao.status;
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
      console.log('[push] permissao apos pedir:', status);
    }
    if (status !== 'granted') return undefined;

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[push] token obtido:', token.data);
    return token.data;
  } catch (error) {
    console.log('[push] falhou:', error instanceof Error ? error.message : error);
    return undefined;
  }
}
