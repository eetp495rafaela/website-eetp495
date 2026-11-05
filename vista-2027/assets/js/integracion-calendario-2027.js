"use strict";
/**
 * EETP495 Website 2027 · Calendario escolar público (SOLO LECTURA)
 * Fuente y contrato conservados del sitio vigente:
 * GET Apps Script -> {ok:true, eventos:[{fechaInicio,fechaFin,etiqueta,titulo,descripcion}]}.
 * No usa credenciales, Firebase ni escrituras.
 * Diseño y estilos de la maqueta aprobada permanecen intactos.
 */
(() => {
  const ENDPOINT =
    "https://script.google.com/macros/s/AKfycbzRqnjl70VJosj9WHL-JGBn0hQ5COZtYQKNiYrJFfyfrdMQ_xDSJxNt0B7RUUbgW2z4iw/exec";
  const grid = document.querySelector('#calendar-grid[data-source="real"]');
  const heading = document.getElementById("calendar-title");
  const side = document.getElementById("calendar-events");
  const detail = document.getElementById("calendar-detail");
  const previous = document.getElementById("calendar-prev");
  const next = document.getElementById("calendar-next");
  const todayButton = document.getElementById("calendar-today");
  if (
    !grid ||
    !heading ||
    !side ||
    !detail ||
    !previous ||
    !next ||
    !todayButton
  )
    return;

  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();
  let selected = today.getDate();
  let events = [];
  let status = "loading";
  const longDay = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const monthLabel = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  });
  const shortDay = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  const ymd = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const parseDate = (raw) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw || ""));
    if (!match) return null;
    const y = Number(match[1]),
      m = Number(match[2]),
      d = Number(match[3]);
    const date = new Date(y, m - 1, d);
    if (
      date.getFullYear() !== y ||
      date.getMonth() !== m - 1 ||
      date.getDate() !== d
    )
      return null;
    return date;
  };
  const activeOn = (event, key) => event.startKey <= key && key <= event.endKey;
  const displayRange = (event) => {
    const start = shortDay.format(event.start);
    return event.startKey === event.endKey
      ? start
      : `${start} – ${shortDay.format(event.end)}`;
  };
  function monthEvents() {
    const start = ymd(year, month, 1);
    const end = ymd(year, month, new Date(year, month + 1, 0).getDate());
    return events.filter(
      (event) => event.startKey <= end && event.endKey >= start,
    );
  }
  function showDay(day) {
    detail.replaceChildren();
    if (!day) {
      detail.append(create("strong", "", "Seleccioná un día"));
      detail.append(
        create(
          "p",
          "",
          "Consultá las actividades que la escuela haya publicado para esa fecha.",
        ),
      );
      return;
    }
    detail.append(
      create("strong", "", longDay.format(new Date(year, month, day))),
    );
    if (status === "loading") {
      detail.append(
        create("p", "muted", "Cargando información institucional..."),
      );
      return;
    }
    if (status === "error") {
      detail.append(
        create(
          "p",
          "muted",
          "No fue posible consultar las actividades. Intentá nuevamente.",
        ),
      );
      return;
    }
    const key = ymd(year, month, day);
    const active = events.filter((event) => activeOn(event, key));
    if (!active.length) {
      detail.append(
        create("p", "muted", "No hay actividades publicadas para esta fecha."),
      );
      return;
    }
    const list = create("ul", "cal-list");
    active.forEach((event) => {
      const li = create("li");
      li.append(create("b", "", event.titulo));
      if (event.etiqueta) li.append(create("span", "", event.etiqueta));
      if (event.descripcion) li.append(create("p", "", event.descripcion));
      list.append(li);
    });
    detail.append(list);
  }
  function render() {
    const total = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const cells = Math.ceil((firstDay + total) / 7) * 7;
    heading.textContent = monthLabel.format(new Date(year, month, 1));
    grid.replaceChildren();
    for (let i = 0; i < cells; i++) {
      const d = i - firstDay + 1;
      const btn = create("button", "day-cell");
      btn.type = "button";
      if (d < 1 || d > total) {
        btn.classList.add("blank");
        btn.disabled = true;
        btn.setAttribute("aria-hidden", "true");
      } else {
        const key = ymd(year, month, d);
        const daily = events.filter((event) => activeOn(event, key));
        btn.append(create("span", "day-n", d));
        if (daily.length) {
          btn.classList.add("has-event");
          btn.append(create("span", "day-event", daily[0].titulo));
        }
        if (
          year === today.getFullYear() &&
          month === today.getMonth() &&
          d === today.getDate()
        )
          btn.classList.add("today");
        if (d === selected) btn.classList.add("selected");
        btn.setAttribute(
          "aria-label",
          `${longDay.format(new Date(year, month, d))}${daily.length ? `, ${daily.length} actividad${daily.length === 1 ? "" : "es"}` : ""}`,
        );
        btn.setAttribute("aria-pressed", String(d === selected));
        btn.addEventListener("click", () => {
          selected = d;
          render();
        });
      }
      grid.append(btn);
    }
    side.replaceChildren();
    if (status === "loading") {
      side.append(create("p", "muted", "Consultando el Calendario Escolar..."));
    } else if (status === "error") {
      side.append(
        create(
          "p",
          "muted",
          "No se pudieron cargar los eventos institucionales.",
        ),
      );
      const retry = create("button", "btn btn-outline", "Reintentar");
      retry.type = "button";
      retry.addEventListener("click", load);
      side.append(retry);
    } else {
      const list = monthEvents();
      if (!list.length)
        side.append(
          create("p", "muted", "Sin actividades publicadas para este mes."),
        );
      else {
        const ul = create("ul", "cal-list");
        list.forEach((event) => {
          const li = create("li");
          li.append(
            create("b", "", `${displayRange(event)} · ${event.titulo}`),
          );
          if (event.etiqueta) li.append(create("span", "", event.etiqueta));
          ul.append(li);
        });
        side.append(ul);
      }
    }
    showDay(selected);
  }
  function navigate(delta) {
    const target = new Date(year, month + delta, 1);
    year = target.getFullYear();
    month = target.getMonth();
    selected = null;
    render();
  }
  previous.addEventListener("click", () => navigate(-1));
  next.addEventListener("click", () => navigate(1));
  todayButton.addEventListener("click", () => {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
    selected = now.getDate();
    render();
  });
  async function load() {
    status = "loading";
    render();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (payload?.ok !== true || !Array.isArray(payload.eventos))
        throw new Error("Formato de calendario inesperado");
      events = payload.eventos
        .slice(0, 3000)
        .map((raw) => {
          const start = parseDate(raw.fechaInicio);
          const end = parseDate(raw.fechaFin);
          if (!start || !end || end < start) return null;
          const title = String(raw.titulo || "").trim();
          if (!title) return null;
          return {
            start,
            end,
            startKey: String(raw.fechaInicio),
            endKey: String(raw.fechaFin),
            titulo: title,
            etiqueta: String(raw.etiqueta || "").trim(),
            descripcion: String(raw.descripcion || "").trim(),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.startKey.localeCompare(b.startKey));
      status = "ok";
    } catch (error) {
      console.warn(
        "Calendario Escolar 2027: fallo en la consulta pública",
        error,
      );
      status = "error";
      events = [];
    } finally {
      clearTimeout(timeout);
      render();
    }
  }
  load();
})();
