(() => {
  'use strict';
  const API = ((window.SITE_CONFIG && window.SITE_CONFIG.API_URL) || '').replace(/\/+$/, '');
  const $ = (id) => document.getElementById(id);
  const TOKEN_KEY = 'ai_token';

  // O token fica em sessionStorage: some quando a aba é fechada.
  const store = {
    get() { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
    set(v) { try { sessionStorage.setItem(TOKEN_KEY, v); } catch {} },
    clear() { try { sessionStorage.removeItem(TOKEN_KEY); } catch {} },
  };

  async function api(method, path, body) {
    if (!API || API.includes('SEU-APP')) throw new Error('O sistema de contas ainda não foi configurado.');
    const headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch', 'X-Token-Mode': 'bearer' };
    const t = store.get();
    if (t) headers.Authorization = 'Bearer ' + t;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 70000);
    let res;
    try {
      res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: ctrl.signal });
    } catch {
      throw new Error('Não foi possível conectar. No primeiro acesso o servidor pode levar cerca de 1 minuto para acordar; tente de novo.');
    } finally { clearTimeout(timer); }
    let data = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) { const e = new Error(data.error || 'Algo deu errado. Tente novamente.'); e.status = res.status; throw e; }
    return data;
  }

  function toast(texto) {
    const d = document.createElement('div');
    d.className = 'login-toast';
    d.textContent = texto;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 5000);
  }

  // ---------- Abrir / fechar ----------
  function abrir(overlay, foco) { overlay.hidden = false; if (foco) foco.focus(); }
  function fechar(overlay) { overlay.hidden = true; }

  // ---------- Entrar / Criar conta ----------
  let modo = 'entrar';
  function setModo(m) {
    modo = m;
    const criar = m === 'criar';
    $('abaEntrar').classList.toggle('ativa', !criar);
    $('abaCriar').classList.toggle('ativa', criar);
    $('loginNomeWrap').hidden = !criar;
    $('loginExtras').hidden = !criar;
    $('loginTitulo').textContent = criar ? 'Criar conta' : 'Bem-vindo';
    $('loginEnviar').textContent = criar ? 'Criar conta' : 'Entrar';
    $('loginSenha').autocomplete = criar ? 'new-password' : 'current-password';
    $('loginErro').textContent = '';
  }

  function mostrarUsuario(user) {
    $('loginUsuario').hidden = !user;
    $('abrirLogin').parentElement.hidden = !!user;
    if (user) $('loginSaudacao').textContent = 'Olá, ' + user.name;
  }

  $('abrirLogin').addEventListener('click', () => { setModo('entrar'); abrir($('loginOverlay'), $('loginEmail')); });
  $('loginFechar').addEventListener('click', () => fechar($('loginOverlay')));
  $('abaEntrar').addEventListener('click', () => setModo('entrar'));
  $('abaCriar').addEventListener('click', () => setModo('criar'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { fechar($('loginOverlay')); fechar($('excluirOverlay')); }
  });
  [$('loginOverlay'), $('excluirOverlay')].forEach((o) =>
    o.addEventListener('mousedown', (e) => { if (e.target === o) fechar(o); }));

  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const erro = (t) => { $('loginErro').textContent = t; };
    erro('');
    const email = $('loginEmail').value.trim().toLowerCase();
    const senha = $('loginSenha').value;
    let payload, rota;

    if (modo === 'criar') {
      const nome = $('loginNome').value.replace(/\s+/g, ' ').trim();
      if (nome.length < 2) return erro('Informe seu nome.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return erro('Informe um e-mail válido.');
      if (senha.length < 10) return erro('A senha precisa ter ao menos 10 caracteres.');
      if (!/[a-zA-Z]/.test(senha) || !/[0-9]/.test(senha)) return erro('Use letras e números na senha.');
      if (senha !== $('loginSenha2').value) return erro('As senhas não conferem.');
      if (!$('loginConsent').checked) return erro('É preciso aceitar o armazenamento dos dados.');
      rota = '/api/register';
      payload = { name: nome, email, password: senha, interest: $('loginInteresse').value, consent: true, website: $('loginSite').value };
    } else {
      if (!email || !senha) return erro('Informe e-mail e senha.');
      rota = '/api/login';
      payload = { email, password: senha };
    }

    const btn = $('loginEnviar');
    const rotulo = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Aguarde…';
    try {
      const data = await api('POST', rota, payload);
      if (!data.token || !data.user) throw new Error('Não foi possível concluir. Tente novamente.');
      store.set(data.token);
      mostrarUsuario(data.user);
      $('loginForm').reset();
      fechar($('loginOverlay'));
      toast(modo === 'criar' ? 'Conta criada! Bem-vindo(a).' : 'Você entrou na sua conta.');
    } catch (err) {
      erro(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = rotulo;
    }
  });

  // ---------- Sair ----------
  $('loginSair').addEventListener('click', async () => {
    try { await api('POST', '/api/logout'); } catch {}
    store.clear();
    mostrarUsuario(null);
  });

  // ---------- Excluir conta (apaga tudo, inclusive a senha) ----------
  $('loginExcluir').addEventListener('click', () => abrir($('excluirOverlay'), $('excluirSenha')));
  $('excluirFechar').addEventListener('click', () => fechar($('excluirOverlay')));

  $('excluirForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const erro = (t) => { $('excluirErro').textContent = t; };
    erro('');
    const senha = $('excluirSenha').value;
    if (!senha) return erro('Digite sua senha.');
    if ($('excluirConfirma').value.trim() !== 'EXCLUIR') return erro('Digite EXCLUIR para confirmar.');
    const btn = $('excluirEnviar');
    btn.disabled = true;
    try {
      await api('DELETE', '/api/account', { password: senha });
      store.clear();
      mostrarUsuario(null);
      $('excluirForm').reset();
      fechar($('excluirOverlay'));
      toast('Conta excluída. Nome, e-mail e senha foram apagados.');
    } catch (err) {
      erro(err.message);
    } finally { btn.disabled = false; }
  });

  // ---------- Já estava logado nesta aba? ----------
  if (store.get()) {
    api('GET', '/api/me')
      .then((d) => mostrarUsuario(d.user))
      .catch((e) => { if (e.status === 401) store.clear(); });
  }
})();
