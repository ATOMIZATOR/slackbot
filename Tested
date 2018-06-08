'use strict';

let Bot = require('./Bot');

const bot = new Bot({
	token: 'xoxb-350804903105-370590983078-qaUhkBDMGcwKQzseGmwXlgGH',
	autoReconnect: true,
	autoMark: true
});

var fileName = 'mindmap.json';
var actions = new Array();
var children = new Array();
var childrenTot = new Array();
var compteurAction = 0;
var compteurUndo = 0;
var current = 0;
var baseX = 100;
var baseY = 50;

var reinit = function() {
	actions = new Array();
	children = new Array();
	compteurAction = 0;
	compteurUndo = 0;
	current = 0;
}	
var isPresent = function(name) {
	for(var i = 0; i < compteurAction; i++) {
		if (actions[i][1] == name) {
			return true;
		}
	}
	return false;
};

//ajouter la racine, se fait une seule fois toute au debut
//fonction a cette forme: 'addRoot *root*'
bot.respondTo('addRoot ', (message, channel, user) => {
	if (compteurAction > 0) {
		bot.send(`Thème principal existe déjà`, channel);
		return;
	}	
	message.text = message.text.replace('addRoot ', '');
	var tmp = new Array(null, message.text);
	actions[compteurAction] = tmp;
	compteurAction++;
	bot.send(`Thème ${message.text} a été creé avec succès`, channel);
}, true);

bot.respondTo('addToCurrent ', (message, channel, user) => {
	if (compteurAction == 0) {
		bot.send(`Aucun théme actuel`, channel);
		return;
	}	
	message.text = message.text.replace('addToCurrent ', '');
	var tmp = new Array(current, message.text);
	actions[compteurAction] = tmp;
	compteurAction++;
	bot.send(`Subthème ${message.text} de ${actions[current][1]} a été creé avec succès`, channel);
}, true);

bot.respondTo('changeCurrent ', (message, channel, user) => {
	message.text = message.text.replace('changeCurrent ', '');
	for (var i = 0; i < compteurAction; i++) {
		if (actions[i][1] == message.text) {
			current = i;
			bot.send(`Théme actuel a été changé avec succès`, channel);
			return;
		}	
	}
	bot.send(`Théme ${message.text} n'existe pas`, channel);
}, true);

//ajouter une branche a un noeud donne
//fonction a cette forme: 'addToChosen *parent* *child*'
bot.respondTo('addToChosen ', (message, channel, user) => {
	message.text = message.text.replace('addToChosen ', '');
	var chosen = message.text.substring(0, message.text.indexOf(' '));
	var i = 0;
	message.text = message.text.replace(chosen + ' ', '');
	
	if (isPresent(message.text)) {
		bot.send(`${message.text} existe déjà`, channel);
		return;
	}	
		
	while(i < compteurAction && actions[i][1] != chosen) {
		i++;
		if(i == compteurAction) {
			bot.send(`Impossible de trouver ${chosen}`, channel);
			return;
		}
	}
	current = i;
	var tmp = new Array(i, message.text);
	actions[compteurAction] = tmp;
	compteurAction++;
	compteurUndo = 0;
	bot.send(`Subthème ${message.text} de ${chosen} a été creé avec succès`, channel);
}, true);

//fonction undo
bot.respondTo('undo', (message, channel, user) => {
	if (compteurAction > 0) {
		compteurAction--;
		compteurUndo++;
		current = actions[compteurAction][0];
		bot.send(`Undo avec succès`, channel);
	} else {
		bot.send(`Rien à undo`, channel);
	}	
}, true);

//fonction redo
bot.respondTo('redo', (message, channel, user) => {
	if (compteurAction < actions.length && compteurUndo > 0) {
		compteurAction++;
		compteurUndo--;
		current = actions[compteurAction - 1][0];
		bot.send(`Redo avec succès`, channel);
	} else {
		bot.send(`Rien à redo`, channel);
	}	
}, true);

bot.respondTo('afficher', (message, channel, user) => {
	bot.send(`Noeud actuel: ${current}:`, channel);
	for (var i = 0; i < compteurAction; i++) bot.send (
			'id : '
			+ i
			+ '; parent id : '
			+ actions[i][0]
			+ '; nom : '
			+ actions[i][1], channel
	);
}, true);



var fs = require('fs');
var font = '"style":"normal","weight":"bold","decoration":"none","size":20,"color":"#000000"';
var branchColor = '"#000000"';

var getTot = function(index) {
	var res = 1;
	for(var i = 0; i < children[index].length; i++) {
		res = res + getTot(children[index][i]);
	}
	return res;
}	

var getInfTot = function(index) {
	return getTot(index) - 1;
}	

var getInfDir = function(index) {
	return children[index].length;
}	

var recFile = function(index, x, y) {
	fs.appendFileSync('fileName', 
	'{"id":"' + index + 
	'","parentId":"' + actions[index][0] +
	'","text":{"caption":"' + actions[index][1] +
	'","font":{' + font +
	'}},"offset":{"x":' + x + ',"y":' + y + 
	'},"foldChildren":false,"branchColor":' + branchColor +
	',"children":[', 
	function (err) {
	if (err) throw err;
	});
	
	var ecart = baseY*(getInfTot(index) - getInfDir(index));
	if ((ecart == 0) && (children[index].length != 1)) {
		ecart = baseY;
	}	
	var debut = ecart*(getInfDir(index) - 1)/2;
	
	if (children[index].length > 0) {
		recFile(children[index][0], baseX, debut);
		for(var i = 1; i < children[index].length; i++) {
			fs.appendFileSync('fileName', ',', 
			function (err) {
			if (err) throw err;
			});
			recFile(children[index][i], baseX, (debut - ecart*i));
		}
	}
	
	fs.appendFileSync('fileName', ']}', 
	function (err) {
	if (err) throw err;
	});
}	

//ici le fichier mindmap va ce generer
bot.respondTo('end', (message, channel, user) => {
	if (compteurAction == 0) {
		bot.send(`Impossible de créer un mindmap vide`, channel);
		return;
	}
	for(var i = 0; i < compteurAction; i++) {
		children[i] = new Array();
		for(var j = 0; j < compteurAction; j++) {
			if (actions[j][0] == i) {
				children[i].push(j);
			}
		}
	}

	//pour le bien fonctionnement de la fonction recursif
	//on dit que le pere de la racine est elle meme
	actions[0][0] = 0;
	
	fs.writeFileSync('fileName', '{"id":"0","title":"bot","mindmap":{"root":', 
	function (err) {
	if (err) throw err;
	});
	
	recFile(0, 0, 0);
	
	fs.appendFileSync('fileName', '},"dates":{"created":1526655775822,"modified":1526655880854},"dimensions":{"x":4000,"y":2000},"autosave":false}', 
		function (err) {
	if (err) throw err;
	});
	
	reinit();
	
}, true);
