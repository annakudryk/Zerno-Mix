(function () {
  const arabicaRange = document.getElementById("arabica-range");
  const robustaRange = document.getElementById("robusta-range");
  const arabicaPercent = document.getElementById("arabica-percent");
  const robustaPercent = document.getElementById("robusta-percent");
  const arabicaPrice = document.getElementById("arabica-price-gram");
  const robustaPrice = document.getElementById("robusta-price-gram");
  const massRadios = document.querySelectorAll('input[name="mix-mass"]');
  const orderButton = document.getElementById("mix-order");

  const ARABICA_PRICE_PER_GRAM = 1.0;
  const ROBUSTA_PRICE_PER_GRAM = 0.6;
  const VALID_MASSES = [250, 500, 1000];
  const fixedPriceFormat = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  let currentSelection = null;
  let lastOrderClickAt = 0;

  function setText(element, text) {
    if (element && element.isConnected) {
      element.textContent = text;
    }
  }

  function normalizePercentage(range) {
    const value = Number(range.value);
    if (!Number.isFinite(value)) {
      return 0;
    }

    const steppedValue = Math.round(value / 5) * 5;
    return Math.min(100, Math.max(0, steppedValue));
  }

  function updateOrderButton() {
    if (!orderButton || !orderButton.isConnected) {
      return;
    }

    const selectionIsValid =
      currentSelection !== null &&
      currentSelection.arabica + currentSelection.robusta === 100 &&
      VALID_MASSES.indexOf(currentSelection.mass) !== -1;
    orderButton.disabled = !selectionIsValid;
    orderButton.setAttribute("aria-disabled", String(!selectionIsValid));
  }

  function update(activeRange) {
    if (
      !arabicaRange ||
      !arabicaRange.isConnected ||
      !robustaRange ||
      !robustaRange.isConnected
    ) {
      currentSelection = null;
      updateOrderButton();
      return;
    }

    const activeIsRobusta = activeRange === robustaRange;
    const activePercentage = normalizePercentage(
      activeIsRobusta ? robustaRange : arabicaRange,
    );
    const arabicaPercentage = activeIsRobusta
      ? 100 - activePercentage
      : activePercentage;
    const robustaPercentage = 100 - arabicaPercentage;

    arabicaRange.value = String(arabicaPercentage);
    robustaRange.value = String(robustaPercentage);
    arabicaRange.setAttribute(
      "aria-valuetext",
      "Арабіка " + arabicaPercentage + " відсотків",
    );
    robustaRange.setAttribute(
      "aria-valuetext",
      "Робуста " + robustaPercentage + " відсотків",
    );

    setText(arabicaPercent, arabicaPercentage + "%");
    setText(robustaPercent, robustaPercentage + "%");
    setText(
      arabicaPrice,
      "Арабіка: " +
        fixedPriceFormat.format(ARABICA_PRICE_PER_GRAM) +
        " грн за 1 грам",
    );
    setText(
      robustaPrice,
      "Робуста: " +
        fixedPriceFormat.format(ROBUSTA_PRICE_PER_GRAM) +
        " грн за 1 грам",
    );

    let selectedMass = null;
    massRadios.forEach(function (radio) {
      if (radio.isConnected && radio.checked) {
        const mass = Number(radio.value);
        if (VALID_MASSES.indexOf(mass) !== -1) {
          selectedMass = mass;
        }
      }
    });

    const mixPrice =
      (arabicaPercentage / 100) * ARABICA_PRICE_PER_GRAM +
      (robustaPercentage / 100) * ROBUSTA_PRICE_PER_GRAM;
    const roundedMixPrice = Math.round(mixPrice * 100) / 100;

    if (!Number.isFinite(roundedMixPrice) || roundedMixPrice < 0) {
      currentSelection = null;
      updateOrderButton();
      return;
    }

    currentSelection = {
      arabica: arabicaPercentage,
      robusta: robustaPercentage,
      mass: selectedMass,
      pricePerGram: roundedMixPrice,
    };
    updateOrderButton();
  }

  function orderMix() {
    if (!orderButton || !orderButton.isConnected || orderButton.disabled) {
      return;
    }

    const now = Date.now();
    if (now - lastOrderClickAt < 500 || !currentSelection) {
      return;
    }
    lastOrderClickAt = now;

    document.dispatchEvent(
      new CustomEvent("mix:selected", {
        detail: {
          arabica: currentSelection.arabica,
          robusta: currentSelection.robusta,
          mass: currentSelection.mass,
          pricePerGram: currentSelection.pricePerGram,
        },
      }),
    );

    const builder = document.getElementById("mix-builder");
    if (!builder || !builder.isConnected) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof builder.scrollIntoView === "function") {
      builder.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    const quantityInput = builder.querySelector("#coffee-qty");
    if (quantityInput && quantityInput.isConnected) {
      quantityInput.focus({ preventScroll: true });
    }
  }

  if (arabicaRange && arabicaRange.isConnected) {
    arabicaRange.addEventListener("input", function () {
      update(arabicaRange);
    });
  }
  if (robustaRange && robustaRange.isConnected) {
    robustaRange.addEventListener("input", function () {
      update(robustaRange);
    });
  }
  massRadios.forEach(function (radio) {
    if (radio.isConnected) {
      radio.addEventListener("change", function () {
        update(arabicaRange);
      });
    }
  });
  if (orderButton && orderButton.isConnected) {
    orderButton.addEventListener("click", orderMix);
  }

  update(arabicaRange);
})();
