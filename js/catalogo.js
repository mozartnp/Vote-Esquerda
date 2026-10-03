// A lista: motor de facetas, carregamento do candidatos.json, painel de
// filtros, card e o link compartilhavel.
//
// Importa da colinha (que importa daqui) — o ciclo e proposital: o card tem
// botao de por na colinha, e a colinha busca nos dados que chegam aqui. E
// seguro porque nenhum dos dois le o outro em tempo de avaliacao: as unicas
// referencias cruzadas estao dentro de callback, nunca no corpo do modulo.

import {
  ARQUIVO, CATEGORIAS, FACETAS, INDIGENA, ORDEM, OUTRO_CARGO, POR_PAGINA,
  RECOMENDACAO, VALORES, sel, btnAbrir, btnFechar, btnLimpar, btnMais, btnZerar,
  contagem, facetasEl, grade, input, mensagem, painel, seloMobile,
  categoria, el, iniciais, linkSeguro, norm
} from './base.js';
import {
  botaoColinha, botoes, chaveCand, conferirColinha, pintarColinha, vagasDoCargo
} from './colinha.js';

export var todos = [], filtrados = [], mostrando = 0;
// Indice por chave de candidatura: e por ele que a colinha resolve quem guardou
// em cada vaga, depois que a lista chega.
export var porChave = {};
// Candidaturas agrupadas por categoria de cargo, na mesma ordem da lista
// (indeferido por ultimo, recomendacao primeiro): e o que a busca de cada vaga
// da colinha percorre.
export var porCargo = [];

// ---- Motor de facetas ----
function faixaIdade(a) {
  var n = parseInt(a, 10);
  if (!n) return '';
  if (n < 30) return ORDEM.idade[0];
  if (n < 40) return ORDEM.idade[1];
  if (n < 50) return ORDEM.idade[2];
  if (n < 60) return ORDEM.idade[3];
  if (n < 70) return ORDEM.idade[4];
  return ORDEM.idade[5];
}
function faixaPatrimonio(v) {
  var n = typeof v === 'number' ? v : parseFloat(v);
  if (!(n > 0)) return ORDEM.patrimonio[0];   // o TSE registra 0 para quem nao declarou bens
  if (n < 5e4) return ORDEM.patrimonio[1];
  if (n < 2e5) return ORDEM.patrimonio[2];
  if (n < 1e6) return ORDEM.patrimonio[3];
  if (n < 5e6) return ORDEM.patrimonio[4];
  return ORDEM.patrimonio[5];
}
function rotulo(f, v) { return f.rotulo ? f.rotulo(v) : v; }

// Levanta os valores de cada faceta uma vez, sobre a lista inteira. A ordem
// nao muda conforme o visitante filtra: lista que se reordena sozinha e lista
// em que ninguem acha de novo o que acabou de ver.
function montarValores() {
  FACETAS.forEach(function (f) {
    var n = {};
    todos.forEach(function (c) { var v = c[f.campo]; if (v) n[v] = (n[v] || 0) + 1; });
    var vs = Object.keys(n).filter(function (v) {
      return !f.excluir || f.excluir.indexOf(v) < 0;
    });
    if (f.ordem === 'fixa') vs.sort(function (a, b) { return ORDEM[f.id].indexOf(a) - ORDEM[f.id].indexOf(b); });
    else if (f.ordem === 'quantidade') vs.sort(function (a, b) { return n[b] - n[a] || a.localeCompare(b, 'pt-BR'); });
    else vs.sort(function (a, b) { return rotulo(f, a).localeCompare(rotulo(f, b), 'pt-BR'); });
    VALORES[f.id] = vs;
  });
}

