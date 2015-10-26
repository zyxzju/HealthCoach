angular.module('appControllers', ['ionic','ionicApp.service', 'ngCordova','ja.qr','ionic-datepicker'])

// 初装或升级App的介绍页面控制器
.controller('intro', ['$scope', 'Storage', function ($scope, Storage) {
  // Storage.set('initState', 'simple.homepage');
  Storage.set('myAppVersion', myAppVersion);
}])

//初始加载页面
.controller('startingCtrl',['$scope', '$state', 'userservice', 'Storage', 'jpushService',function($scope, $state, userservice, Storage, jpushService){ //XJZ
  $scope.startnow = function(){
    if(userservice.isTokenValid()==1){
      $state.go('tabs.home');
      var AutoLogOn = Storage.get();
      window.plugins.jPushPlugin.setAlias();
    }else{
      $state.go('signin');
    }
  }
}])

// --------登录注册、设置修改密码-熊佳臻---------------- 去掉了service里的codeDefine
//登录  41-$state.go('tab.tasks')
.controller('SignInCtrl', ['$scope','$state','$http', '$timeout','$window', 'userservice','Storage' , function($scope, $state,$http, $timeout ,$window, userservice, Storage) {
  if(Storage.get('USERNAME')!=null){
    $scope.logOn={username:Storage.get('USERNAME'),password:""};
  }else{
    $scope.logOn={username:"",password:""};
  }
  $scope.signIn = function(logOn) {
    //$timeout(function(){$state.go('tab.tasks');} , 1000);
    if((logOn.username!="") && (logOn.password!="")){ 
      var saveUID = function(){
        var UIDpromise=userservice.UID('PhoneNo',logOn.username);
        UIDpromise.then(function(data){
          if(data.result!=null){
            Storage.set('UID', data.result);
          }
        },function(data){
        });
      }
                
      var promise=userservice.userLogOn('PhoneNo' ,logOn.username,logOn.password,'HealthCoach');
      if(promise==7){
        $scope.logStatus='手机号验证失败！';
        return;
      }
      promise.then(function(data){
        $scope.logStatus=data.result.substr(0,4);
        if($scope.logStatus=="登陆成功"){
          Storage.set('TOKEN', data.result.substr(12));
          Storage.set('USERNAME', logOn.username);
          saveUID();
          $timeout(function(){$state.go('coach.home');} , 1000);
        }
      },function(data){
        $scope.logStatus=data.data.result;
      });
    }else{
      $scope.logStatus="请输入完整信息！";
    }
  }

  $scope.toRegister = function(){
    $state.go('phonevalid');   
    Storage.set('setPasswordState','register');
  }
  $scope.toReset = function(){
    $state.go('phonevalid');
    Storage.set('setPasswordState','reset');
  } 
}])

//注册  101只传了userName  118-$state.go
.controller('userdetailCtrl',['$scope','$state','$cordovaDatePicker','$rootScope','$timeout' ,'userservice','Storage' ,function($scope,$state,$cordovaDatePicker,$rootScope,$timeout,userservice,Storage){
  $scope.birthday="点击设置";
  var datePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var birthday=yyyy+'/'+mm+'/'+dd;
      $scope.birthday=birthday;
    }
  };

  var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  var weekDaysList=["日","一","二","三","四","五","六"];
  $scope.datepickerObject = {
    titleLabel: '出生日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    inputDate: new Date(),    //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      datePickerCallback(val);
    }
  };  
  $scope.infoSetup = function(userName){

    // var activition = function(){
    //   var UIDpromise=userservice.UID('PhoneNo',$rootScope.userId);
    //   UIDpromise.then(function(data){
    //     var uid=data.result;
    //     if(uid!=null){
    //       userservice.Activition(uid,)
    //     }
    //   },function(data){
    //   });
    // }
    console.log($rootScope.userId, userName, $rootScope.password);
    var promise=userservice.userRegister("PhoneNo",$rootScope.userId, userName, $rootScope.password,"HealthCoach");
    promise.then(function(data){
      $scope.logStatus=data.result;
      if(data.result=="注册成功"){
        $timeout(function(){$state.go('tab.tasks');} , 500);
      }
      //activition();
    },function(data){
      $scope.logStatus=data.data.result;
    });
    //以下临时跳转
    //$timeout(function(){$state.go('tab.tasks');} , 2000);

  }
}])

