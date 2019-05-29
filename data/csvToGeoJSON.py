#!/usr/bin/env python3

import csv
import json

arbres = {
    "type":"FeatureCollection",
    "features": []
}

alignements = {
    "type":"FeatureCollection",
    "features": []
}

espaces_boises = {
    "type":"FeatureCollection",
    "features": []
}

def cleanConcat(row1, row2):
    data = ""
    if(row1.strip() and row1 != "*Sans réponse*"):
        data += row1
    if(row2.strip() and row2 != "*Sans réponse*"):
        data += row2
    return data

def checkEmptyOrNoResponse(row):
    return row.strip() and not row.startswith("*Sans réponse*")

def updateJsonResponse(json, row, fieldsToCheck, fieldsToConcat):
    for field in fieldsToCheck:
        if(checkEmptyOrNoResponse(row[fieldsToCheck[field]])):
            json['properties'].update({field: row[fieldsToCheck[field]]})

    for field in fieldsToConcat:
        cleanString = cleanConcat(row[fieldsToConcat[field][0]], row[fieldsToConcat[field][1]])
        if(checkEmptyOrNoResponse(cleanString)):
            json['properties'].update({field: cleanString})

with open('alignements.csv', newline='') as csvfile:
    linereader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(linereader)
    for row in linereader:
        
        jsonAlignement = {
            "type":"Feature",
            "geometry":{  
                "type":"Point",
                "coordinates":[  
                    row[4],
                    row[3]
                ]
            },
            "properties":{
                "Identifiant": row[0],
                "Date": row[1],
                "Photo": row[6]
            }
        }

        fieldsToCheck = {
            "Nom à afficher": 2,
            "Adresse de l'alignement": 5, 
            "Visibilité": 7,
            "Nombre d'arbres": 8,
            "Nombre d'espèces": 9,
            "Nom botanique": 12,
            "Protection": 15,
            "Observations": 16,
            "Vérification": 17
        }

        fieldsToConcat = {
            "Espèces": [10, 11], 
            "Lien": [13, 14]
        }

        updateJsonResponse(jsonAlignement, row, fieldsToCheck, fieldsToConcat)
        alignements['features'].append(jsonAlignement)

with open('espaces.csv', newline='') as csvfile:
    linereader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(linereader)
    for row in linereader:
        
        biodiversite = ""
        if(row[14].strip() and row[14] != "*Sans réponse*"):
            biodiversite += row[14] 
        if(row[15].strip() and row[15] != "*Sans réponse*"):
            biodiversite += row[15]

        jsonEspace = {
            "type":"Feature",
            "geometry":{  
                "type":"Point",
                "coordinates":[  
                    row[4],
                    row[3]
                ]
            },
            "properties":{
                "Identifiant": row[0],
                "Date": row[1],
                "Photo": row[6]
            }
        }

        fieldsToCheck = {
            "Nom à afficher": 2,
            "Adresse de l'espace boisé": 5, 
            "Visibilité": 7,
            "Nombre d'arbres": 8,
            "Nombre d'espèces": 9,
            "Niveaux": 10,
            "Point d'eau": 11,
            "Abris d'animaux": 12,
            "Éclairage": 13,
            "Ombre": 16,
            "Entretien": 17,
            "Globalement": 18,
            "Observations": 19
        }

        fieldsToConcat = {
            "Biodiversité": [14, 15]
        }

        updateJsonResponse(jsonEspace, row, fieldsToCheck, fieldsToConcat)
        espaces_boises['features'].append(jsonEspace)

with open('arbres.csv', newline='') as csvfile:
    linereader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(linereader)
    for row in linereader:
        if(row[3] == "Autre (précisez ci-dessous)"):
            nom_arbre = row[4] 
        else:
            nom_arbre = row[3]

        jsonArbre = {
            "type":"Feature",
            "geometry":{  
                "type":"Point",
                "coordinates":[  
                    row[7],
                    row[6]
                ]
            },
            "properties":{
                "Identifiant": row[0],
                "Date": row[1],
                "Nom de l'arbre": nom_arbre,
                "Photo": row[9]
            }
        }

        fieldsToCheck = {
            "Nom à afficher": 2,
            "Nom botanique": 5, 
            "Adresse": 8,
            "Visibilité": 10,
            "Remarquabilité": 15,
            "Observations": 16,
            "Vérification": 17
        }

        fieldsToConcat = {
            "Remaquable": [11, 12],
            "Biodiversité": [13, 14]
        }

        updateJsonResponse(jsonArbre, row, fieldsToCheck, fieldsToConcat)
        arbres['features'].append(jsonArbre)

def writeFile(fileName, data):
    with open(fileName, 'w') as outfile:
        json.dump(data, outfile, ensure_ascii=False, indent=4)
        
writeFile('alignements.geojson', alignements)
writeFile('espaces_boises.geojson', espaces_boises)
writeFile('arbres.geojson', arbres)