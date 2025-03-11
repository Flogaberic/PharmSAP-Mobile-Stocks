const Home = {
  async init() {
    console.log("Script page Home chargé !");
    await this.funcB();
  },

  // Ajouter les fonctions de la page
  funcA() {},

  async funcB() {
    await new Promise((res) => setTimeout(res, 1000));
    console.log("funcB done");
  },
};
