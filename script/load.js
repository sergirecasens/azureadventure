let app = function(){
	
	let partides = JSON.parse(localStorage.getItem("llistat_partides"));
	
	function returnToMenu(){
		window.location="../"
	}

	return new Vue({
		el: '#app',
		data: {
			items: partides
		},
		methods: {
			load: function(id){
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
			},
			menu: function(){
				returnToMenu();
			}
		}
	});
}();