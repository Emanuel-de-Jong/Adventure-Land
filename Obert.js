//Obert
var Borgam = get_player("Borgam");
var Elora = get_player("Elora");
var Tasha = get_player("Tasha");

load_code("all_begin");
load_code("attack");

var marketing = false;
var reason = "";
setInterval(function(){
	if(!marketing){
		if(all_begin()) return;
		
		if(reason == "call"){
			if(!is_in_range(caller)){
				if(!is_moving(character)){
					smart_move(caller);
				}
			}else{
				reason = "none"
			}
		}
		else if(reason == "player_needs_potion"){
			
		}
		else if(reason == "none"){
			if(!is_moving(character)){
				smart_move("Town");
			}
			else if(is_in_range("Town")){
				parent.socket.emit("merchant", {num: 2});
				marketing = true;
			}
		}
	}
},1000/4);


var caller = "";
function on_cm(name, data){
	if(!player_names.includes(name)) return;
	if(data == "call"){
		stop_marketing();
		reason = data;
		caller = window(name);
	}
}

var potions_needed = {};
for(i = 0; i < player_names.length; i++){
	potions_needed[player_names[i]] = [["", 0], ["", 0]]
}

var min_hp_potions = 150;
var hp_before_potion_type_change = 1500;
var hp_potion_overshoot = 150;

var mini_mp_potions = 150;
var mp_before_potion_type_change = 1000;
var mp_potion_overshoot = 150;
setInterval(function(){
	if(reason == "player_needs_potion") return;
	var player_needs_potion = false;
	for(i = 0; i < player_names.length; i++){
		var player = window(player_names[i]);

		var hp_potions_needed;
		var mp_potions_needed;
		for(j = 0; j < player.items.length; j++){
			var item = player.items[j];
			if(item == null) continue;
			if(item["name"] == hp_potion_type){
				hp_potions_needed = min_hp_potions - item["q"];
				hp_potions_needed += hp_potion_overshoot;
			}
			if(item["name"] == mp_potion_type){
				mp_potions_needed = min_mp_potions - item["q"];
				mp_potions_needed += mp_potion_overshoot;
			}
		}

		if(!hp_potions_needed || hp_potions_needed > 0){
			player_needs_potion = true;

			var hp_potion_type;
			if(player.max_hp >= hp_before_potion_type_change) hp_potion_type = "hpot1";
			else hp_potion_type = "hpot0";

			potions_needed[player.name][0][0] = hp_potion_type;
			potions_needed[player.name][0][1] = hp_potions_needed;
		}
		if(!mp_potions_needed || mp_potions_needed > 0){
			player_needs_potion = true;

			var mp_potion_type;
			if(player.max_mp >= mp_before_potion_type_change) mp_potion_type = "mpot1";
			else hp_potion_type = "mpot0";

			potions_needed[player.name][1][0] = hp_potion_type;
			potions_needed[player.name][1][1] = hp_potions_needed;
		}
	}

	if(player_needs_potion){
		stop_marketing();
		reason = "player_needs_potion";
	}
},1000*120);



function stop_marketing(){
	parent.socket.emit("merchant", {close:1});
	marketing = false;
}