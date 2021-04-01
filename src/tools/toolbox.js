const sqlite3 = require('sqlite3').verbose();
const query = require("source-server-query");

const removeVersion = message => {
	let splitmessage = message.split("-")
	r=""
	for(let i=0;i<splitmessage.length-2;i++){
		r+=splitmessage[i]+"-"
	}
	r+=splitmessage[splitmessage.length-2]
	return r
}

const checkIp = element => {
	if(element==undefined){return false}
	return !(
		element.split(':').length==2 
		&& 0<element.split(':')[0].length && 0<element.split(':')[1].length 
		&& element.split(':')[0].split('.').length==4 
		&& !isNaN(element.split(':')[1]) && parseInt(element.split(':')[1]) <= 65535 
		&& !isNaN(element.split(':')[0].split('.')[0]) && parseInt(element.split(':')[0].split('.')[0]) <= 255 
		&& !isNaN(element.split(':')[0].split('.')[1]) && parseInt(element.split(':')[0].split('.')[1]) <= 255 
		&& !isNaN(element.split(':')[0].split('.')[2]) && parseInt(element.split(':')[0].split('.')[2]) <= 255 
		&& !isNaN(element.split(':')[0].split('.')[3]) && parseInt(element.split(':')[0].split('.')[3]) <= 255 
	)
}

module.exports = { removeVersion, checkIp }