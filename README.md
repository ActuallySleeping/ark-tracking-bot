![ARK: Survival Evolved main background](https://store-images.s-microsoft.com/image/apps.49771.68672594993004535.abb7a42a-f75b-44f2-8afd-204cb3d19eb6.df63910d-755c-40d4-90c0-95d214d3ccd9?mode=scale&q=90&h=1080&w=1920&background=%23FFFFFF)
# Discord bot for player and server tracking on ARK  
## Introduction  
This is my first projet regarding JavaScript as well as the use of GitHub  a
My goal was to let people track who is online on a server of their choice
and be able to get warning when someone connected to a defined server  

## Commands  
### Server tracking
**&ss / &start** *x.x.x.x:p  < ... x.x.x.x:p ... >*  
Let you start the tracking of a server  
**&so / &sstop** *< message_id >*  
Stop the every tracking in a channel or only the one with the messageid you gave  
The message/channel you stoped can take up to 30s to delete (all) the message(s)  
Give a list of ip with the format x.x.x.x:p for some cluster  

### Other utilities commands  
**&c / &clear** *< amount >*  
Clear an amount of message, the default amount is 100  

**Invite this bot**  
‎‎You can invite the bot by [following this link](https://bit.ly/30LMOoe)  
## Task List  
- [x] Understand the basic of GitHub, Markdown, JavaScript  

#### Server tracking
- [ ] Start tracking a server  
- [ ] Keep the server, message id of a tracked server  
- [ ] Stop tracking a server  
- [ ] Add and remove a tracked server in a message  

#### Optional
##### Make a source server query
- [ ] work on it

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
┃  ┃  ┣ 📜embedGenerator.js 
┃  ┃  ┣ 📜generateTracked.js  
┃  ┃  ┗ 📜removeVersion.js
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