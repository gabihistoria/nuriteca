// Gera páginas estáticas (uma por oportunidade e uma por categoria), sitemap.xml e robots.txt
// a partir do data.js, para o Google conseguir encontrar e mostrar cada oportunidade.
// Uso: node gerar-paginas.js   (rode sempre depois de mudar o data.js)
const fs = require("fs");
const path = require("path");

const SITE = "https://nuriteca.com.br";
const ROOT = __dirname;

global.window = {};
require(path.join(ROOT, "data.js"));
const DATA = window.SNAPSHOT || [];
try { require(path.join(ROOT, "guias.js")); } catch (e) {}
const GUIAS = window.GUIAS || [];

const CATS = {
  concursos:   { slug: "concursos",            nome: "Concursos públicos",               titulo: "Concursos públicos com inscrições abertas",            cor: "#E8735F" },
  cursos:      { slug: "cursos",               nome: "Cursos gratuitos",                 titulo: "Cursos gratuitos com inscrições abertas",              cor: "#D9A441" },
  graduacao:   { slug: "graduacao",            nome: "Graduações gratuitas",             titulo: "Graduações gratuitas e vestibulares",                  cor: "#7E9B7A" },
  pos:         { slug: "pos-graduacao",        nome: "Pós-graduações gratuitas",         titulo: "Pós-graduações gratuitas com inscrições abertas",      cor: "#B9583C" },
  stricto:     { slug: "mestrado-e-doutorado", nome: "Mestrados e doutorados",           titulo: "Mestrados e doutorados com inscrições abertas",        cor: "#2F6B73" },
  bolsas:      { slug: "bolsas",               nome: "Bolsas e oportunidades",           titulo: "Bolsas e oportunidades com inscrições abertas",        cor: "#C97B8E" },
  descontos:   { slug: "descontos",            nome: "Descontos e bolsas de estudo",     titulo: "Descontos e bolsas de estudo",                         cor: "#9C7FB4" },
  intercambio: { slug: "intercambios-gratuitos", nome: "Intercâmbios gratuitos",         titulo: "Intercâmbios gratuitos e bolsas para estudar no exterior", cor: "#567F70",
    intro: `<p class="desc">Intercâmbio gratuito existe, e não é só para quem já tem dinheiro. Aqui estão os programas de intercâmbio gratuito e com bolsa integral abertos para estudantes brasileiros: do ensino médio ao mestrado e doutorado, com curso, moradia ou passagem pagos. Cada um tem o prazo, quem pode participar e o link oficial para a inscrição.</p><p>Está no ensino médio? Leia o guia <a href="/guias/intercambio-gratuito-ensino-medio/">Intercâmbio de graça no ensino médio</a>, com Jovens Embaixadores, Prontos pro Mundo, Ganhando o Mundo e outros.</p>` },
  carreira:    { slug: "estagio-e-trainee",    nome: "Estágio, trainee e jovem aprendiz", titulo: "Programas de estágio, trainee e jovem aprendiz abertos", cor: "#C77A45" },
};
const ESTADOS = {AC:"Acre",AL:"Alagoas",AP:"Amapá",AM:"Amazonas",BA:"Bahia",CE:"Ceará",DF:"Distrito Federal",ES:"Espírito Santo",GO:"Goiás",MA:"Maranhão",MT:"Mato Grosso",MS:"Mato Grosso do Sul",MG:"Minas Gerais",PA:"Pará",PB:"Paraíba",PR:"Paraná",PE:"Pernambuco",PI:"Piauí",RJ:"Rio de Janeiro",RN:"Rio Grande do Norte",RS:"Rio Grande do Sul",RO:"Rondônia",RR:"Roraima",SC:"Santa Catarina",SP:"São Paulo",SE:"Sergipe",TO:"Tocantins",Nacional:"Brasil todo"};
const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const slugify = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const cut = (s, n) => { s = String(s||"").replace(/\s+/g," ").trim(); return s.length <= n ? s : s.slice(0, n-1).replace(/\s+\S*$/,"") + "…"; };
const ok = v => v && !/^informação não confirmada/i.test(String(v).trim());

