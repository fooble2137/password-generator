const lengthSlider = document.querySelector(".pass-length input");
const generateBtn = document.querySelector(".generate-btn");
const options = document.querySelectorAll(".option input");
const passwordInput = document.querySelector(".input-box input");
const passwordIndicator = document.querySelector(".pass-indicator");
const copyIcon = document.querySelector(".input-box i");

const characters = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+[]{}|;:',.<>?/~`",
};

const updatePasswordIndicator = () => {
  let score = 0;

  const length = lengthSlider.value;
  const selectedOptions = [...options].filter(
    (option) => option.checked
  ).length;

  score += selectedOptions;

  if (length >= 25) score += 6;
  else if (length >= 20) score += 5;
  else if (length >= 15) score += 4;
  else if (length >= 5) score += 3;

  let strength;

  if (score <= 3) strength = "poor";
  else if (score <= 5) strength = "weak";
  else if (score <= 7) strength = "medium";
  else if (score <= 9) strength = "good";
  else strength = "strong";

  passwordIndicator.id = strength;
};

const generatePassword = () => {
  let staticPassword = "";
  let passLength = lengthSlider.value;
  let randomPassword = "";
  let excludeDuplicate = false;

  options.forEach((option) => {
    if (option.id === "lowercase" && !option.checked) {
      option.checked = true;
    }

    if (option.checked) {
      if (option.id !== "exc-duplicate" && option.id !== "spaces") {
        staticPassword += characters[option.id];
      } else if (option.id === "spaces") {
        staticPassword += ` ${staticPassword} `;
      } else {
        excludeDuplicate = true;
      }
    }
  });

  for (let i = 0; i < passLength; i++) {
    let randomChar =
      staticPassword[Math.floor(Math.random() * staticPassword.length)];
    if (excludeDuplicate) {
      if (!randomPassword.includes(randomChar) || randomChar == " ") {
        randomPassword += randomChar;
      } else {
        i--;
      }
    } else {
      randomPassword += randomChar;
    }
  }

  passwordInput.value = randomPassword;

  updatePasswordIndicator();
};

const updateSlider = () => {
  document.querySelector(".pass-length span").innerText = lengthSlider.value;
  generatePassword();
};
updateSlider();

lengthSlider.addEventListener("input", updateSlider);
generateBtn.addEventListener("click", generatePassword);
options.forEach((option) => {
  option.addEventListener("change", generatePassword);
});
copyIcon.addEventListener("click", () => {
  navigator.clipboard.writeText(passwordInput.value);

  copyIcon.classList = "ri-check-line";
  setTimeout(() => {
    copyIcon.classList = "ri-file-copy-line";
  }, 1500);
});
