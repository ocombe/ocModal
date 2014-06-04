'use strict';

var App = angular.module('app', ['oc.modal']);

App.controller('AppCtrl', ['$scope', '$ocModal', function($scope, $ocModal) {
	$ocModal.open({
		url: 'partials/modal.html',
		cls: 'test fade-in',
		onOpen: function() {
			console.log('modal1 opened from url');
		}
	})


	$ocModal.open({
		id: 'tempModal',
		template: '<div class="text-center modal-body"><button class="btn btn-danger" oc-modal-close="\'Text from close btn\'">{{ testVar }}</button></div>',
		controller: 'TestCtrl',
		cls: 'slide-down',
		onClose: function(a, b) {
			console.log('on close callback:', a, b);
		},
		init: {
			testVar: 'Close this or wait 5s'
		}
	})
}]);

App.controller('TestCtrl', ['$scope', '$ocModal', '$timeout', function($scope, $ocModal, $timeout) {
	$timeout(function() {
		if($ocModal.getOpenedModals().indexOf('tempModal') !== -1) {
			$ocModal.close('tempModal', 'var a', 'var b');
		}
	}, 5000);
}]);