function parseDate(s, end){ if(!s) return null; const t = s.length > 10 ? s : s + (end ? "T23:59" : "T00:00"); return new Date(t + ":00-03:00"); }
function fmtDate(s){ if(!s) return ""; const [y,m,d] = s.slice(0,10).split("-"); const h = s.length > 10 ? ` às ${s.slice(11,16).replace(":","h")}` : ""; return `${d}/${m}/${y}${h}`; }
function fmtShort(s){ if(!s) return ""; const [y,m,d] = s.slice(0,10).split("-"); return `${+d} de ${MESES[+m-1]}`; }
const NOW = new Date();
function status(o){
  if(o.fluxoContinuo) return {cls:"open", txt:"Inscrições em fluxo contínuo"};
  const a = parseDate(o.abertura,false), e = parseDate(o.encerramento,true);
  if(e && e < NOW) return {cls:"closed", txt:`Inscrições encerradas em ${fmtDate(o.encerramento)}`};
  if(a && a > NOW) return {cls:"soon", txt:`Inscrições abrem em ${fmtDate(o.abertura)}`};
  if(e) return {cls:"open", txt:`Inscrições até ${fmtDate(o.encerramento)}`};
  return {cls:"open", txt:"Confira o prazo no site oficial"};
}
const isOpen = o => { const s = status(o).cls; return s === "open" || s === "soon"; };
const itemUrl = o => `/${CATS[o.categoria].slug}/${slugify(o.id)}/`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap" rel="stylesheet">`;
const ICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Cpath d=%22M2 24C6 15 12 13 16 16v12c-4-3-10-3-14 0z%22 fill=%22%23E8735F%22/%3E%3Cpath d=%22M30 24c-4-9-10-11-14-8v12c4-3 10-3 14 0z%22 fill=%22%23B9583C%22/%3E%3Ccircle cx=%2216%22 cy=%227%22 r=%223.4%22 fill=%22%23D9A441%22/%3E%3C/svg%3E">`;
const BEACON = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "4630aa3a77ee4dfab0a3afe9851de284"}'></script>`;
const CSS = `:root{--bg:#FBF4EC;--surface:#FFFBF6;--ink:#2E2420;--muted:#7A6A60;--line:#EADBCB;--coral:#E8735F;--terra:#B9583C;--salvia:#7E9B7A;--ocre:#D9A441}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:"DM Sans",system-ui,sans-serif;line-height:1.6}
a{color:var(--terra)}.wrap{max-width:820px;margin:0 auto;padding:0 20px}
header{border-bottom:1px solid var(--line);background:var(--bg)}header .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-family:Fraunces,serif;font-weight:800;font-size:24px}.logo svg{width:30px;height:30px}
.back{font-weight:600;font-size:15px;text-decoration:none}
.crumbs{font-size:14px;color:var(--muted);margin:22px 0 6px}.crumbs a{color:var(--muted)}
h1{font-family:Fraunces,serif;font-weight:800;line-height:1.1;font-size:clamp(30px,5vw,44px);margin:6px 0 10px}
h2{font-family:Fraunces,serif;font-size:26px;margin:34px 0 12px}
.arch{height:90px;border-radius:999px 999px 14px 14px;max-width:420px;margin:18px 0 6px}
.meta{color:var(--muted);font-size:16px;margin:0 0 16px}
.status{display:inline-block;font-weight:700;padding:8px 16px;border-radius:999px;margin:4px 0 18px}
.status.open{background:#E3EEDF;color:#3E6B3A}.status.soon{background:#F7EAD0;color:#8A6417}.status.closed{background:#EFE3DA;color:#7A6A60}
.desc{font-size:18px}
dl{display:grid;grid-template-columns:200px 1fr;gap:0;margin:22px 0;border-top:1px solid var(--line)}
dt,dd{padding:11px 0;border-bottom:1px solid var(--line);margin:0}dt{font-weight:700;padding-right:16px}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0}
.btn{display:inline-flex;align-items:center;border-radius:999px;padding:12px 22px;background:var(--terra);color:#fff;font-weight:700;text-decoration:none}
.btn.ghost{background:transparent;color:var(--ink);border:1.5px solid var(--line)}
.note{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px 18px;font-size:15px;color:var(--muted)}
.list{list-style:none;padding:0;margin:0;display:grid;gap:12px}
.list li a{display:block;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px 18px;text-decoration:none;color:var(--ink)}
.list li a:hover{border-color:var(--coral)}.list strong{display:block;font-family:Fraunces,serif;font-size:20px;line-height:1.25}
.list span{font-size:14px;color:var(--muted)}
.cats{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0}.cats a{font-size:14px;padding:6px 12px;border-radius:999px;border:1px solid var(--line);text-decoration:none;color:var(--ink);background:var(--surface)}
.guia h2{margin-top:38px}.guia ul{padding-left:22px}.guia li{margin:6px 0}.guia p,.guia li{font-size:17.5px}.exemplo{background:#F4EFE9;border-left:4px solid #B9583C;border-radius:8px;padding:12px 16px;font-style:italic}.aviso{background:#FBEDE3;border:1px solid #F1D3C2;border-radius:16px;padding:14px 18px;font-size:16px!important}.fontes{font-size:14px;color:var(--muted)}.fontes li{font-size:14px!important}
.intro{font-size:19px;line-height:1.55}.steps{padding-left:22px}.steps li{margin:8px 0;font-size:17px}.upd{font-size:14px;color:var(--muted);margin-top:18px}h3{font-family:Fraunces,serif;font-size:21px;margin:26px 0 8px}
footer{margin-top:50px;border-top:1px solid var(--line);padding:26px 0 40px;font-size:14px;color:var(--muted)}
@media(max-width:640px){dl{grid-template-columns:1fr}dt{border-bottom:0;padding-bottom:0}}`;

const LOGO = `<a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M2 24 C 6 15, 12 13, 16 16 L 16 28 C 12 25, 6 25, 2 28 Z" fill="#E8735F"/><path d="M30 24 C 26 15, 20 13, 16 16 L 16 28 C 20 25, 26 25, 30 28 Z" fill="#B9583C"/><circle cx="16" cy="7" r="3.4" fill="#D9A441"/></svg>Nuriteca</a>`;
const catLinks = () => `<div class="cats">${Object.values(CATS).map(c=>`<a href="/${c.slug}/">${esc(c.nome)}</a>`).join("")}</div>`;
const FOOTER = `<footer><div class="wrap"><p><strong>Navegue por categoria</strong></p>${catLinks()}<p style="margin-top:14px"><a href="/estados/">Ver oportunidades por estado →</a> · <a href="/guias/">Guias da Nuriteca →</a></p>
<p style="margin-top:22px">A Nuriteca reúne oportunidades gratuitas e leva você ao site oficial. Aqui não há inscrição nem cobrança. Confira sempre o edital.</p>
<p><a href="/">Página inicial</a> · <a href="https://www.instagram.com/nuriteca/" rel="noopener">@nuriteca no Instagram</a> · <a href="/contato/">Fale conosco</a> · <a href="/sobre/">Sobre</a> · <a href="/termos/">Termos de uso</a> · <a href="/privacidade/">Privacidade</a></p></div></footer>`;

function page({title, desc, url, body, ogType="website", noindex=false, jsonld=null, modified=""}){
  const ld = jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g,"\\u003c")}</script>` : "";
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${url}">${noindex ? `<meta name="robots" content="noindex,follow">` : `<meta name="robots" content="index,follow,max-image-preview:large">`}${modified ? `<meta property="article:modified_time" content="${esc(modified)}">` : ""}${ld}
<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="Nuriteca"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${url}"><meta property="og:image" content="${SITE}/icon-512.png"><meta property="og:locale" content="pt_BR">
<meta name="theme-color" content="#FBF4EC">${ICON}${FONTS}<style>${CSS}</style></head>
<body><header><div class="wrap">${LOGO}<a class="back" href="/">Ver todas →</a></div></header>
<main class="wrap">${body}</main>${FOOTER}${BEACON}</body></html>`;
}

