// Testes de perfil da Nuriteca: "Qual graduação combina com você?" e "Qual concurso combina com você?"
// Cada opção soma pontos para áreas (p) e pode excluir áreas (x) quando a pessoa não se encaixa nos requisitos.
window.TESTES = {
graduacao: {
  slug: "teste-graduacao",
  titulo: "Qual graduação combina com você?",
  chamada: "10 perguntas rápidas para descobrir a área de faculdade que mais tem a ver com o seu jeito.",
  cor: "var(--salvia)",
  perguntas: [
    { q: "Numa tarde livre, o que você faria com mais gosto?", o: [
      { t: "Montar, consertar ou entender como algo funciona", p: { exatas: 2, tec: 1 } },
      { t: "Ler, ouvir histórias ou visitar um museu", p: { humanas: 2, comunicacao: 1 } },
      { t: "Ajudar alguém que está passando por um problema", p: { saude: 2, humanas: 1 } },
      { t: "Mexer num projeto no computador", p: { tec: 2, comunicacao: 1 } },
      { t: "Ficar ao ar livre, cuidar de plantas ou de bichos", p: { natureza: 3 } } ] },
    { q: "E a matemática na sua vida?", o: [
      { t: "Adoro, quanto mais conta, melhor", p: { exatas: 3, tec: 2, negocios: 1 } },
      { t: "Me viro bem quando precisa", p: { negocios: 2, saude: 1, natureza: 1 } },
      { t: "Prefiro passar longe", p: { humanas: 2, comunicacao: 2, direito: 1 }, x: ["exatas"] } ] },
    { q: "Qual matéria da escola você mais curtia (ou curte)?", o: [
      { t: "Biologia ou química", p: { saude: 3, natureza: 2 } },
      { t: "Física ou matemática", p: { exatas: 3, tec: 1 } },
      { t: "História, sociologia ou filosofia", p: { humanas: 2, direito: 2 } },
      { t: "Português, redação ou artes", p: { comunicacao: 3, humanas: 1 } },
      { t: "Nenhuma em especial, gosto de coisas práticas", p: { negocios: 2, tec: 1 } } ] },
    { q: "Num trabalho em grupo, você costuma ser quem...", o: [
      { t: "Organiza tudo e divide as tarefas", p: { negocios: 3, direito: 1 } },
      { t: "Tem as ideias e cuida da apresentação", p: { comunicacao: 3 } },
      { t: "Resolve a parte difícil e técnica", p: { exatas: 2, tec: 2 } },
      { t: "Defende o grupo e argumenta com o professor", p: { direito: 3 } },
      { t: "Cuida para que ninguém fique de fora", p: { humanas: 2, saude: 2 } } ] },
    { q: "Como você lida com sangue, hospital e situações de emergência?", o: [
      { t: "Tranquilo, até me interessa", p: { saude: 3 } },
      { t: "Encaro se for preciso", p: { saude: 1, natureza: 1 } },
      { t: "Prefiro nem pensar nisso", p: { comunicacao: 1, exatas: 1, direito: 1 }, x: ["saude"] } ] },
    { q: "Qual problema do mundo você mais gostaria de ajudar a resolver?", o: [
      { t: "Doenças e saúde das pessoas", p: { saude: 3 } },
      { t: "Educação e desigualdade", p: { humanas: 3, direito: 1 } },
      { t: "Injustiças e direitos que não são respeitados", p: { direito: 3 } },
      { t: "Meio ambiente e alimentação", p: { natureza: 3 } },
      { t: "Cidades, energia e infraestrutura", p: { exatas: 3 } },
      { t: "Pequenos negócios que não conseguem crescer", p: { negocios: 3 } } ] },
    { q: "Onde você se imagina trabalhando?", o: [
      { t: "Hospital, clínica ou posto de saúde", p: { saude: 3 } },
      { t: "Escola, museu ou espaço cultural", p: { humanas: 3, comunicacao: 1 } },
      { t: "Escritório, empresa ou fórum", p: { negocios: 2, direito: 2 } },
      { t: "Em casa, no computador, de qualquer lugar", p: { tec: 3, comunicacao: 1 } },
      { t: "Em obra, laboratório ou fábrica", p: { exatas: 3 } },
      { t: "No campo, na natureza", p: { natureza: 3 } } ] },
    { q: "Você prefere ler um texto de quantas páginas?", o: [
      { t: "Quanto mais, melhor. Amo ler", p: { direito: 2, humanas: 2 } },
      { t: "Algumas páginas, de boa", p: { comunicacao: 1, negocios: 1, saude: 1 } },
      { t: "Prefiro vídeo, imagem ou mão na massa", p: { tec: 1, exatas: 1, natureza: 1, comunicacao: 1 } } ] },
    { q: "O que mais te motiva numa profissão?", o: [
      { t: "Ganhar bem", p: { negocios: 2, direito: 1, tec: 1, exatas: 1 } },
      { t: "Ajudar pessoas", p: { saude: 2, humanas: 2 } },
      { t: "Criar coisas novas", p: { comunicacao: 2, tec: 2 } },
      { t: "Estabilidade e segurança", p: { direito: 2, humanas: 1, saude: 1 } },
      { t: "Liberdade e flexibilidade", p: { tec: 2, comunicacao: 2 } } ] },
    { q: "Do que você precisa para estudar? (isso não muda o resultado, só as dicas)", filtro: true, o: [
      { t: "Faculdade pública e presencial", d: "publica" },
      { t: "Curso à noite, porque trabalho de dia", d: "noite" },
      { t: "Curso a distância (EAD)", d: "ead" },
      { t: "Bolsa numa faculdade particular", d: "bolsa" } ] }
  ],
  resultados: {
    saude: { nome: "Saúde", desc: "Você gosta de cuidar, tem estômago para a rotina de hospital e curte biologia. Na saúde, isso vira profissão.", ex: "Enfermagem, Medicina, Fisioterapia, Nutrição, Odontologia, Farmácia, Psicologia" },
    exatas: { nome: "Engenharias e exatas", desc: "Números não te assustam e você quer entender como as coisas funcionam por dentro.", ex: "Engenharia civil, elétrica ou mecânica, Arquitetura, Física, Matemática, Química" },
    tec: { nome: "Tecnologia", desc: "Computador é seu ambiente natural e você gosta de resolver problemas com lógica. Área com muita vaga e trabalho remoto.", ex: "Ciência da computação, Sistemas de informação, Análise e desenvolvimento de sistemas, Ciência de dados" },
    humanas: { nome: "Educação e humanas", desc: "Você gosta de gente, de histórias e de entender a sociedade. Tem jeito para ensinar e transformar.", ex: "Pedagogia, História, Letras, Geografia, Serviço social, Ciências sociais" },
    direito: { nome: "Direito e carreiras jurídicas", desc: "Você argumenta bem, lê muito e se incomoda com injustiça. Bônus: é a porta para os concursos que mais pagam.", ex: "Direito, Relações internacionais, Ciência política, Gestão pública" },
    comunicacao: { nome: "Comunicação e artes", desc: "Você é criativo, escreve bem ou pensa em imagens. Seu lugar é onde as ideias viram conteúdo.", ex: "Jornalismo, Publicidade, Design, Cinema, Artes visuais, Produção cultural" },
    negocios: { nome: "Negócios e gestão", desc: "Você organiza, decide e pensa em resultado. Empresas e o setor público precisam de gente assim.", ex: "Administração, Contabilidade, Economia, Logística, Recursos humanos" },
    natureza: { nome: "Natureza e agrárias", desc: "O seu lugar é perto da terra, dos bichos e do meio ambiente.", ex: "Agronomia, Medicina veterinária, Biologia, Engenharia ambiental, Zootecnia, Oceanografia" }
  },
  dicas: {
    publica: "As federais e estaduais selecionam pelo ENEM, por meio do SiSU, e algumas têm vestibular próprio. Veja as graduações gratuitas abertas na Nuriteca.",
    noite: "Muitas universidades públicas têm cursos noturnos, principalmente licenciaturas, administração e direito. Filtre por turno na hora de escolher no SiSU.",
    ead: "Há graduações gratuitas a distância, como as da Universidade Aberta do Brasil (UAB) e das universidades estaduais. Elas aparecem na aba de graduações da Nuriteca.",
    bolsa: "O ProUni dá bolsas de 50% e 100% em faculdades particulares usando a nota do ENEM. Fique de olho também nos descontos da Nuriteca."
  },
  links: [["Ver graduações gratuitas abertas", "/graduacao/"], ["Ver bolsas e descontos", "/descontos/"]]
},

concurso: {
  slug: "teste-concurso",
  titulo: "Qual concurso combina com você?",
  chamada: "10 perguntas para descobrir a área de concurso que mais combina com a sua formação e o seu jeito.",
  cor: "var(--coral)",
  perguntas: [
    { q: "Qual é a sua escolaridade hoje?", filtro: true, o: [
      { t: "Ensino médio completo", p: { tribunais: 1, policial: 1 }, x: ["juridica", "fiscal", "legislativo"] },
      { t: "Faculdade em andamento", p: { tribunais: 1, policial: 1 }, x: ["juridica", "fiscal"] },
      { t: "Ensino superior completo", p: { fiscal: 1, legislativo: 1 } },
      { t: "Formada(o) em Direito", p: { juridica: 3, tribunais: 1 } } ] },
    { q: "Em que área é a sua formação (ou a que você pretende fazer)?", filtro: true, o: [
      { t: "Direito", p: { juridica: 3, tribunais: 2, policial: 1 } },
      { t: "Saúde", p: { saude: 4 } },
      { t: "Educação ou licenciatura", p: { educacao: 4 } },
      { t: "Contabilidade, economia, administração ou TI", p: { fiscal: 3, tribunais: 1, legislativo: 1 } },
      { t: "Outra área ou nenhuma ainda", p: { tribunais: 1, policial: 1, fiscal: 1 }, x: ["saude"] } ] },
    { q: "Você toparia fazer teste físico (corrida, barra, natação)?", filtro: true, o: [
      { t: "Sim, até gosto", p: { policial: 3 } },
      { t: "Se precisar, eu treino", p: { policial: 1 } },
      { t: "Não, de jeito nenhum", p: {}, x: ["policial"] } ] },
    { q: "Mudaria de cidade ou de estado para passar?", filtro: true, o: [
      { t: "Sim, vou para onde tiver vaga", p: { juridica: 1, fiscal: 1, policial: 1, legislativo: 1 } },
      { t: "Só se for para algum lugar perto", p: { tribunais: 1, educacao: 1, saude: 1 } },
      { t: "Não, quero trabalhar na minha cidade", p: { educacao: 2, saude: 2, tribunais: 1 } } ] },
    { q: "Como seria seu dia de trabalho ideal?", o: [
      { t: "Analisando documentos e números com calma", p: { fiscal: 3, tribunais: 1 } },
      { t: "Na rua, investigando, nada de rotina", p: { policial: 3 } },
      { t: "Com pessoas, ensinando ou atendendo", p: { educacao: 2, saude: 2 } },
      { t: "Decidindo casos e escrevendo pareceres", p: { juridica: 3, legislativo: 1 } },
      { t: "Nos bastidores da política e das leis", p: { legislativo: 3 } } ] },
    { q: "O que você mais quer de um cargo público?", o: [
      { t: "O maior salário possível", p: { juridica: 2, fiscal: 2, legislativo: 2 } },
      { t: "Estabilidade e tranquilidade", p: { tribunais: 3, educacao: 1 } },
      { t: "Fazer diferença na vida das pessoas", p: { educacao: 2, saude: 2, policial: 1 } },
      { t: "Ação e adrenalina", p: { policial: 3 } } ] },
    { q: "Quanto tempo você tem para estudar?", o: [
      { t: "Mais de 4 horas por dia", p: { juridica: 2, fiscal: 2, legislativo: 1 } },
      { t: "De 2 a 4 horas por dia", p: { tribunais: 2, policial: 1, fiscal: 1 } },
      { t: "Menos de 2 horas, trabalho o dia todo", p: { educacao: 2, saude: 1, tribunais: 1 } } ] },
    { q: "Qual tipo de assunto você estudaria com mais gosto?", o: [
      { t: "Leis e Constituição", p: { juridica: 2, tribunais: 2, legislativo: 1 } },
      { t: "Contabilidade e impostos", p: { fiscal: 3 } },
      { t: "Direito penal e legislação de segurança", p: { policial: 3 } },
      { t: "Pedagogia, BNCC e LDB", p: { educacao: 3 } },
      { t: "SUS e saúde pública", p: { saude: 3 } } ] },
    { q: "Como você se sai com responsabilidade e pressão?", o: [
      { t: "Gosto de ter a palavra final", p: { juridica: 3 } },
      { t: "Encaro bem situações de risco", p: { policial: 2, saude: 1 } },
      { t: "Prefiro seguir regras claras e procedimentos", p: { tribunais: 2, fiscal: 2 } },
      { t: "Lido bem com muita gente ao mesmo tempo", p: { educacao: 2, legislativo: 1 } } ] },
    { q: "Qual frase mais parece com você?", o: [
      { t: "\"Quero que a justiça aconteça\"", p: { juridica: 2, policial: 1 } },
      { t: "\"Gosto quando as contas fecham\"", p: { fiscal: 2 } },
      { t: "\"Quero ver o outro aprender\"", p: { educacao: 2 } },
      { t: "\"Cuidar é o que eu sei fazer\"", p: { saude: 2 } },
      { t: "\"Quero um trabalho estável e bem pago\"", p: { tribunais: 2, legislativo: 1 } } ] }
  ],
  resultados: {
    juridica: { nome: "Carreiras jurídicas", desc: "Juiz, promotor, defensor público e procurador: os maiores salários do serviço público, entre R$ 25 mil e R$ 40 mil no início. Exigem Direito e, em geral, três anos de atividade jurídica.", ex: "Juiz, promotor de justiça, procurador da República, defensor público, advogado da União" },
    fiscal: { nome: "Área fiscal e de controle", desc: "Auditores fiscais e de tribunais de contas estão entre os mais bem pagos e aceitam faculdade em qualquer área. A prova cobra muita contabilidade e direito tributário.", ex: "Auditor da Receita Federal, auditor fiscal estadual (Sefaz), auditor do TCU, auditor da CGU" },
    policial: { nome: "Polícias e segurança", desc: "Muita vaga, carreira com ação e teste físico no caminho. Tem cargos de nível médio e superior.", ex: "Polícia Federal, PRF, polícia civil, polícia militar, polícia penal, guarda municipal" },
    tribunais: { nome: "Tribunais e área administrativa", desc: "Rotina organizada, boa estabilidade e salários de R$ 9 mil a R$ 20 mil nos tribunais federais. Ótima porta de entrada.", ex: "Técnico e analista judiciário (TRF, TRT, TRE, TJ), INSS, ministérios e agências" },
    educacao: { nome: "Educação", desc: "Concursos de professor abrem o ano todo em prefeituras e estados, dá para trabalhar perto de casa e sua formação conta pontos na prova de títulos.", ex: "Professor da rede municipal e estadual, professor de institutos federais, orientador e supervisor escolar" },
    saude: { nome: "Saúde", desc: "SUS, hospitais universitários e prefeituras contratam o tempo todo, inclusive para nível técnico.", ex: "Enfermeiro, técnico de enfermagem, médico, farmacêutico, agente comunitário de saúde, EBSERH" },
    legislativo: { nome: "Legislativo e gestão pública", desc: "Trabalhar onde as leis são feitas: Câmara, Senado e assembleias pagam alguns dos maiores salários do país para nível superior.", ex: "Analista legislativo, consultor legislativo, especialista em políticas públicas, gestor governamental" }
  },
  links: [["Ver concursos abertos", "/concursos/"], ["Os concursos que mais pagam", "/guias/concursos-que-mais-pagam/"]]
}
};