// A busca por texto cobre so nome, nome completo e numero. Partido e estado
// sairam dela de proposito: agora tem faceta propria, e era justamente o campo
// que fazia tudo ao mesmo tempo que confundia quem digitava.
export var SO_DIGITOS = /^\d+$/;
function passaTexto(c, q) {
  if (!q) return true;
  // Numero de urna e hierarquico: 13 e o PT, 1301 uma federal do PT, 13000 uma
  // estadual. Por isso digito casa por prefixo, nao por pedaco — "13" devolve
  // as candidaturas do PT, e nao tambem o 25130 de outro partido, que contem
  // "13" no meio.
  if (SO_DIGITOS.test(q)) return c.numero.indexOf(q) === 0;
  return c.busca.indexOf(q) >= 0;
}
// Marcar dois valores na mesma faceta soma (PSOL ou PT); facetas diferentes se
// cruzam (PSOL e mulher). `pular` deixa uma faceta de fora do teste — e assim
// que se conta quantos resultados cada opcao daria sem ela se auto-zerar.
function passaFacetas(c, pular) {
  for (var i = 0; i < FACETAS.length; i++) {
    if (i === pular) continue;
    var f = FACETAS[i], e = sel[f.id];
    if (!e.length) continue;
    var v = c[f.campo];
    if (f.universal && v === f.universal) continue;   // candidatura nacional
    if (e.indexOf(v) < 0) return false;
  }
  return true;
}
function nFiltros() {
  var n = 0;
  FACETAS.forEach(function (f) { n += sel[f.id].length; });
  return n;
}
function contagens() {
  var q = norm(input.value), r = {};
  FACETAS.forEach(function (f) { r[f.id] = {}; });
  todos.forEach(function (c) {
    if (!passaTexto(c, q)) return;
    for (var i = 0; i < FACETAS.length; i++) {
      if (!passaFacetas(c, i)) continue;
      var f = FACETAS[i], v = c[f.campo];
      // A candidatura nacional entra na conta de todo estado, porque marcar
      // qualquer um deles nao a tira da lista.
      if (f.universal && v === f.universal) {
        VALORES[f.id].forEach(function (u) { r[f.id][u] = (r[f.id][u] || 0) + 1; });
        continue;
      }
      if (v) r[f.id][v] = (r[f.id][v] || 0) + 1;
    }
  });
  return r;
}
function alternar(fid, v) {
  var a = sel[fid], i = a.indexOf(v);
  if (i >= 0) a.splice(i, 1); else a.push(v);
  aplicar();
}
export function limparTudo() {
  FACETAS.forEach(function (f) { sel[f.id] = []; });
  input.value = '';
  combos.forEach(function (c) { c.input.value = ''; fecharCombo(c); });
  aplicar();
  input.focus();
}

// ---- Carregamento ----
// Em conexao instavel o que atrasa nao e o tamanho do JSON (~150 KB comprimido),
// e esperar a rede para mostrar qualquer coisa. Por isso, em tres etapas:
//   1. esqueleto na hora, sem depender de rede nenhuma;
//   2. se houver copia em cache, ela entra imediatamente;
//   3. a rede revalida em segundo plano e substitui a lista se tiver mudado.
var CACHE = 'vote-esquerda-lista';
var pronto = false;   // ja pintamos a lista alguma vez?
var daRede = false;   // o que esta na tela ja veio da rede?
var versao = null;    // identifica o conteudo ja pintado

function esqueleto(n) {
  var frag = document.createDocumentFragment();
  for (var i = 0; i < n; i++) {
    var li = el('li');
    var art = el('div', 'esqueleto');
    art.setAttribute('aria-hidden', 'true');
    ['ini', 'l1', 'l2', 'l3'].forEach(function (c) { art.appendChild(el('i', c)); });
    li.appendChild(art); frag.appendChild(li);
  }
  grade.appendChild(frag);
}

// Identifica o conteudo pelo ETag que veio na propria resposta (ou, se o
// servidor nao mandar ETag, pelo Last-Modified). Antes a identificacao era
// `atualizado_em` + numero de registros, e nenhum dos dois muda quando se
// marca um destaque, se escreve uma proposta ou se acrescenta um campo: a
// copia da rede era descartada como "igual" e quem tinha a lista em cache
// ficava preso na versao velha. So aparecia em conexao lenta, justo onde o
// cache serve para alguma coisa. O /candidatos.json e servido com
// `max-age=0, must-revalidate` (ver _headers), entao o ETag sempre vem.
function carimbo(resposta) {
  return resposta.headers.get('etag') || resposta.headers.get('last-modified') || '';
}

