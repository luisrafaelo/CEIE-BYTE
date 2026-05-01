const header   = document.querySelector("header");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");
const perry    = document.getElementById("perry");

// --- Proyectos dinámicos ---
const miniCards = document.querySelectorAll(".mini-card");
const dinamico  = document.getElementById("proyecto-dinamico");

miniCards.forEach(card => {
  card.addEventListener("click", () => {

    miniCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    if (!dinamico) return;

    // Animación salida
    dinamico.style.opacity = "0";
    dinamico.style.transform = "translateY(20px)";

    setTimeout(() => {
      dinamico.querySelector("h3").textContent = card.dataset.title;
      dinamico.querySelector("p").textContent  = card.dataset.text;

      dinamico.style.opacity = "1";
      dinamico.style.transform = "translateY(0)";
    }, 200);

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
