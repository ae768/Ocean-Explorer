// Backend-URL - Passe den Port an deinen Javalin-Server an!
const BACKEND_URL = "http://localhost:7000"
const API = `${BACKEND_URL}/api`

// ============================================
// ALLE SCHIFFE ABRUFEN
// Backend: GET /api/ships
// Response: [{ id, name, x, y }, ...]
// ============================================
export async function getShips() {
    try {
        const response = await fetch(`${API}/ships`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) return [];
        const text = await response.text();
        return JSON.parse(text);
    } catch (error) {
        console.error("Fehler beim Abrufen der Schiffe:", error);
        return [];
    }
}

// ============================================
// SCHIFF ERSTELLEN
// Backend: POST /api/create
// Body: { name, x, y, submarineport, direction }
// ============================================
export async function createShip(name, x, y, direction, submarineport) {
    try {
        const response = await fetch(`${API}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                x: x,
                y: y,
                submarineport: submarineport,
                direction: direction
            }),
        });
        console.log("Schiff erstellt!");
        return response.ok;
    } catch (err) {
        console.error("Fehler beim Erstellen:", err);
        return false;
    }
}

// ============================================
// SCHIFF NAVIGIEREN (Steuerung)
// Backend: POST /api/navigate
// Body: { shipid, rudder, course }
//
// Rudder (Ruder): "Left", "Center", "Right"
// Course (Fahrt): "Forward", "Backward"
// ============================================
export async function navigateShip(shipId, rudder, course) {
    try {
        const response = await fetch(`${API}/navigate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                shipid: shipId,
                rudder: rudder,
                course: course
            })
        });
        return response.ok;
    } catch (error) {
        console.error("Fehler beim Navigieren:", error);
        return false;
    }
}

// ============================================
// SCHIFF IN RICHTUNG BEWEGEN (für Kompass)
// Mappt Kompass-Richtungen auf Rudder + Course
// ============================================
export async function moveShipDirection(shipId, direction) {
    // Kompass-Richtung -> Rudder mapping
    // N = Vorwärts geradeaus
    // S = Rückwärts geradeaus
    // O = Vorwärts rechts
    // W = Vorwärts links
    const directionMap = {
        "N": { rudder: "Center", course: "Forward" },
        "S": { rudder: "Center", course: "Backward" },
        "O": { rudder: "Right", course: "Forward" },
        "W": { rudder: "Left", course: "Forward" },
        "NORTH": { rudder: "Center", course: "Forward" },
        "SOUTH": { rudder: "Center", course: "Backward" },
        "EAST": { rudder: "Right", course: "Forward" },
        "WEST": { rudder: "Left", course: "Forward" }
    };

    const mapping = directionMap[direction] || { rudder: "Center", course: "Forward" };
    return navigateShip(shipId, mapping.rudder, mapping.course);
}

// ============================================
// RADAR AKTIVIEREN
// Radarmessung der umliegenden Sektoren anfordern
// Backend: POST /api/radar
// Body: { shipid }
// ============================================
export async function radar(shipId) {
    try {
        const response = await fetch(`${API}/radar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipid: shipId })
        });
        console.log("Radar aktiviert!");
        return response.ok;
    } catch (error) {
        console.error("Fehler beim Radar:", error);
        return false;
    }
}

// ============================================
// SCAN AKTIVIEREN
// Scan des aktuellen Sektors
// Backend: POST /api/scan
// Body: { shipid }
// ============================================
export async function scan(shipId) {
    try {
        const response = await fetch(`${API}/scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipid: shipId })
        });
        console.log("Scan aktiviert!");
        return response.ok;
    } catch (error) {
        console.error("Fehler beim Scan:", error);
        return false;
    }
}

// ============================================
// SCHIFF ZERSTÖREN/LÖSCHEN (Exit)
// Schiff aus dem Spiel nehmen, inklusive eventuell ausgesetzter Tauchroboter
// Backend: POST /api/kill
// Body: { shipid }
// ============================================
export async function killShip(shipId) {
    try {
        const response = await fetch(`${API}/kill`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipid: shipId })
        });
        console.log("Schiff gelöscht!");
        return response.ok;
    } catch (error) {
        console.error("Fehler beim Löschen des Schiffs:", error);
        return false;
    }
}

// ============================================
// TAUCHROBOTER STARTEN
// Backend: POST /api/startsubmarine
// Body: { shipid }
// ============================================
export async function startSubmarine(shipId) {
    try {
        const response = await fetch(`${API}/startsubmarine`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipid: shipId })
        });
        console.log("Tauchroboter gestartet!");
        return response.ok;
    } catch (error) {
        console.error("Fehler beim Starten des Tauchroboters:", error);
        return false;
    }
}

// ============================================
// ALIASE für Kompatibilität
// ============================================
export async function deleteShip(shipId) {
    return killShip(shipId);
}

export async function deployDiver(shipId) {
    return startSubmarine(shipId);
}

// Taucher/Submarines - gibt erstmal leeres Array zurück
// TODO: Backend-Endpunkt für Submarines hinzufügen wenn nötig
export async function getDivers() {
    return [];
}

export async function deploySubmarin(shipId) {
    return startSubmarine(shipId);
}

export async function getSubmarin() {
    return [];
}
