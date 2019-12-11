//strike
function strike(target=parent.ctarget){
	if(!target) return;
	if(is_in_range(target))
	{
		if(Date() >= parent.next_skill["attack"]){
			socket.emit("attack", {id:target.id})
		}
	}
	else
	{
		if(!is_moving(character)){
			xmove(
				character.x + (target.x - character.x) / 2,
				character.y + (target.y - character.y) / 2
			);
		}
	}
}