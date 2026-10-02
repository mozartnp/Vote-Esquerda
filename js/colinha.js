// A colinha: as seis vagas, persistencia no localStorage, busca dentro da
// vaga, as perguntas, o santinho impresso e a imagem em canvas.
//
// O boot fica em iniciarColinha(), chamado pelo principal.js, nao no corpo
// deste modulo. Se rodasse aqui, o ciclo com o catalogo.js poderia avaliar
// este arquivo primeiro e pintarColinha() leria porChave ainda indefinido —
// TypeError para quem tem colinha salva.

import { $, UFS, el, norm, painel } from './base.js';
import { SO_DIGITOS, fecharGaveta, porCargo, porChave, todos } from './catalogo.js';

// ---- Colinha ----
// Seis vagas: a cedula inteira de uma eleicao geral. Senado tem duas porque e
// o que se vota em 2026. A ordem e a da urna, que e a ordem em que a colinha
// vai ser lida na hora de votar.
// `digitos` e o tamanho do numero de urna do cargo. Vale para toda candidatura
// da lista, sem excecao, e e o que desenha as caixas vazias de quem ainda nao
// escolheu: a pessoa imprime e preenche a mao.
// A ordem e a da urna: e nela que a pessoa vai ler a colinha, de cima para
// baixo, enquanto digita. Deputado federal primeiro, presidente por ultimo.
var VAGAS = [
  {id:'federal',    cat:3, label:'Dep. Federal',  digitos:4},
  {id:'estadual',   cat:4, label:'Dep. Estadual', digitos:5},
  {id:'senador1',   cat:2, label:'Senador 1',     digitos:3},
  {id:'senador2',   cat:2, label:'Senador 2',     digitos:3},
  {id:'governador', cat:1, label:'Governador',    digitos:2},
  {id:'presidente', cat:0, label:'Presidente',    digitos:2}
];
var GUARDA = 'vote-esquerda-colinha';
var SITE = 'voteesquerda.com.br';
// colinha[vaga.id] = chave do candidato. Vaga ausente quer dizer vaga livre.
var colinha = {};
// A foto vai no impresso e na imagem? Ligada por padrao: com o retrato do lado
// do numero da para conferir de relance que a colinha esta certa, e quem leva
// impresso costuma mostrar para alguem. Quem imprime em preto e branco ou quer
// poupar tinta desliga no interruptor — e a escolha fica guardada.
var FOTO_PADRAO = true;
var comFoto = FOTO_PADRAO;
// Botoes "Adicionar na colinha" que estao na tela agora. A grade e esvaziada a
// cada filtro, entao a lista tambem (ver aplicar).
export var botoes = [];

var colinhaEl = $('colinha'), colinhaRotulo = $('colinhaRotulo'), colinhaUf = $('colinhaUf'),
    colinhaVagas = $('colinhaVagas'), colinhaRecado = $('colinhaRecado'), colinhaAviso = $('colinhaAviso'),
    btnColLimpar = $('colLimpar'), chaveFoto = $('colFoto'), impressao = $('impressao'),
    modalFundo = $('modalFundo'), modalCaixa = $('modalCaixa'), modalTitulo = $('modalTitulo'),
    modalTexto = $('modalTexto'), modalAcoes = $('modalAcoes');

// O `sq` do TSE identifica a candidatura e e unico em toda a lista. A reserva
// existe porque o JSON e editado a mao e o campo pode faltar num bloco novo;
// numero + estado + cargo tambem distingue, porque numero de urna nao repete
// dentro do mesmo cargo no mesmo estado.
export function chaveCand(c) { return c.sq || (c.numero + '-' + c.uf + '-' + c.cat); }
function nomeUF(uf) { return UFS[uf] || uf; }
function candDaVaga(v) { var k = colinha[v.id]; return (k && porChave[k]) || null; }
function nColinha() {
  var n = 0;
  VAGAS.forEach(function (v) { if (candDaVaga(v)) n++; });
  return n;
}
export function vagasDoCargo(cat) {
  return VAGAS.filter(function (v) { return v.cat === cat; });
}
function vagaDe(c) {
  var k = chaveCand(c);
  for (var i = 0; i < VAGAS.length; i++) if (colinha[VAGAS[i].id] === k) return VAGAS[i];
  return null;
}
// O estado da colinha e o do primeiro candidato estadual que entrou. Presidencia
// nao conta: a candidatura e nacional e vem com uf 'BR'.
function ufColinha() {
  for (var i = 0; i < VAGAS.length; i++) {
    if (VAGAS[i].cat === 0) continue;
    var c = candDaVaga(VAGAS[i]);
    if (c) return c.uf;
  }
  return '';
}
// No DF a quinta vaga e de deputado distrital. Com a vaga vazia, quem decide e
// o estado que a colinha ja tem.
function distrital(c) { return c ? /distrital/i.test(c.cargo) : ufColinha() === 'DF'; }
function rotuloVaga(v, c) { return v.cat === 4 && distrital(c) ? 'Dep. Distrital' : v.label; }
function vazios(n) { var a = []; while (n-- > 0) a.push(''); return a; }

