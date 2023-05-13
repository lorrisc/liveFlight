// initialisation de la carte
map = L.map("maps").setView([46.227638, 2.213749], 6);
map.attributionControl.remove();

let googleTerrain = L.tileLayer("http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    minZoom: 2,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
});

googleTerrain.addTo(map);

// terminator - phase jour/nuit
var terminator = L.terminator();
terminator.addTo(map);

terminator.setStyle({
    color: "#00",
    fillColor: "#00",
    opacity: 0.5,
});

setInterval(function () {
    updateTerminator(terminator);
}, 2000);
function updateTerminator(terminator) {
    terminator.setTime();
}

// limite carte monde
var southWest_world = L.latLng(-90, -180);
var northEast_world = L.latLng(90, 180);
var bounds_world = L.latLngBounds(southWest_world, northEast_world);
map.setMaxBounds(bounds_world);

function getMapCoord() {
    // coordonnées zone visible carte
    let bounds = map.getBounds();
    let southWest = bounds.getSouthWest();
    let northEast = bounds.getNorthEast();

    // coord max et min
    let latitudeMax = northEast.lat;
    let latitudeMin = southWest.lat;
    let longitudeMax = northEast.lng;
    let longitudeMin = southWest.lng;

    return [latitudeMax, latitudeMin, longitudeMax, longitudeMin];
}

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

// marker
const iconOptions = {
    iconUrl: "assets/plane.svg",
    iconSize: [22, 22],
};
const customIcon = L.icon(iconOptions);

var markers = L.markerClusterGroup();

// get and display flights
function getAndDisplayFlights() {
    let coord = getMapCoord();
    getFlights(coord[0], coord[1], coord[2], coord[3]).then((data) => {
        markers.clearLayers();

        console.log("nb vols : " + data.states.length + "  -  heure : " + data.time);

        // display flights
        if (data.states) {
            data.states.forEach((flight) => {
                // add markers
                let markerOptions = {
                    icon: customIcon,
                    rotationAngle: flight[10],
                };

                markers.addLayer(L.marker([flight[6], flight[5]], markerOptions));
            });
            map.addLayer(markers);
        }

        // update flights on zoom/drag
        let date = new Date();
        let isAlreadyUpdate = false;

        map.on("zoom drag", function (event) {
            if (!isAlreadyUpdate) {
                isAlreadyUpdate = true;

                let dateZoom = new Date();

                // vérifie le délaie entre les requêtes
                if (dateZoom - date > 10000) {
                    getAndDisplayFlights();
                } else {
                    setTimeout(() => {
                        getAndDisplayFlights();
                    }, 10000 - (dateZoom - date));
                }
            }
        });

        // update flights every 10 seconds
        if (!isAlreadyUpdate) {
            isAlreadyUpdate = true;
            setTimeout(getAndDisplayFlights, 10000);
        }
    });
}

getAndDisplayFlights();
