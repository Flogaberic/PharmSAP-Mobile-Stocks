$(document).ready(function () {
  console.log("🔹 Initialisation de l'application...");

  // Enregistrer les fonctions associées aux pages
  Router.register("home", () => Home.init());
  Router.register("product", () => Product.init());

  console.log("Device is ready, initializing IndexedDB...");
  initDatabase();
});

var db = null;
var pendingOperations = [];

function initDatabase() {
  var request = indexedDB.open("MyDatabase", 1);

  request.onupgradeneeded = function (event) {
      db = event.target.result;

      if (!db.objectStoreNames.contains("users")) {
          var objectStore = db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
          objectStore.createIndex("name", "name", { unique: false });
          objectStore.createIndex("age", "age", { unique: false });
          console.log("ObjectStore 'users' créé !");
      }
  };

  request.onsuccess = function (event) {
      db = event.target.result;
      console.log("IndexedDB prêt !");

      // Exécuter les opérations en attente
      pendingOperations.forEach(op => op());
      pendingOperations = []; // Vider la file d'attente
  };

  request.onerror = function (event) {
      console.log("Erreur lors de l'initialisation d'IndexedDB :", event.target.errorCode);
  };
}

// 📌 Fonction pour exécuter les opérations si DB est prête, sinon les mettre en file d'attente
function executeWhenReady(operation) {
  if (db) {
      operation();
  } else {
      console.log("DB pas encore prête, en attente...");
      pendingOperations.push(operation);
  }
}

// 📌 Fonction pour ajouter un utilisateur
function addUser(name, age) {
  executeWhenReady(() => {
      var transaction = db.transaction(["users"], "readwrite");
      var objectStore = transaction.objectStore("users");

      var request = objectStore.add({ name: name, age: age });

      request.onsuccess = function () {
          console.log("Utilisateur ajouté :", name, age);
      };

      request.onerror = function (event) {
          console.log("Erreur lors de l'ajout :", event.target.error);
      };
  });
}

// 📌 Fonction pour récupérer tous les utilisateurs
function getUsers() {
  executeWhenReady(() => {
      var transaction = db.transaction(["users"], "readonly");
      var objectStore = transaction.objectStore("users");

      var request = objectStore.getAll();

      request.onsuccess = function () {
          console.log("Liste des utilisateurs :", request.result);
      };

      request.onerror = function (event) {
          console.log("Erreur lors de la récupération :", event.target.error);
      };
  });
}

// 📌 Fonction pour supprimer un utilisateur par ID
function deleteUser(id) {
  executeWhenReady(() => {
      var transaction = db.transaction(["users"], "readwrite");
      var objectStore = transaction.objectStore("users");

      var request = objectStore.delete(id);

      request.onsuccess = function () {
          console.log("Utilisateur supprimé avec l'ID :", id);
      };

      request.onerror = function (event) {
          console.log("Erreur lors de la suppression :", event.target.error);
      };
  });
}
