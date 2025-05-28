const Home = {
  init: function () {
        console.log("🔹 Chargement de la page d'accueil...");

        console.log("🔹 Page d'accueil chargée avec succès !");

        const pseudo = localStorage.getItem("pseudo"); 
        if (pseudo) {
            document.getElementById("user-name").textContent = `${pseudo}`;  
        } else {
            console.log("🔻 Aucun utilisateur trouvé, redirection vers la page de connexion...");
            $.mobile.changePage("login.html");
        }

        const lieux = localStorage.getItem("lieux"); 
        const lieuxArray = lieux.split('|').map(Number);

        const token_local = "9e605ac932b6ada126aeaa3f1f782b579d00d4419b2e45b8acd50c97eec40a2256dffc95300aaa949183c4de0d5ded35e6c12fb89afe1b922fcd7ccb";
        const token_prod = "9e605ac932b6ada126aeaa3f1f782b579d00d4419b2e45b8acd50c97eec40a2256dffc95300aaa949183c4de0d5ded35e6c12fb89afe1b922fcd7ccb";
    
        const api_locale = "http://127.0.0.1:8001/api";
        const api_prod = "https://pharmsapdev.apropos-fr.com/api";
    
        fetch(api_locale + "/get_inventaire", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token_local,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur HTTP " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Produits récupérés :", data);
            let allProduits = data;
    
            var lieu_origine = document.querySelector("#origine-select");
            var lieu_destination = document.querySelector("#destination-select");
            lieu_origine.innerHTML = "";
            lieu_destination.innerHTML = "";
            let option = document.createElement("option");
            option.textContent = "--choisir--"; 
            option.value = "";
            let option2 = document.createElement("option");
            option2.textContent = "--choisir--"; 
            option2.value = "";
            lieu_origine.appendChild(option);
            lieu_destination.appendChild(option2);
    
            let lieuxAjoutes = new Set();
    
            data.forEach(lieu => {
                if (!lieuxAjoutes.has(lieu.lieu_nom)) /* && lieuxArray.includes(lieu.lieu_id)) */ {
                    let option = document.createElement("option");
                    option.dataset.id = lieu.lieu_id;
                    option.value = lieu.lieu_id; 
                    option.textContent = lieu.lieu_nom; 
                    let option2 = document.createElement("option");
                    option2.dataset.id = lieu.lieu_id;
                    option2.value = lieu.lieu_id; 
                    option2.textContent = lieu.lieu_nom; 
                    lieu_origine.appendChild(option);
                    lieu_destination.appendChild(option2);
                    lieuxAjoutes.add(lieu.lieu_nom);
                }
            });        
    
            $('#origine-select').select2({
                width: 'resolve'
            });
    
            $('#destination-select').select2({
                width: 'resolve'
            });
    
            var tableBody = document.querySelector("#produitsTable tbody");
            tableBody.innerHTML = "";
    
            var bouton_maj = document.getElementById('bouton_maj');
    
            bouton_maj.addEventListener('click', function(){
                var lieu = document.getElementById('select2-origine-select-container').title;
                console.log(lieu);
    
                var disclaimer = document.getElementById('disclaimer');
    
                if (lieu == '--choisir--'){
                    console.log("Aucun lieu");
                    disclaimer.style.display = 'block';
                } else {
                    disclaimer.style.display = 'none';
                }
    
                tableBody.innerHTML = ""; 
    
                if (!lieu) return;
    
                const produitsFiltres = allProduits.filter(p => p.lieu_nom == lieu);
    
                produitsFiltres.forEach(produit => {
                    let row = document.createElement("tr");  
                    row.dataset.id = produit.id;   
    
                    var jour = produit.péremption ? produit.péremption.toString().slice(8, 10) : "";
                    var mois = produit.péremption ? produit.péremption.toString().slice(5, 7) :"";
                    var annee = produit.péremption ? produit.péremption.toString().slice(0, 4) : "";
    
                    row.innerHTML = `
                        <td class="libelle">${produit.produit_nom || ""}</td>
                        <td class="lot">${produit.lot || ""}</td>
                        <td class="date">${produit.péremption ? jour + "/" + mois + "/" + annee : ""}</td>
                        <td class="qte">${produit.qteth || "0"}</td>
                        <td><input type="number" class="sortieInput" value=""></td>
                    `;
    
                    tableBody.appendChild(row);
                });
    
                $('.sortieInput').css('width', '70px');
    
                setTimeout(function () {
                    var options = {
                        valueNames: ['libelle']
                    };
        
                    new List('produitsContainer', options);
                    console.log("✅ List.js initialisé avec succès !");
                }, 1000); 
            });

            const btn_annuler = document.getElementById('btn_annuler');

            btn_annuler.addEventListener('click', function(){
                if (confirm("Voulez-vous annuler la saisie ?")) {
                    console.log("Saisie annulée");
                } else {
                    console.log("Continuer la saisie");
                }
            });

            const btn_valider = document.getElementById('btn_valider');

            btn_valider.addEventListener('click', function(){
                var inputs = document.querySelectorAll('.sortieInput');
                const lieu_origine = document.getElementById('origine-select').value;
                const lieu_destination = document.getElementById('destination-select').value;
                let produitsSortis = [];

                inputs.forEach(input => {
                    var row = input.closest('tr');
                    var id = row.dataset.id;
                    var libelle = row.querySelector('.libelle').textContent;
                    var lot = row.querySelector('.lot').textContent;
                    var qte_theorique = row.querySelector('.qte').textContent;  
                    var qte_sortie = input.value;

                    if (qte_sortie) {
                        produitsSortis.push({
                            id: id,
                            produit_nom: libelle,
                            lot: lot,
                            qte_theorique: qte_theorique,
                            qte_sortie: qte_sortie,
                            lieu_origine: lieu_origine,
                            lieu_destination: lieu_destination
                        });
                    }
                });

                console.log('Produits sortis :', produitsSortis);
                if (produitsSortis.length === 0) {
                    console.log("Aucun produit à valider");
                    return;
                }
                console.log('Envoi des données au serveur...');   

                fetch(api_locale + '/recevoir_donnees', {
                    method: 'POST',
                    headers: {
                        "Authorization": "Bearer " + token_local,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        produitsSortis: produitsSortis   
                    })
                })
                .then(async res => {
                    const text = await res.text();
                    console.log('Réponse brute :', text);
                    const alert = document.getElementById('alert-success');
                    alert.classList.remove('hidden');

                    setTimeout(() => {
                        alert.classList.add('hidden');
                    }, 3000);
                    
                    try {
                        const data = JSON.parse(text);
                        console.log('Réponse JSON parsée :', data);
                    } catch (e) {
                        console.error('Erreur de parsing JSON :', e);
                    }
                })
                .catch(e => console.error('Erreur fetch :', e));
            });
    
        })
        .catch(error => {
            console.error("Erreur de requête :", error);

        });


}
};