function processar(dados, marca) {
  var lista = Array.isArray(dados) ? dados : (dados.candidatos || []);
  // Se a rede devolveu o mesmo conteudo que ja esta na tela, nao repinta: repintar
  // zera o "carregar mais" que o visitante ja usou. Sem carimbo nenhum, repinta:
  // perder a paginacao e menos grave que servir lista velha.
  if (pronto && marca && marca === versao) return;
  versao = marca;
  todos = lista.filter(function (c) { return c && c.nome && c.numero; }).map(function (c) {
    var uf = String(c.uf || '').toUpperCase();
    var i = categoria(c.cargo);
    return {
      // Sequencial do TSE: identifica a candidatura e e o que a colinha guarda
      sq: String(c.sq || ''),
      nome: String(c.nome), numero: String(c.numero), uf: uf, cargo: String(c.cargo || ''),
      partido: String(c.partido || ''), proposta: String(c.proposta || '').trim(),
      foto: c.foto ? String(c.foto) : '', rede: linkSeguro(c.rede), tse: linkSeguro(c.tse),
      cat: i, cargoLabel: (CATEGORIAS[i] || {}).label || OUTRO_CARGO,
      dest: c.destaque === true,
      recLabel: c.destaque === true ? RECOMENDACAO : '',
      completo: String(c.nome_completo || ''),
      situacao: String(c.situacao || '').trim(),
      indef: /indeferid/i.test(String(c.situacao || '')),
      sexo: String(c.sexo || ''), etnia: String(c.etnia || ''),
      instrucao: String(c.instrucao || ''), ocupacao: String(c.ocupacao || ''),
      // Estes dois nao filtram nada — sao para o bloco "Informações da
      // candidatura" do card. A ocupacao declarada diz "Professor de ensino
      // médio", bem mais util de ler que o grupo "Educação" do filtro.
      ocupDecl: String(c.ocupacao_declarada || ''),
      idade: parseInt(c.idade, 10) || 0,
      patrimonio: typeof c.patrimonio === 'number' ? c.patrimonio : parseFloat(c.patrimonio) || 0,
      federacao: String(c.federacao || ''), povo: String(c.povo || ''),
      // Os marcadores so entram como "sim": ninguem procura quem nao e quilombola
      quilomb: c.quilombola === true ? 'Candidatura quilombola' : '',
      indigena: c.etnia === 'Indígena' ? INDIGENA : '',
      faixaIdade: faixaIdade(c.idade), patr: faixaPatrimonio(c.patrimonio),
      // So os nomes: o numero e tratado a parte, por prefixo (ver passaTexto)
      busca: norm([c.nome, c.nome_completo].join(' | '))
    };
  }).sort(function (a, b) {
    // Registro indeferido afunda antes de qualquer outro criterio, inclusive do
    // destaque: nao adianta recomendar quem pode nem contar o voto.
    return (a.indef ? 1 : 0) - (b.indef ? 1 : 0)
        || (b.dest ? 1 : 0) - (a.dest ? 1 : 0)
        || a.cat - b.cat || a.uf.localeCompare(b.uf) || a.nome.localeCompare(b.nome, 'pt-BR');
  });
  porChave = {};
  porCargo = [];
  todos.forEach(function (c) {
    porChave[chaveCand(c)] = c;
    (porCargo[c.cat] || (porCargo[c.cat] = [])).push(c);
  });
  montarValores();
  montarPainel();
  if (!pronto) lerURL();   // a URL so manda na primeira pintura
  pronto = true;
  // A colinha foi lida do localStorage antes de a lista existir. Agora que ela
  // existe, cada vaga guardada e conferida contra ela e a colinha e repintada.
  conferirColinha();
  pintarColinha();
  aplicar();
}

// O cache fica no Cache Storage, nao no localStorage: o arquivo passa de 2 MB
// cru e o localStorage costuma estourar em 5 MB no total. Guardar a Response
// inteira, e nao so o JSON, e o que permite reler o carimbo dela depois.
function lerCache() {
  if (!window.caches) return Promise.reject();
  return caches.open(CACHE)
    .then(function (c) { return c.match(ARQUIVO); })
    .then(function (r) {
      if (!r) return Promise.reject();
      var marca = carimbo(r);
      return r.json().then(function (dados) { return { dados: dados, marca: marca }; });
    });
}
function gravarCache(resposta) {
  if (!window.caches) return;
  caches.open(CACHE).then(function (c) { c.put(ARQUIVO, resposta); })['catch'](function () {});
}

esqueleto(POR_PAGINA);

lerCache().then(function (p) {
  if (!daRede) processar(p.dados, p.marca);   // a rede pode ter chegado antes
})['catch'](function () {});

