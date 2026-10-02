// Preco e sempre centavos inteiros: somar 19,90 + 22,90 em ponto flutuante
// da 42.800000000000004, e somar 1990 + 2290 da 4280.
export function formatarPreco(centavos) {
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, '0');
  return `R$ ${reais.toLocaleString('pt-BR')},${resto}`;
}
