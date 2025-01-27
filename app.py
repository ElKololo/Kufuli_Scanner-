from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import math

app = Flask(__name__)
CORS(app)

# Dictionnaire de mots courants et motifs simples
COMMON_PATTERNS = {
    'mots_courants': set(['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome', 'azerty', 'motdepasse']),
    'sequences': set(['123', 'abc', 'qwe', 'azer']),
    'repetitions': set(['111', '222', '333', '444', '555', '666', '777', '888', '999', '000']),
    'annees': set([str(year) for year in range(1900, 2030)])
}

def check_password_strength(password):
    errors = []
    
    if len(password) < 10:
        errors.append("Le mot de passe doit contenir au moins 10 caractères.")
    
    if not re.search(r'[a-z]', password):
        errors.append("Le mot de passe doit contenir au moins une lettre minuscule.")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Le mot de passe doit contenir au moins une lettre majuscule.")
    
    if not re.search(r'\d', password):
        errors.append("Le mot de passe doit contenir au moins un chiffre.")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Le mot de passe doit contenir au moins un caractère spécial.")
    
    return errors

def estimate_crack_time(password):
    # Vitesses de crackage modernes (tentatives/seconde)
    ONLINE_THROTTLING = 1000
    ONLINE_NO_THROTTLING = 10**9
    OFFLINE_SLOW_HASH = 10**11
    OFFLINE_FAST_HASH = 10**15

    # Vérification des motifs simples
    for pattern_type, patterns in COMMON_PATTERNS.items():
        if password.lower() in patterns or any(pattern in password.lower() for pattern in patterns):
            return 1, f"Attaque par dictionnaire ({pattern_type})"

    # Attaque par masque pour les motifs simples
    if re.match(r'^[a-zA-Z]+\d+$', password) or re.match(r'^[a-z]+$', password) or re.match(r'^\d+$', password):
        return min(len(password) * 0.1, 60), "Attaque par masque (motif simple)"

    # Calcul de l'entropie
    char_types = [
        bool(re.search(r'[a-z]', password)),
        bool(re.search(r'[A-Z]', password)),
        bool(re.search(r'\d', password)),
        bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
    ]
    char_set_size = sum([
        char_types[0] * 26,
        char_types[1] * 26,
        char_types[2] * 10,
        char_types[3] * 32
    ])
    entropy = math.log2(char_set_size ** len(password))

    # Pénalité pour le manque de diversité de caractères
    diversity_penalty = 4 - sum(char_types)
    entropy = max(1, entropy - (diversity_penalty * 10))

    # Choix de la méthode de crackage basée sur la complexité
    if entropy < 30:
        time = 2**entropy / ONLINE_NO_THROTTLING
        method = "Attaque en ligne (non limitée)"
    elif entropy < 50:
        time = 2**entropy / OFFLINE_SLOW_HASH
        method = "Attaque hors ligne (hachage lent)"
    else:
        time = 2**entropy / OFFLINE_FAST_HASH
        method = "Attaque hors ligne (hachage rapide)"

    # Ajustement pour les mots de passe qui ne respectent pas les critères
    if check_password_strength(password):
        time /= 100  # Pénalité plus sévère

    # Ajustement pour les mots de passe très longs
    if len(password) > 20:
        time *= 1.5  # Bonus réduit pour la longueur

    # Plafonnement du temps maximum
    max_time = 30 * 24 * 60 * 60  # 30 jours maximum
    return min(time, max_time), method

def format_time(seconds):
    if seconds < 60:
        return f"{max(1, round(seconds))} secondes"
    elif seconds < 3600:
        return f"{round(seconds / 60)} minutes"
    elif seconds < 86400:
        return f"{round(seconds / 3600)} heures"
    else:
        return f"{round(seconds / 86400)} jours"

@app.route('/check_password', methods=['POST'])
def check_password():
    data = request.json
    password = data.get('password')
    
    if not password:
        return jsonify({"error": "Veuillez fournir un mot de passe."}), 400
    
    errors = check_password_strength(password)
    
    if errors:
        return jsonify({"secure": False, "errors": errors})
    else:
        return jsonify({"secure": True, "message": "Le mot de passe est sécurisé."})

@app.route('/simulate_cracking', methods=['POST'])
def simulate_cracking():
    data = request.json
    password = data.get('password')
    
    if not password:
        return jsonify({"error": "Veuillez fournir un mot de passe."}), 400
    
    strength_check = check_password_strength(password)
    crack_time, method = estimate_crack_time(password)
    
    return jsonify({
        "strength_check": {
            "secure": len(strength_check) == 0,
            "errors": strength_check
        },
        "cracking_simulation": {
            "crack_time_seconds": crack_time,
            "crack_time_display": format_time(crack_time),
            "method": method
        }
    })

if __name__ == '__main__':
    app.run(debug=True)

