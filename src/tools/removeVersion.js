const sqlite3 = require('sqlite3').verbose();
const query = require("source-server-query");

function removeVersion(message){
	let splitmessage = message.split("-")
	r=""
	for(let i=0;i<splitmessage.length-2;i++){
		r+=splitmessage[i]+"-"
	}
	r+=splitmessage[splitmessage.length-2]
	return r
}

module.exports = { removeVersion }