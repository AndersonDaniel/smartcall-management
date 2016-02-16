smartApp = angular.module('smartcall', []);

smartApp.controller('statsController', ['$scope', '$location', function($scope, $location) {
	var self = this;
	
	var myDataRef = new Firebase("https://smartcall-management.firebaseio.com/logs");
	
	self.displayID = $location.search()['app'];
	
	self.copy = function() {
		var textArea = document.createElement('textarea');
		var NEW_LINE = String.fromCharCode(10);
		textArea.value = ['אפליקציה', 'מחלקה', 'מספר משתמש', 'מועד בקשה'].join('\t') + NEW_LINE;
		textArea.value += 
			self.logs.map(function(log) { return (['appName', 'tenantName', 'phone', 'when'].map(function(k) { return log[k]; }).join('\t')); }).join(NEW_LINE);
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		document.execCommand('copy');
		document.body.removeChild(textArea);
	};
	
	myDataRef.on('value', function(snapshot){
			if (snapshot.val()){
				$scope.$apply(function(){
					self.logs = snapshot.val().filter(function(row) {
						return (row.appID == self.displayID);
					});	
				});
			}
	});
}]);