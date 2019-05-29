// Layer support for marker cluster
let mcgLayerSupportGroup = L.markerClusterGroup.layerSupport();
mcgLayerSupportGroup.addTo(map);

// Create all the layer group we want
let arbres = L.layerGroup();
let espaces = L.layerGroup();
let alignement = L.layerGroup();

let groupe = {
    name: "Catégories"
};

// Add an overlay in order to choose what you want to display
panelLayers.addOverlay({
    icon: '<i class="icon icon-arbre"></i>',
    layer: espaces
}, "Espaces boisés", groupe);

panelLayers.addOverlay({
    icon: '<i class="icon icon-arbre"></i>',
    layer: alignement
}, "Alignements", groupe);

panelLayers.addOverlay({
    icon: '<i class="icon icon-arbre"></i>',
    layer: arbres
}, "Arbres remarquables", groupe);

createM('data/espaces_boises.geojson', espaces);
createM('data/alignements.geojson', alignement);


/**
 * Retrieve geoJSON file to add marker on the map and add them to a layer group
 * @param url
 * @param layerGroup
 */
function createM(url, layerGroup) {
    $.getJSON(url, function (data) {
        L.geoJson(data, {
            pointToLayer: function (feature, latlng) {
                let iconUrl = "images/icons/marker/alignement.png";

                if(feature.properties["Adresse de l'espace boisé"] !== undefined) {
                    iconUrl = "images/icons/marker/espace";

                    if (feature.properties["Biodiversité"] !== undefined) {
                        iconUrl += "_abri";
                    }

                    iconUrl += ".png";
                }

                let icon = L.icon({
                    iconUrl: iconUrl,
                    iconSize: [30, 40]
                });

                return L.marker(latlng, {icon: icon});
            },
            onEachFeature: function (feature, layer) {
                layer.on('click', function () {

                    let regex = /.*\.png|.*\.jpg/;
                    let imageName = feature.properties["Photo"].match(regex);

                    let popupText = "<h1> Informations </h1>";

                    if (imageName !== null) {
                        popupText += "<img alt='Photo de l arbre' class='popup-image' src='images/arbres/reponse_" +
                            feature.properties["Identifiant"] + "/fichiers_1/" + imageName + "'/>" + "<br>";
                    }

                    Object.keys(feature.properties).forEach(function(key){
                        if (key !== "Photo" && key !== "Identifiant") {
                            popupText += "<b>" + key + ": </b>" + feature.properties[key] + "<br/>";
                        }
                    });

                    sidebar.setContent(popupText);
                    sidebar.show();
                });
            },
            filter: function (feature, layer) {
                return true;
            }
        }).addTo(layerGroup);

    });

    // Ajoute le layer dans le clustering
    mcgLayerSupportGroup.addLayer(layerGroup);
    // Ajoute les arbres sur la carte
    layerGroup.addTo(map);
}

let checkboxStates;

/**
 * Retrieve geoJSON file to add marker on the map and add them to a layer group
 * @param url
 * @param layerGroup
 */
function createMarker(url, layerGroup) {
    $.getJSON(url, function (data) {
        L.geoJson(data, {
            pointToLayer: function (feature, latlng) {
                let iconUrl = "images/icons/marker/arbre_vert";

                if (feature.properties["Vérification"] !== undefined &&
                    feature.properties["Vérification"] === "Non") {
                    iconUrl = "images/icons/marker/arbre_orange";
                }

                if (feature.properties["Biodiversité"] !== undefined) {
                    iconUrl += "_abri";
                }

                iconUrl += ".png";

                let icon = L.icon({
                    iconUrl: iconUrl,
                    iconSize: [30, 40]
                });

                return L.marker(latlng, {icon: icon});
            },
            onEachFeature: function (feature, layer) {
                layer.on('click', function () {

                    let regex = /.*\.png|.*\.jpg/;
                    let imageName = feature.properties["Photo"].match(regex);

                    let popupText = "<h1> Informations </h1>";

                    if (imageName !== null) {
                        popupText += "<img alt='Photo de l arbre' class='popup-image' src='images/arbres/reponse_" +
                            feature.properties["Identifiant"] + "/fichiers_1/" + imageName + "'/>" + "<br>";
                    }

                    Object.keys(feature.properties).forEach(function(key){
                        if (key !== "Photo" && key !== "Identifiant") {
                            popupText += "<b>" + key + ": </b>" + feature.properties[key] + "<br/>";
                        }
                    });

                    sidebar.setContent(popupText);
                    sidebar.show();
                });
            },
            filter: function (feature, layer) {

                let nomArbreList = [
                    "Chêne", "Frêne", "Peuplier", "Pin", "Cèdre", "Érable", "Séquoia", "Platane", "Marronnier",
                    "Châtaigner", "Hêtre", "Magniolia", "Tilleul"
                ];

                let isTypeChecked;

                if (checkboxStates["type-arbre"].includes("Autre") && !nomArbreList.includes(feature.properties["Nom de l'arbre"])) {
                    isTypeChecked = true;
                } else {
                    isTypeChecked = checkboxStates["type-arbre"].includes(feature.properties["Nom de l'arbre"]);
                }
                const isRemarquabiliteChecked = checkboxStates["remarquabilite"].includes(feature.properties["Remarquabilité"]);
                const isVerified = checkboxStates["verification"].includes(feature.properties["Vérification"]);
                let especePresente;

                if (checkboxStates["presence-espece"].includes("Oui") && feature.properties["Biodiversité"] !== undefined) {
                    especePresente = true;
                } else if (checkboxStates["presence-espece"].includes("Non") && feature.properties["Biodiversité"] === undefined) {
                    especePresente = true;
                } else {
                    especePresente = false;
                }

                return isTypeChecked && isRemarquabiliteChecked && isVerified && especePresente;
            }
        }).addTo(layerGroup).on('click', function () {
            sidebar.show();
        });
    });

    // Ajoute le layer dans le clustering
    mcgLayerSupportGroup.addLayer(layerGroup);
    // Ajoute les group sur la carte
    layerGroup.addTo(map);
}

function updateCheckboxStates() {
    checkboxStates = {
        "type-arbre": [],
        "remarquabilite": [],
        "verification": [],
        "presence-espece": []
    };

    for (let input of document.querySelectorAll('.filtre')) {
        if (input.checked) {
            switch (input.className) {
                case 'type-arbre filtre':
                    checkboxStates["type-arbre"].push(input.value);
                    break;
                case 'remarquabilite filtre':
                    checkboxStates.remarquabilite.push(input.value);
                    break;
                case 'verification filtre':
                    checkboxStates.verification.push(input.value);
                    break;
                case 'presence-espece filtre':
                    checkboxStates["presence-espece"].push(input.value);
                    break;
            }
        }
    }
}


for (let input of document.querySelectorAll('input')) {
    //Listen to 'change' event of all inputs
    input.onchange = (e) => {
        arbres.clearLayers();
        updateCheckboxStates();
        // Add the geoJSON shapes in the right layer group
        createMarker('data/arbres.geojson', arbres);
    }
}

updateCheckboxStates();

createMarker('data/arbres.geojson', arbres);