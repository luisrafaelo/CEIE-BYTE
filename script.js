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
// Perry — comportamiento según sección
if (perry) {
  const inicioSection = document.getElementById("inicio");
  const alturaInicio  = inicioSection ? inicioSection.offsetHeight : window.innerHeight;
  const enInicio      = scrollY < alturaInicio;
if (scrollY < 80) {
  const esMobil = window.innerWidth <= 768;
  perry.style.left          = "";
  perry.style.top           = "";
  perry.style.right         = esMobil ? "-20px"  : "50px";
  perry.style.bottom        = esMobil ? "-280px" : "-660px";
  perry.style.height        = esMobil ? "500px"  : "1170px";
  perry.style.opacity       = "1";
  perry.style.pointerEvents = "none";
} else if (enInicio) {
    // Scrolleando dentro del hero — se encoge
    perry.style.left        = "";
    perry.style.top         = "";
    perry.style.right       = "50px";
    perry.style.pointerEvents = "none"; // ← sin drag en inicio
    const progress  = Math.min((scrollY - 80) / 400, 1);
    const newHeight = 1200 - (900 * progress);
    const newBottom = -660 + (680 * progress);
    perry.style.height  = newHeight + "px";
    perry.style.bottom  = newBottom + "px";
    perry.style.opacity = "1";
  } else {
    // Fuera del hero — arrastrable
    perry.style.pointerEvents = "auto"; // ← drag activado
    perry.style.opacity = "1";
      // Solo resetea posición si viene del hero (no si ya fue arrastrado)
  }
}

  lastY   = scrollY;
  ticking = false;
}
// Perry — agitación ocasional en cualquier posición
function agitarPerry() {
  if (!perry) return;

  perry.style.transition = "transform 0.1s ease";

  const sacudidas = [
    { x: -8, r: -5 },
    { x: 8,  r: 5  },
    { x: -6, r: -3 },
    { x: 6,  r: 3  },
    { x: 0,  r: 0  },
  ];

  sacudidas.forEach((s, i) => {
    setTimeout(() => {
      perry.style.transform = `translateX(${s.x}px) rotate(${s.r}deg)`;
    }, i * 80);
  });

  setTimeout(() => {
    perry.style.transform = "";
    perry.style.transition = "height 0.4s ease, bottom 0.4s ease, opacity 0.5s ease";
  }, sacudidas.length * 80 + 100);
}

function programarAgitacion() {
  const delay = 4000 + Math.random() * 3000;
  setTimeout(() => {
    agitarPerry();
    programarAgitacion();
  }, delay);
}

programarAgitacion();

// Perry — gira sobre su eje vertical siguiendo el cursor
document.addEventListener("mousemove", (e) => {
  if (!perry) return;

  const rect   = perry.getBoundingClientRect();
  const perryX = rect.left + rect.width / 2;
  const perryY = rect.top  + rect.height / 2;

  const dx = e.clientX - perryX;
  const dy = e.clientY - perryY;

  // Horizontal — gira izquierda/derecha
  const rotY = Math.max(-25, Math.min(25, dx * 0.03));
  // Vertical — se inclina arriba/abajo (invertido para que sea natural)
  const rotX = Math.max(-15, Math.min(15, -dy * 0.03));

  perry.style.transform = `perspective(800px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
});
document.addEventListener("mouseleave", () => {
  if (!perry) return;
  perry.style.transition = "transform 0.5s ease";
  perry.style.transform  = "perspective(800px) rotateY(0deg)";
});
// Resetea al salir del área
document.addEventListener("mouseleave", () => {
  if (!perry) return;
  perry.style.transform = "";
});
// Perry — arrastrable con click
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

perry.addEventListener("mousedown", (e) => {
  isDragging = true;
  perry.style.animation  = "none"; // pausa animaciones
  perry.style.transition = "none";
  perry.style.cursor     = "grabbing";

  dragOffsetX = e.clientX - perry.getBoundingClientRect().left;
  dragOffsetY = e.clientY - perry.getBoundingClientRect().top;

  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const x = e.clientX - dragOffsetX;
  const y = e.clientY - dragOffsetY;

  perry.style.left   = x + "px";
  perry.style.top    = y + "px";
  perry.style.right  = "auto";
  perry.style.bottom = "auto";
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  perry.style.cursor = "grab";

  // Rebote suave al soltar
  perry.style.transition = "transform 0.3s ease";
  perry.style.transform  = "";
});
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
// Perry — drag táctil para móvil
perry.addEventListener("touchstart", (e) => {
  isDragging = true;
  perry.dataset.dragged  = "true";
  perry.style.animation  = "none";
  perry.style.transition = "none";

  const touch = e.touches[0];
  dragOffsetX = touch.clientX - perry.getBoundingClientRect().left;
  dragOffsetY = touch.clientY - perry.getBoundingClientRect().top;

  e.preventDefault();
}, { passive: false });

document.addEventListener("touchmove", (e) => {
  if (!isDragging) return;

  const touch = e.touches[0];
  const x = touch.clientX - dragOffsetX;
  const y = touch.clientY - dragOffsetY;

  perry.style.left   = x + "px";
  perry.style.top    = y + "px";
  perry.style.right  = "auto";
  perry.style.bottom = "auto";

  e.preventDefault();
}, { passive: false });

document.addEventListener("touchend", () => {
  if (!isDragging) return;
  isDragging = false;
  perry.style.transition = "transform 0.3s ease";
  perry.style.transform  = "";
});
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