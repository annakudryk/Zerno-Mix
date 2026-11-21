(function () {
  const slider = document.querySelector(".mixes-swiper");
  if (!slider || !slider.isConnected) {
    return;
  }

  const feedbackForm = document.getElementById("feedbackForm");
  const orderMessage = feedbackForm
    ? feedbackForm.querySelector("#message")
    : null;
  let lastOrderText = "";

  slider.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const orderLink = target.closest('a[href="#feedbackForm"]');
    if (
      !orderLink ||
      !orderLink.isConnected ||
      !slider.contains(orderLink) ||
      !feedbackForm ||
      !feedbackForm.isConnected ||
      !orderMessage ||
      !orderMessage.isConnected
    ) {
      return;
    }

    const card = orderLink.closest("article");
    if (!card || !card.isConnected) {
      return;
    }

    const nameElement = card.querySelector("h3");
    const priceElement = card.querySelector("p.font-bold");
    const detailText = Array.from(card.querySelectorAll("p"))
      .map(function (paragraph) {
        return paragraph.textContent.trim().replace(/\s+/g, " ");
      })
      .find(function (text) {
        return /^\d+\s*г\s*·/.test(text);
      });
    const detailMatch = detailText
      ? detailText.match(/^(\d+)\s*г\s*·\s*(.+)$/)
      : null;

    if (
      !nameElement ||
      !nameElement.isConnected ||
      !priceElement ||
      !priceElement.isConnected ||
      !detailMatch
    ) {
      return;
    }

    event.preventDefault();

    const orderText =
      "Хочу замовити готовий мікс: " +
      nameElement.textContent.trim().replace(/\s+/g, " ") +
      " · " +
      detailMatch[1] +
      " грам · " +
      detailMatch[2] +
      " · ×1. Разом " +
      priceElement.textContent.trim().replace(/\s+/g, " ");
    const existingMessage = orderMessage.value;
    let updatedMessage = existingMessage;

    if (lastOrderText && existingMessage.includes(lastOrderText)) {
      const previousBlockIndex = existingMessage.indexOf(lastOrderText);
      updatedMessage =
        existingMessage.slice(0, previousBlockIndex) +
        orderText +
        existingMessage.slice(previousBlockIndex + lastOrderText.length);
    } else {
      const alreadyAdded = existingMessage
        .split(/\r?\n/)
        .some(function (line) {
          return line === orderText;
        });

      if (!alreadyAdded) {
        const separator =
          existingMessage && !/[\r\n]$/.test(existingMessage) ? "\n" : "";
        updatedMessage = existingMessage + separator + orderText;
      }
    }

    if (updatedMessage !== existingMessage) {
      orderMessage.value = updatedMessage;
    }
    lastOrderText = orderText;

    const reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof feedbackForm.scrollIntoView === "function") {
      feedbackForm.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    const requiredFields = feedbackForm.querySelectorAll(
      'input[required], textarea[required], select[required]',
    );
    let focusTarget = null;

    requiredFields.forEach(function (field) {
      if (focusTarget || !field.isConnected || field.disabled) {
        return;
      }

      const isEmpty =
        field.type === "checkbox"
          ? !field.checked
          : field.value.trim() === "";
      if (isEmpty) {
        focusTarget = field;
      }
    });

    if (!focusTarget && orderMessage.isConnected) {
      focusTarget = orderMessage;
    }
    if (focusTarget && focusTarget.isConnected) {
      focusTarget.focus({ preventScroll: true });
    }
  });
})();
