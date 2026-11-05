(() => {
  "use strict";
  const $ = (q, scope = document) => scope.querySelector(q),
    $$ = (q, scope = document) => [...scope.querySelectorAll(q)];
  const menu = $("#mobile-menu"),
    nav = $("#nav");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    $$("a", nav).forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
      }),
    );
  }
  $$("[data-year-now]").forEach(
    (x) => (x.textContent = String(new Date().getFullYear())),
  );
  const top = $("#go-top");
  if (top) {
    const toggle = () => top.classList.toggle("show", scrollY > 400);
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    top.addEventListener("click", () =>
      scrollTo({
        top: 0,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      }),
    );
  }
  const wa = $("#whatsapp-demo"),
    waDialog = $("#whatsapp-dialog");
  if (wa && waDialog) {
    wa.addEventListener("click", () => waDialog.showModal());
    $$("[data-close-wa]").forEach((el) =>
      el.addEventListener("click", () => waDialog.close()),
    );
    waDialog.addEventListener("click", (e) => {
      if (e.target === waDialog) waDialog.close();
    });
  }
  const lightbox = $("#gallery-lightbox");
  if (lightbox) {
    $$("[data-full-image]").forEach((el) =>
      el.addEventListener("click", () => {
        $("#lightbox-image").src = el.dataset.fullImage;
        $("#lightbox-caption").textContent = el.dataset.caption || "";
        lightbox.showModal();
      }),
    );
    $("#close-lightbox")?.addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.close();
    });
  }
  const yearTabs = $("#year-tabs");
  if (yearTabs && window.EETP_CURRICULUM) {
    const names = ["1° año", "2° año", "3° año", "4° año", "5° año", "6° año"];
    const panel = $("#year-panel");
    let selected = 1;
    function render() {
      yearTabs.innerHTML = "";
      for (const y of window.EETP_CURRICULUM) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = names[y.number - 1];
        b.setAttribute("aria-pressed", String(selected === y.number));
        b.addEventListener("click", () => {
          selected = y.number;
          render();
        });
        yearTabs.append(b);
      }
      const y = window.EETP_CURRICULUM.find((x) => x.number === selected);
      const ul = y.items
        .map((it) => `<li class="${it.group}">${escapeHTML(it.name)}</li>`)
        .join("");
      panel.innerHTML = `<div class="study-head"><div><div class="eyebrow">Trayectoria formativa</div><h2>${names[selected - 1]}</h2><p class="muted">${y.items.length} espacios o talleres listados en el plan actual.</p></div><div class="year-number">${selected}°</div></div><ul class="subjects">${ul}</ul>`;
    }
    render();
  }
  function escapeHTML(v) {
    return String(v).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  const cal = $("#calendar-grid");
  if (cal && cal.dataset.source !== "real") {
    const reference = new Date();
    let cursor = new Date(reference.getFullYear(), reference.getMonth(), 1),
      selectedDay = null;
    const examples = [
      {
        date: "2026-11-10",
        title: "Actividad institucional (ejemplo)",
        type: "Muestra de evento",
      },
      {
        date: "2026-11-18",
        title: "Reunión informativa (ejemplo)",
        type: "Muestra de evento",
      },
      {
        date: "2026-11-24",
        title: "Proyecto escolar (ejemplo)",
        type: "Muestra de evento",
      },
      {
        date: "2026-12-03",
        title: "Jornada educativa (ejemplo)",
        type: "Muestra de evento",
      },
    ];
    const key = (y, m, d) =>
      `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const monthTitle = $("#calendar-title"),
      side = $("#calendar-events"),
      detail = $("#calendar-detail");
    function render() {
      const y = cursor.getFullYear(),
        m = cursor.getMonth(),
        first = (new Date(y, m, 1).getDay() + 6) % 7,
        total = new Date(y, m + 1, 0).getDate();
      monthTitle.textContent = new Intl.DateTimeFormat("es-AR", {
        month: "long",
        year: "numeric",
      }).format(cursor);
      cal.innerHTML = "";
      const cells = Math.ceil((first + total) / 7) * 7;
      for (let i = 0; i < cells; i++) {
        let d = i - first + 1,
          btn = document.createElement("button");
        btn.type = "button";
        btn.className = "day-cell";
        if (d < 1 || d > total) {
          btn.classList.add("blank");
          btn.disabled = true;
          btn.setAttribute("aria-hidden", "true");
        } else {
          const matched = examples.filter((ev) => ev.date === key(y, m, d));
          btn.setAttribute(
            "aria-label",
            `${d} de ${monthTitle.textContent}${matched.length ? " · " + matched.length + " eventos de muestra" : ""}`,
          );
          btn.innerHTML = `<span class="day-n">${d}</span>${matched
            .slice(0, 1)
            .map((e) => `<span class="day-event">${escapeHTML(e.title)}</span>`)
            .join("")}`;
          if (
            y === reference.getFullYear() &&
            m === reference.getMonth() &&
            d === reference.getDate()
          )
            btn.classList.add("today");
          if (matched.length) btn.classList.add("has-event");
          if (d === selectedDay) btn.classList.add("selected");
          btn.addEventListener("click", () => {
            selectedDay = d;
            render();
          });
        }
        cal.append(btn);
      }
      const monthly = examples.filter((e) =>
        e.date.startsWith(`${y}-${String(m + 1).padStart(2, "0")}`),
      );
      side.innerHTML = monthly.length
        ? `<ul class="cal-list">${monthly.map((e) => `<li><b>${Number(e.date.slice(-2))} · ${escapeHTML(e.title)}</b><span>Evento ilustrativo · no oficial</span></li>`).join("")}</ul>`
        : '<p class="muted">Sin eventos de ejemplo para este mes. En el sitio definitivo se mostrarán las actividades cargadas por la escuela.</p>';
      if (selectedDay) {
        const dated = examples.filter((e) => e.date === key(y, m, selectedDay));
        detail.innerHTML = `<strong>${selectedDay} de ${monthTitle.textContent}</strong><p>${dated.length ? dated.map((e) => escapeHTML(e.title)).join("<br>") : "No hay eventos de ejemplo para este día."}</p>`;
      } else
        detail.innerHTML =
          "<strong>Seleccioná un día</strong><p>Acá se mostrarían los eventos reales y su descripción.</p>";
    }
    $("#calendar-prev")?.addEventListener("click", () => {
      cursor.setMonth(cursor.getMonth() - 1);
      selectedDay = null;
      render();
    });
    $("#calendar-next")?.addEventListener("click", () => {
      cursor.setMonth(cursor.getMonth() + 1);
      selectedDay = null;
      render();
    });
    $("#calendar-today")?.addEventListener("click", () => {
      cursor = new Date(reference.getFullYear(), reference.getMonth(), 1);
      selectedDay = reference.getDate();
      render();
    });
    selectedDay = reference.getDate();
    render();
  }
})();
