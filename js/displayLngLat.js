let marker = L.marker("", {draggable: true});
let popup = L.popup();

function onMapClick(e) {
    updatePopup(e.latlng);

    marker.setLatLng(e.latlng)
        .bindPopup(popup).addTo(map);

    popup.openOn(map);

    updateLngLat(e.latlng)
}

function updatePopup(latlng) {
    popup.setLatLng(latlng)
        .setContent("Latitude : " + latlng.lat + "<br> Longitude : " + latlng.lng);
}

function updateLngLat(latlng) {
    $("#champ_input_4").val(latlng.lat);
    $("#champ_input_5").val(latlng.lng);
}

map.on('click', onMapClick);

marker.on('dragend', function (e) {
    updatePopup(e.target._latlng);
    popup.openOn(map);
    updateLngLat(e.target._latlng);
});