// ---------- SEO de cada oportunidade ----------
// Campos opcionais no data.js para escrever à mão (têm prioridade sobre o texto automático):
//   seo: { titulo: "...", descricao: "...", intro: "...", sobre: "..." }
const hash = s => [...String(s)].reduce((h,c) => (h*31 + c.charCodeAt(0)) >>> 0, 7);
const pick = (o, arr) => arr[hash(o.id) % arr.length];
const lower1 = s => !s || /^.[A-ZÀ-Ý0-9]/.test(s) || /^[A-ZÀ-Ý][a-zà-ý]+ (de|do|da|dos|das) [A-ZÀ-Ý]/.test(s) && !/^(Curso|Cursos|Concurso|Seleção|Especialização|Programa|Bolsa|Mestrado|Doutorado|Processo)/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
const noPeriod = s => String(s||"").trim().replace(/[.;:]+$/,"");
const vagasTxt = o => { let v = String(o.vagas||"").trim(); if(!ok(v) || /^ver |sem limite|ilimitad|conforme/i.test(v)) return "";
  let m = v.match(/^(\d[\d.]*)\s*\+\s*(\d[\d.]*\s*)?cadastro/i); if (m) return `${m[1]} vagas${m[2] ? ` e ${m[2].trim()} em cadastro reserva` : " e cadastro reserva"}`;
  m = v.match(/^(\d[\d.]*)\s+em\s+(.+)$/i); if (m) return `${m[1]} vagas em ${m[2]}`;
  if (/^\d[\d.]*$/.test(v)) return `${v} ${v === "1" ? "vaga" : "vagas"}`;
  m = v.match(/^(\d[\d.]*)\s*\((.+)\)$/); if (m) return `${m[1]} vagas ${m[2].toLowerCase()}`;
  return /vaga|bolsa/i.test(v) ? lower1(v) : ""; };
