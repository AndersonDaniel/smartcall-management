smartApp = angular.module('smartcall', ['ngRoute']);

smartApp.controller('loginController', ['$scope', '$location', function($scope, $location) {
	var self = this;
	var myDataRef = new Firebase("https://smartcall-management.firebaseio.com/clients");	
	function authDataCallback(authData) {
	  if (authData) {
		strLoc = window.location.pathname;
		strLoc = strLoc.replace('login.html', 'index.html');
		window.location.hash = '';
		window.location.pathname = strLoc;
	  } else {
		  // User logged out
	  }
	}
	
	myDataRef.onAuth(authDataCallback);
	
	self.login = function() {
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