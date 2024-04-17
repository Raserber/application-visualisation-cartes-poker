// fonction trigger quand les données storedData arrivent,
// écrivant dans la variable local ce qui est envoyé par le back
window.electronAPI.onStoredData((data) => {

    storedData = data
})

// fonction trigger quand la liste des devices accessibles par
// Serial serie est envoyé par le back, voulant dire que nous
// ne sommes actuellement pas connecter à une carte arduino
window.electronAPI.onListDevices(async (ports) => {

    // rentrer dans le if seulement si il n'y a pas déjà une popup d'active
    // et si l'utilisateur n'a pas cliquer sur "No" OU si la liste des devices dit n
    // envoyé réguliérement par le back est différent de celle n-1 donc qu'il y a un nouveau
    // device de connecté
    if ((!swal.isVisible() && !bool_choixPort) || memPorts.length != ports.length) {
            
        memPorts = ports
        var containerCards = document.querySelectorAll(".container")

        // supprimes tous les container pour faire table rase
        // pour préparer une configuration pottentiellement différentes
        // des modules RFID
        containerCards.forEach((el) => el.remove())

        // affiches la popup de sélection de l'arduino
        await swal.fire({
            title: "Choisissez un port",
            icon: "question",
            input: "select",
            allowOutsideClick: false,
            showDenyButton: true,
            inputOptions: ports.map(port => {return `0x${port.productId}/0x${port.vendorId} (${port.path})`})
        }).then ((result) => {
            
            bool_choixPort = false
    
            if (result.isDenied) {

                bool_choixPort = true
            }

            // envoie au back le choix du port réalisé
            window.electronAPI.returnChoosenDevice(ports[result.value])
        })
    }
})

window.electronAPI.onSerialPortData((value) => {
    // regular expression (regex) to match the data from Serial port
    const regexIsIUD = /\|/g.test(value);
    const regexIsFirmware = /\$\$/g.test(value);
    const regexFirmwareIsFunc = /0x[AB]2/g.test(value);

    // 2 données peuvent transiter de l'Arduino vers l'application :
    /*
     * Le statut de chaque pin esclave (si un module est connecté ou non)

     * le numéro de pin d'un module et la carte qu'il vient de détecter
    */

    // réception et traitement via des regex du statut de chaque module
    // réception de quelque chose sous la forme : 8$$Firmware Version: 0xA2 = (unknown)
    // avec 8 le numero de pin et 0xA2 (ou 0xB2) le bon numéro de version correspondant
    // à un module en fonctinnement
    if (regexIsFirmware) {
        const regex = /(\d)\$\$(.*)/g;
        const data = regex.exec(value)
        const numeroScanner = data[1]
        const msg = data[2]
        
        if (regexFirmwareIsFunc) {
            // dans le cas où un module a été détecté sur un des pins, création d'un scanner
            // avec ce numéro de pin
            creerCarteScanner(numeroScanner);
        }
    }

    // sous la forme : numeroModule|UID
    if (regexIsIUD) {
        const regex = /(\d)\|(.*)/g;
        const data = regex.exec(value)
        const numeroScanner = data[1]
        const UID = data[2]

        try {
            // Si la détection de carte se fait dans un contexte de demande
            // de suppression alors la carte est retiré de la liste et la liste
            // renvoyée au backend pour sauvegarde
            if (bool_enleverCarte) {

                delete storedData.cards[UID]
                window.electronAPI.storedData(storedData)
                
                swal.fire({
                    title: `carte ${UID} retir&#233;e`,
                    icon: "success",
                    timer: 2000
                })
            }
            
            else {
                changerCarte(storedData.cards[UID].nombre, storedData.cards[UID].couleur, numeroScanner)
            }
        }
        catch {
            // si la carte n'est pas connu, alors demande de creation de la carte
            swalNouvelleCarte(UID)
       }
    }
  })