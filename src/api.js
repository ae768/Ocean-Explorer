// ============================================================================
// API.JS - Alle HTTP-Funktionen für die Kommunikation mit dem Javalin-Backend
// ============================================================================

// Backend-URL - für Verbindung zum Backend
const BACKEND_URL = "http://localhost:8080"
const API = `${BACKEND_URL}/api` // Basis-URL für alle API-Aufrufe

// ============================================
// ALLE SCHIFFE ABRUFEN
// Holt die Liste aller Schiffe vom Backend
// Backend: GET /api/getships
// Response: { type: "allships", ships: [{ shipId, name, position, direction, ... }, ...] }
// ============================================

// Hilfsfunktion um Position-String zu parsen (z.B. "Vec2d{x=5, y=10}" → {x: 5, y: 10})
function parsePosition(positionString) {
    if (!positionString) return { x: 0, y: 0 };

    // Format: "Vec2d{x=5, y=10}" oder ähnlich mit = Zeichen
    const matchEquals = positionString.match(/x\s*=\s*(\d+).*y\s*=\s*(\d+)/);
    if (matchEquals) {
        return { x: parseInt(matchEquals[1]), y: parseInt(matchEquals[2]) };
    }

    // Format: "Vec2d(5, 10)" oder "(5, 10)" oder "5, 10"
    const matchParens = positionString.match(/\(?(\d+)[,\s]+(\d+)\)?/);
    if (matchParens) {
        return { x: parseInt(matchParens[1]), y: parseInt(matchParens[2]) };
    }

    console.warn("Konnte Position nicht parsen:", positionString);
    return { x: 0, y: 0 };
}

export async function getShips() {
    try {
        console.log("Rufe /api/getships auf...");
        const response = await fetch(`${API}/getships`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        console.log("Response Status:", response.status, response.statusText);

        if (!response.ok) {
            console.error("Fehler bei getShips - Status:", response.status);
            return [];
        }

        const data = await response.json();
        console.log("Rohdaten vom Backend:", data);

        const shipsFromBackend = data.ships || [];
        console.log("Anzahl Schiffe:", shipsFromBackend.length);

        // Transformiere Backend-Format in App-Format
        const transformedShips = shipsFromBackend.map(ship => {
            const pos = parsePosition(ship.position);
            console.log(`Schiff "${ship.name}": position="${ship.position}" → x=${pos.x}, y=${pos.y}`);
            return {
                id: ship.shipId,           // Backend: shipId → App: id
                name: ship.name,
                x: pos.x,                  // Backend: position String → App: x
                y: pos.y,                  // Backend: position String → App: y
                direction: ship.direction,
                course: ship.course,
                rudder: ship.rudder,
                crash: ship.crash
            };
        });

        console.log("Transformierte Schiffe:", transformedShips);
        return transformedShips;
    } catch (error) {
        console.error("Fehler beim Abrufen der Schiffe:", error);
        return [];
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
export async function navigateShip(shipId, name) {
    try {
        const response = await fetch(`${API}/navigate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                shipid: shipId,  // ID des zu steuernden Schiffs
                direction: name,
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
        console.log("Lösche Schiff mit ID:", shipId);
        console.log("Request Body:", JSON.stringify({ shipid: shipId }));

        const response = await fetch(`${API}/kill`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipid: shipId })
        });

        console.log("Kill Response Status:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Kill Error Response:", errorText);
        } else {
            console.log("Schiff gelöscht!");
        }

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
// Holt alle aktiven Submarines vom Backend
// Backend: GET /api/getsubmarines
// ============================================

export async function getDivers() {
    try {
        console.log("Rufe /api/getsubmarines auf...");
        const response = await fetch(`${API}/getsubmarines`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        console.log("Submarines Response Status:", response.status);

        if (!response.ok) {
            console.error("Fehler bei getsubmarines - Status:", response.status);
            return [];
        }

        const data = await response.json();
        console.log("Submarines Rohdaten:", data);

        const submarinesFromBackend = data.submarines || [];

        // Transformiere Backend-Format in App-Format
        const transformedSubmarines = submarinesFromBackend.map(sub => {
            const pos = parsePosition(sub.position);
            return {
                id: sub.submarineId || sub.id,
                shipId: sub.shipId,
                x: pos.x,
                y: pos.y,
                direction: sub.direction
            };
        });

        console.log("Transformierte Submarines:", transformedSubmarines);
        return transformedSubmarines;
    } catch (error) {
        console.error("Fehler beim Abrufen der Submarines:", error);
        return [];
    }
}

// Weiterer Alias für startSubmarine
export async function deploySubmarin(shipId) {
    return startSubmarine(shipId);
}

// Platzhalter für Submarine-Liste
export async function getSubmarin() {
    return []; // Platzhalter - muss mit echtem Backend-Endpunkt verbunden werden
}
