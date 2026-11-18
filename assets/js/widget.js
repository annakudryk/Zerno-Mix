(function () {
  const builder = document.getElementById("mix-builder");
  if (!builder) {
    return;
  }

  const weightSelect = builder.querySelector("#coffee-weight");
  const quantityInput = builder.querySelector("#coffee-qty");
  const grindSelect = builder.querySelector("#coffee-grind");
  const aromaCheckbox = builder.querySelector("#addon-aroma");
  const giftCheckbox = builder.querySelector("#addon-gift");
  const summary = builder.querySelector("#summary");
  const totalPrice = builder.querySelector("#total-price");
  const breakdown = builder.querySelector("#breakdown");
  const quantityError = builder.querySelector("#error-qty");
  const roastInputs = builder.querySelectorAll('input[name="roast"]');
  const orderButton = builder.querySelector("#order-mix");
  const feedbackForm = document.getElementById("feedbackForm");
  const orderMessage = feedbackForm
    ? feedbackForm.querySelector("#message")
    : null;

  if (
    !weightSelect ||
    !quantityInput ||
    !grindSelect ||
    !summary ||
    !totalPrice ||
    !breakdown ||
    !quantityError
  ) {
    return;
  }

  const VALID_MIX_MASSES = [250, 500, 1000];
  const ROAST_LABELS = {
    light: "Світле",
    medium: "Середнє",
    dark: "Темне",
  };
  const formatCurrency = new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  });
  let selectedMix = {
    arabica: 70,
    robusta: 30,
    pricePerGram: 0.88,
  };
  let calculatedPriceText = null;
  let lastOrderText = "";
  let baseSummaryText = "";
  let aromaSelected = false;
  let giftSelected = false;

  function displayCurrency(amount) {
    return (
      formatCurrency.format(amount).replace(/[\u00a0\u202f]/g, " ") + " грн"
    );
  }

  function hasOrderDestination() {
    return Boolean(
      feedbackForm &&
        feedbackForm.isConnected &&
        orderMessage &&
        orderMessage.isConnected
    );
  }

  function updateOrderControl() {
    const destinationAvailable = hasOrderDestination();
    const canOrder =
      calculatedPriceText !== null &&
      orderButton &&
      orderButton.isConnected &&
      summary.isConnected &&
      destinationAvailable;

    if (orderButton && orderButton.isConnected) {
      orderButton.disabled = !canOrder;
      orderButton.setAttribute("aria-disabled", String(!canOrder));
    }
  }

  function clearCalculatedPrice() {
    calculatedPriceText = null;
    updateOrderControl();
  }

  function showQuantityError() {
    quantityError.textContent = "Введіть кількість від 1 до 20";
    quantityError.classList.remove("hidden");
    quantityInput.classList.add("!border-[#B3261E]");
    quantityInput.setAttribute("aria-invalid", "true");
    totalPrice.textContent = "—";
    breakdown.textContent = "";
    clearCalculatedPrice();
  }

  function clearQuantityError() {
    quantityError.textContent = "";
    quantityError.classList.add("hidden");
    quantityInput.classList.remove("!border-[#B3261E]");
    quantityInput.setAttribute("aria-invalid", "false");
  }

  function appendBreakdownRow(label, amount) {
    const row = document.createElement("p");
    row.className = "flex flex-wrap justify-between gap-2";
    row.textContent = label + " — " + displayCurrency(amount);
    breakdown.append(row);
  }

  function updateSummary() {
    if (
      !builder.isConnected ||
      !weightSelect.isConnected ||
      !quantityInput.isConnected ||
      !grindSelect.isConnected ||
      !summary.isConnected ||
      !totalPrice.isConnected ||
      !breakdown.isConnected ||
      !quantityError.isConnected
    ) {
      clearCalculatedPrice();
      return;
    }

    const rawQuantity = quantityInput.value.trim();
    const quantity = quantityInput.valueAsNumber;

    if (
      rawQuantity === "" ||
      quantityInput.validity.badInput ||
      !Number.isFinite(quantity) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      showQuantityError();
      return;
    }

    const weight = weightSelect.isConnected ? weightSelect.value : "";
    const mass = Number(weight);
    if (
      !Number.isInteger(mass) ||
      VALID_MIX_MASSES.indexOf(mass) === -1 ||
      !selectedMix
    ) {
      totalPrice.textContent = "—";
      breakdown.textContent = "";
      clearCalculatedPrice();
      return;
    }

    const selectedRoast = builder.querySelector(
      'input[name="roast"]:checked',
    );
    const roastLabel =
      selectedRoast &&
      selectedRoast.isConnected &&
      Object.prototype.hasOwnProperty.call(
        ROAST_LABELS,
        selectedRoast.value,
      ) &&
      ROAST_LABELS[selectedRoast.value];
    const selectedGrind = grindSelect.isConnected
      ? grindSelect.selectedOptions[0]
      : null;
    const selectedWeight = weightSelect.isConnected
      ? weightSelect.selectedOptions[0]
      : null;

    if (!selectedGrind || !selectedWeight) {
      totalPrice.textContent = "—";
      breakdown.textContent = "";
      clearCalculatedPrice();
      return;
    }

    const packPrice = mass * selectedMix.pricePerGram;
    const packsTotal = packPrice * quantity;
    aromaSelected = Boolean(
      aromaCheckbox &&
        aromaCheckbox.isConnected &&
        aromaCheckbox.checked,
    );
    giftSelected = Boolean(
      giftCheckbox && giftCheckbox.isConnected && giftCheckbox.checked,
    );
    const aromaTotal = aromaSelected ? 30 * quantity : 0;
    const giftTotal = giftSelected ? 50 : 0;
    const total =
      (packPrice + (aromaSelected ? 30 : 0)) * quantity + giftTotal;
    const roundedTotal = Math.round(total * 100) / 100;

    if (
      !Number.isFinite(packPrice) ||
      !Number.isFinite(packsTotal) ||
      !Number.isFinite(roundedTotal) ||
      packPrice < 0 ||
      packsTotal < 0 ||
      aromaTotal < 0 ||
      giftTotal < 0
    ) {
      totalPrice.textContent = "—";
      breakdown.textContent = "";
      clearCalculatedPrice();
      return;
    }

    clearQuantityError();
    const weightLabel = selectedWeight.textContent.trim();
    baseSummaryText = [
      "Арабіка " + selectedMix.arabica + "%",
      "Робуста " + selectedMix.robusta + "%",
      weightLabel,
      roastLabel,
      selectedGrind.textContent.trim(),
      "×" + quantity,
    ]
      .filter(Boolean)
      .join(" · ");
    summary.textContent = [
      baseSummaryText,
      aromaSelected && "Ароматизатор",
      giftSelected && "Подарункове пакування",
    ]
      .filter(Boolean)
      .join(" · ");
    calculatedPriceText = displayCurrency(roundedTotal);
    totalPrice.textContent = calculatedPriceText;
    breakdown.textContent = "";
    appendBreakdownRow(
      "Вартість пачок (" + quantity + " × " + weightLabel + ")",
      packsTotal,
    );
    appendBreakdownRow("Ароматизатор", aromaTotal);
    appendBreakdownRow("Подарункове пакування", giftTotal);
    updateOrderControl();
  }

  function orderCurrentMix() {
    if (!orderButton || !orderButton.isConnected || orderButton.disabled) {
      return;
    }

    if (
      calculatedPriceText === null ||
      !hasOrderDestination() ||
      !summary.isConnected
    ) {
      updateOrderControl();
      return;
    }

    let orderText = "Хочу замовити мікс: " + baseSummaryText;
    if (aromaSelected) {
      orderText += ", ароматизатор";
    }
    if (giftSelected) {
      orderText += ", пакування";
    }
    orderText += ". Разом " + calculatedPriceText;

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
  }

  function isValidMixSelection(detail) {
    return Boolean(
      detail &&
        typeof detail === "object" &&
        Number.isInteger(detail.arabica) &&
        detail.arabica >= 0 &&
        detail.arabica <= 100 &&
        Number.isInteger(detail.robusta) &&
        detail.robusta >= 0 &&
        detail.robusta <= 100 &&
        detail.arabica + detail.robusta === 100 &&
        Number.isInteger(detail.mass) &&
        VALID_MIX_MASSES.indexOf(detail.mass) !== -1 &&
        typeof detail.pricePerGram === "number" &&
        Number.isFinite(detail.pricePerGram) &&
        detail.pricePerGram >= 0 &&
        detail.pricePerGram <= 100
    );
  }

  function handleMixSelected(event) {
    if (
      !builder.isConnected ||
      !weightSelect.isConnected ||
      !event ||
      !isValidMixSelection(event.detail)
    ) {
      return;
    }

    const massValue = String(event.detail.mass);
    const matchingOption = weightSelect.querySelector(
      'option[value="' + massValue + '"]',
    );
    if (!matchingOption || !matchingOption.isConnected) {
      return;
    }

    const nextMix = {
      arabica: event.detail.arabica,
      robusta: event.detail.robusta,
      pricePerGram: event.detail.pricePerGram,
    };
    weightSelect.value = massValue;
    if (weightSelect.value !== massValue) {
      return;
    }

    selectedMix = nextMix;
    updateSummary();
  }

  document.addEventListener("mix:selected", handleMixSelected);

  if (orderButton) {
    orderButton.addEventListener("click", orderCurrentMix);
  }
  quantityInput.addEventListener("input", updateSummary);
  quantityInput.addEventListener("change", updateSummary);
  weightSelect.addEventListener("change", updateSummary);
  grindSelect.addEventListener("change", updateSummary);
  if (aromaCheckbox) {
    aromaCheckbox.addEventListener("change", updateSummary);
  }
  if (giftCheckbox) {
    giftCheckbox.addEventListener("change", updateSummary);
  }
  roastInputs.forEach(function (roastInput) {
    roastInput.addEventListener("change", updateSummary);
  });

  updateSummary();
})();
