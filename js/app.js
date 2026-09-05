(function () {
  'use strict';

  // ---------- Dados iniciais ----------
  const categoryMeta = {
    'Phishing':          { color: '#F5A623', icon: 'bi-envelope-exclamation' },
    'Senhas':            { color: '#5B6EF5', icon: 'bi-key' },
    'Engenharia Social': { color: '#8B6FF0', icon: 'bi-people' },
    'Privacidade':       { color: '#2FBF9F', icon: 'bi-eye-slash' },
    'Redes':             { color: '#3FA9F5', icon: 'bi-wifi' },
    'Golpes':            { color: '#F2685C', icon: 'bi-exclamation-triangle' },
    'Boas Práticas':     { color: '#34C784', icon: 'bi-shield-check' }
  };

  let nextId = 10;
  const initialCourses = [
    { id: 1, titulo: 'Identificando E-mails de Phishing', categoria: 'Phishing', cargaHoraria: 3, nivel: 2, certificado: true, destaque: true,
      descricao: 'Aprenda a reconhecer remetentes falsos, links suspeitos e pedidos urgentes usados em golpes de phishing por e-mail.' },
    { id: 2, titulo: 'Criando Senhas Fortes e Únicas', categoria: 'Senhas', cargaHoraria: 2, nivel: 1, certificado: true, destaque: true,
      descricao: 'Boas práticas para criar e gerenciar senhas fortes, com uso de gerenciadores de senha e verificação de vazamentos.' },
    { id: 3, titulo: 'Engenharia Social: Como Reconhecer', categoria: 'Engenharia Social', cargaHoraria: 4, nivel: 3, certificado: true, destaque: true,
      descricao: 'Táticas de manipulação usadas por golpistas para obter informações e como reagir a abordagens suspeitas.' },
    { id: 4, titulo: 'Privacidade e a LGPD no Dia a Dia', categoria: 'Privacidade', cargaHoraria: 3, nivel: 2, certificado: false, destaque: false,
      descricao: 'Entenda seus direitos sobre dados pessoais e como aplicar princípios da LGPD nas atividades do dia a dia.' },
    { id: 5, titulo: 'Segurança em Redes Wi-Fi Públicas', categoria: 'Redes', cargaHoraria: 2, nivel: 2, certificado: false, destaque: false,
      descricao: 'Riscos de redes abertas e práticas simples para navegar com mais segurança fora de casa.' },
    { id: 6, titulo: 'Autenticação em Duas Etapas na Prática', categoria: 'Senhas', cargaHoraria: 1, nivel: 1, certificado: true, destaque: false,
      descricao: 'Passo a passo para ativar a verificação em duas etapas nos principais aplicativos e serviços.' },
    { id: 7, titulo: 'Golpes em Aplicativos de Mensagem', categoria: 'Golpes', cargaHoraria: 2, nivel: 2, certificado: false, destaque: false,
      descricao: 'Os golpes mais comuns em apps de mensagem, como contas clonadas e falsos sorteios, e como se proteger.' },
    { id: 8, titulo: 'Protegendo Crianças na Internet', categoria: 'Privacidade', cargaHoraria: 3, nivel: 2, certificado: true, destaque: false,
      descricao: 'Orientações práticas para famílias sobre controle parental, privacidade e uso saudável da internet.' },
    { id: 9, titulo: 'Backup e Recuperação de Dados', categoria: 'Boas Práticas', cargaHoraria: 2, nivel: 1, certificado: false, destaque: false,
      descricao: 'Rotinas simples de backup para não perder arquivos importantes em caso de golpes ou falhas no dispositivo.' }
  ];

  const state = {
    courses: [...initialCourses],
    filterCategory: 'Todas',
    page: 1,
    perPage: 3,
    goal: 12
  };

  // ---------- Helpers ----------
  function levelLabel(v) {
    v = Number(v);
    if (v <= 1) return 'Iniciante';
    if (v <= 3) return 'Intermediário';
    return 'Avançado';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getFiltered() {
    return state.filterCategory === 'Todas'
      ? state.courses
      : state.courses.filter(c => c.categoria === state.filterCategory);
  }

  // ---------- Alerts ----------
  function showAlert(message, type = 'success') {
    const placeholder = document.getElementById('alertPlaceholder');
    const icon = type === 'success' ? 'bi-check-circle' : type === 'danger' ? 'bi-x-circle' : 'bi-info-circle';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi ${icon}"></i>
        <div>${escapeHtml(message)}</div>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Fechar"></button>
      </div>`;
    const alertEl = wrapper.firstElementChild;
    placeholder.appendChild(alertEl);
    setTimeout(() => {
      const instance = bootstrap.Alert.getOrCreateInstance(alertEl);
      instance.close();
    }, 4000);
  }

  // ---------- Toasts ----------
  function showToast(title, message, variant = 'safe') {
    const container = document.getElementById('toastContainer');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="toast" role="status" aria-live="polite" aria-atomic="true">
        <div class="toast-header">
          <i class="bi bi-shield-lock-fill me-2" style="color:var(--${variant})"></i>
          <strong class="me-auto">${escapeHtml(title)}</strong>
          <small class="text-muted">agora</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fechar"></button>
        </div>
        <div class="toast-body">${escapeHtml(message)}</div>
      </div>`;
    const toastEl = wrapper.firstElementChild;
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }

  // ---------- Popovers ----------
  function initPopovers(scope = document) {
    scope.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
      const existing = bootstrap.Popover.getInstance(el);
      if (!existing) new bootstrap.Popover(el);
    });
  }

  // ---------- Stats ----------
  function renderStats() {
    const total = state.courses.length;
    const categorias = new Set(state.courses.map(c => c.categoria)).size;
    const certificados = state.courses.filter(c => c.certificado).length;
    const pct = Math.min(100, Math.round((total / state.goal) * 100));

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statCategorias').textContent = categorias;
    document.getElementById('statCertificados').textContent = certificados;
    document.getElementById('progressLabel').textContent = `${total} / ${state.goal}`;

    const bar = document.getElementById('cadastroProgress');
    bar.style.width = pct + '%';
    bar.parentElement.setAttribute('aria-valuenow', pct);
    bar.classList.toggle('bg-success', pct >= 100);
  }

  // ---------- Dropdown de categorias ----------
  function renderCategoryDropdown() {
    const menu = document.getElementById('categoryDropdownMenu');
    const shortcuts = document.getElementById('offcanvasCategoryShortcuts');
    const categories = ['Todas', ...Object.keys(categoryMeta)];

    menu.innerHTML = categories.map(cat => `
      <li><a class="dropdown-item ${cat === state.filterCategory ? 'active' : ''}" href="#" data-category="${cat}">
        ${cat === 'Todas' ? '<i class="bi bi-grid"></i> Todas as categorias' : cat}
      </a></li>`).join('');

    shortcuts.innerHTML = Object.keys(categoryMeta).map(cat => `
      <button type="button" class="btn btn-sm btn-outline-light" data-category-shortcut="${cat}">${cat}</button>
    `).join('');
  }

  // ---------- Cards de curso ----------
  function cardTemplate(c) {
    const meta = categoryMeta[c.categoria] || { color: '#5B6EF5', icon: 'bi-shield' };
    return `
    <div class="col-md-6 col-lg-4">
      <div class="course-card" style="--accent:${meta.color}">
        <div class="course-banner"><i class="bi ${meta.icon}"></i></div>
        <div class="course-body">
          <span class="badge-categoria">${escapeHtml(c.categoria)}</span>
          <h3 class="course-title">
            ${escapeHtml(c.titulo)}
            <i class="bi bi-info-circle course-info" tabindex="0" data-bs-toggle="popover" data-bs-trigger="focus"
               data-bs-content="${c.certificado ? 'Este curso emite certificado ao ser concluído.' : 'Este curso não emite certificado no momento.'}"></i>
          </h3>
          <ul class="course-meta">
            <li><i class="bi bi-clock"></i> ${c.cargaHoraria}h</li>
            <li><i class="bi bi-bar-chart"></i> ${levelLabel(c.nivel)}</li>
            ${c.certificado ? '<li><i class="bi bi-patch-check"></i> Certificado</li>' : ''}
            ${c.destaque ? '<li><i class="bi bi-star-fill"></i> Destaque</li>' : ''}
          </ul>
          <div class="course-actions">
            <button class="btn btn-sm btn-outline-light" type="button" data-bs-toggle="collapse" data-bs-target="#desc-${c.id}">
              Detalhes
            </button>
            <button class="btn btn-sm btn-link text-danger p-0" data-delete-id="${c.id}">
              Excluir
            </button>
          </div>
          <div class="collapse" id="desc-${c.id}">
            <p class="course-desc mt-3">${escapeHtml(c.descricao)}</p>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ---------- Paginação ----------
  function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }

    let html = `
      <li class="page-item ${state.page === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${state.page - 1}">Anterior</a>
      </li>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `
        <li class="page-item ${i === state.page ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
    }
    html += `
      <li class="page-item ${state.page === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${state.page + 1}">Próxima</a>
      </li>`;
    pagination.innerHTML = html;
  }

  // ---------- Render principal da lista ----------
  function renderCourses() {
    const list = getFiltered();
    const totalPages = Math.max(1, Math.ceil(list.length / state.perPage));
    if (state.page > totalPages) state.page = totalPages;

    const grid = document.getElementById('coursesGrid');
    const emptyAlert = document.getElementById('emptyAlert');

    if (list.length === 0) {
      grid.innerHTML = '';
      emptyAlert.classList.remove('d-none');
    } else {
      emptyAlert.classList.add('d-none');
      const start = (state.page - 1) * state.perPage;
      const pageItems = list.slice(start, start + state.perPage);
      grid.innerHTML = pageItems.map(cardTemplate).join('');
      initPopovers(grid);
    }

    renderPagination(totalPages);
    renderStats();
  }

  // ---------- Carrossel de destaques ----------
  function renderCarousel() {
    const destaques = state.courses.filter(c => c.destaque).slice(0, 4);
    const items = destaques.length ? destaques : state.courses.slice(0, 3);
    const inner = document.getElementById('carouselInner');
    inner.innerHTML = items.map((c, i) => {
      const meta = categoryMeta[c.categoria] || { color: '#5B6EF5', icon: 'bi-shield' };
      return `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <div class="course-banner-lg" style="--accent:${meta.color}">
          <i class="bi ${meta.icon}"></i>
          <div>
            <h3>${escapeHtml(c.titulo)}</h3>
            <p>${escapeHtml(c.descricao)}</p>
            <a href="#cursos" class="btn btn-sm btn-light fw-semibold">Ver cursos</a>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // ---------- Simulação de carregamento inicial ----------
  function loadCourses() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('coursesGrid');
    setTimeout(() => {
      spinner.classList.add('d-none');
      grid.classList.remove('d-none');
      renderCourses();
      renderCarousel();
    }, 900);
  }

  // ---------- Formulário: nível ----------
  function bindRangeLabel() {
    const range = document.getElementById('courseNivel');
    const label = document.getElementById('courseNivelLabel');
    range.addEventListener('input', () => { label.textContent = levelLabel(range.value); });
  }

  // ---------- Formulário: submit ----------
  function bindForm() {
    const form = document.getElementById('courseForm');
    const submitBtn = document.getElementById('submitCourseBtn');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        showAlert('Por favor corrija os campos destacados no formulário.', 'danger');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...`;

      const novoCurso = {
        id: nextId++,
        titulo: document.getElementById('courseTitulo').value.trim(),
        categoria: document.getElementById('courseCategoria').value,
        cargaHoraria: Number(document.getElementById('courseCarga').value),
        nivel: Number(document.getElementById('courseNivel').value),
        certificado: document.getElementById('courseCertificado').checked,
        destaque: document.getElementById('courseDestaque').checked,
        descricao: document.getElementById('courseDescricao').value.trim()
      };

      // simula chamada assíncrona de salvamento
      setTimeout(() => {
        state.courses.unshift(novoCurso);
        state.page = 1;

        renderCourses();
        renderCarousel();
        renderCategoryDropdown();

        const modalEl = document.getElementById('addCourseModal');
        bootstrap.Modal.getInstance(modalEl).hide();

        form.reset();
        form.classList.remove('was-validated');
        document.getElementById('courseNivelLabel').textContent = 'Iniciante';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-check-lg"></i> Salvar curso`;

        showAlert(`Curso "${novoCurso.titulo}" cadastrado com sucesso!`, 'success');
        showToast('Curso salvo', `"${novoCurso.titulo}" foi adicionado à biblioteca.`, 'safe');
      }, 700);
    });
  }

  // ---------- Delegação de eventos ----------
  function bindDelegatedEvents() {
    // dropdown de categoria
    document.getElementById('categoryDropdownMenu').addEventListener('click', e => {
      const item = e.target.closest('[data-category]');
      if (!item) return;
      e.preventDefault();
      state.filterCategory = item.dataset.category;
      state.page = 1;
      document.getElementById('categoryDropdownBtn').innerHTML =
        `<i class="bi bi-funnel"></i> ${state.filterCategory === 'Todas' ? 'Todas as categorias' : state.filterCategory}`;
      renderCategoryDropdown();
      renderCourses();
    });

    // atalhos do offcanvas
    document.getElementById('offcanvasCategoryShortcuts').addEventListener('click', e => {
      const btn = e.target.closest('[data-category-shortcut]');
      if (!btn) return;
      state.filterCategory = btn.dataset.categoryShortcut;
      state.page = 1;
      document.getElementById('categoryDropdownBtn').innerHTML =
        `<i class="bi bi-funnel"></i> ${state.filterCategory}`;
      renderCategoryDropdown();
      renderCourses();
      document.getElementById('cursos').scrollIntoView({ behavior: 'smooth' });
    });

    // paginação
    document.getElementById('pagination').addEventListener('click', e => {
      const link = e.target.closest('[data-page]');
      if (!link || link.parentElement.classList.contains('disabled')) return;
      e.preventDefault();
      state.page = Number(link.dataset.page);
      renderCourses();
    });

    // exclusão de curso (delegado no grid, que é recriado a cada render)
    document.getElementById('coursesGrid').addEventListener('click', e => {
      const btn = e.target.closest('[data-delete-id]');
      if (!btn) return;
      const id = Number(btn.dataset.deleteId);
      const curso = state.courses.find(c => c.id === id);
      state.courses = state.courses.filter(c => c.id !== id);
      renderCourses();
      renderCarousel();
      renderCategoryDropdown();
      if (curso) showToast('Curso removido', `"${curso.titulo}" foi excluído da biblioteca.`, 'danger');
    });
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    renderCategoryDropdown();
    renderStats();
    bindRangeLabel();
    bindForm();
    bindDelegatedEvents();
    initPopovers();
    loadCourses();
  });
})();
