let app = function(){
	
	//let partides = JSON.parse(localStorage.getItem("llistat_partides"));
	let partides = null;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", "https://adventureefunc.azurewebsites.net/api/HttpTriggerRead?code=85iq00fUeLfdBXU_UH5vQmKAkOTqPx5CuO60cCZzJSwmAzFu1-n-6w==");

	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = () => {
		partides = JSON.parse(xhr.responseText);
		console.log(partides);

		return new Vue({
			el: '#app',
			data: {
				items: partides
			},
			created: function () {
				console.log(this.items);
			},
			methods: {
				load: function(id){
					sessionStorage.setItem("id_partida", id);
					window.location = "../html/game.html";
				},
				remove: function(id){
					/*for(let i = 0; i < partides.length; i++){
						if(id == partides[i].id){
							this.items.splice(i, 1);
						}
					}
					localStorage.setItem("llistat_partides", JSON.stringify(this.items));*/
	
					let xhr = new XMLHttpRequest();
					xhr.open("POST", "https://adventureefunc.azurewebsites.net/api/HttpTriggerSet?code=3127ueiKO4AF1CyOqXYgrk9yWgv4LHDx9sIKp35zIUGpAzFulXepkg==");
	
					xhr.setRequestHeader("Accept", "application/json");
					xhr.setRequestHeader("Content-Type", "application/json");
		
					xhr.onload = () => {
						console.log(JSON.parse(xhr.responseText));
					}
		
					let data = {
						game_data: partida,
						type: 2
					};
					
					let jsonData = JSON.stringify(data);
		
					xhr.send(jsonData);
	
				},
				remove_all: function(){
					let xhr = new XMLHttpRequest();
					xhr.open("POST", "https://adventureefunc.azurewebsites.net/api/HttpTriggerSet?code=3127ueiKO4AF1CyOqXYgrk9yWgv4LHDx9sIKp35zIUGpAzFulXepkg==");
	
					xhr.setRequestHeader("Accept", "application/json");
					xhr.setRequestHeader("Content-Type", "application/json");
		
					xhr.onload = () => {
						console.log(JSON.parse(xhr.responseText));
					}
		
					let data = {
						game_data: partida,
						type: 3
					};
					
					let jsonData = JSON.stringify(data);
		
					xhr.send(jsonData);
					
					//this.items = [];
					//localStorage.setItem("llistat_partides", JSON.stringify(this.items));
				},
				menu: function(){
					returnToMenu();
				}
			}
		});
	}

	let data = sessionStorage.getItem("user", undefined);
	
	xhr.send(data);
	
	function returnToMenu(){
		window.location="../"
	}

	
}();