// ---- Persistencia ----
// Guarda so a chave, nunca a candidatura inteira: se uma candidatura sair da
// lista (registro cassado, por exemplo), a vaga esvazia sozinha em vez de a
// colinha continuar mostrando quem nao concorre mais. Tudo em try/catch porque
// em aba privada o localStorage existe mas estoura ao gravar — sem persistencia
// a pagina tem que continuar inteira.
function lerColinha() {
  var o = {};
  try {
    var bruto = localStorage.getItem(GUARDA);
    if (!bruto) return o;
    var d = JSON.parse(bruto);
    comFoto = !!(d && d.foto);
    if (d && d.vagas) VAGAS.forEach(function (v) {
      if (typeof d.vagas[v.id] === 'string' && d.vagas[v.id]) o[v.id] = d.vagas[v.id];
    });
  } catch (e) { return {}; }
  return o;
}
function gravarColinha() {
  try {
    // Colinha vazia apaga a chave em vez de guardar um objeto vazio: quem limpa
    // a colinha nao deixa rastro nenhum no navegador. Mas so quando a foto esta
    // no padrao: se o visitante mexeu no interruptor, a chave segura a escolha —
    // senao limpar a colinha com a foto desligada a religaria no proximo reload.
    if (!nColinha() && comFoto === FOTO_PADRAO) localStorage.removeItem(GUARDA);
    else localStorage.setItem(GUARDA, JSON.stringify({ v: 1, foto: comFoto, vagas: colinha }));
  } catch (e) {}
}
// Confere o que veio do localStorage contra a lista que acabou de carregar. O
// conteudo e editavel pelo visitante, entao nada aqui pode ser pressuposto: cada
// vaga precisa ter candidatura existente, do cargo certo, sem repetir pessoa e
// toda do mesmo estado.
export function conferirColinha() {
  var mudou = false, uf = '';
  VAGAS.forEach(function (v) {
    var k = colinha[v.id];
    if (!k) return;
    var c = porChave[k], ok = !!c && c.cat === v.cat;
    if (ok && v.id === 'senador2' && colinha.senador1 === k) ok = false;
    if (ok && v.cat !== 0) { if (!uf) uf = c.uf; else if (c.uf !== uf) ok = false; }
    if (!ok) { delete colinha[v.id]; mudou = true; }
  });
  if (mudou) gravarColinha();
}

// ---- Numero em caixinhas ----
// Um digito por caixa, como na urna e no santinho de rua: e assim que o numero e
// conferido na hora de votar, digito a digito. As caixas ficam escondidas do
// leitor de tela e o numero inteiro vai num texto so, senao sai digito a digito.
function preencherCaixinha(caixa, numero) {
  caixa.textContent = '';
  caixa.appendChild(el('span', 'sr-only', 'número ' + numero));
  String(numero).split('').forEach(function (d) {
    var b = el('b', null, d);
    b.setAttribute('aria-hidden', 'true');
    caixa.appendChild(b);
  });
}
function caixinhaNum(numero, cls) {
  var caixa = el('span', cls);
  preencherCaixinha(caixa, numero);
  return caixa;
}
// Vaga sem candidato no impresso: as caixas saem em branco, no tamanho do
// numero daquele cargo, para preencher a mao depois de imprimir.
function caixinhaBranco(n, cls) {
  var caixa = el('span', cls);
  caixa.setAttribute('aria-hidden', 'true');
  vazios(n).forEach(function () { caixa.appendChild(el('b', 'branco')); });
  return caixa;
}

// ---- Busca dentro da vaga ----
// Quem ja sabe em quem vai votar monta a colinha aqui mesmo, digitando o nome
// ou o numero, sem ter de achar o card na lista. Mesmo padrao de combobox do
// seletor de povo indigena (WAI-ARIA), e a mesma regra de numero da busca do
// topo: digito casa por prefixo, porque o numero de urna e hierarquico.
var LIMITE_VAGA = 8;
var EM_BRANCO = 'Você também pode deixar em branco para preencher à mão depois, clicando aqui';
var vagasUI = null;

// O que cabe nesta vaga: o cargo certo, o estado da colinha (a presidencia nao
// tem estado) e quem ainda nao esta em vaga nenhuma.
function opcoesVaga(v, q) {
  var uf = ufColinha(), pool = porCargo[v.cat] || [], achados = [], digitos = SO_DIGITOS.test(q);
  for (var i = 0; i < pool.length; i++) {
    var c = pool[i];
    if (v.cat !== 0 && uf && c.uf !== uf) continue;
    if (vagaDe(c)) continue;
    if (q && (digitos ? c.numero.indexOf(q) !== 0 : c.busca.indexOf(q) < 0)) continue;
    achados.push(c);
  }
  return achados;
}

