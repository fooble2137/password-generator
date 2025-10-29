const lengthSlider = document.querySelector("#length");
const generateBtn = document.querySelector("#generate-btn");
const copyBtn = document.querySelector("#copy-btn");
const options = document.querySelectorAll("#types input[type='checkbox']");
const passwordInput = document.querySelector("#password");
const checkPasswordInput = document.querySelector("#check-password");
const strengthIndicators = document.querySelectorAll(".strength-indicator");
const strengthTexts = document.querySelectorAll("#strength");
const indicatorFills = document.querySelectorAll(".indicator-fill");
const lengthLabel = document.querySelector("label[for='length']");

const characters = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+[]{}|;:',.<>?/~`",
  whitespace: " ",
};

const calculatePasswordStrength = (password) => {
  if (!password || password.length === 0) {
    return { score: 0 };
  }

  let score = 0;

  // Length scoring (0-35 points) - much stricter
  const length = password.length;
  if (length >= 16) {
    score += 35;
  } else if (length >= 14) {
    score += 30;
  } else if (length >= 12) {
    score += 25;
  } else if (length >= 10) {
    score += 18;
  } else if (length >= 8) {
    score += 12;
  } else if (length >= 6) {
    score += 6;
  } else {
    score += 2;
  }

  // Character variety scoring (0-40 points)
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\[\]{}|;:',.<>?/~`-]/.test(password);

  let charTypes = 0;
  if (hasLowercase) {
    score += 5;
    charTypes++;
  }
  if (hasUppercase) {
    score += 10;
    charTypes++;
  }
  if (hasNumbers) {
    score += 10;
    charTypes++;
  }
  if (hasSymbols) {
    score += 15;
    charTypes++;
  }

  // Bonus for using multiple character types - but only if length is decent
  if (charTypes >= 4 && length >= 10) {
    score += 15;
  } else if (charTypes >= 3 && length >= 8) {
    score += 10;
  } else if (charTypes >= 2 && length >= 6) {
    score += 5;
  }

  // Uniqueness bonus (0-10 points)
  const uniqueChars = new Set(password).size;
  const uniquenessRatio = uniqueChars / password.length;
  if (uniquenessRatio >= 0.9 && length >= 8) {
    score += 10;
  } else if (uniquenessRatio >= 0.7 && length >= 6) {
    score += 5;
  }

  // Penalties for common patterns
  const hasRepeatingChars = /(.)\1{2,}/.test(password);
  const hasSequentialChars =
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password.toLowerCase()
    );
  const hasKeyboardPatterns =
    /(qwerty|asdf|zxcv|1234|password|admin|letmein)/i.test(
      password.toLowerCase()
    );

  if (hasRepeatingChars) {
    score -= 15;
  }
  if (hasSequentialChars) {
    score -= 10;
  }
  if (hasKeyboardPatterns) {
    score -= 25;
  }

  // Ensure score is within bounds (0-100)
  score = Math.max(0, Math.min(100, score));

  return { score };
};

const updatePasswordIndicator = (password = "", tabIndex = 0) => {
  const strengthIndicator = strengthIndicators[tabIndex];
  const strengthText = strengthTexts[tabIndex];
  const indicatorFill = indicatorFills[tabIndex];

  strengthIndicator.className = "input-box strength-indicator";

  if (!password) {
    if (tabIndex === 1) {
      strengthText.textContent = "";
      indicatorFill.style.width = "0%";
    } else {
      strengthText.textContent = "Weak";
      indicatorFill.style.width = "25%";
      strengthIndicator.classList.add("weak");
    }
    return;
  }

  const { score } = calculatePasswordStrength(password);

  let strength, message, widthPercent;

  if (score >= 75) {
    strength = "strong";
    message = "Strong";
    widthPercent = 100;
  } else if (score >= 50) {
    strength = "good";
    message = "Good";
    widthPercent = 75;
  } else if (score >= 25) {
    strength = "fair";
    message = "Fair";
    widthPercent = 50;
  } else {
    strength = "weak";
    message = "Weak";
    widthPercent = 25;
  }

  strengthIndicator.classList.add(strength);
  strengthText.textContent = message;
  indicatorFill.style.width = `${widthPercent}%`;
};

const generatePassword = () => {
  let staticPassword = "";
  let passLength = lengthSlider.value;
  let randomPassword = "";
  let excludeDuplicate = false;
  let includeWhitespace = false;

  let hasAnyTypeSelected = false;

  options.forEach((option) => {
    if (option.checked) {
      const optionValue = option.value;

      if (optionValue === "exclude-duplicates") {
        excludeDuplicate = true;
      } else if (optionValue === "whitespace") {
        includeWhitespace = true;
      } else if (characters[optionValue]) {
        staticPassword += characters[optionValue];
        hasAnyTypeSelected = true;
      }
    }
  });

  if (!hasAnyTypeSelected) {
    staticPassword = characters.lowercase;
  }

  if (includeWhitespace) {
    staticPassword += characters.whitespace;
  }

  const maxLength = excludeDuplicate ? staticPassword.length : passLength;
  const actualLength = Math.min(passLength, maxLength);

  for (let i = 0; i < actualLength; i++) {
    let randomChar =
      staticPassword[Math.floor(Math.random() * staticPassword.length)];
    if (excludeDuplicate) {
      if (!randomPassword.includes(randomChar)) {
        randomPassword += randomChar;
      } else {
        if (randomPassword.length >= staticPassword.length) {
          break;
        }
        i--;
      }
    } else {
      randomPassword += randomChar;
    }
  }

  passwordInput.value = randomPassword;

  updatePasswordIndicator(randomPassword, 0);
};

const updateSlider = () => {
  lengthLabel.textContent = `Password Length: ${lengthSlider.value}`;
  generatePassword();
};

updateSlider();

lengthSlider.addEventListener("input", updateSlider);
generateBtn.addEventListener("click", generatePassword);

checkPasswordInput.addEventListener("input", (e) => {
  updatePasswordIndicator(e.target.value, 1);
});

options.forEach((option) => {
  option.addEventListener("change", generatePassword);
});

copyBtn.addEventListener("click", () => {
  if (navigator.clipboard === undefined) {
    alert("Your browser does not support the Clipboard API.");
    return;
  }

  const password = passwordInput.value;

  if (!password) {
    return;
  }

  navigator.clipboard
    .writeText(password)
    .then(() => {
      const icon = copyBtn.querySelector("i");
      const originalClass = icon.className;
      icon.className = "ri-check-line";

      setTimeout(() => {
        icon.className = originalClass;
      }, 1500);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
    });
});
