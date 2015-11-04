var ionicApp=angular.module('ionicApp', ['ionic','ionicApp.service', 'ionicApp.directives', 'ngCordova','ja.qr','ionic-datepicker', 'appControllers'])

.config(['$stateProvider','$urlRouterProvider','$ionicConfigProvider', function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
  $ionicConfigProvider.platform.android.tabs.position('bottom');
  $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    //用户管理（登录及注册相关）
  $stateProvider
    .state('starting',{
      url:'/starting',
      templateUrl:'partials/login/starting.html',
      controller:'startingCtrl'
    })
    .state('signin', {
      cache: false,
      url: '/signin',
      templateUrl: 'partials/login/signin.html',
      controller: 'SignInCtrl'
    })
    // .state('register',{
    //   url:'/register',
    //   templateUrl:'partials/login/register.html',
    //   controller: 'registerCtrl'
    // })    
    .state('phonevalid', {
      url: '/phonevalid',
      cache: false,
      templateUrl: 'partials/login/phonevalid.html',
	    controller: 'phonevalidCtrl'
    })
    .state('setpassword', {
      //cache:false,
      url: '/setpassword',
      templateUrl: 'partials/login/setPassword.html',
      controller: 'setPasswordCtrl'
    })
    .state('changepassword', {
      url: '/changePassword',
        templateUrl: 'partials/login/changePassword.html',
        controller:'changePasswordCtrl' 
    })
    .state('userdetail',{
      url:'/userdetail',
      templateUrl:'partials/login/userDetail.html',
      controller:'userdetailCtrl'
    })
    .state('qrcode', {
      url: '/qrcode',
      templateUrl: 'partials/home/QRgenerate.html'
    })
    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'partials/home/tabs.html'
    })
    .state('tabs.home', {
      url: '/home',
      views: {
        'home-tab': {
          templateUrl: 'partials/home/home.html',
          controller: 'HomeTabCtrl'
        }
      }
    })
    .state('tabs.phones', {
      url:'/phones',
      views: {
        'list-tab': {
          // templateUrl: 'partials/login/changePassword.html',
          // controller:'changePasswordCtrl'
          templateUrl: 'partials/phonelist/phones.html',
          controller:'phonesCtrl'
        }
      }
    })
    .state('tabs.details', {
      url: '/phones/:phoneId',
      views: {
        'list-tab': {
        templateUrl: 'partials/phonelist/phone-detail.html',
        controller: 'PhoneDetailCtrl'}
      }
    });
    //个人信息管理
   $stateProvider

  // setup an abstract state for the tabs directive
    .state('coach', {
    url: '/coach',
    abstract: true,
    templateUrl: 'partials/individual/coach.html'
  })

  // Each tab has its own nav history stack:
    .state('upload',{
      url:'/upload',
      // views:{
      //   'coach-upload':{
      //     templateUrl:'templates/coach-idupload.html',
      //     controller:'CoachIdUploadCtrl'          
      //   }
      // }
          templateUrl:'partials/individual/coach-idupload.html',
          controller:'CoachIdUploadCtrl'  
    })

  .state('coach.home', {
    url: '/home',
    views: {
      'coach-home': {
        templateUrl: 'partials/individual/coach-home.html',
        controller: 'CoachHomeCtrl'
      }
    }
  })

  .state('personalinfo', {
      url: '/personalinfo',
      // views: {
      //   'coach-personalinfo': {
      //     templateUrl: 'templates/coach-personalinfo.html',
      //     controller: 'CoachPersonalInfoCtrl'
      //   }
      // }
      templateUrl: 'partials/individual/coach-personalinfo.html',
      controller: 'CoachPersonalInfoCtrl'      
    })

    .state('config', {
      url: '/config',
      // views: {
      //   'coach-config': {
      //     templateUrl: 'templates/coach-config.html',
      //     controller: 'CoachPersonalConfigCtrl'
      //   }
      // }
      templateUrl: 'partials/individual/coach-config.html',
      controller: 'CoachPersonalConfigCtrl'
    })

  .state('schedule', {
    url: '/schedule',
    // views: {
    //   'coach-schedule': {
    //     templateUrl: 'templates/coach-schedule.html',
    //     controller: 'CoachPersonalScheduleCtrl'
    //   }
    // }
        templateUrl: 'partials/individual/coach-schedule.html',
        controller: 'CoachScheduleCtrl'    
  })

  .state('coach.patients',{
    url:'/patients',
    views:{
      'coach-patients':{
        templateUrl:'partials/individual/coach-patients.html',
        controller:'myPatientCtrl'
      }
    }

  })

  .state('coach.newpatients',{
    url:'/newpatients',
    views:{
      'coach-newpatients':{
        templateUrl:'partials/individual/coach-newpatients.html',
        controller:'newpatientsCtrl'
      }
    }

  })

  // .state('coach.patientsdetail', {
  //   url: '/patients/:aId',
  //   views: {
  //     'coach-patients' : {
  //       templateUrl: 'partials/individual/coach-patientsdetail.html',
  //       controller: 'CoachPatientsCtrl'
  //     }
  //   }
  // })

  .state('coach.message',{
    url:'/message',
    views:{
      'coach-message':{
        templateUrl:'partials/individual/coach-message.html',
        controller:'CoachMessageCtrl'
      }
    }

  })

  .state('coach.i',{
    url:'/i',
    cache:false,
    views:{
      'coach-me':{
        templateUrl:'partials/individual/coach-home.html',
        controller:'CoachHomeCtrl'
      }
    }

  })

    //新建患者
  $stateProvider
  
  .state('addpatient',{
    url:'/addpatient',
    abstract:true,
    template:'<ion-view/><ion-nav-view/>'
  })

  .state('addpatient.newpatient',{
    url:'/newpatient',
    templateUrl:'partials/addpatient/newpatient.html',
    controller:'newpatientCtrl'
  })

  .state('addpatient.basicinfo',{
    url:'/newbasicinfo',
    templateUrl:'partials/addpatient/basicinfo.html',
    controller:'newbasicinfoCtrl'    
  })  

  .state('addpatient.clinicinfo', {
    url: "/clinicinfo",
    templateUrl: "partials/addpatient/clinicinfo.html",
    controller:'datepickerCtrl',
    cache:true
  })

  .state('addpatient.clinicinfo.examinationinfo', {//点击检查弹出modal页面
    url: "/examinationinfo",
    templateUrl: "partials/addpatient/examinationinfo.html",
        // controller:'examinationinfoCtrl'
  })

  .state('addpatient.clinicinfo.druginfo', {//点击用药弹出modal页面
    url: "/druginfo",
    templateUrl: "partials/addpatient/druginfo.html",
        // controller:'druginfoCtrl'
  })

  .state('addpatient.clinicinfo.DiagnosisInfo', {//点击诊断弹出modal页面
    url: "/DiagnosisInfo",
    templateUrl: "partials/addpatient/DiagnosisInfo.html",
        // controller:'DiagnosisInfoCtrl'
  })

  .state('addpatient.ModuleInfo',{
    url:'/ModuleInfo',
    templateUrl:'partials/addpatient/ModuleInfo.html',
    controller:'ModuleInfoCtrl'
  })

  .state('addpatient.ModuleList',{
    url:'/ModuleInfo/:Module',
    templateUrl:'partials/addpatient/ModuleInfoList.html',
    controller:'ModuleInfoListDetailCtrl'
  })

  .state('addpatient.ModuleListDetail',{
    url:'/ModuleInfo/:Module/:ListName',
    templateUrl:'partials/addpatient/ModuleInfoListDetail.html',
    controller:'ModuleInfoListDetailCtrl'   
  })
  
  .state('addpatient.risk',{
    url:'/risk',
    templateUrl:'partials/addpatient/risk.html',
    controller:'RiskCtrl'
  })

  .state('addpatient.riskdetail',{
    url:'/risk/:num',
    cache: false,
    templateUrl:'partials/addpatient/riskdetail.html',
    controller:'RiskCtrl'
  })

  .state('addpatient.riskquestion',{
    url:'/riskquestion',
    cache: false,
    templateUrl:'partials/addpatient/riskquestion.html',
    controller:'RiskQuestionCtrl'
  })

  .state('addpatient.plan', {
  url: '/:tt',
    templateUrl: function ($stateParams){
      if($stateParams.tt=='create')  //计划第一层 创建计划
      {
        return 'partials/addpatient/plan/create.html';  
      }
       else if(($stateParams.tt=='TA')||($stateParams.tt=='TG')) //计划第三层 体重管理与风险评估
      {
        return 'partials/addpatient/plan/weight.html';  
      }
      else if($stateParams.tt=='TB')  //计划第三层 饮食建议
      {
        return 'partials/addpatient/plan/food.html';  
      }
      else if($stateParams.tt=='TC')  //计划第三层 锻炼
      {
        return 'partials/addpatient/plan/exercise.html';  
      }
      else if($stateParams.tt=='TD')  //计划第三层 健康教育
      {
        return 'partials/addpatient/plan/healthEducation.html';  
      }
      else if($stateParams.tt=='TE')  //计划第三层 药物治疗
      {
        return 'partials/addpatient/plan/drug.html';  
      }  
      else if($stateParams.tt=='TF')  //计划第三层 体征测量
      {
        return 'partials/addpatient/plan/measure.html';  
      }
      else if($stateParams.tt=='TY')  //计划第三层 其他
      {
        return 'partials/addpatient/plan/others.html';  
      }
      else if($stateParams.tt=='TZ')  //计划第三层 个性化制定
      {
        return 'partials/addpatient/plan/personal.html';  
      }
      else if($stateParams.tt=='healthEducationDetail')  //计划第四层 健康教育详细
      {
        return 'partials/addpatient/plan/healthEducationDetail.html';  
      }            
   
      else  //计划第二层
      {
        return 'partials/addpatient/plan/taskList.html'; 
      }      
    },
    controllerProvider: function($stateParams) {
      if($stateParams.tt=='create')
      {
        return 'CreateCtrl';
      }
       else if(($stateParams.tt=='TA')||($stateParams.tt=='TB')||($stateParams.tt=='TC')||($stateParams.tt=='TF')||($stateParams.tt=='TG'))
      {
        return 'MainPlanCtrl';
      }    
      else if($stateParams.tt=='TD')
      {
        return 'healthEducationCtrl';
      }
      else if($stateParams.tt=='TE')
      {
        return 'DrugCtrl';
      }
    
      else if($stateParams.tt=='healthEducationDetail')
      {
        return 'healthEducationDetailCtrl';
      }
      else
      {
        return 'TaskListCtrl';
      }
    }
      
  })
  
   //患者管理
 $stateProvider

  $stateProvider
   .state('manage', {
    url: "/manage",
    abstract: true,
    templateUrl: "partials/managepatient/main.html",
    controller:"mainCtrl"
  })

   .state('manage.chat',{
      url:'/chat',
      views:{
        "chat":{
          templateUrl:'partials/managepatient/chat-detail.html',
          controller:'ChatDetailCtrl'
        }
      }
      
    })

   .state('manage.plan', {
    url: "/plan",
    views: {
      'plan-tab': {
        templateUrl: "partials/managepatient/plan.html",
        controller:'planCtrl'
      }
    }
  })
  .state('manage.clinic', {
    url: "/clinic",
    views: {
      'clinic-tab': {
        templateUrl: "partials/managepatient/clinic.html",
        controller:'datepickerCtrl',
       cache:true
      }
    }
  })
  .state('manage.clinic.examinationinfo', {
    url: "/examinationinfo",
    views: {
      'allmsg': {
        templateUrl: "partials/managepatient/examinationinfo.html",
        // controller:'examinationinfoCtrl'
      }
    }
  })
  .state('manage.clinic.druginfo', {
    url: "/druginfo",
    views: {
      'allmsg': {
        templateUrl: "partials/managepatient/druginfo.html",
        // controller:'druginfoCtrl'
      }
    }
  })
  .state('manage.clinic.DiagnosisInfo', {
    url: "/DiagnosisInfo",
    views: {
      'allmsg': {
        templateUrl: "partials/managepatient/DiagnosisInfo.html",
        // controller:'DiagnosisInfoCtrl'
      }
    }
  })
  .state('manage.ModuleInfo',{
    url:"/ModuleInfo",
    views:{
      'ModuleInfo':{
        templateUrl:"partials/managepatient/ModuleInfo.html",
        controller:"ModuleInfoCtrl"
      }
    }
  })
  .state('manage.ModuleList',{
    url:'/ModuleInfo/:Module',
    views:{
      "ModuleInfo":{
        templateUrl:'partials/managepatient/ModuleInfoList.html',
        controller:'ModuleInfoListDetailCtrl'
      }
    }
    
  })
  .state('manage.ModuleListDetail',{
    url:'/ModuleInfo/:Module/:ListName',
    views:{
      "ModuleInfo":{
        templateUrl:'partials/managepatient/ModuleInfoListDetail.html',
        controller:'ModuleInfoListDetailCtrl'
      }
    }
    
  })
  .state('manage.task', {
  url: '/:tt',
  views:{
    "changeplan":{
      templateUrl: function ($stateParams){
      if($stateParams.tt=='create')  //计划第一层 创建计划
      {
        return 'partials/managepatient/plan/create.html';  
      }
       else if(($stateParams.tt=='TA')||($stateParams.tt=='TG')) //计划第三层 体重管理与风险评估
      {
        return 'partials/managepatient/plan/weight.html';  
      }
      else if($stateParams.tt=='TB')  //计划第三层 饮食建议
      {
        return 'partials/managepatient/plan/food.html';  
      }
      else if($stateParams.tt=='TC')  //计划第三层 锻炼
      {
        return 'partials/managepatient/plan/exercise.html';  
      }
      else if($stateParams.tt=='TD')  //计划第三层 健康教育
      {
        return 'partials/managepatient/plan/healthEducation.html';  
      }
      else if($stateParams.tt=='TE')  //计划第三层 药物治疗
      {
        return 'partials/managepatient/plan/drug.html';  
      }  
      else if($stateParams.tt=='TF')  //计划第三层 体征测量
      {
        return 'partials/managepatient/plan/measure.html';  
      }
      else if($stateParams.tt=='TY')  //计划第三层 其他
      {
        return 'partials/managepatient/plan/others.html';  
      }
      else if($stateParams.tt=='TZ')  //计划第三层 个性化制定
      {
        return 'partials/managepatient/plan/personal.html';  
      }
      else if($stateParams.tt=='healthEducationDetail')  //计划第四层 健康教育详细
      {
        return 'partials/managepatient/plan/healthEducationDetail.html';  
      }            
   
      else  //计划第二层
      {
        return 'partials/managepatient/plan/taskList.html'; 
      }      
      },
      controllerProvider: function($stateParams) {
        if($stateParams.tt=='create')
        {
          return 'CreateCtrl';
        }
         else if(($stateParams.tt=='TA')||($stateParams.tt=='TB')||($stateParams.tt=='TC')||($stateParams.tt=='TF')||($stateParams.tt=='TG'))
        {
          return 'MainPlanCtrl';
        }    
        else if($stateParams.tt=='TD')
        {
          return 'healthEducationCtrl';
        }
        else if($stateParams.tt=='TE')
        {
          return 'DrugCtrl';
        }
      
        else if($stateParams.tt=='healthEducationDetail')
        {
          return 'healthEducationDetailCtrl';
        }
        else
        {
          return 'TaskListCtrl';
        }
      }
    }
  }
    
      
  })
  

  .state('Independent',{
    abstract:true,
    url:"/Independent",
    template:'<ion-nav-view/>'
  })

  .state('Independent.risk',{
    url:'/risk',
    templateUrl:'partials/managepatient/risk.html',
    controller:'RiskCtrl'
  })

  .state('Independent.riskdetail',{
    url:'/risk/:num',
    cache: false,
    templateUrl:'partials/managepatient/riskdetail.html',
    controller:'RiskCtrl'
  })

  .state('Independent.riskquestion',{
    url:'/riskquestion',
    cache: false,
    templateUrl:'partials/managepatient/riskquestion.html',
    controller:'RiskQuestionCtrl'
  })
  .state('Independent.table',{
    url:"/table",
    views: {
      '': {
        templateUrl: "partials/managepatient/table.html",
        controller: 'vitaltableCtrl'
      }
    }
  })
  .state('Independent.table.tablelist',{
    url:"/tablelist",
    views: {
      'tablelist': {
        templateUrl: "partials/managepatient/tablelist.html",
        
      }
    }
  })

   $urlRouterProvider.otherwise('/signin');
   // $urlRouterProvider.otherwise('/starting');

}])

.run(function($state ,$cordovaSplashscreen,$ionicPlatform,Storage) {
  $ionicPlatform.ready(function(){
    var isSignIN=Storage.get("isSignIN");
    if(isSignIN=='YES'){
      $state.go('coach.home');
    }
  })
  /*setTimeout(function() {
    $cordovaSplashscreen.hide()
  }, 1000)*/

  /*$ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    //启动极光推送服务
    window.plugins.jPushPlugin.init();
    window.plugins.jPushPlugin.setDebugMode(true);
    //window.plugins.jPushPlugin.setAlias("SimonTDY");
  });

  window.onerror = function(msg, url, line) {  
   var idx = url.lastIndexOf("/");  
   if(idx > -1) {  
    url = url.substring(idx+1);  
   }  
   alert("ERROR in " + url + " (line #" + line + "): " + msg);  
   return false;  
  };*/
})

// --------不同平台的相关设置----------------
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(5);

  // note that you can also chain configs
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.navBar.positionPrimaryButtons('left');
  $ionicConfigProvider.navBar.positionSecondaryButtons('right');
  $ionicConfigProvider.form.checkbox('circle');
});