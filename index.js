const express = require("express");
const pureimage = require("pureimage");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enregistrer la police Arial depuis le dossier /fonts
const font = pureimage.registerFont(
  path.join(__dirname, "ARIAL.TTF"),
  "Arial"
);

app.post("/generate", async (req, res) => {
  const {
    nom,
    prenom,
    sexe,
    nationalite,
    date_naissance,
    lieu_naissance,
    nom_usage,
    numero_document,
  } = req.body;

  // Vérifie la présence de tous les champs requis
  if (
    !nom ||
    !prenom ||
    !sexe ||
    !nationalite ||
    !date_naissance ||
    !lieu_naissance ||
    !numero_document
  ) {
    return res.status(400).send("Champs manquants dans la requête");
  }

  try {
    // Charger la police avant d'écrire
    await font.load();

    const basePath = path.join(__dirname, "id.jpg");
    const image = await pureimage.decodeJPEGFromStream(
      fs.createReadStream(basePath),
    );
    const canvas = pureimage.make(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0);

    // Définir la police et la couleur du texte
    ctx.font = "50px Arial";
    ctx.fillStyle = "#000";

    // Ajouter le texte sur l'image
    ctx.fillText(nom, 1055, 395);
    ctx.fillText(prenom, 1055, 625);
    ctx.fillText(sexe, 1055, 850);
    ctx.fillText(nationalite, 1310, 850);
    ctx.fillText(date_naissance, 1920, 849);
    ctx.fillText(lieu_naissance, 1055, 990);
    ctx.fillText(nom_usage, 1055, 1132);
    ctx.fillText(numero_document, 1055, 1280);

    // Ajouter la date d'expiration (5 ans plus tard)
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 5);
    const formattedDate = expDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    ctx.fillText(formattedDate, 1920, 1280);
    ctx.fillText("GHOST RP", 1930, 1468);

    // Envoi de l'image générée en réponse
    res.setHeader("Content-Type", "image/png");
    pureimage
      .encodePNGToStream(canvas, res)
      .then(() => {
        console.log("Image envoyée");
      })
      .catch((err) => {
        console.error("Erreur lors de l'envoi de l'image :", err);
        res.status(500).send("Erreur lors de la génération de l’image");
      });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la génération de l’image");
  }
});

app.listen(PORT, () => console.log(`🖼️ Serveur CNI prêt sur port ${PORT}`));
