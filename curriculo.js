/* ---------- Criador de currículo da Nuriteca ----------
   Tudo acontece no navegador: os dados ficam só no aparelho da pessoa (localStorage) e o PDF sai pela impressão do navegador. */
(function(){
const CV_KEY = "nuriteca-curriculo";
const MODELOS = {
  classico: {nome:"Clássico", desc:"Uma coluna, sóbrio e fácil de ler. Vai bem em qualquer vaga e passa pelos sistemas de triagem."},
  moderno:  {nome:"Moderno", desc:"Coluna lateral colorida com contato, habilidades e idiomas. Bom para áreas criativas, comunicação e educação."},
  primeiro: {nome:"Primeiro emprego", desc:"Destaca objetivo, formação, cursos e atividades. Feito para estágio, jovem aprendiz e quem ainda não tem experiência."}
};
const VAZIO = () => ({modelo:"classico", nome:"", cargo:"", cidade:"", tel:"", email:"", link:"", resumo:"",
  exp:[{cargo:"",empresa:"",local:"",inicio:"",fim:"",desc:""}], form:[{curso:"",inst:"",periodo:""}],
  cursos:[{nome:"",inst:"",ano:""}], idiomas:[{idioma:"",nivel:""}], habs:"", extras:"", info:""});
const EXEMPLO = () => ({modelo:"classico", nome:"Ana Clara Souza", cargo:"Assistente administrativa", cidade:"Florianópolis, SC", tel:"(48) 99999-0000", email:"anaclara@email.com", link:"linkedin.com/in/anaclarasouza",
  resumo:"Profissional organizada e comunicativa, com experiência em atendimento ao público e rotinas de escritório. Busco uma vaga na área administrativa para crescer e contribuir com uma equipe que valoriza qualidade no atendimento.",
  exp:[{cargo:"Recepcionista",empresa:"Clínica Bem Viver",local:"Florianópolis, SC",inicio:"03/2023",fim:"atual",desc:"Atendimento presencial e por telefone de cerca de 60 pacientes por dia\nAgendamento de consultas e controle da agenda médica\nOrganização de documentos e cadastro no sistema da clínica"},
       {cargo:"Jovem aprendiz",empresa:"Supermercado Bom Preço",local:"São José, SC",inicio:"02/2021",fim:"01/2023",desc:"Apoio ao setor de compras e controle de estoque\nLançamento de notas fiscais em planilhas"}],
  form:[{curso:"Tecnólogo em Gestão de Recursos Humanos",inst:"IFSC",periodo:"2024 – 2026 (cursando)"},{curso:"Ensino Médio",inst:"EEB Professora Maria Silva",periodo:"Concluído em 2021"}],
  cursos:[{nome:"Excel Intermediário",inst:"Fundação Bradesco",ano:"2024 · 20 h"},{nome:"Atendimento ao Cliente",inst:"Sebrae",ano:"2023 · 8 h"}],
  idiomas:[{idioma:"Inglês",nivel:"Intermediário"},{idioma:"Espanhol",nivel:"Básico"}],
  habs:"Pacote Office, Atendimento ao público, Organização, Trabalho em equipe, Comunicação",
  extras:"Voluntária na campanha de arrecadação de agasalhos da escola (2022)", info:"Disponibilidade para início imediato · CNH categoria B"});

let cv = null;
function load(){ try{ const j=JSON.parse(localStorage.getItem(CV_KEY)||"null"); if(j&&typeof j==="object") return Object.assign(VAZIO(), j); }catch(e){} return VAZIO(); }
let saveT=null;
function save(){ try{ localStorage.setItem(CV_KEY, JSON.stringify(cv)); }catch(e){} }
const E = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function aviso(msg){ const t=document.getElementById("toast"); if(!t) return; t.textContent=msg; t.style.display="block"; clearTimeout(aviso._t); aviso._t=setTimeout(()=>t.style.display="none",3200); }
const lines = s => String(s||"").split(/\n+/).map(x=>x.replace(/^[-•*]\s*/,"").trim()).filter(Boolean);
const list = s => String(s||"").split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean);
const filled = o => Object.entries(o).some(([k,v])=>String(v||"").trim());

/* ---------- formulário ---------- */
const LISTAS = {
  exp:{t:"Experiência profissional", add:"Adicionar experiência", novo:()=>({cargo:"",empresa:"",local:"",inicio:"",fim:"",desc:""}),
    campos:[["cargo","Cargo","Ex.: Auxiliar administrativo"],["empresa","Empresa","Nome da empresa"],["local","Cidade","Ex.: Curitiba, PR"],["inicio","Início","Ex.: 03/2023"],["fim","Fim","Ex.: 12/2024 ou atual"],["desc","O que você fazia (uma atividade por linha)","Atendimento ao público\nControle de planilhas","area"]]},
  form:{t:"Formação", add:"Adicionar formação", novo:()=>({curso:"",inst:"",periodo:""}),
    campos:[["curso","Curso","Ex.: Ensino Médio, Técnico em Enfermagem"],["inst","Instituição","Nome da escola ou faculdade"],["periodo","Período ou situação","Ex.: Concluído em 2022, ou cursando"]]},
  cursos:{t:"Cursos e certificados", add:"Adicionar curso", novo:()=>({nome:"",inst:"",ano:""}),
    campos:[["nome","Curso","Ex.: Excel básico"],["inst","Instituição","Ex.: Fundação Bradesco"],["ano","Ano e carga horária","Ex.: 2024 · 20 h"]]},
  idiomas:{t:"Idiomas", add:"Adicionar idioma", novo:()=>({idioma:"",nivel:""}),
    campos:[["idioma","Idioma","Ex.: Inglês"],["nivel","Nível","Básico, intermediário, avançado ou fluente"]]}
};
function inp(path, label, ph, val, tipo){
  const id="cv-"+path.replace(/\./g,"-");
  return tipo==="area"
    ? `<label class="field" for="${id}">${label}<textarea id="${id}" data-cv="${path}" rows="4" placeholder="${E(ph)}">${E(val)}</textarea></label>`
    : `<label class="field" for="${id}">${label}<input id="${id}" data-cv="${path}" placeholder="${E(ph)}" value="${E(val)}"${tipo?` type="${tipo}" autocomplete="${tipo==="email"?"email":"tel"}"`:""}></label>`;
}
function blocoLista(k){
  const L=LISTAS[k];
  return `<fieldset class="cv-fs" id="cv-fs-${k}"><legend>${L.t}</legend>
    ${cv[k].map((it,i)=>`<div class="cv-item"><div class="cv-item-head"><b>${L.t.split(" ")[0]} ${i+1}</b>${cv[k].length>1?`<button type="button" class="cv-x" data-cv-del="${k}.${i}" aria-label="Remover">Remover</button>`:""}</div>
      <div class="cv-grid">${L.campos.map(([f,lab,ph,t])=>inp(`${k}.${i}.${f}`,lab,ph,it[f],t)).join("")}</div></div>`).join("")}
    <button type="button" class="btn ghost small" data-cv-add="${k}">+ ${L.add}</button></fieldset>`;
}
function formHTML(){
  return `
  <fieldset class="cv-fs"><legend>Seus dados</legend><div class="cv-grid">
    ${inp("nome","Nome completo","Seu nome",cv.nome)}
    ${inp("cargo","Cargo ou área que você busca","Ex.: Estágio em Administração",cv.cargo)}
    ${inp("cidade","Cidade e estado","Ex.: Recife, PE",cv.cidade)}
    ${inp("tel","Telefone ou WhatsApp","(00) 00000-0000",cv.tel,"tel")}
    ${inp("email","E-mail","seunome@email.com",cv.email,"email")}
    ${inp("link","LinkedIn ou portfólio (opcional)","linkedin.com/in/seunome",cv.link)}
  </div></fieldset>
  <fieldset class="cv-fs"><legend>${cv.modelo==="primeiro"?"Objetivo":"Resumo profissional"}</legend>
    ${inp("resumo", cv.modelo==="primeiro"?"Em 2 ou 3 linhas: que vaga você quer e o que pode oferecer":"Em 3 ou 4 linhas: quem você é, o que sabe fazer e o que busca", cv.modelo==="primeiro"?"Ex.: Busco minha primeira oportunidade como jovem aprendiz na área administrativa. Sou organizado, pontual e aprendo rápido.":"Ex.: Técnica em enfermagem com 4 anos de experiência em pronto atendimento...", cv.resumo, "area")}
  </fieldset>
  ${cv.modelo==="primeiro" ? blocoLista("form")+blocoLista("cursos")+blocoExtras()+blocoLista("exp") : blocoLista("exp")+blocoLista("form")+blocoLista("cursos")}
  ${blocoLista("idiomas")}
  <fieldset class="cv-fs"><legend>Habilidades</legend>${inp("habs","Separe por vírgula","Ex.: Pacote Office, atendimento ao público, trabalho em equipe",cv.habs,"area")}</fieldset>
  ${cv.modelo==="primeiro"?"":blocoExtras()}
  <fieldset class="cv-fs"><legend>Informações adicionais (opcional)</legend>${inp("info","Ex.: disponibilidade de horário, CNH, mudança de cidade","Ex.: Disponibilidade para o período da tarde · CNH B",cv.info)}</fieldset>`;
}
function blocoExtras(){ return `<fieldset class="cv-fs"><legend>Atividades e voluntariado (opcional)</legend>${inp("extras","Projetos da escola, voluntariado, grêmio, monitoria... (um por linha)","Ex.: Monitor de matemática no 2º ano do Ensino Médio",cv.extras,"area")}</fieldset>`; }

/* ---------- currículo (prévia e PDF) ---------- */
function secao(t, corpo){ return corpo ? `<section class="cvs"><h3>${t}</h3>${corpo}</section>` : ""; }
function expHTML(){ const xs=cv.exp.filter(filled); if(!xs.length) return "";
  return xs.map(x=>`<div class="cv-ent"><div class="cv-ent-top"><b>${E(x.cargo)}</b>${x.inicio||x.fim?`<span>${E([x.inicio,x.fim].filter(Boolean).join(" – "))}</span>`:""}</div>
    ${x.empresa||x.local?`<div class="cv-ent-sub">${E([x.empresa,x.local].filter(Boolean).join(" · "))}</div>`:""}
    ${lines(x.desc).length?`<ul>${lines(x.desc).map(l=>`<li>${E(l)}</li>`).join("")}</ul>`:""}</div>`).join(""); }
function formHTMLcv(){ const xs=cv.form.filter(filled); if(!xs.length) return "";
  return xs.map(x=>`<div class="cv-ent"><div class="cv-ent-top"><b>${E(x.curso)}</b>${x.periodo?`<span>${E(x.periodo)}</span>`:""}</div>${x.inst?`<div class="cv-ent-sub">${E(x.inst)}</div>`:""}</div>`).join(""); }
function cursosHTML(){ const xs=cv.cursos.filter(filled); if(!xs.length) return "";
  return `<ul class="cv-plain">${xs.map(x=>`<li><b>${E(x.nome)}</b>${x.inst?` · ${E(x.inst)}`:""}${x.ano?` <span class="cv-dim">(${E(x.ano)})</span>`:""}</li>`).join("")}</ul>`; }
function idiomasHTML(){ const xs=cv.idiomas.filter(filled); if(!xs.length) return "";
  return `<ul class="cv-plain">${xs.map(x=>`<li><b>${E(x.idioma)}</b>${x.nivel?`: ${E(x.nivel)}`:""}</li>`).join("")}</ul>`; }
function habsHTML(tags){ const xs=list(cv.habs); if(!xs.length) return "";
  return tags ? `<ul class="cv-tags">${xs.map(h=>`<li>${E(h)}</li>`).join("")}</ul>` : `<p>${xs.map(E).join(" · ")}</p>`; }
function extrasHTML(){ const xs=lines(cv.extras); return xs.length?`<ul>${xs.map(l=>`<li>${E(l)}</li>`).join("")}</ul>`:""; }
function contatos(){ return [cv.cidade,cv.tel,cv.email,cv.link].filter(x=>String(x||"").trim()); }
function cvHTML(){
  const nome = E(cv.nome)||'<span class="cv-dim">Seu nome</span>', cargo = cv.cargo?`<p class="cv-cargo">${E(cv.cargo)}</p>`:"";
  const resumo = cv.resumo.trim()?`<p>${E(cv.resumo)}</p>`:"";
  const info = cv.info.trim()?`<p>${E(cv.info)}</p>`:"";
  if(cv.modelo==="moderno"){
    return `<div class="cv cv-moderno"><aside class="cv-side">
      <h1>${nome}</h1>${cargo}
      ${contatos().length?`<section class="cvs"><h3>Contato</h3><ul class="cv-plain">${contatos().map(c=>`<li>${E(c)}</li>`).join("")}</ul></section>`:""}
      ${secao("Habilidades",habsHTML(true))}${secao("Idiomas",idiomasHTML())}${secao("Informações",info)}
    </aside><div class="cv-main">
      ${secao("Perfil",resumo)}${secao("Experiência",expHTML())}${secao("Formação",formHTMLcv())}${secao("Cursos e certificados",cursosHTML())}${secao("Atividades e voluntariado",extrasHTML())}
    </div></div>`;
  }
  const topo = `<header class="cv-head"><h1>${nome}</h1>${cargo}${contatos().length?`<p class="cv-contato">${contatos().map(E).join('<span aria-hidden="true"> · </span>')}</p>`:""}</header>`;
  if(cv.modelo==="primeiro"){
    return `<div class="cv cv-primeiro">${topo}
      ${secao("Objetivo",resumo)}${secao("Formação",formHTMLcv())}${secao("Cursos e certificados",cursosHTML())}${secao("Habilidades",habsHTML(true))}
      ${secao("Atividades e voluntariado",extrasHTML())}${secao("Experiência",expHTML())}${secao("Idiomas",idiomasHTML())}${secao("Informações adicionais",info)}</div>`;
  }
  return `<div class="cv cv-classico">${topo}
    ${secao("Resumo profissional",resumo)}${secao("Experiência profissional",expHTML())}${secao("Formação",formHTMLcv())}${secao("Cursos e certificados",cursosHTML())}
    ${secao("Idiomas",idiomasHTML())}${secao("Habilidades",habsHTML(false))}${secao("Atividades e voluntariado",extrasHTML())}${secao("Informações adicionais",info)}</div>`;
}

/* ---------- tela ---------- */
window.viewCurriculo = function(){
  cv = load();
  return `<div class="wrap cv-wrap">
    <div class="cv-intro">
      <h1>Crie seu currículo profissional aqui</h1>
      <p class="note">Grátis, sem cadastro. Escolha um modelo, preencha e baixe em PDF. Seus dados ficam só no seu aparelho: a Nuriteca não recebe nem guarda nada.</p>
    </div>
    <div class="cv-modelos" role="radiogroup" aria-label="Modelo do currículo">
      ${Object.entries(MODELOS).map(([k,m])=>`<button type="button" role="radio" class="cv-mod" data-cv-modelo="${k}" aria-checked="${cv.modelo===k}">
        <span class="cv-thumb cv-thumb-${k}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b>${m.nome}</b><small>${m.desc}</small></button>`).join("")}
    </div>
    <div class="cv-app">
      <div><form class="cv-form" id="cv-form" novalidate>${formHTML()}</form><button type="button" class="btn cv-ver" data-cv-acao="ver">Pronto! Ver meu currículo ↓</button></div>
      <div class="cv-prev" id="cv-prev">
        <div class="cv-bar">
          <button type="button" class="btn" data-cv-acao="pdf">Baixar em PDF</button>
          <button type="button" class="btn ghost small" data-cv-acao="exemplo">Ver exemplo</button>
          <button type="button" class="btn ghost small" data-cv-acao="limpar">Apagar tudo</button>
        </div>
        <div class="cv-scale" id="cv-scale"><div class="cv-page" id="cv-page">${cvHTML()}</div></div>
        <p class="note cv-dica">Para baixar: clique em <b>Baixar em PDF</b> e, na janela que abrir, escolha <b>Salvar como PDF</b> no lugar da impressora.</p>
      </div>
    </div>
    <section class="cv-dicas legal">
      <h2>Dicas rápidas</h2>
      <p><b>Uma ou duas páginas bastam.</b> Quem está começando pode ter uma página só. Coloque primeiro o que mais combina com a vaga.</p>
      <p><b>Mostre resultado, não só tarefa.</b> Em vez de "atendimento ao cliente", escreva "atendia cerca de 60 clientes por dia".</p>
      <p><b>Sem experiência? Sem problema.</b> Cursos, projetos da escola, voluntariado e monitoria contam, e o modelo Primeiro emprego dá destaque a eles.</p>
      <p><b>Não precisa de foto, CPF, RG nem estado civil.</b> Essas informações não são exigidas no currículo e protegem você de discriminação.</p>
      <p><b>Use um e-mail sério</b>, de preferência com o seu nome, e revise a ortografia antes de enviar.</p>
      <p>Procurando vaga? Veja os <a href="/carreira/">programas de estágio, trainee e jovem aprendiz</a> com inscrições abertas.</p>
    </section>
  </div>`;
};
function atualiza(){ const p=document.getElementById("cv-page"); if(p) p.innerHTML=cvHTML(); escala(); save(); }
function refazForm(){ const f=document.getElementById("cv-form"); if(f) f.innerHTML=formHTML(); atualiza(); }
function escala(){
  const box=document.getElementById("cv-scale"), pg=document.getElementById("cv-page"); if(!box||!pg) return;
  const s=Math.min(1, box.clientWidth/pg.offsetWidth); pg.style.transform=`scale(${s})`; box.style.height=(pg.offsetHeight*s)+"px";
}
window.cvInit = function(){ escala(); setTimeout(escala,300); if(document.fonts) document.fonts.ready.then(escala); };
window.addEventListener("resize", escala);
document.addEventListener("input", ev=>{
  const el=ev.target; if(!el.dataset||!el.dataset.cv||!cv) return;
  const p=el.dataset.cv.split("."); if(p.length===1) cv[p[0]]=el.value; else cv[p[0]][+p[1]][p[2]]=el.value;
  atualiza();
});
document.addEventListener("click", ev=>{
  const b=ev.target.closest&&ev.target.closest("[data-cv-add],[data-cv-del],[data-cv-modelo],[data-cv-acao]"); if(!b||!cv) return;
  if(b.dataset.cvAdd){ const k=b.dataset.cvAdd; cv[k].push(LISTAS[k].novo()); refazForm();
    const its=document.querySelectorAll(`#cv-fs-${k} .cv-item`); const last=its[its.length-1]; if(last){ const i=last.querySelector("input,textarea"); if(i) i.focus(); } return; }
  if(b.dataset.cvDel){ const [k,i]=b.dataset.cvDel.split("."); cv[k].splice(+i,1); refazForm(); return; }
  if(b.dataset.cvModelo){ cv.modelo=b.dataset.cvModelo; document.querySelectorAll("[data-cv-modelo]").forEach(x=>x.setAttribute("aria-checked", x===b)); refazForm(); return; }
  const a=b.dataset.cvAcao;
  if(a==="ver"){ const p=document.getElementById("cv-prev"); if(p) p.scrollIntoView({behavior:"smooth"}); return; }
  if(a==="pdf"){ const t=document.title; document.title=(cv.nome?"Curriculo "+cv.nome:"Curriculo")+" - Nuriteca"; document.body.classList.add("cv-print"); window.print(); setTimeout(()=>{ document.body.classList.remove("cv-print"); document.title=t; },500); }
  if(a==="exemplo"){ if(filled({a:cv.nome,b:cv.resumo}) && !confirmaTroca()) return; const m=cv.modelo; cv=EXEMPLO(); cv.modelo=m; refazForm(); }
  if(a==="limpar"){ if(!confirmaTroca()) return; const m=cv.modelo; cv=VAZIO(); cv.modelo=m; refazForm(); }
});
// pergunta antes de apagar o que a pessoa já escreveu (botão confirma em dois cliques, sem caixa de diálogo do navegador)
let armado=0;
function confirmaTroca(){ if(Date.now()-armado<4000){ armado=0; return true; } armado=Date.now(); aviso("Isso apaga o que você escreveu. Clique de novo para confirmar."); return false; }
window.addEventListener("beforeprint", ()=>{ const pg=document.getElementById("cv-page"); if(pg && document.body.classList.contains("cv-print")) pg.style.transform="none"; });
window.addEventListener("afterprint", ()=>{ escala(); });
window.cardCurriculo = () => `<a class="ad ad-teste" href="/curriculo/" style="--bn:var(--petroleo)"><span class="ad-img"><span><i aria-hidden="true">📄</i><b>Currículo em 10 minutos</b></span></span><span class="ad-body"><span class="ad-tag">Grátis · 3 modelos</span><strong>Crie seu currículo profissional</strong><span class="ad-txt">Preencha, escolha o modelo e baixe em PDF.</span><em>Criar agora →</em></span></a>`;
})();
