const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REGEX_PHONE = /^\+380\d{9}$/;

const feedbackForm = document.getElementById("feedbackForm");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const messageInput = document.getElementById("message");
const agreementInput = document.getElementById("agreement");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const messageError = document.getElementById("messageError");
const agreementError = document.getElementById("agreementError");
const successModal = document.getElementById("successModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const submitButton = feedbackForm.querySelector('button[type="submit"]');

const fields = [
  { input: usernameInput, error: nameError, validate: validateName },
  { input: emailInput, error: emailError, validate: validateEmail },
  { input: phoneInput, error: phoneError, validate: validatePhone },
  { input: messageInput, error: messageError, validate: validateMessage },
  { input: agreementInput, error: agreementError, validate: validateAgreement },
];
const touchedFields = new Set();
let isModalOpen = false;

const BORDER_CLASSES = [
  "!border-[#6B5446]",
  "!border-[#B3261E]",
  "!border-[#2F6B40]",
  "border-[#6B5446]",
  "border-[#B3261E]",
  "border-[#2F6B40]",
];

// Оновлює рамку лише для текстових полів, не змінюючи рамку чекбокса.
function setBorderClass(input, borderClass) {
  if (input.type === "checkbox") {
    return;
  }

  input.classList.remove(...BORDER_CLASSES);
  input.classList.add(borderClass);
}

// Скидає повідомлення про помилку та повертає звичайний стан поля.
function clearError(input, errorEl) {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
  input.setAttribute("aria-invalid", "false");
  setBorderClass(input, "!border-[#6B5446]");
}

// Показує повідомлення та позначає поле як невалідне.
function showError(input, errorEl, message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  input.setAttribute("aria-invalid", "true");
  setBorderClass(input, "!border-[#B3261E]");
}

// Прибирає помилку та позначає валідне текстове поле зеленою рамкою.
function showSuccess(input, errorEl) {
  clearError(input, errorEl);
  setBorderClass(input, "!border-[#2F6B40]");
}

function validateName() {
  if (usernameInput.value.trim().length < 2) {
    showError(
      usernameInput,
      nameError,
      "Ім'я повинно містити не менше 2 символів.",
    );
    return false;
  }

  showSuccess(usernameInput, nameError);
  return true;
}

function validateEmail() {
  if (!REGEX_EMAIL.test(emailInput.value)) {
    showError(
      emailInput,
      emailError,
      "Введіть коректну електронну адресу (наприклад: user@mail.com).",
    );
    return false;
  }

  showSuccess(emailInput, emailError);
  return true;
}

function validatePhone() {
  if (!REGEX_PHONE.test(phoneInput.value)) {
    showError(
      phoneInput,
      phoneError,
      "Формат має бути строго українським: +380XXXXXXXXX.",
    );
    return false;
  }

  showSuccess(phoneInput, phoneError);
  return true;
}

function validateMessage() {
  if (messageInput.value.trim().length < 10) {
    showError(
      messageInput,
      messageError,
      "Повідомлення має містити не менше 10 символів.",
    );
    return false;
  }

  showSuccess(messageInput, messageError);
  return true;
}

function validateAgreement() {
  if (!agreementInput.checked) {
    showError(
      agreementInput,
      agreementError,
      "Потрібна згода з політикою конфіденційності.",
    );
    return false;
  }

  showSuccess(agreementInput, agreementError);
  return true;
}

// Залишає лише цифри та плюс на початку, а для стандартних префіксів додає +380.
function normalizePhone(value, addCountryPrefix) {
  const hasLeadingPlus = value.startsWith("+");
  let digits = value.replace(/\D/g, "");
  let includePlus = hasLeadingPlus;

  if (addCountryPrefix && digits.startsWith("0")) {
    digits = `380${digits.slice(1)}`;
    includePlus = true;
  } else if (addCountryPrefix && digits.startsWith("380")) {
    includePlus = true;
  }

  digits = digits.slice(0, 12);
  return `${includePlus ? "+" : ""}${digits}`;
}

// Нормалізує введення, зберігаючи позицію курсора та не заважаючи видаленню.
function updatePhoneValue(value, caretPosition, isDeletion) {
  const addCountryPrefix = !isDeletion;
  const normalizedValue = normalizePhone(value, addCountryPrefix);
  const normalizedCaret = normalizePhone(
    value.slice(0, caretPosition),
    addCountryPrefix,
  ).length;

  phoneInput.value = normalizedValue;
  phoneInput.setSelectionRange(
    Math.min(normalizedCaret, normalizedValue.length),
    Math.min(normalizedCaret, normalizedValue.length),
  );
}

// Прибирає сторонні символи при введенні та лишає неповний номер видимим для перевірки.
function handlePhoneInput(event) {
  const caretPosition = phoneInput.selectionStart;
  const inputType = typeof event.inputType === "string" ? event.inputType : "";
  const isDeletion = inputType.startsWith("delete");

  updatePhoneValue(phoneInput.value, caretPosition, isDeletion);
  validateTouchedField({ input: phoneInput, validate: validatePhone });
}

// Вставляє очищений текст у поточне виділення та нормалізує номер.
function handlePhonePaste(event) {
  const pastedText = event.clipboardData.getData("text");
  const selectionStart = phoneInput.selectionStart;
  const selectionEnd = phoneInput.selectionEnd;
  const value =
    phoneInput.value.slice(0, selectionStart) +
    pastedText +
    phoneInput.value.slice(selectionEnd);
  const caretPosition = selectionStart + pastedText.length;

  event.preventDefault();
  updatePhoneValue(value, caretPosition, false);
  touchedFields.add(phoneInput);
  validateTouchedField({ input: phoneInput, validate: validatePhone });
}

// Перевіряє поле лише після першої взаємодії з ним.
function validateTouchedField(field) {
  if (touchedFields.has(field.input)) {
    field.validate();
  }
}

// Після втрати фокуса поле вважається touched і перевіряється.
function handleBlur(field) {
  touchedFields.add(field.input);
  field.validate();
}

// Під'єднує потрібні події для кожного поля.
function initializeFieldEvents() {
  fields.forEach((field) => {
    if (field.input === agreementInput) {
      field.input.addEventListener("change", () => {
        touchedFields.add(field.input);
        field.validate();
      });
      return;
    }

    field.input.addEventListener("blur", () => handleBlur(field));

    if (field.input === phoneInput) {
      field.input.addEventListener("input", handlePhoneInput);
      field.input.addEventListener("paste", handlePhonePaste);
      return;
    }

    field.input.addEventListener("input", () => validateTouchedField(field));
  });
}

// Очищає значення та візуальний стан форми перед показом підтвердження.
function resetFormState() {
  feedbackForm.reset();
  fields.forEach(({ input, error }) => clearError(input, error));
  feedbackForm.querySelectorAll("input, textarea").forEach((input) => {
    input.setAttribute("aria-invalid", "false");
  });
  touchedFields.clear();
}

// Показує модальне вікно після скидання форми та блокує прокручування сторінки.
function openSuccessModal() {
  if (isModalOpen) {
    return;
  }

  resetFormState();
  isModalOpen = true;
  successModal.classList.remove("hidden");
  successModal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
  closeModalBtn.focus();
}

// Закриває вікно, повертає прокручування та фокус на кнопку надсилання.
function closeSuccessModal() {
  if (!isModalOpen) {
    return;
  }

  isModalOpen = false;
  successModal.classList.remove("flex");
  successModal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
  submitButton.focus();
}

// Не дозволяє Tab-переходам вийти за межі модального вікна.
function trapModalFocus(event) {
  const focusableElements = successModal.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!firstElement) {
    event.preventDefault();
    successModal.querySelector('[role="dialog"]').focus();
    return;
  }

  if (!successModal.contains(document.activeElement)) {
    event.preventDefault();
    firstElement.focus();
  } else if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

closeModalBtn.addEventListener("click", closeSuccessModal);

successModal.addEventListener("click", (event) => {
  if (event.target === successModal) {
    closeSuccessModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (!isModalOpen) {
    return;
  }

  if (event.key === "Escape") {
    closeSuccessModal();
  } else if (event.key === "Tab") {
    trapModalFocus(event);
  }
});

feedbackForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isModalOpen) {
    return;
  }

  // Позначаємо всі поля touched і перевіряємо кожне перед пошуком помилки.
  const validationResults = fields.map((field) => {
    touchedFields.add(field.input);
    return { input: field.input, isValid: field.validate() };
  });
  const firstInvalidField = validationResults.find(({ isValid }) => !isValid);

  if (firstInvalidField) {
    firstInvalidField.input.focus();
    return;
  }

  openSuccessModal();
});

initializeFieldEvents();