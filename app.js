// Переключатель темы — по умолчанию следует системной теме, с ручным оверрайдом в localStorage
// (та же логика выбора, что и в самом приложении: "по умолчанию — фирменная тёмная").
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const STORAGE_KEY = "onepay-theme";

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    // приватный режим / заблокировано — просто используем системную тему
  }

  const initial = stored || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  applyTheme(initial);

  toggle.addEventListener("click", function () {
    const isLight = root.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (err) {
      // ignore — просто не запомнится между визитами
    }
  });
})();

// Подтягивает version.json и подставляет версию/дату/ссылку на APK — см. TZ_LANDING.md §2.
// version.json лежит рядом с лендингом на том же хостинге, обновляется при каждом релизе.

(async function () {
  const downloadButtons = [document.getElementById("download-btn"), document.getElementById("download-btn-nav")];
  const versionLine = document.getElementById("version-line");
  const footerVersion = document.getElementById("footer-version");

  // Запасной вариант, если version.json ещё не выложен/недоступен — кнопка не должна
  // оставаться совсем нерабочей, просто ведёт на "стабильную" ссылку на последнюю версию
  // (см. TZ_LANDING.md §3.3).
  const FALLBACK_APK_URL = "download/onepay-latest.apk";

  downloadButtons.forEach((btn) => { if (btn) btn.href = FALLBACK_APK_URL; });

  try {
    const response = await fetch("version.json", { cache: "no-store" });
    if (!response.ok) throw new Error("version.json недоступен: " + response.status);
    const info = await response.json();

    const apkUrl = info.apk_url || FALLBACK_APK_URL;
    downloadButtons.forEach((btn) => { if (btn) btn.href = apkUrl; });

    const date = info.updated_at
      ? new Date(info.updated_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
      : null;

    const versionText = "v" + info.latest_version + (date ? " · обновлено " + date : "");
    versionLine.textContent = versionText;
    footerVersion.textContent = "v" + info.latest_version;
  } catch (err) {
    // Лендинг не должен ломаться, если version.json недоступен — просто не показываем версию.
    versionLine.textContent = "";
    footerVersion.textContent = "";
    console.warn("Не удалось загрузить version.json:", err);
  }
})();
