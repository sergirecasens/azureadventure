let app = function(){
	
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const code = urlParams.get('user');
	console.log(code);
	
	let partides;
	let id_partida;
	let indx;
	let start_time = Date.now();
	
	function returnToMenu(){
		window.location="../index.html?user=";
	}
	
	id_partida = sessionStorage.getItem("id_partida", undefined);
	
	if(!id_partida){
		returnToMenu();
		return null;
	}
	
	partides = JSON.parse(localStorage.getItem("llistat_partides"));
	
	for(let i = 0; i < partides.length; i++){
		if(id_partida == partides[i].id){
			indx = i;
		}
	}
	
	return new Vue({
		el: '#app',
		data: {
			nom_usuari: partides[indx].name,
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
				localStorage.setItem("llistat_partides", JSON.stringify(partides));
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