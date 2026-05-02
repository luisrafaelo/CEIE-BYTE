const header   = document.querySelector("header");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");
const perry    = document.getElementById("perry");

// --- Proyectos dinámicos ---
const miniCards = document.querySelectorAll(".mini-card");
const dinamico  = document.getElementById("proyecto-dinamico");

miniCards.forEach(card => {
  card.addEventListener("click", () => {
    if (card.classList.contains("active")) return;

    miniCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    if (!dinamico) return;

    dinamico.style.opacity   = "0";
    dinamico.style.transform = "translateY(12px)";

    setTimeout(() => {
      // Título y texto
      dinamico.querySelector("h3").textContent = card.dataset.title;
      dinamico.querySelector("p").textContent  = card.dataset.text;

      // Badge — cambia color y texto según status
      const badge = dinamico.querySelector(".status");
      if (card.dataset.status === "soon") {
        badge.textContent = "Próximamente";
        badge.className   = "status status-soon";
      } else {
        badge.textContent = "En ejecución";
        badge.className   = "status status-active";
      }

      // Barra de progreso
      dinamico.querySelector(".progress-bar").style.width = card.dataset.progress + "%";

      dinamico.style.opacity   = "1";
      dinamico.style.transform = "translateY(0)";
    }, 220);
  });
});
let ticking = false;
let lastY   = 0;
window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
});

function onScroll() {
  const scrollY = window.scrollY;

  // ③ Header: usa la clase "scrolled" que sí existe en el CSS
  header.classList.toggle("scrolled", scrollY > 50);

  // ④ Sección activa en el nav
  let current = "";

  sections.forEach(section => {
    if (scrollY >= section.offsetTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === "#" + current
    );
  });

    if (perry) {
    if (scrollY > lastY && scrollY > 80) {
      perry.classList.add("hidden");
    } else if (scrollY < 80) {
      perry.classList.remove("hidden");
    }
  }

  lastY   = scrollY;
  ticking = false;
}
// Comunicados — buscador + filtros
let filtroActivo = "todos";

function setFiltro(f) {
  filtroActivo = f;
  document.querySelectorAll(".filtro-btn").forEach(b => {
    b.classList.toggle("on", b.dataset.f === f);
  });
  filtrar();
}

function filtrar() {
  const q = document.getElementById("buscador").value.toLowerCase();
  const cards = document.querySelectorAll(".com-card");
  let visibles = 0;

  cards.forEach(card => {
    const tag     = card.dataset.tag;
    const texto   = card.textContent.toLowerCase();
    const tagOk   = filtroActivo === "todos" || tag === filtroActivo;
    const textoOk = texto.includes(q);
    const mostrar = tagOk && textoOk;

    card.style.display = mostrar ? "" : "none";
    if (mostrar) visibles++;
  });

  const total = cards.length;
  document.getElementById("contador").textContent =
    `Mostrando ${visibles} de ${total} comunicados`;
  document.getElementById("empty").style.display =
    visibles === 0 ? "block" : "none";
}

// Inicializar contador
document.addEventListener("DOMContentLoaded", filtrar);

// Buscador
document.getElementById("buscador")
  ?.addEventListener("input", filtrar);