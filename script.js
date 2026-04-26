const header   = document.querySelector("header");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");
const perry    = document.getElementById("perry");
// ② Un solo listener de scroll con requestAnimationFrame
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
