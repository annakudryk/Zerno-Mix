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

  const PRICE_BY_WEIGHT = {
    250: 200,
    500: 380,
    1000: 720,
  };
  const ROAST_LABELS = {
    light: "Світле",
    medium: "Середнє",
    dark: "Темне",
  };
  const formatCurrency = new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  });

  function displayCurrency(amount) {
    return (
      formatCurrency.format(amount).replace(/[\u00a0\u202f]/g, " ") + " грн"
    );
  }

  function showQuantityError() {
    quantityError.textContent = "Введіть кількість від 1 до 20";
    quantityError.classList.remove("hidden");
    quantityInput.classList.add("!border-[#B3261E]");
    quantityInput.setAttribute("aria-invalid", "true");
    totalPrice.textContent = "—";
    breakdown.textContent = "";
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
    if (!Object.prototype.hasOwnProperty.call(PRICE_BY_WEIGHT, weight)) {
      totalPrice.textContent = "—";
      breakdown.textContent = "";
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
      return;
    }

    const unitPrice = PRICE_BY_WEIGHT[weight];
    const packsTotal = unitPrice * quantity;
    const aromaSelected =
      aromaCheckbox &&
      aromaCheckbox.isConnected &&
      aromaCheckbox.checked;
    const giftSelected =
      giftCheckbox && giftCheckbox.isConnected && giftCheckbox.checked;
    const aromaTotal = aromaSelected ? 30 * quantity : 0;
    const giftTotal = giftSelected ? 50 : 0;
    const total = packsTotal + aromaTotal + giftTotal;

    if (
      !Number.isFinite(total) ||
      packsTotal < 0 ||
      aromaTotal < 0 ||
      giftTotal < 0
    ) {
      totalPrice.textContent = "—";
      breakdown.textContent = "";
      return;
    }

    clearQuantityError();
    const weightLabel = selectedWeight.textContent.trim();
    summary.textContent = [
      weightLabel,
      roastLabel,
      selectedGrind.textContent.trim(),
      "×" + quantity,
    ]
      .filter(Boolean)
      .join(" · ");
    totalPrice.textContent = displayCurrency(total);
    breakdown.textContent = "";
    appendBreakdownRow(
      "Вартість пачок (" + quantity + " × " + weightLabel + ")",
      packsTotal,
    );
    appendBreakdownRow("Ароматизатор", aromaTotal);
    appendBreakdownRow("Подарункове пакування", giftTotal);
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
