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
      const { crackTime, method } = estimateCrackTime(password);
      displayCrackingResult(crackTime, method);
      loadingIndicator.classList.add("hidden");
    }, 1000);
  }

  function estimateCrackTime(password) {
    if (commonPasswords.has(password.toLowerCase()) || commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      return { crackTime: "Instantané", method: "Attaque par dictionnaire" };
    }

    let charSetSize = 0;
    if (/[a-z]/.test(password)) charSetSize += 26;
    if (/[A-Z]/.test(password)) charSetSize += 26;
    if (/\d/.test(password)) charSetSize += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) charSetSize += 32;

    let entropy = password.length * Math.log2(charSetSize);
    let offlineSpeed = 10 ** 16; // 10 quadrillions de tentatives par seconde (dernières technologies GPU)
    let crackTime = Math.pow(2, entropy) / offlineSpeed;
    let method = "Attaque hors ligne (brute force avancée)";

    if (password.length < 8) {
      return { crackTime: "Moins d'une seconde", method: "Attaque immédiate (brute force)" };
    }
    if (crackTime < 0.001) method = "Crack instantané";
    else if (crackTime < 5) method = "Attaque ultra-rapide (<5 sec)";
    else if (crackTime < 60) method = "Attaque en ligne (moins d'une minute)";
    else if (crackTime < 3600) method = "Attaque en ligne (quelques minutes)";
    else if (crackTime < 86400) method = "Attaque hors ligne (quelques heures)";
    else if (crackTime < 31536000) method = "Attaque hors ligne (quelques mois)";
    else method = "Mot de passe extrêmement sécurisé";
    
    return { crackTime: formatTime(crackTime), method };
  }

  function formatTime(seconds) {
    if (seconds < 0.001) return "Instantané";
    if (seconds < 1) return `${(seconds * 1000).toFixed(2)} millisecondes`;
    if (seconds < 60) return `${Math.round(seconds)} secondes`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} heures`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} jours`;
    return `${(seconds / 31536000).toFixed(2)} années`;
  }

  function displayStrengthResult(isSecure, messages) {
    strengthResultDiv.innerHTML = `<p class="${isSecure ? "success" : "error"}">${messages.join("<br>")}</p>`;
  }

  function displayCrackingResult(crackTime, method) {
    crackingResultDiv.innerHTML = `
      <h2>Simulation de Crackage</h2>
      <p>Temps estimé : ${crackTime}</p>
      <p>Méthode estimée : ${method}</p>
    `;
  }
});
