# Candidaturas excluídas da lista

Extração do TSE de 30/09/2026. Estas 148 candidaturas existem no dataset dos 10 partidos,
mas **não entraram** no `candidatos.json`.

## O critério

O `consulta_cand` traz `DS_SITUACAO_CANDIDATURA` como `#NE` e não serve para nada. Quem
tem a informação é o conjunto **Informações complementares**, no campo
`DS_SITUACAO_JULGAMENTO`. Ficaram de fora:

| Situação | Quantas | Por quê |
|---|---|---|
| RENÚNCIA | 98 | Retirou a candidatura |
| INDEFERIDO | 48 | Registro negado, sem recurso pendente |
| CANCELADO | 1 | Registro cancelado |
| PEDIDO NÃO CONHECIDO | 1 | Pedido sequer conhecido |

Continuam **na lista** quem está sub judice — `INDEFERIDO EM PRAZO RECURSAL OU COM
RECURSO` (112), `DEFERIDO EM PRAZO RECURSAL` (5) e `PENDENTE DE JULGAMENTO` (1) —,
porque essas candidaturas aparecem na urna e o voto pode valer se o recurso for aceito.
Se preferir uma lista só com registro deferido, é trocar uma linha no gerador.

## RENÚNCIA (98)

- **Lenne Braga** · AC · REDE · nº 18444 · Deputado Estadual — `SQ 10002552779`
- **Jose Carlos** · AC · PSOL · nº 5055 · Deputado Federal — `SQ 10002545664`
- **Mazinho Da Ecobarreira** · AM · PDT · nº 12070 · Deputado Estadual — `SQ 40002546999`
- **Herbert Amazonas** · AM · PT · nº 13116 · Deputado Estadual — `SQ 40002545602`
- **Ruan Wendell** · AM · PCDOB · nº 65065 · Deputado Estadual — `SQ 40002554429`
- **Lucia Antony** · AM · PCDOB · nº 65123 · Deputado Estadual — `SQ 40002554430`
- **Eron Bezerra** · AM · PCDOB · nº 65656 · Deputado Estadual — `SQ 40002545609`
- **Daiana Paula** · BA · PDT · nº 1277 · Deputado Federal — `SQ 50002531415`
- **Pacífico De Mãe Bernadete** · BA · REDE · nº 1819 · Deputado Federal — `SQ 50002535857`
- **Ita Luz Do Vat** · BA · PSOL · nº 5044 · Deputado Federal — `SQ 50002535850`
- **Rebeca Mota** · CE · PDT · nº 1210 · Deputado Federal — `SQ 60002536603`
- **João Arthur** · CE · PDT · nº 1213 · Deputado Federal — `SQ 60002536606`
- **Audic Mota** · CE · PT · nº 1300 · Deputado Federal — `SQ 60002540741`
- **Dona Bruna Do Pt** · CE · PT · nº 13100 · Deputado Estadual — `SQ 60002540700`
- **Reno Ximenes** · CE · PT · nº 13555 · Deputado Estadual — `SQ 60002540724`
- **Alyson Soares** · CE · PT · nº 13780 · Deputado Estadual — `SQ 60002540723`
- **Raimundão** · CE · PSTU · nº 16000 · Deputado Estadual — `SQ 60002550750`
- **Professora Margarete Leite** · CE · REDE · nº 18123 · Deputado Estadual — `SQ 60002538642`
- **Gigi Barbosa** · CE · PV · nº 4321 · Deputado Federal — `SQ 60002540745`
- **Dra Priscilla** · CE · PV · nº 43333 · Deputado Estadual — `SQ 60002540722`
- **Wilton Silva** · CE · PSOL · nº 5035 · Deputado Federal — `SQ 60002538320`
- **Chiquinho Livreiro** · DF · REDE · nº 18011 · Deputado Distrital — `SQ 70002533412`
- **Devarli Correa** · ES · PT · nº 13000 · Deputado Estadual — `SQ 80002549077`
- **Terapeuta Ariel Luz** · GO · PT · nº 13310 · Deputado Estadual — `SQ 90002540146`
- **Pedro Damião** · GO · REDE · nº 18728 · Deputado Estadual — `SQ 90002543845`
- **Macarrão Do Esporte** · GO · PSOL · nº 50178 · Deputado Estadual — `SQ 90002543844`
- **Gato Félix** · MA · PCB · nº 21021 · Deputado Estadual — `SQ 100002550524`
- **Marcos Freitas** · MA · PSOL · nº 50022 · Deputado Estadual — `SQ 100002553744`
- **Douglas De Paula** · MG · PDT · nº 12015 · Deputado Estadual — `SQ 130002540047`
- **Marcelo Heringer** · MG · PDT · nº 123 · Senador — `SQ 130002553856`
- **Fala Luiz** · MG · PDT · nº 12333 · Deputado Estadual — `SQ 130002540028`
- **Arlan Do Povão** · MG · PDT · nº 1290 · Deputado Federal — `SQ 130002538300`
- **Ramsés De Castro** · MG · PT · nº 1399 · Deputado Federal — `SQ 130002535310`
- **Cleber Da Caixa** · MG · REDE · nº 1808 · Deputado Federal — `SQ 130002538962`
- **Fernanda Khoiri** · MG · REDE · nº 1811 · Deputado Federal — `SQ 130002539737`
- **Gilson Scassiotti** · MG · REDE · nº 18150 · Deputado Estadual — `SQ 130002539517`
- **André Cabral** · MG · REDE · nº 18188 · Deputado Estadual — `SQ 130002539505`
- **Nathalia Godinho** · MG · REDE · nº 18283 · Deputado Estadual — `SQ 130002539511`
- **Eliene Chaves** · MG · REDE · nº 1855 · Deputado Federal — `SQ 130002554390`
- **Tiago Santana** · MG · PCDOB · nº 65653 · Deputado Estadual — `SQ 130002535372`
- **Gilmar Garcia** · MS · PV · nº 43123 · Deputado Estadual — `SQ 120002547050`
- **Thalita** · MS · PCDOB · nº 6523 · Deputado Federal — `SQ 120002537461`
- **Jair Do Povo** · MT · PDT · nº 1212 · Deputado Federal — `SQ 110002547791`
- **Frank Sabiá** · MT · REDE · nº 18318 · Deputado Estadual — `SQ 110002548609`
- **Vicente Sampaio** · MT · REDE · nº 18500 · Deputado Estadual — `SQ 110002548613`
- **Carvalho** · MT · REDE · nº 18777 · Deputado Estadual — `SQ 110002548602`
- **Ximbinha** · PA · PDT · nº 1288 · Deputado Federal — `SQ 140002538481`
- **Professor Márcio Ponte** · PA · PDT · nº 1299 · Deputado Federal — `SQ 140002538483`
- **Cleber Rabelo** · PA · PSTU · nº 16 · Governador — `SQ 140002538631`
- **Elaine Karla** · PB · PDT · nº 12247 · Deputado Estadual — `SQ 150002553984`
- **Dr. Erico** · PB · PDT · nº 12345 · Deputado Estadual — `SQ 150002551588`
- **Eviliane Lins** · PB · PDT · nº 1267 · Deputado Federal — `SQ 150002552387`
- **Luiza Bernardo** · PB · PT · nº 1398 · Deputado Federal — `SQ 150002544175`
- **Tota Dos Animais** · PB · REDE · nº 1856 · Deputado Federal — `SQ 150002550470`
- **Cícero Simplício** · PB · REDE · nº 18800 · Deputado Estadual — `SQ 150002549746`
- **Nino Do Rangel** · PB · PV · nº 4300 · Deputado Federal — `SQ 150002544179`
- **Marcella Viana** · PB · PV · nº 4343 · Deputado Federal — `SQ 150002544172`
- **Janaína Gomes** · PE · PDT · nº 1215 · Deputado Federal — `SQ 170002551446`
- **Sanchilis Oliveira** · PE · REDE · nº 1811 · Deputado Federal — `SQ 170002550629`
- **Dr. Nivaldo** · PE · REDE · nº 1818 · Deputado Federal — `SQ 170002550632`
- **Marcos Falcão** · PE · REDE · nº 18181 · Deputado Estadual — `SQ 170002549809`
- **Marcelo Ramos** · PE · REDE · nº 1840 · Deputado Federal — `SQ 170002550639`
- **Socorro Lacerda** · PE · PCDOB · nº 6510 · Deputado Federal — `SQ 170002533328`
- **Luiz Soares** · PE · PCDOB · nº 65123 · Deputado Estadual — `SQ 170002533336`
- **Andreza Oliveira** · PE · PCDOB · nº 65313 · Deputado Estadual — `SQ 170002533348`
- **Leida Diniz** · PI · PT · nº 13313 · Deputado Estadual — `SQ 180002533542`
- **Mãe Gi** · PR · PDT · nº 12001 · Deputado Estadual — `SQ 160002546867`
- **Patricia Valverde** · PR · PDT · nº 1214 · Deputado Federal — `SQ 160002542223`
- **Ze Izac** · PR · PT · nº 13690 · Deputado Estadual — `SQ 160002542238`
- **Victor Carteiro** · PR · PSOL · nº 50007 · Deputado Estadual — `SQ 160002547765`
- **Etiene Da Silva** · PR · PSOL · nº 5010 · Deputado Federal — `SQ 160002547723`
- **Sebastiana Da Silva** · PR · PSOL · nº 50100 · Deputado Estadual — `SQ 160002547747`
- **Anelise Socoloski** · PR · PSOL · nº 50111 · Deputado Estadual — `SQ 160002547756`
- **Inez** · PR · PSOL · nº 5046 · Deputado Federal — `SQ 160002547719`
- **Debora Saraiva** · RJ · PDT · nº 12180 · Deputado Estadual — `SQ 190002541791`
- **Andreia Zito** · RJ · PV · nº 43123 · Deputado Estadual — `SQ 190002543303`
- **Professora Margareth** · RN · PSOL · nº 50333 · Deputado Estadual — `SQ 200002548552`
- **Ygor Requenha** · RO · PDT · nº 1221 · Deputado Federal — `SQ 220002541484`
- **Gabrielle Castro** · RO · PV · nº 43222 · Deputado Estadual — `SQ 220002539754`
- **Professor Angelim** · RO · PSOL · nº 5055 · Deputado Federal — `SQ 220002553276`
- **Miss. Taty** · RR · PDT · nº 12000 · Deputado Estadual — `SQ 230002552055`
- **Xingú** · RR · PDT · nº 12555 · Deputado Estadual — `SQ 230002552056`
- **Clarice Vieira** · RR · PT · nº 13200 · Deputado Estadual — `SQ 230002549323`
- **Nayra Nogueira** · RR · PV · nº 43333 · Deputado Estadual — `SQ 230002549321`
- **Francisco Santos** · RR · PSOL · nº 5050 · Deputado Federal — `SQ 230002549225`
- **Claúdia Da Segurança** · RR · PSOL · nº 5055 · Deputado Federal — `SQ 230002549229`
- **Edson Junior** · SE · PT · nº 13777 · Deputado Estadual — `SQ 260002545644`
- **Samantha Da Assistência** · SP · PDT · nº 12025 · Deputado Estadual — `SQ 250002548007`
- **Rogério Munhoz** · SP · PT · nº 13030 · Deputado Estadual — `SQ 250002536859`
- **Professor Luiz Roque** · SP · PT · nº 1304 · Deputado Federal — `SQ 250002536754`
- **Deusdete** · SP · PT · nº 13910 · Deputado Estadual — `SQ 250002536265`
- **Professor João Tody** · SP · PT · nº 13999 · Deputado Estadual — `SQ 250002536252`
- **Maria De Sales** · SP · PSOL · nº 5011 · Deputado Federal — `SQ 250002539617`
- **Gustavo Matos** · SP · UP · nº 80123 · Deputado Estadual — `SQ 250002536890`
- **Lilia Manicure** · TO · REDE · nº 1813 · Deputado Federal — `SQ 270002539196`
- **Nilma Guerreira** · TO · PSOL · nº 50000 · Deputado Estadual — `SQ 270002539198`
- **Silvio De Sousa** · TO · PSOL · nº 50100 · Deputado Estadual — `SQ 270002539199`
- **Edgar Gomes** · TO · PSOL · nº 5050 · Deputado Federal — `SQ 270002539189`

