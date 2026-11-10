# Como atualizar a Nuriteca

O site tem duas camadas que saem dos mesmos dados:

- **O app** (`index.html`): busca, filtros, calendário e testes. Lê o `data.js` direto no navegador.
- **As páginas para o Google** (`/concursos/...`, `/cursos/...`, `/guias/...`, `sitemap.xml`): HTML pronto, gerado pelo `gerar-paginas.js`. O Google lê essas páginas sem precisar rodar JavaScript.

Se você editar o `data.js` e não rodar o gerador, o app muda e as páginas do Google ficam desatualizadas.

## O roteiro de sempre

```
node verificar-dados.js     # confere os dados; se mostrar ERROS, corrija antes de seguir
node gerar-paginas.js       # recria páginas, sitemap.xml, robots.txt e 404.html
git add -A && git commit -m "Atualiza oportunidades" && git push
```

O GitHub Pages publica sozinho em 1 ou 2 minutos depois do push.

## Adicionar uma oportunidade

Copie um item parecido no `data.js` e troque os campos. O que importa:

| Campo | Para que serve |
|---|---|
| `id` | Vira o endereço da página: `nuriteca.com.br/<categoria>/<id>/`. Só minúsculas, números e hífen. **Depois de publicado, não mude.** |
| `categoria` | concursos, cursos, graduacao, pos, stricto, bolsas, descontos, intercambio ou carreira |
| `titulo` | Nome claro da oportunidade, como aparece no app |
| `seo.titulo` | Título para o Google, até ~60 caracteres, com o que a pessoa digitaria. Ex.: "Concurso TRF3 2026: vagas, salários e inscrições" |
| `descricao` | 2 ou 3 frases: o que é, para quem, principal benefício. Nada copiado de outro site. |
| `abertura` / `encerramento` | `AAAA-MM-DD` (ou `AAAA-MM-DDTHH:MM` se tiver horário). Sem data confirmada, deixe vazio. |
| `fluxoContinuo` | `true` quando a inscrição fica aberta sempre |
| `linkInscricao`, `linkEdital`, `siteOficial` | Links oficiais. Prefira sempre o da instituição. |
| `fonte`, `fonteTipo` | De onde veio a informação; `oficial` ou `secundaria` |
| `verificadoEm` | Data em que você conferiu na fonte. Aparece como "Última atualização" e vai para o sitemap. |

Campo sem informação confirmada: escreva `"Informação não confirmada."` ou deixe vazio. O gerador esconde esses campos em vez de inventar texto.

### Textos opcionais (`seo`)

O gerador escreve sozinho a introdução e o "Sobre" de cada página a partir dos dados. Quando quiser um texto feito à mão, preencha:

```
"seo": {
  "titulo": "…",       // título no Google
  "descricao": "…",    // resumo no Google, até ~155 caracteres
  "h1": "…",           // título grande da página, se quiser diferente do titulo
  "intro": "…",        // primeiro parágrafo, o gancho
  "sobre": "…"         // seção "Sobre"
}
```

Vale a pena nas oportunidades mais procuradas (Enem, ProUni, grandes concursos, cursos de inglês).

## Atualizar uma oportunidade

Mude só o que mudou e atualize o `verificadoEm`. O endereço continua o mesmo, e o Google entende que a página foi atualizada.

Prorrogação: troque o `encerramento` e, se quiser, mencione na `descricao`.

## Apareceu duplicada?

O `verificar-dados.js` avisa quando dois itens parecem a mesma coisa. Para juntar:

1. Fique com o item mais completo (de preferência o mais antigo, que o Google já conhece).
2. Apague o outro.
3. No item que ficou, coloque o endereço antigo em `redirects`:
   ```
   "redirects": ["/pos-graduacao/id-antigo/"]
   ```
   O gerador cria uma página no endereço antigo que manda o visitante para o certo.

## Oportunidade encerrada

Não precisa apagar. Ela vira "Encerrada" sozinha e a página continua no ar (muita gente procura edital antigo). Depois de 90 dias encerrada, a página sai do sitemap e pede ao Google para não indexar. Se reabrir no ano seguinte, crie um item novo com o ano no `id`.

## Guias (artigos)

Ficam no `guias.js`. Cada guia tem `slug` (endereço), `titulo`, `seoTitulo`, `descricao`, `publicado`, `atualizado`, `categorias` (liga o guia às páginas de categoria e às oportunidades) e `secoes`. O campo `abertos` puxa automaticamente a lista de oportunidades abertas do tema, então o artigo se atualiza sozinho quando o `data.js` muda.

## O que o verificador confere

- Erros que impedem publicar: id inválido ou repetido, categoria inexistente, campos obrigatórios vazios, data em formato errado, abertura depois do encerramento, link quebrado no formato.
- Lista do que encerra nos próximos 3 dias (pauta pronta para post de última chamada).
- Oportunidades abertas que ninguém confere há mais de 14 dias.
- Avisos: título do Google longo ou ausente, descrição curta, possível duplicata, item só com fonte secundária.

## Endereços das páginas (desde 10/11/2026)
Cada tela do app tem endereço próprio (/buscar/, /sobre/, /contato/, /termos/ etc.) e cada oportunidade abre no endereço da sua página (/concursos/<id>/), para o Cloudflare contar as visitas por página. As pastas dessas telas são cópias do index.html geradas pelo gerar-paginas.js: **sempre que mudar o index.html, rode `node gerar-paginas.js` de novo** para atualizar as cópias. Links antigos com # (ex.: /#op-xyz, /#contato) continuam funcionando e são convertidos para o endereço novo.
