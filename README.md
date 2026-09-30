# Vote Esquerda

Site com as candidaturas do campo progressista nas eleições de 2026, com busca por nome, número, partido ou estado.

HTML, CSS e JavaScript puros: sem framework, sem build, sem dependências para instalar.

## Rodando localmente

O site lê o `candidatos.json` via `fetch`, então abrir o arquivo direto com `file://`
não funciona. Suba um servidor na pasta do projeto:

```bash
python3 -m http.server 8000
```

E abra <http://localhost:8000>.

## Arquivos

```
index.html         página inteira (CSS e JS embutidos)
candidatos.json    a lista de candidaturas
fotos/             uma foto por candidatura (3.921 arquivos, ~31 MB)
logos/             logos dos partidos em SVG
ESPECIFICACAO.md   documentação completa: layout, cores, comportamento, pendências
substituicoes.md   ajustes manuais feitos na extração do TSE
```

## Editando a lista

Mexer na lista é mexer só no `candidatos.json`. Cada candidatura é um objeto:

```json
{
  "nome": "Nome de urna",
  "numero": "1350",
  "uf": "PE",
  "cargo": "Deputada Federal",
  "partido": "PT",
  "proposta": "Texto curto, pode ficar vazio.",
  "foto": "fotos/1350-pe.jpg",
  "rede": "https://instagram.com/perfil",
  "tse": "https://divulgacandcontas.tse.jus.br/..."
}
```

- `nome`, `numero`, `uf`, `cargo` e `partido` são obrigatórios. O resto é opcional.
- `numero` é sempre **string**, para preservar zeros à esquerda.
- `rede` e `tse` só são aceitos se começarem com `https://`.
- Marque `"destaque": true` em quem deve aparecer na tela inicial, antes de qualquer busca.
- Atualize o `atualizado_em` no topo do arquivo a cada edição — ele aparece na página.
- A ordem no arquivo não importa: o site ordena por cargo, UF e nome.

Antes de publicar, confira se o JSON continua válido:

```bash
python3 -m json.tool candidatos.json > /dev/null && echo ok
```

A tabela completa dos campos está na seção 4 do [ESPECIFICACAO.md](ESPECIFICACAO.md).

## Publicando

Site estático: basta servir a pasta como está. No Cloudflare Pages, conecte o
repositório sem build command e com output directory `/`. Cada commit no `main`
publica automaticamente.

## Dados

A lista vem do [Portal de Dados Abertos do TSE](https://dadosabertos.tse.jus.br/dataset/candidatos-2026),
extração de 30/09/2026, filtrada pelos partidos PDT, PCdoB, PSOL, PT, PV, REDE, PCB,
PSTU, UP e PCO. As fotos são as oficiais do TSE. Os campos `proposta` e `destaque` não
existem nos dados abertos e são preenchidos à mão.

