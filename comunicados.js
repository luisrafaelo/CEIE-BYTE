// ── COMUNICADOS DINÁMICOS ──────────────────────────────
const API_URL = "https://script.google.com/macros/s/AKfycbwwEhneLgSWlMHPt54Xr3xuwRyiHUqi1WS5kmWWMrQ7qkvyzkNjOnZDQAzmgHKr9DKt/exec";

const estado = {
  todos:        [],
  filtrados:    [],
  filtroActivo: "todos",
  busqueda:     "",
  cargando:     false
};

async function cargarComunicados() {
  if (estado.cargando) return;
  estado.cargando = true;

  mostrarSkeleton();

  try {
    const res  = await fetch(`${API_URL}?limite=20`);
    if (!res.ok) throw new Error("Error de red");
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Error del servidor");

    estado.todos = json.data;
    aplicarFiltros();

  } catch (err) {
    console.error("Comunicados:", err);
    mostrarError();
  } finally {
    estado.cargando = false;
  }
}

function aplicarFiltros() {
  const q = estado.busqueda.toLowerCase();

  estado.filtrados = estado.todos.filter(c => {
    const catOk  = estado.filtroActivo === "todos" || c.categoria === estado.filtroActivo;
    const txtOk  = !q || c.titulo.toLowerCase().includes(q) || c.resumen.toLowerCase().includes(q);
    return catOk && txtOk;
  });

  renderComunicados();
  actualizarContador();
}

function setFiltro(f) {
  estado.filtroActivo = f;
  document.querySelectorAll(".filtro-btn").forEach(b => {
    b.classList.toggle("on", b.dataset.f === f);
  });
  aplicarFiltros();
}

// Conectar buscador
document.getElementById("buscador")?.addEventListener("input", e => {
  estado.busqueda = e.target.value;
  aplicarFiltros();
});

// Conectar filtros
document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => setFiltro(btn.dataset.f));
});

// Iniciar al cargar
document.addEventListener("DOMContentLoaded", cargarComunicados);
function renderComunicados() {
  const lista = document.getElementById("lista");
  const empty = document.getElementById("empty");
  if (!lista) return;

  if (estado.filtrados.length === 0) {
    lista.innerHTML = "";
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  lista.innerHTML = estado.filtrados.map(c => cardHTML(c)).join("");
}

function cardHTML(c) {
  const tagClass = {
    academico:      "tag-academico",
    administrativo: "tag-administrativo",
    eventos:        "tag-eventos",
    convocatorias:  "tag-convocatorias"
  }[c.categoria] || "tag-academico";

  const tagLabel = {
    academico:      "Académico",
    administrativo: "Administrativo",
    eventos:        "Eventos",
    convocatorias:  "Convocatorias"
  }[c.categoria] || c.categoria;

  const pinHTML  = c.destacado ? `<span class="pin-icon">📌</span>` : "";
  const nuevoHTML = esReciente(c.fecha) ? `<span class="badge-nuevo">Nuevo</span>` : "";
  const pdfHTML  = c.pdf
    ? `<a class="pdf-btn" href="${c.pdf}" target="_blank" rel="noopener">📄 Descargar PDF</a>`
    : "";

  // Si tiene link redirige, si no abre modal
  const verMas = c.link
    ? `<a class="ver-mas" href="${c.link}" target="_blank" rel="noopener">Ver más →</a>`
    : `<span class="ver-mas" onclick="abrirModal(${JSON.stringify(c).replace(/"/g, '&quot;')})">Ver más →</span>`;

  return `
    <div class="com-card ${c.destacado ? "fijada" : ""}" data-tag="${c.categoria}">
      <div class="card-top">
        ${pinHTML}
        <span class="tag-badge ${tagClass}">${tagLabel}</span>
        ${nuevoHTML}
        <span class="card-fecha">${c.fecha}</span>
      </div>
      <div class="card-title">${c.titulo}</div>
      <div class="card-preview">${c.resumen}</div>
      <div class="card-footer">
        ${pdfHTML}
        ${verMas}
      </div>
    </div>
  `;
}

function esReciente(fechaStr) {
  // Marca como "Nuevo" si tiene menos de 7 días
  try {
    const fecha = new Date(fechaStr);
    const diff  = (Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  } catch {
    return false;
  }
}

function actualizarContador() {
  const el = document.getElementById("contador");
  if (!el) return;
  el.textContent = `Mostrando ${estado.filtrados.length} de ${estado.todos.length} comunicados`;
}
function mostrarSkeleton() {
  const lista = document.getElementById("lista");
  if (!lista) return;
  lista.innerHTML = Array(3).fill(`
    <div class="com-card skeleton">
      <div class="skel-line skel-short"></div>
      <div class="skel-line skel-full"></div>
      <div class="skel-line skel-medium"></div>
    </div>
  `).join("");
}

function mostrarError() {
  const lista = document.getElementById("lista");
  if (!lista) return;
  lista.innerHTML = `
    <div class="com-card" style="text-align:center; padding: 32px;">
      <p style="color:rgba(255,255,255,0.4); font-size:14px;">
        No se pudieron cargar los comunicados.<br>
        <span style="font-size:12px; opacity:0.6;">Intentá de nuevo más tarde.</span>
      </p>
    </div>
  `;
}
// ── MODAL ──────────────────────────────────────────────
function abrirModal(c) {
  const tagLabel = {
    academico:      "Académico",
    administrativo: "Administrativo",
    eventos:        "Eventos",
    convocatorias:  "Convocatorias"
  }[c.categoria] || c.categoria;

  const pdfBtn = c.pdf
    ? `<a class="pdf-btn" href="${c.pdf}" target="_blank" rel="noopener"
        style="display:inline-flex;align-items:center;gap:6px;margin-top:16px;">
        📄 Descargar PDF
       </a>`
    : "";

  document.getElementById("modalOverlay").innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="tag-badge tag-${c.categoria}">${tagLabel}</span>
          <span class="card-fecha" style="margin-left:0">${c.fecha}</span>
        </div>
        <button class="modal-close" onclick="cerrarModal()">✕</button>
      </div>
      <h2 class="modal-titulo">${c.titulo}</h2>
      <div class="modal-contenido">${c.contenido.replace(/\n/g, "<br>")}</div>
      ${pdfBtn}
    </div>
  `;

  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

// Cerrar al hacer clic fuera del modal
document.getElementById("modalOverlay")?.addEventListener("click", (e) => {
  if (e.target.id === "modalOverlay") cerrarModal();
});

// Cerrar con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});