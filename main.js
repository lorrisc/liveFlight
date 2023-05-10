// initialisation de la carte
map = L.map("maps").setView([46.227638, 2.213749], 6);
map.attributionControl.remove();

let googleTerrain = L.tileLayer("http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
});

googleTerrain.addTo(map);

// coordonnées zone visible carte
let bounds = map.getBounds();
let southWest = bounds.getSouthWest();
let northEast = bounds.getNorthEast();

// coord max et min
let latitudeMax = northEast.lat;
let latitudeMin = southWest.lat;
let longitudeMax = northEast.lng;
let longitudeMin = southWest.lng;

// recupération des vols
async function getFlights(latMax, latMin, lonMax, lonMin) {
    let url = "https://opensky-network.org/api/states/all?lamin=" + latMin + "8&lomin=" + lonMin + "&lamax=" + latMax + "&lomax=" + lonMax + "";

    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error("Erreur lors de la requête à l'API OpenSky : " + error);
        });
}

// Delete all markers
function clearMarkers() {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
}

// marker
const iconOptions = {
    iconUrl: "assets/plane.svg",
    iconSize: [22, 22],
};
const customIcon = L.icon(iconOptions);

// get and display flights
function getAndDisplayFlights() {
    getFlights(latitudeMax, latitudeMin, longitudeMax, longitudeMin).then((data) => {
        clearMarkers();

        data.states.forEach((flight) => {
            // add markers
            let markerOptions = {
                icon: customIcon,
                rotationAngle: flight[10],
            };

            let markerPoint = new L.marker([flight[6], flight[5]], markerOptions).addTo(map);
        });
    });
}

getAndDisplayFlights();

setInterval(getAndDisplayFlights, 15000);
