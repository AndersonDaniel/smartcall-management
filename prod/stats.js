smartApp = angular.module('smartcall', []);

smartApp.controller('statsController', ['$scope', '$location', '$filter', function($scope, $location, $filter) {
	var self = this;
	
	var myDataRef = new Firebase("https://smartcall-management.firebaseio.com/logs");
	
	self.displayID = $location.search()['app'];
	
	self.copy = function() {
		var textArea = document.createElement('textarea');
		var NEW_LINE = String.fromCharCode(10);
		textArea.value = ['אפליקציה', 'מחלקה', 'מספר משתמש', 'מועד בקשה'].join('\t') + NEW_LINE;
		textArea.value += 
			self.logs.
				map(function(log) { 
					return (['appName', 'tenantName', 'phone', 'when'].map(function(k) { 
						if (k != 'when') { return log[k]; }
						return ($filter('date')(new Date(log[k]), 'dd/MM/yyyy'));
					}).join('\t'));
				}).join(NEW_LINE);
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		document.execCommand('copy');
		document.body.removeChild(textArea);
	};
	
	self.initGraph = function(categories, series) {
		$(document).ready(function () {
			$('#container').highcharts({
				title: {
					text: 'בקשות לשיחות מ' + self.logs[0].appName,
					x: -20 //center
				},
				subtitle: {
					text: 'מתחילת החודש',
					x: -20
				},
				xAxis: {
					categories: categories
				},
				yAxis: {
					title: {
						text: 'כמות בקשות'
					},
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					}]
				},
				tooltip: {
					valueSuffix: ' בקשות'
				},
				legend: {
					layout: 'vertical',
					align: 'right',
					verticalAlign: 'middle',
					borderWidth: 0
				},
				series: series
			});
		});
	};
	
	self.getCategories = function() {
		var now = new Date();
		categories = [];
		
		for (var i = 1; i <= now.getDate(); i++) {
			categories.push(('0' + i).slice(-2) + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + now.getFullYear());
		}
		
		return (categories);
	};
	
	self.getSeries = function() {
		var now = new Date();
		
		function emptySeries() {
			values = [];
			
			for (var i = 0; i < now.getDate(); i++) {
				values.push(0);
			}
			
			return (values);
		};
		
		var series = {};
		for (var i = 0; i < self.logs.length; i++) {
			var logDate = new Date(self.logs[i].when);
			var logTenant = self.logs[i].tenantName;
			if (logDate.getMonth() == now.getMonth() && logDate.getFullYear() == now.getFullYear()) {
				if (!series[logTenant]) {
					series[logTenant] = emptySeries();
				}
				
				series[logTenant][logDate.getDate() - 1]++;
			}
		}
		
		return (Object.keys(series).map(function(k) {
			return {
				name: k,
				data: series[k]
			};
		}));
	};
	
	myDataRef.on('value', function(snapshot){
			if (snapshot.val()){
				$scope.$apply(function(){
					self.logs = snapshot.val().filter(function(row) {
						return (row.appID == self.displayID);
					});	
					
					if (self.logs.length > 0) {
						setTimeout(function() {
							self.initGraph(self.getCategories(), self.getSeries());
						}, 100);
					};
				});
			}
	});
}]);

