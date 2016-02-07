smartApp = angular.module('smartcall', ['ngRoute']);

smartApp.controller('unauthController', ['$scope', function($scope) {
	var self = this;
	var myDataRef = new Firebase("https://smartcall-management.firebaseio.com/clients");	
	
	self.logout = function() {
		myDataRef.unauth();
	}
}]);