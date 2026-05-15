// ── PERRY BURBUJA ──────────────────────────────────────
const PERRY_API = "https://script.google.com/macros/s/AKfycbyvK-3hfFIe1fCwOq7H0dAjguzZl7HGcyL9okbj1G2rBwBLU8R0n2HE14NSroKz1zi6/exec";

let perryData = null;

async function cargarPerry() {
  try {
    const res  = await fetch(`${PERRY_API}?hoja=perry`, { redirect: "follow" });
    const json = await res.json();
    if (json.ok && json.data) {
      perryData = json.data;
      mostrarAviso(json.data);
    }
  } catch (err) {
    console.warn("Perry:", err);
  }
}

function mostrarBurbuja() {
  if (!perryData) return;

  const burbuja = document.getElementById("perryBurbuja");
  const perry   = document.getElementById("perry");
  if (!burbuja || !perry) return;

  // Posicionarse encima de Perry
  const rect = perry.getBoundingClientRect();
  burbuja.style.left   = (rect.left - 130) + "px";
  burbuja.style.top    = (rect.top - 60) + "px";
  burbuja.style.bottom = "auto";
  burbuja.style.right  = "auto";

  burbuja.innerHTML = perryData.link
    ? `<a href="${perryData.link}" target="_blank" rel="noopener">${perryData.mensaje}</a>`
    : `<span>${perryData.mensaje}</span>`;

  burbuja.classList.add("visible");

  setTimeout(() => {
    burbuja.classList.remove("visible");
  }, 2000);
}

document.addEventListener("DOMContentLoaded", cargarPerry);
function mostrarAviso(data) {
  const bar     = document.getElementById("avisoBar");
  const mensaje = document.getElementById("avisoMensaje");
  const link    = document.getElementById("avisoLink");
  if (!bar || !mensaje) return;

  mensaje.textContent = data.mensaje;

  if (data.link) {
    link.href          = data.link;
    link.style.display = "inline";
  } else {
    link.style.display = "none";
  }

  // Mostrar completo
  bar.style.display = "flex";
  bar.classList.remove("minimized");

  // Minimizar después de 2 segundos
  setTimeout(() => {
    bar.classList.add("minimized");
  }, 2000);
}

function cerrarAviso() {
  const bar = document.getElementById("avisoBar");
  if (bar) bar.style.display = "none";
}

// Scroll: desaparece fuera de inicio, reaparece y minimiza al volver
const inicioObs = new IntersectionObserver((entries) => {
  const bar = document.getElementById("avisoBar");
  if (!bar || !perryData) return;

  if (entries[0].isIntersecting) {
    bar.style.display = "flex";
    bar.classList.remove("minimized");
    setTimeout(() => {
      bar.classList.add("minimized");
    }, 2000);
  } else {
    bar.style.display = "none";
    bar.classList.remove("minimized");
  }
}, { threshold: 0.5 });

document.addEventListener("DOMContentLoaded", () => {
  const inicioSection = document.getElementById("inicio");
  if (inicioSection) inicioObs.observe(inicioSection);
});

// Clic en ícono minimizado expande
document.addEventListener("click", (e) => {
  const bar = document.getElementById("avisoBar");
  if (!bar) return;
  if (bar.classList.contains("minimized") && e.target.classList.contains("aviso-icon")) {
    bar.classList.remove("minimized");
    setTimeout(() => {
      bar.classList.add("minimized");
    }, 2000);
  }
});