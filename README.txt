- Full name: Nguyen Minh Thuan
- Appication: chat application
- Node version: v0.10.31
- Description: Realtime Chat Application with NodeJS, SocketIO, Expression, and MongoDB
	+ Firstly, user will go to the /home page. The user can log in or sign up in here.
	+ Next, the users login or signup with an account to login.
		if login successfully
			the user will be redirecred to /profile page or the previous page that user entered before logging in
		else
			the user still stand in /signup page
	+ In profile page:
		the user can press "Chat" button to redirect to /chat page
		the user can press "Logout" button to logout and redirect to /home page
		the user can press "Home" button to redirect to /home page
		and there are some user's information
	+ In Chat page:
		* There are also two buttons "Logout" and "Profile" to logout and redirect to the profile page respectively.
		* and the Chat interface is in here:
			The chat window is in the left of the page
			The users online window is in the right of the page
		* When the user login the /chat page, the user's status is online. And each 3 seconds, the client will sent a message to server in order to notify that "I am online".
		* If the server don't receive any message from the client in 10 seconds, the server will update the user's status is offline.
		(Nếu server không nhận được bất kì message nào từ client trong 10s thì server sẽ update trạng thái của user đó là offline).
		* if the user go to /chat page, we consider the user is online
		* if the user go to other page or logout, disconnect, etc, we consider the user is offline

- To run application on local host:
	+ setup the mongodb and run on terminal: mongod or sudo mongod
	+ go to the chatApp and type on terminal: node server.js or nodemon server.js
	+ After that, open the brower and type: http://localhost:3000 (I set port = 3000) 

- Thank you for your receiving and sorry for my poor english!