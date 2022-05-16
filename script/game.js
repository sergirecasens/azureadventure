let app = function(){	
	let partides;
	let id_partida;
	let indx;
	let start_time = Date.now();
	
	function returnToMenu(){
		window.location="../";
	}
	
	id_partida = sessionStorage.getItem("id_partida", undefined);
	
	if(!id_partida){
		returnToMenu();
		return null;
	}
	
	//partides = JSON.parse(localStorage.getItem("llistat_partides"));
// ------------------------------------- ACCÉS AL BLOB STORAGE PER OBTENIR LES PARTIDES DESADES DE L'USUARI -------------------------------------
	let user = sessionStorage.getItem("user", undefined);
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "https://adventureefunc.azurewebsites.net/api/HttpTriggerRead?code=85iq00fUeLfdBXU_UH5vQmKAkOTqPx5CuO60cCZzJSwmAzFu1-n-6w==");

	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = () => {
		//partides = JSON.parse(xhr.responseText);
		partides = xhr.responseText;
		console.log(partides);
	}

	xhr.send(user);
// ------------------------------------------------------------------------------------------------------------------------------------------------
	
	for(let i = 0; i < partides.length; i++){
		if(id_partida == partides[i].id){
			indx = i;
		}
	}
	
	return new Vue({
		el: '#app',
		data: {
			nom_usuari: user,
			id_partida: partides[indx].id
		},
		created: function(){
			startGame(partides[indx].info);
		},
		methods: {
			save: function(){
				partides[indx].time += Date.now() - start_time;
				partides[indx].info = saveInfo();
				console.log(partides[indx].info);

// ------------------------------------- ACCÉS AL BLOB STORAGE PER DESAR LA PARTIDA -------------------------------------
				//localStorage.setItem("llistat_partides", JSON.stringify(partides));
				let xhr = new XMLHttpRequest();
				xhr.open("POST", "https://adventureefunc.azurewebsites.net/api/HttpTriggerSet?code=3127ueiKO4AF1CyOqXYgrk9yWgv4LHDx9sIKp35zIUGpAzFulXepkg==");
			
				xhr.setRequestHeader("Accept", "application/json");
				xhr.setRequestHeader("Content-Type", "application/json");
			
				xhr.onload = () => {
					console.log(JSON.parse(xhr.responseText));
				}
				
				let data = {
					game_data: partides[indx],
					type: 1
				}

				let jsonData = JSON.stringify(data);

				xhr.send(jsonData);
// ------------------------------------------------------------------------------------------------------------------------------------------------

				alert("Game saved");
				returnToMenu();
			},
			menu: function(){
				if(confirm("Any unsaved progress will be lost. Quit to menu?"))
				{
					returnToMenu();
				}
			}
		}
	});
}();