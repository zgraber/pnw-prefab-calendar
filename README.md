# pnw-prefab-calendar
An Express.js web app that uses OAuth 2.0 to access the Microsoft Graph API to get event data to be displayed in a 2 
month calendar view (other views are also available). Ubuntu will be the preferred OS to run on.
For more info on Express.js - https://expressjs.com/

## Getting Started
### Prerequisites
* System running Ubuntu (Windows works for some elements)
* Google Chrome
### Installing
1. Node.js
    * On Ubuntu run the commands 
    ```bash
      $ sudo apt update
      $ sudo apt install nodejs
      $ nodejs --version
    ```
2. npm (Ubuntu only)
    * Run the commands:
    ```bash
      $ sudo apt install npm
      $ npm --version
    ```
3. PM2
    * Run the commands:
    ```bash
      $ npm install pm2@latest -g
    ```
### Configuring Server
1. Extract the files by either zipping the repo and extracting it into the Documents folder on the machine or
using git on the machine to clone the repo locally. This takes more knowledge of git but will allow for changes to be pulled. 
1. In the folder you just extracted, run ```$ npm install``` to install all necessary dependencies.
This should make a folder called node_modules
1. The app also needs a .env file to get necessary info about the app.
The .env file should be placed in the main app directory and should look like the following.
You can get the Id from Azure AD admin center under App registrations. 
The Password should be a secret so that will be stored elsewhere
```
    APP_ID=<YOUR_APP_ID>
    APP_PASSWORD=<YOUR_APP_PASSWORD>
    APP_SCOPES=openid profile offline_access User.Read Mail.Read MailboxSettings.Read Calendars.Read
    REDIRECT_URI=http://localhost:3000/authorize
```
1. To verify everything works run ```$ npm start``` which should pull up a log in the terminal and a Chrome window in kiosk mode
with a MS login page (Windows has trouble with kiosk mode)
### Running on startup/reboot
This step daemonizes the app with a service called PM2
1. Run the command `$ pm2 startup` which will auto generate a command for you to run
2. Start the app as a process by running these commands in the app folder
```bash
    $ pm2 start npm -- start
    $ pm2 list #Verify npm is running as a process
```
3. Save the process list to respawn on reboot with ```$ pm2 save```
4. Reboot your machine and verify the app launches with a Chrome browser or the process is running with
```
    $ pm2 list
```
5. Make sure autologin is on for the account the app is running on
6. For the account you want the calendar from, make sure you turn on save password on the MS login
## Built with
* Express.js - Web App Framework
* FullCalendar.js - JS framework for calendar interface
* MS Graph - Microsoft API for working with Office 365 info
* PM2 - Daemon process manager
## Authors
* [Zak Graber](https://github.com/zgraber) - IT Intern
## References
* http://pm2.keymetrics.io/docs/usage/startup/
* https://docs.microsoft.com/en-us/graph/overview?view=graph-rest-1.0
* https://docs.microsoft.com/en-us/outlook/rest/node-tutorial
