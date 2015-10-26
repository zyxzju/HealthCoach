describe('SignInCtrl',function(){
	beforeEach(module('ionicApp'));
	// beforeEach(function(){
	// 	module('ionicApp.service');
	// })
	// beforeEach(inject(function($rootScope,$controller,userservice,codeDefine){
	// 	scope = $rootScope.$new();
	// 	users = userservice;
	// 	codedefi = codeDefine;
	// 	stateMock = jasmine.createSpyObj('$state spy', ['go']);
	// 	ctrl=$controller('SignInCtrl',{$state: stateMock, $scope: scope, userservice:users, codeDefine:codedefi});
	// }));
	beforeEach(inject(function($rootScope,$controller){
		scope = $rootScope.$new();
	
		stateMock = jasmine.createSpyObj('$state spy', ['go']);
		ctrl=$controller('SignInCtrl',{$state: stateMock, $scope: scope});
	}));
	it('密码错误', function(){
		//var user=$scope.user;
		//$scope.username ="";
		//$scope.password = "";
		scope.username="xiongjzh";
		scope.password="123"

		expect(scope.logStatus).toBeUndefined();
		//expect(scope.t).toBeUndefined();

		//scope.signIn("xiongjzh","123");
		scope.signIn(scope.username,scope.password);
		expect(scope.username).toEqual("xiongjzh");
		expect(scope.logStatus).toEqual("密码错误！");

	});

	it('go to starting',function(){
		scope.username="xiongjzh";
		scope.password="123456";

		expect($state).toMatch('starting');
	})
});

describe('forgotPasswordCtrl',function(){
	beforeEach(module('ionicApp'));
	// beforeEach(function(){
	// 	module('ionicApp.service');
	// })
	beforeEach(inject(function($rootScope,$controller){
		$scope = $rootScope.$new();
		$controller('forgotPasswordCtrl',{$scope: $scope});
	}));
	it('输入不完整', function(){
		//var user=$scope.user;
		//$scope.reset ={username:"" , verifyCode:""};

		expect($scope.logStatus).toBeUndefined();


		$scope.gotoReset({username:"xiongjzh",verifyCode:''});
		expect($scope.logStatus).toEqual("请输入完整信息！");

	});
});
