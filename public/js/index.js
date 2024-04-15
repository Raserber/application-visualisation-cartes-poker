var storedData = {}

window.electronAPI.storedData("requestData")

function createCard(numeroScanner) {
    try {
        document.querySelectorAll(".container-2")[0].remove()
    } catch {}
    
    var div = document.createElement('span');
    div.setAttribute("class", "container")
    div.innerHTML = `<span>Lecteur ${numeroScanner}</span><object type="image/svg+xml" data="./img/card.svg" class="card" id="card-${numeroScanner}"></object>`.trim();
    document.querySelector("body").append(div)
}

var couleurs, timerId, memPorts = []
fetch('./data/couleurs.json')
.then((response) => response.json())
.then((json) => couleurs = json);

function changerCarte(newName, carteCouleur, numeroScanner) {

    try {
        const card = document.querySelector(`#card-${numeroScanner}`)
        numbers = card.contentDocument.querySelectorAll(".number")
        couleur = card.contentDocument.querySelector(".couleur")
    }
    catch {
        createCard(numeroScanner);
        setTimeout(() => { changerCarte(newName, carteCouleur, numeroScanner)}, 100)
        return;
    }

    numbers.forEach((number) => {

        number.innerHTML = newName
    })

    
    couleur.innerHTML = couleurs[carteCouleur]
}


window.electronAPI.onStoredData((data) => {

    storedData = data
})

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
        const UID = data[2]

        console.log(storedData)
        try {
            changerCarte(storedData.cards[UID].nombre, storedData.cards[UID].couleur, numeroScanner)
        }
        catch {

            const Queue = Swal.mixin({
                progressSteps: [1, 2, 3],
                title: "Enregistrement nouvelle carte",
                // optional classes to avoid backdrop blinking between steps
                showClass: { backdrop: 'swal2-noanimation' },
                hideClass: { backdrop: 'swal2-noanimation' },
                allowOutsideClick: false,
                showDenyButton: true
              })
              
              ;(async () => {
                var question
                await swal.fire({
                    title: "carte non enregistree",
                    icon: "warning",
                    confirmButtonText: "Enregistrer",
                    denyButtonText: "Ne pas enregistrer",
                    showDenyButton: true
                }).then(result => {
    
                    question = result.isConfirmed
                })

                console.log(question)
                if (!question) {
                    return
                }

                const {value: couleur} = await Queue.fire({
                  text: 'Quel est la couleur de la carte',
                  input: "radio",
                  customClass: "radioCouleurs",
                  inputOptions : {
                    "coeur" : "<img src='./img/coeur.png' style='width : 75px'></img>",
                    "trefle" : "<img src='./img/trefle.png' style='width : 75px'></img>",
                    "carreau" : "<img src='./img/carreau.png' style='width : 75px'></img>",
                    "pique" : "<img src='./img/pique.png' style='width : 75px'></img>",
                  },
                  inputValidator: (value) => { if (!value) return "Il faut choisir" },
                  currentProgressStep: 0,
                })

                if (!couleur) { return }


                var {value: nombre} = await Queue.fire({
                  text: 'Quelle est sa valeur',
                  currentProgressStep: 1,
                  input: "select",
                  inputOptions: {
                    "1" : "1",
                    "2" : "2",
                    "3" : "3",
                    "4" : "4",
                    "5" : "5",
                    "6" : "6",
                    "7" : "7",
                    "8" : "8",
                    "9" : "9",
                    "10" : "10",
                    "V" : "V",
                    "D" : "D",
                    "R" : "R"
                  }
                })

                if (!nombre) { return }

                Queue.fire({
                    html: '<object type="image/svg+xml" data="./img/card.svg" id="card-Z" style="width:150px;box-shadow: 0px 0px 5px 8px rgba(0,0,0,0.19);"></object>',
                    currentProgressStep: 2,
                  }).then(result => {
                    if (result.isConfirmed) {

                        storedData.cards[UID] = { couleur: couleur, nombre: nombre }
                        window.electronAPI.storedData(storedData)
                        console.log("test", storedData)
                    }
                })

                  setTimeout(() => {changerCarte(nombre, couleur, "Z")}, 100)
              })()
        }
    }
  })