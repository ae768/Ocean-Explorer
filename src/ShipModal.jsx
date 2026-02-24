import { useState } from "react" // React Hook für lokalen State
import "./ShipModal.css" // Styling für das Modal

// ShipModal-Komponente - Dialog zum Erstellen oder Löschen von Schiffen
// Props:
//   - x, y: Koordinaten der angeklickten Zelle
//   - onClose: Callback zum Schließen des Modals
//   - onCreateShip: Callback zum Erstellen eines neuen Schiffs
//   - onDeleteShip: Callback zum Löschen eines Schiffs
//   - existingShip: Falls ein Schiff auf der Position existiert, dessen Daten
//   - nextPort: Der nächste verfügbare Port für ein neues Schiff
export default function ShipModal({ x, y, onClose, onCreateShip, onDeleteShip, existingShip, nextPort }) {
    const [shipName, setShipName] = useState("") // Eingegebener Schiffsname
    const [port, setPort] = useState(nextPort)   // Eingegebener Port (vorbelegt mit nextPort)

    // Wird aufgerufen wenn der "Erstellen" Button geklickt wird
    function handleCreate() {
        if (shipName.trim() && port) { // Nur erstellen wenn Name und Port ausgefüllt sind
            onCreateShip(shipName.trim(), x, y, port) // Callback mit den Schiffsdaten aufrufen
            onClose() // Modal schließen
        }
    }

    // Wird aufgerufen wenn der "Löschen" Button geklickt wird
    function handleDelete() {
        if (existingShip) { // Nur löschen wenn ein Schiff existiert
            onDeleteShip(existingShip.id) // Callback mit der Schiffs-ID aufrufen
            onClose() // Modal schließen
        }
    }

    return (
        // Overlay - der dunkle Hintergrund. Klick darauf schließt das Modal
        <div className="modal-overlay" onClick={onClose}>
            {/* Das eigentliche Modal-Fenster. stopPropagation verhindert, dass Klicks das Modal schließen */}
            <div className="modal" onClick={e => e.stopPropagation()}>
                {/* Bedingte Anzeige: Zeige verschiedenen Inhalt je nachdem ob ein Schiff existiert */}
                {existingShip ? (
                    // === ANSICHT FÜR EXISTIERENDES SCHIFF ===
                    <>
                        <h2>🚢 {existingShip.name}</h2>
                        <p className="modal-info">Position: ({x}, {y})</p>
                        <p className="modal-info">Port: {existingShip.port}</p>
                        <p className="modal-info">Richtung: {existingShip.direction}</p>
                        <div className="modal-actions">
                            {/* Button zum Löschen des Schiffs */}
                            <button className="delete-btn" onClick={handleDelete}>
                                🗑️ Schiff löschen
                            </button>
                            {/* Button zum Abbrechen/Schließen */}
                            <button className="cancel-btn" onClick={onClose}>
                                Abbrechen
                            </button>
                        </div>
                    </>
                ) : (
                    // === ANSICHT FÜR NEUES SCHIFF ===
                    <>
                        <h2>🚢 Neues Schiff erstellen</h2>
                        <p className="modal-info">Position: ({x}, {y})</p>
                        <p className="modal-info">Richtung: S (Süden)</p> {/* Neue Schiffe zeigen immer nach Süden */}

                        {/* Eingabefeld für den Schiffsnamen */}
                        <div className="input-group">
                            <label>Schiffsname:</label>
                            <input
                                type="text"
                                placeholder="Name eingeben..."
                                value={shipName}
                                onChange={e => setShipName(e.target.value)} // Aktualisiere State bei Eingabe
                                onKeyDown={e => e.key === "Enter" && handleCreate()} // Enter-Taste erstellt das Schiff
                                autoFocus // Fokussiere dieses Feld automatisch
                            />
                        </div>

                        {/* Eingabefeld für den Submarine-Port */}
                        <div className="input-group">
                            <label>Submarine-Port:</label>
                            <input
                                type="number"
                                placeholder="Port eingeben..."
                                value={port}
                                onChange={e => setPort(parseInt(e.target.value) || "")} // Parse als Zahl oder leer
                                min="1000"   // Minimaler Port-Wert
                                max="65535"  // Maximaler Port-Wert (höchster gültiger Port)
                            />
                        </div>

                        <div className="modal-actions">
                            {/* Button zum Erstellen - deaktiviert wenn Name oder Port fehlt */}
                            <button className="create-btn" onClick={handleCreate} disabled={!shipName.trim() || !port}>
                                ✓ Erstellen
                            </button>
                            {/* Button zum Abbrechen */}
                            <button className="cancel-btn" onClick={onClose}>
                                Abbrechen
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
