let map = L.map('map');

/*
    Définition des fonds de cartes
    Utilisation de la notation du plugin leaflet-panel-layers
    https://github.com/stefanocudini/leaflet-panel-layers
*/
let baseLayers = [
    {
        group: "Fond de carte",
        collapsed: false,
        layers: [
            {
                name: "Open Street Map",
                icon: '<i class="icon icon-map-osm"></i>',
                    layer: L.tileLayer.provider('OpenStreetMap.France', {maxZoom: 18}).addTo(map)
            },
            {
                name: "Vue satellite",
                icon: '<i class="icon icon-map-esri"></i>',
                layer: L.tileLayer.provider('Esri.WorldImagery', {maxZoom: 18})
            }
        ]
    }
];

/*
    Définition des couches superposables
    Utilisation de la notation du plugin leaflet-panel-layers
    https://github.com/stefanocudini/leaflet-panel-layers
*/
let overLayers = [
    {
        group: "Source externe",
        collapsed: true,
        layers: [
            {
                name: "Plan d'eau",
                icon: '<i class="icon icon-plan-eau"></i>',
                layer: L.tileLayer.wms('http://services.sandre.eaufrance.fr/geo/zonage?', {
                    layers: 'PlanEau_FXX',
                    format: 'image/png',
                    transparent: true,
                    attribution: "&copy; <a href='http://www.sandre.eaufrance.fr/'>Sandre</a>"
                })
            },
            {
                name: "Zico",
                icon: '<i class="icon icon-zico"></i>',
                layer: L.tileLayer.wms('http://ws.carmencarto.fr/WMS/119/fxx_inpn?', {
                    layers: 'ZICO',
                    format: 'image/png',
                    transparent: true,
                    opacity: 0.5,
                    attribution: "&copy; <a href='http://carmen.naturefrance.fr/'>Carmen</a>"
                })
            },
            {
                name: "Parc naturel",
                icon: '<i class="icon icon-parc-naturel"></i>',
                layer: L.tileLayer.wms('http://ws.carmencarto.fr/WMS/119/fxx_inpn?', {
                    layers: 'Parcs_naturels_regionaux',
                    format: 'image/png',
                    transparent: true,
                    opacity: 0.5,
                    attribution: "&copy; <a href='http://carmen.naturefrance.fr/'>Carmen</a>"
                })
            },
            {
                name: "ZSC - SIC",
                icon: '<i class="icon icon-zcs-sic"></i>',
                layer: L.tileLayer.wms('http://ws.carmencarto.fr/WMS/119/fxx_inpn?', {
                    layers: 'Sites_d_importance_communautaire_JOUE__ZSC_SIC_',
                    format: 'image/png',
                    transparent: true,
                    attribution: "&copy; <a href='http://carmen.naturefrance.fr/'>Carmen</a>"
                })
            },
            {
                name: "Sites d'importance communautaire",
                icon: '<i class="icon icon-sic"></i>',
                layer: L.tileLayer.wms('http://ws.carmencarto.fr/WMS/119/fxx_inpn?', {
                    layers: 'Sites_d_importance_communautaire',
                    format: 'image/png',
                    transparent: true,
                    opacity: 0.5,
                    attribution: "&copy; <a href='http://carmen.naturefrance.fr/'>Carmen</a>"
                })
            },
            {
                name: "Zones de protection speciale",
                icon: '<i class="icon icon-zps"></i>',
                layer: L.tileLayer.wms('http://ws.carmencarto.fr/WMS/119/fxx_inpn?', {
                    layers: 'Zones_de_protection_speciale',
                    format: 'image/png',
                    transparent: true,
                    opacity: 0.5,
                    attribution: "&copy; <a href='http://carmen.naturefrance.fr/'>Carmen</a>"
                })
            }
        ]
    }

];

// Modification de l'attribution pour ajouter les liens vers les ressources qui doivent être citées
map.attributionControl.addAttribution('Icon made by &copy; <a href="https://www.iconfinder.com/bukeicon">Bukeicon</a> and &copy; <a href="https://www.freepik.com/">Freepik</a>');

/*
    Création du panneau de contrôle avec les fonds de carte et les différentes couches
    Utilisation de la notation du plugin leaflet-panel-layers
    https://github.com/stefanocudini/leaflet-panel-layers
*/
var panelLayers = new L.control.panelLayers(baseLayers, overLayers, {
    collapsibleGroups: true,
    collapsed: true
});

/*
    Ajout du bouton de geolocalisation
    Utilisation de la notation du plugin leaflet-locatecontrol
    https://github.com/domoritz/leaflet-locatecontrol
 */
L.control.locate({
    strings: {
        popup: "Vous êtes dans les {distance} mètres autour de ce point"
    }
}).addTo(map);

// Ajout du panneau de contrôle
map.addControl(panelLayers);
// Localisation à l'affichage de la carte
map.locate({setView: true, maxZoom: 11, enableHighAccuracy: true});

var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
});
map.addControl(sidebar);

map.on('click', function () {
    sidebar.hide();
});