fetch(ARQUIVO, { cache: 'no-cache' })
  .then(function (r) {
    if (!r.ok) throw new Error(r.status);
    gravarCache(r.clone());
    var marca = carimbo(r);
    return r.json().then(function (dados) { return { dados: dados, marca: marca }; });
  })
  .then(function (p) { daRede = true; processar(p.dados, p.marca); })
  ['catch'](function () {
    if (pronto) return;   // ja tem lista do cache na tela: nao assusta o visitante
    grade.textContent = '';
    contagem.textContent = 'Não foi possível carregar a lista';
    mensagem.className = 'erro';
    mensagem.textContent = 'Tente recarregar a página em alguns instantes.';
  });

// ---- Painel de filtros ----
// Guarda os nos criados uma vez, para que repintar seja so atualizar numero e
// estado de marcacao. Recriar os elementos a cada clique tiraria o foco do
// teclado de quem esta navegando pela lista.
var marcas = {}, linhas = {}, numeros = {}, selos = {}, combos = [];

function montarPainel() {
  facetasEl.textContent = '';
  combos = [];
  FACETAS.forEach(function (f) {
    marcas[f.id] = {}; linhas[f.id] = {}; numeros[f.id] = {};
    if (f.tipo === 'alternador') return facetasEl.appendChild(montarAlternador(f));
    var d = document.createElement('details');
    d.className = 'faceta';
    d.open = f.aberta === true;
    var s = document.createElement('summary');
    s.appendChild(el('span', null, f.label));
    selos[f.id] = el('span', 'selo', '0');
    selos[f.id].hidden = true;
    s.appendChild(selos[f.id]);
    d.appendChild(s);
    d.appendChild(f.tipo === 'busca' ? montarCombo(f) : montarMarcacoes(f));
    facetasEl.appendChild(d);
  });
}

// Lista de caixas de marcacao: o formato padrao das facetas.
function montarMarcacoes(f) {
  var caixa = el('div', 'valores');
  VALORES[f.id].forEach(function (v) {
    var linha = el('label', 'valor');
    var cx = document.createElement('input');
    cx.type = 'checkbox';
    cx.addEventListener('change', function () { alternar(f.id, v); });
    var q = el('span', 'q', '0');
    linha.appendChild(cx);
    linha.appendChild(el('span', null, rotulo(f, v)));
    linha.appendChild(q);
    marcas[f.id][v] = cx; linhas[f.id][v] = linha; numeros[f.id][v] = q;
    caixa.appendChild(linha);
  });
  return caixa;
}

// Faceta de valor unico: marcacao direta, sem acordeao em volta.
function montarAlternador(f) {
  var v = VALORES[f.id][0];
  if (!v) return document.createDocumentFragment();
  var linha = el('label', 'alternador');
  var cx = document.createElement('input');
  cx.type = 'checkbox';
  cx.addEventListener('change', function () { alternar(f.id, v); });
  var q = el('span', 'q', '0');
  linha.appendChild(cx);
  linha.appendChild(el('span', null, rotulo(f, v)));
  linha.appendChild(q);
  marcas[f.id][v] = cx; linhas[f.id][v] = linha; numeros[f.id][v] = q;
  return linha;
}

