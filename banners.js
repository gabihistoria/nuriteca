/* Publicidade: até 4 quadrados por bloco. Os espaços vazios viram "Anuncie aqui".
   Cada item: id, ativo, link, onde (["inicio","buscar","intercambios"]),
   imagem (quadrada, em banners/), loja, titulo, texto (opcional), botao, cor. */
window.BANNERS = [
  {id:"awin-galicia-mba", ativo:true, utm:false, link:"https://www.awin1.com/cread.php?awinmid=123238&awinaffid=3168839&ued=https%3A%2F%2Fgestao.galiciaeducacao.com.br%2Fmba", onde:["inicio","buscar","intercambios"],
   imagem:"banners/mba-galicia.jpg", loja:"Galícia Educação", titulo:"MBA 100% online a partir de R$ 166,50 por mês",
   texto:"Pós lato sensu de 360 h em gestão, finanças, marketing e liderança: 24x de R$ 166,50 no cartão ou R$ 1.998 à vista no Pix.", botao:"Ver os MBAs", cor:"var(--coral)"},
  {id:"shopee-estojo-laco-duplo", ativo:true, link:"https://s.shopee.com.br/1LhSdRgPRs", onde:["inicio","buscar","intercambios"],
   imagem:"banners/estojo-laco-duplo.jpg", loja:"Shopee", titulo:"Estojo duplo com laço",
   texto:"Estojo de dois andares com laço xadrez e estampa de cereja, morango ou ursinho.", botao:"Ver na Shopee", cor:"var(--terracota)"},
  {id:"shopee-caneca-brinco-perola", ativo:true, link:"https://s.shopee.com.br/1BO2QzxoHr", onde:["inicio","buscar","intercambios"],
   imagem:"banners/caneca-brinco-perola.jpg", loja:"Shopee", titulo:"Caneca Moça com Brinco de Pérola",
   texto:"Caneca de cerâmica com a moça do quadro de Vermeer em versão fofa, já na caixinha de presente.", botao:"Ver na Shopee", cor:"var(--petroleo)"}
];