## INDEFERIDO (48)

- **Preta Lima** · AC · PDT · nº 12002 · Deputado Estadual — `SQ 10002550653`
- **Gigi** · AC · PDT · nº 12022 · Deputado Estadual — `SQ 10002550658`
- **Ana Roque** · AM · UP · nº 8000 · Deputado Federal — `SQ 40002546978`
- **João Lima** · AM · UP · nº 8080 · Deputado Federal — `SQ 40002546977`
- **Sebastião Leitão** · AP · PT · nº 13258 · Deputado Estadual — `SQ 30002533119`
- **Capitão N Miranda** · AP · PV · nº 4390 · Deputado Federal — `SQ 30002533099`
- **Janilson Menezes** · BA · PDT · nº 12456 · Deputado Estadual — `SQ 50002531372`
- **Norena Ferreira** · BA · PSOL · nº 50007 · Deputado Estadual — `SQ 50002535902`
- **Franco Botelho** · CE · PDT · nº 1224 · Deputado Federal — `SQ 60002554365`
- **Elainy Elas Indígenas** · DF · REDE · nº 18000 · Deputado Distrital — `SQ 70002533407`
- **Carlos Maranhão** · GO · PT · nº 1378 · Deputado Federal — `SQ 90002539145`
- **Pastor Julio Cezar** · GO · REDE · nº 18333 · Deputado Estadual — `SQ 90002543832`
- **Diego Jejees** · GO · PSOL · nº 50000 · Deputado Estadual — `SQ 90002543829`
- **Alexandre Cruz** · GO · PSOL · nº 50024 · Deputado Estadual — `SQ 90002543839`
- **Mauro Do Alho** · GO · PSOL · nº 50103 · Deputado Estadual — `SQ 90002543843`
- **Ketlhyn Dos Santos** · GO · PSOL · nº 50555 · Deputado Estadual — `SQ 90002543825`
- **Sophia Gomes** · MA · PDT · nº 1221 · Deputado Federal — `SQ 100002535246`
- **Paulo Romão** · MA · PT · nº 13613 · Deputado Estadual — `SQ 100002545278`
- **Grilo** · MA · PSOL · nº 50046 · Deputado Estadual — `SQ 100002549208`
- **Jomar Pinheiro** · MA · PSOL · nº 50803 · Deputado Estadual — `SQ 100002549218`
- **Rodrigo Galikeiro** · MG · PDT · nº 12023 · Deputado Estadual — `SQ 130002540055`
- **Jonas Pedreiro** · MG · PDT · nº 12910 · Deputado Estadual — `SQ 130002540019`
- **Urias Rocha** · MS · REDE · nº 1800 · Deputado Federal — `SQ 120002532714`
- **Silvana Vilalba** · MS · PSOL · nº 50777 · Deputado Estadual — `SQ 120002532707`
- **Leonísio Lopes** · PA · PDT · nº 12543 · Deputado Estadual — `SQ 140002546691`
- **Nik Piloto** · PA · PDT · nº 12800 · Deputado Estadual — `SQ 140002546698`
- **Teólogo Jc** · PA · PDT · nº 12899 · Deputado Estadual — `SQ 140002546427`
- **Elson Lourinho Da Conceição** · PA · REDE · nº 18169 · Deputado Estadual — `SQ 140002554514`
- **Uziel Monteiro** · PA · REDE · nº 18777 · Deputado Estadual — `SQ 140002544303`
- **Junior Do Regional** · PA · PSOL · nº 50713 · Deputado Estadual — `SQ 140002544309`
- **Dr. André Lima** · PB · PDT · nº 12321 · Deputado Estadual — `SQ 150002551591`
- **Gilson Dantas (Papaléguas)** · PB · PSOL · nº 50555 · Deputado Estadual — `SQ 150002549750`
- **Marinho** · PE · PV · nº 43000 · Deputado Estadual — `SQ 170002551517`
- **Deri Sousa** · PI · PSOL · nº 50000 · Deputado Estadual — `SQ 180002551951`
- **Luci Socoloski** · PR · PSOL · nº 5013 · Deputado Federal — `SQ 160002547709`
- **Bispo Reis Da Saúde** · RJ · PDT · nº 12011 · Deputado Estadual — `SQ 190002554331`
- **Carla Castilho** · RJ · PDT · nº 12016 · Deputado Estadual — `SQ 190002554324`
- **Nil Doces** · RJ · PDT · nº 12047 · Deputado Estadual — `SQ 190002541840`
- **Chupa Cabra** · RJ · PDT · nº 12051 · Deputado Estadual — `SQ 190002541821`
- **Pedro Mendes** · RJ · PDT · nº 12211 · Deputado Estadual — `SQ 190002554325`
- **Kevinho Do Morro** · RJ · PT · nº 1395 · Deputado Federal — `SQ 190002543071`
- **Eunice Do Mlb** · RJ · UP · nº 80123 · Deputado Estadual — `SQ 190002543968`
- **Gilvan Santiago** · RN · REDE · nº 18222 · Deputado Estadual — `SQ 200002548549`
- **Ágatha Brum** · SC · PSOL · nº 50044 · Deputado Estadual — `SQ 240002537803`
- **Maura De Bibi** · SE · PT · nº 13800 · Deputado Estadual — `SQ 260002545639`
- **Olinda Da Silva** · SP · PDT · nº 12192 · Deputado Estadual — `SQ 250002554147`
- **Reinilton** · SP · PDT · nº 1285 · Deputado Federal — `SQ 250002548504`
- **Baia Vai-Vai** · SP · PDT · nº 1293 · Deputado Federal — `SQ 250002548512`

## CANCELADO (1)

- **Marlangela** · PB · PDT · nº 12456 · Deputado Estadual — `SQ 150002551581`

## PEDIDO NÃO CONHECIDO (1)

- **Josiel Machado** · MS · PCO · nº 29029 · Deputado Estadual — `SQ 120002552683`
