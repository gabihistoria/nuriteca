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
  intercambio: { slug: "intercambio",          nome: "Intercâmbios e estudo no exterior", titulo: "Intercâmbios e bolsas para estudar no exterior",      cor: "#567F70" },
  carreira:    { slug: "estagio-e-trainee",    nome: "Estágio, trainee e jovem aprendiz", titulo: "Programas de estágio, trainee e jovem aprendiz abertos", cor: "#C77A45" },
};
const ESTADOS = {AC:"Acre",AL:"Alagoas",AP:"Amapá",AM:"Amazonas",BA:"Bahia",CE:"Ceará",DF:"Distrito Federal",ES:"Espírito Santo",GO:"Goiás",MA:"Maranhão",MT:"Mato Grosso",MS:"Mato Grosso do Sul",MG:"Minas Gerais",PA:"Pará",PB:"Paraíba",PR:"Paraná",PE:"Pernambuco",PI:"Piauí",RJ:"Rio de Janeiro",RN:"Rio Grande do Norte",RS:"Rio Grande do Sul",RO:"Rondônia",RR:"Roraima",SC:"Santa Catarina",SP:"São Paulo",SE:"Sergipe",TO:"Tocantins",Nacional:"Brasil todo"};
const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const slugify = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const cut = (s, n) => { s = String(s||"").replace(/\s+/g," ").trim(); return s.length <= n ? s : s.slice(0, n-1).replace(/\s+\S*$/,"") + "…"; };
const ok = v => v && !/^informação não confirmada$/i.test(String(v).trim());

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
.guia h2{margin-top:38px}.guia ul{padding-left:22px}.guia li{margin:6px 0}.guia p,.guia li{font-size:17.5px}.aviso{background:#FBEDE3;border:1px solid #F1D3C2;border-radius:16px;padding:14px 18px;font-size:16px!important}.fontes{font-size:14px;color:var(--muted)}.fontes li{font-size:14px!important}
footer{margin-top:50px;border-top:1px solid var(--line);padding:26px 0 40px;font-size:14px;color:var(--muted)}
@media(max-width:640px){dl{grid-template-columns:1fr}dt{border-bottom:0;padding-bottom:0}}`;

const LOGO = `<a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M2 24 C 6 15, 12 13, 16 16 L 16 28 C 12 25, 6 25, 2 28 Z" fill="#E8735F"/><path d="M30 24 C 26 15, 20 13, 16 16 L 16 28 C 20 25, 26 25, 30 28 Z" fill="#B9583C"/><circle cx="16" cy="7" r="3.4" fill="#D9A441"/></svg>Nuriteca</a>`;
const catLinks = () => `<div class="cats">${Object.values(CATS).map(c=>`<a href="/${c.slug}/">${esc(c.nome)}</a>`).join("")}</div>`;
const FOOTER = `<footer><div class="wrap"><p><strong>Navegue por categoria</strong></p>${catLinks()}<p style="margin-top:14px"><a href="/estados/">Ver oportunidades por estado →</a> · <a href="/guias/">Guias da Nuriteca →</a></p>
<p style="margin-top:22px">A Nuriteca reúne oportunidades gratuitas e leva você ao site oficial. Aqui não há inscrição nem cobrança. Confira sempre o edital.</p>
<p><a href="/">Página inicial</a> · <a href="https://www.instagram.com/nuriteca/" rel="noopener">@nuriteca no Instagram</a> · <a href="/#contato">Fale conosco</a> · <a href="/#termos">Termos de uso</a> · <a href="/#privacidade">Privacidade</a></p></div></footer>`;

function page({title, desc, url, body, ogType="website"}){
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="Nuriteca"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${url}"><meta property="og:image" content="${SITE}/icon-512.png"><meta property="og:locale" content="pt_BR">
<meta name="theme-color" content="#FBF4EC">${ICON}${FONTS}<style>${CSS}</style></head>
<body><header><div class="wrap">${LOGO}<a class="back" href="/">Ver todas →</a></div></header>
<main class="wrap">${body}</main>${FOOTER}${BEACON}</body></html>`;
}

function itemPage(o){
  const c = CATS[o.categoria], st = status(o);
  const local = o.estado === "Nacional" ? (o.municipio || "Brasil todo") : [o.municipio, ESTADOS[o.estado] || o.estado].filter(Boolean).join(" · ");
  const rows = [
    ["Quem pode participar", o.prerequisitos || o.escolaridade],
    ["Escolaridade", o.escolaridade],
    ["Vagas", o.vagas],
    ["Área", o.area],
    ["Onde", local],
    ["Modalidade", o.modalidade],
    ["Benefícios ou valor", o.gratuidade && !/^gratuito$/i.test(o.gratuidade) ? o.gratuidade : ""],
    ["Taxa de inscrição", o.taxa],
    ["Isenção da taxa", o.isencao && !/não se aplica/i.test(o.isencao) ? o.isencao : ""],
    ["Documentos e etapas", o.documentos],
    ["Certificado", o.certificacao && !/não se aplica/i.test(o.certificacao) ? o.certificacao : ""],
    ["Abertura das inscrições", o.abertura ? fmtDate(o.abertura) : ""],
    ["Fim das inscrições", o.fluxoContinuo ? "Fluxo contínuo" : (o.encerramento ? fmtDate(o.encerramento) : "")],
    ["Conferido pela Nuriteca em", o.verificadoEm ? fmtDate(o.verificadoEm) : ""],
  ].filter(([,v]) => ok(v));
  const btns = [
    o.linkInscricao && `<a class="btn" href="${esc(o.linkInscricao)}" rel="noopener" target="_blank">Ir para a inscrição oficial</a>`,
    o.linkEdital && `<a class="btn ghost" href="${esc(o.linkEdital)}" rel="noopener" target="_blank">Ler o edital</a>`,
    o.siteOficial && `<a class="btn ${o.linkInscricao ? "ghost" : ""}" href="${esc(o.siteOficial)}" rel="noopener" target="_blank">Site oficial</a>`,
  ].filter(Boolean).join("");
  const outros = DATA.filter(x => x.categoria === o.categoria && x.id !== o.id && isOpen(x)).slice(0, 5);
  const prazo = o.encerramento && !o.fluxoContinuo ? ` Inscrições até ${fmtShort(o.encerramento)}.` : "";
  const desc = cut(`${o.titulo}.${prazo} ${o.descricao}`, 158);
  const body = `<nav class="crumbs"><a href="/">Início</a> › <a href="/${c.slug}/">${esc(c.nome)}</a></nav>
<div class="arch" style="background:linear-gradient(180deg,${c.cor}cc,${c.cor})"></div>
<h1>${esc(o.titulo)}</h1>
<p class="meta">${esc([o.instituicao, o.subtipo].filter(Boolean).join(" · "))}</p>
<span class="status ${st.cls}">${esc(st.txt)}</span>
<p class="desc">${esc(o.descricao)}</p>
<dl>${rows.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
<div class="btns">${btns}<a class="btn ghost" href="/#op-${esc(o.id)}">Salvar na Nuriteca</a></div>
<p class="note">A inscrição é feita só no site oficial da instituição. Datas podem ser prorrogadas ou mudar: confira sempre o edital.${o.fonte ? ` Fonte: <a href="${esc(o.fonte)}" rel="noopener nofollow" target="_blank">${esc(new URL(o.fonte).hostname.replace(/^www\./,""))}</a>.` : ""}</p>
${outros.length ? `<h2>Mais em ${esc(c.nome.toLowerCase())}</h2><ul class="list">${outros.map(listItem).join("")}</ul>` : ""}`;
  return page({ title: `${o.titulo} | Nuriteca`, desc, url: itemUrl(o), body, ogType: "article" });
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
  const desc = cut(`${c.titulo} no Brasil todo, com prazo, requisitos e link oficial. ${abertas.length} oportunidades conferidas pela Nuriteca.`, 158);
  const body = `<nav class="crumbs"><a href="/">Início</a> › ${esc(c.nome)}</nav>
<div class="arch" style="background:linear-gradient(180deg,${c.cor}cc,${c.cor})"></div>
<h1>${esc(c.titulo)}</h1>
<p class="meta">Lista conferida pela Nuriteca, com link para o site oficial de cada oportunidade. Atualizada em ${fmtDate(new Date(NOW.getTime()-3*3600e3).toISOString().slice(0,10))}.</p>
${abertas.length ? `<ul class="list">${abertas.map(listItem).join("")}</ul>` : `<p class="note">Nenhuma oportunidade aberta nesta categoria agora. Volte em breve ou siga a <a href="https://www.instagram.com/nuriteca/">@nuriteca</a>.</p>`}
${fechadas.length ? `<h2>Encerradas recentemente</h2><ul class="list">${fechadas.map(listItem).join("")}</ul>` : ""}
<div class="btns"><a class="btn" href="/">Buscar no site da Nuriteca</a></div>`;
  return page({ title: `${c.titulo} | Nuriteca`, desc, url, body });
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
    const items = DATA.filter(o => o.categoria === a.categoria && isOpen(o) && (!a.subtipo || a.subtipo.test(o.subtipo||"")) && (!a.escolaridade || a.escolaridade.test((o.escolaridade||"")+" "+(o.prerequisitos||"")))).sort(byEnd);
    abertos = `<h2>${esc(a.titulo)}</h2>${items.length ? `<ul class="list">${items.map(listItem).join("")}</ul>` : `<p class="note">Nenhum aberto neste momento. Esta lista se atualiza sozinha quando a Nuriteca confere um novo edital.</p>`}<p><a href="/${CATS[a.categoria].slug}/">Ver todos em ${esc(CATS[a.categoria].nome.toLowerCase())} →</a></p>`;
  }
  const fontes = (g.fontes||[]).length ? `<h2>Fontes</h2><ul class="fontes">${g.fontes.map(([t,u]) => `<li><a href="${esc(u)}" rel="noopener nofollow" target="_blank">${esc(t)}</a></li>`).join("")}</ul>` : "";
  const body = `<nav class="crumbs"><a href="/">Início</a> › <a href="/guias/">Guias</a></nav>
<div class="arch" style="background:linear-gradient(180deg,#D9A441cc,#B9583C)"></div>
<h1>${esc(g.titulo)}</h1><p class="meta">Guia da Nuriteca · Atualizado em ${fmtDate(g.atualizado)}</p>
<article class="guia">${g.html}</article>${abertos}${fontes}`;
  return page({ title: `${g.titulo} | Nuriteca`, desc: cut(g.descricao, 158), url, body, ogType: "article" });
}
function guiasIndex(){
  const body = `<nav class="crumbs"><a href="/">Início</a> › Guias</nav><h1>Guias da Nuriteca</h1>
<p class="meta">Explicações curtas e conferidas para você se organizar antes de o edital abrir.</p>
<ul class="list">${GUIAS.map(g => `<li><a href="/guias/${g.slug}/"><strong>${esc(g.titulo)}</strong><span>${esc(g.descricao)}</span></a></li>`).join("")}</ul>`;
  return page({ title: "Guias da Nuriteca: estágio, trainee, jovem aprendiz e intercâmbio", desc: "Guias para se organizar: calendário de trainee e estágio, Jovem Aprendiz e intercâmbio gratuito no ensino médio.", url: "/guias/", body });
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
  urls.push({ loc: itemUrl(o), lastmod: (o.verificadoEm || o.criadoEm || NOW.toISOString()).slice(0,10), pr: isOpen(o) ? "0.7" : "0.3" });
  n++;
}
const UFS = Object.keys(ESTADOS).filter(uf => uf !== "Nacional" && DATA.some(o => o.estado === uf && CATS[o.categoria])).sort((a,b) => ESTADOS[a].localeCompare(ESTADOS[b], "pt"));
write("estados", statesIndex(UFS));
urls.push({ loc: "/estados/", lastmod: NOW.toISOString().slice(0,10), pr: "0.8" });
for (const uf of UFS) { write(`estados/${slugify(ESTADOS[uf])}`, statePage(uf)); urls.push({ loc: `/estados/${slugify(ESTADOS[uf])}/`, lastmod: NOW.toISOString().slice(0,10), pr: "0.7" }); }
if (GUIAS.length) {
  write("guias", guiasIndex()); urls.push({ loc: "/guias/", lastmod: NOW.toISOString().slice(0,10), pr: "0.8" });
  for (const g of GUIAS) { write(`guias/${g.slug}`, guiaPage(g)); urls.push({ loc: `/guias/${g.slug}/`, lastmod: g.atualizado || NOW.toISOString().slice(0,10), pr: "0.9" }); }
}
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pr}</priority></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Páginas geradas: ${n} oportunidades + ${Object.keys(CATS).length} categorias + ${UFS.length} estados + ${GUIAS.length} guias. sitemap.xml com ${urls.length} endereços.`);
