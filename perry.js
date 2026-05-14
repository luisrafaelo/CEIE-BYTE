// ── PERRY BURBUJA ──────────────────────────────────────
const PERRY_API = "https://script.google.com/macros/s/AKfycbwwEhneLgSWlMHPt54Xr3xuwRyiHUqi1WS5kmWWMrQ7qkvyzkNjOnZDQAzmgHKr9DKt/exec";

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

  // No mostrar si el usuario ya lo cerró en esta sesión
  if (sessionStorage.getItem("avisoCerrado")) return;

  mensaje.textContent = data.mensaje;

  if (data.link) {
    link.href  = data.link;
    link.style.display = "inline";
  } else {
    link.style.display = "none";
  }

  bar.style.display = "flex";
}

function cerrarAviso() {
  const bar = document.getElementById("avisoBar");
  if (bar) bar.style.display = "none";
  sessionStorage.setItem("avisoCerrado", "true");
}
window.addEventListener("scroll", () => {
  const bar = document.getElementById("avisoBar");
  if (!bar || bar.style.display === "none") return;

  if (window.scrollY > 100) {
    bar.classList.add("minimized");
  } else {
    bar.classList.remove("minimized");
  }
});

// Al hacer clic en el ícono minimizado, expande de nuevo
document.addEventListener("click", (e) => {
  const bar = document.getElementById("avisoBar");
  if (!bar) return;
  if (bar.classList.contains("minimized") && e.target.classList.contains("aviso-icon")) {
    bar.classList.remove("minimized");
  }
});