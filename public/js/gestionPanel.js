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
        title: "Passez la carte à enlever sur un des lecteurs",
        html: "<img src='./img/icon.png' style='width: 70%' />",
        showConfirmButton: false
    }).then(e => {bool_enleverCarte = false})
})

bouton_montrerCartes.addEventListener("click", () => {

    swal.fire({
        title: "Cartes enregitrees",
        html : `<div id="flexboxMontrerCartes"></div>`,
        width: "800px",
        background: "#c8c8c8"
    })
    
    setTimeout(generateCard_mc(storedData.cards), 500)
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
        title: "import WIP",
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

function generateCard_mc(cards) {

    for (UID in cards) {
        var div = document.createElement('span')
        div.setAttribute("class", "container")
        div.innerHTML = `<object type="image/svg+xml" data="./img/card.svg" class="card" id="card-Z${UID}" style="width:100px"></object><span style="font-size: 20px; overflow: hidden">${UID}</span>`.trim();
        document.querySelector("#flexboxMontrerCartes").append(div)
    }

    try { // setTimeout arrivant apres l'execution du premier 'for',
          // la valeur de UID a été fixé, il prend la derniere valeur avoir été donnée
        setTimeout(() => {for (UID in cards) {changerCarte(cards[UID].nombre, cards[UID].couleur, "Z" + UID, true)}}, 100)
    }
    
    catch {
        document.querySelector(`#card-${UID}`).remove()
    }
}