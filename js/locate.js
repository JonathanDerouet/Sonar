$( document ).ready(function() {
/*TODO: only on the form --> need to move
*   seulement une fois ou au clic sur bouton
*/
    map.on('locationfound', function (e) {
        $("#champ_input_4").val(e.latlng.lat);
        $("#champ_input_5").val(e.latlng.lng);
    });
    map.locate({setView: true, maxZoom: 11, enableHighAccuracy: true});
});