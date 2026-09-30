# Vote Esquerda — Especificação para desenvolvimento

Site de página única para as eleições de 2026: lista de candidaturas do campo progressista com busca. Deve ficar no ar por cerca de 2 semanas (até o 1º turno, em 4/10/2026, e eventualmente até o 2º turno). A lista de candidatos muda durante esse período.

> **Ponto de partida:** o `index.html` e o `candidatos.json` que acompanham este documento já são uma implementação funcional e testada. A tarefa é revisar, completar os pendentes (seção 10) e publicar, não recomeçar do zero.

---

## 1. Decisões tomadas

| Tema | Decisão | Motivo |
|---|---|---|
| Tipo de site | Estático: HTML + CSS + JS puro, sem framework e sem build | Simples, rápido e difícil de derrubar |
| Dados | Um arquivo `candidatos.json` na raiz, lido via `fetch` | Editar a lista = editar um arquivo, sem mexer no código |
| Hospedagem | Repositório no GitHub + Cloudflare Pages (alternativa: Netlify) | Grátis, CDN global, proteção contra DDoS, HTTPS automático, deploy a cada commit |
| Domínio | Domínio próprio já registrado, apontado via CNAME no painel do Pages | — |
| Paginação | Botão **"Carregar mais"**, 12 cards por vez | Melhor que paginação numerada no celular. 12 em vez de 24 corta pela metade as requisições de foto do primeiro carregamento |
| Busca | Um único campo que busca por nome, número, partido, sigla de UF ou nome do estado | Pedido do cliente |
| Filtro extra | Chips por cargo (Presidência, Governo, Senado, Dep. Federal, Dep. Estadual/Distrital) | Ajuda com listas grandes. Só aparecem os chips de cargos que existem nos dados |
| Filtros na URL | `?q=PE&cargo=senado` | Permite compartilhar um link já filtrado (ex.: "candidatos de PE") |
| Segurança do conteúdo | Todo texto do JSON é inserido com `textContent`, nunca `innerHTML`. Links só são aceitos se começarem com `https://` | Evita XSS por conteúdo colado errado na lista |

---

## 2. Identidade visual

Inspiração: estética vetorial de "sol nascente" (raios partindo do horizonte, sol, montanhas em silhueta), com as cores da bandeira do Brasil.

- **Raios:** verde e amarelo alternados, partindo do centro inferior do hero (`repeating-conic-gradient`, faixas de 6°).
- **Sol:** círculo azul com contorno creme, nascendo atrás das montanhas.
- **Montanhas:** silhueta azul-marinho (SVG), com traços creme em diagonal, no estilo gráfico da referência.
- **Tipografia:** *Archivo Black* nos títulos, número e marca. *Public Sans* no corpo. Os arquivos ficam em `fontes/`, servidos pelo próprio domínio — a página não depende do Google Fonts.
- **Estilo:** blocos chapados, bordas de 2px em marinho, sem sombras, sem gradientes suaves e sem cantos arredondados (exceto foto e sol).

### Tokens de cor

| Token | Hex | Uso |
|---|---|---|
| `--verde` | `#009C3B` | Raios |
| `--verde-escuro` | `#006B29` | Links, selo do partido (contraste AA com branco) |
| `--amarelo` | `#FFDF00` | Raios, título, faixa do número, chips |
| `--azul` | `#002776` | Sol, fundo da foto/iniciais |
| `--marinho` | `#0B1A33` | Montanhas, faixa da busca, bordas, texto |
| `--fundo` | `#F6F4EC` | Fundo da página |

---

## 3. Mockup (layout)

O mockup interativo foi feito no canvas de design do Claude. O link é privado e precisa ser compartilhado pelo dono (menu Share) para abrir:
https://claude.ai/artifact/6VZaCqMcXPMtBx9fTyU9gX

Estrutura da página, de cima para baixo:

