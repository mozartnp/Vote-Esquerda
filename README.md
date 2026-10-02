# Vote Esquerda

Site com as candidaturas do campo progressista nas eleições de 2026, com busca por nome, número, partido ou estado, e uma **colinha** para montar e imprimir a lista de quem votar.

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
index.html         a marcação da página
css/estilo.css     todo o CSS
js/                os módulos, nesta ordem de dependência:
  base.js          constantes, elementos e ajudantes
  catalogo.js      a lista: facetas, carregamento, painel, card
  colinha.js       a colinha: vagas, busca, santinho, imagem
  principal.js     entrada: amarra os eventos e dá a partida
candidatos.json    a lista de candidaturas
fotos/             uma foto por candidatura (3.921 arquivos, ~31 MB)
logos/             logos dos partidos em SVG
ESPECIFICACAO.md   documentação completa: layout, cores, comportamento, pendências
substituicoes.md   ajustes manuais feitos na extração do TSE
```

## A colinha

O visitante monta as seis vagas da cédula **na ordem da urna** (Dep. Federal, Dep. Estadual,
Senador 1, Senador 2, Governador e Presidente) e leva impressa para a urna — na hora de votar
não pode levar o celular. Vaga não preenchida sai com a linha do nome pontilhada e as caixas
do número em branco, então dá para imprimir em branco e completar à mão.

Cada vaga vazia é um **campo de busca**: dá para preencher pelo nome ou pelo número, sem
precisar procurar o card na lista. A lista de sugestões já vem recortada pelo cargo e pelo
estado da colinha, e a primeira entrada é sempre **deixar em branco e ir para o próximo
cargo**, para quem vai completar à mão depois de imprimir.

Uma chave liga/desliga decide se a **foto dos candidatos** entra na impressão e na imagem.
Vem **ligada**: com o retrato ao lado do número dá para conferir de relance que a colinha
está certa. Quem imprime em preto e branco ou quer poupar tinta desliga, e a preferência
fica guardada junto com a colinha.

A seleção fica **só no `localStorage` do navegador**: não há banco de dados e nada sai da
máquina de quem acessa. Sem `localStorage` disponível (aba privada, por exemplo) a página
continua funcionando igual, só não lembra a colinha na próxima visita.

Imprime em folha inteira ou em 4 santinhos com linha de corte, tudo por `@media print` —
sem servidor e sem gerar PDF no backend. Também baixa como PNG (desenhado no `<canvas>`) e
envia no WhatsApp.

Detalhes de comportamento na seção 6 do [ESPECIFICACAO.md](ESPECIFICACAO.md).

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

Site estático: basta servir a pasta como está, sem build command e com a raiz
do repositório como diretório de saída. Nas CDNs usuais dá para ligar no
repositório e publicar a cada commit no `main`.

O `_headers` (Cloudflare, Netlify) cuida de CSP e cache — ver os comentários
dentro dele antes de mexer.

## Dados

A lista vem do [Portal de Dados Abertos do TSE](https://dadosabertos.tse.jus.br/dataset/candidatos-2026),
extração de 30/09/2026 revisada em 02/10/2026, filtrada pelos partidos PDT, PCdoB, PSOL,
PT, PV, REDE, PCB, PSTU, UP e PCO. As fotos são as oficiais do TSE. Os campos `proposta` e `destaque` não
existem nos dados abertos e são preenchidos à mão.

