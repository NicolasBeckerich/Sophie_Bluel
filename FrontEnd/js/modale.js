document.addEventListener('DOMContentLoaded', function () {

  // Définition des variables pour ma première modale
  var modal = document.getElementById("modal");
  var editBtn = document.getElementById("editBtn");
  var closeModalBtn = document.getElementsByClassName("close")[0];

  // Définition des variables pour deuxième modale
  var secondModal = document.getElementById("second-modale");
  var addPhotoBtn = document.getElementById("add-photo");
  var closeSecondModalBtn = document.getElementById("closeSecondModalBtn");
  var backArrow = document.getElementById("back-arrow");

  // j'ajoute un évènement qui lorsque je clique sur le bouton editBtn s'affiche en display de none à block 
  // j'appelle aussi ma fonction displayWorks pour appeler mes travaux à ce moment là
  editBtn.addEventListener('click', function () {
    modal.style.display = "block";
    modalWorks();
  });

  // j'ajoute un évènement qui lorsque je clique sur le bouton closeModalBtn s'affiche en display de block à none
  closeModalBtn.addEventListener('click', function () {
    modal.style.display = "none";
  });

  // Si je clique en dehors de la fenêtre de modale elle sera masquée
  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Ajoute un événement qui, lorsque je clique sur le bouton addPhotoBtn, change la première modale de 'block' à 'none' et la deuxième modale de 'none' à 'block'
  addPhotoBtn.addEventListener('click', function () {
    modal.style.display = "none";
    secondModal.style.display = "block";

  });

  // Ajoute un événement qui, lorsque je clique sur la flèche de retour, change la deuxième modale de 'block' à 'none' et la première modale de 'none' à 'block'
  backArrow.addEventListener('click', function () {
    secondModal.style.display = "none";
    modal.style.display = "block";
  });

  // Ajoute un événement qui, lorsque je clique sur le bouton closeSecondModalBtn, ferme la deuxième modale
  closeSecondModalBtn.addEventListener('click', function () {
    secondModal.style.display = "none";
  });

  // Si je clique en dehors de la fenêtre de la deuxième modale, elle sera disparu
  window.addEventListener('click', function (event) {
    if (event.target === secondModal) {
      secondModal.style.display = "none";
    }
  });
});





//////////////////////////////// Partie supression travaux et premiere modale //////////////////////



