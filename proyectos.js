// ── PROYECTOS SPA ──────────────────────────────────────
const PROY_API = "https://script.google.com/macros/s/AKfycbyvK-3hfFIe1fCwOq7H0dAjguzZl7HGcyL9okbj1G2rBwBLU8R0n2HE14NSroKz1zi6/exec";

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
  // Activar drag en imágenes
setTimeout(activarDragImagen, 500);
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

  // Carrusel si hay imágenes, si no usa la imagen principal
  const todasImagenes = p.imagenes && p.imagenes.length > 0
    ? p.imagenes
    : (p.imagen ? [p.imagen] : []);

  const carruselHTML = todasImagenes.length > 0 ? `
    <div class="carrusel" id="carrusel">
      <div class="carrusel-track" id="carruselTrack">
        ${todasImagenes.map((img, i) => `
          <div class="carrusel-slide" style="background-image:url('${img}')"></div>
        `).join("")}
      </div>
      ${todasImagenes.length > 1 ? `
        <button class="carrusel-btn carrusel-prev" onclick="moverCarrusel(-1)">‹</button>
        <button class="carrusel-btn carrusel-next" onclick="moverCarrusel(1)">›</button>
        <div class="carrusel-dots">
          ${todasImagenes.map((_, i) => `
            <div class="carrusel-dot ${i === 0 ? 'active' : ''}" onclick="irASlide(${i})"></div>
          `).join("")}
        </div>
      ` : ""}
    </div>` : "";

  container().innerHTML = `
    <div class="proy-detalle fade-in">
      ${carruselHTML}
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

  // Iniciar carrusel
  if (todasImagenes.length > 1) iniciarCarrusel(todasImagenes.length);
}

// ── CARRUSEL ───────────────────────────────────────────
let carruselIndex  = 0;
let carruselTotal  = 0;
let carruselTimer  = null;

function iniciarCarrusel(total) {
  carruselIndex = 0;
  carruselTotal = total;
  if (carruselTimer) clearInterval(carruselTimer);
  carruselTimer = setInterval(() => moverCarrusel(1), 3000);
}

function moverCarrusel(dir) {
  carruselIndex = (carruselIndex + dir + carruselTotal) % carruselTotal;
  actualizarCarrusel();
}

function irASlide(i) {
  carruselIndex = i;
  actualizarCarrusel();
  if (carruselTimer) clearInterval(carruselTimer);
  carruselTimer = setInterval(() => moverCarrusel(1), 3000);
}

function actualizarCarrusel() {
  const track = document.getElementById("carruselTrack");
  const dots  = document.querySelectorAll(".carrusel-dot");
  if (track) track.style.transform = `translateX(-${carruselIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle("active", i === carruselIndex));
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
// ── IMAGEN DRAG EN MÓVIL ──────────────────────────────
function activarDragImagen() {
  document.querySelectorAll(".proy-img").forEach(img => {
    let startY     = 0;
    let startPos   = 50; // porcentaje inicial
    let currentPos = 50;
    let dragging   = false;

    img.addEventListener("touchstart", (e) => {
      dragging = true;
      startY   = e.touches[0].clientY;
      const pos = img.style.backgroundPosition || "center 50%";
      const match = pos.match(/(\d+)%/g);
      startPos = match ? parseInt(match[match.length - 1]) : 50;
      e.stopPropagation();
    }, { passive: true });

    img.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const deltaY = e.touches[0].clientY - startY;
      currentPos   = Math.max(0, Math.min(100, startPos - deltaY * 0.3));
      img.style.backgroundPosition = `center ${currentPos}%`;
      e.stopPropagation();
    }, { passive: true });

    img.addEventListener("touchend", () => {
      dragging = false;
    });
  });
}