```
┌──────────────────────────────────────────────────────────┐
│ [VOTE ESQUERDA]              [Eleições 2026 · 1º turno…] │  ← selos sobre o hero
│   \ \ \  raios verde/amarelo  / / /                      │
│      \ \ \      ( sol azul )     / / /                   │
│ ▲▲▲▲ montanhas marinho ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ │
├──────────────────────────────────────────────────────────┤  faixa marinho
│                  VOTE ESQUERDA (amarelo)                 │
│      Encontre candidatas e candidatos… (subtítulo)       │
│   Buscar candidato                                       │
│   ┌────────────────────────────────────────┬─────────┐   │
│   │ 🔍 Ex.: PE, PSOL, Maria, 1350…         │ Limpar  │   │  borda amarela 4px
│   └────────────────────────────────────────┴─────────┘   │
│   [Todos] [Governo] [Senado] [Dep. Federal] [Dep. Est.]  │  chips
├──────────────────────────────────────────────────────────┤  fundo creme
│ 37 candidaturas                Lista atualizada em …     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│ │ (foto) Nome  │ │              │ │              │       │  grade auto-fill,
│ │ Cargo · UF   │ │    card      │ │    card      │       │  mín. 300px/coluna
│ │ [PARTIDO]    │ │              │ │              │       │
│ │▓VOTE    1350▓│ │              │ │              │       │  ← faixa amarela
│ │ PROPOSTA …   │ │              │ │              │       │
│ │Rede │ TSE    │ │              │ │              │       │
│ └──────────────┘ └──────────────┘ └──────────────┘       │
│               [ CARREGAR MAIS (85) ]                     │
├──────────────────────────────────────────────────────────┤
│ VOTE ESQUERDA     Dados: TSE · [RESPONSÁVEL / CNPJ]      │  rodapé marinho
└──────────────────────────────────────────────────────────┘
```

### Card de candidato
1. Foto circular (84px, borda amarela). Sem foto, ou se a imagem falhar, aparecem as **iniciais** sobre fundo azul.
2. Nome, depois "Cargo · UF", depois o selo do partido (verde-escuro).
3. Faixa amarela com "VOTE" e o **número em destaque** (Archivo Black, 40px).
4. **Aviso de situação**, só quando `situacao` não está vazio: candidatura sub judice.
5. Proposta, ou "Proposta ainda não cadastrada." se o campo estiver vazio.
6. Dois links que abrem em nova aba: **Rede social** e **Candidatura no TSE**. Se o link não existir, o texto aparece em cinza, sem link.

### Responsivo
- Celular (390px): hero menor, título quebra em duas linhas, chips quebram linha, cards em 1 coluna, sem rolagem horizontal.
- Desktop: até 3–4 colunas (máx. 1280px de largura útil).

---

## 4. Formato dos dados — `candidatos.json`

```json
{
  "atualizado_em": "29/09/2026",
  "candidatos": [
    {
      "nome": "Nome de urna",
      "nome_completo": "Nome Completo de Registro",
      "numero": "1350",
      "uf": "PE",
      "cargo": "Deputada Federal",
      "partido": "PT",
      "proposta": "Texto curto (1–3 frases). Pode ficar vazio.",
      "foto": "fotos/1350-pe.jpg",
      "rede": "https://instagram.com/perfil",
      "tse": "https://divulgacandcontas.tse.jus.br/..."
    }
  ]
}
```

| Campo | Obrigatório | Observações |
|---|---|---|
| `nome` | sim | Nome de urna. Registros sem nome ou número são ignorados |
| `sq` | não | `SQ_CANDIDATO` do TSE. O site ignora este campo; fica no arquivo para recruzar com novas extrações |
| `nome_completo` | não | Nome de registro no TSE. Aparece em linha menor abaixo do nome de urna (só quando difere dele) e também entra na busca |
| `numero` | sim | Sempre **string** (preserva zeros e formatação). Tamanho por cargo: 2 dígitos (presidência, governo), 3 (senado), 4 (dep. federal), 5 (dep. estadual/distrital) |
| `uf` | sim | Sigla em maiúsculas. `BR` para presidência |
| `cargo` | sim | Texto livre. A categoria do chip é detectada pelo texto: *presid*, *govern*, *senad*, *federal*, *estadual/distrital*. Pode usar a forma feminina |
| `partido` | sim | Sigla |
| `situacao` | não | Aviso sobre o registro da candidatura. Vazio no caso normal (deferido). Quando preenchido, aparece numa faixa entre o número e a proposta, com barra vermelha à esquerda |
| `proposta` | não | Texto puro, sem HTML |
| `foto` | não | Caminho relativo (`fotos/…`) ou URL `https://`. Quadrada, 300×300, JPG/WebP, ~30 KB |
| `rede`, `tse` | não | Precisam começar com `https://`, senão são descartados |

