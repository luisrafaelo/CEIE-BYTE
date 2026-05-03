const header   = document.querySelector("header");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");
const perry    = document.getElementById("perry");
const hamBtn   = document.getElementById('hamBtn');
const mainNav  = document.getElementById('mainNav');

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
      dinamico.querySelector("h3").textContent = card.dataset.title;
      dinamico.querySelector("p").textContent  = card.dataset.text;

      const badge = dinamico.querySelector(".status");
      if (card.dataset.status === "soon") {
        badge.textContent = "Próximamente";
        badge.className   = "status status-soon";
      } else {
        badge.textContent = "En ejecución";
        badge.className   = "status status-active";
      }

      dinamico.querySelector(".progress-bar").style.width = card.dataset.progress + "%";
      dinamico.style.opacity   = "1";
      dinamico.style.transform = "translateY(0)";
    }, 220);
  });
});

// --- Scroll ---
let ticking = false;
let lastY   = 0;

const PERRY_BASE = -660; // solo sombrero visible
const PERRY_FULL = -200; // más cuerpo visible al scrollear

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
});

function onScroll() {
  const scrollY = window.scrollY;

  // Header transparente al bajar
  header.classList.toggle("scrolled", scrollY > 50);

  // Nav activo
  let current = "";
  sections.forEach(section => {
    if (scrollY >= section.offsetTop - 200) {
      current = section.getAttribute("id");
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle("active",
      link.getAttribute("href") === "#" + current
    );
  });

// Perry — sombrero en inicio, completo y pequeño en el resto
if (perry) {
  if (scrollY < 80) {
    // Tope — solo sombrero, imagen grande
    perry.style.opacity = "1";
    perry.style.height  = "1200px";
    perry.style.bottom  = "-660px";
  } else {
    // Scrolleando — Perry completo y pequeño, siempre visible
    const progress  = Math.min((scrollY - 80) / 400, 1);
    const newHeight = 1200 - (1200 - 280) * progress; // 1200px → 280px
    const newBottom = -660 + (660 + 20) * progress;   // -660px → 20px
    perry.style.opacity = "1";
    perry.style.height  = newHeight + "px";
    perry.style.bottom  = newBottom + "px";
  }
}

  lastY   = scrollY;
  ticking = false;
}

// --- Comunicados ---
let filtroActivo = "todos";

function setFiltro(f) {
  filtroActivo = f;
  document.querySelectorAll(".filtro-btn").forEach(b => {
    b.classList.toggle("on", b.dataset.f === f);
  });
  filtrar();
}

function filtrar() {
  const q     = document.getElementById("buscador")?.value.toLowerCase() || "";
  const cards = document.querySelectorAll(".com-card");
  let visibles = 0;

  cards.forEach(card => {
    const tagOk   = filtroActivo === "todos" || card.dataset.tag === filtroActivo;
    const textoOk = card.textContent.toLowerCase().includes(q);
    const mostrar = tagOk && textoOk;
    card.style.display = mostrar ? "" : "none";
    if (mostrar) visibles++;
  });

  const contador = document.getElementById("contador");
  if (contador) contador.textContent = `Mostrando ${visibles} de ${cards.length} comunicados`;

  const empty = document.getElementById("empty");
  if (empty) empty.style.display = visibles === 0 ? "block" : "none";
}

document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => setFiltro(btn.dataset.f));
});
document.getElementById("buscador")?.addEventListener("input", filtrar);
document.addEventListener("DOMContentLoaded", filtrar);

// --- Contacto ---
function actualizarEstado() {
  const ahora = new Date();
  const dia   = ahora.getDay();
  const hora  = ahora.getHours();
  const dot   = document.getElementById("estadoDot");
  const txt   = document.getElementById("estadoTxt");
  if (!dot || !txt) return;
  const disponible = dia >= 1 && dia <= 5 && hora >= 8 && hora < 18;
  dot.style.background = disponible ? "#25d366" : "#ff4444";
  txt.textContent = disponible
    ? "Disponibles ahora · Respondemos en minutos"
    : "Fuera de horario · Te respondemos mañana";
}
actualizarEstado();

function enviar() {
  const nombre  = document.getElementById("fNombre")?.value.trim();
  const email   = document.getElementById("fEmail")?.value.trim();
  const mensaje = document.getElementById("fMensaje")?.value.trim();

  if (!nombre || !mensaje) {
    alert("Por favor completa tu nombre y mensaje.");
    return;
  }

  const texto = `Hola CEIE-BYTE! Soy ${nombre} (${email}). ${mensaje}`;
  const url   = `https://wa.me/+59179521088?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");

  document.getElementById("formArea").style.display    = "none";
  document.getElementById("formSuccess").style.display = "block";
}

// --- Hamburguesa ---
hamBtn.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  hamBtn.textContent = mainNav.classList.contains('open') ? '✕' : '☰';
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    hamBtn.textContent = '☰';
  });
});