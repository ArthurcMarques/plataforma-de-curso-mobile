import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Registro: undefined;
};

export type TabParamList = {
  Catálogo: undefined;
  'Meus Cursos': undefined;
  'Avaliações': undefined;
  Notificações: undefined;
  Perfil: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  CursoDetail: { idCurso: number };
  Pagamento: { idCurso: number };
  Assinatura: undefined;
};
