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
		partidesAux = partides;
		
		for(var i = 0; i < partidesAux.length; i++){
			if(partidesAux[i].info == undefined){
				partidesAux[i].info = {score: 0, time: 100};
			}
		}

		return new Vue({
			el: '#app',
			data: {
				items: partidesAux.sort((a, b) => (a.info.score < b.info.score) ? 1 : -1)
			},
			methods: {
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