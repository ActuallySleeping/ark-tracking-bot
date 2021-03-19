![ARK: Survival Evolved main background](https://store-images.s-microsoft.com/image/apps.49771.68672594993004535.abb7a42a-f75b-44f2-8afd-204cb3d19eb6.df63910d-755c-40d4-90c0-95d214d3ccd9?mode=scale&q=90&h=1080&w=1920&background=%23FFFFFF)
# Discord bot for player and server tracking on ARK  
## Introduction  
This is my first projet regarding JavaScript as well as the use of GitHub  
My goal was to let people track who is online on a server of their choice
and be able to get warning when someone connected to a defined server  

## Commands  
### Server tracking
**&ss / &start** *x.x.x.x:p  < ... x.x.x.x:p ... >*  
Let you start the tracking of a server  
**&so / &sstop** *< message_id >*  
Stop the every tracking in a channel or only the one with the messageid you gave  
The message/channel you stoped can take up to 30s to delete (all) the message(s)  
**&sa / &sadd** *message_id ip:port < ... ip:port ... >*  
Add a server in a message that already track a list of servers  
**&sr / &sremove** *message_id server_name/ip:port < ... server_name/ip:port ... >*  
Remove a server from a message that already track a list of servers  
**&dc / &defaultcluster**  
Give a list of ip with the format x.x.x.x:p for some cluster  

### Player tracking  
*Player tracking is only working with the name of the player, since Steam server queries only return the name, and dont return the player steamid*  
**&ps / &ptart** *x.x.x.x:p players < ... players ... >*  
Let you know when someone with a name connect on the server  
**&po / &pstop** *< message_id >*  
Stop tracking someone  

### Other utilities commands  
**&c / &clear** *< amount >*  
Clear an amount of message, the default amount is 100  

**Invite this bot**  
‎‎You can invite the bot by [following this link](https://bit.ly/30LMOoe)  

## Task List  
- [x] Understand the basic of GitHub, Markdown, JavaScript  

#### Server tracking
- [x] Start tracking a server  
- [x] Keep the server, message id of a tracked server  
- [x] Stop tracking a server  
- [x] Add and remove a tracked server in a message  

#### Player tracking
- [x] Start tracking one/multiples player(s) with an alert for one/multiples  
- [x] Keep the server, message id of a tracked player  
- [x] Stop tracking one/multiples player(s)  

#### Optional
##### Make a source server query
- [ ] finish the original projet
- [ ] work on this

## How was the project made  
### Used Node_modules  
- discord.js  
- sqlite3  
- source-server-query  

### What is the working tree looking like  
```
📦  
┣ 📂node_modules/  
┃  ┗ 📦...  
┣ 📂src/  
┃  ┣ 📂commands/  
┃  ┃  ┣ 📜clear.js  
┃  ┃  ┣ 📜defaultcluster.js  
┃  ┃  ┣ 📜help.js  
┃  ┃  ┣ 📜playerstart.js  (player)  
┃  ┃  ┣ 📜playerstop.js   (player)  
┃  ┃  ┣ 📜reload.js  
┃  ┃  ┣ 📜serveradd.js    (server)  
┃  ┃  ┣ 📜serverremove.js (server)  
┃  ┃  ┣ 📜serverstart.js  (server)  
┃  ┃  ┗ 📜serverstop.js   (server)  
┃  ┣ 📂tools/  
┃  ┃  ┗ 📜embedGenerator.js  
┃  ┗⚙️config.json
┣ ⚙️.gitignore  
┣ 📜index.js  
┣ ⚙️package.json  
┣ ⚙️package-lock.json  
┗ 📝README.md  

📦 
┣ 🗄️base.bd  
┗ ⚙️token.json  
```
### What are the tables inside the database  
**InformationMessage**  
Keep the information about the Message that are used to track a server, and which server is going to be tracked.  
**InformationPlayer**  
Keep the information about who's being track in which channel in which discord and on what server.  
**InformationServer**  
Keep the information about the name, map, game of a server, in case the server is currently offline/timeout.  