//设置密码   153-$state.go('tab.tasks')
.controller('setPasswordCtrl', ['$scope','$state','$rootScope' ,'$timeout' , 'userservice','Storage',function($scope,$state,$rootScope,$timeout,userservice,Storage) {
  var setPassState=Storage.get('setPasswordState');
  if(setPassState=='reset'){
    $scope.headerText="重置密码";
    $scope.buttonText="确认修改";
  }else{
    $scope.headerText="设置密码";
    $scope.buttonText="下一步";
  }
  $scope.setPassword={newPass:"" , confirm:""};
  $scope.resetPassword=function(setPassword){
    if((setPassword.newPass!="") && (setPassword.confirm!="")){
      if(setPassword.newPass == setPassword.confirm){
        if(setPassState=='register'){
          $rootScope.password=setPassword.newPass;
          $state.go('userdetail');
        }else{
          var userId=Storage.get('UID');
          var promise=userservice.changePassword('#*bme319*#',setPassword.newPass,userId);
          promise.then(function(data,status){
            $scope.logStatus=data.result;
            if(data.result=='修改密码成功'){
              $timeout(function(){$state.go('tab.tasks');} , 500);
            }
          },function(data){
            $scope.logStatus=data.data.result;
          });
          //以下临时跳转
          //$timeout(function(){$state.go('tab.tasks');} , 3000);
        }
      }else{
        $scope.logStatus="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus="请输入两遍新密码"
    }
  }
}])

//修改密码  192-$state.go('tab.tasks');  $scope.nvGoback李山加的，不明
.controller('changePasswordCtrl',['$scope','$state','$timeout', 'userservice','Storage', '$ionicHistory', function($scope , $state,$timeout, userservice,Storage, $ionicHistory){
  $scope.ishide=true;
  $scope.change={oldPassword:"",newPassword:"",confirmPassword:""};
  $scope.passwordCheck = function(change){
    var promiseold=userservice.userLogOn('PhoneNo',Storage.get('USERNAME'),change.oldPassword,'HealthCoach');
    promiseold.then(function(data){
      $scope.logStatus1='验证成功';
      //$scope.ishide=false;
      $timeout(function(){$scope.ishide=false;} , 500);
    },function(data){
      $scope.logStatus1='密码错误';
    });
  }

  $scope.gotoChange = function(change){
    if((change.newPassword!="") && (change.confirmPassword!="")){
      if(change.newPassword == change.confirmPassword){
        var promiseSet=userservice.changePassword(change.oldPassword,change.newPassword,Storage.get('UID'));
        promiseSet.then(function(data){
          $scope.logStatus2='修改成功';
          $timeout(function(){$scope.change={originalPassword:"",newPassword:"",confirmPassword:""};
          $state.go('tab.tasks');
          $scope.ishide=true;
          } , 500);
        },function(data){
          $scope.logStatus2=data.data.result;
        })
      }else{
        $scope.logStatus2="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus2="请输入两遍新密码"
    }
  }

  $scope.nvGoback = function() {
    $ionicHistory.goBack();
  }
}])

//获取验证码  发送验证码userservice.sendSMS(原来好像是verifySMS)  根据Phone(正则判断)获取UID ——> UID是否存在（注册时应不存在） ——> 是否发送验证码sendSMS() ——> 下一步gotoReset()
.controller('phonevalidCtrl', ['$scope','$state','$interval','$rootScope', 'Storage', 'userservice', function($scope, $state,$interval,$rootScope,Storage,userservice) {
  var setPassState=Storage.get('setPasswordState');
  $scope.veriusername="" 
  $scope.verifyCode="";
  $scope.veritext="获取验证码";
  $scope.isable=false;
  $scope.gotoReset = function(veriusername,verifyCode){
    if(veriusername!=0 && verifyCode!=0){
      $rootScope.userId=veriusername;
      var promise=userservice.checkverification(veriusername,'verification',verifyCode);
      promise.then(function(data){
        if(data.result==1){
          $scope.logStatus='验证成功';
          $state.go('setpassword');
        }
      },function(data){
        $scope.logStatus=data.statusText;
    });
    }else{
      $scope.logStatus="请输入完整信息！"
    }
  }
  
  
  $scope.getcode=function(veriusername){
    var operation=Storage.get('setPasswordState');
    var sendSMS = function(){  
      var promiseSMS=userservice.sendSMS(veriusername,'verification');
      promiseSMS.then(function(data){
          $scope.logStatus='您的验证码已发送';
      },function(data){
        $scope.logStatus=data.statusText;
      }) 
    }; 
    // if(Storage.get('setPasswordState')!='register'){
    var promise=userservice.UID('PhoneNo',veriusername);
    if(promise==7){
      $scope.logStatus='手机号验证失败！';
      return;
    }
    promise.then(function(data){
      if(data.result!=null){
        if(operation=='reset'){
          Storage.set('UID',data.result);
          sendSMS();//发送验证码
        }else{
          $scope.logStatus='该账户已进行过注册！';
        }
      }else{
        if(operation=='reset'){
          Storage.set('UID','');
          $scope.logStatus="用户不存在";
        }else{
          sendSMS();
        }
      }
    },function(data){
      $scope.logStatus=data.statusText;
    })

    //验证码BUTTON效果
    $scope.isable=true;
    $scope.veritext="180S再次发送"; 
    var time = 179;
    var timer;
    timer = $interval(function(){
      if(time==0){
        $interval.cancel(timer);
        timer=undefined;        
        $scope.veritext="获取验证码";       
        $scope.isable=false;
      }else{
        $scope.veritext=time+"S再次发送";
        time--;
      }
    },1000);
  }
}])

.controller('phonesCtrl', ['$scope', '$state', '$http' ,function($scope, $state, $http){ //XJZ
  var url1='http://angular.github.io/angular-phonecat/step-7/app/';
    $http.get('http://angular.github.io/angular-phonecat/step-7/app/phones/phones.json').success(function(data) {
      
    for(var i in data){
      data[i].imageUrl=url1 + data[i].imageUrl;
    }
    $scope.phones = data;
  })
}])

.controller('PhoneDetailCtrl', ['$scope', '$stateParams',
  function($scope, $stateParams) {
    $scope.phoneId = $stateParams.phoneId;
 }])

.controller('CoachIdUploadCtrl', ['$scope','$state','$ionicPopover','$stateParams','Storage','Patients','Camera','Users',
  function($scope,$state,$ionicPopover,$stateParams,Storage,Patients,Camera,Users) { //LRZ

  $scope.DtInfo = [
  { t:"单位",
    v: "某三本大学"
  }, 
  { t:"职务",
    v: "搬砖"
  }, 
  { t:"Level",
    v: "233"
  }, 
  { t:"科室",
    v: "217"
  }
  ];

  $scope.Info = {
    name: "叶良辰",
    gender: "男",
    birthday:"19980808",
    id: 1212
  }

  $scope.state = "未提交";
  
  $scope.imgURI = "img/Barot_Bellingham_tn.jpg"
  //the user skip this step put state to unuploaded.
  $scope.onClickSkip = function(){     
      $scope.state = "未提交";
      Storage.set(13,$scope.state);
      $state.go('coach.i',{'state': $scope.state,'info':null},"replace");
  };

  //the user submit
  $scope.onClickSubmit = function(){
      
      $scope.state = "审核中";
      //用户的信息封装进完整的一个对象里面 存localstorage 全局调用 JSON化 反 JSON 化

      var DtInfo2 = {
        unitname: $scope.DtInfo[0].v,
        jobTitle: $scope.DtInfo[1].v,
        level: $scope.DtInfo[2].v,
        dept: $scope.DtInfo[3].v
      };

      // console.log($scope.Info);
      // console.log(DtInfo2);

      var userInfo = {
        BasicInfo : $scope.Info,
        DtInfo : DtInfo2
      }
      var objStr=JSON.stringify(userInfo);
      // console.log(userInfo);

      Storage.set("userInfo",objStr);
      Storage.set(13,$scope.state);
      // Storage.set(13000);
      // Storage.set(131,$scope.DtInfo[0].v);
      // Storage.set(132,$scope.DtInfo[1].v);
      // Storage.set(133,$scope.DtInfo[2].v);
      // Storage.set(134,$scope.DtInfo[3].v);
      Storage.set(14,$scope.imgURI);
      // for(i=0;i<temp.length;i++)console.log(temp[i].v);
      // $state.go('coach.home',{'state': $scope.state, 'info' :  infoObject.name},"replace");
      $scope.upload();
      $state.go('coach.i',{},"replace");
  };

  //upload
  $scope.upload = function(){

    var DoctorInfo = {
      UserId: "ZXF",
      UserName: "ZXF",
      Birthday: 19930418,
      Gender: 1,
      IDNo: "ZXF",
      InvalidFlag: 0,
      piUserId: "ZXF",
      piTerminalName: "ZXFZXF",
      piTerminalIP: "ZXF",
      piDeviceType: 0
  };

    var responce = Users.myTrial(DoctorInfo);
    
    var temp = Users.myTrial2("ZXF");

    var temp2 = Camera.uploadPicture($scope.imgURI);
    // var temp2 = Camera.uploadPicture2($scope.imgURI);
    console.log("返回的数据" + temp2 );
  };
    //-----------------------------------------------------------

  $scope.onClickCamera = function($event){
    $scope.openPopover($event);
  };
  
   $scope.onClickCameraCancel = function(){
    $scope.closePopover();
  };


  $scope.onClickCameraPhotos = function(){
  
   console.log("选个照片"); 
   $scope.choosePhotos();
   $scope.closePopover();
  };

  $scope.onClickCameraCamera = function(){
    // console.log("要拍照了！");
    // Camera.getPicture().then(function(imageURI){
    //   console.log(imageURI);
    // },function(err){
    //   console.log(err);
    // });
    $scope.closePopover();
  };
  
  $scope.getPhoto = function() {
    console.log("要拍照了！");
    $scope.takePicture();
    $scope.closePopover();
  };

  $scope.takePicture = function() {
   Camera.getPicture().then(function(data) {
      // console.log(data);
      $scope.imgURI = data;
    }, function(err) {
      // console.err(err);
      $scope.imgURI = undefined;
    });
    // console.log($scope.imgURI);
  };
  
  $scope.choosePhotos = function() {
   Camera.getPictureFromPhotos().then(function(data) {
      // console.log(data);
      $scope.imgURI = data;
    }, function(err) {
      // console.err(err);
      $scope.imgURI = undefined;
    });
    // conso
  }
    // ionicPopover functions
    //-----------------------------------------------------------------
    // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('my-popover.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  // ionicPopover functions
  //------------------------------------------------------------

  //the user did not fill in all the necessary info put state to unuploaded.

  //being checked

  //the user skip this step put state to unuploaded.

}])



// Coach HomePage/Me Controller
// ----------------------------------------------------------------------------------------
.controller('CoachHomeCtrl', 
  ['$scope','$state','$stateParams','Storage',
  function($scope,$state,$stateParams,Storage) { //LRZ
   
   // console.log($stateParams.info);
   // console.log($stateParams.info.intro);
   // $scope.items = $stateParams.info;
   // $scope.state = $stateParams.state;

   
   $scope.state = Storage.get(13);
   // $scope.name = Storage.get(131);
   // $scope.company = Storage.get(132);
   // $scope.position = Storage.get(133);
   // $scope.selfintro = Storage.get(134);
   $scope.imgURI = Storage.get(14);
   // console.log($scope.infom);


   $scope.userInfo = JSON.parse(Storage.get("userInfo"));
   // console.log($scope.userInfo);
   // console.log($scope.userInfo.BasicInfo.name);
  $scope.onClickPersonalInfo = function(){
      $state.go('personalinfo');
  };

  $scope.onClickPersonalConfig = function(){
      $state.go('config');
  };

  $scope.onClickPersonalSchedule = function(){
      $state.go('schedule');
  };

}])

//this controller is discarded me and home use CoachHomeController together
.controller('CoachMeCtrl', 
  ['$scope','$state','$stateParams','Storage',
  function($scope,$state,$stateParams,Storage) { //LRZ
   
   // console.log($stateParams.info);
   // console.log($stateParams.info.intro);
   // $scope.items = $stateParams.info;
   // $scope.state = $stateParams.state;

   
   $scope.state = Storage.get(13);
   $scope.name = Storage.get(131);
   $scope.company = Storage.get(132);
   $scope.position = Storage.get(133);
   $scope.selfintro = Storage.get(134);
   $scope.imgURI = Storage.get(14);
   // console.log($scope.infom);
   
  $scope.onClickPersonalInfo = function(){
      $state.go('personalinfo');
  };

  $scope.onClickPersonalConfig = function(){
      $state.go('config');
  };

  $scope.onClickPersonalSchedule = function(){
      $state.go('schedule');
  };

}])



// Coach Personal Config Controller
// ----------------------------------------------------------------------------------------
.controller('CoachPersonalConfigCtrl', ['$scope','$state','$ionicHistory',function($scope,$state,$ionicHistory) { //LRZ
  $scope.onClickBackward = function(){
      $ionicHistory.goBack();
  };
}])



// Coach Personal Infomation Controller
// ----------------------------------------------------------------------------------------
.controller('CoachPersonalInfoCtrl', ['$scope','$state','$ionicHistory','Storage',
  function($scope,$state,$ionicHistory,Storage) { //LRZ
   //获得信息
   // $scope.state = Storage.get(13);
   // $scope.name = Storage.get(131);
   // $scope.company = Storage.get(132);
   // $scope.position = Storage.get(133);
   // $scope.selfintro = Storage.get(134);
   $scope.imgURI = Storage.get(14);
   $scope.userInfo = JSON.parse(Storage.get("userInfo"));

  $scope.onClickBackward = function(){
       $ionicHistory.goBack();
  };

}])


// Coach Personal Schedule Controller
// ----------------------------------------------------------------------------------------
.controller('CoachScheduleCtrl', ['$scope','$state','$ionicHistory','$http',
  function($scope,$state,$ionicHistory,$http) { //LRZ

  $http.get('js/data.json').success(function(data) {
    $scope.calendar = data.calendar; 
    // $scope.whichartist= $state.params.aId;
    // console.log($scope.whichartist);
    $scope.data = { showDelete: false, showReorder: false };

  $scope.onItemDelete = function(dayIndex,item) {
    // $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item), 1);
    $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item), 1);
  }

  $scope.toggleStar = function(item) {
   item.star = !item.star;
  }

  $scope.onClickBackward = function(){
     $ionicHistory.goBack();
  }

  $scope.doRefresh =function() {

      $http.get('js/data.json').success(function(data) {
      $scope.patients = data.calendar;
      $scope.$broadcast('scroll.refreshComplete');

    });
  }
  });

}])

