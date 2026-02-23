import { useState } from "react"
import "./ShipModal.css"

export default function ShipModal({ x, y, onClose, onCreateShip, onDeleteShip, existingShip, nextPort }) {
    const [shipName, setShipName] = useState("")

    function handleCreate() {
        if (shipName.trim()) {
            onCreateShip(shipName.trim(), x, y)
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
                        <p className="modal-info">Port: {nextPort}</p>
                        <input
                            type="text"
                            placeholder="Schiffsname eingeben..."
                            value={shipName}
                            onChange={e => setShipName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreate()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="create-btn" onClick={handleCreate} disabled={!shipName.trim()}>
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

