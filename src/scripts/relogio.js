// Relogio do topo, em horario de Brasilia. O HTML ja traz "--:--:--", entao
// quem abre sem JavaScript ve um mostrador parado e nao um buraco.
const alvos = document.querySelectorAll('[data-relogio]');

if (alvos.length > 0) {
  const formato = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    timeZone: 'America/Sao_Paulo',
  });
  const tic = () => {
    const agora = formato.format(new Date());
    for (const alvo of alvos) alvo.textContent = agora;
  };
  tic();
  setInterval(tic, 1000);
}
