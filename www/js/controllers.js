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


//-----------------------------------lrz
//-----------------------------------认证页面的controller state:
    // .state('upload',{
    //   url:'/upload',
    //       templateUrl:'partials/individual/coach-idupload.html',
    //       controller:'CoachIdUploadCtrl'  
 
.controller('CoachIdUploadCtrl', ['$scope','$state','$ionicPopover','$stateParams','Storage','Patients','Camera','Users','$ionicActionSheet','$timeout',
  function($scope,$state,$ionicPopover,$stateParams,Storage,Patients,Camera,Users,$ionicActionSheet,$timeout) { //LRZ

  // $scope.DtInfo = [
  // { t:"单位",
  //   v: "某三本大学"
  // }, 
  // { t:"职务",
  //   v: "搬砖"
  // }, 
  // { t:"Level",
  //   v: "233"
  // }, 
  // { t:"科室",
  //   v: "217"
  // }
  // ];
  //填表的预设数据 和需要填写的项目 是否封装进SERVICE config 里面?
  $scope.DtInfo = [
  { t:"单位",
    c: ["普通医院","浙医一院","海军总医院"],
    v: ""
  },   
  { t: "科室",
    c: ["神经科","肛肠科","泌尿科","整形科"],
    v: ""
  },
  { t: "职务",
    c: ["行政","临床","基础"],
    v: ""
  }, 
  { t: "等级",
    c: ["医士","住院医师","主治医师","副主任医师","主任医师"],
    v: ""
  }

  ];
  //填表的预设数据 和需要填写的项目
  $scope.Info = {
    name: "叶良辰",
    gender: "男",
    birthday:"19980808",
    id: 1212
  }
  //填表的预设数据 和需要填写的项目
  $scope.state = "未提交";
  //填表的预设数据 和需要填写的项目
  // $scope.imgURI = "img/Barot_Bellingham_tn.jpg";
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
    // console.log("返回的数据" + temp2 );
  };
    //-----------------------------------------------------------

  $scope.onClickCamera = function(){
    // $scope.openPopover($event);
   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '选择照相机' },
       { text: '选择相册' }
     ],
     // destructiveText: 'Delete',
     titleText: '上传认证照片',
     cancelText: '取消',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {
      switch(index){
        case 0 :  $scope.takePicture(); break;
        case 1 :  $scope.choosePhotos();
      }
       return true;
     }
   });

   // For example's sake, hide the sheet after two seconds
   $timeout(function() {
     hideSheet();
   }, 2000);
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



// Coach HomePage/Me Controller 主页的controller 主要负责从home状态跳转到 其他三个状态/读取localstorage的数据
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
// .controller('CoachMeCtrl', 
//   ['$scope','$state','$stateParams','Storage',
//   function($scope,$state,$stateParams,Storage) { //LRZ
   
//    // console.log($stateParams.info);
//    // console.log($stateParams.info.intro);
//    // $scope.items = $stateParams.info;
//    // $scope.state = $stateParams.state;

   
//    $scope.state = Storage.get(13);
//    $scope.name = Storage.get(131);
//    $scope.company = Storage.get(132);
//    $scope.position = Storage.get(133);
//    $scope.selfintro = Storage.get(134);
//    $scope.imgURI = Storage.get(14);
//    // console.log($scope.infom);
   
//   $scope.onClickPersonalInfo = function(){
//       $state.go('personalinfo');
//   };

//   $scope.onClickPersonalConfig = function(){
//       $state.go('config');
//   };

//   $scope.onClickPersonalSchedule = function(){
//       $state.go('schedule');
//   };

// }])



// Coach Personal Config Controller 个人设置页面的controller  还没啥用
// ----------------------------------------------------------------------------------------
.controller('CoachPersonalConfigCtrl', ['$scope','$state','$ionicHistory',function($scope,$state,$ionicHistory) { //LRZ
  $scope.onClickBackward = function(){
      $ionicHistory.goBack();
  };
}])



