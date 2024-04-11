// window.electronAPI.testTransmission("test")

var couleurs, timerId, memPorts = []
fetch('./data/couleurs.json')
.then((response) => response.json())
.then((json) => couleurs = json);

function changeName(newName, carteCouleur, numeroScanner) {

    const card = document.querySelector(`#card-${numeroScanner}`)
    numbers = card.contentDocument.querySelectorAll(".number")
    couleur = card.contentDocument.querySelector(".couleur")

    numbers.forEach((number) => {

        number.innerHTML = newName
    })

    
    couleur.innerHTML = couleurs[carteCouleur]
}

window.electronAPI.onListDevices(async (ports) => {

    console.log(ports, memPorts, ports.length, memPorts.length)
    if (!swal.isVisible() || memPorts.length != ports.length) {
            
        memPorts = ports

        await swal.fire({
            title: "Choose device",
            icon: "question",
            input: "select",
            allowOutsideClick: false,
            inputOptions: ports.map(port => {return `0x${port.productId}/0x${port.vendorId} (${port.path})`})
        }).then ((result) => {
    
            console.log(result)

            window.electronAPI.returnChoosenDevice(ports[result.value])
        })
    }
})

window.electronAPI.onSerialPortData((value) => {
    // regular expression (regex) to match the data from Serial port
    const regex = /(\d)\|(.*)/g;
    const data = regex.exec(value)
    const numeroScanner = data[1]
    const msg = data[2]

    if (msg === "F315D704") changeName("10", "pique", numeroScanner);

    else if (msg === "03FD4C06") changeName("1", "coeur", numeroScanner);

    else if (msg === "635B3F06") changeName("9", "trefle", numeroScanner);

    else if (msg === "53047106") changeName("7", "carreau", numeroScanner);

    else if (msg === "53937006") changeName("R", "pique", numeroScanner);
  })