.controller('CoachMessageCtrl',function(){ //LRZ

})


.controller('CoachPatientsCtrl', ['Patients','$scope','$http','$state',
  function(Patients,$scope,$http,$state){ //LRZ
  // $scope.chats = Chats.all(); 
  // $scope.remove = function(chat) {
  //   Chats.remove(chat);
  // };
  // $scope.patients = Patients.all();
  $http.get('js/data.json').success(function(data) {
    $scope.patients = data.artists; 
    $scope.whichartist= $state.params.aId;
    // console.log($scope.whichartist);
    $scope.data = { showDelete: false, showReorder: false };

    $scope.moveItem = function(item, fromIndex, toIndex) {
          $scope.patients.splice(fromIndex, 1);
          $scope.patients.splice(toIndex, 0, item);
    }

    $scope.onItemDelete = function(item) {
      $scope.patients.splice($scope.patients.indexOf(item), 1);
    }

    $scope.toggleStar = function(item) {
     item.star = !item.star;
    }

    $scope.doRefresh =function() {
        $http.get('js/data.json').success(function(data) {
        $scope.patients = data.artists;
        $scope.$broadcast('scroll.refreshComplete'); 
      });
    }
  });


}])

// .controller('CoachPatientsDetailController',function(){

// })

// Coach Identification Controller
// ----------------------------------------------------------------------------------------
.controller('ChatsCtrl', function($scope, Chats) { //LRZ
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) { //LRZ
  $scope.chat = Chats.get($stateParams.chatId);
})


.controller('AccountCtrl', function($scope) { //LRZ
  $scope.settings = {
    enableFriends: true
  };

  
  // $scope.
});

