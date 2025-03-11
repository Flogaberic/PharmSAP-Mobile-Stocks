const Router = {
  routes: {},

  init() {
    console.log("✅ Router initialisé");

    // Charger home.html uniquement si l'user est connecté
    let user = Router.isUserLoggedIn();
    let firstPage = user ? "pages/home.html" : "pages/login.html";

    $.mobile
      .loadPage(firstPage, {
        reload: false,
      })
      .then(() => {
        $.mobile.changePage(firstPage);
      });

    $(document).on("pagecontainerchange", function (event, ui) {
      const pageId = $(".ui-page-active").attr("id");
      console.log(`🔹 Changement de page détecté : ${pageId}`);

      // Vérifier l'accès avant d'autoriser le changement de page
      Router.middleware(pageId);

      // Exécuter la fonction associée à la page si elle existe
      if (Router.routes[pageId]) {
        Router.routes[pageId]();
      }
    });
  },

  /**
   * Enregistre la fonction associée à la page
   * app.js
   * Router.register('home', homePageInit);
   */
  register(page, handler) {
    Router.routes[page] = handler;
  },

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isUserLoggedIn() {
    // return localStorage.getItem("userLoggedIn") === "true";
    return true;
  },

  /**
   * Middleware : Vérifie si l'utilisateur peut accéder à une page
   */
  middleware(pageId) {
    let user = Router.isUserLoggedIn();

    if (pageId === "login") {
      return; // Ne pas rediriger si on est sur la page de connexion
    }

    if (!user) {
      $.mobile.changePage("pages/login.html");
    }
  },
};

// ✅ Initialisation au chargement du DOM
$(document).ready(() => {
  Router.init();
});
