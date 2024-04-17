function swalNouvelleCarte(UID) {

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
        title: "carte non enregistr&#233;e",
        icon: "warning",
        confirmButtonText: "Enregistrer",
        denyButtonText: "Ne pas enregistrer",
        showDenyButton: true,
        timer: 5500
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
        html: '<object type="image/svg+xml" data="./img/card.svg" id="card-Z" style="width:150px;"></object>',
        currentProgressStep: 2,
        background: "#c8c8c8"
      }).then(result => {
        if (result.isConfirmed) {

            storedData.cards[UID] = { couleur: couleur, nombre: nombre }
            window.electronAPI.storedData(storedData)
        }
    })

      setTimeout(() => {changerCarte(nombre, couleur, "Z")}, 100)
  })()

}