- `destaque` (booleano) define quem aparece na tela inicial, antes de qualquer busca. Se **nenhum** candidato estiver marcado, o site abre listando todo mundo, de 24 em 24.
- `atualizado_em` aparece no topo da lista como "Lista atualizada em …". **Atualize a cada edição.**
- A ordem no arquivo não importa. O site ordena por cargo (Presidência → Dep. Estadual), depois por UF, depois por nome.
- Convenção de nome das fotos: `fotos/<numero>-<uf>.jpg`, tudo em minúsculas.

---

## 5. Comportamento

- **Busca:** ignora acentos e maiúsculas, com debounce de 120ms.
  - Exatamente 2 letras (ex.: `pe`) são tratadas como **sigla de UF**, com casamento exato. Isso evita que "pe" traga "Pereira".
  - Qualquer outro termo busca por trecho em nome, número, partido, UF e nome do estado (`pernambuco`, `sao paulo`).
- **Chips de cargo:** combinam com a busca (E lógico). "Todos" remove o filtro.
- **Carregar mais:** mostra 12 por vez e o botão exibe quantos faltam. Ao carregar, o foco do teclado vai para o primeiro card novo. Qualquer mudança de filtro volta aos 12 primeiros.
- **Estado vazio:** mensagem com dica ("Tente a sigla do estado…").
- **Erro ao carregar o JSON:** mensagem "Não foi possível carregar a lista".
- **URL:** busca e cargo são refletidos em `?q=` e `&cargo=` (via `replaceState`) e lidos ao abrir a página.
- **Carregamento em três etapas** (pensado para internet instável):
  1. A página desenha **esqueletos** de card assim que o HTML chega — nada espera a rede.
  2. Se houver cópia no *Cache Storage*, ela é exibida na hora, antes de qualquer resposta da rede.
  3. O `fetch` (com `cache: 'no-cache'`) revalida em segundo plano, atualiza o cache e repinta —
     mas **só se o conteúdo mudou**, comparando `atualizado_em` + total de registros. Assim uma
     revalidação não apaga a busca que o visitante já digitou.
  - Se a rede falhar e já houver lista do cache na tela, o erro é silencioso. A mensagem de erro
    só aparece quando não há nada para mostrar.
  - Edições continuam aparecendo sem o visitante limpar o cache: o `no-cache` da etapa 3 garante isso.

---

## 6. Estrutura do repositório

```
/
├── index.html          # página única (CSS e JS embutidos)
├── candidatos.json     # dados
├── fontes/             # Archivo Black e Public Sans (.woff2, subconjunto latin)
└── fotos/              # uma imagem por candidato
    └── 1350-pe.jpg
```

Teste local (o `fetch` não funciona abrindo o arquivo direto com `file://`):
```bash
python3 -m http.server 8000   # e abrir http://localhost:8000
```

---

## 7. Publicação

1. Criar um repositório no GitHub com os arquivos acima.
2. No Cloudflare Pages: *Create project → Connect to Git*, selecionar o repositório. Não há build command e o output directory é `/`.
3. Em *Custom domains*, adicionar o domínio e criar o CNAME indicado no DNS. O HTTPS é automático.
4. Cada commit na branch principal publica sozinho em 1–2 minutos.

### Rotina de atualização (para quem cuida da lista)
- **Adicionar:** editar `candidatos.json` pelo GitHub (ícone de lápis), colar um novo bloco, subir a foto em `fotos/`, atualizar `atualizado_em` e fazer commit.
- **Remover:** apagar o bloco e fazer commit.
- **Cuidado com vírgulas:** um JSON inválido quebra a lista. Recomendado: adicionar uma GitHub Action que valida o JSON a cada commit (ver seção 10).
- **Desfazer:** qualquer alteração pode ser revertida pelo histórico de commits.

