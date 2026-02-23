import { useState } from "react"
import "./ShipModal.css"

export default function ShipModal({ x, y, onClose, onCreateShip, onDeleteShip, existingShip, nextPort }) {
    const [shipName, setShipName] = useState("")
    const [port, setPort] = useState(nextPort)

    function handleCreate() {
        if (shipName.trim() && port) {
            onCreateShip(shipName.trim(), x, y, port)
            onClose()
        }
    }

    function handleDelete() {
        if (existingShip) {
            onDeleteShip(existingShip.id)
            onClose()
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                {existingShip ? (
                    <>
                        <h2>🚢 {existingShip.name}</h2>
                        <p className="modal-info">Position: ({x}, {y})</p>
                        <p className="modal-info">Port: {existingShip.port}</p>
                        <p className="modal-info">Richtung: {existingShip.direction}</p>
                        <div className="modal-actions">
                            <button className="delete-btn" onClick={handleDelete}>
                                🗑️ Schiff löschen
                            </button>
                            <button className="cancel-btn" onClick={onClose}>
                                Abbrechen
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>🚢 Neues Schiff erstellen</h2>
                        <p className="modal-info">Position: ({x}, {y})</p>
                        <p className="modal-info">Richtung: S (Süden)</p>
                        <div className="input-group">
                            <label>Schiffsname:</label>
                            <input
                                type="text"
                                placeholder="Name eingeben..."
                                value={shipName}
                                onChange={e => setShipName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleCreate()}
                                autoFocus
                            />
                        </div>
                        <div className="input-group">
                            <label>Submarine-Port:</label>
                            <input
                                type="number"
                                placeholder="Port eingeben..."
                                value={port}
                                onChange={e => setPort(parseInt(e.target.value) || "")}
                                min="1000"
                                max="65535"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="create-btn" onClick={handleCreate} disabled={!shipName.trim() || !port}>
                                ✓ Erstellen
                            </button>
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

