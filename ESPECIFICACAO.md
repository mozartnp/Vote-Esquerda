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
| Busca e filtros | Um painel único à esquerda dos resultados. O topo da página não tem controle nenhum | Busca e filtro espalhados em dois lugares era a origem da confusão: ninguém sabia que dava para combinar |
| Busca | Campo de texto dentro do painel, que procura só por **nome, nome completo e número** | Partido e estado saíram dela porque agora têm faceta própria. Um campo que fazia tudo ao mesmo tempo não deixava claro o que ele fazia |
| Filtros | 13 facetas, todas combináveis. Marcar dois valores na mesma faceta **soma** (PSOL *ou* PT); facetas diferentes **cruzam** (PSOL *e* mulher *e* PE) | Era o segundo pedido mais repetido: não dava para combinar nada |
| Filtros na URL | `?uf=PE&partido=PSOL\|PT&sexo=Feminino` | Qualquer recorte montado no painel vira link compartilhável |
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
| `--amarelo` | `#FFDF00` | Raios, faixa do número, fichas do seletor de povo |
| `--azul` | `#002776` | Sol, fundo da foto/iniciais |
| `--marinho` | `#0B1A33` | Montanhas, faixa do título, cabeçalho do painel, bordas, texto |
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
│                  VOTE ESQUERDA (vermelho)                │
│      Encontre candidatas e candidatos… (subtítulo)       │  nenhum controle aqui
├──────────────────────────────────────────────────────────┤  fundo creme
│ ┌────────────────────┐  3.789 candidaturas               │
│ │ BUSCAR E FILTRAR ✕ │  ┌──────────┐ ┌──────────┐        │
│ │ 🔍 Nome ou número  │  │ (foto)   │ │          │        │  grade auto-fill,
│ │ ☐ Recomendação  27 │  │ Nome     │ │   card   │        │  mín. 340px/coluna
│ │ Cargo            + │  │▓VOTE 1350│ │          │        │  ← faixa amarela
│ │ Estado         1 + │  │Rede │ TSE│ │          │        │
│ │ Partido        2 + │  └──────────┘ └──────────┘        │
│ │ Federação        + │  ┌──────────┐ ┌──────────┐        │
│ │ Gênero           + │  │          │ │          │        │
│ │ Cor ou raça      + │  │   card   │ │   card   │        │
│ │ Idade            + │  │          │ │          │        │
│ │ Escolaridade     + │  └──────────┘ └──────────┘        │
│ │ Ocupação         + │                                   │
│ │ Patrimônio       + │     [ CARREGAR MAIS (85) ]        │
│ │ ☐ Indígena    105 │                                   │
│ │ Povo indígena    + │                                   │
│ │ ☐ Quilombola    81 │                                   │
│ └────────────────────┘  painel grudado no topo (sticky)  │
├──────────────────────────────────────────────────────────┤
│ VOTE ESQUERDA     Dados: TSE · [RESPONSÁVEL / CNPJ]      │  rodapé marinho
└──────────────────────────────────────────────────────────┘
```

### O painel

- **Busca** fora da área rolável: é o primeiro recurso de quem já sabe em quem votar,
  e não pode sumir quando o visitante rola as facetas.
- **Facetas** são `<details>` nativos, **todas fechadas** ao abrir a página. O número
  vermelho no cabeçalho diz quantos valores estão marcados naquela faceta.
- Cada valor mostra **quantas candidaturas ainda restam** se ele for marcado, contado
  ignorando a própria faceta — é por isso que marcar PSOL não zera o PT na mesma lista.
  Valor que não sobrou ninguém **desbota, mas não some**: lista que encolhe e cresce a
  cada clique é lista em que ninguém acha de novo o que acabou de ver.
- **Alternador** (um valor só): "Recomendação do site", "Candidatura indígena" e
  "Candidatura quilombola" são marcações diretas, sem acordeão em volta. **Nenhuma vem
  marcada** — a página abre listando todo mundo.
- **Estado não lista "Brasil".** `BR` não é um estado: é a abrangência nacional das cinco
  candidaturas à presidência, que se acham pelo cargo ou pelo nome. São 27 opções, não 28.
- Os três marcadores de identidade ficam juntos no pé do painel. "Candidatura indígena"
  cobre as 105 (`etnia` = Indígena), **inclusive as 15 que não declararam povo** e que por
  isso não aparecem no seletor logo abaixo.
- **Povo indígena** é um seletor com busca: 46 povos, quase todos com uma candidatura só.
  O visitante digita, e o que escolhe vira ficha dentro do próprio campo. **Os povos que
  existem no recorte atual sobem para o topo**: com MS marcado a lista abre em Guarani
  Kaiowá (9), Guató (2), Atikum, Guaraní e Terena (1 cada), e só então os zerados. É a
  única lista do painel que se reordena conforme o filtro, porque é uma lista que se
  percorre lendo, não uma em que se guarda a posição.
### Card de candidato
1. Foto circular (84px, borda amarela). Sem foto, ou se a imagem falhar, aparecem as **iniciais** sobre fundo azul.
2. Selo **RECOMENDAÇÃO** (amarelo sobre marinho) quando `destaque: true`, depois nome,
   "Cargo · UF" e o selo do partido.
3. Faixa amarela com "VOTE" e o **número em destaque** (Archivo Black, 40px).
4. **Aviso de situação**, só quando `situacao` não está vazio: candidatura sub judice.
5. Proposta, ou "Proposta ainda não cadastrada." se o campo estiver vazio.
6. **"Informações da candidata" / "do candidato"** — `<details>` fechado, com o que alimenta os filtros:
   federação, idade, gênero, cor ou raça, povo indígena, quilombola, escolaridade, ocupação
   e patrimônio. Quem chegou ali por um filtro ("mulheres negras do PSOL") enxerga de onde
   aquilo saiu, sem abrir a página do TSE.
   - Linha que não tem dado **não é criada** — povo e quilombola só aparecem em quem os tem.
   - A ocupação mostrada é a **declarada** (`ocupacao_declarada`), não o grupo do filtro:
     "Torneiro mecânico" diz muito mais que "Trabalho urbano e serviços".
   - Patrimônio em reais (`toLocaleString('pt-BR')`). Valor 0 vira **"Sem bens declarados"** —
     no TSE isso é ausência de declaração, não patrimônio zero, e o texto precisa dizer isso.
   - O rótulo **concorda com o gênero** (`sexo`), como já acontece no cargo ("Senadora · PE"
     no card de "Informações da candidata"). Se `sexo` vier ausente, vazio ou com valor
     inesperado, cai em **"Informações da candidatura"** — o JSON é editado à mão.
   - O `<summary>` leva o nome da candidatura num `.sr-only` depois do texto visível: sem
     isso, uma lista de 12 cards anuncia doze vezes o mesmo rótulo para quem usa leitor de
     tela. O texto visível continua sendo o início do nome acessível (WCAG 2.5.3).
   - Abrir um card **estica a fileira inteira**: a grade iguala as alturas e a folga vai para
     a área da foto dos vizinhos, pelo `flex:1` do `.card-topo`. Se incomodar, `align-items:start`
     na `.grade` resolve, ao custo de fileiras com a base irregular.
7. Dois links que abrem em nova aba: **Rede social** e **Candidatura no TSE**. Se o link não existir, o texto aparece em cinza, sem link.

### Responsivo
- Celular (até 900px): o painel vira **gaveta de tela inteira**, atrás de um botão
  "BUSCAR E FILTRAR" com o número de filtros ativos. Não dá para deixar a coluna fixa: ela
  sozinha ocuparia a altura da tela antes do primeiro card. Com as facetas fechadas, as 13
  cabem numa tela de 390×844 sem rolagem. A busca vai junto, dentro da gaveta — o topo da
  página fica sem controle nenhum, em celular e em desktop.
- Desktop: painel grudado no topo (`sticky`) + grade, container de até **1780px** (não os
  1280px de antes: o painel come largura útil, e em 1280 sobravam duas colunas esticadas de
  451px com tela vazia dos dois lados).
- **O piso do card é 340px, e isso não é palpite:** "Candidatura no TSE" mede 141px, a linha
  de links divide o card em duas metades iguais, e abaixo de 320px de card o rótulo quebra em
  duas linhas. 340 deixa folga para a fonte de reserva.
- Entre 901px e 1439px o painel encolhe para 240px. Num notebook de 1366 com painel de 300px
  só caberiam duas colunas, e o card esticava para 487px; com 240px cabem três de 341px. O
  custo é rótulo longo de faceta ("Dep. Estadual/Distrital") quebrar em duas linhas, que é
  mais barato do que perder um terço dos cards por fileira.

| viewport | painel | colunas | card |
|---|---|---|---|
| 1024 | 240px | 2 | 351px |
| 1280 | 240px | 2 | 479px |
| 1366 | 240px | 3 | 341px |
| 1440 | 300px | 3 | 342px |
| 1512 | 300px | 3 | 366px |
| 1920 e acima | 300px | 4 | 341px |

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
| `cargo` | sim | Texto livre. A categoria da faceta é detectada pelo texto: *presid*, *govern*, *senad*, *federal*, *estadual/distrital*. Pode usar a forma feminina |
| `partido` | sim | Sigla |
| `situacao` | não | Aviso sobre o registro da candidatura. Vazio no caso normal (deferido). Quando preenchido, aparece numa faixa entre o número e a proposta, com barra vermelha à esquerda |
| `proposta` | não | Texto puro, sem HTML |
| `foto` | não | Caminho relativo (`fotos/…`) ou URL `https://`. Quadrada, 300×300, JPG/WebP, ~30 KB |
| `rede`, `tse` | não | Precisam começar com `https://`, senão são descartados |