---

## 8. Segurança

- **DDoS:** absorvido pelo CDN, já que não há servidor próprio.
- **Contas:** 2FA (app autenticador, não SMS) em **GitHub, Cloudflare/Netlify e no registro do domínio** (Registro.br ou outro). O risco real é alguém invadir uma dessas contas.
- **Editores:** cada pessoa com o próprio acesso ao repositório. Nunca compartilhar senha.
- **Conteúdo:** renderização só com `textContent`, links só `https://`, links externos com `rel="noopener noreferrer"`.
- **Sites falsos:** divulgar sempre o endereço exato. Se possível, registrar variações óbvias do domínio.
- Opcional: cabeçalhos de segurança via arquivo `_headers` do Cloudflare Pages/Netlify (CSP restringindo tudo a `'self'`, já que não há mais domínio externo; `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`). Nesse caso, mover o JS inline para `app.js`.

---

## 9. Acessibilidade (já implementado — manter)

- `<label>` no campo de busca, `role="search"` no formulário.
- Chips são `<button>` com `aria-pressed`.
- Contagem com `aria-live="polite"`, para que leitores de tela anunciem o total ao filtrar.
- Links externos com `aria-label` dizendo que abrem em nova aba.
- Alvos de toque de pelo menos 44px. Contraste AA (por isso o selo do partido usa verde-escuro, não o verde da bandeira).
- Hero decorativo com `aria-hidden`. Animação de entrada desativada com `prefers-reduced-motion`.

---

## 10. Pendentes para o desenvolvedor

- [ ] **Preencher o rodapé** com o responsável pela página (nome/CPF ou CNPJ), conforme a Resolução TSE nº 23.610/2019 sobre propaganda eleitoral na internet. **Confirmar as exigências com assessoria jurídica.**
- [x] Lista real carregada do Portal de Dados Abertos do TSE (3.789 candidaturas de PDT, PCdoB, PSOL, PT, PV, REDE, PCB, PSTU, UP e PCO). Ver seção 11.
- [x] Links do TSE: URL individual de cada candidatura no DivulgaCandContas (ver seção 11).
- [x] Pasta `fotos/` com as 3.789 fotos oficiais do TSE (~31 MB; os arquivos já vêm com ~8 KB, não precisaram de otimização).
- [ ] Marcar os `destaque: true` (hoje estão todos em `false`).
- [ ] Preencher o campo `proposta`: o TSE não publica texto de proposta, só PDFs de plano de governo para as majoritárias.
- [ ] GitHub Action para validar o `candidatos.json` a cada commit (ex.: `python -m json.tool candidatos.json` ou `jq . candidatos.json`), bloqueando deploy com JSON quebrado.
- [ ] Imagem de compartilhamento (`og:image`, 1200×630) com a identidade do hero, mais o favicon.
- [x] Fontes hospedadas localmente em `fontes/` (45 KB, subconjunto latin, que cobre 100% do conteúdo). A página não faz mais nenhuma requisição a domínio externo.
- [ ] (Opcional) Arquivo `_headers` com CSP (seção 8).
- [ ] Testar em celular real (Android/iOS) e com leitor de tela.

---

## 11. Origem dos dados (`candidatos.json`)

