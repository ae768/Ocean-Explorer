// Map-Komponente - Zeigt das Spielfeld als Gitter an
// Props:
//   - ships: Array aller Schiffe mit Positionen
//   - divers: Array aller Taucher/Submarines mit Positionen
//   - onCellClick: Callback wenn auf eine Zelle geklickt wird
//   - selectedShipId: ID des ausgewählten Schiffs (für Hervorhebung)
export default function Map({ ships, divers, onCellClick, selectedShipId }) {
    const size = 100    // Größe des Gitters (100x100 = 10.000 Zellen)
    const cellSize = 8  // Größe jeder Zelle in Pixeln

    return (
        // Container für die Karte - verwendet CSS Grid für das Layout
        <div className="map" style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
            {/* Erstelle ein Array mit size*size Elementen und mappe über jeden Index */}
            {[...Array(size * size)].map((_, i) => {
                // Berechne X und Y Koordinaten aus dem linearen Index
                const x = i % size           // X = Rest bei Division (0-99)
                const y = Math.floor(i / size) // Y = Ganzzahlige Division (0-99)

                // Prüfe ob sich ein Schiff auf dieser Position befindet
                const ship = ships.find(s => s.x === x && s.y === y)
                // Prüfe ob sich ein Taucher auf dieser Position befindet
                const diver = divers.find(d => d.x === x && d.y === y)

                // Baue die CSS-Klasse für diese Zelle zusammen
                let cellClass = "cell"
                if (ship) {
                    cellClass += " ship" // Füge "ship" Klasse hinzu wenn Schiff vorhanden
                    if (ship.id === selectedShipId) {
                        cellClass += " selected" // Füge "selected" hinzu wenn es das ausgewählte Schiff ist
                    }
                }
                if (diver) cellClass += " diver" // Füge "diver" Klasse hinzu wenn Taucher vorhanden

                // Rendere die einzelne Zelle
                return (
                    <div
                        key={i}  // Eindeutiger Schlüssel für React
                        className={cellClass}  // CSS-Klassen für Styling
                        onClick={() => onCellClick(x, y)}  // Bei Klick: Callback mit Koordinaten aufrufen
                        style={{ width: cellSize, height: cellSize }}  // Größe der Zelle
                    />
                )
            })}
        </div>
    )
}
