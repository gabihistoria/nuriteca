// Confere o data.js antes de publicar: campos obrigatórios, datas, duplicatas e oportunidades para reconferir.
// Uso: node verificar-dados.js        (erros param a publicação; avisos só informam)
const path = require("path");
global.window = {};
require(path.join(__dirname, "data.js"));
const A = window.SNAPSHOT || [];

const CATS = ["concursos", "cursos", "graduacao", "pos", "stricto", "bolsas", "descontos", "intercambio", "carreira"];
const HOJE = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const erros = [], avisos = [], semOficial = [], reconferir = [], encerrando = [];
const vazio = v => !v || /^informação não confirmada/i.test(String(v).trim());
const dataOk = s => /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(s) && !isNaN(new Date(s.length > 10 ? s + ":00-03:00" : s + "T12:00:00-03:00"));
const dias = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5);
const palavras = s => new Set(String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 2 && !/^(concurso|curso|cursos|gratuito|gratuita|gratuitos|edital|para|programa|especializacao|universidade|federal|instituto|prefeitura|publico)$/.test(w)));

const ids = new Map();
for (const o of A) {
  const nome = o.id || o.titulo || "(sem id)";
  if (!o.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(o.id)) erros.push(`${nome}: id precisa ter só letras minúsculas, números e hífens (ele vira o endereço da página).`);
  if (ids.has(o.id)) erros.push(`${o.id}: id repetido.`); ids.set(o.id, o);
  if (!CATS.includes(o.categoria)) erros.push(`${nome}: categoria "${o.categoria}" não existe.`);
  for (const f of ["titulo", "instituicao", "estado", "descricao"]) if (vazio(o[f])) erros.push(`${nome}: falta o campo "${f}".`);
  if (!o.fluxoContinuo && vazio(o.encerramento)) avisos.push(`${nome}: sem data de encerramento. Aparece como "datas a confirmar"; preencha assim que sair o edital.`);
  for (const f of ["abertura", "encerramento", "verificadoEm", "criadoEm"]) if (o[f] && !dataOk(o[f])) erros.push(`${nome}: data inválida em "${f}" (${o[f]}). Use AAAA-MM-DD ou AAAA-MM-DDTHH:MM.`);
  if (o.abertura && o.encerramento && o.abertura.slice(0, 10) > o.encerramento.slice(0, 10)) erros.push(`${nome}: a abertura é depois do encerramento.`);
  if (vazio(o.linkInscricao) && vazio(o.siteOficial) && vazio(o.linkEdital)) semOficial.push(o.id);
  if (vazio(o.fonte)) avisos.push(`${nome}: sem fonte.`);
  for (const f of ["linkInscricao", "linkEdital", "siteOficial", "fonte"]) if (o[f] && !/^https?:\/\//.test(o[f])) erros.push(`${nome}: "${f}" não é um link válido.`);
  if (!o.seo || !o.seo.titulo) avisos.push(`${nome}: sem título para o Google (seo.titulo). Será usado o título normal.`);
  else if (o.seo.titulo.length > 70) avisos.push(`${nome}: seo.titulo com ${o.seo.titulo.length} caracteres; o Google corta depois de uns 60 a 70.`);
  if (String(o.descricao || "").length < 90) avisos.push(`${nome}: descrição curta (${String(o.descricao || "").length} caracteres). Explique melhor o que é, para quem e o principal benefício.`);

  const fim = (o.encerramento || "").slice(0, 10);
  const aberta = o.fluxoContinuo || (fim && fim >= HOJE);
  if (aberta && o.verificadoEm && dias(o.verificadoEm.slice(0, 10), HOJE) > 14) reconferir.push(`${o.id}: conferida há ${dias(o.verificadoEm.slice(0, 10), HOJE)} dias.`);
  if (!o.fluxoContinuo && fim && fim >= HOJE && dias(HOJE, fim) <= 3) encerrando.push(`${o.id}: encerra em ${fim.split("-").reverse().join("/")}.`);
}

const usoLink = {}; for (const o of A) if (o.linkInscricao) usoLink[o.linkInscricao] = (usoLink[o.linkInscricao] || 0) + 1;
// possíveis duplicatas: mesma categoria, títulos muito parecidos ou mesmo link de inscrição específico
for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
  const a = A[i], b = A[j];
  if (a.categoria !== b.categoria || a.estado !== b.estado) continue;
  const pa = palavras(a.titulo), pb = palavras(b.titulo);
  const inter = [...pa].filter(w => pb.has(w)).length, sim = inter / Math.max(1, Math.min(pa.size, pb.size));
  const mesmoLink = a.linkInscricao && a.linkInscricao === b.linkInscricao && usoLink[a.linkInscricao] === 2 && /\d|edital|processo|selec/i.test(a.linkInscricao);
  if ((sim >= 0.8 && inter >= 3 && Math.min(pa.size, pb.size) >= 3) || mesmoLink) avisos.push(`possível duplicata: ${a.id} e ${b.id}. Se forem a mesma oportunidade, junte numa só e coloque o endereço antigo em "redirects".`);
}

const enc = A.filter(o => !o.fluxoContinuo && o.encerramento && o.encerramento.slice(0, 10) < HOJE).length;
console.log(`\nNuriteca · ${A.length} oportunidades (${A.length - enc} abertas ou em breve, ${enc} encerradas)\n`);
const bloco = (t, l) => { if (l.length) console.log(`${t} (${l.length})\n  - ${l.join("\n  - ")}\n`); };
bloco("ERROS: corrija antes de publicar", erros);
bloco("ENCERRAM NOS PRÓXIMOS 3 DIAS: bom para post de última chamada", encerrando);
bloco("RECONFERIR: abertas e sem conferência há mais de 14 dias", reconferir);
bloco("AVISOS", avisos);
if (semOficial.length) console.log(`SÓ COM FONTE SECUNDÁRIA (${semOficial.length}): vale procurar o edital ou a página oficial e preencher linkEdital/linkInscricao\n  ${semOficial.join(", ")}\n`);
if (!erros.length) console.log("Nenhum erro. Pode rodar: node gerar-paginas.js\n");
process.exit(erros.length ? 1 : 0);