- `destaque` (booleano) alimenta o selo **RECOMENDAÇÃO** do card e a faceta "Recomendação do site". No dado o campo continua `destaque`; na tela ele se chama recomendação, que é o que a marcação quer dizer para quem lê. A faceta **não vem marcada** — a página abre listando todo mundo. Se nenhum candidato estiver marcado, ela não aparece.
- `atualizado_em` aparece no topo da lista como "Lista atualizada em …". **Atualize a cada edição.**
- A ordem no arquivo não importa. O site ordena por cargo (Presidência → Dep. Estadual), depois por UF, depois por nome.
- Convenção de nome das fotos: `fotos/<numero>-<uf>.jpg`, tudo em minúsculas.

---

## 5. Comportamento

- **Busca:** ignora acentos e maiúsculas, com debounce de 120ms. Procura por trecho em
  **nome e nome completo**.
  - Termo **só de dígitos** casa o número **por prefixo**, não por pedaço. O número de urna
    é hierárquico: `13` é o PT, `1301` uma federal do PT, `13000` uma estadual. Então `13`
    devolve exatamente as 1.045 candidaturas do PT, e não também o `25130` de outro partido.
- **Filtros:** 13 facetas. Dentro da mesma faceta os valores **somam** (OU); entre facetas
  eles **cruzam** (E).
