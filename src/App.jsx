import { useEffect, useState } from "react" // React Hooks importieren für State-Management und Seiteneffekte
import Map from "./Map" // Karten-Komponente importieren
import ControlPanel from "./ControlPanel" // Steuerungspanel-Komponente importieren
import ShipModal from "./ShipModal" // Modal-Dialog für Schiff-Erstellung importieren
import ShipDashboard from "./ShipDashboard" // Dashboard für Schiff-Übersicht importieren
import { getShips, moveShipDirection, deployDiver, getDivers, createShip, deleteShip, navigateShip } from "./api" // API-Funktionen für Backend-Kommunikation
import "./App.css" // Styling für die App

const BASE_PORT = 300 // Startport für neue Schiffe

export default function App() {
    // State-Variablen für die App
    const [ships, setShips] = useState([]) // Liste aller Schiffe
    const [divers, setDivers] = useState([]) // Liste aller aktiven Taucher/Submarines
    const [selectedShip, setSelectedShip] = useState(null) // Das aktuell ausgewählte Schiff für die Steuerung
    const [treasures, setTreasures] = useState(0) // Anzahl gefundener Schätze
    const [modal, setModal] = useState(null) // Modal-State: { x, y, existingShip } - wird angezeigt wenn man auf die Karte klickt
    const [usedPorts, setUsedPorts] = useState(new Set()) // Set mit bereits verwendeten Ports um Duplikate zu vermeiden

    // Funktion um den nächsten freien Port zu finden
    function getNextAvailablePort() {
        let port = BASE_PORT // Starte bei 300
        while (usedPorts.has(port)) { // Solange der Port schon verwendet wird...
            port++ // ...gehe zum nächsten Port hier wird der Port immer um 1 erhöht
        }
        return port // Gib den ersten freien Port zurück
    }

    // Lädt alle Schiffe und Taucher vom Backend
    async function load() {
        const newShips = await getShips() // holt alle schiffe vom backend
        setShips(newShips) // Aktualisiere den Ships-State
        setDivers(await getDivers()) // Hole und setze alle Taucher
        // Aktualisiere das ausgewählte Schiff mit neuen Koordinaten
        if (selectedShip) {
            const updated = newShips.find(s => s.id === selectedShip.id) // Suche das ausgewählte Schiff in der neuen Liste
            if (updated) setSelectedShip(updated) // wenn ein ship gefunden wird, aktuallisieren
            else setSelectedShip(null) // wenn nix gefunden wird oder gelöscht wird wird der wert auf null gesetzt
        }
    }

    // useEffect Hook - wird beim Start der App ausgeführt (nur einmal)
    useEffect(() => {
        load() // Lade Daten nur einmal beim Start
    }, []) // Leeres Array = wird nur beim ersten Rendern ausgeführt

    // Manueller Refresh-Button Handler
    async function handleRefresh() {
        console.log("Manueller Refresh ausgelöst");
        await load();
    }

    // Schiff in eine Richtung bewegen
    async function handleMoveDirection(direction) {
        if (!selectedShip) return // Wenn kein Schiff ausgewählt ist, mache nichts
        await moveShipDirection(selectedShip.id, direction) // Sende Bewegungsbefehl ans Backend
        await load() // Sofort neu laden um die neue Position anzuzeigen
    }

    // Taucher/Submarine vom ausgewählten Schiff starten
    async function handleDeployDiver() {
        if (!selectedShip) return // Wenn kein Schiff ausgewählt ist, mache nichts
        await deployDiver(selectedShip.id) // Sende Befehl zum Starten des Submarines ans Backend
        await load() // Sofort neu laden um den neuen Taucher anzuzeigen
    }

    // Wird aufgerufen wenn der User auf eine Zelle der Karte klickt
    function onCellClick(x, y) {
        const existingShip = ships.find(s => s.x === x && s.y === y) // Prüfe ob schon ein Schiff auf dieser Position ist
        setModal({ x, y, existingShip }) // Öffne das Modal mit den Koordinaten und ggf. dem existierenden Schiff
    }

    // Neues Schiff erstellen
    async function handleCreateShip(name, x, y, port) {
        await createShip(name, x, y, "S", port) // Sende Erstellungsbefehl ans Backend (Richtung immer "S" = Süden)
        setUsedPorts(new Set([...usedPorts, port])) // Füge den verwendeten Port zum Set hinzu
        await load() // Lade die Schiffsliste neu
    }

    // Schiff löschen
    async function handleDeleteShip(id) {
        const ship = ships.find(s => s.id === id) // Finde das zu löschende Schiff
        if (ship && ship.port) { // Wenn das Schiff einen Port hatte...
            const newUsedPorts = new Set(usedPorts) // Erstelle eine Kopie des Port-Sets
            newUsedPorts.delete(ship.port) // Entferne den Port aus dem Set
            setUsedPorts(newUsedPorts) // Aktualisiere das Port-Set
        }
        if (selectedShip?.id === id) { // Wenn das gelöschte Schiff das ausgewählte war...
            setSelectedShip(null) // ...setze die Auswahl zurück
        }
        await deleteShip(id) // Sende Löschbefehl ans Backend
        await load() // Lade die Schiffsliste neu
    }

    // JSX - Die visuelle Struktur der App
    return (
        <div className="app">
            <h1 className="title">🌊 Ocean Explorer</h1>

            <div className="main-content">
                {/* Steuerungspanel auf der linken Seite - enthält Kompass und Schiffsauswahl */}
                <ControlPanel
                    selectedShip={selectedShip} // Das aktuell ausgewählte Schiff
                    ships={ships} // Liste aller Schiffe für die Dropdown-Auswahl
                    onSelectShip={setSelectedShip} // Callback wenn ein Schiff ausgewählt wird
                    onMoveDirection={handleMoveDirection} // Callback für Kompass-Steuerung
                    onDeployDiver={handleDeployDiver} // Callback für Submarine-Start
                    onDeleteShip={handleDeleteShip} // Callback zum Löschen eines Schiffs
                    onRefresh={handleRefresh} // Callback für manuellen Refresh
                />

                {/* Karte in der Mitte - zeigt das Spielfeld mit Schiffen und Tauchern */}
                <Map
                    ships={ships} // Alle Schiffe die angezeigt werden sollen
                    divers={divers} // Alle Taucher die angezeigt werden sollen
                    onCellClick={onCellClick} // Callback wenn auf eine Zelle geklickt wird
                    selectedShipId={selectedShip?.id} // ID des ausgewählten Schiffs für Hervorhebung
                />

                {/* Übersichts-Sidebar auf der rechten Seite - zeigt Statistiken */}
                <div className="sidebar">
                    <h2 className="sidebar-title">📊 Übersicht</h2>

                    {/* Statistik-Karte für aktive Schiffe */}
                    <div className="stat-card">
                        <div className="stat-icon">🚢</div>
                        <div className="stat-info">
                            <span className="stat-value">{ships.length}</span> {/* Anzahl der Schiffe */}
                            <span className="stat-label">Aktive Schiffe</span>
                        </div>
                    </div>

                    {/* Statistik-Karte für aktive Submarines/Taucher */}
                    <div className="stat-card">
                        <div className="stat-icon">🤿</div>
                        <div className="stat-info">
                            <span className="stat-value">{divers.length}</span> {/* Anzahl der Taucher */}
                            <span className="stat-label">Aktive Submarins</span>
                        </div>
                    </div>

                    {/* Statistik-Karte für gefundene Schätze */}
                    <div className="stat-card treasure">
                        <div className="stat-icon">💎</div>
                        <div className="stat-info">
                            <span className="stat-value">{treasures}</span> {/* Anzahl der Schätze */}
                            <span className="stat-label">Schätze gefunden</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard - Übersicht aller Schiffe analog zur Datenbank */}
            <ShipDashboard
                ships={ships} // Alle Schiffe für die Tabelle
                divers={divers} // Alle Taucher für die Submarine-Zählung
                selectedShipId={selectedShip?.id} // ID des ausgewählten Schiffs für Hervorhebung
                onSelectShip={setSelectedShip} // Callback wenn ein Schiff in der Tabelle angeklickt wird
            />

            {/* Modal-Dialog zum Erstellen/Löschen von Schiffen - wird nur angezeigt wenn modal nicht null ist */}
            {modal && (
                <ShipModal
                    x={modal.x} // X-Koordinate der geklickten Zelle
                    y={modal.y} // Y-Koordinate der geklickten Zelle
                    existingShip={modal.existingShip} // Falls ein Schiff auf dieser Position existiert
                    nextPort={getNextAvailablePort()} // Der nächste verfügbare Port für ein neues Schiff
                    onClose={() => setModal(null)} // Callback zum Schließen des Modals
                    onCreateShip={handleCreateShip} // Callback zum Erstellen eines neuen Schiffs
                    onDeleteShip={handleDeleteShip} // Callback zum Löschen eines Schiffs
                />
            )}
        </div>
    )
}
