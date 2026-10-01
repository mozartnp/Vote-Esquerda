// Entrada: amarra os eventos e da a partida. Avalia por ultimo, quando
// base, catalogo e colinha ja terminaram, entao aqui todo binding importado
// ja esta no lugar.

import { btnAbrir, btnFechar, btnLimpar, btnMais, btnZerar, grade, input, painel }
  from './base.js';
import { abrirGaveta, aplicar, fecharGaveta, limparTudo, mostrando, renderMais }
  from './catalogo.js';
import { iniciarColinha } from './colinha.js';

iniciarColinha();

var t;
input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(aplicar, 120); });
btnLimpar.addEventListener('click', function () { input.value = ''; aplicar(); input.focus(); });
btnZerar.addEventListener('click', limparTudo);
btnMais.addEventListener('click', function () {
  var primeiroNovo = mostrando;
  renderMais();
  var novo = grade.children[primeiroNovo];
  if (novo) { var a = novo.querySelector('a'); if (a) a.focus({ preventScroll: true }); }
});

btnAbrir.addEventListener('click', abrirGaveta);
btnFechar.addEventListener('click', fecharGaveta);
document.addEventListener('keydown', function (ev) {
  if (ev.key === 'Escape' && painel.classList.contains('aberto')) fecharGaveta();
});
