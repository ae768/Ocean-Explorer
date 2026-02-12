const API = "http://localhost:8080/api"




export async function getShips() {

}


export async function createShip(name, x, y) {
        const response = await fetch(`${API}/ships`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, x, y })
        });
        return response.json();
}

export async function deleteShip(id) {

}
export async function navigateShip(shipId, rudder, course) {
    await fetch(`${API}/navigate`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            shipid: shipId,
            rudder: rudder,
            course: course
        })
    });
}


export async function moveShipDirection(id, direction) {


}

export async function deploySubmarin(shipId) {

}

export async function getSubmarin() {


}
