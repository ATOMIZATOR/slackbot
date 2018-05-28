'use strict';

let Bot = require('./Bot');

const bot = new Bot({
	token: '',
	autoReconnect: true,
	autoMark: true
});

var actions = new Array();
var children = new Array();
var compteurAction = 0;
var compteurUndo = 0;

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

//ajouter une branche a un noeud donne
//fonction a cette forme: 'addToChosen *parent* *child*'
bot.respondTo('addToChosen ', (message, channel, user) => {
	message.text = message.text.replace('addToChosen ', '');
	var chosen = message.text.substring(0, message.text.indexOf(' '));
	var i = 0;
	while(i < compteurAction && actions[i][1] != chosen) {
		i++;
		if(i == compteurAction) {
			bot.send(`Impossible de trouver ${chosen}`, channel)
			return;
		}
	}
	message.text = message.text.replace(chosen + ' ', '');
	var tmp = new Array(i, message.text);
	actions[compteurAction] = tmp;
	compteurAction++;
	compteurUndo = 0;
	bot.send(`Subthème ${message.text} de ${chosen} a été creé avec succès`, channel);
}, true);

//fonction undo
bot.respondTo('undo', (message, channel, user) => {
	if (compteuAction > 0) {
		compteurAction--;
		compteurUndo++;
		bot.send(`Undo avec succès`, channel);
	} else {
		bot.send(`Rien à undo`, channel);
	}	
}, true);

//fonction redo
bot.respondTo('redo', (message, channel, user) => {
	if (compteuAction < actions.length && compteurUndo > 0) {
		compteurAction++;
		compteurUndo--;
		bot.send(`Undo avec succès`, channel);
	} else {
		bot.send(`Rien à undo`, channel);
	}	
}, true);

//ici le fichier mindmap va ce generer
bot.respondTo('end', (message, channel, user) => {
	for(var i = 0; i < compteurAction; i++) {
		for(var j = 0; j < compteurAction; j++) {
			if (actions[j][0] == i) {
				children[i].push(j);
			}
		}
	}	
}, true);
