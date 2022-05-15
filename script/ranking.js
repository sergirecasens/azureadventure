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
	}

	let data = sessionStorage.getItem("user", undefined);
	
	xhr.send(data);
	
	
	function returnToMenu(){
		window.location="../"
	}

	return new Vue({
		el: '#app',
		data: {
			items: partides.sort((a, b) => (a.info.score < b.info.score) ? 1 : -1)
		},
		methods: {
			/*load: function(id){
				sessionStorage.setItem("id_partida", id);
				window.location = "../html/game.html";
			},
			remove: function(id){
				for(let i = 0; i < partides.length; i++){
					if(id == partides[i].id){
						this.items.splice(i, 1);
					}
				}
				localStorage.setItem("llistat_partides", JSON.stringify(this.items));
			},
			remove_all: function(){
				this.items = [];
				localStorage.setItem("llistat_partides", JSON.stringify(this.items));
			},*/
			menu: function(){
				returnToMenu();
			}
		}
	});
}();