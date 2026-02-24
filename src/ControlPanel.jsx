import { useState } from "react" // React Hook für lokalen State
import "./ControlPanel.css" // Styling für das Steuerungspanel
import {navigateShip, scan} from "./api"; // API-Funktionen für Navigation und Scan

// ControlPanel Komponente - Enthält den Kompass und alle Steuerungselemente
// Props:
//   - selectedShip: Das aktuell ausgewählte Schiff
//   - onMoveDirection: Callback-Funktion für Bewegung
//   - onDeployDiver: Callback-Funktion zum Starten des Submarines
//   - ships: Liste aller verfügbaren Schiffe
//   - onSelectShip: Callback wenn ein Schiff ausgewählt wird
//   - onDeleteShip: Callback zum Löschen eines Schiffs
export default function ControlPanel({ selectedShip, onMoveDirection, onDeployDiver, ships, onSelectShip, onDeleteShip }) {
    const [direction, setDirection] = useState(0) // Aktuelle Richtung in Grad (0 = Nord, 90 = Ost, etc.)

    // Array mit allen 8 Kompass-Richtungen
    // Jede Richtung hat:
    //   - name: Kurzname (N, NO, O, etc.)
    //   - angle: Winkel in Grad für die Schiffsanzeige
    //   - rudder: Ruder-Einstellung für das Backend ("Left", "Center", "Right")
    //   - course: Fahrtrichtung für das Backend ("Forward", "Backward")
    const directions = [
        { name: "N", angle: 0, rudder: "Center", course: "Forward"},      // Norden - Geradeaus vorwärts
        { name: "NO", angle: 45, rudder: "Right", course: "Forward" },    // Nordost - Rechts vorwärts
        { name: "O", angle: 90, rudder: "Right", course: "Backward" },    // Osten - Rechts rückwärts
        { name: "SO", angle: 135, rudder: "Right", course: "Backward" },  // Südost - Rechts rückwärts
        { name: "S", angle: 180, rudder: "Center", course: "Backward" },  // Süden - Geradeaus rückwärts
        { name: "SW", angle: 225, rudder: "Left", course: "Backward" },   // Südwest - Links rückwärts
        { name: "W", angle: 270, rudder: "Left", course: "Backward" },    // Westen - Links rückwärts
        { name: "NW", angle: 315, rudder: "Left", course: "Forward" },    // Nordwest - Links vorwärts
    ]

    // Wird aufgerufen wenn ein Kompass-Button geklickt wird
    function handleDirection(dir) {
        setDirection(dir.angle) // Aktualisiere die angezeigte Richtung
        if (selectedShip) {
            // Sende Navigationsbefehl ans Backend mit Ruder und Fahrtrichtung
            navigateShip(ships, dir.rudder, dir.course)
        }
    }

    return (
        <div className="control-panel">
            <h2 className="panel-title">🧭 Steuerung</h2>

            {/* Dropdown zur Auswahl des zu steuernden Schiffs */}
            <div className="ship-select">
                <label>Schiff wählen:</label>
                <select
                    value={selectedShip?.id || ""} // Zeige ID des ausgewählten Schiffs oder leer
                    onChange={(e) => {
                        // Finde das Schiff-Objekt anhand der ausgewählten ID
                        const ship = ships.find(s => s.id === parseInt(e.target.value))
                        onSelectShip(ship) // Rufe den Callback mit dem gefundenen Schiff auf
                    }}
                >
                    <option value="">-- Wählen --</option>
                    {/* Erstelle für jedes Schiff eine Option */}
                    {ships.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* Kompass-Steuerung */}
            <div className="compass">
                <div className="compass-ring">
                    {/* Erstelle einen Button für jede der 8 Richtungen */}
                    {directions.map(dir => (
                        <button
                            key={dir.name}
                            className={`compass-btn dir-${dir.name}`} // CSS-Klasse für Positionierung
                            onClick={() => handleDirection(dir)} // Bei Klick: Richtung setzen
                            disabled={!selectedShip} // Deaktiviert wenn kein Schiff ausgewählt
                        >
                            {dir.name}
                        </button>
                    ))}

                    {/* Scan-Button in der Mitte des Kompasses */}
                    <button
                        className="compass-center scan-btn"
                        onClick={() => selectedShip && scan(selectedShip.id)} // Scan für das ausgewählte Schiff
                        disabled={!selectedShip} // Deaktiviert wenn kein Schiff ausgewählt
                        title="Sektor scannen" // Tooltip beim Hover
                    >
                        <span className="scan-icon">📡</span>
                        <span className="scan-text">SCAN</span>
                    </button>
                </div>
            </div>

            {/* Button zum Starten des Submarines/Tauchers */}
            <button
                className="deploy-diver-btn"
                onClick={onDeployDiver} // Ruft die übergebene Callback-Funktion auf
                disabled={!selectedShip} // Deaktiviert wenn kein Schiff ausgewählt
            >
                🤿 Submarin ablassen
            </button>

            {/* Button zum Löschen des ausgewählten Schiffs */}
            <button
                className="delete-ship-btn"
                onClick={() => onDeleteShip(selectedShip.id)} // Löscht das Schiff mit der aktuellen ID
                disabled={!selectedShip} // Deaktiviert wenn kein Schiff ausgewählt
            >
                🗑️ Schiff löschen
            </button>

            {/* Zeigt die aktuelle Position des ausgewählten Schiffs an */}
            {selectedShip && (
                <div className="ship-info">
                    <span>📍 Position: ({selectedShip.x}, {selectedShip.y})</span>
                </div>
            )}
        </div>
    )
}
