const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeLabel = document.querySelector("#theme-label");
const themeMeta = document.querySelector('meta[name="color-scheme"]');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  themeIcon.textContent = dark ? "☀" : "☾";
  themeLabel.textContent = dark ? "Modo claro" : "Modo escuro";
  themeToggle.setAttribute("aria-label", dark ? "Ativar modo claro" : "Ativar modo escuro");
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeMeta.setAttribute("content", theme);
}
applyTheme(document.documentElement.dataset.theme || "light");
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("radar-theme", next); } catch (_) {}
});

const body = document.querySelector("#polls-body");
const instituteFilter = document.querySelector("#institute-filter");
const sort = document.querySelector("#sort");
const kind = document.querySelector("#kind");
const count = document.querySelector("#result-count");
const updated = document.querySelector("#updated");
const registryBody = document.querySelector("#registry-body");
const registryCount = document.querySelector("#registry-count");

let polls = [];
let metadata = {};
let registered = [];

const fmtDate = value => {
  if (!value) return "Não informado";
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("pt-BR");
};
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));

function render() {
  const selectedInstitute = instituteFilter.value;
  let rows = polls.filter(p => {
    const match = selectedInstitute === "all" || p.institute === selectedInstitute;
    return match && (kind.value !== "valid" || p.status === "validado");
  });
  rows.sort((a,b) => {
    if (sort.value === "institute") return a.institute.localeCompare(b.institute, "pt-BR");
    const da = a.release_date || "";
    const db = b.release_date || "";
    return sort.value === "oldest" ? da.localeCompare(db) : db.localeCompare(da);
  });
  count.textContent = `${rows.length} ${rows.length === 1 ? "pesquisa encontrada" : "pesquisas encontradas"}`;
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="6" class="empty">Ainda não há percentuais conferidos para exibir. Consulte os registros abaixo; números só são publicados após conferência na fonte original.</td></tr>`;
    return;
  }
  body.innerHTML = rows.map(p => `
    <tr>
      <td><span class="institute">${esc(p.institute)}</span><span class="sub">${esc(p.registration || "Registro não informado")}</span><span class="sub">${esc(p.scenario || "Cenário não especificado")}</span><span class="status ${p.status === "validado" ? "" : "pending"}">${p.status === "validado" ? "DADOS CONFERIDOS" : "AGUARDANDO CONFERÊNCIA"}</span></td>
      <td>${esc(p.fieldwork || "Não informado")}<span class="sub">Divulgação: ${esc(fmtDate(p.release_date))}</span></td>
      <td><span class="candidate">${p.candidate_a_pct == null ? "—" : esc(p.candidate_a_pct + "%")}</span><span class="candidate-label">${esc(p.candidate_a || "Candidato A")}</span></td>
      <td><span class="candidate">${p.candidate_b_pct == null ? "—" : esc(p.candidate_b_pct + "%")}</span><span class="candidate-label">${esc(p.candidate_b || "Candidato B")}</span></td>
      <td>${esc(p.sample_size ? p.sample_size.toLocaleString("pt-BR") + " entrevistas" : "Amostra não informada")}<span class="sub">Margem: ${esc(p.margin_error || "Não informada")}</span><span class="sub">${esc(p.percent_type || "Tipo de percentual não informado")}</span></td>
      <td><a class="source" href="${esc(p.source_url || "#")}" target="_blank" rel="noopener">${esc(p.source_label || "Ver fonte")} ↗</a></td>
    </tr>`).join("");
}
function renderRegistry() {
  const filtered = registered.filter(r => instituteFilter.value === "all" || r.institute === instituteFilter.value);
  registryCount.textContent = `${filtered.length} ${filtered.length === 1 ? "registro encontrado" : "registros encontrados"} no arquivo do TSE`;
  if (!filtered.length) {
    registryBody.innerHTML = `<tr><td colspan="6" class="empty">Nenhum registro presidencial foi encontrado no último arquivo importado. Consulte o PesqEle para verificar os filtros e os registros mais recentes.</td></tr>`;
    return;
  }
  registryBody.innerHTML = filtered.map(r => `
    <tr>
      <td><span class="institute">${esc(r.institute || "Instituto não informado")}</span><span class="sub">${esc(r.election || "Eleições 2026")}</span></td>
      <td>${esc(r.registration || "Não identificado")}</td>
      <td>${esc(r.fieldwork_start || "?")}${r.fieldwork_end ? ` a ${esc(r.fieldwork_end)}` : ""}</td>
      <td>${esc(fmtDate(r.release_date))}</td>
      <td>${esc(r.sample_size || "Não informada")}</td>
      <td><a class="source" href="${esc(r.source_url || "https://pesqele-divulgacao.tse.jus.br/app/pesquisa/listar.xhtml")}" target="_blank" rel="noopener">Consultar ↗</a></td>
    </tr>`).join("");
}

async function init() {
  try {
    const [p, m, r] = await Promise.all([
      fetch("./data/pesquisas.json", {cache:"no-store"}),
      fetch("./data/atualizacao.json", {cache:"no-store"}),
      fetch("./data/pesquisas_registradas.json", {cache:"no-store"})
    ]);
    if (!p.ok) throw new Error("Não foi possível carregar pesquisas.json");
    polls = await p.json();
    metadata = m.ok ? await m.json() : {};
    registered = r.ok ? await r.json() : [];
    updated.textContent = `Última verificação: ${metadata.last_check ? new Date(metadata.last_check).toLocaleString("pt-BR") : "não informada"}`;
    render();
    renderRegistry();
  } catch (e) {
    body.innerHTML = `<tr><td colspan="6" class="empty">Não foi possível carregar os dados. Atualize a página mais tarde.</td></tr>`;
    count.textContent = "Dados indisponíveis";
  }
}
instituteFilter.addEventListener("change", () => { render(); renderRegistry(); });
[sort,kind].forEach(el => el.addEventListener("change", render));

function populateInstituteOptions() {
  const selected = instituteFilter.value;
  const institutes = [...new Set([...polls, ...registered].map(p => p.institute).filter(Boolean))]
    .sort((a,b) => a.localeCompare(b, "pt-BR"));
  instituteFilter.innerHTML = '<option value="all">Todos os institutos</option>' +
    institutes.map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join("");
  if (institutes.includes(selected)) instituteFilter.value = selected;
  renderRegistry();
}
const originalInit = init;
init = async function() {
  await originalInit();
  populateInstituteOptions();
  render();
};
init();
