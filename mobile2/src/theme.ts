import { StyleSheet } from 'react-native';

// Paleta e blocos de estilo repetidos em várias telas; cada tela ainda define o que for específico dela.
export const cores = {
  primaria: '#6c5ce7',
  perigo: '#d63031',
  sucesso: '#00b894',
  aviso: '#e17055',
  textoSecundario: '#636e72',
  borda: '#dfe6e9',
  branco: '#fff',
};

export const estilos = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  conteudo: { padding: 16, gap: 12 },
  secao: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: cores.borda, gap: 4 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold' },
  meta: { color: cores.textoSecundario },
  descricao: { color: cores.textoSecundario },
  input: { height: 50, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: cores.borda },
  botao: { height: 44, marginTop: 8, borderRadius: 8, backgroundColor: cores.primaria, justifyContent: 'center', alignItems: 'center' },
  botaoTexto: { color: cores.branco, fontWeight: 'bold' },
  erro: { color: cores.perigo },
  aviso: { color: cores.aviso },
});