const isPaid = o => ok(o.taxa) && !/gratuit|isent|não há|sem taxa|ver site/i.test(o.taxa);
const ondeTxt = o => (o.municipio && /^(polos|provas|cerca)/i.test(o.municipio) ? lower1(o.municipio) + (o.estado !== "Nacional" && ESTADOS[o.estado] && !o.municipio.includes(ESTADOS[o.estado]) ? ` (${o.estado})` : "") : null) || (o.estado === "Nacional" ? (o.municipio && !/on-?line/i.test(o.municipio) ? o.municipio : (o.modalidade === "EAD" ? "on-line, para todo o Brasil" : "para todo o Brasil")) : (o.municipio && ESTADOS[o.estado] && o.municipio.includes(ESTADOS[o.estado]) ? o.municipio : [o.municipio, ESTADOS[o.estado] || o.estado].filter(Boolean).join(", ")));
const art = n => /^(prefeitura|universidade|fundação|secretaria|defensoria|câmara|polícia|escola|empresa|agência|assembleia|procuradoria|controladoria|faculdade|caixa|petrobras)/i.test(n) ? "A " : /^(instituto|tribunal|ministério|governo|banco|conselho|senado|centro|programa|serviço|departamento|hospital|comando|corpo|exército)/i.test(n) ? "O " : "";
const year = o => ((o.titulo.match(/20\d\d/) || [])[0]) || "";
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./,""); } catch(e) { return ""; } };
const KW = {
  concursos:   ["vagas, requisitos e inscrições", "salário, vagas e como se inscrever"],
  cursos:      ["como se inscrever e certificado", "inscrições, requisitos e certificado"],
  graduacao:   ["vagas e como se inscrever", "como entrar e prazos"],
  pos:         ["vagas, requisitos e inscrição", "como se inscrever e prazos"],
  stricto:     ["seleção, requisitos e inscrições", "como se inscrever e prazos"],
  bolsas:      ["quem pode e como se candidatar", "requisitos e prazo"],
  descontos:   ["como funciona e quem pode", "requisitos e prazo"],
  intercambio: ["quem pode e como se candidatar", "requisitos, bolsa e prazo"],
  carreira:    ["requisitos e inscrições", "quem pode e como se inscrever"],
};
function seoTitle(o){
  if (o.seo && o.seo.titulo) return o.seo.titulo.length <= 58 ? `${o.seo.titulo} | Nuriteca` : o.seo.titulo;
  const t = o.titulo.replace(/\s*\((edital|edital nº)[^)]*\)\s*$/i, "").trim();
  for (const kw of [pick(o, KW[o.categoria] || KW.cursos), ...(KW[o.categoria] || [])]) {
    const full = `${t}: ${kw} | Nuriteca`; if (full.length <= 72) return full;
  }
  return `${o.titulo} | Nuriteca`;
}
function seoDesc(o){
  if (o.seo && o.seo.descricao) return o.seo.descricao;
  const st = status(o), v = vagasTxt(o);
  const prazo = o.fluxoContinuo ? "Inscrições abertas o ano todo." : (o.encerramento && st.cls !== "closed" ? `Inscrições até ${fmtShort(o.encerramento)}.` : (st.cls === "closed" ? "Inscrições encerradas." : ""));
  return cut([`${o.titulo}${v ? `: ${v}` : ""}.`, prazo, o.descricao].filter(Boolean).join(" "), 158);
}
function autoIntro(o){
  if (o.seo && o.seo.intro) return o.seo.intro;
  const st = status(o), v = vagasTxt(o), onde = ondeTxt(o), y = year(o);
  const prazo = o.fluxoContinuo ? "com inscrições abertas o ano todo" : (st.cls === "closed" ? `com inscrições encerradas em ${fmtDate(o.encerramento)}` : st.cls === "soon" ? `com inscrições a partir de ${fmtDate(o.abertura)}` : (o.encerramento ? `com inscrições até ${fmtDate(o.encerramento)}` : ""));
  const NO = {AC:"no",AP:"no",AM:"no",BA:"na",CE:"no",DF:"no",ES:"no",MA:"no",PA:"no",PB:"na",PR:"no",PI:"no",RJ:"no",RN:"no",RS:"no",TO:"no"};
  const prep = onde && onde === ESTADOS[o.estado] ? (NO[o.estado] || "em") : "em";
  const fatos = [v, onde && `${prep} ${onde}`.replace(/^em on-line/, "on-line").replace(/^em para todo/, "para todo"), prazo].filter(Boolean).join(", ");
  const nome = o.titulo.replace(/\s*\([^)]*\)\s*$/, "");
  const F = fatos ? `, ${fatos}` : "", Fc = fatos ? (nome.includes(":") ? `. Em resumo: ${fatos}` : `: ${fatos}`) : "", inst = String(o.instituicao).split(" · ")[0], siglas = (inst.match(/\(([^)]+)\)/g) || []).map(x => x.slice(1, -1)), semInst = [inst.split(/[ (,·]/)[0], ...siglas].some(t => t && o.titulo.toLowerCase().includes(t.toLowerCase()));
  const quem = semInst ? "" : ` Quem oferece: ${inst}.`;
  const hooks = {
    concursos: [
      `${art(inst)}${inst} ${st.cls === "soon" ? "vai abrir inscrições" : st.cls === "closed" ? "teve seleção" : "está com seleção aberta"}${Fc}. Nesta página você confere quem pode participar, os requisitos, a taxa e o link oficial de inscrição.`,
      `Procurando informações sobre ${/^(sele|prova|especializ|bolsa|chamada|resid|olimp|gradua|vaga)/i.test(nome) ? "a" : "o"} ${lower1(nome)}? Em resumo${Fc || ": veja abaixo os detalhes"}. Abaixo estão requisitos, prazos e como se inscrever.`,
    ],
    cursos: [
      semInst ? `Quer estudar de graça${/certific/i.test(o.certificacao||"") ? " e ainda ganhar certificado" : ""}? ${nome}${Fc}.` : `Quer estudar de graça${/certific/i.test(o.certificacao||"") ? " e ainda ganhar certificado" : ""}? ${art(inst)}${inst} oferece ${lower1(nome)}${F}.`,
      `${nome}${Fc}.${quem} Veja como funciona e como se inscrever.`,
    ],
    graduacao: [
      `Dá para fazer faculdade pública e gratuita${o.modalidade === "EAD" ? " a distância" : ""}: ${inst} está selecionando alunos${F}.`.replace(": "+inst, ": "+art(inst).toLowerCase()+inst),
      `${nome}${Fc}.${quem} Veja quem pode participar e como se inscrever.`,
    ],
    pos: [
      `Procurando pós-graduação gratuita? ${art(inst)}${inst} abriu seleção${F}.`,
      `${nome}: especialização sem mensalidade${F}.${quem}`,
    ],
    stricto: [ `Seleção aberta para mestrado ou doutorado: ${lower1(nome)}${F}.${quem}` ],
    bolsas: [ `${nome}${Fc}.${quem} Veja quem pode se candidatar e como.` ],
    descontos: [ `${nome}${Fc}.${quem} Veja quem pode participar e como.` ],
    intercambio: [
      `Estudar fora sem pagar tudo do próprio bolso é possível. ${nome}${Fc}.`,
      `${nome}${Fc}. Veja requisitos, o que a bolsa cobre e o prazo.`,
    ],
    carreira: [ `${art(inst)}${inst} abriu inscrições para ${lower1(nome)}${F}. Veja requisitos, benefícios e como se candidatar.` ],
  };
  return pick(o, hooks[o.categoria] || hooks.cursos);
}
function autoSobre(o){
  const p = [];
  if (ok(o.modalidade) || ok(o.area)) p.push(`${ok(o.modalidade) ? `A oportunidade é ${o.modalidade === "EAD" ? "a distância (EaD)" : lower1(o.modalidade)}` : "A oportunidade"}${ok(o.area) && !/diversas/i.test(o.area) ? `, na área de ${lower1(o.area)}` : ""}${o.subtipo ? ` (${lower1(o.subtipo)})` : ""}.`);
  if (isPaid(o)) p.push(`A taxa de inscrição é de ${noPeriod(o.taxa)}${/gratuito/i.test(o.gratuidade||"") ? ", mas o curso em si é gratuito" : ""}.`);
  else if (/gratuit/i.test((o.taxa||"") + (o.gratuidade||""))) p.push("A inscrição é gratuita.");
  if (ok(o.certificacao) && !/não se aplica/i.test(o.certificacao)) p.push(/^certificad|^diploma/i.test(o.certificacao) ? `${noPeriod(o.certificacao)}.` : `Certificado: ${lower1(noPeriod(o.certificacao))}.`);
  return p.join(" ");
}
function howTo(o){
  const st = status(o), host = hostOf(o.linkInscricao || o.siteOficial || o.linkEdital);
  const steps = [];
  steps.push(o.linkEdital ? "Leia o edital completo (link abaixo): ele é o documento que vale, com todas as regras." : "Leia o edital ou as regras completas no site oficial antes de se inscrever.");
  if (ok(o.escolaridade) || ok(o.prerequisitos)) steps.push(`Confira se você cumpre os requisitos${ok(o.escolaridade) ? `, como a escolaridade exigida (${lower1(noPeriod(o.escolaridade))})` : ""}.`);
  if (isPaid(o)) steps.push(`Separe o valor da taxa (${noPeriod(o.taxa)}).${ok(o.isencao) && !/não se aplica|conforme o edital/i.test(o.isencao) ? ` Isenção: ${lower1(noPeriod(o.isencao))}.` : " Veja no edital se você tem direito à isenção."}`);
  if (ok(o.documentos) && !/^os listados no edital/i.test(o.documentos)) steps.push(`Tenha em mãos: ${lower1(noPeriod(o.documentos))}.`);
  if (st.cls !== "closed") steps.push(`Faça a inscrição ${host ? `pelo site oficial (${host})` : "pelo site oficial"}${o.fluxoContinuo ? ", que fica aberto o ano todo" : (o.encerramento ? `, até ${fmtDate(o.encerramento)}` : "")}.`);
  steps.push("Guarde o comprovante e acompanhe as próximas etapas e resultados pelo site oficial.");
  return steps;
}
const EDU = { cursos:1, graduacao:1, pos:1, stricto:1 };
function itemJsonLd(o){
  const c = CATS[o.categoria], url = SITE + itemUrl(o);
  const crumbs = { "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: SITE + "/" },
    { "@type": "ListItem", position: 2, name: c.nome, item: `${SITE}/${c.slug}/` },
    { "@type": "ListItem", position: 3, name: o.titulo, item: url } ] };
  const pageLd = { "@type": "WebPage", "@id": url, url, name: o.titulo, description: seoDesc(o), inLanguage: "pt-BR",
    dateModified: o.verificadoEm || o.criadoEm, datePublished: o.criadoEm || o.verificadoEm, isPartOf: { "@type": "WebSite", name: "Nuriteca", url: SITE + "/" } };
  const graph = [crumbs, pageLd];
  if (EDU[o.categoria]) {
    graph.push({ "@type": "Course", name: o.titulo, description: cut(o.descricao, 300), url, inLanguage: "pt-BR",
      provider: { "@type": "Organization", name: o.instituicao, ...(o.siteOficial || o.linkInscricao ? { sameAs: o.siteOficial || o.linkInscricao } : {}) },
      ...(/gratuit/i.test((o.gratuidade||"")+(o.taxa||"")) ? { isAccessibleForFree: true } : {}) });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
function related(o){
  const same = DATA.filter(x => x.categoria === o.categoria && x.id !== o.id && isOpen(x));
  const score = x => (x.estado === o.estado ? 2 : 0) + (x.area && x.area === o.area ? 1 : 0) + (x.estado === "Nacional" ? 0.5 : 0);
  return same.sort((a,b) => score(b) - score(a)).slice(0, 5);
}
function guidesFor(o){
  const txt = [o.titulo, o.descricao, o.area, o.subtipo].join(" ");
  const fit = g => { const a = g.abertos;
    if (a && a.categoria === o.categoria && (!a.filtro || a.filtro.test(txt)) && (!a.subtipo || a.subtipo.test(o.subtipo||""))) return 2;
    if (a && a.filtro && a.filtro.test(txt)) return 2;
    return (g.categorias || []).includes(o.categoria) && !(a && (a.filtro || a.subtipo)) ? 1 : 0; };
  return GUIAS.map(g => ({ g, n: fit(g) })).filter(r => r.n).sort((x,y) => y.n - x.n).slice(0, 3).map(r => r.g);
}
function closedLong(o){ const e = parseDate(o.encerramento, true); return !o.fluxoContinuo && e && (NOW - e) > 90*864e5; }

function itemPage(o){
  const c = CATS[o.categoria], st = status(o);
  const sec = (title, rows) => { rows = rows.filter(([,v]) => ok(v)); return rows.length ? `<h2>${esc(title)}</h2><dl>${rows.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>` : ""; };
  const sobreExtra = (o.seo && o.seo.sobre) || autoSobre(o);
  const btns = [
    o.linkInscricao && `<a class="btn" href="${esc(o.linkInscricao)}" rel="noopener" target="_blank">Ir para a inscrição oficial</a>`,
    o.linkEdital && `<a class="btn ghost" href="${esc(o.linkEdital)}" rel="noopener" target="_blank">Ler o edital</a>`,
    o.siteOficial && `<a class="btn ${o.linkInscricao ? "ghost" : ""}" href="${esc(o.siteOficial)}" rel="noopener" target="_blank">Site oficial</a>`,
  ].filter(Boolean).join("");
  const rel = related(o), guias = guidesFor(o);
  const body = `<nav class="crumbs"><a href="/">Início</a> › <a href="/${c.slug}/">${esc(c.nome)}</a></nav>
<div class="arch" style="background:linear-gradient(180deg,${c.cor}cc,${c.cor})"></div>
<h1>${esc((o.seo && o.seo.h1) || o.titulo)}</h1>
<p class="meta">${esc([o.instituicao, o.subtipo].filter(Boolean).join(" · "))}</p>
<span class="status ${st.cls}">${esc(st.txt)}</span>
<p class="intro">${esc(autoIntro(o))}</p>
<h2>Sobre ${{concursos:"o concurso",cursos:"o curso",graduacao:"a graduação",pos:"a pós-graduação",stricto:"a seleção",bolsas:"a bolsa",descontos:"a oportunidade",intercambio:"o programa",carreira:"o programa"}[o.categoria] || "a oportunidade"}</h2>
<p class="desc">${esc(o.descricao)}</p>${sobreExtra ? `<p>${esc(sobreExtra)}</p>` : ""}
${sec("Quem pode participar", [["Requisitos", /^confira os requisitos completos no edital/i.test(o.prerequisitos||"") ? "" : o.prerequisitos], ["Escolaridade", o.escolaridade], ["Onde", ondeTxt(o)], ["Modalidade", o.modalidade]])}
${sec("Vagas, benefícios e certificado", [["Vagas", o.vagas], ["Área", /diversas/i.test(o.area||"") ? "" : o.area], ["Custo", o.gratuidade && !/^gratuito$/i.test(o.gratuidade) ? o.gratuidade : (/gratuit/i.test(o.gratuidade||"") ? "Gratuito" : "")], ["Certificado", o.certificacao && !/não se aplica/i.test(o.certificacao) ? o.certificacao : ""]])}
${sec("Datas e prazos", [["Abertura das inscrições", o.abertura ? fmtDate(o.abertura) : ""], ["Fim das inscrições", o.fluxoContinuo ? "Fluxo contínuo" : (o.encerramento ? fmtDate(o.encerramento) : "")], ["Situação", st.txt], ["Taxa de inscrição", o.taxa], ["Isenção da taxa", o.isencao && !/não se aplica/i.test(o.isencao) ? o.isencao : ""]])}
<h2>Como se inscrever</h2>
<ol class="steps">${howTo(o).map(x => `<li>${esc(x)}</li>`).join("")}</ol>
<div class="btns">${btns}<a class="btn ghost" href="/#op-${esc(o.id)}">Salvar na Nuriteca</a></div>
<p class="note">A inscrição é feita só no site oficial da instituição. Datas podem ser prorrogadas ou mudar: confira sempre o edital.${o.fonte ? ` Fonte da informação: <a href="${esc(o.fonte)}" rel="noopener nofollow" target="_blank">${esc(hostOf(o.fonte))}</a>${o.fonteTipo === "oficial" ? " (fonte oficial)" : ""}.` : ""}</p>
<p class="upd">Última atualização: ${esc(fmtDate(o.verificadoEm || o.criadoEm || ""))}</p>
${guias.length ? `<h2>Leia também</h2><ul class="list">${guias.map(g => `<li><a href="/guias/${g.slug}/"><strong>${esc(g.titulo)}</strong><span>Guia da Nuriteca</span></a></li>`).join("")}</ul>` : ""}
${rel.length ? `<h2>Oportunidades relacionadas</h2><ul class="list">${rel.map(listItem).join("")}</ul>` : ""}
<p style="margin-top:22px"><a href="/${c.slug}/">Ver todas em ${esc(c.nome.toLowerCase())} →</a>${o.estado && o.estado !== "Nacional" && ESTADOS[o.estado] ? ` · <a href="/estados/${slugify(ESTADOS[o.estado])}/">Oportunidades em ${esc(ESTADOS[o.estado])} →</a>` : ""}</p>`;
  return page({ title: seoTitle(o), desc: seoDesc(o), url: itemUrl(o), body, ogType: "article", noindex: closedLong(o), jsonld: itemJsonLd(o), modified: o.verificadoEm || "" });
}

function redirectPage(to){
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Página movida | Nuriteca</title><link rel="canonical" href="${SITE}${to}"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p>Esta página mudou de endereço: <a href="${to}">${SITE}${to}</a></p></body></html>`;
}

function listItem(o){
  const st = status(o);
  const where = o.estado === "Nacional" ? "Brasil todo" : [o.municipio, o.estado].filter(Boolean).join(" · ");
  return `<li><a href="${itemUrl(o)}"><strong>${esc(o.titulo)}</strong><span>${esc([o.instituicao, where].filter(Boolean).join(" · "))} · ${esc(st.txt)}</span></a></li>`;
}

function catPage(key){
  const c = CATS[key];
  const items = DATA.filter(o => o.categoria === key);
  const byEnd = (a,b) => ((parseDate(a.encerramento,true)||Infinity) - (parseDate(b.encerramento,true)||Infinity));
  const abertas = items.filter(isOpen).sort(byEnd), fechadas = items.filter(o => !isOpen(o));
  const url = `/${c.slug}/`;
  const desc = key === "intercambio" ? cut(`Intercâmbios gratuitos e com bolsa integral para brasileiros, do ensino médio ao doutorado. ${abertas.length} programas abertos, com prazo e link oficial.`, 158) : cut(`${c.titulo} no Brasil todo, com prazo, requisitos e link oficial. ${abertas.length} oportunidades conferidas pela Nuriteca.`, 158);
  const body = `<nav class="crumbs"><a href="/">Início</a> › ${esc(c.nome)}</nav>
<div class="arch" style="background:linear-gradient(180deg,${c.cor}cc,${c.cor})"></div>
<h1>${esc(c.titulo)}</h1>
${c.intro || ""}<p class="meta">Lista conferida pela Nuriteca, com link para o site oficial de cada oportunidade. Atualizada em ${fmtDate(new Date(NOW.getTime()-3*3600e3).toISOString().slice(0,10))}.</p>
${abertas.length ? `<ul class="list">${abertas.map(listItem).join("")}</ul>` : `<p class="note">Nenhuma oportunidade aberta nesta categoria agora. Volte em breve ou siga a <a href="https://www.instagram.com/nuriteca/">@nuriteca</a>.</p>`}
${fechadas.length ? `<h2>Encerradas recentemente</h2><ul class="list">${fechadas.map(listItem).join("")}</ul>` : ""}
${(() => { const gs = GUIAS.filter(g => guideCats(g).has(key)); return gs.length ? `<h2>Guias sobre ${esc(c.nome.toLowerCase())}</h2><ul class="list">${gs.map(g => `<li><a href="/guias/${g.slug}/"><strong>${esc(g.titulo)}</strong><span>${esc(cut(g.descricao, 120))}</span></a></li>`).join("")}</ul>` : ""; })()}
<div class="btns"><a class="btn" href="/">Buscar no site da Nuriteca</a></div>`;
  const ld = { "@context": "https://schema.org", "@type": "CollectionPage", name: c.titulo, url: SITE + url, inLanguage: "pt-BR",
    mainEntity: { "@type": "ItemList", itemListElement: abertas.slice(0, 30).map((o, i) => ({ "@type": "ListItem", position: i + 1, url: SITE + itemUrl(o), name: o.titulo })) } };
  return page({ title: `${c.titulo} | Nuriteca`, desc, url, body, jsonld: ld });
}

function statePage(uf){
  const nome = ESTADOS[uf];
  const items = DATA.filter(o => o.estado === uf && CATS[o.categoria]);
  const byEnd = (a,b) => ((parseDate(a.encerramento,true)||Infinity) - (parseDate(b.encerramento,true)||Infinity));
  const abertas = items.filter(isOpen).sort(byEnd);
  const nacionais = DATA.filter(o => o.estado === "Nacional" && CATS[o.categoria] && isOpen(o)).length;
  const url = `/estados/${slugify(nome)}/`;
  const desc = cut(`Concursos, cursos, bolsas e oportunidades gratuitas em ${nome}, com prazo e link oficial. ${abertas.length} abertas agora, conferidas pela Nuriteca.`, 158);
  const body = `<nav class="crumbs"><a href="/">Início</a> › <a href="/estados/">Estados</a> › ${esc(nome)}</nav>
<div class="arch" style="background:linear-gradient(180deg,#E8735Fcc,#B9583C)"></div>
<h1>Oportunidades gratuitas em ${esc(nome)}</h1>
<p class="meta">Concursos, cursos, graduação, pós e bolsas com inscrições abertas em ${esc(nome)}, conferidos pela Nuriteca.</p>
${abertas.length ? `<ul class="list">${abertas.map(listItem).join("")}</ul>` : `<p class="note">Nenhuma oportunidade aberta só para ${esc(nome)} agora.</p>`}
${nacionais ? `<p class="note" style="margin-top:20px">Além dessas, há ${nacionais} oportunidades abertas para o Brasil todo, que valem para quem mora em ${esc(nome)}. <a href="/">Ver no site</a>.</p>` : ""}`;
  return page({ title: `Concursos e oportunidades gratuitas em ${nome} | Nuriteca`, desc, url, body });
}
function statesIndex(ufs){
  const body = `<nav class="crumbs"><a href="/">Início</a> › Estados</nav><h1>Oportunidades por estado</h1>
<p class="meta">Escolha o seu estado para ver concursos, cursos e bolsas abertos perto de você.</p>
<ul class="list">${ufs.map(uf => { const n = DATA.filter(o => o.estado === uf && CATS[o.categoria] && isOpen(o)).length; return `<li><a href="/estados/${slugify(ESTADOS[uf])}/"><strong>${esc(ESTADOS[uf])}</strong><span>${n} ${n===1?"oportunidade aberta":"oportunidades abertas"}</span></a></li>`; }).join("")}</ul>`;
  return page({ title: "Concursos e oportunidades gratuitas por estado | Nuriteca", desc: "Concursos, cursos, bolsas e oportunidades gratuitas organizados por estado, com prazo e link oficial.", url: "/estados/", body });
}

function guiaPage(g){
  const url = `/guias/${g.slug}/`;
  let abertos = "";
  if (g.abertos) {
    const a = g.abertos;
    const byEnd = (x,y) => ((parseDate(x.encerramento,true)||Infinity) - (parseDate(y.encerramento,true)||Infinity));
    const items = DATA.filter(o => (!a.categoria || o.categoria === a.categoria) && isOpen(o) && (!a.subtipo || a.subtipo.test(o.subtipo||"")) && (!a.escolaridade || a.escolaridade.test((o.escolaridade||"")+" "+(o.prerequisitos||""))) && (!a.filtro || a.filtro.test([o.titulo,o.descricao,o.area,o.subtipo].join(" ")))).sort(byEnd);
    abertos = `<h2>${esc(a.titulo)}</h2>${items.length ? `<ul class="list">${items.map(listItem).join("")}</ul>` : `<p class="note">Nenhum aberto neste momento. Esta lista se atualiza sozinha quando a Nuriteca confere um novo edital.</p>`}${a.categoria ? `<p><a href="/${CATS[a.categoria].slug}/">Ver todos em ${esc(CATS[a.categoria].nome.toLowerCase())} →</a></p>` : ""}`;
  }
  const fontes = (g.fontes||[]).length ? `<h2>Fontes</h2><ul class="fontes">${g.fontes.map(([t,u]) => `<li><a href="${esc(u)}" rel="noopener nofollow" target="_blank">${esc(t)}</a></li>`).join("")}</ul>` : "";
  const body = `<nav class="crumbs"><a href="/">Início</a> › <a href="/guias/">Guias</a></nav>
<div class="arch" style="background:linear-gradient(180deg,#D9A441cc,#B9583C)"></div>
<h1>${esc(g.titulo)}</h1><p class="meta">Guia da Nuriteca · Atualizado em ${fmtDate(g.atualizado)}</p>
<article class="guia">${g.html}</article>${abertos}${fontes}${relGuias(g)}`;
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", headline: g.titulo, description: g.descricao, inLanguage: "pt-BR", datePublished: g.publicado || g.atualizado, dateModified: g.atualizado, mainEntityOfPage: SITE + url, author: { "@type": "Organization", name: "Nuriteca", url: SITE + "/" }, publisher: { "@type": "Organization", name: "Nuriteca", logo: { "@type": "ImageObject", url: SITE + "/icon-512.png" } } },
    { "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Início", item: SITE + "/" }, { "@type": "ListItem", position: 2, name: "Guias", item: SITE + "/guias/" }, { "@type": "ListItem", position: 3, name: g.titulo, item: SITE + url } ] } ] };
  return page({ title: `${g.seoTitulo || g.titulo} | Nuriteca`, desc: cut(g.descricao, 158), url, body, ogType: "article", jsonld: ld, modified: g.atualizado });
}
function guideCats(g){ return new Set([...(g.categorias||[]), g.abertos && g.abertos.categoria].filter(Boolean)); }
function relGuias(g){
  const mine = guideCats(g);
  const others = GUIAS.filter(x => x.slug !== g.slug).map(x => ({ x, n: [...guideCats(x)].filter(k => mine.has(k)).length })).sort((a,b) => b.n - a.n).slice(0, 3).map(r => r.x);
  return others.length ? `<h2>Outros guias</h2><ul class="list">${others.map(x => `<li><a href="/guias/${x.slug}/"><strong>${esc(x.titulo)}</strong><span>${esc(cut(x.descricao, 120))}</span></a></li>`).join("")}</ul>` : "";
}
function guiasIndex(){
  const body = `<nav class="crumbs"><a href="/">Início</a> › Guias</nav><h1>Guias da Nuriteca</h1>
<p class="meta">Explicações curtas e conferidas para você se organizar antes de o edital abrir.</p>
<ul class="list">${GUIAS.map(g => `<li><a href="/guias/${g.slug}/"><strong>${esc(g.titulo)}</strong><span>${esc(g.descricao)}</span></a></li>`).join("")}</ul>`;
  return page({ title: "Guias da Nuriteca: concursos, cursos gratuitos, bolsas e carreira", desc: "Guias para se organizar: concursos que mais pagam, cursos gratuitos com certificado, trainee, Jovem Aprendiz, intercâmbio e trabalho remoto.", url: "/guias/", body });
}

// limpa as pastas geradas e recria
fs.rmSync(path.join(ROOT, "guias"), { recursive: true, force: true });
for (const c of Object.values(CATS)) fs.rmSync(path.join(ROOT, c.slug), { recursive: true, force: true });
fs.rmSync(path.join(ROOT, "estados"), { recursive: true, force: true });
const urls = [{ loc: "/", lastmod: NOW.toISOString().slice(0,10), pr: "1.0" }];
const write = (rel, html) => { const p = path.join(ROOT, rel, "index.html"); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, html); };
let n = 0;
for (const key of Object.keys(CATS)) {
  write(CATS[key].slug, catPage(key));
  urls.push({ loc: `/${CATS[key].slug}/`, lastmod: NOW.toISOString().slice(0,10), pr: "0.8" });
}
for (const o of DATA) {
  if (!CATS[o.categoria]) continue;
  write(itemUrl(o).slice(1, -1), itemPage(o));
  if (!closedLong(o)) urls.push({ loc: itemUrl(o), lastmod: (o.verificadoEm || o.criadoEm || NOW.toISOString()).slice(0,10), pr: isOpen(o) ? "0.7" : "0.3" });
  n++;
}
// endereços antigos de oportunidades fundidas continuam funcionando (redirecionam para a página atual)
for (const o of DATA) for (const old of (o.redirects || [])) { if (old !== itemUrl(o)) write(old.replace(/^\/|\/$/g, ""), redirectPage(itemUrl(o))); }
fs.writeFileSync(path.join(ROOT, "404.html"), page({ title: "Página não encontrada | Nuriteca", desc: "Esta página não existe mais. Veja as oportunidades abertas na Nuriteca.", url: "/404.html", noindex: true,
  body: `<h1 style="margin-top:30px">Esta página não foi encontrada</h1><p class="intro">A oportunidade pode ter mudado de endereço ou saído do ar. Veja o que está aberto agora:</p>${catLinks()}<div class="btns"><a class="btn" href="/">Ir para a página inicial</a></div>` }));
const UFS = Object.keys(ESTADOS).filter(uf => uf !== "Nacional" && DATA.some(o => o.estado === uf && CATS[o.categoria])).sort((a,b) => ESTADOS[a].localeCompare(ESTADOS[b], "pt"));
write("estados", statesIndex(UFS));
urls.push({ loc: "/estados/", lastmod: NOW.toISOString().slice(0,10), pr: "0.8" });
for (const uf of UFS) { write(`estados/${slugify(ESTADOS[uf])}`, statePage(uf)); urls.push({ loc: `/estados/${slugify(ESTADOS[uf])}/`, lastmod: NOW.toISOString().slice(0,10), pr: "0.7" }); }
if (GUIAS.length) {
  write("guias", guiasIndex()); urls.push({ loc: "/guias/", lastmod: NOW.toISOString().slice(0,10), pr: "0.8" });
  for (const g of GUIAS) { write(`guias/${g.slug}`, guiaPage(g)); urls.push({ loc: `/guias/${g.slug}/`, lastmod: g.atualizado || NOW.toISOString().slice(0,10), pr: "0.9" }); }
}
// telas do app com endereço próprio (cópias da página principal; o app lê o endereço e abre a tela certa).
// Sempre que mudar o index.html, rode este script de novo para atualizar as cópias.
const APP_PAGES = {
  "buscar": ["Buscar oportunidades gratuitas | Nuriteca", 1], "calendario": ["Calendário de prazos | Nuriteca", 1],
  "descontos-e-bolsas": ["Descontos e bolsas de estudo | Nuriteca", 1], "intercambios": ["Intercâmbios gratuitos | Nuriteca", 1],
  "carreira": ["Estágio, trainee e jovem aprendiz | Nuriteca", 1], "contato": ["Fale conosco | Nuriteca", 1],
  "anuncie": ["Anuncie na Nuriteca", 1], "sobre": ["Sobre a Nuriteca e como verificamos as oportunidades", 1],
  "termos": ["Termos de uso | Nuriteca", 1], "privacidade": ["Política de privacidade | Nuriteca", 1],
  "cookies": ["Política de cookies | Nuriteca", 1], "reembolso": ["Política de reembolso | Nuriteca", 0],
  "teste-concurso": ["Teste: qual concurso combina com você? | Nuriteca", 1], "teste-graduacao": ["Teste: qual faculdade combina com você? | Nuriteca", 1],
  "curriculo": ["Criador de currículo grátis: 3 modelos para baixar em PDF | Nuriteca", 1, "Crie seu currículo profissional grátis e sem cadastro. Escolha entre 3 modelos, inclusive um para primeiro emprego, preencha e baixe em PDF."],
  "minhas": ["Minhas oportunidades | Nuriteca", 0], "alertas": ["Alertas | Nuriteca", 0], "painel": ["Painel | Nuriteca", 0],
};
const APP = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
for (const [slug, [title, idx, desc]] of Object.entries(APP_PAGES)) {
  const url = `${SITE}/${slug}/`;
  let h = APP.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
             .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
             .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  if (desc) h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  if (!idx) h = h.replace("<head>", `<head><meta name="robots" content="noindex,follow">`);
  write(slug, h);
  if (idx) urls.push({ loc: `/${slug}/`, lastmod: NOW.toISOString().slice(0,10), pr: "0.5" });
}

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pr}</priority></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Páginas geradas: ${n} oportunidades + ${Object.keys(CATS).length} categorias + ${UFS.length} estados + ${GUIAS.length} guias. sitemap.xml com ${urls.length} endereços.`);