// Seletor com busca (padrao combobox da WAI-ARIA): campo de texto que filtra a
// lista, o escolhido vira ficha dentro do proprio campo. Para o povo indigena,
// que tem 46 valores e quase todos com uma candidatura so, marcar numa lista
// rolante seria procurar agulha no palheiro.
function montarCombo(f) {
  var caixa = el('div', 'combo');
  var campo = el('div', 'combo-campo');
  var txt = document.createElement('input');
  txt.type = 'text';
  txt.id = 'combo-' + f.id;
  txt.placeholder = f.dica || 'Buscar…';
  txt.autocomplete = 'off';
  txt.setAttribute('role', 'combobox');
  txt.setAttribute('aria-expanded', 'false');
  txt.setAttribute('aria-controls', 'lista-' + f.id);
  txt.setAttribute('aria-autocomplete', 'list');
  txt.setAttribute('aria-label', f.label);
  var lista = document.createElement('ul');
  lista.className = 'combo-lista';
  lista.id = 'lista-' + f.id;
  lista.setAttribute('role', 'listbox');
  lista.setAttribute('aria-label', f.label);
  lista.hidden = true;
  campo.appendChild(txt);
  caixa.appendChild(campo);
  caixa.appendChild(lista);

  var c = { f: f, campo: campo, input: txt, lista: lista, itens: [], ativo: -1 };
  combos.push(c);

  campo.addEventListener('click', function (ev) { if (ev.target === campo) txt.focus(); });
  txt.addEventListener('focus', function () { abrirCombo(c); });
  txt.addEventListener('input', function () { abrirCombo(c); c.ativo = -1; pintarCombo(c, contagens()); });
  txt.addEventListener('blur', function () {
    // Sem o atraso, o blur fecha a lista antes do clique no item chegar.
    setTimeout(function () { fecharCombo(c); }, 160);
  });
  txt.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (!c.itens.length) return;
      abrirCombo(c);
      c.ativo = (c.ativo + (ev.key === 'ArrowDown' ? 1 : c.itens.length - 1)) % c.itens.length;
      pintarCombo(c, contagens());
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      if (c.ativo >= 0 && c.itens[c.ativo]) escolherNoCombo(c, c.itens[c.ativo]);
    } else if (ev.key === 'Escape') {  // 1o Esc limpa o que foi digitado, 2o fecha
      if (txt.value) { txt.value = ''; pintarCombo(c, contagens()); } else fecharCombo(c);
    } else if (ev.key === 'Backspace' && !txt.value && sel[f.id].length) {
      alternar(f.id, sel[f.id][sel[f.id].length - 1]);
    }
  });
  return caixa;
}

function abrirCombo(c) {
  c.lista.hidden = false;
  c.input.setAttribute('aria-expanded', 'true');
}
function fecharCombo(c) {
  c.lista.hidden = true;
  c.ativo = -1;
  c.input.setAttribute('aria-expanded', 'false');
  c.input.removeAttribute('aria-activedescendant');
}
// `item` e {v, n, marcado}. Opcao que nao sobrou ninguem nao e escolhivel,
// igual a caixa desabilitada das outras facetas — so que aqui ela segue
// visivel, para o visitante ver que o povo existe mas nao cabe neste recorte.
function escolherNoCombo(c, item) {
  if (!item.n && !item.marcado) return;
  c.input.value = '';
  c.ativo = -1;
  alternar(c.f.id, item.v);
  c.input.focus();
}

function pintarCombo(c, cnt) {
  var f = c.f, q = norm(c.input.value), i;
  // Fichas: apaga so as antigas e reinsere antes do campo de texto, que nunca
  // e recriado — recriar perderia o foco no meio da digitacao.
  var velhas = c.campo.querySelectorAll('.combo-ficha');
  for (i = velhas.length - 1; i >= 0; i--) c.campo.removeChild(velhas[i]);
  sel[f.id].forEach(function (v) {
    var fi = el('span', 'combo-ficha');
    fi.appendChild(el('span', null, rotulo(f, v)));
    var x = el('button', null, '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Remover ' + rotulo(f, v));
    x.addEventListener('mousedown', function (ev) { ev.preventDefault(); });  // nao rouba o foco
    x.addEventListener('click', function () { alternar(f.id, v); });
    fi.appendChild(x);
    c.campo.insertBefore(fi, c.input);
  });

  c.itens = VALORES[f.id].filter(function (v) {
    return !q || norm(rotulo(f, v)).indexOf(q) >= 0;
  }).map(function (v) {
    return { v: v, n: cnt[f.id][v] || 0, marcado: sel[f.id].indexOf(v) >= 0 };
  }).sort(function (a, b) {
    // Quem tem candidatura no recorte atual sobe. Com MS marcado, os povos de
    // MS vem primeiro — e so aqui a ordem se mexe conforme o filtro, porque e
    // uma lista que se percorre lendo, nao uma em que se guarda a posicao.
    return (b.n > 0 ? 1 : 0) - (a.n > 0 ? 1 : 0)
        || b.n - a.n
        || rotulo(f, a.v).localeCompare(rotulo(f, b.v), 'pt-BR');
  });
  if (c.ativo >= c.itens.length) c.ativo = -1;
  c.lista.textContent = '';
  if (!c.itens.length) {
    var nada = el('li', 'combo-nada', 'Nenhum resultado para “' + c.input.value + '”');
    nada.setAttribute('role', 'presentation');
    c.lista.appendChild(nada);
    c.input.removeAttribute('aria-activedescendant');
    return;
  }
  c.itens.forEach(function (item, k) {
    var escolhivel = item.n || item.marcado;
    var li = el('li');
    li.id = 'opt-' + f.id + '-' + k;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', item.marcado ? 'true' : 'false');
    if (!escolhivel) li.setAttribute('aria-disabled', 'true');
    li.className = (item.marcado ? 'escolhida ' : '') + (escolhivel ? '' : 'vazia ') + (k === c.ativo ? 'ativa' : '');
    li.appendChild(el('span', null, (item.marcado ? '✓ ' : '') + rotulo(f, item.v)));
    li.appendChild(el('span', 'q', item.n));
    li.addEventListener('mousedown', function (ev) { ev.preventDefault(); });  // nao rouba o foco do campo
    li.addEventListener('click', function () { escolherNoCombo(c, item); });
    c.lista.appendChild(li);
  });
  if (c.ativo >= 0) c.input.setAttribute('aria-activedescendant', 'opt-' + f.id + '-' + c.ativo);
  else c.input.removeAttribute('aria-activedescendant');
}

