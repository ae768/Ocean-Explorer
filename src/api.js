// ============================================================================
// API.JS - Alle HTTP-Funktionen für die Kommunikation mit dem Javalin-Backend
// ============================================================================

// Backend-URL - für Verbindung zum Backend
const BACKEND_URL = "http://localhost:8080"
const API = `${BACKEND_URL}/api` // Basis-URL für alle API-Aufrufe

// ============================================
// ALLE SCHIFFE ABRUFEN
// Holt die Liste aller Schiffe vom Backend
// Backend: GET /api/ships
// Response: [{ id, name, x, y, direction, port }, ...]
// ============================================
export async function getShips() {
    try {
        const response = await fetch(`${API}/ships`, {
            method: "GET", // HTTP GET Methode
            headers: { "Content-Type": "application/json" } // Erwarte JSON als Antwort
        });
        if (!response.ok) return []; // Bei Fehler leeres Array zurückgeben
        const text = await response.text(); // Hole die Antwort als Text
        return JSON.parse(text); // Parse den Text als JSON und gib das Array zurück
    } catch (error) {
        console.error("Fehler beim Abrufen der Schiffe:", error);
        return []; // Bei Netzwerkfehler leeres Array zurückgeben
    }
}

// ============================================
// SCHIFF ERSTELLEN
// Erstellt ein neues Schiff an der angegebenen Position
// Backend: POST /api/create
// Body: { name, x, y, submarineport, direction }
// ============================================
export async function createShip(name, x, y, direction, submarineport) {
    try {
        const response = await fetch(`${API}/create`, {
            method: "POST", // HTTP POST Methode für neue Ressourcen
            headers: {
                "Content-Type": "application/json", // Sende JSON-Daten
            },
            body: JSON.stringify({ // Konvertiere JavaScript-Objekt zu JSON-String
                name: name,               // Name des Schiffs
                x: x,                     // X-Koordinate auf der Karte
                y: y,                     // Y-Koordinate auf der Karte
                submarineport: submarineport, // Port für das Submarine
                direction: direction      // Anfangsrichtung (z.B. "S" für Süden)
            }),
        });
        console.log("Schiff erstellt!");
        return response.ok; // Gib true zurück wenn erfolgreich (Status 200-299)
    } catch (err) {
        console.error("Fehler beim Erstellen:", err);
        return false; // Bei Fehler false zurückgeben
    }
}

// ============================================
// SCHIFF NAVIGIEREN (Steuerung)
// Sendet Steuerungsbefehle an das Schiff
// Backend: POST /api/navigate
// Body: { shipid, rudder, course }
//
// Rudder (Ruder): "Left" = links lenken, "Center" = geradeaus, "Right" = rechts lenken
// Course (Fahrt): "Forward" = vorwärts fahren, "Backward" = rückwärts fahren
// ============================================
export async function navigateShip(shipId, rudder, course) {
    try {
        const response = await fetch(`${API}/navigate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                shipid: shipId,  // ID des zu steuernden Schiffs
                rudder: rudder,  // Ruderstellung: "Left", "Center", "Right"
                course: course   // Fahrtrichtung: "Forward", "Backward"
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
// Wandelt Himmelsrichtungen in Rudder/Course-Befehle um
// Diese Funktion ist ein Wrapper um navigateShip()
// ============================================
export async function moveShipDirection(shipId, direction) {
    // Mapping von Kompass-Richtungen zu Backend-Befehlen
    // Jede Richtung wird übersetzt in Ruder + Fahrtrichtung
    const directionMap = {
        "N": { rudder: "Center", course: "Forward" },   // Norden = geradeaus vorwärts
        "S": { rudder: "Center", course: "Backward" },  // Süden = geradeaus rückwärts
        "O": { rudder: "Right", course: "Forward" },    // Osten = rechts vorwärts
        "W": { rudder: "Left", course: "Forward" },     // Westen = links vorwärts
        "NORTH": { rudder: "Center", course: "Forward" },
        "SOUTH": { rudder: "Center", course: "Backward" },
        "EAST": { rudder: "Right", course: "Forward" },
        "WEST": { rudder: "Left", course: "Forward" }
    };

    // Hole das Mapping für die Richtung, falls nicht gefunden nutze Default (geradeaus)
    const mapping = directionMap[direction] || { rudder: "Center", course: "Forward" };
    // Rufe die eigentliche navigate-Funktion auf
    return navigateShip(shipId, mapping.rudder, mapping.course);
}

// ============================================
// RADAR AKTIVIEREN
// Radarmessung der umliegenden Sektoren anfordern
// Zeigt was sich in den benachbarten Feldern befindet
// Backend: POST /api/radar
// Body: { shipid }
// ============================================
export async function radar(shipId) {
    try {
        const response = await fetch(`${API}/radar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipid: "#3#Test" }) // Sende Schiffs-ID
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
// Scannt den aktuellen Sektor auf Schätze/Objekte
// Im Gegensatz zu Radar nur das aktuelle Feld, aber detaillierter
// Backend: POST /api/scan
// Body: { shipid }
// ============================================
export async function scan(shipId) {
    try {
        const response = await fetch(`${API}/scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipid: shipId }) // Sende Schiffs-ID
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
// Entfernt das Schiff aus dem Spiel
// Inklusive eventuell ausgesetzter Tauchroboter
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
// TAUCHROBOTER/SUBMARINE STARTEN
// Lässt den Tauchroboter vom Schiff aus ins Wasser
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
// ALIAS-FUNKTIONEN
// Diese Funktionen sind alternative Namen für bessere Lesbarkeit
// Sie rufen intern die eigentlichen Funktionen auf
// ============================================

// Alias für killShip - wird in der UI als "Schiff löschen" verwendet
export async function deleteShip(shipId) {
    return killShip(shipId);
}

// Alias für startSubmarine - wird in der UI als "Taucher ablassen" verwendet
export async function deployDiver(shipId) {
    return startSubmarine(shipId);
}

// ============================================
// TAUCHER/SUBMARINES ABRUFEN
// Gibt aktuell ein leeres Array zurück
// TODO: Backend-Endpunkt für Submarines hinzufügen wenn nötig
// ============================================
export async function getDivers() {
    return []; // Platzhalter - muss mit echtem Backend-Endpunkt verbunden werden
}

// Weiterer Alias für startSubmarine
export async function deploySubmarin(shipId) {
    return startSubmarine(shipId);
}

// Platzhalter für Submarine-Liste
export async function getSubmarin() {
    return []; // Platzhalter - muss mit echtem Backend-Endpunkt verbunden werden
}
