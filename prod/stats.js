smartApp = angular.module('smartcall', []);

smartApp.controller('statsController', ['$scope', '$location', function($scope, $location) {
	var self = this;
	
	var myDataRef = new Firebase("https://smartcall-management.firebaseio.com/clients");
	
	alert($location.search()['app']);
	
	myDataRef.on('value', function(snapshot){
			if (snapshot.val()){
				
			}
	});
}]);