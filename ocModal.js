/**
 * copyright: Olivier Combe (https://github.com/ocombe/ocModal)
 */

(function() {
	'use strict';

	var ocModal = angular.module('oc.modal', []);

	ocModal.factory('$ocModal', ['$rootScope', '$controller', '$location', '$timeout', '$compile', function($rootScope, $controller, $location, $timeout, $compile) {
		var $body = angular.element(document.body),
			$modalWrapper,
			$dialogsWrapper,
			modals = {},
			openedModals = [],
			baseOverflow;

		angular.element(document).on('keyup', function(e) {
			if (e.keyCode == 27 && openedModals.length > 0) {
				e.stopPropagation();
				$rootScope.$apply(function() {
					self.closeOnEsc(openedModals[openedModals.length - 1]);
				});
			}
		});

		var self = {
			waitingForOpen: false,

			getOpenedModals: function() {
				return openedModals;
			},

			register: function(params) {
				modals[params.id || '_default'] = params;
			},

			remove: function(id) {
				delete modals[id || '_default'];
			},

			open: function(opt) {
				if(typeof opt === 'string') {
					if(opt.match('<')) { // if html code
						opt = {
							template: opt
						}
					} else {
						opt = {
							url: opt
						}
					}
				}
				if(typeof $modalWrapper === 'undefined') {
					$dialogsWrapper = angular.element('<div role="dialog" tabindex="-1" class="modal fade in"><div class="modal-backdrop fade in"></div></div>');
					$modalWrapper = angular.element(
						'<div class="modal-wrapper fade-in"></div>'
					);
					$modalWrapper.append($dialogsWrapper);
					$body.append($modalWrapper);
					var $backdrop = $dialogsWrapper.children()[0];
					$dialogsWrapper.on('click.modal', function(e) {
						if(e.target === $backdrop) { // only if clicked on backdrop
							$rootScope.$apply(function() {
								self.closeOnEsc();
							});
						}
						e.stopPropagation();
					});
				}
				var modal = modals[opt.id || '_default'];
				if(!modal) {
					$dialogsWrapper.append($compile('<div oc-modal="'+(opt.id ? opt.id : '_default')+'"></div>')($rootScope));
					$timeout(function() { // let the ng-include detect that it's now empty
						self.open(opt);
					});
					return;
				} else if(modal && openedModals.indexOf(opt.id || '_default') !== -1) { // if modal already opened
					self.waitingForOpen = true;
					self.close(opt.id);
					$timeout(function() { // let the ng-include detect that it's now empty
						self.open(opt);
					});
					return;
				}
				// ok let's open the modal
				if(!self.waitingForOpen) {
					if(openedModals.length === 0) { // if no modal opened
						baseOverflow = document.body.style.overflow;
						document.body.style.overflow = 'hidden';
						$modalWrapper.css('display', 'block');
					} else {
						for(var i = 0, len = openedModals.length; i < len; i++) {
							var $e = modals[openedModals[i]].$element;
							modals[openedModals[i]].baseZIndex = $e.css('z-index');
							$e.css('z-index', '-1');
						}
					}
				}
				self.waitingForOpen = false;
				openedModals.push(opt.id || '_default');
				modal.params = opt;
				modal.$scope.modalShow = true;
				modal.$scope.customClass = modal.params.cls;

				if(typeof modal.params.onOpen === 'function') {
					modal.params.onOpen();
				}

				var off = modal.$scope.$on('$includeContentLoaded', function(event) { // on view load
					if(modal.params.init && !modal.params.isolate) {
						angular.extend(event.targetScope, modal.params.init, true);
					}
					if(typeof modal.params.controller === 'string') {
						$controller(modal.params.controller, {$scope: event.targetScope, $init: modal.params.init}); // inject controller
					}
					off();
				});

				if(modal.params.template) {
					modal.$scope.modalTemplate = modal.params.template; // load the view
				} else if(modal.params.url) {
					modal.$scope.modalUrl = modal.params.url; // load the view
				} else {
					throw "You need to define a template or an url";
					return;
				}

				if(typeof callback === 'function') {
					modal.$scope.callbacksList.push(callback);
				}
			},

			closeOnEsc: function(id) {
				if(modals[id || openedModals[openedModals.length -1]].params.closeOnEsc !== false) {
					self.close(id);
				}
			},

			close: function(id) {
				var args;
				if(typeof id === 'string' && openedModals.indexOf(id) !== -1) {
					args = Array.prototype.slice.call(arguments, 1);
				} else {
					args = arguments;
				}
				if(typeof id === 'undefined' || openedModals.indexOf(id) === -1) {
					id = openedModals[openedModals.length -1];
				}
				var modal = modals[id || openedModals[openedModals.length -1]];
				if(modal && modal.$scope.modalShow === true) { // if the modal is opened
					modal.$scope.modalShow = false;
					modal.$element.remove(); // destroy the modal
					modal.callbacksList = []; // forget all callbacks
					openedModals.splice(openedModals.indexOf(id || openedModals[openedModals.length -1]), 1);
					if(openedModals.length === 0) { // if no modal left opened
						$timeout(function() {
							if(!self.waitingForOpen) { // in case the current modal is closed because another opened with the same id (avoid backdrop flickering in firefox)
								document.body.style.overflow = baseOverflow; // restore the body overflow
								$modalWrapper.css('display', 'none');
							}
						});
					} else {
						var topModal = modals[openedModals[openedModals.length - 1]];
						topModal.$element.css('z-index', topModal.baseZIndex);
					}
					if(typeof modal.params.onClose === 'function') {
						modal.params.onClose.apply(undefined, args);
					}
				}
			}
		};

		return self;
	}]);

	ocModal.directive('ocModal', ['$ocModal', '$compile', '$timeout', function($ocModal, $compile, $timeout) {
		return {
			restrict: 'AE',
			replace: true,
			scope: true,
			template:
				'<div class="modal-dialog {{customClass}}" ng-show="modalShow">' +
					'<div class="modal-content" ng-if="modalTemplate"></div>' +
					'<div class="modal-content" ng-include="modalUrl"></div>' +
				'</div>',

			link: function link($scope, $element, $attrs) {
				var dialog = $element.find('[role=dialog]'),
					id = $attrs.ocModal,
					$templateWrapper;

				$scope.closeModal = function() {
					var args = Array.prototype.slice.call(arguments);
					args.unshift(id);
					$ocModal.close.apply(undefined, args);
				};

				$ocModal.register({
					id: id,
					$scope: $scope,
					$element: $element
				});

				$element.on('$destroy', function() {
					$ocModal.remove(id);
				});

				$scope.$watch('modalTemplate', function(newVal, oldVal) {
					if(typeof newVal !== 'undefined') {
						if(!$templateWrapper) {
							$templateWrapper = angular.element($element.children()[0]);
						}
						$templateWrapper.append($compile(newVal)($scope));
						$scope.$emit('$includeContentLoaded');
					}
				});
			}
		}
	}]);

	ocModal.directive('ocModalOpen', ['$ocModal', function($ocModal) {
		return {
			restrict: 'A',
			require: '?modal',
			link: function($scope, $element, $attrs) {
				$element.on('click touchstart', function(e) {
					e.preventDefault();
					e.stopPropagation();
					var newScope = $scope.$new();
					var params = newScope.$eval($attrs.ocModalOpen);
					if(params) {
						if(typeof params === "number") {
							params = { url: $attrs.ocModalOpen };
						} else if(typeof params === "string") {
							params = { url: params };
						}
						if(!params.url) {
							throw "You need to set the modal url";
						}
						$scope.$apply(function() {
							$ocModal.open(params);
						});
					}
				});
			}
		};
	}]);

	ocModal.directive('ocModalClose', ['$ocModal', function($ocModal) {
		return {
			restrict: 'A',
			require: '?modal',
			link: function($scope, $element, $attrs) {
				$element.on('click touchstart', function(e) {
					e.preventDefault();
					e.stopPropagation();
					$scope.$apply(function() {
						if($attrs.ocModalClose) {
							var params = $scope.$new().$eval($attrs.ocModalClose);
						}
						$ocModal.close(params);
					});
				});
			}
		};
	}]);
})();