// Coach Personal Infomation Controller 个人信息页面的controller  主要负责 修改数据  上传从localstorage读取个人信息 
// ----------------------------------------------------------------------------------------
.controller('CoachPersonalInfoCtrl', ['$scope','$state','$ionicHistory','Storage','PageFunc','Users',
  function($scope,$state,$ionicHistory,Storage,PageFunc,Users) {
   //获得信息
   // $scope.state = Storage.get(13);
   // $scope.name = Storage.get(131);
   // $scope.company = Storage.get(132);
   // $scope.position = Storage.get(133);
   // $scope.selfintro = Storage.get(134);
   $scope.imgURI = Storage.get(14);
   $scope.userInfo = JSON.parse(Storage.get("userInfo"));
   $scope.isEdited = false; // IS EDITED FLAG?
   // $scope.flags = {isEdited: false, editedValue : undefined};
  $scope.onClickBackward = function(){
    if($scope.isEdited == true)
      PageFunc.confirm("是否放弃修改","确认").then( 
        function(res){
          if(res){
           // console.log("点了queren");
          $state.go('coach.home');
          }
        });    
  };

  $scope.onClickSave = function(){
    if($scope.isEdited == true)
    PageFunc.confirm("是否上传新信息","确认").then( 
        function(res){
          if(res){
              // console.log("点了queren");
            console.log($scope.userInfo);
            Storage.set("userInfo",$scope.userInfo);
            // 上传的接口
            // Users.postDoctorInfo(userInfo.BasicInfo);
            // Users.postDoctorDetailInfo(userInfo.DtInfo);
          }
        });    
  };

  $scope.onClickEdit = function(t1,_t2,_t3,_t4){
    PageFunc.edit(t1,"修改").then(function(res){
      if(res){
        // console.log(res);
        $scope.isEdited = true;
        // $scope.flags.editedValue = res;
        // console.log($scope.userInfo);
        // console.log($scope.flags.isEdited);
        // console.log($scope.flags.editedValue);
        $scope[_t2][_t3][_t4] = res;
        // return res;
      }
      else{
      }
    });
  }

}])

// Coach Personal Schedule Controller 个人日程页面 主要负责 
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
// Coach Personal Schedule Controller 个人信息 主要负责 
// ----------------------------------------------------------------------------------------
.controller('CoachMessageCtrl',function(){ //LRZ

})

