const lengthSlider = document.querySelector(".pass-length input");
const generateBtn = document.querySelector(".generate-btn");
const options = document.querySelectorAll(".option input");
const passwordInput = document.querySelector(".input-box input");
const passwordIndicator = document.querySelector(".pass-indicator");
const indicatorText = document.querySelector(".indicator-text");
const copyIcon = document.querySelector(".input-box i");

const characters = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+[]{}|;:',.<>?/~`",
};

const calculatePasswordStrength = (password) => {
  let score = 0;
  let feedback = [];

  // Length scoring - more detailed
  if (password.length >= 16) {
    score += 25;
  } else if (password.length >= 12) {
    score += 20;
  } else if (password.length >= 8) {
    score += 15;
  } else if (password.length >= 6) {
    score += 10;
  } else {
    score += 5;
    feedback.push("Too short");
  }

  // Character variety scoring
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\[\]{}|;:',.<>?/~`]/.test(password);
  const hasSpaces = /\s/.test(password);

  let charTypes = 0;
  if (hasLowercase) {
    score += 5;
    charTypes++;
  }
  if (hasUppercase) {
    score += 5;
    charTypes++;
  }
  if (hasNumbers) {
    score += 5;
    charTypes++;
  }
  if (hasSymbols) {
    score += 10;
    charTypes++;
  }
  if (hasSpaces) {
    score += 5;
    charTypes++;
  }

  // Bonus for character variety
  if (charTypes >= 4) {
    score += 15;
  } else if (charTypes >= 3) {
    score += 10;
  } else if (charTypes >= 2) {
    score += 5;
  } else {
    feedback.push("Use more character types");
  }

  // Check for patterns and common weaknesses
  const hasRepeatingChars = /(.)\1{2,}/.test(password);
  const hasSequentialChars =
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password.toLowerCase()
    );
  const hasKeyboardPatterns = /(qwerty|asdf|zxcv|1234|password)/i.test(
    password.toLowerCase()
  );

  if (hasRepeatingChars) {
    score -= 10;
    feedback.push("Avoid repeating characters");
  }
  if (hasSequentialChars) {
    score -= 5;
    feedback.push("Avoid sequential characters");
  }
  if (hasKeyboardPatterns) {
    score -= 15;
    feedback.push("Avoid common patterns");
  }

  // Calculate entropy bonus
  const uniqueChars = new Set(password).size;
  const entropyBonus = Math.floor((uniqueChars / password.length) * 10);
  score += entropyBonus;

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return { score, feedback };
};

const updatePasswordIndicator = (password = "") => {
  // Remove all existing strength classes
  passwordIndicator.className = "pass-indicator";

  if (!password) {
    indicatorText.textContent = "Generate a password";
    return;
  }

  const { score, feedback } = calculatePasswordStrength(password);

  let strength, message;

  if (score >= 80) {
    strength = "strong";
    message = "Very Strong Password";
  } else if (score >= 60) {
    strength = "good";
    message = "Good Password";
  } else if (score >= 40) {
    strength = "fair";
    message = "Fair Password";
  } else if (score >= 20) {
    strength = "weak";
    message = "Weak Password";
  } else {
    strength = "very-weak";
    message = "Very Weak Password";
  }

  // Add main feedback if there are suggestions
  if (feedback.length > 0) {
    message += ` - ${feedback[0]}`;
  }

  passwordIndicator.classList.add(strength);
  indicatorText.textContent = message;
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
      if (!randomPassword.includes(randomChar)) {
        randomPassword += randomChar;
      } else {
        // Exit if there are no more characters left to be generated
        if (i > staticPassword.length) {
          break;
        }
        // Otherwise regenerate the current character
        i--;
      }
    } else {
      randomPassword += randomChar;
    }
  }

  passwordInput.value = randomPassword;

  updatePasswordIndicator(randomPassword);
};

const updateSlider = () => {
  document.querySelector(".pass-length span").innerText = lengthSlider.value;
  generatePassword();
};

// Initialize the password generator
updateSlider();

lengthSlider.addEventListener("input", updateSlider);
generateBtn.addEventListener("click", generatePassword);
passwordInput.addEventListener("input", (e) => {
  updatePasswordIndicator(e.target.value);
});
options.forEach((option) => {
  option.addEventListener("change", generatePassword);
});
copyIcon.addEventListener("click", () => {
  if (navigator.clipboard === undefined) {
    alert("Clipboard API is not supported in this browser.");
    return;
  }

  navigator.clipboard.writeText(passwordInput.value);

  copyIcon.classList = "ri-check-line";
  setTimeout(() => {
    copyIcon.classList = "ri-file-copy-line";
  }, 1500);
});
