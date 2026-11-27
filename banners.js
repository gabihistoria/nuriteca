/* Publicidade: até 4 quadrados por bloco. Os espaços vazios viram "Anuncie aqui".
   Cada item: id, ativo, link, onde (["inicio","buscar","intercambios"]),
   imagem (quadrada, em banners/), loja, titulo, texto (opcional), botao, cor. */
window.BANNERS = [
  {id:"awin-galicia-mba", ativo:true, utm:false, link:"https://www.awin1.com/cread.php?awinmid=123238&awinaffid=3168839&ued=https%3A%2F%2Fgestao.galiciaeducacao.com.br%2Fmba", onde:["inicio","buscar","intercambios"],
   imagem:"banners/mba-galicia.jpg", loja:"Galícia Educação", titulo:"MBA 100% online a partir de R$ 166,50 por mês",
   texto:"Pós lato sensu de 360 h em gestão, finanças, marketing e liderança: 24x de R$ 166,50 no cartão ou R$ 1.998 à vista no Pix.", botao:"Ver os MBAs", cor:"var(--coral)"},
  {id:"shopee-caneta-tinteiro", ativo:true, link:"https://s.shopee.com.br/AAJ4J4Si3l", onde:["inicio","buscar","intercambios"],
   imagem:"banners/caneta-tinteiro.jpg", loja:"Shopee", titulo:"Caneta tinteiro com detalhes dourados",
   texto:"Caneta tinteiro clássica com acabamento dourado, para estudar e escrever com mais estilo.", botao:"Ver na Shopee", cor:"var(--terracota)"}
];
