/* Website 2027 - materias por año: sin accesos a Firebase ni servicios externos. */
(() => {
  "use strict";
  const holder = document.getElementById("plan-year-tabs");
  const popup = document.getElementById("plan-year-panel");
  const data = window.EETP_CURRICULUM;
  if (!holder || !popup || !Array.isArray(data)) return;

  const touchLayout = () =>
    window.matchMedia("(max-width:900px), (hover:none)").matches;
  const fineHover = () =>
    !touchLayout() &&
    window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  let opened = null;
  const buttons = [];
  const yearLabel = (n) => `${n}° año`;
  function hide() {
    opened = null;
    popup.hidden = true;
    popup.classList.remove("is-above");
    buttons.forEach((b) => b.setAttribute("aria-expanded", "false"));
  }
  function place(button) {
    if (touchLayout()) {
      popup.classList.remove("is-above");
      popup.style.removeProperty("--year-panel-left");
      popup.style.removeProperty("--year-panel-height");
      return;
    }
    popup.style.removeProperty("--year-panel-height");
    popup.style.setProperty("--year-panel-left", "0px");
    popup.classList.remove("is-above");
    const r = holder.getBoundingClientRect(),
      b = button.getBoundingClientRect();
    const w = popup.getBoundingClientRect().width;
    const left = Math.max(
      16,
      Math.min(window.innerWidth - w - 16, b.left + b.width / 2 - w / 2),
    );
    popup.style.setProperty(
      "--year-panel-left",
      `${Math.round(left - r.left)}px`,
    );
    const below = Math.max(0, window.innerHeight - r.bottom - 14);
    const above = Math.max(0, r.top - 104); // deja visible el encabezado fijo
    const needed = Math.min(popup.scrollHeight, 510);
    const useAbove = below < needed && above > below;
    popup.classList.toggle("is-above", useAbove);
    const available = useAbove ? above : below;
    popup.style.setProperty(
      "--year-panel-height",
      `${Math.max(100, Math.min(510, available))}px`,
    );
  }
  function open(y, button) {
    const year = data.find((e) => e.number === y);
    if (!year) return;
    popup.replaceChildren();
    const heading = document.createElement("div");
    heading.className = "plan-year-heading";
    const h = document.createElement("h3");
    h.textContent = yearLabel(y);
    heading.append(h);
    const count = document.createElement("p");
    count.className = "plan-year-count";
    count.textContent =
      y <= 2
        ? `${year.items.length} espacios curriculares · Formación general`
        : `${year.items.length} espacios curriculares`;
    const ul = document.createElement("ul");
    ul.className = "subjects";
    ul.style.setProperty(
      "--plan-subject-rows",
      String(Math.ceil(year.items.length / 2)),
    );
    year.items.forEach((item) => {
      const li = document.createElement("li");
      li.className =
        y <= 2
          ? "general"
          : ["general", "tecnica", "taller"].includes(item.group)
            ? item.group
            : "general";
      li.textContent = item.name;
      ul.append(li);
    });
    popup.append(heading, count, ul);
    popup.hidden = false;
    opened = y;
    buttons.forEach((b) =>
      b.setAttribute("aria-expanded", String(Number(b.dataset.year) === y)),
    );
    place(button);
  }

  data.forEach((year) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "plan-year-button";
    button.dataset.year = year.number;
    button.setAttribute("aria-controls", "plan-year-panel");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-haspopup", "true");
    button.append(document.createTextNode(yearLabel(year.number)));
    const arrow = document.createElement("span");
    arrow.className = "year-arrow";
    arrow.textContent = "⌄";
    arrow.setAttribute("aria-hidden", "true");
    button.append(arrow);
    button.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse" && fineHover()) open(year.number, button);
    });
    button.addEventListener("focus", () => {
      if (fineHover()) open(year.number, button);
    });
    button.addEventListener("click", () => {
      if (opened === year.number) {
        hide();
        return;
      }
      open(year.number, button);
      if (touchLayout()) {
        requestAnimationFrame(() =>
          popup.scrollIntoView({
            block: "nearest",
            behavior: window.matchMedia("(prefers-reduced-motion:reduce)")
              .matches
              ? "instant"
              : "smooth",
          }),
        );
      }
    });
    buttons.push(button);
    holder.insertBefore(button, popup);
  });

  holder.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse" && fineHover()) hide();
  });
  holder.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      if (!holder.contains(document.activeElement)) hide();
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && opened !== null) {
      hide();
      if (holder.contains(document.activeElement))
        document.activeElement.blur();
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (!holder.contains(e.target)) hide();
  });
  window.addEventListener("resize", () => {
    if (opened === null) return;
    const btn = buttons.find((b) => Number(b.dataset.year) === opened);
    if (btn) place(btn);
  });
  window.addEventListener(
    "scroll",
    () => {
      if (opened !== null && !touchLayout()) {
        const btn = buttons.find((b) => Number(b.dataset.year) === opened);
        if (btn) place(btn);
      }
    },
    { passive: true },
  );
})();