- **Carregar mais:** mostra 12 por vez e o botão exibe quantos faltam. Ao carregar, o foco do teclado vai para o primeiro card novo. Qualquer mudança de filtro volta aos 12 primeiros.
- **Estado vazio:** a mensagem muda conforme o motivo — filtros demais, ou busca sem
  resultado (e aí lembra que estado e partido são filtros, não busca).
- **Erro ao carregar o JSON:** mensagem "Não foi possível carregar a lista".
- **URL:** busca e todas as facetas viram parâmetros, via `replaceState`, e são lidos ao abrir.
  Valores de uma faceta separados por `|`. Os alternadores usam `1`/`0` em vez de repetir o
  rótulo inteiro codificado (`?recomendacao=1`, `?indigena=1`, `?quilombola=1`). Links
  antigos no formato `?cargo=senado` continuam funcionando.
- **Carregamento em três etapas** (pensado para internet instável):
  1. A página desenha **esqueletos** de card assim que o HTML chega — nada espera a rede.
  2. Se houver cópia no *Cache Storage*, ela é exibida na hora, antes de qualquer resposta da rede.
  3. O `fetch` (com `cache: 'no-cache'`) revalida em segundo plano, atualiza o cache e repinta —
     mas **só se o conteúdo mudou**, comparando o **ETag** da resposta da rede com o da cópia
     guardada (e caindo no `Last-Modified` se o servidor não mandar ETag). Assim uma revalidação
     não zera o "carregar mais" que o visitante já usou.
  - Se a rede falhar e já houver lista do cache na tela, o erro é silencioso. A mensagem de erro
    só aparece quando não há nada para mostrar.
  - Edições continuam aparecendo sem o visitante limpar o cache: o `no-cache` da etapa 3 garante isso.

  > A comparação **era** `atualizado_em` + total de registros, e isso tinha um furo sério: marcar
  > um destaque, escrever uma proposta ou acrescentar um campo não mexe em nenhum dos dois, então
  > a cópia nova era descartada como "igual" e quem tinha a lista em cache ficava preso na versão
  > velha indefinidamente. Só aparecia em conexão lenta — justo onde o cache serve para alguma
  > coisa, porque é o único caso em que ele ganha a corrida da rede. O ETag é content-based e o
  > `_headers` já serve `/candidatos.json` com `max-age=0, must-revalidate`, então ele sempre vem.
  > Sem carimbo nenhum o código repinta: perder a paginação é menos grave que servir lista velha.

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
- Facetas são `<details>`/`<summary>` nativos, navegáveis por teclado sem JS.
- O seletor de povo indígena segue o padrão *combobox* da WAI-ARIA: `role="combobox"` com
  `aria-expanded` e `aria-controls` no campo, `role="listbox"`/`role="option"` na lista,
  `aria-activedescendant` acompanhando as setas, e Enter, Esc e Backspace ligados.
