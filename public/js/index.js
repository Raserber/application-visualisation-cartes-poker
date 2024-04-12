// window.electronAPI.testTransmission("test")

function createCard(numeroScanner) {
    clearTimeout(pqRienAfficher)
    var div = document.createElement('span');
    div.setAttribute("class", "container")
    div.innerHTML = `<span>Lecteur ${numeroScanner}</span><object type="image/svg+xml" data="./img/card.svg" class="card" id="card-${numeroScanner}"></object>`.trim();
    document.querySelector("body").append(div)
}

pqRienAfficher = setTimeout(() => {
    
    if (!swal.isVisible()) {

        swal.fire({
            title: "Pourquoi rien ne s'affiche ?",
            icon: "info",
            text: "passer une carte sur les lecteurs ou debrancher, rebrancher le cable USB pour voir s'afficher les lecteurs."
        })
    }
}, 5000)

var couleurs, timerId, memPorts = []
fetch('./data/couleurs.json')
.then((response) => response.json())
.then((json) => couleurs = json);

function changeName(newName, carteCouleur, numeroScanner) {

    try {
        const card = document.querySelector(`#card-${numeroScanner}`)
        numbers = card.contentDocument.querySelectorAll(".number")
        couleur = card.contentDocument.querySelector(".couleur")
    }
    catch {
        console.log("oups");
        createCard(numeroScanner);
        setTimeout(() => { changeName(newName, carteCouleur, numeroScanner)}, 100)
        return;
    }

    numbers.forEach((number) => {

        number.innerHTML = newName
    })

    
    couleur.innerHTML = couleurs[carteCouleur]
}

window.electronAPI.onListDevices(async (ports) => {

    var containerCards = document.querySelectorAll(".container")

    containerCards.forEach((el) => el.remove())

    if (!swal.isVisible() || memPorts.length != ports.length) {
            
        memPorts = ports

        await swal.fire({
            title: "Choisissez un port",
            icon: "question",
            input: "select",
            allowOutsideClick: false,
            inputOptions: ports.map(port => {return `0x${port.productId}/0x${port.vendorId} (${port.path})`})
        }).then ((result) => {
    

            window.electronAPI.returnChoosenDevice(ports[result.value])
        })
    }
})

window.electronAPI.onSerialPortData((value) => {
    // regular expression (regex) to match the data from Serial port
    const regexIsIUD = /\|/g.test(value);
    const regexIsFirmware = /\$\$/g.test(value);
    const regexFirmwareIsFunc = /0xB2/g.test(value);

    if (regexIsFirmware) {
        const regex = /(\d)\$\$(.*)/g;
        const data = regex.exec(value)
        const numeroScanner = data[1]
        const msg = data[2]
        
        if (regexFirmwareIsFunc) {
            createCard(numeroScanner);
        }
    }

    if (regexIsIUD) {
        const regex = /(\d)\|(.*)/g;
        const data = regex.exec(value)
        const numeroScanner = data[1]
        const msg = data[2]

        switch (msg) {
            case "F315D704" :
                changeName("10", "pique", numeroScanner)
                break;
            case "03FD4C06" :
                changeName("1", "coeur", numeroScanner)
                break;
            case "635B3F06" :
                changeName("9", "trefle", numeroScanner)
                break;
            case "53047106" :
                changeName("7", "carreau", numeroScanner)
                break;
            case "53937006" :
                changeName("R", "pique", numeroScanner)
        }
    }
  })
