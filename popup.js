/* Cartãozinho de publicidade no canto da tela.
   Aparece uma vez por visita, depois de 40 s. Fechou: volta só em 24 h. Clicou: volta em 7 dias.
   Para desligar: ativo:false. */
(function(){
  var P = {
    ativo: true,
    id: "awin-galicia-mba",
    link: "https://www.awin1.com/cread.php?awinmid=123238&awinaffid=3168839&ued=https%3A%2F%2Fgestao.galiciaeducacao.com.br%2Fmba",
    imagem: "/banners/mba-galicia.jpg",
    titulo: "Seu MBA 100% online",
    texto: "R$\u00a0166,50 em 24x no cartão, ou R$\u00a01.998 à vista no Pix.",
    botao: "Ver os MBAs",
    espera: 40000
  };
  if (!P.ativo) return;
  var K = "nuri_pop_" + P.id, agora = Date.now();
  function ler(s,k){ try { return window[s].getItem(k); } catch(e){ return null; } }
  function gravar(s,k,v){ try { window[s].setItem(k,v); } catch(e){} }
  if (ler("sessionStorage", K)) return;
  var ate = +ler("localStorage", K) || 0;
  if (ate > agora) return;

  function mostrar(){
    if (document.getElementById("nuri-pop")) return;
    gravar("sessionStorage", K, "1");
    var css = document.createElement("style");
    css.textContent =
      "#nuri-pop{position:fixed;right:18px;bottom:18px;z-index:9999;width:330px;max-width:calc(100vw - 24px);" +
      "background:var(--surface,#FFFBF6);color:var(--ink,#2E2420);border:2px solid var(--coral,#E8735F);border-radius:18px;" +
      "box-shadow:0 10px 28px rgba(46,36,32,.18);font-family:'DM Sans',system-ui,sans-serif;display:flex;gap:12px;padding:12px 14px 12px 12px;" +
      "align-items:center;transform:translateY(130%);opacity:0;transition:transform .45s cubic-bezier(.2,.9,.3,1.2),opacity .3s}" +
      "#nuri-pop.on{transform:none;opacity:1}" +
      "#nuri-pop img{width:78px;height:78px;border-radius:12px;object-fit:cover;flex:none}" +
      "#nuri-pop .t{font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:17px;line-height:1.15;margin:2px 0 3px}" +
      "#nuri-pop .x{font-size:13.5px;line-height:1.3;opacity:.85;margin:0 0 7px}" +
      "#nuri-pop .pub{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;opacity:.6;font-weight:700}" +
      "#nuri-pop a.b{display:inline-block;background:var(--coral,#E8735F);color:#fff;text-decoration:none;font-weight:700;font-size:13.5px;padding:6px 13px;border-radius:999px}" +
      "#nuri-pop a.b:hover{filter:brightness(.95)}" +
      "#nuri-pop button{position:absolute;top:-11px;right:-11px;width:28px;height:28px;border-radius:50%;border:2px solid var(--coral,#E8735F);" +
      "background:var(--surface,#FFFBF6);color:var(--ink,#2E2420);font-size:16px;line-height:1;cursor:pointer;padding:0}" +
      "#nuri-pop .s{position:absolute;left:-9px;top:-9px;width:20px;height:20px}" +
      "@media (max-width:520px){#nuri-pop{right:12px;left:12px;bottom:12px;width:auto}#nuri-pop img{width:64px;height:64px}}" +
      "@media (prefers-reduced-motion:reduce){#nuri-pop{transition:none}}";
    document.head.appendChild(css);
    var d = document.createElement("aside");
    d.id = "nuri-pop"; d.setAttribute("aria-label","Publicidade");
    d.innerHTML =
      '<svg class="s" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z" fill="#D9A441"/></svg>' +
      '<img src="'+P.imagem+'" alt="" loading="lazy">' +
      '<div><div class="pub">Publicidade</div><p class="t">'+P.titulo+'</p><p class="x">'+P.texto+'</p>' +
      '<a class="b" href="'+P.link+'" target="_blank" rel="sponsored noopener">'+P.botao+' →</a></div>' +
      '<button type="button" aria-label="Fechar">×</button>';
    document.body.appendChild(d);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ d.classList.add("on"); }); });
    function sair(ms){ gravar("localStorage", K, String(Date.now()+ms)); d.classList.remove("on"); setTimeout(function(){ d.remove(); }, 500); }
    d.querySelector("button").onclick = function(){ sair(864e5); };
    d.querySelector("a.b").addEventListener("click", function(){ sair(7*864e5); });
  }
  setTimeout(function(){ if (document.body) mostrar(); }, P.espera);
})();
