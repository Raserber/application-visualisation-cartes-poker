var boolVisibilite_leftPanel = true, bool_enleverCarte = false, bool_choixPort = false
var storedData = {}, couleurs = {}, memPorts = []

// communication avec main.js pour demander l'envoi de 'storedData'
window.electronAPI.storedData("requestData")

// va chercher les SVG qui seront insérés dans le SVG de la carte
fetch('./data/couleurs.json')
.then((response) => response.json())
.then((json) => couleurs = json);


function creerCarteScanner(numeroScanner) {
    try {
        // détruits les noeuds HTML corresondants aux container "placeholder"
        document.querySelectorAll(".container-2")[0].remove()
    } catch {
        try {
            // dans le cas où les container placeholder ont été détruits cela veut dire
            // 3 scanners sont actuellement affichés, détruits le noeud HTML du premier a avoir
            // ete invoqué parmi les 3 pour le remplacer par le nouveau
            document.querySelectorAll(".container")[0].remove()
        } catch {}
    }
    
    // cree un container de scanner
    var div = document.createElement('span');
    div.setAttribute("class", "container")
    div.innerHTML = `<span>Lecteur ${numeroScanner}</span><object type="image/svg+xml" data="./img/card.svg" class="card" id="card-${numeroScanner}"></object>`.trim();
    document.querySelector("body").append(div)
}


function changerCarte(newName, carteCouleur, ID, boolCreateCard) {
    

    try {
        // essai d'aller modifier nombre et couleur d'une des cartes en fonction
        // de son ID (pour les scanners cela revient au numéro de scanner)
        const card = document.querySelector(`#card-${ID}`)
        numbers = card.contentDocument.querySelectorAll(".number")
        couleur = card.contentDocument.querySelector(".couleur")
        svg = card.contentDocument.querySelector("svg")
        svg.setAttribute("card", ID)
    }
    catch {
        // si la carte n'est pas trouvé et dans le cas des scanners, la fonction creerCarteScanner est appelé pour créer un scanner
        if (!boolCreateCard) {
            creerCarteScanner(ID);
            setTimeout(() => { changerCarte(newName, carteCouleur, ID)}, 100) // fonction récursive, maintenant que la carte scanner existe
            // nous allons modifier nombre et couleur
        }
        return;
    }
    

    // permet de changer les 2 cases "nombre" par le nouveau
    numbers.forEach((number) => {

        number.innerHTML = newName
    })

    // permet de mettre la nouvelle couleur
    couleur.innerHTML = couleurs[carteCouleur]
}