function montarVagaBusca(v) {
  var caixa = el('div', 'vaga-busca');
  var campo = document.createElement('input');
  campo.type = 'text';
  campo.id = 'vaga-' + v.id;
  campo.autocomplete = 'off';
  campo.placeholder = 'Nome ou número';
  campo.setAttribute('role', 'combobox');
  campo.setAttribute('aria-expanded', 'false');
  campo.setAttribute('aria-controls', 'lista-vaga-' + v.id);
  campo.setAttribute('aria-autocomplete', 'list');
  var lista = document.createElement('ul');
  lista.className = 'vaga-lista';
  lista.id = 'lista-vaga-' + v.id;
  lista.setAttribute('role', 'listbox');
  lista.hidden = true;
  caixa.appendChild(campo);
  caixa.appendChild(lista);

  var b = { v: v, caixa: caixa, input: campo, lista: lista, itens: [], ativo: -1 };
  campo.addEventListener('focus', function () { pintarVagaLista(b); });
  campo.addEventListener('input', function () { b.ativo = -1; pintarVagaLista(b); });
  // Sem o atraso, o blur fecha a lista antes de o clique no item chegar.
  campo.addEventListener('blur', function () { setTimeout(function () { fecharVagaBusca(b); }, 160); });
  campo.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      // Com a lista fechada, a seta abre e ja marca a primeira (ou a ultima):
      // sem isso seriam duas teclas para chegar na primeira entrada.
      if (!b.itens.length) {
        pintarVagaLista(b);
        if (!b.itens.length) return;
        b.ativo = ev.key === 'ArrowDown' ? 0 : b.itens.length - 1;
        return pintarVagaLista(b);
      }
      b.ativo = (b.ativo + (ev.key === 'ArrowDown' ? 1 : b.itens.length - 1)) % b.itens.length;
      pintarVagaLista(b);
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      // Com uma candidatura so, Enter escolhe sem precisar descer a seta: e o
      // caminho de quem digitou o numero inteiro. O 2 conta a entrada de
      // deixar em branco, que vem sempre na frente.
      var k = b.ativo >= 0 ? b.ativo : (b.itens.length === 2 ? 1 : -1);
      if (k >= 0) escolherEntrada(b, b.itens[k]);
    } else if (ev.key === 'Escape') {   // 1o Esc limpa o que foi digitado, 2o fecha
      ev.stopPropagation();
      if (campo.value) { campo.value = ''; b.ativo = -1; pintarVagaLista(b); }
      else fecharVagaBusca(b);
    }
  });
  return b;
}

function fecharVagaBusca(b) {
  b.lista.hidden = true;
  b.lista.textContent = '';
  b.itens = [];
  b.ativo = -1;
  b.input.setAttribute('aria-expanded', 'false');
  b.input.removeAttribute('aria-activedescendant');
}

function pintarVagaLista(b) {
  // So uma lista aberta por vez. Depender do blur para fechar a anterior nao
  // basta: no celular ele nem sempre chega antes do toque na vaga seguinte, e
  // duas listas abertas se sobrepoem na tela.
  if (vagasUI) vagasUI.forEach(function (u) { if (u.busca !== b) fecharVagaBusca(u.busca); });
  var q = norm(b.input.value), achados = opcoesVaga(b.v, q);
  var mostra = achados.slice(0, LIMITE_VAGA);
  // Deixar em branco e sempre a primeira entrada: quem nao escolheu ninguem
  // para este cargo segue para o proximo sem precisar fechar a lista.
  b.itens = [{ branco: true }];
  mostra.forEach(function (c) { b.itens.push({ c: c }); });
  if (b.ativo >= b.itens.length) b.ativo = -1;
  b.lista.textContent = '';
  b.lista.hidden = false;
  b.input.setAttribute('aria-expanded', 'true');

  b.itens.forEach(function (item, k) {
    var li = el('li');
    li.id = 'vo-' + b.v.id + '-' + k;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', k === b.ativo ? 'true' : 'false');
    li.className = (item.branco ? 'vo-branco ' : '') + (k === b.ativo ? 'ativa' : '');
    li.addEventListener('mousedown', function (ev) { ev.preventDefault(); });  // nao rouba o foco
    li.addEventListener('click', function () { escolherEntrada(b, item); });

    if (item.branco) {
      li.appendChild(el('span', null, EM_BRANCO));
      b.lista.appendChild(li);
      return;
    }
    var c = item.c;
    var nome = el('span', 'vo-nome');
    if (c.dest) {
      var est = el('span', 'vo-rec', '★ ');
      est.setAttribute('aria-hidden', 'true');
      nome.appendChild(est);
      nome.appendChild(el('span', 'sr-only', 'Recomendação do site: '));
    }
    nome.appendChild(document.createTextNode(c.nome));
    li.appendChild(nome);

    // O nome completo entra na linha de baixo porque a busca tambem procura
    // nele: sem isso, digitar "silva" devolve gente cujo nome de urna nao tem
    // "silva" nenhum, e o resultado parece aleatorio.
    var partes = [];
    if (c.completo && norm(c.completo) !== norm(c.nome)) partes.push(c.completo);
    partes.push(c.partido);
    if (c.uf && c.uf !== 'BR') partes.push(c.uf);
    li.appendChild(el('span', 'vo-meta', partes.join(' · ')));
    // Registro indeferido avisa aqui tambem: o card avisa, e quem escolhe pela
    // vaga nao passa pelo card. Em linha propria, que nao corta no reticente.
    if (c.indef) li.appendChild(el('span', 'vo-aviso', 'Registro indeferido'));
    li.appendChild(el('b', 'vo-num', c.numero));
    b.lista.appendChild(li);
  });

  if (!mostra.length) {
    // Em conexao lenta da para abrir a colinha antes de a lista chegar. Dizer
    // "nenhuma candidatura" ali seria mentira: ainda nao se sabe.
    var nada = el('li', 'vaga-nada', !todos.length
      ? 'Carregando as candidaturas…'
      : q ? 'Nenhuma candidatura para “' + b.input.value + '” nesta vaga.'
          : 'Nenhuma candidatura disponível para esta vaga.');
    nada.setAttribute('role', 'presentation');
    b.lista.appendChild(nada);
  } else if (achados.length > mostra.length) {
    var mais = el('li', 'vaga-mais',
      'Mostrando ' + mostra.length + ' de ' + achados.length + ' — digite o nome ou o número.');
    mais.setAttribute('role', 'presentation');
    b.lista.appendChild(mais);
  }
  if (b.ativo >= 0) b.input.setAttribute('aria-activedescendant', 'vo-' + b.v.id + '-' + b.ativo);
  else b.input.removeAttribute('aria-activedescendant');
}

