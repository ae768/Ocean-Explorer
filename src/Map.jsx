export default function Map({ ships, divers, onCellClick, selectedShipId }) {
    const size = 100
    const cellSize = 8

    return (
        <div className="map" style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
            {[...Array(size * size)].map((_, i) => {
                const x = i % size
                const y = Math.floor(i / size)

                const ship = ships.find(s => s.x === x && s.y === y)
                const diver = divers.find(d => d.x === x && d.y === y)

                let cellClass = "cell"
                if (ship) {
                    cellClass += " ship"
                    if (ship.id === selectedShipId) {
                        cellClass += " selected"
                    }
                }
                if (diver) cellClass += " diver"

                return (
                    <div
                        key={i}
                        className={cellClass}
                        onClick={() => onCellClick(x, y)}
                        style={{ width: cellSize, height: cellSize }}
                    />
                )
            })}
        </div>
    )
}