// Coach Personal Schedule Controller 病人管理 主要负责 
// ----------------------------------------------------------------------------------------
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
.controller('RiskCtrl',['$state','$scope','Patients','$state','$ionicSlideBoxDelegate','$ionicHistory','Storage',
  function($state,$scope,Patients,$state,$ionicSlideBoxDelegate,$ionicHistory,Storage){
  
    console.log("doing refreshing");
    $scope.userid = Storage.get('UID');
    // $scope.userid = "PID201506170002";
    Patients.getEvalutionResults($scope.userid).then(function(data){
    $scope.risks = data;
    // $scope.maxsortno = 243;
    $scope.whichone = $state.params.num;
    for (var i = $scope.risks.length - 1; i >= 0; i--) {
      // var temp = 

      switch ($scope.risks[i].AssessmentType){
        case 'M1' : $scope.risks[i].AssessmentName = "高血压模块";       
                    var temp = $scope.risks[i].Result.split("||",8);
                    //分割字符串 获得血压数据 SBP||DBP||5 factors
                    $scope.risks[i].Result = temp[0];
                    $scope.risks[i].SBP = temp[1];
                    $scope.risks[i].DBP = temp[2];
                    $scope.risks[i].f1 = temp[3];
                    $scope.risks[i].f2 = temp[4];
                    $scope.risks[i].f3 = temp[5];
                    $scope.risks[i].f4 = temp[6];
                    $scope.risks[i].f5 = temp[7];
                    break;
        case 'M2' : $scope.risks[i].AssessmentName = "糖尿病模块";
                    //分割字符串 获得血糖数据 我也不知道有什么数据 8个
                    var temp = $scope.risks[i].Result.split("||",3);
                    $scope.risks[i].Result = temp[0];
                    $scope.risks[i].Period = temp[1];
                    $scope.risks[i].Glucose = temp[2];                    
      } 
    };

    //整合对象
    $scope.newRisks = [];
    for (var i = 0; i <= $scope.risks.length - 1; i++) {
        if(i == 0) {
          switch($scope.risks[i].AssessmentType){
              case 'M1' : var temp = {num: $scope.risks[i].SortNo, M1:$scope.risks[i],M2:undefined};break;
              case 'M2' : var temp = {num: $scope.risks[i].SortNo, M2:$scope.risks[i],M3:undefined};
          }
          $scope.newRisks.push(temp);
        }
        else{
          if($scope.risks[i].SortNo == $scope.newRisks[$scope.newRisks.length-1].num){
              switch($scope.risks[i].AssessmentType){
                case 'M1' : $scope.newRisks[$scope.newRisks.length-1].M1 = $scope.risks[i];break;
                case 'M2' : $scope.newRisks[$scope.newRisks.length-1].M2 = $scope.risks[i];
              }
          }
          else{
              switch($scope.risks[i].AssessmentType){
                case 'M1' : var temp = {num: $scope.risks[i].SortNo, M1:$scope.risks[i]};break;
                case 'M2' : var temp = {num: $scope.risks[i].SortNo, M2:$scope.risks[i]};
              }
              $scope.newRisks.push(temp);            
          }
        }        
    };
    // console.log($scope.newRisks);
      for (var i = $scope.newRisks.length - 1; i >= 0; i--) {
        if($scope.newRisks[i].num == $scope.whichone) {
          $scope.index = i;
          console.log($scope.newRisks[$scope.index]);
          break;
        }
      };

     
    console.log($scope.newRisks[$scope.index]);  
        // console.log("又画图了");
        $scope.data1 =  {
          "type": "serial",
          "theme": "light",
            "dataProvider": [{
                "type": "收缩压",
                "state1": 40+80,
                "state2": 20,
                "state3": 20,
                "state4": 20,
                "state5": 20,
                "now": ($scope.newRisks[$scope.index].M1 == undefined ? 0:$scope.newRisks[$scope.index].M1.SBP), //params
                "target": 120               //params

            }, {
                "type": "舒张压",
                "state1": 20+80,
                "state2": 20,
                "state3": 20,
                "state4": 20,
                "state5": 20,
                "now":  ($scope.newRisks[$scope.index].M1 == undefined ? 0:$scope.newRisks[$scope.index].M1.DBP),         //params
                "target": 100             //params
            }],
            "valueAxes": [{
                "stackType": "regular",
                "axisAlpha": 0.3,
                "gridAlpha": 0,
                 "minimum" :80
            }],
            "startDuration": 0.1,
            "graphs": [{
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b><120 mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "很安全",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state1"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>120-140mmHg</b></span>",
                "fillAlphas": 0.8,
               // "labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "正常",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state2"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>140-160mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "良好",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state3"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>160-180mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "很危险",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state4"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>>180mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "极度危险",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state5"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0,
                "columnWidth": 0.5,
                "lineThickness": 5,
                "labelText": "[[value]]"+" 目前",
                "clustered": false,
                "lineAlpha": 0.3,
                "stackable": false,
                "columnWidth": 0.618,
                "noStepRisers": true,
                "title": "目前",
                "type": "step",
                "color": "#cc4488",
                "valueField": "now"      
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0,
                "columnWidth": 0.5,
                "lineThickness": 0,
                "columnWidth": 0.618,
                // "labelText": "[[value]]"+"目标",
                "clustered": false,
                "lineAlpha": 0.3,
                "stackable": false,
                "noStepRisers": true,
                "title": "目标",
                "type": "step",
                "color": "#00FFCC",
                "valueField": "target"      
            }],
            "categoryField": "type",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 80,
                "gridAlpha": 0,
                "position": "left"
            },
            "export": {
              "enabled": true
             }
        };
         $scope.data2 = {
            "type": "serial",
            "theme": "light",
            
            "autoMargins": true,
            "marginTop": 30,
            "marginLeft": 80,
            "marginBottom": 30,
            "marginRight": 50,
            "dataProvider": [{
                "category": "血糖浓度  (mmol/L)",
                "excelent": 4.6,
                "good": 6.1-4.6,
                "average": 7.2-6.1,
                "poor": 8.8-7.2,
                "bad": 1,
                "bullet": ($scope.newRisks[$scope.index].M2 == undefined ? 3:$scope.newRisks[$scope.index].M2.Glucose)
            }],
            "valueAxes": [{
                "maximum": 10,
                "stackType": "regular",
                "gridAlpha": 0,
                "offset":10,
                "minimum" :3

            }],
            "startDuration": 0.13,
            "graphs": [ {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b><4.6 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#19d228",
                "showBalloon": true,
                "type": "column",
                "valueField": "excelent"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>4.6 -6.1 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#b4dd1e",
                "showBalloon": true,
                "type": "column",
                "valueField": "good"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>6.1-7.2 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#f4fb16",
                "showBalloon": true,
                "type": "column",
                "valueField": "average"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>7.2-8.8 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#f6d32b",
                "showBalloon": true,
                "type": "column",
                "valueField": "poor"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>8.8-9 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#fb7116",
                "showBalloon": true,
                "type": "column",
                "valueField": "bad"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>>9 mmol/L</b></span>",
                "clustered": false,
                "columnWidth": 0.5,
                "noStepRisers": true,
                "lineThickness": 3,
                "fillAlphas": 0,
                "labelText": "[[value]]"+" 目前",
                "lineColor": "#0080FF", 
                "stackable": false,
                "showBalloon": true,
                "type": "step",
                "valueField": "bullet"
            }],
            "rotate": false,
            "columnWidth": 1,
            "categoryField": "category",
            "categoryAxis": {
                "gridAlpha": 0,
                "position": "left",
               
            }
        };
        $scope.chart = AmCharts.makeChart("chartdiv",$scope.data1);
        $scope.chart2 = AmCharts.makeChart("chartdiv2",$scope.data2);
        
        // console.log("又画图了");

        $scope.data = { showDelete: false, showReorder: false };
        $scope.dbtshow = false;
    });
    



 
  // });


  

  $scope.doRefresh = function(){
    console.log("doing refreshing");
    // $scope.userid = Storage.get('UID');
  // $scope.userid = "PID201506170002";
    $scope.userid = Storage.get('UID');
    Patients.getEvalutionResults($scope.userid).then(function(data){
    $scope.risks = data;
    $scope.maxsortno = 243;
    for (var i = $scope.risks.length - 1; i >= 0; i--) {
      // var temp = 

      switch ($scope.risks[i].AssessmentType){
        case 'M1' : $scope.risks[i].AssessmentName = "高血压模块";       
                    var temp = $scope.risks[i].Result.split("||",8);
                    //分割字符串 获得血压数据 SBP||DBP||5 factors
                    $scope.risks[i].Result = temp[0];
                    $scope.risks[i].SBP = temp[1];
                    $scope.risks[i].DBP = temp[2];
                    $scope.risks[i].f1 = temp[3];
                    $scope.risks[i].f2 = temp[4];
                    $scope.risks[i].f3 = temp[5];
                    $scope.risks[i].f4 = temp[6];
                    $scope.risks[i].f5 = temp[7];
        case 'M2' : $scope.risks[i].AssessmentName = "糖尿病模块";
                    var temp = $scope.risks[i].Result.split("||",3);
                    $scope.risks[i].Result = temp[0];
                    $scope.risks[i].Period = temp[1];
                    $scope.risks[i].Glucose = temp[2];
                    //分割字符串 获得血糖数据 我也不知道有什么数据 8个
      } 
    };

    //整合对象
    $scope.newRisks = [];
    for (var i = 0; i <= $scope.risks.length - 1; i++) {
        if(i == 0) {
          switch($scope.risks[i].AssessmentType){
              case 'M1' : var temp = {num: $scope.risks[i].SortNo, M1:$scope.risks[i],M2:undefined};break;
              case 'M2' : var temp = {num: $scope.risks[i].SortNo, M2:$scope.risks[i],M3:undefined};
          }
          $scope.newRisks.push(temp);
        }
        else{
          if($scope.risks[i].SortNo == $scope.newRisks[$scope.newRisks.length-1].num){
              switch($scope.risks[i].AssessmentType){
                case 'M1' : $scope.newRisks[$scope.newRisks.length-1].M1 = $scope.risks[i];break;
                case 'M2' : $scope.newRisks[$scope.newRisks.length-1].M2 = $scope.risks[i];
              }
          }
          else{
              switch($scope.risks[i].AssessmentType){
                case 'M1' : var temp = {num: $scope.risks[i].SortNo, M1:$scope.risks[i]};break;
                case 'M2' : var temp = {num: $scope.risks[i].SortNo, M2:$scope.risks[i]};
              }
              $scope.newRisks.push(temp);            
          }
        }        
    };
    console.log($scope.newRisks);
    });
    // console.log("in controller");
    // console.log($scope.risks);
        $scope.data1 =  {
          "type": "serial",
          "theme": "light",
            "dataProvider": [{
                "type": "收缩压",
                "state1": 40+80,
                "state2": 20,
                "state3": 20,
                "state4": 20,
                "state5": 20,
                "now": ($scope.newRisks[$scope.index].M1 == undefined ? 0:$scope.newRisks[$scope.index].M1.SBP), //params
                "target": 120               //params

            }, {
                "type": "舒张压",
                "state1": 20+80,
                "state2": 20,
                "state3": 20,
                "state4": 20,
                "state5": 20,
                "now":  ($scope.newRisks[$scope.index].M1 == undefined ? 0:$scope.newRisks[$scope.index].M1.DBP),         //params
                "target": 100             //params
            }],
            "valueAxes": [{
                "stackType": "regular",
                "axisAlpha": 0.3,
                "gridAlpha": 0,
                 "minimum" :80
            }],
            "startDuration": 0.1,
            "graphs": [{
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b><120 mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "很安全",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state1"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>120-140mmHg</b></span>",
                "fillAlphas": 0.8,
               // "labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "正常",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state2"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>140-160mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "良好",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state3"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>160-180mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "很危险",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state4"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>>180mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "极度危险",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state5"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0,
                "columnWidth": 0.5,
                "lineThickness": 5,
                "labelText": "[[value]]"+" 目前",
                "clustered": false,
                "lineAlpha": 0.3,
                "stackable": false,
                "columnWidth": 0.618,
                "noStepRisers": true,
                "title": "目前",
                "type": "step",
                "color": "#cc4488",
                "valueField": "now"      
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0,
                "columnWidth": 0.5,
                "lineThickness": 0,
                "columnWidth": 0.618,
                // "labelText": "[[value]]"+"目标",
                "clustered": false,
                "lineAlpha": 0.3,
                "stackable": false,
                "noStepRisers": true,
                "title": "目标",
                "type": "step",
                "color": "#00FFCC",
                "valueField": "target"      
            }],
            "categoryField": "type",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 80,
                "gridAlpha": 0,
                "position": "left"
            },
            "export": {
              "enabled": true
             }
        };
         $scope.data2 = {
            "type": "serial",
            "theme": "light",
            
            "autoMargins": true,
            "marginTop": 30,
            "marginLeft": 80,
            "marginBottom": 30,
            "marginRight": 50,
            "dataProvider": [{
                "category": "血糖浓度  (mmol/L)",
                "excelent": 4.6,
                "good": 6.1-4.6,
                "average": 7.2-6.1,
                "poor": 8.8-7.2,
                "bad": 1,
                "bullet": ($scope.newRisks[$scope.index].M2 == undefined ? 3:$scope.newRisks[$scope.index].M2.Glucose)
            }],
            "valueAxes": [{
                "maximum": 10,
                "stackType": "regular",
                "gridAlpha": 0,
                "offset":10,
                "minimum" :3

            }],
            "startDuration": 0.13,
            "graphs": [ {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b><4.6 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#19d228",
                "showBalloon": true,
                "type": "column",
                "valueField": "excelent"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>4.6 -6.1 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#b4dd1e",
                "showBalloon": true,
                "type": "column",
                "valueField": "good"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>6.1-7.2 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#f4fb16",
                "showBalloon": true,
                "type": "column",
                "valueField": "average"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>7.2-8.8 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#f6d32b",
                "showBalloon": true,
                "type": "column",
                "valueField": "poor"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>8.8-9 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#fb7116",
                "showBalloon": true,
                "type": "column",
                "valueField": "bad"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>>9 mmol/L</b></span>",
                "clustered": false,
                "columnWidth": 0.5,
                "noStepRisers": true,
                "lineThickness": 3,
                "fillAlphas": 0,
                "labelText": "[[value]]"+" 目前",
                "lineColor": "#0080FF", 
                "stackable": false,
                "showBalloon": true,
                "type": "step",
                "valueField": "bullet"
            }],
            "rotate": false,
            "columnWidth": 1,
            "categoryField": "category",
            "categoryAxis": {
                "gridAlpha": 0,
                "position": "left",
               
            }
        };
        $scope.chart = AmCharts.makeChart("chartdiv",$scope.data1);
        $scope.chart2 = AmCharts.makeChart("chartdiv2",$scope.data2);
    $scope.data = { showDelete: false, showReorder: false };
    $scope.dbtshow = false;
    $scope.$broadcast('scroll.refreshComplete'); 
  }

  
  $scope.onClickEvaluation = function(){
      //open a new page to collect patient info  
      $state.go("riskquestion");
      // ger question
      // Patients.getEvalutionInput($scope.userid).then(function(data){
      //     $scope.questions = data;
      //     // console.log($scope.questions);
      //     $scope.questions.SBP = 150;
      //     $scope.questions.DBP = 134;

      // });
      // get risk result

      // get another result
  }

  // $scope.onClickSave = function(){
  //   //upload 
  //   Patients.getMaxSortNo($scope.userid).then(function(data){
  //     var maxsortno = data.result; 
  //     // console.log("赫赫");
  //     console.log(maxsortno);
  //   })
  //   // console.log($scope.userid);
  //   //get sbp description 
  //     // var date = new Date();
  //     // console.log(date);
  //   Patients.getSBPDescription(190).then(function(data){
  //       console.log(data);

  //       var t = data.result + "||190||120";
  //       // console.log(t);
  //       var time2 = new Date();
  //       var temp = {
  //         "UserId": $scope.userid,
  //         "SortNo": 233,
  //         "AssessmentType": "M1",
  //         "AssessmentName": "高血压",
  //         "AssessmentTime": "2015-10-29T15:02:34.1988359+08:00",
  //         "Result": t ,
  //         "revUserId": "sample string 7",
  //         "TerminalName": "sample string 8",
  //         "TerminalIP": "sample string 9",
  //         "DeviceType": 10
  //       }
  //     // Patients.postTreatmentIndicators(temp);
  //     var temp =  {
  //       "UserId": $scope.userid,
  //       "SortNo": 233,
  //       "AssessmentType": "M2",
  //       "AssessmentName": "糖尿病",
  //       "AssessmentTime": "2015-10-29T15:01:36.2198371+08:00",
  //       "Result": " 糖尿病不严重。||100||160",
  //       "revUserId": "sample string 7",
  //       "TerminalName": "sample string 8",
  //       "TerminalIP": "sample string 9",
  //       "DeviceType": 10
  //     };
  //     // Patients.postTreatmentIndicators(temp);
  //     //POST RESULT
  //     // console.log($scope.description);
  //     //
      
      
  //   });
  //   // console.log($scope.description);
  //   $state.go('risk');
  //   // console.log($scope.description);
  //   // Patients.
  //   //
  // }

  $scope.slideHasChanged = function (_index){
    // console.log(_index);
    // $ionicSlideBoxDelegate.currentIndex();
    if(_index == 1) $scope.dbtshow = true;
    else $scope.dbtshow = false;
    // console.log($scope.description);
  }

  $scope.onClickBackward = function(){
      // $state.go("risk");
      $ionicHistory.goBack();
  }

  $scope.toggleStar = function(item) {
    item.star = !item.star;
  }

  $scope.onChangeChartData = function(sbp,dbp){
      $scope.marker = sbp;
      if(sbp === undefined || dbp === undefined || $scope.chart === undefined) return;
      console.log(sbp);
      var temp1 = {
          "type": "收缩压",
          "state1": 40+80,
          "state2": 20,
          "state3": 20,
          "state4": 20,
          "state5": 20,
          "now": parseInt(sbp), //params
          "target": 120               //params

      };
      var temp2 = {
          "type": "舒张压",
          "state1": 20+80,
          "state2": 20,
          "state3": 20,
          "state4": 20,
          "state5": 20,
          "now": parseInt(dbp), //params
          "target": 100               //params

      };
      console.log("push");
      $scope.chart.dataProvider.pop();
      $scope.chart.dataProvider.pop();
      $scope.chart.dataProvider.push(temp1);
      $scope.chart.dataProvider.push(temp2);
      // $scope.chart.dataProvider["now"] = sbp;
      $scope.chart.validateData();
      $scope.chart.validateNow();
      // $scope.chart2.validateData();
      console.log($scope.chart);
  }
   // console.log("controller初始化的函数跑了一遍结束"); 
 
}])


