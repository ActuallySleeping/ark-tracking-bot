![ARK: Survival Evolved, Genesis part 2 Camera System Cropt](https://i.imgur.com/IfNjeu7.jpeg)
# Discord bot for player and server tracking on ARK  
## Introduction  
This is my first projet regarding JavaScript as well as the use of GitHub  a
My goal was to let people track who is online on a server of their choice
and be able to get warning when someone connected to a defined server.

I was able to do it, but the code wasn't very efficient and took a lot of time to only track a few servers and not even track any player, so i got back to only server tracking and tried to improve it.  

## Commands  
### Server tracking
**&ss / &start** *x.x.x.x:p  < ... x.x.x.x:p ... >*  
Let you start the tracking of a server  
**&so / &sstop** *< message_id >*  
Stop the every tracking in a channel or only the one with the messageid you gave  
The message/channel you stoped can take up to 30s to delete (all) the message(s)  
Give a list of ip with the format x.x.x.x:p for some cluster  

### Other utilities commands  
**%h / &help**
gives a list of the commands
**&c / &clear** *< amount >*  
Clear an amount of message, the default amount is 100  

**Invite this bot**  
‎‎You can invite the bot by [following this link](https://bit.ly/30LMOoe)  
## Task List  
- [x] Understand the basics of GitHub, Markdown, JavaScript, sqlite3  

#### Server tracking
- [x] Start tracking a server  
- [x] Keep the server, message id of a tracked server  
- [x] Stop tracking a server  

#### Optional
- [x] Create a database file when missing
- [ ] Make a source server query

## How was the project made  
### Used Node_modules  
- discord.js  
- fs
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
┃  ┃  ┣ 📜help.js  
┃  ┃  ┣ 📜start.js 
┃  ┃  ┗ 📜stop.js
┃  ┃
┃  ┣ 📂tools/  
┃  ┃  ┣ 📜embedGenerator.js 
┃  ┃  ┗ 📜toolbox.js
┃  ┃
┃  ┣🗄️base.db  
┃  ┣⚙️config.json
┃  ┗⚙️token.json
┃ 
┣ ⚙️.gitignore  
┣ 📜index.js  
┣ ⚙️package.json  
┣ ⚙️package-lock.json  
┗ 📝README.md  
``` 