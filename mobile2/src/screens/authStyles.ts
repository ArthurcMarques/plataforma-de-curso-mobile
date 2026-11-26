import { StyleSheet } from 'react-native';
import { cores } from '../theme';

// Compartilhado por LoginScreen e RegisterScreen, que têm o mesmo layout de formulário.
export const authStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  erro: { color: cores.perigo },
  input: { height: 50, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: cores.borda },
  botao: { height: 50, marginTop: 8, borderRadius: 8, backgroundColor: cores.primaria, justifyContent: 'center', alignItems: 'center' },
  botaoTexto: { color: cores.branco, fontWeight: 'bold' },
  link: { color: cores.primaria, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
});
