This is a backend project that allows you to search up a user on league of legends information. this is similar to another site known as op.gg. if you haven't used it before, try it out.

This website uses riot games and their api's to show informations about a player in a clean and friendly way. The low number of requests that are allowed to be made on a personal and development api key is quite low, so i decided to get around that using databases to stored already known information. By doing this, i wont need to request to riot games every single time if i have to.

Unfortunately, I am probably unable to get a permanent api key from riot games, so if you want to see the website for yourself, you are going to have to set it up. Instructions are below

1. First, you are going to need to get an api key from riot games. Its probably best to get a development key if you are going to use this website temporarily, which is what ill walk you through. Make an account https://developer.riotgames.com/ there. That exact link will likely prompt you to login into a riot games account as well as to make your account a developer. do that. That same link also brings you to where you can get your development api key, so once you get an account, go back there and create a new riot key.

2. You will also need to make a mongoDB account, and get a culsters uri. freecodecamp has a good tutorial for this. https://www.freecodecamp.org/news/get-started-with-mongodb-atlas/. keep your uri somewhere, we need it later.

2. download dependencies for this project. You can do that by opening windows command prompt or some terminal, moving the command prompt to this exact folder, and running npm install. You need npm installed for this.

3. Go into the server folder and create a file named ".env". In that file add in RIOT_KEY="penis" replacing penis with whatever your development riot key is. create another line with MONGO_URI="penis", once again replacing penis with what your mongoDB uri is. 

4. use your terminal or command prompt and navigate to the server folder. run node server.js. after that, in your browser type localhost:5000. If you get an error saying you cannot get /, its working right.

5. Now it should be working right. run "npm start" at the root folder to run the development build. I've unfortunately never tested getting someone else to work this right, so youre almost definetly going to run into problems. You are also going to run into problems if you are from the future, since league will have new assets and stuff.