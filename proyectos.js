// ── PROYECTOS SPA ──────────────────────────────────────
const PROY_API = "https://script.google.com/macros/s/AKfycbwwEhneLgSWlMHPt54Xr3xuwRyiHUqi1WS5kmWWMrQ7qkvyzkNjOnZDQAzmgHKr9DKt/exec";

const proyState = {
  todos:        [],
  filtroActivo: "todos",
  vista:        "grid"  // "grid" o "detalle"
};

const container = () => document.getElementById("proyectosContainer");

// ── CARGA INICIAL ──────────────────────────────────────

async function loadProjects() {
  mostrarSkeletonProy();

  try {
    const res  = await fetch(`${PROY_API}?hoja=proyectos`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);

    proyState.todos = json.data;
    renderGrid();

  } catch (err) {
    console.error("Proyectos:", err);
    container().innerHTML = `
      <p style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;">
        No se pudieron cargar los proyectos.
      </p>`;
  }
}

// ── RENDER GRID ────────────────────────────────────────

function renderGrid() {
  proyState.vista = "grid";
  document.getElementById("proyFiltros").style.display = "flex";

  const filtrados = proyState.filtroActivo === "todos"
    ? proyState.todos
    : proyState.todos.filter(p => p.categoria === proyState.filtroActivo);

  if (filtrados.length === 0) {
    container().innerHTML = `
      <p style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;">
        No hay proyectos en esta categoría.
      </p>`;
    return;
  }

  container().innerHTML = `
    <div class="projects-grid">
      ${filtrados.map(p => cardProyHTML(p)).join("")}
    </div>`;

  // Fade in
  requestAnimationFrame(() => {
    container().querySelectorAll(".proy-card").forEach((card, i) => {
      card.style.animationDelay = `${i * 0.08}s`;
      card.classList.add("fade-in");
    });
  });
}

function cardProyHTML(p) {
  const estadoInfo = {
    ACTIVO:       { label: "Activo",       clase: "estado-activo" },
    EN_EJECUCION: { label: "En ejecución", clase: "estado-ejecucion" },
    FINALIZADO:   { label: "Finalizado",   clase: "estado-finalizado" }
  }[p.estado] || { label: p.estado, clase: "" };

  const imgHTML = p.imagen
    ? `<div class="proy-img" style="background-image:url('${p.imagen}')"></div>`
    : `<div class="proy-img proy-img-placeholder">
        <span>${p.categoria.charAt(0).toUpperCase()}</span>
       </div>`;

  return `
    <div class="proy-card" onclick="viewProject(${p.id})">
      ${imgHTML}
      <div class="proy-card-body">
        <div class="proy-card-top">
          <span class="proy-badge ${estadoInfo.clase}">${estadoInfo.label}</span>
          <span class="proy-categoria">${p.categoria}</span>
        </div>
        <h3 class="proy-titulo">${p.titulo}</h3>
        <p class="proy-desc">${p.descripcionCorta}</p>
        <div class="proy-progress-wrap">
          <div class="proy-progress-bar">
            <div class="proy-progress-fill" style="width:${p.progreso}%"></div>
          </div>
          <span class="proy-progress-num">${p.progreso}%</span>
        </div>
        <button class="proy-btn">Ver proyecto →</button>
      </div>
    </div>`;
}

// ── VISTA DETALLE ──────────────────────────────────────

async function viewProject(id) {
  proyState.vista = "detalle";
  document.getElementById("proyFiltros").style.display = "none";

  // Buscar primero en los datos que ya tenemos
  const local = proyState.todos.find(p => p.id.toString() === id.toString());
  if (local) {
    renderDetalle(local);
    return;
  }

  // Solo si no está en memoria, hacer fetch
  container().innerHTML = `
    <div style="text-align:center;padding:60px;">
      <div class="proy-spinner"></div>
    </div>`;

  try {
    const res  = await fetch(`${PROY_API}?hoja=proyectos&id=${id}`, {
      redirect: "follow"
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);
    renderDetalle(json.data);

  } catch (err) {
    console.error("Proyecto detalle:", err);
    container().innerHTML = `
      <p style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;">
        No se pudo cargar el proyecto.
      </p>
      <button class="proy-volver" onclick="goBack()">← Volver al listado</button>`;
  }
}
function renderDetalle(p) {
  const estadoInfo = {
    ACTIVO:       { label: "Activo",       clase: "estado-activo" },
    EN_EJECUCION: { label: "En ejecución", clase: "estado-ejecucion" },
    FINALIZADO:   { label: "Finalizado",   clase: "estado-finalizado" }
  }[p.estado] || { label: p.estado, clase: "" };

  const imgHTML = p.imagen
    ? `<div class="proy-detalle-img" style="background-image:url('${p.imagen}')"></div>`
    : "";

  container().innerHTML = `
    <div class="proy-detalle fade-in">
      ${imgHTML}
      <div class="proy-detalle-body">
        <div class="proy-card-top" style="margin-bottom:12px;">
          <span class="proy-badge ${estadoInfo.clase}">${estadoInfo.label}</span>
          <span class="proy-categoria">${p.categoria}</span>
          <span class="proy-fecha">${p.fecha}</span>
        </div>
        <h2 class="proy-detalle-titulo">${p.titulo}</h2>
        <div class="proy-progress-wrap" style="margin:20px 0;">
          <div class="proy-progress-bar">
            <div class="proy-progress-fill" style="width:${p.progreso}%"></div>
          </div>
          <span class="proy-progress-num">${p.progreso}%</span>
        </div>
        <div class="proy-detalle-contenido">
          ${p.descripcionLarga.replace(/\n/g, "<br>")}
        </div>
      </div>
      <button class="proy-volver" onclick="goBack()">← Volver al listado</button>
    </div>`;
}

// ── VOLVER ─────────────────────────────────────────────

function goBack() {
  renderGrid();
}

// ── FILTROS ────────────────────────────────────────────

document.querySelectorAll(".proy-filtro").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".proy-filtro").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    proyState.filtroActivo = btn.dataset.f;
    renderGrid();
  });
});

// ── SKELETON ───────────────────────────────────────────

function mostrarSkeletonProy() {
  container().innerHTML = `
    <div class="projects-grid">
      ${Array(3).fill(`
        <div class="proy-card skeleton">
          <div class="proy-img skel-img"></div>
          <div class="proy-card-body">
            <div class="skel-line skel-short"></div>
            <div class="skel-line skel-full"></div>
            <div class="skel-line skel-medium"></div>
          </div>
        </div>`).join("")}
    </div>`;
}

// ── INIT ───────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", loadProjects);