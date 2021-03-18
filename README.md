# Discord bot for player and server tracking on ARK  
## Introduction  
This is my first projet regarding JavaScript as well as the use of GitHub  
My goal was to let people track who is online on a server of their choice
and be able to get warning when someone connected to a defined server  

## Commands  
**&s / &start** *x.x.x.x:p ...*  
Let you start the tracking of a server  
**&stop** *< messageid >*  
Stop the every tracking in a channel or only the one with the messageid you gave  
**&dc / &defaultcluster**  
Give a list of ip with the format x.x.x.x:p for some cluster 

**&c / &clear** *< amount >*  
Clear an amount of message, the default amount is 100  

**Invite this bot**  
‎‎You can invite the bot by [following this link](https://bit.ly/30LMOoe)  

## Task List  
- [x] Understand the basic of GitHub, Markdown, JavaScript  

### Server tracking
- [x] Start tracking a server  
- [x] Keep the server, message id of a tracked server  
- [x] Stop tracking a server  
- [ ] Add and remove a tracked server in a message  

### Player tracking
- [ ] Start tracking one/multiples player(s) with an alert for one/multiples  
- [ ] Keep the server, message id of a tracked player  
- [ ] Stop tracking one/multiples player(s)  
- [ ] Add or remove a tracked player into a list, and remove the list if it's empty  

## How was the project made  
### Used Node_modules  
- discord.js  
- sqlite3  
- source-server-query  

### What is the working tree looking like  
```
.  
└───node_modules/  
|   └───...  
└───src/  
|   └───commands/  
|      └───clear.js  
|      └───defaultcluster.js  
|      └───help.js  
|      └───reload.js  
|      └───start.js  
|      └───stop.js  
|   └───tools/  
|      └───embedGenerator.js  
|   └───base.bd  
|   └───config.json  
|   └───token.json  
└───index.js  
└───package.json  
└───package-lock.json  
└───README.md  
```