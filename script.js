const header    = document.querySelector("header");
const sections  = document.querySelectorAll("section");
const navLinks  = document.querySelectorAll("nav a");
const perry     = document.getElementById("perry");
const hamBtn    = document.getElementById('hamBtn');
const mainNav   = document.getElementById('mainNav');
const miniCards = document.querySelectorAll(".mini-card");
const dinamico  = document.getElementById("proyecto-dinamico");

let ticking     = false;
let lastY       = 0;
let isDragging  = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// --- Proyectos dinámicos ---
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
window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
});

function onScroll() {
  const scrollY = window.scrollY;

  // Header
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

  // Perry
  if (perry) {
    const inicioSection = document.getElementById("inicio");
    const alturaInicio  = inicioSection ? inicioSection.offsetHeight : window.innerHeight;
    const enInicio      = scrollY < alturaInicio;
    const esMobil       = window.innerWidth <= 768;

    if (scrollY < 80) {
      perry.style.transition    = "right 0.6s ease, bottom 0.6s ease, height 0.6s ease, opacity 0.5s ease";
      perry.style.left          = "";
      perry.style.top           = "";
      perry.style.right         = esMobil ? "-20px"  : "250px";
      perry.style.bottom        = esMobil ? "-280px" : "-500px";
      perry.style.height        = esMobil ? "150px"  : "750px";
      perry.style.opacity       = "1";
      perry.style.pointerEvents = "none";
      delete perry.dataset.dragged; 

    } else if (enInicio) {
      perry.style.transition    = "none";
      perry.style.left          = "";
      perry.style.top           = "";
      perry.style.right         = esMobil ? "-20px" : "50px";
      perry.style.pointerEvents = "none";
      
      const progress  = Math.min((scrollY - 80) / 400, 1);
      const newHeight = esMobil ? 150 - (100 * progress) : 1200 - (900 * progress); // ← 100 en vez de 200
      const newBottom = esMobil ? -280 + (300 * progress) : -660 + (680 * progress);perry.style.height  = newHeight + "px";
      perry.style.bottom  = newBottom + "px";
      perry.style.opacity = "1";

    } else {
      perry.style.pointerEvents = "auto";
      perry.style.opacity       = "1";

      if (!isDragging && !perry.dataset.dragged) {
        perry.dataset.dragged  = "true";
        perry.style.transition = "right 0.6s ease, bottom 0.6s ease, height 0.6s ease";
        perry.style.left   = "";
        perry.style.top    = "";
        perry.style.right  = esMobil ? "-20px" : "150px";
        perry.style.bottom = "20px";
        perry.style.height = "150px";
      }
    }
  }

  lastY   = scrollY;
  ticking = false;
}

// --- Perry agitación ---
function agitarPerry() {
  if (!perry) return;
  perry.style.transition = "transform 0.1s ease";
  const sacudidas = [
    { x: -8, r: -5 },
    { x:  8, r:  5 },
    { x: -6, r: -3 },
    { x:  6, r:  3 },
    { x:  0, r:  0 },
  ];
  sacudidas.forEach((s, i) => {
    setTimeout(() => {
      perry.style.transform = `translateX(${s.x}px) rotate(${s.r}deg)`;
    }, i * 80);
  });
  setTimeout(() => {
    perry.style.transform  = "";
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

// --- Perry giro con cursor ---
document.addEventListener("mousemove", (e) => {
  if (!perry || isDragging) return;

  const rect   = perry.getBoundingClientRect();
  const perryX = rect.left + rect.width  / 2;
  const perryY = rect.top  + rect.height / 2;
  const rotY   = Math.max(-25, Math.min(25, (e.clientX - perryX) * 0.03));
  const rotX   = Math.max(-15, Math.min(15, -(e.clientY - perryY) * 0.03));

  perry.style.transform = `perspective(800px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
});

document.addEventListener("mouseleave", () => {
  if (!perry) return;
  perry.style.transition = "transform 0.5s ease";
  perry.style.transform  = "perspective(800px) rotateY(0deg) rotateX(0deg)";
});

// --- Perry drag mouse ---
perry.addEventListener("mousedown", (e) => {
  isDragging = true;
  perry.style.animation  = "none";
  perry.style.transition = "none";
  perry.style.cursor     = "grabbing";
  dragOffsetX = e.clientX - perry.getBoundingClientRect().left;
  dragOffsetY = e.clientY - perry.getBoundingClientRect().top;
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  perry.style.left   = (e.clientX - dragOffsetX) + "px";
  perry.style.top    = (e.clientY - dragOffsetY) + "px";
  perry.style.right  = "auto";
  perry.style.bottom = "auto";
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  perry.style.cursor     = "grab";
  perry.style.transition = "transform 0.3s ease";
  perry.style.transform  = "";
});

// --- Perry drag táctil ---
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
  perry.style.left   = (touch.clientX - dragOffsetX) + "px";
  perry.style.top    = (touch.clientY - dragOffsetY) + "px";
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
  const disponible = dia >= 1 && dia <= 6 && hora >= 8 && hora < 22;
  dot.style.background = disponible ? "#25d366" : "#ff4444";
  txt.textContent      = disponible
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
// --- Dropdown externos ---
function toggleExterno() {
  const dropdown = document.getElementById("externoDropdown");
  const card     = document.getElementById("cardExterno");
  const arrow    = document.getElementById("externoArrow");
  const isOpen   = dropdown.classList.contains("open");

  dropdown.classList.toggle("open");
  card.classList.toggle("open");
  arrow.textContent = isOpen ? "↗" : "✕";
}
// --- Dropdown WhatsApp ---
function toggleWhatsapp() {
  document.getElementById("whatsappDropdown").classList.toggle("open");
}

// Cierra al hacer click fuera
document.addEventListener("click", (e) => {
  const wrap = document.querySelector(".whatsapp-wrap");
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById("whatsappDropdown").classList.remove("open");
  }
});
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