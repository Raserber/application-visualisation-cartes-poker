var storedData = {}, boolVisibilite_leftPanel = true, bool_enleverCarte = false

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

function changerCarte(newName, carteCouleur, numeroScanner, boolCreateCard) {
    

    try {
        const card = document.querySelector(`#card-${numeroScanner}`)
        numbers = card.contentDocument.querySelectorAll(".number")
        couleur = card.contentDocument.querySelector(".couleur")
    }
    catch {
        if (!boolCreateCard) {
            createCard(numeroScanner);
            setTimeout(() => { changerCarte(newName, carteCouleur, numeroScanner)}, 100)
        }
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

        try {
            if (bool_enleverCarte) {

                delete storedData.cards[UID]
                window.electronAPI.storedData(storedData)
                
                swal.fire({
                    title: `carte ${UID} retiree`,
                    icon: "success",
                    timer: 2000
                })
            }
            
            else {
                changerCarte(storedData.cards[UID].nombre, storedData.cards[UID].couleur, numeroScanner)
            }
        }
        catch {

            swalNouvelleCarte(UID)
       }
    }
  })