function escolherEntrada(b, item) {
  if (!item) return;
  if (item.branco) return deixarEmBranco(b);
  escolherNaVaga(b, item.c);
}
// Nao mexe no estado: a vaga ja esta vazia. Serve para seguir para o proximo
// cargo sem ter de fechar a lista na mao.
function deixarEmBranco(b) {
  b.input.value = '';
  fecharVagaBusca(b);
  focarProximaVaga(b.v);
  colinhaAviso.textContent = rotuloVaga(b.v, null) +
    ' ficou em branco, para preencher à mão depois de imprimir.';
}
function escolherNaVaga(b, c) {
  b.input.value = '';
  fecharVagaBusca(b);
  por(b.v, c);
  focarProximaVaga(b.v);
}

// Depois de escolher, o foco cai na proxima vaga ainda vazia: da para montar a
// colinha inteira sem tirar a mao do teclado. Sem vaga adiante, vai para o
// botao de tirar da vaga recem-preenchida — o campo onde o foco estava acabou
// de sumir, e foco perdido no corpo da pagina atrapalha quem usa leitor.
function focarProximaVaga(apos) {
  if (!vagasUI) return;
  var i = 0, k;
  for (; i < vagasUI.length; i++) if (vagasUI[i].v === apos) break;
  for (k = i + 1; k < vagasUI.length; k++) {
    if (candDaVaga(vagasUI[k].v)) continue;
    // Abre a lista da proxima vaga em vez de contar com o evento de foco: o
    // encadeamento fica explicito, e quem chegou ali ja ve o que pode escolher.
    foco(vagasUI[k].busca.input);
    return pintarVagaLista(vagasUI[k].busca);
  }
  // Sem vaga adiante, o foco vai para o botao de tirar da vaga que acabou de
  // ser preenchida. Se ela ficou em branco esse botao esta escondido, e o foco
  // fica onde esta — o campo da propria vaga continua ali.
  if (vagasUI[i] && candDaVaga(vagasUI[i].v)) foco(vagasUI[i].x);
}
function foco(e) {
  if (!e) return;
  try { e.focus({ preventScroll: true }); } catch (err) { e.focus(); }
}

// As seis linhas sao criadas uma vez e depois so atualizadas. Recriar a cada
// mudanca tiraria o foco e o texto de quem estivesse digitando numa delas.
function montarVagas() {
  colinhaVagas.textContent = '';
  vagasUI = VAGAS.map(function (v) {
    var li = el('li', 'vaga');
    var cargo = el('span', 'vaga-cargo');
    var nome = el('span', 'vaga-nome');
    var num = el('span', 'num-caixa vaga-num');
    var x = el('button', 'vaga-x', '×');
    x.type = 'button';
    x.title = 'Tirar da colinha';
    var busca = montarVagaBusca(v);
    var u = { v: v, li: li, cargo: cargo, nome: nome, num: num, x: x, busca: busca, c: null };
    x.addEventListener('click', function () { if (u.c) remover(v, u.c); });
    li.appendChild(cargo); li.appendChild(nome); li.appendChild(num);
    li.appendChild(x); li.appendChild(busca.caixa);
    colinhaVagas.appendChild(li);
    return u;
  });
}

// ---- Pintar ----
function avisar(texto) {
  colinhaRecado.textContent = texto || '';
  colinhaRecado.hidden = !texto;
  colinhaAviso.textContent = texto || '';
}
export function pintarColinha() {
  var n = nColinha(), uf = ufColinha();
  colinhaRotulo.textContent = n ? 'Minha colinha ' + n + '/' + VAGAS.length : 'Quero minha colinha';

  // A faixa so aparece quando ha estado definido: sem candidatura estadual na
  // colinha ela nao tem o que dizer, e a observacao ** ja explica a regra.
  colinhaUf.textContent = '';
  colinhaUf.hidden = !uf;
  if (uf) {
    colinhaUf.appendChild(document.createTextNode('Colinha de '));
    colinhaUf.appendChild(el('b', null, nomeUF(uf)));
    colinhaUf.appendChild(document.createTextNode(' — Governador, Senador e deputados são do mesmo estado.'));
  }

  if (!vagasUI) montarVagas();
  vagasUI.forEach(function (u) {
    var c = candDaVaga(u.v);
    u.c = c;
    u.cargo.textContent = rotuloVaga(u.v, c);
    u.li.className = 'vaga' + (c ? '' : ' livre');
    if (c) {
      u.nome.textContent = c.nome;
      preencherCaixinha(u.num, c.numero);
      u.x.setAttribute('aria-label', 'Tirar ' + c.nome + ' da vaga de ' + rotuloVaga(u.v, c));
    }
    u.busca.input.setAttribute('aria-label',
      'Buscar candidatura para a vaga de ' + rotuloVaga(u.v, null) + ', por nome ou número');
    // A lista aberta de uma vaga que acabou de ser preenchida (ou cujo estado
    // mudou) nao serve mais. A que esta sob o cursor se repinta com o recorte novo.
    if (document.activeElement === u.busca.input && !c) pintarVagaLista(u.busca);
    else { u.busca.input.value = ''; fecharVagaBusca(u.busca); }
  });

  btnColLimpar.disabled = !n;
  botoes.forEach(pintarBotao);
}