function pintarPainel() {
  var cnt = contagens(), total = nFiltros();
  FACETAS.forEach(function (f) {
    if (f.tipo !== 'busca') {
      VALORES[f.id].forEach(function (v) {
        var n = cnt[f.id][v] || 0, marcado = sel[f.id].indexOf(v) >= 0;
        if (!marcas[f.id][v]) return;
        numeros[f.id][v].textContent = n;
        marcas[f.id][v].checked = marcado;
        marcas[f.id][v].disabled = !n && !marcado;
        linhas[f.id][v].className = (f.tipo === 'alternador' ? 'alternador' : 'valor') + (!n && !marcado ? ' vazia' : '');
      });
    }
    var k = sel[f.id].length;
    if (selos[f.id]) { selos[f.id].hidden = !k; selos[f.id].textContent = k; }
  });
  combos.forEach(function (c) { pintarCombo(c, cnt); });
  btnZerar.hidden = !total && !input.value;
  seloMobile.hidden = !total;
  seloMobile.textContent = total;
  btnFechar.textContent = 'VER ' + filtrados.length + (filtrados.length === 1 ? ' CANDIDATURA' : ' CANDIDATURAS');
}

export function aplicar() {
  var q = norm(input.value);
  filtrados = todos.filter(function (c) {
    return passaFacetas(c, -1) && passaTexto(c, q);
  });
  btnLimpar.hidden = !input.value;
  grade.textContent = ''; mostrando = 0;
  // A grade esvaziou, e os botoes de colinha dela foram com ela. Muta em vez de
  // reatribuir: botoes vem da colinha, e binding importado e somente leitura.
  botoes.length = 0;
  var n = filtrados.length;
  // "recomendacoes" so quando e o unico recorte em jogo; com outro filtro
  // junto, "candidaturas" e o que descreve a lista.
  var soRec = sel.recomendacao.length && nFiltros() === 1 && !q;
  contagem.textContent = soRec ? n + (n === 1 ? ' recomendação' : ' recomendações')
                               : n + (n === 1 ? ' candidatura' : ' candidaturas');
  if (n === 0) {
    mensagem.className = 'vazio';
    mensagem.textContent = nFiltros()
      ? 'Nenhuma candidatura combina todos os filtros. Tente remover um deles.'
      : 'Nenhum candidato encontrado' + (input.value ? ' para “' + input.value + '”' : '') + '. A busca procura por nome e por número — para estado ou partido, use os filtros.';
  } else { mensagem.className = ''; mensagem.textContent = ''; }
  renderMais();
  pintarPainel();
  escreverURL();
}

export function renderMais() {
  var frag = document.createDocumentFragment();
  var fim = Math.min(mostrando + POR_PAGINA, filtrados.length);
  for (var i = mostrando; i < fim; i++) frag.appendChild(card(filtrados[i]));
  grade.appendChild(frag);
  mostrando = fim;
  var resta = filtrados.length - mostrando;
  btnMais.hidden = resta <= 0;
  btnMais.textContent = 'CARREGAR MAIS (' + resta + ')';
}

