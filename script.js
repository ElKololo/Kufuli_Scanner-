document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password")
  const checkStrengthBtn = document.getElementById("checkStrength")
  const simulateCrackingBtn = document.getElementById("simulateCracking")
  const strengthResultDiv = document.getElementById("strengthResult")
  const crackingResultDiv = document.getElementById("crackingResult")
  const loadingIndicator = document.getElementById("loadingIndicator")

  checkStrengthBtn.addEventListener("click", checkPasswordStrength)
  simulateCrackingBtn.addEventListener("click", simulatePasswordCracking)

  async function checkPasswordStrength() {
    const password = passwordInput.value
    try {
      const response = await fetch("http://localhost:5000/check_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      displayStrengthResult(data)
    } catch (error) {
      console.error("Error checking password:", error)
      strengthResultDiv.innerHTML =
        '<p class="error">Une erreur est survenue lors de la vérification du mot de passe.</p>'
    }
  }

  async function simulatePasswordCracking() {
    const password = passwordInput.value
    try {
      loadingIndicator.classList.remove("hidden")
      crackingResultDiv.innerHTML = ""

      const response = await fetch("http://localhost:5000/simulate_cracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      displayCrackingResult(data)
    } catch (error) {
      console.error("Error simulating cracking:", error)
      crackingResultDiv.innerHTML = '<p class="error">Une erreur est survenue lors de la simulation de crackage.</p>'
    } finally {
      loadingIndicator.classList.add("hidden")
    }
  }

  function displayStrengthResult(result) {
    if (result.secure) {
      strengthResultDiv.innerHTML = `<p class="success">${result.message}</p>`
    } else {
      let errorList = "<ul>"
      result.errors.forEach((error) => {
        errorList += `<li>${error}</li>`
      })
      errorList += "</ul>"
      strengthResultDiv.innerHTML = `
                <p class="error">Le mot de passe n'est pas sécurisé :</p>
                ${errorList}
            `
    }
  }

  function displayCrackingResult(result) {
    const { strength_check, cracking_simulation } = result
    let content = `
            <h2>Résultat de la simulation de crackage</h2>
            <p>Temps estimé pour craquer : ${cracking_simulation.crack_time_display}</p>
            <p>Méthode de crackage simulée : ${cracking_simulation.method}</p>
        `

    if (strength_check.secure) {
      content += '<p class="success">Le mot de passe est considéré comme sécurisé.</p>'
    } else {
      content += '<p class="error">Le mot de passe n\'est pas considéré comme sécurisé.</p>'
      let errorList = "<ul>"
      strength_check.errors.forEach((error) => {
        errorList += `<li>${error}</li>`
      })
      errorList += "</ul>"
      content += errorList
    }

    crackingResultDiv.innerHTML = content
  }
})

