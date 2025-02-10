document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const checkStrengthBtn = document.getElementById("checkStrength");
  const simulateCrackingBtn = document.getElementById("simulateCracking");
  const strengthResultDiv = document.getElementById("strengthResult");
  const crackingResultDiv = document.getElementById("crackingResult");
  const loadingIndicator = document.getElementById("loadingIndicator");

  const commonPasswords = new Set([
    "123456", "password", "123456789", "qwerty", "abc123", "password1", "123123", "admin", "letmein",
    "welcome", "monkey", "football", "iloveyou", "1234", "sunshine", "superman", "princess", "azerty", "dragon"
  ]);
  const commonPatterns = ["123", "abc", "qwe", "pass", "azerty", "motdepasse", "000", "111", "999", "2023"];
  const keyboardSequences = ["qwerty", "azerty", "123456", "abcdef", "zxcvbn", "poiuyt", "lkjhg"];

  checkStrengthBtn.addEventListener("click", checkPasswordStrength);
  simulateCrackingBtn.addEventListener("click", simulatePasswordCracking);

  function checkPasswordStrength() {
    const password = passwordInput.value;
    const errors = [];

    if (commonPasswords.has(password.toLowerCase())) {
      errors.push("Ce mot de passe est trop commun et facilement piratable.");
    }
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      errors.push("Ce mot de passe contient un motif trop simple.");
    }
    if (keyboardSequences.some(seq => password.toLowerCase().includes(seq))) {
      errors.push("Ce mot de passe contient une séquence clavier trop prévisible.");
    }
    if (/^(.)\1+$/.test(password)) {
      errors.push("Le mot de passe est constitué d'un seul caractère répété, ce qui le rend très faible.");
    }
    if (/^(.{2,4})\1+$/.test(password)) {
      errors.push("Le mot de passe contient un motif répétitif détectable.");
    }
    if (/^(..)+$/.test(password)) {
      errors.push("Le mot de passe alterne entre trop peu de caractères, ce qui le rend facile à deviner.");
    }
    if (password.length < 10) {
      errors.push("Le mot de passe doit contenir au moins 10 caractères.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une lettre minuscule.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une lettre majuscule.");
    }
    if (!/\d/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre.");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un caractère spécial.");
    }

    if (errors.length > 0) {
      displayStrengthResult(false, errors);
    } else {
      displayStrengthResult(true, ["Le mot de passe est sécurisé."]);
    }
  }

  function simulatePasswordCracking() {
    const password = passwordInput.value;
    loadingIndicator.classList.remove("hidden");
    crackingResultDiv.innerHTML = "";

    setTimeout(() => {
      const crackTime = estimateCrackTime(password);
      displayCrackingResult(crackTime);
      loadingIndicator.classList.add("hidden");
    }, 1000);
  }

  function estimateCrackTime(password) {
    if (commonPasswords.has(password.toLowerCase()) || commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      return "Instantané";
    }
    if (keyboardSequences.some(seq => password.toLowerCase().includes(seq))) {
      return "Moins d'une seconde";
    }
    if (/^(.)\1+$/.test(password)) {
      return "Moins d'une seconde";
    }
    if (/^(.{2,4})\1+$/.test(password)) {
      return "Moins d'une seconde";
    }
    if (/^(..)+$/.test(password)) {
      return "Moins d'une seconde";
    }

    let uniqueChars = new Set(password).size;
    let charSetSize = uniqueChars + 5;
    if (uniqueChars < password.length / 2) {
      charSetSize /= 3; // Réduction encore plus forte si faible diversité
    }

    let entropy = password.length * Math.log2(charSetSize);
    let offlineSpeed = 10 ** 16;
    let crackTime = Math.pow(2, entropy) / offlineSpeed;
    
    return formatTime(crackTime);
  }

  function formatTime(seconds) {
    if (seconds < 0.001) return "Instantané";
    if (seconds < 1) return "Moins d'une seconde";
    if (seconds < 60) return `${Math.round(seconds)} secondes`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} heures`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} jours`;
    return "Supérieur à 1 mois";
  }

  function displayStrengthResult(isSecure, messages) {
    strengthResultDiv.innerHTML = `<p class="${isSecure ? "success" : "error"}">${messages.join("<br>")}</p>`;
  }

  function displayCrackingResult(crackTime) {
    crackingResultDiv.innerHTML = `
      <h2>Simulation de Crackage</h2>
      <p>Temps estimé : ${crackTime}</p>
    `;
  }
});
