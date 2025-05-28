$(document).ready(function () {
  console.log("🔹 Initialisation de l'application...");

  // Enregistrer les fonctions associées aux pages
  Router.register("home", () => Home.init());
  Router.register("product", () => Product.init());
  Router.register("login", () => Login.init());
});

$(document).on("click", ".nav-btn", function () {
    const targetPage = $(this).data("target");
    $.mobile.changePage(targetPage);
    console.log(`🔹 Changement de page vers : ${targetPage}`);
});
 