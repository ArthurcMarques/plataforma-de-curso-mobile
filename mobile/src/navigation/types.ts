export type TelaNome = 'Cursos' | 'Matrículas' | 'Perfil';

export type RootStackParamList = {
  Login: undefined;
  Principal: undefined;
};

export type TabParamList = Record<TelaNome, undefined>;