//调查问卷的controller state riskquestions;
.controller('RiskQuestionCtrl',['$scope','$state','Patients','Storage',function($scope,$state,Patients,Storage){
 
  $scope.userid = Storage.get('UID');
  // $scope.userid = "PID201506170002";
  // console.log($scope.userid);
  // console.log($scope.SBP);
  $scope.value = {SBP:undefined,DBP:undefined,glucose:undefined,period:undefined};
  // console.log($scope.SBP);
  $scope.clickSubmit = function(){
    //upload 
    Patients.getMaxSortNo($scope.userid).then(function(data){
      var maxsortno = data.result; 
      // console.log("赫赫");
      // console.log(data);
   
    // console.log($scope.userid);
    //get sbp description 
      // var date = new Date();
      // console.log(date);
      // var SBP = parseInt(100 + 20 * Math.random());
      // var DBP = parseInt(70 + 10 * Math.random());
      // var glucose = parseInt((5 + 2*(Math.random()-0.5))*10)/10;
    // console.log($scope.SBP);
    Patients.getSBPDescription(parseInt($scope.value.SBP)).then(function(data){
        // console.log(data);

        var t = data.result + "||"+String($scope.value.SBP)+"||"+String($scope.value.DBP) +"||0||0||0||0||0";
        // console.log(t);
        var time2 = new Date();
        time2.setHours(time2.getHours()+8);
        // console.log(time2);
        var temp = {
          "UserId": $scope.userid,
          "SortNo": parseInt(maxsortno)+1,
          "AssessmentType": "M1",
          "AssessmentName": "高血压",
          "AssessmentTime": time2,
          "Result": t ,
          "revUserId": "sample string 7",
          "TerminalName": "sample string 8",
          "TerminalIP": "sample string 9",
          "DeviceType": 10
        }
      if($scope.value.SBP != undefined && $scope.value.DBP != undefined ) {
        // console.log("上传血压数据");
        var tt = Patients.postTreatmentIndicators(temp);
        // console.log(tt);
      }
      var temp =  {
        "UserId": $scope.userid,
        "SortNo": parseInt(maxsortno)+1,
        "AssessmentType": "M2",
        "AssessmentName": "糖尿病",
        "AssessmentTime": time2,
        "Result": "糖尿病不严重。"+"||"+ $scope.value.period + "||" + String($scope.value.glucose)+ "||",
        "revUserId": "sample string 7",
        "TerminalName": "sample string 8",
        "TerminalIP": "sample string 9",
        "DeviceType": 10
      };
      // console.log(temp.Result);
      if($scope.value.period != undefined && $scope.value.glucose != undefined){
        // console.log("上传血糖数据");
        Patients.postTreatmentIndicators(temp);
      }
      //POST RESULT
      // console.log($scope.description);
      //
      
      
    })
    // console.log($scope.description);
    })
    // console.log($scope.description);
    // Patients.
    $state.go('risk');
  }

}])
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