- A gaveta do celular fecha no Esc e devolve o foco ao botão que a abriu.
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
- [ ] Marcar os `destaque: true` — o selo RECOMENDAÇÃO do card e a faceta "Recomendação do site".
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
| `idade` | calculada de `DT_NASCIMENTO` na data do 1º turno (04/10/2026). **Não** é o `NR_IDADE_DATA_POSSE` do conjunto complementar: aquele é a idade em 1º de janeiro de 2027 e sai um ano mais velho em 2.130 das candidaturas |
| `ocupacao` | `DS_OCUPACAO` agrupada. O TSE tem 168 valores, de `ADVOGADO` a `ENGRAXATE` — inutilizável como filtro. Cada um cai em um de 17 grupos (ver abaixo) |
| `ocupacao_declarada` | a `DS_OCUPACAO` crua, só passada para caixa de frase como o resto do arquivo (`ADVOGADO` → `Advogado`). O site não usa hoje; fica para o card mostrar "Professor de ensino médio" em vez do grupo "Educação", e para recruzar sem voltar ao CSV |
| `federacao` | de `SG_FEDERACAO`. Três valores: `Brasil da Esperança (PT, PCdoB, PV)` 1.401 · `PSOL e REDE` 1.028 · `Sem federação` 1.360 (PDT, UP, PCO, PSTU, PCB) |
| `quilombola` | `ST_QUILOMBOLA` (complementar), booleano. 81 candidaturas |
| `povo` | `DS_ETNIA_INDIGENA` (complementar). 90 candidaturas em 46 povos — Guarani Kaiowá 9, Makuxí 8, Mundurukú 5… `NÃO INFORMADA`, `#NULO`, `MAL DEFINIDAS` e `NÃO DETERMINADA` viram string vazia: são ausência de dado, não um povo. Todas as 90 têm `etnia` = Indígena; 15 indígenas não declararam povo |
| `patrimonio` | soma de `VR_BEM_CANDIDATO` (bem_candidato) |
| `situacao` | `DS_SITUACAO_JULGAMENTO` (consulta_cand_complementar) — filtra a lista e gera o aviso do card |
| `rede` | `DS_URL` (rede_social_candidato), 1 por candidatura |
| `foto` | pacotes oficiais `foto_cand2026_<UF>_div.zip`, renomeadas para `fotos/<numero>-<uf>.jpg` |
| `tse` | `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/<REGIÃO>/<UF>/20322002026/<SQ_CANDIDATO>/2026/<UF>` |
| `sq` | `SQ_CANDIDATO`, identificador da candidatura no TSE. O site ignora; serve para recruzar dados |
| `proposta` | **não vem do TSE** — fica vazio, para preenchimento manual |
| *orientação sexual, identidade de gênero* | **não estão nos dados abertos.** O DivulgaCandContas mostra os dois na página de cada candidatura, mas nenhum conjunto do portal publica esses campos |
| `destaque` | **não vem do TSE** — curadoria manual. Vira o selo RECOMENDAÇÃO no card |

### Os grupos de ocupação

Como o recorte de partidos, o agrupamento das 168 ocupações do TSE é curadoria
autoral, não classificação oficial. A regra é a primeira que casar, então a ordem
importa: `APOSENTADO (EXCETO SERVIDOR PÚBLICO)` precisa ser testado antes de
`SERVIDOR P`, e `ATLETA PROFISSIONAL E TÉCNICO EM DESPORTOS` antes de `TÉCNICO E`.

| Grupo | Candidaturas |
|---|---|
| Mandato e serviço público | 623 |
| Outros / não informado (o `OUTROS` do próprio TSE) | 547 |
| Educação | 464 |
| Comércio e empresariado | 383 |
| Direito | 269 |
| Trabalho urbano e serviços (o que sobra: motorista, garçom, pedreiro, faxineiro, cabeleireiro…) | 241 |
| Saúde | 221 |
| Economia, gestão e finanças | 186 |
| Comunicação, arte e cultura | 174 |
| Estudante | 170 |
| Aposentado | 158 |
| Campo, pesca e agropecuária | 131 |
| Ciências, tecnologia e engenharia | 101 |
| Segurança e forças armadas | 75 |
| Dona ou dono de casa | 29 |
| Religioso | 11 |
| Esporte | 6 |

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
  número próprio de votação e o site não tem faceta para eles.
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
