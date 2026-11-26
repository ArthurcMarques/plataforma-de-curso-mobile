import type { Curso, Matricula } from './types';

// Cursos em que o usuário está matriculado, na forma de Curso completo (não só o vínculo da matrícula).
export function cursosMatriculados(matriculas: Matricula[], cursos: Curso[]): Curso[] {
  return matriculas
    .map(matricula => cursos.find(curso => curso.ID_Curso === matricula.ID_Curso))
    .filter((curso): curso is Curso => curso != null);
}
