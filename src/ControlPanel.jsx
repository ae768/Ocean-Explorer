import { useState } from "react"
import "./ControlPanel.css"
import {navigateShip} from "./api";

export default function ControlPanel({ selectedShip, onMoveDirection, onDeployDiver, ships, onSelectShip, onDeleteShip }) {
    const [direction, setDirection] = useState(0) // Grad (0 = Nord)

    const directions = [
        { name: "N", angle: 0, rudder: "Center", course: "Forward"},
        { name: "NO", angle: 45, rudder: "Right", course: "Forward" },
        { name: "O", angle: 90, rudder: "Right", course: "Backward" },
        { name: "SO", angle: 135, rudder: "Right", course: "Backward" },
        { name: "S", angle: 180, rudder: "Center", course: "Backward" },
        { name: "SW", angle: 225, rudder: "Left", course: "Backward" },
        { name: "W", angle: 270, rudder: "Left", course: "Backward" },
        { name: "NW", angle: 315, rudder: "Left", course: "Forward" },
    ]

    function handleDirection(dir) {
        setDirection(dir.angle)
        if (selectedShip) {
            navigateShip(ships, dir.rudder, dir.course)

        }
    }

    return (
        <div className="control-panel">
            <h2 className="panel-title">🧭 Steuerung</h2>

            {/* Schiff-Auswahl */}
            <div className="ship-select">
                <label>Schiff wählen:</label>
                <select
                    value={selectedShip?.id || ""}
                    onChange={(e) => {
                        const ship = ships.find(s => s.id === parseInt(e.target.value))
                        onSelectShip(ship)
                    }}
                >
                    <option value="">-- Wählen --</option>
                    {ships.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* Kompass */}
            <div className="compass">
                <div className="compass-ring">
                    {directions.map(dir => (
                        <button
                            key={dir.name}
                            className={`compass-btn dir-${dir.name}`}
                            onClick={() => handleDirection(dir)}
                            disabled={!selectedShip}
                        >
                            {dir.name}
                        </button>
                    ))}

                    {/* Zeiger in der Mitte */}
                    <div className="compass-center">
                        <div
                            className="compass-needle"
                            style={{ transform: `rotate(${direction}deg)` }}
                        >
                            <div className="needle-tip"></div>
                            <div className="needle-base"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aktions-Buttons */}
            <button
                className="deploy-diver-btn"
                onClick={onDeployDiver}
                disabled={!selectedShip}
            >
                🤿 Submarin ablassen
            </button>

            <button
                className="delete-ship-btn"
                onClick={() => onDeleteShip(selectedShip.id)}
                disabled={!selectedShip}
            >
                🗑️ Schiff löschen
            </button>

            {selectedShip && (
                <div className="ship-info">
                    <span>📍 Position: ({selectedShip.x}, {selectedShip.y})</span>
                </div>
            )}
        </div>
    )
}

