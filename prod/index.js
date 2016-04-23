smartApp = angular.module('smartcall', ['ngRoute']);

smartApp.controller('mainController', ['$scope', function($scope) {
	var self = this;

	self.days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
	
	var myDataRef = new Firebase("https://smartcall-management.firebaseio.com/clients");
	var myUsersRef = new Firebase("https://smartcall-management.firebaseio.com/users");
	var myAuthUsersRef = new Firebase("https://smartcall-management.firebaseio.com/auth-users");
	
	function validateAuthUser() {
		if (self.authData && self.authUsers) {
			if (!self.authUsers[self.authData.auth.uid]) {
				window.location.pathname = window.location.pathname.replace("index.html", "unauth.html");
			}
		}
	}
	
	function authDataCallback(authData) {
	  self.authData = authData;
	  if (authData) {
		console.log("User " + authData.uid + " is logged in with " + authData.provider);
		myUsersRef.child(authData.uid).set(authData.google.email);
		if (self.authUsers) {
			validateAuthUser();
		}
	  } else {
		window.location.pathname = window.location.pathname.replace("index.html", "login.html");
	  }
	}
	
	function populateTenantWorkdays(tenant) {
		tenant.workdays = [
			{
				"inactive" : true,
				"start" : "08:00",
				"end" : "18:00"
			},
			{
				"inactive" : true,
				"start" : "08:00",
				"end" : "18:00"
			},
			{
				"inactive" : true,
				"start" : "08:00",
				"end" : "18:00"
			},
			{
				"inactive" : true,
				"start" : "08:00",
				"end" : "18:00"
			},
			{
				"inactive" : true,
				"start" : "08:00",
				"end" : "18:00"
			},
			{
				"inactive" : true,
				"start" : "08:00",
				"end" : "18:00"
			},
			{
				"inactive" : true,
				"start" : "08:00",
				"end" : "18:00"
			}
		];
	}
	
	myDataRef.onAuth(authDataCallback);
	
	myDataRef.on('value', function(snapshot) {
		exec = function() {
			if (snapshot.val()) {
				self.customers = snapshot.val();
			} else {
				self.customers = [];
			}
		};
		if (!$scope.$$phase) {
			$scope.$apply(exec);
		} else {
			exec();
		}
	});
	
	myAuthUsersRef.on('value', function(snapshot) {
		self.authUsers = snapshot.val();
		if (self.authData) {
			validateAuthUser();
		}
	});
	
	$scope.$watchCollection('main.editCustomer', function(newValue, oldValue) {
		if (self.customerModal) {
			self.editError = self.validateEditCustomer();
		}
	});
	
	$scope.$watchCollection('main.editTenant', function(newValue, oldValue) {
		if (self.tenantModal) {
			self.editError = self.validateEditTenant();
		}
	});
	
	for (var i = 0; i < self.days.length; i++) {
		$scope.$watchCollection('main.editTenant.workdays[' + i + ']', function(newValue, oldValue) {
			if (self.tenantModal) {
				self.editError = self.validateEditTenant();
			}
		});
	}
		
	self.startAddCustomer = function() {
		self.customerModal = true;
		self.customerModalRole = "הוספת";
		self.finalize = self.addCustomer;
		self.editCustomer = {};
	}
	
	self.addCustomer = function() {
		self.customerModal = false;
		self.customers.push(self.editCustomer);
		myDataRef.set(angular.fromJson(angular.toJson(self.customers)));
	};
	
	self.startEditCustomer = function(customer) {
		self.customerModal = true;
		self.customerModalRole = "עריכת";
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
		bootbox.confirm("האם אתה בטוח שברצונך למחוק את הלקוח?", function(res) {
			if (res) {
				self.customers.splice(index, 1);
				myDataRef.set(angular.fromJson(angular.toJson(self.customers)));
			}
		});
	};
	
	self.validateEditCustomer = function() {
		if (!self.editCustomer.name) {
			return "יש למלא שם לקוח";
		}
		if (!self.editCustomer.isPerm && !self.editCustomer.agentExt) {
			return "עבור לקוח לא קבוע יש למלא מספר נציג";
		}
		if (!self.editCustomer.isPerm && 
			(!self.editCustomer.agentExt.match(/^(((\d+\-?)+)|(\d+))$/) || self.editCustomer.agentExt.length < 7)) {
			return "מספר הנציג לא תקין";
		}
		if (self.editCustomer.isPrivate && !self.editCustomer.privateCode) {
			return "עבור לקוח פרטי יש להגדיר קוד פרטי";
		}
		
	};
	
	self.startAddTenant = function(customer) {
		self.tenantModal = true;
		self.tenantModalRole = "הוספת";
		self.finalize = self.addTenant(customer);
		self.editTenant = {};
		populateTenantWorkdays(self.editTenant);
	};
	
	self.addTenant = function(customer) {
		return function() {
			if (!customer.tenants) {
				customer.tenants = [];
			}
			
			customer.tenants.push(self.editTenant);
			myDataRef.set(angular.fromJson(angular.toJson(self.customers)));
		};
	};
	
	self.startEditTenant = function(tenant) {
		self.tenantModal = true;
		self.tenantModalRole = "עריכת";
		self.finalize = self.finishEditTenant(tenant);
		self.editTenant = angular.copy(tenant);
		if (!self.editTenant.workdays) {
			populateTenantWorkdays(self.editTenant);
		}
	};
	
	self.finishEditTenant = function(tenant) {
		return function() {
			angular.copy(self.editTenant, tenant);
			myDataRef.set(angular.fromJson(angular.toJson(self.customers)));
		};
	};
	
	self.removeTenant = function(customer, nTenantIndex) {
		bootbox.confirm("האם אתה בטוח שברצונך למחוק את השלוחה?", function(res) {
			$scope.$apply(function () {
				if (res) {
					customer.tenants.splice(nTenantIndex, 1);
					myDataRef.set(angular.fromJson(angular.toJson(self.customers)));
					
					if (customer.tenants.length == 0) {
						self.expanded[customer.appID] = false;
					}
				}	
			});			
		});
	};
	
	self.validateEditTenant = function() {
		if (!self.editTenant.name) {
			return "יש למלא שם שלוחה";
		}
		if (!self.editTenant.appID) {
			return "יש למלא מזהה אפליקציה";
		}
		if (!self.editTenant.tenantID) {
			return "יש למלא מזהה שלוחה";
		}
		if (!self.editTenant.tenantID.match(/^\d+$/)) {
			return "מזהה השלוחה לא מספרי";
		}
		if (!self.editTenant.secID) {
			return "יש למלא מזהה בטיחות";
		}
		for (var nDayIndex = 0; nDayIndex < 7; nDayIndex++) {
			var workday = self.editTenant.workdays[nDayIndex];
			if (!workday.inactive && !workday.allday) {
				if (!workday.start.match(/^\d\d:\d\d$/)) {
					return "שעת תחילת עבודה ביום " + self.days[nDayIndex] + " אינה תקינה";
				} else if (!workday.end.match(/^\d\d:\d\d$/)) {
					return "שעת סוף עבודה ביום " + self.days[nDayIndex] + " אינה תקינה";
				}
			}
		}
	};
	
	self.logout = function() {
			myDataRef.unauth();
	}
	
	self.expanded = {};
	self.expand = function(appIndex) {
		self.expanded[appIndex] = !self.expanded[appIndex];
	};
	
	var imgHolder = document.getElementById('imgHolder');
	imgHolder.ondragover = function() {
		this.className = "dragging";
		return false;
	};
	imgHolder.ondragleave = function() {
		this.className = "";
	};
	imgHolder.ondragend = function() {
		this.className = "";
		return false;
	};
	imgHolder.ondrop = function(e) {
		this.className = "";
		e.preventDefault();
		//console.log(e.dataTransfer.files);
		var imgFile = e.dataTransfer.files[0];
		var reader = new FileReader();
		reader.onload = function(event) {
			$scope.$apply(function () {
				self.editCustomer.image = event.target.result;
			});
		};
		reader.readAsDataURL(imgFile);
	};
	
}]);