// ---- Card ----
function card(c) {
  var li = el('li'); var art = el('article', 'card'); li.appendChild(art);

  var topo = el('div', 'card-topo');
  var foto = el('div', 'foto');
  var ini = iniciais(c.nome);
  if (c.foto) {
    var img = document.createElement('img');
    img.src = c.foto; img.alt = 'Foto de ' + c.nome; img.loading = 'lazy'; img.decoding = 'async'; img.width = 84; img.height = 84;
    img.onerror = function () { foto.textContent = ini; foto.setAttribute('aria-hidden', 'true'); };
    foto.appendChild(img);
  } else { foto.textContent = ini; foto.setAttribute('aria-hidden', 'true'); }
  var info = el('div', 'info');
  if (c.dest) info.appendChild(el('span', 'selo-recomendacao', 'RECOMENDAÇÃO'));
  info.appendChild(el('h3', 'nome', c.nome));
  // A linha do nome completo e sempre criada, mesmo vazia: reservar a altura
  // evita que quem tem nome de urna igual ao completo fique uma linha mais
  // curto que os vizinhos da fileira. Nomes longos ainda ocupam duas linhas;
  // essa diferenca e absorvida pelo flex:1 do .card-topo (ver CSS).
  var temCompleto = c.completo && norm(c.completo) !== norm(c.nome);
  info.appendChild(el('span', 'nome-completo', temCompleto ? c.completo : ''));
  if (c.partido) info.appendChild(marcaPartido(c.partido));
  topo.appendChild(foto); topo.appendChild(info); art.appendChild(topo);

  // Cargo em cima ocupando a largura, numero embaixo a direita. O cargo nao
  // divide a linha com o numero porque "Deputado Distrital · DF" ao lado de um
  // numero de 5 digitos nao cabe num card de 300px.
  var num = el('div', 'numero');
  num.appendChild(el('small', null, c.cargo + (c.uf ? ' · ' + c.uf : '')));
  num.appendChild(el('strong', null, c.numero));
  art.appendChild(num);

  // Candidatura sub judice: avisa antes da proposta, colado na faixa do numero.
  if (c.situacao) {
    var sit = el('div', 'situacao', c.situacao);
    sit.setAttribute('role', 'note');
    art.appendChild(sit);
  }

  // Sem proposta o bloco vai vazio e o .proposta:empty zera o padding, entao
  // ele nao ocupa altura nenhuma. Quem estica o card e o .card-topo.
  var prop = el('div', 'proposta');
  if (c.proposta) { prop.appendChild(el('b', null, 'PROPOSTA')); prop.appendChild(el('span', null, c.proposta)); }
  art.appendChild(prop);

  art.appendChild(informacoes(c));

  // Cargo sem vaga na colinha (nao ocorre na lista de hoje) nao ganha botao.
  if (vagasDoCargo(c.cat).length) art.appendChild(botaoColinha(c));

  var links = el('div', 'links');
  links.appendChild(link(c.rede, 'Rede social', c.nome));
  links.appendChild(link(c.tse, 'Candidatura no TSE', c.nome));
  art.appendChild(links);
  return li;
}

// Bloco expansivel com o que alimenta os filtros. Fechado o card fica como
// estava; aberto, quem chegou ali por um filtro ("mulheres negras do PSOL")
// enxerga de onde aquilo saiu, sem precisar abrir a pagina do TSE.
// <details> nativo: abre sem JS e ja vem acessivel pelo teclado.
function informacoes(c) {
  var d = document.createElement('details');
  d.className = 'infos';
  var s = document.createElement('summary');
  // Concorda com o genero da candidatura. "candidatura" e a reserva para o caso
  // de `sexo` vir vazio — o JSON e editado a mao, entao o campo pode faltar.
  var fem = c.sexo === 'Feminino', masc = c.sexo === 'Masculino';
  s.appendChild(el('span', null, fem ? 'Informações da candidata'
                               : masc ? 'Informações do candidato'
                                      : 'Informações da candidatura'));
  // O nome so para quem usa leitor de tela: sem ele, uma lista de 12 cards
  // anuncia doze vezes o mesmo rotulo. Fica depois do texto visivel, que
  // continua sendo o inicio do nome acessivel.
  s.appendChild(el('span', 'sr-only', (fem || masc ? ' ' : ' de ') + c.nome));
  d.appendChild(s);

  var dl = document.createElement('dl');
  function linha(rotulo, valor) {
    if (!valor) return;
    dl.appendChild(el('dt', null, rotulo));
    dl.appendChild(el('dd', null, valor));
  }
  linha('Federação', c.federacao);
  linha('Idade', c.idade ? c.idade + ' anos' : '');
  linha('Gênero', c.sexo);
  linha('Cor ou raça', c.etnia);
  linha('Povo indígena', c.povo);
  linha('Quilombola', c.quilomb ? 'Sim' : '');
  linha('Escolaridade', c.instrucao);
  linha('Ocupação', c.ocupDecl || c.ocupacao);
  linha('Patrimônio', dinheiro(c.patrimonio));
  d.appendChild(dl);
  return d;
}

