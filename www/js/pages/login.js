const Login = {
    init: function () {
        document
            .getElementById("login-form")
            .addEventListener("submit", function (e) {
                e.preventDefault();

                const pseudo = document.getElementById("pseudo").value.trim();
                const mdp_appmob = document.getElementById("mdp_appmob").value.trim();

                console.log("🔹 Tentative de connexion avec :", pseudo, mdp_appmob);

                Login.attemptLogin(pseudo, mdp_appmob);
            });
    },

    attemptLogin: function (pseudo, mdp_appmob) {
        const token_local = "9e605ac932b6ada126aeaa3f1f782b579d00d4419b2e45b8acd50c97eec40a2256dffc95300aaa949183c4de0d5ded35e6c12fb89afe1b922fcd7ccb";
        const token_prod = "9e605ac932b6ada126aeaa3f1f782b579d00d4419b2e45b8acd50c97eec40a2256dffc95300aaa949183c4de0d5ded35e6c12fb89afe1b922fcd7ccb";

        fetch("http://127.0.0.1:8001/api/login", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token_local,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({pseudo, mdp_appmob}),
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({})); 
            
                if (!res.ok) {
                    console.error("🔻 Réponse serveur : ", res.status, data);
                    throw new Error("Erreur de connexion");
                }
            
                if (data && data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userLoggedIn", "true");
                    localStorage.setItem("pseudo", data.pseudo);
                    localStorage.setItem("lieux", data.lieux);
            
                    $.mobile.changePage("home.html");
                } else {
                    throw new Error("Identifiants invalides");
                }
            })        
            .catch((err) => {
            console.error("❌ Connexion échouée :", err);
            document.getElementById("login-error").style.display = "block";
            });
    },
}   