Gerado a partir do **Portal de Dados Abertos do TSE**, conjunto *Candidatos - 2026*
(https://dadosabertos.tse.jus.br/dataset/candidatos-2026), com a extração de 30/09/2026.

| Campo do site | Origem |
|---|---|
| `nome` | `NM_URNA_CANDIDATO` (consulta_cand) |
| `nome_completo` | `NM_CANDIDATO` |
| `numero`, `uf`, `cargo`, `partido` | `NR_CANDIDATO`, `SG_UF`, `DS_CARGO`, `SG_PARTIDO` |
| `sexo`, `etnia`, `instrucao` | `DS_GENERO`, `DS_COR_RACA`, `DS_GRAU_INSTRUCAO` |
| `patrimonio` | soma de `VR_BEM_CANDIDATO` (bem_candidato) |
| `situacao` | `DS_SITUACAO_JULGAMENTO` (consulta_cand_complementar) — filtra a lista e gera o aviso do card |
| `rede` | `DS_URL` (rede_social_candidato), 1 por candidatura |
| `foto` | pacotes oficiais `foto_cand2026_<UF>_div.zip`, renomeadas para `fotos/<numero>-<uf>.jpg` |
| `tse` | `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/<REGIÃO>/<UF>/20322002026/<SQ_CANDIDATO>/2026/<UF>` |
| `sq` | `SQ_CANDIDATO`, identificador da candidatura no TSE. O site ignora; serve para recruzar dados |
| `proposta` | **não vem do TSE** — fica vazio, para preenchimento manual |
| *orientação sexual, identidade de gênero* | **não estão nos dados abertos.** O DivulgaCandContas mostra os dois na página de cada candidatura, mas nenhum conjunto do portal publica esses campos |
| `destaque` | **não vem do TSE** — todos em `false`, para curadoria manual |

### O link do DivulgaCandContas

Em 2026 a URL da candidatura mudou de formato e ficou assim:

```
https://divulgacandcontas.tse.jus.br/divulga/#/candidato/NORDESTE/PE/20322002026/170002532723/2026/PE
                                                         └─região─┘ └UF┘ └──código──┘ └SQ_CANDIDATO┘ └ano┘ └UF┘
```

Dois detalhes que não dá para adivinhar:

- O **primeiro segmento é a região** (NORTE, NORDESTE, CENTRO-OESTE, SUDESTE, SUL), não a
  UF. Na presidencial é `BR`.
- O código `20322002026` **não é** o `CD_ELEICAO` dos dados abertos (6257/6259). É um código
  próprio do DivulgaCandContas, e em 2026 é o mesmo para a eleição federal e as estaduais.

O formato foi confirmado com duas URLs reais copiadas do site, uma presidencial e uma
estadual. Se o site mudar, o conserto é remontar a partir do campo `sq` de cada registro.

### Critérios aplicados no recorte

- **Partidos:** PDT, PCdoB, PSOL, PT, PV, REDE, PCB, PSTU, UP e PCO.
- **Cargos:** presidência, governo, senado, dep. federal, estadual e distrital.
  Vice-governador, vice-presidente e suplentes de senador **ficaram de fora**: não têm
  número próprio de votação e o site não tem chip para eles.
- **Rede social:** quando há mais de uma, escolhe na ordem Instagram → Facebook → X →
  TikTok → YouTube → Threads → outras. Descarta WhatsApp (é telefone pessoal), endereços
  digitados errado (`instagram@fulano`, `instagram.c`) e domínios-sósia (`nstagram.com`).
  846 candidaturas não têm nenhuma rede válida declarada.

### Situação do registro

O `consulta_cand` traz `DS_SITUACAO_CANDIDATURA` inteiro como `#NE` e não serve para
filtrar. Quem tem a informação é o conjunto **Informações complementares**
(`consulta_cand_complementar`), no campo `DS_SITUACAO_JULGAMENTO`.

Ficaram **de fora** 148 candidaturas: 98 renúncias, 48 indeferidas, 1 cancelada e 1 com
pedido não conhecido — gente que definitivamente não concorre. Estão todas listadas em
`excluidos.md`.

Continuam **na lista** as que estão sub judice (112 indeferidas em prazo recursal, 5
deferidas com recurso, 1 pendente de julgamento), porque aparecem na urna e o voto pode
valer se o recurso for aceito — mas o card **avisa**: essas 118 vêm com o campo `situacao`
preenchido e mostram a faixa de aviso. Para uma lista só com registro deferido, é trocar o
conjunto `FORA` no gerador.

### Como regerar

Os scripts de extração estão fora do repositório (foram de uso único). Para atualizar a
lista antes do 2º turno, o caminho é baixar de novo os três zips do portal e refazer o cruzamento
por `SQ_CANDIDATO`.
