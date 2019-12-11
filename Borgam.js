//Borgam
load_code("all_begin");
load_code("all_end");
load_code("all_intervals");
load_code("strike");
setInterval(function(){
	if(all_begin()) return;
	
	var target = get_targeted_monster();
	if(!target){
		var target = find_target({players_to_protect:[Elora, Tasha, Character]});
		if(!target){
			if(!character.moving){
				smart_move(find_farming_area());
			}
		}else{
			parent.ctarget = target;
		}
	}

	strike(target);

	all_end();
},1000/4);

setInterval(function(){
	var target = get_targeted_monster();
	if(!target) return;

	if(target.hp / target.max_hp > 0.2 && !(target.target == Elora.name || target.target == Tasha.name)){
		var new_target = find_target({players_to_protect:[Elora, Tasha], only_monsters_targeting=true});
		if(!new_target) return;
		parent.ctarget = new_target;
	}
},1000*5);


var retreating = false;
setInterval(function(){
	if(!retreating){
		for(id in parent.entities){
			var current = parent.entities[id];
			if(current.target == character.name || current.target == Elora.name || current.target == Tasha.name){
				if(current.attack > character.hp/3 || current.hp > character.hp*3){
					retreating = true;
					smart_move({to:find_farming_area()}, function(done){
						retreating = false;
					});
				}
			}
		}
	}
},1000*5);


var farming_areas = G.maps.main.monsters;
var last_ten_areas = [];
function find_farming_area(){
	var new_area;
	var nearest_area = Number.MAX_SAFE_INTEGER;
	for(i = 0; i < farming_areas.length; i++){
		var area = farming_areas[i]["boundary"];
		area = [area[0], area[1]];
		if(last_ten_areas.includes(area)) continue;
		var dist = distance(character, area);
		if(dist < nearest_area){
			nearest_area = dist;
			new_area = area;
		}
	}
	
	last_ten_areas.unshift(new_area);
	if(last_ten_areas.length >= 11){
		last_ten_areas.pop();
	}
	
	return new_area;
}


function find_target(players_to_protect=[], only_monsters_targeting=false){
	var monsters_targeting = {};
	var monsters = {};
	var target;
	var monster_targeting = false;
	
	for(i = 0; i < players_to_protect.length; i++){
		monsters_targeting[players_to_protect[i].name] = [];
	}
	
	for(id in parent.entities)
	{
		var current = parent.entities[id];
		
		if(current.type != "monster" || current.dead) continue;
		
		for(i = 0; i < players_to_protect.length; i++){
			var player = players_to_protect[i];
			if(current.target == player.name){
				monster_targeting = true;
				if(!can_move_to(current)) continue;
				monsters_targeting[player.name].push(current);
				continue;
			}
		}
		if(!monster_targeting && !only_monsters_targeting){
			if(current.hp*1.5 > character.hp || current.hp < character.attack*2) continue;
			if(current.attack > character.hp/10) continue;
			if(current.xp < current.hp*1.5) continue;
			if(!can_move_to(current)) continue;

			monsters[id] = distance(character, current);
		}
	}
	
	for(i = 0; i < players_to_protect.length; i++){
		var monsters = monsters_targeting[players_to_protect[i].name];
		if(monsters.length != 0){
			var highest_attack = 0;
			for(j = 0; j < monsters.length; j++){
				var monster = monsters[j];
				if(monster.attack > highest_attack){
					highest_attack = monster.attack;
					target = monster;
				}
			}
			return target;
		}
	}
	if(!only_monsters_targeting){
		var shortest_distance = Number.MAX_SAFE_INTEGER;
		for(id in monsters){
			if(monsters[id] < shortest_distance){
				shortest_distance = monsters[id];
				target = parent.entities[id];
			}
		}
		return target;
	}
	
	return null;
}