// Ma fonction sert à importer mes travaux un par un depuis l'api, creer les éléments dynamiquement via js et supprimer les travaux en cliquant sur la corbeille
function modalWorks() {
  works().then(displayWorks => {
    const container = document.getElementById("works-container");

    // Supprimer tous les travaux précédents
    while (container.firstChild) {
      container.firstChild.remove();
    }

    displayWorks.forEach(displayWork => {
      // Création de figure
      const figure = document.createElement("figure");

      // Création de img
      const img = document.createElement("img");
      img.setAttribute("src", displayWork.imageUrl);
      img.setAttribute("alt", displayWork.title);

      // Création de figcaption
      const figcaption = document.createElement("figcaption");
      figcaption.innerText = "éditer";

      // Création de l'icône font awesome avec ajout class icon style 
      const icon = document.createElement("i");
      icon.classList.add("fa", "fa-solid", "fa-trash-can", "icon-style");

      // Ajout des éléments enfants à la figure
      figure.appendChild(img);
      figure.appendChild(figcaption);
      figure.appendChild(icon);

      // Ajout de l'attribut data-work-id à l'élément figure pour stocker l'ID du work
      figure.setAttribute("data-work-id", displayWork.id);

      // Ajout de la figure au conteneur
      container.appendChild(figure);

      // J'ajoute l'événement de clic pour la suppression de travail sur l'icone
      icon.addEventListener("click", () => {
        // Récupérer l'ID du works à partir de l'attribut data-work-id de l'élément figure
        const workId = figure.getAttribute("data-work-id");

        // Supression d'un de mes travaux de L'api et modale avec la méthode DELETE je le fais via l'ID présent sur les travaux
        fetch(`http://localhost:5678/api/works/${workId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          },
        })
          .then(response => {
            if (response.ok) {
              console.log("c'est supprimé")
              // Supprimer le travail de la modale seulement si la suppression dans l'API réussit
              figure.remove();

            } else {
              // Si la supression ne se fait pas voir l'erreur 
            }
          })
          .catch(error => {

          });
      });
    });
  });
}


/////////////////////////////////////////// Partie ajout de travaux et deuxième modale ///////////////////////////////////////////



// Stockage des éléments dont j'ai besoin dans variables
const newImage = document.getElementById("bouton-search");
const newImagePreview = document.getElementById("image-preview");
const newTitleImage = document.getElementById("title-image");
const newObjetImage = document.getElementById("objet");
const validButton = document.getElementById("bouton-valider");
const errorDiv = document.getElementById("add-image-error");

// Ma fonction affiche un message d'erreur et affiche une class css en fonction de si c'est bon ou non
function displayMessage(message, isSuccess = false) {
  errorDiv.innerText = message;
  errorDiv.style.display = "block";

  if (isSuccess) {
    errorDiv.className = 'success';
  } else {
    errorDiv.className = 'error';
  }
}
// La fonction permet de check si c'est un fichier jpg png et si c'est supérieur à 4MO
function checkFileTypeAndSize(file) {
  const validFileTypes = ["image/jpeg", "image/png"];
  const maxSize = 4 * 1024 * 1024;


  // si c'est différent de jpg ou png message d'erreur
  if (!validFileTypes.includes(file.type)) {
    displayMessage("Erreur : le fichier doit être au format JPG ou PNG.");
    return false;
  }
  // Si mon fichier dépasse 4mo message d'erreur 
  if (file.size > maxSize) {
    displayMessage("Erreur : la taille du fichier ne doit pas dépasser 4 MO.");
    return false;
  }

  return true;
}

// Ma fonction remet mon formulaire à 0
function resetForm() {
  newImage.value = '';
  newTitleImage.value = '';
  newObjetImage.value = '';
  validButton.disabled = true;
  validButton.style.backgroundColor = "grey";
  newImagePreview.innerHTML = '';
  const labels = document.querySelectorAll("label.send-image");
  labels.forEach((label) => {
    label.style.display = "block";
  });
}

// La fonction est la pour que l'utilisatuer selectionne un fichier elle vérifie si c'est conforme et met à jour mon bouton de validation
function updateImagePreview() {
  const selectedFile = newImage.files[0];
  if (selectedFile) {
    if (checkFileTypeAndSize(selectedFile)) {
      const imgUrl = URL.createObjectURL(selectedFile);
      const img = document.createElement("img");
      img.src = imgUrl;
      newImagePreview.innerHTML = "";
      newImagePreview.appendChild(img);
      newImagePreview.style.display = "block";
      validButton.disabled = false;
      validButton.style.backgroundColor = "green";

      const labels = document.querySelectorAll("label.send-image");
      labels.forEach((label) => {
        label.style.display = "none";
      });
    } else {
      resetForm();
    }
  } else {
    resetForm();
  }
}

// fonction pour titre et catégories de l'image vérifie que les champs ne sont pas vide et met à jour mon bouton valider
function checkFormValidity() {
  const titleValue = newTitleImage.value.trim();
  const objetValue = newObjetImage.value;

  if (titleValue !== "" && objetValue !== "") {
    validButton.disabled = false;
    validButton.style.backgroundColor = "green";
  } else {
    validButton.disabled = true;
    validButton.style.backgroundColor = "grey";
  }
}

// Arès que j'appuie sur le bouton valider
// je crée un objet FormData avec les informations du formulaire puis fais un envoie à l'API
function sendDataToAPI(event) {

  // J'empêche le comportement par défaut de mon bouton
  event.preventDefault();

  // Je récupère les valeurs du formulaire
  const selectedFile = newImage.files[0];
  const titleValue = newTitleImage.value.trim();
  const objetValue = newObjetImage.value;

  //  Je crée un nouveau FormData
  const formData = new FormData();
  // Je lui ajoute les valeurs 
  formData.append("image", selectedFile);
  formData.append("title", titleValue);
  formData.append("category", objetValue);

  // Ici je fetch pour envoyer les données à, L'API
  fetch("http://localhost:5678/api/works", {
    method: "POST", // 
    headers: { "Authorization": `Bearer ${authToken}` },
    // Le form Data devient le corps de ma requête
    body: formData,
  })
    .then(response => {
      // Si la réponse n'est pas ok j'envoie un message d'erreur 
      if (!response.ok) {
        throw new Error("Erreur");
      }
      // Sinon je renvoie la réponse en JSON
      return response.json();
    })
    .then(data => {
      // Si c'est bon je montre un message de succès
      closeSecondModalBtn.click();
      editBtn.click();
      resetForm();

    })
    .catch(error => {
      // catch error classique exemple si l'api est pas dispo
      console.error("Erreur", error);
      displayMessage("Erreur lors de l'ajout de l'image", false);
    });
}

// Ici j'ai mis mes ecouteurs d'évènement
validButton.addEventListener("click", sendDataToAPI);
newImage.addEventListener("change", updateImagePreview);
newTitleImage.addEventListener("input", checkFormValidity);
newObjetImage.addEventListener("change", checkFormValidity);