ocModal
=======

An angularJS modal directive &amp; service

### Key features
- Easy to use modal
- Dependencies free (well except angular off course)
- Load via the service or the directive
- Style yourself or use the bootstrap's theme

### [Demo on Plunker](http://embed.plnkr.co/8QBKgw779g6jT6lmhXS5/)

### Usage
- Download the lib (you can use `bower install ocModal`)
- Put ocModal.js into you project
- Add the css file to your project: if you don't have bootstrap 3, include dist/css/ocModal.full.min.css. If you already have bootstrap 3, use dist/css/ocModal.light.min.css
- Add the module ```oc.modal``` to your application
- Load on demand using the service or the directive :

**Service**:
```javascript
$ocModal.open('partials/modal.html');
```
or
```javascript
$ocModal.open('<div>My content</div>');
```

**Directive**:
```html
<div oc-modal-open="'partials/modal.html'"></div>
```
or
```html
<div oc-modal-open="'<div>My content</div>'"></div>
```

See the example in the 'example' folder to know how to integrate ocLazyLoad with your router.

### Parameters
You can also pass parameters when you open a modal via the service or the directive. The previous examples are equivalent to :

**Service**:
```javascript
$ocModal.open({
	url: 'partials/modal.html'
});
```
or
```javascript
$ocModal.open({
	template: '<div>My content</div>'
});
```

**Directive**:
```html
<div oc-modal-open="{url: 'partials/modal.html'}"></div>
```
or
```html
<div oc-modal-open="{template: '<div>My content</div>'}"></div>
```

The complete list of parameters is :
- **id**: you can specify an id for your modal, it is usefull if you want to open more than one modal at the same time
```javascript
$ocModal.open({
	id: 'modal1',
	url: 'partials/modal.html'
});
```
By default the id is set to ```'_default'```.

- **url**: a template url loaded via [ng-include](http://docs.angularjs.org/api/ng.directive:ngInclude), so you can use an ng-script template or the url of an external html file

- **template**: if you prefer to write the template in line, you can use the ```template``` parameter instead of ```url```.

- **controller**: you can pass a controller for the new content
```javascript
$ocModal.open({
	url: 'partials/modal.html',
	controller: 'MyController'
});
```

- **cls**: You can specify one or more (space separated) classes to be added to the modal
```javascript
$ocModal.open({
	url: 'partials/modal.html',
	cls: 'my-class1 my-class2'
});
```

- **onOpen**: you can add a callback that will be called when the modal is opened
```javascript
$ocModal.open({
	url: 'partials/modal.html',
	onOpen: function() {
		console.log('Just opened !');
	}
});
```

- **onClose**: you can add a callback that will be called when the modal is closed
```javascript
$ocModal.open({
	url: 'partials/modal.html',
	onClose: function() {
		console.log('Just closed !');
	}
});
```

- **init**: use this to populate the modal scope. If you use a controller you will also be able to access this via $init
```javascript
$ocModal.open({
	template: '<div>{{param1}}</div>',
	controller: 'MyController',
	init: {
		param1: 'test'
	}
});
```

And in your controller :
```javascript
angular.module('app').controller('MyController', ['$scope', '$init', function($scope, $init) {
	console.log($scope.param1, $init.param1);
}]);
```

- **$ocModalParams**: Access the modal params in your controller
```javascript
angular.module('app').controller('MyController', ['$scope', '$ocModalParams', function($scope, $ocModalParams) {
	console.log($ocModalParams);
}]);
```

- **isolate**: by default your modal's scope will inherit the variables from the init parameter. If you don't want that and you prefer to access these variables via the $init in your controller, you can use ```isolate=true```
```javascript
$ocModal.open({
	url: 'partials/modal.html',
	controller: 'MyController',
	isolate: true,
	init: {
		param1: 'test'
	}
});
```

And use $init in your controller :
```javascript
angular.module('app').controller('MyController', ['$scope', '$init', function($scope, $init) {
	console.log($init.param1);
}]);
```

But ```$scope.param1``` will be ```undefined```.

- **closeOnEsc**: by default you will be able to close the modal with the "ESC" key. If you want to disable this behaviour, use ```closeOnEsc: false```
```javascript
$ocModal.open({
	url: 'partials/modal.html',
	closeOnEsc: false
});
```

### Functions & attributes
- **open(**__url/template/object__**)**: use this to open the modal
```javascript
$ocModal.open({
	url: 'partials/modal.html'
});
```

- **close(**__[id][, param1][, param2][, ...]__**)**: use this to close the modal, it will return a promise that resolves at the end of the closing animation (if any)
```javascript
$ocModal.close();
```

With no parameter it will close the last opened modal. If you want to close a specific modal, use the id.
```javascript
$ocModal.close('modal1');
```

You can also pass what you want to the onClose callback (if you have one) :
```javascript
$ocModal.open({
	url: 'partials/modal.html',
	onClose: function(a, b, c) {
		console.log(a); // arg1
		b(); // whatever
		console.log(c); // {p1: 'test'}
	}
});

$ocModal.close('arg1', function() { console.log('whatever') }, {p1: 'test'});
```

- **$scope.closeModal(**__[id][, param1][, param2][, ...]__**)**: this is an alias for ```$ocModal.close()``` that you can also use in your template
```html
<button ng-click="closeModal()"></button>
```

- **getOpenedModals()**: if you need to get the ids of the opened modals

- **waitingForOpen**: check this property if you need to know if another modal will be opened once this one is closed
```javascript
$ocModal.open({
	url: "partials/login.html",
	controller: 'LoginCtrl',
	onClose: function() {
		if(!$ocModal.waitingForOpen) {
			$state.transitionTo('welcome');
		}
	}
});
```

### Directives
- **oc-modal-open**: this is an alias for ```$ocModal.open()``` that you can also use in your template.
```html
<div oc-modal-open="{url: 'partials/modal.html'}"></div>
```

- **oc-modal-close**: this is an alias for ```$ocModal.close()``` that you can also use in your template.
```html
<button oc-modal-close="'Some text '+testVar"></button>
```

### Animations
You can use a set of animations by including the file ocModal.animations.css and by adding one of those classes with the cls parameter :
- fade-in
- slide-down
- scale
- fall
- flip-horizontal
- flip-vertical
- super-scaled
- slit

```javascript
oc-modal-open="{url: 'partials/modal.html', cls: 'fade-in'}"
```

You can add your own animations by adding new styles to `.modal .modal-dialog .modal-content` and `.modal .modal-dialog .modal-content.opened`.
