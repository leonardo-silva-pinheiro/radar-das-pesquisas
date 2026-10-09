# Radar das Pesquisas

Agregador independente de pesquisas de intenção de voto para o segundo turno presidencial brasileiro.

## O que esta versão automatiza

- Baixa diariamente o arquivo CSV/ZIP publicado no catálogo oficial de Dados Abertos do TSE.
- Tenta identificar os registros relacionados à Presidência e gera `data/pesquisas_registradas.json`.
- Mostra os registros encontrados numa tabela separada, com instituto, registro, datas, amostra quando disponível e link para consulta no PesqEle.
- Atualiza a lista de institutos do filtro a partir dos registros oficiais e dos resultados conferidos.
- Valida a estrutura dos resultados antes de publicar as alterações.

## Limitação importante sobre os percentuais

O CSV de dados abertos contém metadados dos registros; ele não é, por si só, uma base estruturada com todos os percentuais de cada cenário de segundo turno. Por isso, a tabela principal (`data/pesquisas.json`) só deve receber resultados depois de conferidos na publicação original ou no relatório da pesquisa. A extração automática de percentuais a partir dos relatórios PDF não foi habilitada nesta versão, pois pode confundir candidatos, cenários, votos totais e votos válidos.

A tabela principal começa vazia de propósito, em vez de exibir uma pesquisa fictícia. A tabela de registros oficiais é preenchida quando o workflow roda com acesso à internet. O TSE não certifica previamente os resultados das pesquisas; o registro não equivale a validação dos percentuais.

## Rodar localmente

Requer Python 3 e acesso à internet para executar o coletor.

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`. Para atualizar os registros oficiais, execute em outro terminal:

```bash
python scripts/buscar_tse.py
python scripts/validar_dados.py
```

## Publicar gratuitamente no GitHub Pages

1. Crie um repositório público chamado `radar-das-pesquisas` no GitHub.
2. Envie todos os arquivos do projeto para o repositório.
3. Em **Settings → Pages**, configure a publicação.
4. Em **Actions**, habilite o workflow e execute-o manualmente para testar a coleta.
5. Verifique o resultado do workflow; a primeira execução precisa de acesso ao arquivo público do TSE.

O endereço será parecido com `https://SEU-USUARIO.github.io/radar-das-pesquisas/`.

## Fontes

- [Catálogo de pesquisas eleitorais 2026 — Dados Abertos do TSE](https://dadosabertos.tse.jus.br/dataset/pesquisas-eleitorais-2026)
- [Página oficial sobre pesquisas eleitorais](https://www.tse.jus.br/eleicoes/pesquisas-eleitorais)
- [Sistema PesqEle](https://pesqele-divulgacao.tse.jus.br/app/pesquisa/listar.xhtml)

## Incluir resultado numérico conferido

Adicione um objeto em `data/pesquisas.json` com instituto, número de registro, cenário de segundo turno, datas de campo e divulgação, dois candidatos e percentuais, amostra, margem de erro, tipo de percentual (`votos totais` ou `votos válidos`), link da publicação original e `status: "validado"`. Não misture cenários ou modalidades de percentual.
