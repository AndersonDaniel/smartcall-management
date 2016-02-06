smartApp = angular.module('smartcall', ['ngRoute']);

smartApp.controller('mainController', ['$scope', function($scope) {
	var self = this;
	
	var myDataRef = new Firebase("https://smartcall-management.firebaseio.com/clients");
	var myUsersRef = new Firebase("https://smartcall-management.firebaseio.com/users");
	
	function authDataCallback(authData) {
	  self.authData = authData;
	  if (authData) {
		console.log("User " + authData.uid + " is logged in with " + authData.provider);
		myUsersRef.child(authData.uid).set(authData.google.email);
	  } else {
		window.location.pathname = window.location.pathname.replace("index.html", "login.html");
	  }
	}
	
	myDataRef.onAuth(authDataCallback);
	
	myDataRef.on('value', function(snapshot) {
		$scope.$apply(function() {
			if (snapshot.val()) {
				self.customers = snapshot.val();
			} else {
				self.customers = [];
			}
		});
	});
	
	$scope.$watchCollection('main.editCustomer', function(newValue, oldValue) {
		if (self.modal) {
			self.editError = self.validateEditCustomer();
		}
	});
	
	self.startAddCustomer = function() {
		self.modal = true;
		self.modalRole = "הוספת";
		self.finalize = self.addCustomer;
		self.editCustomer = {};
	}
	
	self.addCustomer = function() {
		self.modal = false;
		self.customers.push(self.editCustomer);
		myDataRef.set(angular.fromJson(angular.toJson(self.customers)));
	};
	
	self.startEditCustomer = function(customer) {
		self.modal = true;
		self.modalRole = "עריכת";
		self.finalize = self.finishEditCustomer(customer);
		self.editCustomer = angular.copy(customer);
	};
	
	self.finishEditCustomer = function(customer) {
		return function() {
			angular.copy(self.editCustomer, customer);
			myDataRef.set(angular.fromJson(angular.toJson(self.customers)));
		};
	};
	
	self.removeCustomer = function(index) {
		self.customers.splice(index, 1);
		myDataRef.set(angular.fromJson(angular.toJson(self.customers)));
	};
	
	self.validateEditCustomer = function() {
		if (!self.editCustomer.name) {
			return "יש למלא שם לקוח";
		}
		if (!self.editCustomer.appID) {
			return "יש למלא את שם האפליקציה";
		}
		if (!self.editCustomer.tenantID) {
			return "יש למלא את מספר השלוחה";
		}
		if (!self.editCustomer.secID) {
			return "יש למלא מזהה בטיחות";
		}
		if (!self.editCustomer.isPerm && !self.editCustomer.agentExt) {
			return "עבור לקוח לא קבוע יש למלא מספר נציג";
		}
	};
	
	self.logout = function() {
			myDataRef.unauth();
	}
}]);

