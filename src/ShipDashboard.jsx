import "./ShipDashboard.css" // Styling für das Dashboard importieren

// ============================================================================
// SHIP DASHBOARD KOMPONENTE
// Zeigt eine Übersicht aller platzierten Schiffe analog zur Datenbank an
// Props:
//   - ships: Array aller Schiffe [{id, name, x, y, direction, port, crashed, finds}, ...]
//   - divers: Array aller Taucher/Submarines [{id, shipId, ...}, ...]
//   - selectedShipId: ID des aktuell ausgewählten Schiffs (für Hervorhebung)
//   - onSelectShip: Callback wenn ein Schiff im Dashboard angeklickt wird
// ============================================================================
export default function ShipDashboard({ ships, divers, selectedShipId, onSelectShip }) {

    // Zählt wie viele Submarines/Taucher einem bestimmten Schiff zugeordnet sind
    function getSubmarineCount(shipId) {
        return divers.filter(d => d.shipId === shipId).length
    }

    // Berechnet die Gesamtzahl der Funde eines Schiffs (falls vom Backend geliefert)
    function getFindsCount(ship) {
        return ship.finds || 0 // Falls keine Funde vorhanden, 0 zurückgeben
    }

    // Prüft ob das Schiff gecrasht ist
    function isCrashed(ship) {
        return ship.crashed === true || ship.crashed === "true" || ship.crashed === "TRUE"
    }

    return (
        <div className="ship-dashboard">
            {/* Dashboard Header */}
            <h2 className="dashboard-title">📋 Schiff-Dashboard</h2>
            <p className="dashboard-subtitle">Übersicht aller aktiven Schiffe</p>

            {/* Wenn keine Schiffe vorhanden sind */}
            {ships.length === 0 ? (
                <div className="no-ships">
                    <span className="no-ships-icon">🚫</span>
                    <p>Keine Schiffe platziert</p>
                    <p className="hint">Klicke auf die Karte um ein Schiff zu erstellen</p>
                </div>
            ) : (
                /* Tabellen-Container mit allen Schiffen */
                <div className="dashboard-table-container">
                    <table className="dashboard-table">
                        {/* Tabellen-Header */}
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Richtung</th>
                                <th>Port</th>
                                <th>Submarines</th>
                                <th>Funde</th>
                            </tr>
                        </thead>
                        {/* Tabellen-Body mit Schiffsdaten */}
                        <tbody>
                            {ships.map(ship => (
                                <tr
                                    key={ship.id}
                                    className={`ship-row ${selectedShipId === ship.id ? 'selected' : ''} ${isCrashed(ship) ? 'crashed' : ''}`}
                                    onClick={() => onSelectShip(ship)} // Bei Klick das Schiff auswählen
                                >
                                    {/* Status-Indikator (OK oder Crashed) */}
                                    <td className="status-cell">
                                        {isCrashed(ship) ? (
                                            <span className="status-indicator crashed" title="Gecrasht">💥</span>
                                        ) : (
                                            <span className="status-indicator ok" title="Aktiv">✅</span>
                                        )}
                                    </td>

                                    {/* Schiffsname */}
                                    <td className="name-cell">
                                        <span className="ship-icon">🚢</span>
                                        {ship.name || ship.id}
                                    </td>

                                    {/* Position (X/Y Koordinaten) */}
                                    <td className="position-cell">
                                        <span className="coord">X: {ship.x}</span>
                                        <span className="coord">Y: {ship.y}</span>
                                    </td>

                                    {/* Richtung mit Kompass-Icon */}
                                    <td className="direction-cell">
                                        <span className="direction-badge">
                                            {getDirectionIcon(ship.direction)} {ship.direction || "?"}
                                        </span>
                                    </td>

                                    {/* Port des Submarines */}
                                    <td className="port-cell">
                                        {ship.port || "-"}
                                    </td>

                                    {/* Anzahl der Submarines/Taucher */}
                                    <td className="submarine-cell">
                                        <span className="submarine-count">
                                            🤿 {getSubmarineCount(ship.id)}
                                        </span>
                                    </td>

                                    {/* Anzahl der Funde/Schätze */}
                                    <td className="finds-cell">
                                        <span className="finds-count">
                                            💎 {getFindsCount(ship)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Legende unter der Tabelle */}
            <div className="dashboard-legend">
                <span className="legend-item">
                    <span className="status-indicator ok">✅</span> Aktiv
                </span>
                <span className="legend-item">
                    <span className="status-indicator crashed">💥</span> Gecrasht
                </span>
                <span className="legend-item selected-indicator">
                    ◼ Ausgewählt
                </span>
            </div>
        </div>
    )
}

// Hilfsfunktion: Gibt ein Pfeil-Icon basierend auf der Richtung zurück
function getDirectionIcon(direction) {
    const icons = {
        "N": "⬆️",      // Norden
        "S": "⬇️",      // Süden
        "O": "➡️",      // Osten
        "E": "➡️",      // East (englisch)
        "W": "⬅️",      // Westen
        "NE": "↗️",     // Nordost
        "NO": "↗️",     // Nordost (deutsch)
        "NW": "↖️",     // Nordwest
        "SE": "↘️",     // Südost
        "SO": "↘️",     // Südost (deutsch)
        "SW": "↙️",     // Südwest
    }
    return icons[direction?.toUpperCase()] || "🧭" // Fallback: Kompass-Icon
}

