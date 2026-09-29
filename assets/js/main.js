/* ManyConvert — landing multi-nicho + afiliados
 * Interações: conversa animada no topo, seletor de segmentos,
 * simulador de comissão e efeito parallax.
 */

/* ===== Ajuste aqui os valores do programa de afiliados ===== */
var CONFIG = {
  commission: 30, // % de comissão recorrente
  ticket: 297     // ticket médio de exemplo (R$/mês) usado no simulador
};

(function () {
  'use strict';

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var fmtInt = function (n) { return Math.round(n).toLocaleString('pt-BR'); };
  var fmtMoney = function (n) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var setAll = function (key, value) {
    var els = document.querySelectorAll('[data-bind="' + key + '"]');
    for (var i = 0; i < els.length; i++) els[i].textContent = value;
  };

  /* ---------- Simulador de comissão ---------- */
  var range = document.getElementById('clientes');
  function updateCalc() {
    var clients = range ? Number(range.value) : 20;
    var monthly = clients * CONFIG.ticket * CONFIG.commission / 100;
    setAll('clients', clients);
    setAll('monthly', fmtInt(monthly));
    setAll('yearly', fmtInt(monthly * 12));
  }
  setAll('commission', CONFIG.commission);
  setAll('ticketFmt', fmtInt(CONFIG.ticket));
  setAll('perClient', fmtMoney(CONFIG.ticket * CONFIG.commission / 100));
  if (range) range.addEventListener('input', updateCalc);
  updateCalc();

  /* ---------- Seletor de segmentos ---------- */
  var SEGMENTS = {
    ecom: {
      img: 'assets/img/ecommerce.jpg', alt: 'Dona de loja respondendo clientes no celular',
      title: 'Recupere carrinhos e aumente a recompra',
      desc: 'Integração nativa com VTEX, Shopify, Nuvemshop, Tray, WooCommerce e Magazord para vender mais pelo WhatsApp.',
      uses: ['Recuperação de carrinhos abandonados com cupom personalizado', 'Avisos automáticos de Pix, boleto e rastreio', 'Campanhas de recompra segmentadas por comportamento'],
      business: 'Loja Aurora', initials: 'LA', q: 'Ainda tem o tênis no 39?', a: 'Tem sim! Deixei no seu carrinho com 10% OFF até hoje.'
    },
    saude: {
      img: 'assets/img/saude.jpg', alt: 'Recepcionista de clínica confirmando consultas pelo celular',
      title: 'Agenda cheia e menos faltas',
      desc: 'Pacientes marcam, confirmam e remarcam consultas pelo WhatsApp, a qualquer hora, sem sobrecarregar a recepção.',
      uses: ['Agendamento e confirmação automática de consultas', 'Lembretes na véspera para reduzir faltas', 'Pós-atendimento e pesquisa de satisfação'],
      business: 'Clínica Vida', initials: 'CV', q: 'Preciso remarcar minha consulta.', a: 'Claro! Tenho quinta às 14h ou sexta às 9h30. Qual prefere?'
    },
    edu: {
      img: 'assets/img/educacao.jpg', alt: 'Estudante conversando com a escola pelo celular',
      title: 'Mais matrículas, menos leads esquecidos',
      desc: 'Escolas, cursos e infoprodutores qualificam interessados, tiram dúvidas e fecham matrículas no automático.',
      uses: ['Qualificação de leads de campanhas e lançamentos', 'Recuperação de Pix e boletos não pagos', 'Onboarding e engajamento de alunos'],
      business: 'Escola Nova Rota', initials: 'NR', q: 'O curso tem certificado?', a: 'Tem sim, e a turma fecha no domingo. Quer o link com parcelamento?'
    },
    imob: {
      img: 'assets/img/imobiliaria.jpg', alt: 'Corretor de imóveis atendendo um cliente pelo celular',
      title: 'Leads qualificados direto para o corretor',
      desc: 'A IA entende o que o cliente procura, sugere imóveis e agenda visitas. O corretor recebe o lead pronto.',
      uses: ['Qualificação por região, faixa de preço e perfil', 'Envio de imóveis e agendamento de visitas', 'Distribuição automática de leads entre corretores'],
      business: 'Lar Imóveis', initials: 'LI', q: 'Procuro apartamento de 2 quartos no Centro.', a: 'Separei 4 opções no seu perfil. Posso agendar visitas no sábado?'
    },
    serv: {
      img: 'assets/img/servicos.jpg', alt: 'Consultora mostrando uma conversa no celular',
      title: 'Orçamentos rápidos e follow-up que não falha',
      desc: 'Agências, consultorias e prestadores de serviço respondem na hora, organizam propostas e não perdem oportunidades.',
      uses: ['Orçamentos e propostas direto na conversa', 'Follow-up automático de propostas em aberto', 'Funil de vendas por etapa no CRM'],
      business: 'Studio Prisma', initials: 'SP', q: 'Quanto custa o plano mensal de vocês?', a: 'Depende do escopo! Posso fazer 3 perguntas rápidas e já te envio a proposta?'
    },
    varejo: {
      img: 'assets/img/varejo.jpg', alt: 'Dono de cafeteria respondendo um cliente pelo celular',
      title: 'Atendimento padronizado em todas as unidades',
      desc: 'Centralize o atendimento de várias lojas com números, filas e relatórios por unidade.',
      uses: ['Múltiplos números e equipes por unidade', 'Promoções segmentadas por região', 'Consulta de estoque e reserva para retirada'],
      business: 'Rede Bella', initials: 'RB', q: 'Qual loja tem esse produto disponível?', a: 'A unidade Centro tem 3 em estoque. Reservo para você retirar hoje?'
    }
  };

  var tabs = document.querySelectorAll('.seg-tab');
  var segImg = document.getElementById('seg-img');
  function showSegment(key) {
    var s = SEGMENTS[key];
    if (!s) return;
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].setAttribute('aria-pressed', tabs[i].getAttribute('data-seg') === key ? 'true' : 'false');
    }
    if (segImg) { segImg.src = s.img; segImg.alt = s.alt; }
    ['title', 'desc', 'business', 'initials', 'q', 'a'].forEach(function (k) {
      var els = document.querySelectorAll('[data-seg-bind="' + k + '"]');
      for (var j = 0; j < els.length; j++) els[j].textContent = s[k];
    });
    var uses = document.querySelectorAll('[data-use]');
    for (var u = 0; u < uses.length; u++) uses[u].textContent = s.uses[Number(uses[u].getAttribute('data-use'))] || '';
  }
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].addEventListener('click', function () { showSegment(this.getAttribute('data-seg')); });
  }
  // pré-carrega as fotos dos segmentos
  Object.keys(SEGMENTS).forEach(function (k) { var im = new Image(); im.src = SEGMENTS[k].img; });

  /* ---------- Conversa animada no topo ---------- */
  var shows = {};
  var showEls = document.querySelectorAll('[data-show]');
  for (var i = 0; i < showEls.length; i++) {
    var k = showEls[i].getAttribute('data-show');
    (shows[k] = shows[k] || []).push(showEls[i]);
  }
  function setShow(key, on) {
    (shows[key] || []).forEach(function (el) { el.classList.toggle('is-on', !!on); });
  }
  function renderStep(st) {
    var typing = st === 2 || st === 6;
    setShow('s1', st >= 1);
    setShow('typing1', st === 2);
    setShow('s3', st >= 3);
    setShow('s4', st >= 4);
    setShow('s5', st >= 5);
    setShow('typing2', st === 6);
    setShow('s7', st >= 7);
    setShow('showToast', st >= 8);
    setShow('typing', typing);
    setShow('notTyping', !typing);
  }
  if (reduceMotion) {
    renderStep(8);
  } else {
    var step = 1;
    renderStep(step);
    setInterval(function () {
      step = step >= 11 ? 0 : step + 1;
      renderStep(step);
    }, 1300);
  }

  /* ---------- Menu do celular ---------- */
  var burger = document.getElementById('burger');
  var menuMobile = document.getElementById('menu-mobile');
  function fechaMenu() {
    if (!menuMobile || !burger) return;
    menuMobile.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
  }
  if (burger && menuMobile) {
    burger.addEventListener('click', function () {
      var aberto = menuMobile.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      burger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    var linksMenu = menuMobile.querySelectorAll('a');
    for (var m = 0; m < linksMenu.length; m++) linksMenu[m].addEventListener('click', fechaMenu);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) fechaMenu();
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1060) fechaMenu(); });
  }

  /* ---------- Parallax ---------- */
  if (!reduceMotion) {
    var pEls = Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight || 800;
      for (var p = 0; p < pEls.length; p++) {
        var el = pEls[p];
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        var c = r.top + r.height / 2 - vh / 2;
        var sp = parseFloat(el.getAttribute('data-speed')) || 0;
        el.style.transform = 'translate3d(0,' + (-c * sp).toFixed(1) + 'px,0)';
      }
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
})();