function pintarBotao(r) {
  var dentro = !!vagaDe(r.c);
  r.b.className = 'btn-colinha' + (dentro ? ' dentro' : '');
  r.b.textContent = dentro ? '✓ Na minha colinha' : 'Adicionar na colinha';
  r.b.setAttribute('aria-pressed', dentro ? 'true' : 'false');
  // Doze cards na tela: sem o nome no rotulo acessivel sao doze botoes iguais.
  r.b.setAttribute('aria-label', (dentro ? 'Tirar ' : 'Adicionar ') + r.c.nome +
    (dentro ? ' da minha colinha' : ' na minha colinha'));
  if (dentro) r.b.title = 'Tirar da colinha'; else r.b.removeAttribute('title');
}
export function botaoColinha(c) {
  var caixa = el('div', 'acao-colinha');
  var b = el('button', 'btn-colinha');
  b.type = 'button';
  var r = { b: b, c: c };
  b.addEventListener('click', function () { adicionar(c); });
  botoes.push(r);
  pintarBotao(r);
  caixa.appendChild(b);
  return caixa;
}

// ---- Montar a colinha ----
function por(v, c) {
  colinha[v.id] = chaveCand(c);
  gravarColinha();
  pintarColinha();
  avisar('');
  colinhaAviso.textContent = c.nome + ' entrou na colinha como ' + rotuloVaga(v, c) +
    '. ' + nColinha() + ' de ' + VAGAS.length + ' vagas preenchidas.';
}
function remover(v, c) {
  delete colinha[v.id];
  gravarColinha();
  pintarColinha();
  avisar('');
  colinhaAviso.textContent = (c ? c.nome + ' saiu da colinha. ' : '') +
    nColinha() + ' de ' + VAGAS.length + ' vagas preenchidas.';
}
function adicionar(c) {
  var vagas = vagasDoCargo(c.cat);
  if (!vagas.length) return;
  // Ja esta na colinha: o mesmo botao tira.
  var atual = vagaDe(c);
  if (atual) return remover(atual, c);
  // Um estado so. Presidencia passa direto: a candidatura e nacional.
  var uf = ufColinha();
  if (c.cat !== 0 && uf && c.uf !== uf) return avisarEstado(c, uf);
  for (var i = 0; i < vagas.length; i++) if (!candDaVaga(vagas[i])) return por(vagas[i], c);
  perguntarTroca(c, vagas);
}

// ---- Perguntas ----
var focoAntes = null;   // para onde o foco volta quando a pergunta fecha

