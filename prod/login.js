smartApp = angular.module('smartcall', ['ngRoute']);

smartApp.controller('loginController', ['$scope', '$location', function($scope, $location) {
	var self = this;
	var myDataRef = new Firebase("https://smartcall-management.firebaseio.com/clients");	
	function authDataCallback(authData) {
	  if (authData) {
		console.log("User " + authData.uid + " is logged in with " + authData.provider);
		strLoc = window.location.pathname;
		strLoc = strLoc.replace('login.html', 'index.html');
		window.location.pathname = strLoc;
	  } else {
		  console.log("User is logged out");
	  }
	}
	
	myDataRef.onAuth(authDataCallback);
	
	self.login = function() {
		console.log("logging in");
		myDataRef.authWithOAuthRedirect("google", function(error) {
			if (error) {
				console.log("Error!", error, authData);
			}
		}, {
			remember : "sessionOnly",
			scope: "email"
		});
	}
}]);