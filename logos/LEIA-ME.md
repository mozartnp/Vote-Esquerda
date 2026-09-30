# Logos dos partidos

O card do candidato mostra a logo do partido no lugar da sigla. O nome do
arquivo vem da sigla em `candidatos.json`, em minúsculas e sem pontuação.

| Sigla | Arquivo | Origem no Wikimedia Commons | Licença |
|---|---|---|---|
| PT    | `pt.svg`    | PT (Brazil) logo 2021.svg | Domínio público |
| PCdoB | `pcdob.svg` | PCdoB logo (red).svg | Domínio público |
| PSOL  | `psol.svg`  | Logo PSOL roxo.svg | Domínio público |
| PDT   | `pdt.svg`   | Logo of the Democratic Labour Party (Brazil).svg | Domínio público |
| PV    | `pv.svg`    | Logomarca do Partido Verde.svg | Domínio público |
| REDE  | `rede.svg`  | Rede Sustentabilidade logo.svg | Domínio público |
| PСB   | `pcb.svg`   | PCB Logo.svg — por PCB, pcb.org.br | **CC BY 4.0** |
| PSTU  | `pstu.svg`  | Flag of the PSTU.svg — por Lucas Friederich | Domínio público |
| UP    | `up.svg`    | Unidade Popular logo.svg — por Unidade Popular | Domínio público |
| PCO   | `pco.svg`   | Logo PCO Institucional.svg — por Calloshccp | **CC BY-SA 4.0** |

## Quatro ressalvas

**PCB** — CC BY 4.0 exige crédito visível. Já está no rodapé do `index.html`.
Se trocar esse arquivo, mantenha ou ajuste a linha de crédito.

**UP** — o arquivo do Commons vinha com `fill:#ffff`, hex inválido de 4 dígitos,
pensado para fundo escuro: renderiza branco e some no card. Troquei por `#000000`.
Preto está certo — as cores oficiais do partido são preto e branco —, mas se
aparecer o manual de marca, vale conferir. Existe outra versão no Commons
(*Unidade Popular Logo.svg*, com o texto "unidade popular" por extenso), em
CC BY-SA 4.0: se trocar por ela, é preciso creditar **e** a cláusula
*share-alike* passa a valer.

**PCO** — única sob **CC BY-SA 4.0**: exige crédito (já está no rodapé do
`index.html`) e, se alguém alterar o arquivo, a versão alterada tem de sair sob a
mesma licença. É também a única logo com **fundo chapado** (vermelho), em vez de
transparente: é assim a marca do partido, amarelo sobre vermelho. A versão
transparente que existe no Commons é amarela e sumiria no card branco.

**PSTU** — é a **bandeira** do partido, não a logo. Não existe a logo em SVG no
Commons; só um PNG de 139×90 px, pequeno demais. Se conseguir o arquivo oficial,
substitua.

Os arquivos vieram do Commons, que é enviado por voluntários. As marcações de
domínio público se apoiam em "forma geométrica simples demais para ter
copyright" — avaliação de quem subiu, não do partido. Para fidelidade de cor e
proporção, a fonte certa é o manual de marca de cada partido.

## Acrescentar outro partido

Salve o arquivo como `<sigla em minúsculas>.svg` e pronto — o código encontra
sozinho, sem precisar editar nada. `.png` também funciona: a página tenta
`.svg` primeiro, depois `.png`, e se nenhum existir volta a exibir a sigla em
texto. A lista nunca quebra por falta de arquivo.

## Formato

- A altura renderizada é 24px, largura automática, teto de 140px.
  A da REDE é a mais larga: 134px nessa altura.
- Fundo transparente. O card é branco. (Exceção: `pco.svg`, ver ressalvas.)
- Se usar PNG, exporte com pelo menos 96px de altura para telas retina.