function abrirModal(titulo, montar, acoes) {
  modalTitulo.textContent = titulo;
  modalTexto.textContent = '';
  montar(modalTexto);
  modalAcoes.textContent = '';
  acoes.forEach(function (a) {
    var b = el('button', a.cls || null, a.label);
    b.type = 'button';
    b.addEventListener('click', function () { fecharModal(); if (a.fn) a.fn(); });
    modalAcoes.appendChild(b);
  });
  focoAntes = document.activeElement;
  modalFundo.hidden = false;
  document.body.style.overflow = 'hidden';
  var primeiro = modalAcoes.querySelector('button');
  if (primeiro) primeiro.focus();
}
function fecharModal() {
  if (modalFundo.hidden) return;
  modalFundo.hidden = true;
  // A gaveta de filtros do celular tambem trava a rolagem: so devolve se ela
  // estiver fechada, senao o fundo volta a rolar atras da gaveta.
  document.body.style.overflow = painel.classList.contains('aberto') ? 'hidden' : '';
  if (focoAntes && focoAntes.focus) focoAntes.focus();
  focoAntes = null;
}
function perguntarTroca(c, vagas) {
  var muitas = vagas.length > 1;
  abrirModal('Cargo já preenchido', function (box) {
    if (!muitas) {
      var a = candDaVaga(vagas[0]);
      var p = el('p');
      p.appendChild(document.createTextNode('Cargo já preenchido, por '));
      p.appendChild(el('b', null, a.nome + ' — ' + a.numero));
      p.appendChild(document.createTextNode(', deseja trocar por '));
      p.appendChild(el('b', null, c.nome + ' — ' + c.numero));
      p.appendChild(document.createTextNode('?'));
      box.appendChild(p);
      return;
    }
    box.appendChild(el('p', null, 'Cargo já preenchido pelos candidatos:'));
    var ul = el('ul', 'modal-lista');
    vagas.forEach(function (v) {
      var a = candDaVaga(v);
      var li = el('li');
      li.appendChild(el('span', null, rotuloVaga(v, a) + ':'));
      li.appendChild(el('b', null, a.nome + ' — ' + a.numero));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    var p2 = el('p');
    p2.appendChild(document.createTextNode('Deseja trocar algum deles por '));
    p2.appendChild(el('b', null, c.nome + ' — ' + c.numero));
    p2.appendChild(document.createTextNode('?'));
    box.appendChild(p2);
  }, [{ label: 'Cancelar' }].concat(vagas.map(function (v) {
    return {
      label: muitas ? 'Trocar ' + rotuloVaga(v, candDaVaga(v)) : 'Trocar',
      cls: 'principal',
      fn: function () { por(v, c); }
    };
  })));
}

function avisarEstado(c, uf) {
  abrirModal('Candidato de outro estado', function (box) {
    var n = 0;
    VAGAS.forEach(function (v) { if (v.cat !== 0 && candDaVaga(v)) n++; });
    box.appendChild(el('p', null, 'Sua colinha é de um estado só, e já tem ' +
      (n === 1 ? 'uma candidatura' : n + ' candidaturas') + ' de ' + nomeUF(uf) + '. ' +
      c.nome + ' concorre em ' + nomeUF(c.uf) + '.'));
    box.appendChild(el('p', null, 'Para montar a colinha com ' + c.nome + ' — ' + c.numero +
      ', tire antes da colinha:'));
    var ul = el('ul', 'modal-lista');
    VAGAS.forEach(function (v) {
      var a = candDaVaga(v);
      if (!a || v.cat === 0) return;
      var li = el('li');
      li.appendChild(el('span', null, rotuloVaga(v, a) + ':'));
      li.appendChild(el('b', null, a.nome + ' — ' + a.numero + ' · ' + a.uf));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    box.appendChild(el('p', null, 'A vaga de Presidente não entra nessa conta: a candidatura é nacional.'));
  }, [{ label: 'Entendi' }, { label: 'Ver minha colinha', cls: 'principal', fn: verColinha }]);
}

function limparColinha() {
  var n = nColinha();
  if (!n) return;
  abrirModal('Limpar a colinha?', function (box) {
    box.appendChild(el('p', null, 'Você vai perder ' +
      (n === 1 ? 'a escolha que já fez' : 'as ' + n + ' escolhas que já fez') + '. Não dá para desfazer.'));
  }, [{ label: 'Cancelar' }, { label: 'Limpar colinha', cls: 'principal', fn: function () {
    colinha = {};
    gravarColinha();
    pintarColinha();
    avisar('');
    colinhaAviso.textContent = 'Colinha vazia.';
  } }]);
}

function verColinha() {
  if (painel.classList.contains('aberto')) fecharGaveta();
  colinhaEl.open = true;
  var s = colinhaEl.querySelector('summary');
  try { colinhaEl.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  catch (e) { colinhaEl.scrollIntoView(); }
  if (s) { try { s.focus({ preventScroll: true }); } catch (e) { s.focus(); } }
}

// ---- Fotos ----
// Carrega as fotos das vagas preenchidas antes de imprimir ou desenhar. Elas
// sao do proprio dominio (fotos/1350-pe.jpg), entao nao sujam o canvas e o
// toDataURL continua funcionando. O prazo existe porque em conexao ruim e
// melhor sair sem uma foto do que nao sair.
var PRAZO_FOTO = 5000;
function carregarFotos(fn) {
  var mapa = {}, pend = [];
  if (comFoto) VAGAS.forEach(function (v) {
    var c = candDaVaga(v);
    if (c && c.foto) pend.push(c);
  });
  if (!pend.length) return fn(mapa);
  var falta = pend.length, pronto = false;
  function acabou() { if (!pronto) { pronto = true; fn(mapa); } }
  var prazo = setTimeout(acabou, PRAZO_FOTO);
  pend.forEach(function (c) {
    var im = new Image();
    im.onload = function () {
      mapa[chaveCand(c)] = im;
      if (!--falta) { clearTimeout(prazo); acabou(); }
    };
    im.onerror = function () { if (!--falta) { clearTimeout(prazo); acabou(); } };
    im.src = c.foto;
  });
}

// ---- O santinho ----
// O mesmo bloco serve a folha inteira e os quatro santinhos; o que muda sao as
// variaveis de tamanho, definidas no CSS por modo de impressao.
function santinho() {
  var s = el('div', 'santinho');
  s.appendChild(el('div', 'santinho-topo', 'MINHA COLINHA'));
  s.appendChild(el('div', 'santinho-url', SITE));
  VAGAS.forEach(function (v) {
    var c = candDaVaga(v);
    var linha = el('div', 'sv' + (c ? '' : ' livre'));
    linha.appendChild(el('span', 'sv-cargo', rotuloVaga(v, c)));
    var baixo = el('span', 'sv-linha');
    if (comFoto) {
      var moldura = el('span', 'sv-foto' + (c && c.foto ? '' : ' vazia'));
      if (c && c.foto) {
        var im = document.createElement('img');
        im.src = c.foto;
        im.alt = '';   // decorativa: o nome esta logo ao lado
        moldura.appendChild(im);
      }
      baixo.appendChild(moldura);
    }
    baixo.appendChild(el('span', 'sv-nome', c ? c.nome : ' '));
    baixo.appendChild(c ? caixinhaNum(c.numero, 'sv-num') : caixinhaBranco(v.digitos, 'sv-num'));
    linha.appendChild(baixo);
    s.appendChild(linha);
  });
  return s;
}
function imprimir(modo) {
  // Sem esperar a foto chegar, a folha pode sair com o buraco no lugar dela.
  carregarFotos(function () { montarEImprimir(modo); });
}
function montarEImprimir(modo) {
  impressao.textContent = '';
  var folha;
  if (modo === 4) {
    folha = el('div', 'folha4');
    for (var i = 0; i < 4; i++) {
      var q = el('div');
      q.appendChild(santinho());
      folha.appendChild(q);
    }
  } else {
    folha = el('div', 'folha');
    folha.appendChild(santinho());
  }
  impressao.appendChild(folha);
  window.print();
}
window.addEventListener('afterprint', function () { impressao.textContent = ''; });

// ---- Imagem ----
// Desenhada no canvas, nao fotografada da tela: sem dependencia externa, e o
// resultado nao depende do tamanho da janela de quem clicou.
var IMG = { L: 700, PAD: 28, TOPO: 72, URL: 34, LINHA: 112 };
IMG.A = IMG.TOPO + IMG.URL + IMG.LINHA * VAGAS.length + 10;

// As fontes do site sao arquivos locais com font-display:swap. No canvas nao ha
// troca depois: o que nao chegou sai na fonte de reserva e fica assim no PNG.
function comFontes(fn) {
  var f = document.fonts;
  if (!f || !f.load || !f.ready || typeof Promise !== 'function') return fn();
  try {
    Promise.all([f.load('400 28px "Archivo Black"'), f.load('700 24px "Public Sans"')])
      .then(function () { return f.ready; }).then(fn, fn);
  } catch (e) { fn(); }
}
function corta(g, s, max) {
  if (g.measureText(s).width <= max) return s;
  while (s.length > 1 && g.measureText(s + '…').width > max) s = s.slice(0, -1);
  return s.replace(/\s+$/, '') + '…';
}
// Desenha as caixinhas encostadas a direita em `dir` e devolve onde elas comecam,
// que e o limite do espaco que sobra para o nome.
function caixinhaCanvas(g, d, dir, cy) {
  var w = 36, h = 46, vao = 5;
  var x = dir - (d.length * w + (d.length - 1) * vao);
  d.forEach(function (ch, i) {
    var bx = x + i * (w + vao);
    // Caixa vazia sai branca, nao amarela: branco se le como "escreva aqui",
    // e e onde a caneta pega.
    g.fillStyle = ch ? '#FFDF00' : '#FFFFFF';
    g.fillRect(bx, cy - h / 2, w, h);
    g.strokeStyle = '#0B1A33';
    g.lineWidth = 2;
    g.strokeRect(bx + 1, cy - h / 2 + 1, w - 2, h - 2);
    if (!ch) return;
    g.fillStyle = '#0B1A33';
    g.font = '400 26px "Archivo Black", Impact, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(ch, bx + w / 2, cy + 1);
  });
  return x;
}
// Recorte quadrado no centro, igual ao object-fit:cover da foto do card: a
// imagem do TSE e retrato (161x225) e esticar deformaria o rosto.
function desenharFoto(g, im, cx, cy, r) {
  var lado = Math.min(im.naturalWidth || im.width, im.naturalHeight || im.height);
  var sx = ((im.naturalWidth || im.width) - lado) / 2;
  var sy = ((im.naturalHeight || im.height) - lado) / 2;
  g.save();
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.closePath(); g.clip();
  g.drawImage(im, sx, sy, lado, lado, cx - r, cy - r, r * 2, r * 2);
  g.restore();
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2);
  g.strokeStyle = '#0B1A33'; g.lineWidth = 2.5; g.stroke();
}
function molduraVazia(g, cx, cy, r) {
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2);
  g.strokeStyle = '#8A91A0'; g.lineWidth = 2;
  if (g.setLineDash) g.setLineDash([5, 5]);
  g.stroke();
  if (g.setLineDash) g.setLineDash([]);
}

function desenharColinha(fotos) {
  fotos = fotos || {};
  var E = 2;   // 2x: o PNG aguenta ser aberto e ampliado no celular sem serrilhar
  var L = IMG.L, A = IMG.A, P = IMG.PAD;
  // Com foto, o nome comeca depois dela; sem foto, encostado na margem.
  var R = 31, esq = P + (comFoto ? R * 2 + 14 : 0);
  var cv = document.createElement('canvas');
  cv.width = L * E; cv.height = A * E;
  var g = cv.getContext('2d');
  g.scale(E, E);
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 0, L, A);

  g.fillStyle = '#0B1A33';
  g.fillRect(0, 0, L, IMG.TOPO);
  g.fillStyle = '#FFFFFF';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '400 30px "Archivo Black", Impact, sans-serif';
  g.fillText('MINHA COLINHA', L / 2, IMG.TOPO / 2 + 1);

  g.fillStyle = '#0B1A33';
  g.font = '700 16px "Public Sans", system-ui, sans-serif';
  g.fillText(SITE, L / 2, IMG.TOPO + IMG.URL / 2);

  var y = IMG.TOPO + IMG.URL;
  VAGAS.forEach(function (v) {
    var c = candDaVaga(v);
    g.strokeStyle = '#0B1A33';
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, y); g.lineTo(L, y); g.stroke();

    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#3A4254';
    g.font = '700 14px "Public Sans", system-ui, sans-serif';
    g.fillText(rotuloVaga(v, c).toUpperCase(), P, y + 27);

    if (comFoto) {
      var im = c && fotos[chaveCand(c)];
      if (im) desenharFoto(g, im, P + R, y + 68, R);
      else molduraVazia(g, P + R, y + 68, R);
    }

    // Vaga vazia tambem leva caixas, em branco: da para mandar a imagem ou
    // imprimir e completar a mao o que ainda nao foi escolhido.
    var fim = caixinhaCanvas(g, c ? String(c.numero).split('') : vazios(v.digitos), L - P, y + 70);
    if (c) {
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillStyle = '#0B1A33';
      g.font = '700 24px "Public Sans", system-ui, sans-serif';
      g.fillText(corta(g, c.nome, fim - esq - 16), esq, y + 79);
    } else {
      // Linha pontilhada para o nome, parando antes das caixas.
      g.strokeStyle = '#8A91A0';
      g.lineWidth = 1.5;
      if (g.setLineDash) g.setLineDash([5, 5]);
      g.beginPath(); g.moveTo(esq, y + 84); g.lineTo(fim - 16, y + 84); g.stroke();
      if (g.setLineDash) g.setLineDash([]);
    }
    y += IMG.LINHA;
  });

  g.strokeStyle = '#0B1A33';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, L - 3, A - 3);
  return cv;
}
function baixarCanvas(cv) {
  var a = document.createElement('a');
  a.download = 'minha-colinha.png';
  a.href = cv.toDataURL('image/png');
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
function baixarImagem() {
  comFontes(function () {
    carregarFotos(function (fotos) {
      try {
        baixarCanvas(desenharColinha(fotos));
        avisar('Imagem salva como minha-colinha.png.');
      } catch (e) {
        avisar('Não foi possível gerar a imagem neste navegador. Use um dos botões de imprimir.');
      }
    });
  });
}
function textoColinha() {
  var linhas = ['MINHA COLINHA'];
  VAGAS.forEach(function (v) {
    var c = candDaVaga(v);
    linhas.push(rotuloVaga(v, c) + ': ' + (c ? c.nome + ' — ' + c.numero : '—'));
  });
  linhas.push('');
  linhas.push('Monte a sua em ' + SITE);
  return linhas.join('\n');
}
// No celular o navegador abre a folha de compartilhamento com a imagem anexada,
// e o WhatsApp e um dos destinos. No computador nao existe esse caminho: ali a
// imagem e baixada e o WhatsApp abre com o texto, para anexar na conversa.
function compartilhar() {
  comFontes(function () {
    carregarFotos(function (fotos) { comImagem(fotos); });
  });
}
function comImagem(fotos) {
  var cv;
  try { cv = desenharColinha(fotos); } catch (e) { cv = null; }
  var texto = textoColinha();
  if (!cv || !cv.toBlob || !navigator.canShare) return semFolha(cv, texto);
  cv.toBlob(function (blob) {
    var arq = null;
    try { arq = new File([blob], 'minha-colinha.png', { type: 'image/png' }); } catch (e) {}
    if (arq && navigator.canShare({ files: [arq] })) {
      avisar('');
      navigator.share({ files: [arq], text: texto })['catch'](function () {});
    } else semFolha(cv, texto);
  }, 'image/png');
}
function semFolha(cv, texto) {
  if (cv) { try { baixarCanvas(cv); } catch (e) { cv = null; } }
  window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  avisar(cv ? 'A imagem foi baixada como minha-colinha.png. No WhatsApp que abriu, anexe o arquivo na conversa.'
            : 'O WhatsApp abriu com a colinha em texto.');
}


// Le a colinha guardada, pinta as seis vagas e amarra os botoes dela.
// Chamado pelo principal.js — ver o comentario no topo deste arquivo.
export function iniciarColinha() {
  colinha = lerColinha();
  pintarColinha();
  chaveFoto.checked = comFoto;
  chaveFoto.addEventListener('change', function () {
    comFoto = chaveFoto.checked;
    gravarColinha();
    avisar('');
  });
  btnColLimpar.addEventListener('click', limparColinha);
  $('colImprimir1').addEventListener('click', function () { imprimir(1); });
  $('colImprimir4').addEventListener('click', function () { imprimir(4); });
  $('colBaixar').addEventListener('click', baixarImagem);
  $('colZap').addEventListener('click', compartilhar);
  modalFundo.addEventListener('click', function (ev) { if (ev.target === modalFundo) fecharModal(); });
  modalFundo.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      // Sem isto o Esc tambem fecharia a gaveta de filtros atras da pergunta.
      ev.stopPropagation();
      return fecharModal();
    }
    if (ev.key !== 'Tab') return;
    var f = modalCaixa.querySelectorAll('button');
    if (!f.length) return;
    var pri = f[0], ult = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === pri) { ev.preventDefault(); ult.focus(); }
    else if (!ev.shiftKey && document.activeElement === ult) { ev.preventDefault(); pri.focus(); }
  });
}
