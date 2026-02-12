import { useEffect, useState } from "react"
import Map from "./Map"
import ControlPanel from "./ControlPanel"
import ShipModal from "./ShipModal"
import { getShips, moveShip, moveShipDirection, deployDiver, getDivers, createShip, deleteShip, navigateShip } from "./api"
import "./App.css"

export default function App() {
    const [ships, setShips] = useState([])
    const [divers, setDivers] = useState([])
    const [selectedShip, setSelectedShip] = useState(null)
    const [treasures, setTreasures] = useState(0)
    const [modal, setModal] = useState(null) // { x, y, existingShip }

    async function load() {
        const newShips = await getShips()
        setShips(newShips)
        setDivers(await getDivers())
        // Aktualisiere das ausgewählte Schiff mit neuen Koordinaten
        if (selectedShip) {
            const updated = newShips.find(s => s.id === selectedShip.id)
            if (updated) setSelectedShip(updated)
            else setSelectedShip(null) // Schiff wurde gelöscht
        }
    }

    useEffect(() => {
        load()
        const timer = setInterval(load, 200) // Schnelleres Update (5x pro Sekunde)
        return () => clearInterval(timer)
    }, [])

    // Schiff in eine Richtung bewegen (für Kompass)
    async function handleMoveDirection(direction) {
        if (!selectedShip) return
        await moveShipDirection(selectedShip.id, direction)
        await load() // Sofort neu laden nach Bewegung
    }

    async function handleDeployDiver() {
        if (!selectedShip) return
        await deployDiver(selectedShip.id)
        await load() // Sofort neu laden nach Taucher-Deployment
    }

    // Klick auf Karte - Modal öffnen
    function onCellClick(x, y) {
        const existingShip = ships.find(s => s.x === x && s.y === y)
        setModal({ x, y, existingShip })
    }

    // Neues Schiff erstellen
    async function handleCreateShip(name, x, y) {
        await createShip(name, x, y)
        await load()
    }

    // Schiff löschen
    async function handleDeleteShip(id) {
        if (selectedShip?.id === id) {
            setSelectedShip(null)
        }
        await deleteShip(id)
        await load()
    }

    return (
        <div className="app">
            <h1 className="title">🌊 Ocean Explorer</h1>

            <div className="main-content">
                {/* Steuerung links */}
                <ControlPanel
                    selectedShip={selectedShip}
                    ships={ships}
                    onSelectShip={setSelectedShip}
                    onMoveDirection={handleMoveDirection}
                    onDeployDiver={handleDeployDiver}
                    onDeleteShip={handleDeleteShip}
                />

                {/* Karte in der Mitte */}
                <Map
                    ships={ships}
                    divers={divers}
                    onCellClick={onCellClick}
                    selectedShipId={selectedShip?.id}
                />

                {/* Übersicht rechts */}
                <div className="sidebar">
                    <h2 className="sidebar-title">📊 Übersicht</h2>

                    <div className="stat-card">
                        <div className="stat-icon">🚢</div>
                        <div className="stat-info">
                            <span className="stat-value">{ships.length}</span>
                            <span className="stat-label">Aktive Schiffe</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🤿</div>
                        <div className="stat-info">
                            <span className="stat-value">{divers.length}</span>
                            <span className="stat-label">Aktive Taucher</span>
                        </div>
                    </div>

                    <div className="stat-card treasure">
                        <div className="stat-icon">💎</div>
                        <div className="stat-info">
                            <span className="stat-value">{treasures}</span>
                            <span className="stat-label">Schätze gefunden</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal zum Erstellen/Löschen von Schiffen */}
            {modal && (
                <ShipModal
                    x={modal.x}
                    y={modal.y}
                    existingShip={modal.existingShip}
                    onClose={() => setModal(null)}
                    onCreateShip={handleCreateShip}
                    onDeleteShip={handleDeleteShip}
                />
            )}
        </div>
    )
}