// O TSE registra 0 para quem nao declarou bens — nao e patrimonio zero, e
// ausencia de declaracao, e o texto precisa dizer isso.
function dinheiro(v) {
  if (!(v > 0)) return 'Sem bens declarados';
  try {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch (e) {
    return 'R$ ' + v.toFixed(2);
  }
}
// Logo do partido: tenta logos/<sigla>.svg, depois .png, e cai no nome se não houver arquivo.
function marcaPartido(partido) {
  var bloco = el('div', 'partido-bloco');
  var slug = norm(partido).replace(/[^a-z0-9]/g, '');
  var img = document.createElement('img');
  img.className = 'logo-partido';
  img.alt = '';  // decorativa: a sigla logo abaixo ja nomeia o partido
  img.loading = 'lazy'; img.decoding = 'async';
  img.onerror = function () {
    if (img.getAttribute('data-ext') !== 'png') {
      img.setAttribute('data-ext', 'png');
      img.src = 'logos/' + slug + '.png';
      return;
    }
    if (img.parentNode) img.parentNode.removeChild(img);  // sem arquivo: fica so a sigla
  };
  img.src = 'logos/' + slug + '.svg';
  bloco.appendChild(img);
  bloco.appendChild(el('span', 'partido-sigla', partido));
  return bloco;
}

function link(url, texto, nome) {
  if (!url) return el('span', null, texto);
  var a = el('a', null, texto);
  a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', texto + ' de ' + nome + ' (abre em nova aba)');
  return a;
}


// ---- URL compartilhável: ?q=maria&uf=PE&partido=PSOL|PT ----
// Cada faceta vira um parametro, com os valores separados por "|". Assim um
// recorte montado no painel ("mulheres negras do PSOL em PE") vira um link.
function lerURL() {
  var p = new URLSearchParams(location.search);
  if (p.get('q')) input.value = p.get('q');
  FACETAS.forEach(function (f) {
    var v = p.get(f.id);
    if (!v) return;
    // Alternador tem um valor so, entao vale ?quilombola=1 em vez de repetir o
    // rotulo inteiro codificado na barra de enderecos.
    if (f.tipo === 'alternador') sel[f.id] = VALORES[f.id].slice(0, 1);
    // Descarta valor que nao existe mais: link velho nao pode zerar a lista
    else sel[f.id] = v.split('|').filter(function (x) { return VALORES[f.id].indexOf(x) >= 0; });
  });
  // Compatibilidade com os links antigos, de quando cargo era ?cargo=senado
  var antigo = p.get('cargo');
  if (antigo && !sel.cargo.length) {
    CATEGORIAS.forEach(function (c) { if (c.id === antigo) sel.cargo = [c.label]; });
  }
}
function escreverURL() {
  var p = new URLSearchParams();
  if (input.value) p.set('q', input.value);
  FACETAS.forEach(function (f) {
    if (!sel[f.id].length) return;
    p.set(f.id, f.tipo === 'alternador' ? '1' : sel[f.id].join('|'));
  });
  var s = p.toString();
  history.replaceState(null, '', s ? '?' + s : location.pathname);
}


// No celular o painel e uma gaveta de tela inteira. Travar a rolagem do corpo
// evita que o fundo role atras dela quando a lista de facetas chega ao fim.
export function abrirGaveta() {
  painel.classList.add('aberto');
  btnAbrir.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  input.focus();
}
export function fecharGaveta() {
  painel.classList.remove('aberto');
  btnAbrir.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  btnAbrir.focus();
}
