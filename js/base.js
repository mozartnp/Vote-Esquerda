// Constantes, elementos da pagina e os ajudantes que todo mundo usa.
// Nao importa nada: e a folha do grafo, entao avalia antes dos outros e
// ninguem corre o risco de ler daqui um binding ainda indefinido.

// ---- Configuração ----
export var ARQUIVO = 'candidatos.json';
export var POR_PAGINA = 12;   // 12 em vez de 24: metade das requisicoes de foto no primeiro paint
export var UFS = {AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins',BR:'Brasil'};
// Categorias de cargo: a ordem define a ordem da faceta e da lista de resultados
export var CATEGORIAS = [
  {id:'presidencia', label:'Presidência', re:/presid/},
  {id:'governo',     label:'Governo',     re:/govern/},
  {id:'senado',      label:'Senado',      re:/senad/},
  {id:'federal',     label:'Dep. Federal', re:/federal/},
  {id:'estadual',    label:'Dep. Estadual/Distrital', re:/estadual|distrital/}
];
export var OUTRO_CARGO = 'Outros';

// Ordem fixa dos valores de algumas facetas. Escolaridade vai da menor para a
// maior e patrimonio do menor para o maior: ordenar por quantidade ali faria a
// lista parecer aleatoria.
export var ORDEM = {
  cargo:      CATEGORIAS.map(function (c) { return c.label; }).concat([OUTRO_CARGO]),
  idade:      ['Até 29 anos','30 a 39 anos','40 a 49 anos','50 a 59 anos','60 a 69 anos','70 anos ou mais'],
  instrucao:  ['Lê e escreve','Ensino fundamental incompleto','Ensino fundamental completo','Ensino médio incompleto','Ensino médio completo','Superior incompleto','Superior completo'],
  patrimonio: ['Sem bens declarados','Até R$ 50 mil','R$ 50 mil a R$ 200 mil',
               'R$ 200 mil a R$ 1 milhão','R$ 1 milhão a R$ 5 milhões','Acima de R$ 5 milhões']
};

// As facetas, na ordem em que aparecem no painel.
//   campo  propriedade do registro que guarda o valor
//   ordem  'fixa' usa ORDEM[id]; 'quantidade' ordena pelo total; senao, pelo rotulo
//   tipo   'alternador' = valor unico, vira uma marcacao direta sem acordeao
//          'busca'      = seletor com campo de texto e fichas (ver montarCombo)
// No JSON o campo continua `destaque` — e o dado. Na tela ele se chama
// recomendacao, que e o que a marcacao quer dizer para quem le.
export var RECOMENDACAO = 'Recomendação do site';
export var INDIGENA = 'Candidatura indígena';
export var FACETAS = [
  {id:'recomendacao', label:'Recomendação', campo:'recLabel',   ordem:'rotulo', tipo:'alternador'},
  {id:'cargo',      label:'Cargo',          campo:'cargoLabel', ordem:'fixa'},
  // "Brasil" fora da lista: BR nao e um estado, e a abrangencia nacional das
  // cinco candidaturas a presidencia. Quem procura por elas usa o cargo.
  // `universal` marca o valor que passa por qualquer recorte desta faceta: a
  // presidencia tem uf 'BR' e nao e de estado nenhum, logo esta em todos.
  {id:'uf',         label:'Estado',         campo:'uf',         ordem:'rotulo',
   excluir:['BR'], universal:'BR', rotulo:function (v) { return UFS[v] || v; }},
  {id:'partido',    label:'Partido',        campo:'partido',    ordem:'quantidade'},
  // "Sem federação" fica de fora: a faceta serve para quem quer votar numa
  // federação, nao para recortar os cinco partidos que concorrem sozinhos —
  // para esses ja existe a faceta de partido.
  {id:'federacao',  label:'Federação',      campo:'federacao',  ordem:'quantidade',
   excluir:['Sem federação']},
  {id:'sexo',       label:'Gênero',         campo:'sexo',       ordem:'rotulo'},
  {id:'etnia',      label:'Cor ou raça',    campo:'etnia',      ordem:'quantidade'},
  {id:'idade',      label:'Idade',          campo:'faixaIdade', ordem:'fixa'},
  {id:'instrucao',  label:'Escolaridade',   campo:'instrucao',  ordem:'fixa'},
  {id:'ocupacao',   label:'Ocupação',       campo:'ocupacao',   ordem:'quantidade'},
  {id:'patrimonio', label:'Patrimônio',     campo:'patr',       ordem:'fixa'},
  // Os tres marcadores de identidade ficam juntos no pe do painel. O de
  // candidatura indigena cobre as 105 — inclusive as 15 que nao declararam
  // povo, e que por isso nao aparecem no seletor abaixo.
  {id:'indigena',   label:'Indígena',       campo:'indigena',   ordem:'rotulo', tipo:'alternador'},
  {id:'povo',       label:'Povo indígena',  campo:'povo',       ordem:'quantidade', tipo:'busca',
   dica:'Buscar povo…'},
  {id:'quilombola', label:'Quilombola',     campo:'quilomb',    ordem:'rotulo', tipo:'alternador'}
];


// sel[faceta] = valores marcados. Vazio quer dizer "nao filtra por isso".
export var sel = {}, VALORES = {};
FACETAS.forEach(function (f) { sel[f.id] = []; VALORES[f.id] = []; });

// ---- Elementos ----
export function $(id) { return document.getElementById(id); }
export var input = $('busca'), btnLimpar = $('limpar'), grade = $('grade'),
    contagem = $('contagem'), mensagem = $('mensagem'), btnMais = $('mais'),
    facetasEl = $('facetas'), painel = $('painel'), btnZerar = $('zerar'),
    btnAbrir = $('abrirPainel'), btnFechar = $('fecharPainel'), seloMobile = $('seloMobile');

export function norm(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
export function linkSeguro(url) {
  return typeof url === 'string' && /^https:\/\//i.test(url.trim()) ? url.trim() : null;
}
export function categoria(c) {
  var n = norm(c);
  for (var i = 0; i < CATEGORIAS.length; i++) if (CATEGORIAS[i].re.test(n)) return i;
  return CATEGORIAS.length;
}
export function el(tag, cls, texto) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texto != null) e.textContent = texto; // sempre texto puro, nunca HTML
  return e;
}
export function iniciais(nome) {
  var p = String(nome || '?').trim().split(/\s+/);
  return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}
