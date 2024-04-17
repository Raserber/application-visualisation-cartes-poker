toggle_leftPanel = document.getElementById("toggle_leftPanel")
commandPanel = document.getElementById("commandPanel")
bouton_ajouterCarte = document.getElementById("ajouterCarte")
bouton_enleverCarte = document.getElementById("enleverCarte")
bouton_montrerCartes = document.getElementById("montrerCartes")
bouton_export = document.getElementById("export")
bouton_import = document.getElementById("import")
bouton_modify = document.getElementById("modify")

toggle_leftPanel.addEventListener("click", () => {

    boolVisibilite_leftPanel ? leftPanel.style.visibility = "visible" : leftPanel.style.visibility = "hidden"
    
    boolVisibilite_leftPanel = !boolVisibilite_leftPanel
})

bouton_ajouterCarte.addEventListener("click", () => {
    
    swal.fire({
        title: "Passez une nouvelle carte sur un des lecteurs",
        html: "<img src='./img/icon.png' style='width: 70%' />",
        showConfirmButton: false
    }).then(() => {
        setTimeout(swal.clickConfirm, 10)
    })
})

bouton_enleverCarte.addEventListener("click", () => {

    bool_enleverCarte = true

    swal.fire({
        title: "Passez la carte &#224; enlever sur un des lecteurs",
        html: "<img src='./img/icon.png' style='width: 70%' />",
        showConfirmButton: false
    }).then(e => {bool_enleverCarte = false})
})

bouton_montrerCartes.addEventListener("click", () => {

    montrerCartes()
})


bouton_export.addEventListener("click", () => {
    
    swal.fire({
        title: "export",
        input: "textarea",
        inputValue: JSON.stringify(storedData.cards)
    })
})

bouton_import.addEventListener("click", () => {
    
    swal.fire({
        title: "import",
        input: "textarea",
        inputValidator: (str) => {
            try {
                JSON.parse(str);
            } catch (e) {
                return "Veuillez importer un JSON valide";
            }

        }
    }).then(str => {

       if (str.isConfirmed) {
        
        data = JSON.parse(str.value)
        storedData.cards = data
        window.electronAPI.storedData(storedData)
    }
    })
})
bouton_modify.addEventListener("click", () => {
    
    swal.fire({
        title: "Modifier les cartes",
        input: "textarea",
        inputValue: JSON.stringify(storedData.cards),
        inputValidator: (str) => {
            try {
                JSON.parse(str);
            } catch (e) {
                return "Veuillez importer un JSON valide";
            }

        }
    }).then(str => {

       if (str.isConfirmed) {
        
        data = JSON.parse(str.value)
        storedData.cards = data
        window.electronAPI.storedData(storedData)
    }
    })
})
// -------------------------------------------------------------------------

function montrerCartes() {
    swal.fire({
        title: `Cartes enregitr&#233;es (${Object.keys(storedData.cards).length})`,
        html : `<div id="flexboxMontrerCartes"></div>`,
        width: "800px",
        background: "#c8c8c8"
    })
    
    setTimeout(generateCard_mc(storedData.cards), 500)
}

function generateCard_mc(cards) {

    for (UID in cards) {
        var div = document.createElement('span')
        div.setAttribute("class", "container")
        div.innerHTML = `<object type="image/svg+xml" data="./img/card.svg" class="card" id="card-Z${UID}" style="width:100px"></object><span style="font-size: 20px; overflow: hidden">${UID}</span>`.trim();
        document.querySelector("#flexboxMontrerCartes").append(div)
    }

    try { // setTimeout arrivant apres l'execution du premier 'for',
          // la valeur de UID a été fixé, il prend la derniere valeur avoir été donnée
        setTimeout(() => {
            for (UID in cards) {
                changerCarte(cards[UID].nombre, cards[UID].couleur, "Z" + UID, true)
                document.querySelector(`#card-Z${UID}`).contentDocument.addEventListener("click", (htmlObject)=> {
                    var ZUID = htmlObject.target.ownerSVGElement.attributes[6].nodeValue.substring(1)

                    swal.fire({
                        title: `Carte : ${ZUID}`,
                        background: "#c8c8c8",
                        showConfirmButton: true,
                        showDenyButton: true,
                        showCancelButton: true,
                        confirmButtonText: "Changer carte",
                        denyButtonText: "Supprimer",
                        cancelButtonText: "Annuler",
                        html: '<object type="image/svg+xml" data="./img/card.svg" id="card-Y" style="width:150px;"></object>',
                    }).then((result)=> {

                        if (result.isConfirmed) {
                            
                            swalNouvelleCarte(ZUID)
                            setTimeout(swal.clickConfirm, 10)
                        }

                        else if (result.isDenied) {

                            delete storedData.cards[ZUID]
                            window.electronAPI.storedData(storedData)
                        }
                        
                        if (!result.isConfirmed) {
                            montrerCartes()
                        }
                    })
                    
                    setTimeout(() => {changerCarte(cards[ZUID].nombre, cards[ZUID].couleur, "Y", true)}, 100)
                })
            }
        }, 100)
    }
    
    catch {
        document.querySelector(`#card-${UID}`).remove()
    }
}