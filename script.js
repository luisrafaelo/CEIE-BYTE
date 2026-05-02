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

// Conectar botones de filtro
document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => setFiltro(btn.dataset.f));
});

// Conectar buscador
document.getElementById("buscador")?.addEventListener("input", filtrar);

// Inicializar al cargar
document.addEventListener("DOMContentLoaded", filtrar);
// Estado disponible según horario (L-V 8:00-18:00)
function actualizarEstado() {
  const ahora  = new Date();
  const dia    = ahora.getDay();    // 0=Dom, 6=Sab
  const hora   = ahora.getHours();
  const dot    = document.getElementById("estadoDot");
  const txt    = document.getElementById("estadoTxt");
  if (!dot || !txt) return;
  const disponible = dia >= 1 && dia <= 5 && hora >= 8 && hora < 18;
  dot.style.background = disponible ? "#25d366" : "#ff4444";
  txt.textContent = disponible
    ? "Disponibles ahora · Respondemos en minutos"
    : "Fuera de horario · Te respondemos mañana";
}
actualizarEstado();

// Formulario — envía por WhatsApp con el mensaje
function enviar() {
  const nombre  = document.getElementById("fNombre")?.value.trim();
  const email   = document.getElementById("fEmail")?.value.trim();
  const mensaje = document.getElementById("fMensaje")?.value.trim();

  if (!nombre || !mensaje) {
    alert("Por favor completa tu nombre y mensaje.");
    return;
  }

  // Opción A: redirige a WhatsApp con el mensaje prellenado
  const texto = `Hola CEIE-BYTE! Soy ${nombre} (${email}). ${mensaje}`;
  const url   = `https://wa.me/+59179521088?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");

  // Muestra mensaje de éxito
  document.getElementById("formArea").style.display    = "none";
  document.getElementById("formSuccess").style.display = "block";
}