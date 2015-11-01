angular.module('appControllers', ['ionic','ionicApp.service', 'ngCordova','ja.qr','ionic-datepicker'])

// 初装或升级App的介绍页面控制器
.controller('intro', ['$scope', 'Storage', function ($scope, Storage) {
  // Storage.set('initState', 'simple.homepage');
  Storage.set('myAppVersion', myAppVersion);
}])

//初始加载页面
.controller('startingCtrl',['$scope', '$state', 'userservice', 'Storage', 'jpushService',function($scope, $state, userservice, Storage, jpushService){ //XJZ
  $scope.startnow = function(){
    // if(userservice.isTokenValid()==1){
      // $state.go('tabs.home');
      // var AutoLogOn = Storage.get();
      // window.plugins.jPushPlugin.setAlias();
    // }else{
      // $state.go('signin');
    // }
	$state.go('signin');
  }
}])

// --------登录注册、设置修改密码-熊佳臻---------------- 
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

//注册 
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
  $scope.infoSetup = function(userName,userGender){
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
    $rootScope.NAME=userName;
    $rootScope.GENDER=userGender;
    $rootScope.BIRTHDAY=$scope.birthday;
    var promise=userservice.userRegister("PhoneNo",$rootScope.userId, userName, $rootScope.password,"HealthCoach");
    promise.then(function(data){
      $scope.logStatus=data.result;
      if(data.result=="注册成功"){
        $timeout(function(){$state.go('upload');} , 500);
      }
      //activition();//帐号激活用
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
              $timeout(function(){$state.go('signin');} , 500);
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
.controller('changePasswordCtrl',['$scope','$state','$timeout', '$ionicHistory', 'userservice','Storage', function($scope , $state,$timeout, $ionicHistory, userservice,Storage){
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
        userservice.changePassword(change.oldPassword,change.newPassword,Storage.get('UID'))
        .then(function(data){
          $scope.logStatus2='修改成功';
          $timeout(function(){$scope.change={originalPassword:"",newPassword:"",confirmPassword:""};
          $state.go('coach.i');
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
  $scope.onClickBackward = function(){
    $ionicHistory.goBack();
  }
 

}])

//获取验证码  
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
      userservice.sendSMS(veriusername,'verification').then(function(data){
          $scope.logStatus='您的验证码已发送';
          unablebutton();
      },function(data){
        $scope.logStatus=data.statusText;
      }) 
    }; 
    var unablebutton = function(){      
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

  }

}])
//二维码在这里，ngcordova的插件QRscan()
.controller('HomeTabCtrl', ['$scope', '$state','$cordovaBarcodeScanner',function($scope, $state, $cordovaBarcodeScanner) {
  $scope.changePass = function(){
    $state.go('changePassword')
  }
  $scope.QRscan = function(){
    $cordovaBarcodeScanner
      .scan()
      .then(function(data) {
        // Success! Barcode data is here
        var s = "Result: " + data.text + "<br/>" +
      "Format: " + data.format + "<br/>" +
      "Cancelled: " + data.cancelled;
        $scope.scandata=s;
      }, function(error) {
        // An error occurred
        $scope.scandata=error;
      });
  }
  //QRgenerate 好像没用
  $scope.QRgenerate = function(){
    // $state.go('qrcode');
    $cordovaBarcodeScanner
      .encode(BarcodeScanner.Encode.TEXT_TYPE, "http://www.baidu.com")
      .then(function(success) {
        // Success!
        console.log(success);
      }, function(error) {
        // An error occurred
        console.log(error);
      });
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

    // var temp2 = Camera.uploadPicture($scope.imgURI);
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
  ['$scope','$state','$stateParams','$cordovaBarcodeScanner','Storage',
  function($scope,$state,$stateParams,$cordovaBarcodeScanner,Storage) { //LRZ
   
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
  $scope.QRscan = function(){
    $cordovaBarcodeScanner
      .scan()
      .then(function(data) {
        // Success! Barcode data is here
        var s = "Result: " + data.text + "<br/>" +
      "Format: " + data.format + "<br/>" +
      "Cancelled: " + data.cancelled;
        alert(s);
      }, function(error) {
        // An error occurred
        alert(error);
      });
  };

  $scope.addpatient = function(){
      $state.go('addpatient.newpatient');
  }
}])
// Coach Personal Config Controller 个人设置页面的controller  还没啥用
// ----------------------------------------------------------------------------------------
.controller('CoachPersonalConfigCtrl', ['$scope','$state','$ionicHistory',function($scope,$state,$ionicHistory) { //LRZ
  $scope.onClickBackward = function(){
      $ionicHistory.goBack();
  };

  $scope.onClickChangePassword = function(){
    $state.go('changepassword');
  }
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

  $scope.onClickBackward = function(){
      PageFunc.confirm("是否放弃修改","确认").then( 
        function(res){
          if(res){
           // console.log("点了queren");
          $state.go('coach.home');
          }
        });    
  };

  $scope.onClickSave = function(){
    PageFunc.confirm("是否上传新信息","确认").then( 
        function(res){
          if(res){
           // console.log("点了queren");
              // 这两个service里面还没有写好
              // ----------------------------------------------------------
              // Users.myTrial(userInfo.BasicInfo);
              // Users.myTrial(userInfo.DtInfo);
          }
        });    
  };

  $scope.onClickEdit = function(_res){
    PageFunc.selection("hehe","hhe",_res,$scope);
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
.controller('CoachMessageCtrl',function(){ //LRZ

})
.controller('myPatientCtrl', ['$scope', '$state', '$http','$timeout','$interval' ,'userINFO' ,function($scope, $state, $http,$timeout,$interval,userINFO){
  var PIDlist=new Array();//PID列表
  var PIDlistLength;//PID列表长度
  var loaditems=0;//已加载条目
  var PatientsList;
  var PatientsBasic=new Array();//输出到页面的json 
  var refreshing=0;//控制连续刷新时序            
  $scope.patients=PatientsBasic;
  $scope.moredata = true;  //控制上拉加载
  var onePatientBasic= function(PID){
    userINFO.BasicInfo(PID).then(function(data){
      var str=JSON.stringify(data);
      var str=JSON.parse(str);
      //两个JSON拼数据,把PatientsList中的字段加到PatientsBasic
      str.photoAddress = PatientsList[loaditems].photoAddress;
      str.PlanNo = PatientsList[loaditems].PlanNo;
      str.StartDate = PatientsList[loaditems].StartDate;
      str.Process = PatientsList[loaditems].Process;
      str.RemainingDays = PatientsList[loaditems].RemainingDays;
      str.VitalSign = PatientsList[loaditems].VitalSign;
      str.ComplianceRate = PatientsList[loaditems].ComplianceRate;
      str.TotalDays = PatientsList[loaditems].TotalDays;
      str.Status = PatientsList[loaditems].Status;
      PatientsBasic.push(str);
      loaditems++;
    },function(data){
    }); 
  }
  var getPatientsBasic=function(list){
    // for(var p in list){        //3行无延时请求数据
    //   onePatientBasic(list[p]);
    // }  
    var repeat=list.length;p=0;  
    var timer;
    timer = $interval(function(){
      if(repeat==0){
        $scope.patients=PatientsBasic;
        $interval.cancel(timer);
        timer=undefined;        
      }else{
      onePatientBasic(list[repeat-1]);
      repeat--;
      }
    },50);
  }
  var firstget =function(){
      if(PIDlistLength>=10){
      getPatientsBasic(PIDlist.slice(0,10));
      }else{
      getPatientsBasic(PIDlist);
      }
      $timeout(function(){$scope.moredata = false;},5000);
      $scope.$broadcast('scroll.refreshComplete'); //刷新完成，重新激活刷新
      refreshing=0;
  }

  var getPIDlist = function(){
    userINFO.GetPatientsList('DOC201506180002','M1','0','0','0')
    .then(function(data){
      PatientsList=data.DT_PatientList; 
      for(var i in PatientsList){
        PIDlist.push(PatientsList[i].PatientId);
      }
      PIDlistLength=PIDlist.length; 
      
      firstget();
    },function(data){
    });
  }

  getPIDlist();

  $scope.doRefresh =function() {
    if(refreshing==0){
      refreshing=1;
      PatientsBasic=[];PIDlist=[];
      loaditems=0;PIDlistLength=0;
      getPIDlist();
    }
  }
  $scope.loadMore = function(){
    if((PIDlistLength-loaditems)>10){
        getPatientsBasic(PIDlist.slice(loaditems,loaditems+10));
    }else if(loaditems>=10){
      getPatientsBasic(PIDlist.slice(loaditems));
    }
    if(PIDlistLength==loaditems && PIDlistLength!=0){
      $scope.moredata=true;
    }    
   $scope.$broadcast('scroll.infiniteScrollComplete');
  }  
    $scope.setwidth=function(patient){
      var divwidth=patient.Age + '%';
      return {width:divwidth}; 
    };
    $scope.ishide=function(patient){
      if(patient.Age>=50){
        return false;
      }else{
        return true;
      } 
    };      
}])
.controller('newpatientsCtrl', ['$scope', '$state', '$http', '$interval','$timeout' ,'userINFO' ,function($scope, $state, $http, $interval,$timeout,userINFO){
  var PIDlist=new Array();
  var PIDlistLength;loaditems=0;
  var PatientsList;
  var PatientsBasic=new Array(); 
  var refreshing=0;//控制连续刷新时序            
  $scope.patients=PatientsBasic;
  $scope.moredata = true;
  var onePatientBasic= function(PID){     
    userINFO.BasicInfo(PID).then(function(data){
      var str=JSON.stringify(data);
      var str=JSON.parse(str);
      PatientsBasic.push(str);
      loaditems++;
    },function(data){
    }); 
  }
  var getPatientsBasic=function(list){
    // for(var p in list){        //3行无延时请求数据
    //   onePatientBasic(list[p]);
    // }  
    var repeat=list.length;p=0;  
    var timer;
    timer = $interval(function(){
      if(repeat==0){
      $timeout(function(){$scope.moredata = false;},3000);
        $scope.patients=PatientsBasic;
        $interval.cancel(timer);
        timer=undefined;        
      }else{
      onePatientBasic(list[repeat-1]);
      repeat--;
      }
    },50);
  }
  var firstget =function(){
      if(PIDlistLength>=10){
      getPatientsBasic(PIDlist.slice(0,10));
      }else{
      getPatientsBasic(PIDlist);
      }
      
      $scope.$broadcast('scroll.refreshComplete'); //刷新完成，重新激活刷新
      refreshing=0;
  }

  var getPIDlist = function(){
    userINFO.GetPatientsList('DOC201506180002','M1','0','0','0')
    .then(function(data){
      PatientsList=data.DT_PatientList; 
      for(var i in PatientsList){
        PIDlist.push(PatientsList[i].PatientId);
      }
      PIDlistLength=PIDlist.length; 
      
      firstget();
    },function(data){
    });
  }

  getPIDlist();

  $scope.doRefresh =function() {
    if(refreshing==0){
      refreshing=1;
      PatientsBasic=[];PIDlist=[];
      loaditems=0;PIDlistLength=0;
      getPIDlist();
    }

  }
  $scope.loadMore = function(){
    if((PIDlistLength-loaditems)>10){
        console.log(PIDlistLength-loaditems);
        console.log(PIDlist.slice(loaditems,loaditems+10));
        getPatientsBasic(PIDlist.slice(loaditems,loaditems+10));
    }else{
      //console.log(PIDlist.slice(loaditems));
      getPatientsBasic(PIDlist.slice(loaditems));
    }
    if(PIDlistLength==loaditems && PIDlistLength!=0){
      //console.log('END');
      $scope.moredata=true;
    }    
   $scope.$broadcast('scroll.infiniteScrollComplete');
  } 
  $scope.onItemDelete = function(index) {
    console.log(index);
    $scope.patients.splice(index, 1);
  } 
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
})

.controller('ModuleInfoCtrl',['$scope','$state','$http', '$ionicHistory', '$stateParams', 'Storage', function($scope,$state,$http, $ionicHistory, $stateParams, Storage) {
  
  var UserId = Storage.get('UID');
  //var Module = $stateParams.Module;
  $scope.onClickBackward = function(){
      $ionicHistory.goBack();
  };


  $http.get('partials/data1.json').success(function(data) {
      $scope.ModuleInfo = data;
  });

  $scope.NextPage =function(){
    $state.go('addpatient.risk');
  };
}])

/*.controller('ModuleInfoListCtrl',['$scope','$state','$http', '$ionicHistory', '$stateParams', 'Storage', 'Users', function($scope,$state,$http, $ionicHistory, $stateParams, Storage, Users) {
  
 $scope.all={first:""};

  var UserId = Storage.get('UID');
  var Module = $stateParams.Module;
  $scope.onClickBackward1 = function(){
      $state.go('addpatient.ModuleInfo');
  };


  var promise=Users.getquestionnaire(UserId,Module);
   promise.then(function(data,status){
     $scope.ModuleInfoList = data;
  },function(data,status){
    $scope.getStatus = status;
  });
}])*/

.controller('ModuleInfoListDetailCtrl',['$scope','$state','$http', '$ionicHistory', '$stateParams',  '$timeout', '$ionicPopup', 'Storage', 'Users', function($scope,$state,$http, $ionicHistory, $stateParams,  $timeout,$ionicPopup, Storage, Users) {
  
  var UserId = Storage.get('UID');
  var Module = $stateParams.Module;
  if ($stateParams.ListName != "" || typeof($stateParams.ListName) != "undefined")
  {
    var ListName = $stateParams.ListName;
  } 
  $scope.DietHabbitValue = "请选择饮食习惯";
  $scope.ListName = ListName;
  var i=1;
  var j=1;
  $scope.HypertensionDrugArray = [{"ID":1,"Type":"","Name":""}];
  $scope.HypertensionDrugData = [{"ID":1,"Type":"","Name":""}];
  $scope.DiabetesDrugArray = [{"ID":1,"Type":"","Name":""}];
  $scope.DiabetesDrugData = [{"ID":1,"Type":"","Name":""}];
  $scope.obj = [];
  $scope.dflag = [];
  $scope.onClickBackward1 = function(){
      $state.go('addpatient.ModuleInfo');
  };
  $scope.onClickBackward2 = function(){
      window.location.href="#/addpatient/ModuleInfo/" +Module;
  };

  // $http.get('partials/data.json').success(function(data) {
  //     $scope.ModuleInfoList = data;
  // });
  Users.getquestionnaire(UserId,Module).then(function(data,status){
    $scope.ModuleInfoList = data;
    $scope.ModuleInfoListDetail = data;
  },function(data,status){
    $scope.getStatus = status;
  });

  // $scope.YesNoType = [{"Type":"1","Name":"是"},{"Type":"2","Name":"否"},{"Type":"3","Name":"未知"}];
  Users.getYesNoType().then(function(data,status){
    $scope.YesNoType = data;
  },function(data,status){
    $scope.getStatus = status;
  });

  $timeout(function() { 
    Users.getHyperTensionDrugTypeName().then(function(data,status){
        $scope.HypertensionDrugArray[0].Type = data;
    },function(data,status){
      $scope.getStatus = status;
    }); 
  }, 100);

  $scope.getHyperTensionDrugNameByType = function(Type, $index){
    Users.getHyperTensionDrugNameByType(Type.Type).then(function(data,status){
      $scope.HypertensionDrugArray[$index].Name = data;
    },function(data){
     $scope.getStatus = status;
    });
  };
  $timeout(function() {
    Users.getDiabetesDrugTypeName().then(function(data,status){
      $scope.DiabetesDrugArray[0].Type = data;
    },function(data,status){
      $scope.getStatus = status;
    });
  }, 100);

  $scope.getDiabetesDrugNameByType = function(Type, $index){
    Users.getDiabetesDrugNameByType(Type.Type).then(function(data,status){
      $scope.DiabetesDrugArray[$index].Name = data;
    },function(data){
     $scope.getStatus = status;
    });
  };

  $scope.getDiabetesdurgName = function(obj){
    $scope.DiabetesDrugArray[0].Name = obj.Name;
  };

  Users.getDietHabbit().then(function(data,status){
    $scope.DietHabbit = data;
    $scope.CheckboxValue = data;
  },function(data,status){
    $scope.getStatus = status;
  });

  Users.getDrinkFrequency().then(function(data,status){
    $scope.DrinkFrequency = data;
  },function(data,status){
    $scope.getStatus = status;
  });

  //[{Patient:Patient, CategoryCode:"M", ItemCode:ItemCode, ItemSeq:ItemSeq, Value:Value, Description: "", SortNo:ItemSeq, revUserId: "sample string 4",TerminalName: "sample string 5", TerminalIP: "sample string 6",DeviceType: 1}]
  $scope.Save = function(){
    for (var k=0; k<$scope.ModuleInfoListDetail.length;k++)
    {
      
      if ($scope.ModuleInfoListDetail[k].ParentCode == ListName) {
        if ($scope.ModuleInfoListDetail[k].Description != "")
        {
          if ($scope.ModuleInfoListDetail[k].Description.Type != "" && typeof($scope.ModuleInfoListDetail[k].Description.Type) != "undefined")
          {
            $scope.obj.push({"Patient":"12312", "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": "1", "Value": $scope.ModuleInfoListDetail[k].Description.Type, "Description":"", "SortNo":"1", "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            $scope.dflag.push({"Flag":true});
          }
          else
          {
            $scope.obj.push({"Patient":"12312", "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": 1, "Value": $scope.ModuleInfoListDetail[k].Description, "Description":"", "SortNo":1, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            $scope.dflag.push({"Flag":true});
          }
        }
        else if ($scope.ModuleInfoListDetail[k].OptionCategory == "DietHabbit" && $scope.DietHabbitValue != "" && $scope.DietHabbitValue != "请选择饮食习惯") {
          $scope.obj.push({"Patient":"12312", "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": 1, "Value": $scope.DietHabbitValue, "Description":"", "SortNo":1, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
          $scope.dflag.push({"Flag":true});
        } 
        else if ($scope.ModuleInfoListDetail[k].OptionCategory == "Cm.MstHypertensionDrug")
        {
          for (var m = 0; m < i; m++)
          {
            if ($scope.HypertensionDrugData[m].Name.Type !="")
            {
              $scope.obj.push({"Patient":"12312", "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": m, "Value": $scope.HypertensionDrugData[m].Name.Type, "Description":"", "SortNo":m, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            }
          }
          $scope.dflag.push({"Flag":true});
        }
        else if ($scope.ModuleInfoListDetail[k].OptionCategory == "Cm.MstDiabetesDrug")
        {
          for (var n = 0; n < j; n++)
          {
            if ($scope.DiabetesDrugData[m].Name.Type !="")
            {
              $scope.obj.push({"Patient":"12312", "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": n, "Value": $scope.DiabetesDrugData[m].Name.Type, "Description":"", "SortNo":n, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            }
          }
          $scope.dflag.push({"Flag":true});
        }
        else
        {
          $scope.dflag.push({"Flag":false});
        }
          
      }
      else
      {
        $scope.dflag.push({"Flag":false});
      }
      };
      
      Users.setPatientDetailInfo($scope.obj).then(function(data,status){
        $scope.getStatus = data;
        if (data.result == "数据插入成功")
        {
          window.location.href="#/addpatient/ModuleInfo/" +Module;
        }
        else
        {
          alert(data.result);
        }
      },function(data,status){
        $scope.getStatus = status;
      });
    
  };

  $scope.addDietHabbit = function(){
    if ($scope.DietHabbitValue == "请选择饮食习惯") {
      $scope.DietHabbitValue="";
    };
    var myPopup = $ionicPopup.show({
      template: '<li class="item item-checkbox" ng-repeat="DietHabbit in DietHabbit" ng-model="CheckboxValue"><label class="checkbox"><input type="checkbox" ng-change="DietChange(DietHabbit)" ng-model="DietHabbit.Type"></label>{{DietHabbit.Name}}</li>',
      title: '请选择饮食习惯',
      //subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [
          {
            text: '<b>取消</b>',
            type: 'button-positive',
            onTap: function(e) {
              if ($scope.DietHabbitValue == "")
              {
                $scope.DietHabbitValue = "请选择饮食习惯";
              } 
              return $scope.DietHabbitValue;        
            }
          },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
              if ($scope.DietHabbitValue == "")
              {
                $scope.DietHabbitValue = "请选择饮食习惯";
              } 
              else if ($scope.DietHabbitValue.indexOf(',') == 0)
              {
                $scope.DietHabbitValue = $scope.DietHabbitValue.substr(1);
              }
              return $scope.DietHabbitValue;        
            }
          }
        ]
    });
    myPopup.then(function(res) {
    console.log('Tapped!', res);
  });
  };

  $scope.DietChange = function(obj){
     for(var i = 0; i < $scope.DietHabbit.length; i++)
      {
        if ($scope.DietHabbit[i].Name == obj.Name)
        {
            if (obj.Type == true) {
              $scope.DietHabbitValue = $scope.DietHabbitValue + "," + obj.Name;
            }
            else if ($scope.DietHabbitValue.indexOf(obj.Name)) {
              var check = $scope.DietHabbitValue.split(',');
              $scope.DietHabbitValue = "";
              for (var j=0; j<check.length;j++) {
                if (check[j] == obj.Name)
                  check[j] = "";
              };
              for (var j=0; j<check.length;j++) {
                if (check[j] !="")
                  $scope.DietHabbitValue = $scope.DietHabbitValue + "," +check[j];
              };
            };
            break;
        }
      }
  };

  
  $scope.addhyperdrug = function(){
    i++;
    $scope.HypertensionDrugArray.push({"ID":i,"Type":"","Name":""});
    $scope.HypertensionDrugData.push({"ID":i,"Type":"","Name":""});
    Users.getHyperTensionDrugTypeName().then(function(data,status){
        $scope.HypertensionDrugArray[i-1].Type = data;
    },function(data,status){
      $scope.getStatus = status;
    }); 
  };
  $scope.deletehyperdrug = function(){
    if (i >1) {
      i--;
      $scope.HypertensionDrugArray.pop({"ID":i,"Type":"","Name":""});
      $scope.HypertensionDrugData.pop({"ID":i,"Type":"","Name":""});
    };
  };
  $scope.adddiabetesdrug = function(){
    j++;
    $scope.DiabetesDrugArray.push({"ID":j,"Type":"","Name":""});
    $scope.DiabetesDrugData.push({"ID":j,"Type":"","Name":""});
    Users.getDiabetesDrugTypeName().then(function(data,status){
        $scope.DiabetesDrugArray[j-1].Type = data;
    },function(data,status){
      $scope.getStatus = status;
    }); 
    };
  $scope.deletediabetesdrug = function(){
    if (j >1) {
      j--;
      $scope.DiabetesDrugArray.pop({"ID":j,"Type":"","Name":""});
      $scope.DiabetesDrugData.pop({"ID":j,"Type":"","Name":""});
    };
  };
}])

.controller('newpatientCtrl',['$scope','$state','Storage','Users','Dict','$ionicLoading',function($scope,$state,Storage,Users,Dict,$ionicLoading){
  
  
  // $scope.PhoneNo="";
  $scope.PhoneNo={pn:''};
  var loading = function() {
      $ionicLoading.show({
        template:'处理中......',
      });
    };

    var hide = function() {
        $ionicLoading.hide();
    };

    

  $scope.test = function()
  {
    loading();
    // console.log($scope.PhoneNo.pn);
    // if($scope.PhoneNo.pn.length!=11) {
    //  $scope.logStatus='请输入11位手机号';
    //  hide()
    // }
    // else{
    //  var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    //  if(!phoneReg.test($scope.PhoneNo.pn)) $scope.logStatus='请输入正确的手机号';
    //  else{Storage.set('phoneno',$scope.PhoneNo.pn);

    //  var id='';
    //  Users.UID('PhoneNo',$scope.PhoneNo.pn).then(
    //    function(data){
    //      id=data.result;
    //      console.log(id);
    //      if(id == null) {
    //        $scope.logStatus='未注册的手机号';
    //        hide()
    //      }
    //      else{
    //        Storage.set('UID',id);
    //        hide();
    //        $state.go('new.basicinfo') 
    //      }
    //    },function(e){
    //      console.log(e);
    //    });
    //    } 
    // }
    var  phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    if(!phoneReg.test($scope.PhoneNo.pn)) {
      $scope.logStatus='请输入正确的手机号';
      hide()
    }
    else{
      Storage.set('phoneno',$scope.PhoneNo.pn);
      var id='';
      Users.UID('PhoneNo',$scope.PhoneNo.pn).then(
        function(data){
          id=data.result;
          console.log(id);
          if(id == null) {
            $scope.logStatus='正在注册';
            Dict.GetNo('17','{TargetDate}').then(
              function(data){
                var UID=(data.result);
                console.log(UID);
                Storage.set('UID',UID);
                hide();
                $state.go('new.basicinfo')
              },function(e){
                console.log(e);
              });     
          }
          else{
            Storage.set('UID',id);
            hide();
            $state.go('new.basicinfo') 
          }
        },function(e){
          console.log(e);
        });     
    }
  }

}])

.controller('basicinfoCtrl',['$scope','$state','Storage','Users','Dict','$ionicPopup','$timeout','$ionicScrollDelegate','$ionicLoading',function($scope,$state,Storage,Users,Dict,$ionicPopup,$timeout,$ionicScrollDelegate,$ionicLoading){
  $scope.scrollBottom = function() {
      $ionicScrollDelegate.scrollBottom(true);
    };
  $scope.scrollTop = function() {
      $ionicScrollDelegate.scrollTop(true);
    };

    

  $scope.PhoneNo=Storage.get('phoneno');
  

  // $scope.UserId,$scope.UserId,$scope.Birthday,$scope.Gender,$scope.BloodType,$scope.IDNo,$scope.DoctorId,$scope.InsuranceType
  // $scope.Gender="";

  // $scope.g=""
  $scope.users={
    "UserId": "",
    "UserName": "",
    "Birthday": "",
    "Gender": "",
    "BloodType": "",
    "IDNo": "",
    "DoctorId": "",
    "InsuranceType": "",
    "InvalidFlag": 9,
    "piUserId": "lzn",
    "piTerminalName": "sample string 11",
    "piTerminalIP": "sample string 12",
    "piDeviceType": 13
    };
    $scope.InsuranceTypes={
      "Code":"",
      "Name":"",
      "InputCode":"",
      "Redundance":""
      };
    Dict.GetInsuranceType().then(
      function(data){
        $scope.InsuranceTypes=data;
        console.log($scope.InsuranceTypes);
      },function(e){
      console.log(e);
    });
  $scope.users.UserId=Storage.get('UID');
  $scope.B="点击设置";
      var datePickerCallback = function (val) {
        if (typeof(val) === 'undefined') {
          console.log('No date selected');
        } else {
        $scope.datepickerObject.inputDate=val;
          var dd=val.getDate();
          var mm=val.getMonth()+1;
          var yyyy=val.getFullYear();
          var birthday=yyyy+'/'+mm+'/'+dd; 
          Storage.set('b', parseInt(yyyy*10000+mm*100+dd));
          $scope.B=birthday;
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
    $scope.HomeAddress={
      "Patient":"",
      "CategoryCode":"Contact",
      "ItemCode":"Contact002_2",
      "ItemSeq":1,
      "Value":"",
      "Description":"",
      "SortNo":1,
      "revUserId":"string",
      "TerminalName":"string",
      "TerminalIP":"string",
      "DeviceType":1
    };
    $scope.HomeAddress.Patient=Storage.get('UID');

  $scope.PhoneNumber={
      "Patient":"",
      "CategoryCode":"Contact",
      "ItemCode":"Contact002_1",
      "ItemSeq":1,
      "Value":Storage.get('phoneno'),
      "Description":"",
      "SortNo":1,
      "revUserId":"string",
      "TerminalName":"string",
      "TerminalIP":"string",
      "DeviceType":1
    };
    $scope.PhoneNumber.Patient=Storage.get('UID');

    $scope.Nationality={
      "Patient":"",
      "CategoryCode":"Contact",
      "ItemCode":"Contact001_3",
      "ItemSeq":1,
      "Value":"",
      "Description":"",
      "SortNo":1,
      "revUserId":"string",
      "TerminalName":"string",
      "TerminalIP":"string",
      "DeviceType":1
    };
    $scope.Nationality.Patient=Storage.get('UID');

    $scope.Occupation={
      "Patient":"",
      "CategoryCode":"Contact",
      "ItemCode":"Contact001_2",
      "ItemSeq":1,
      "Value":"",
      "Description":"",
      "SortNo":1,
      "revUserId":"string",
      "TerminalName":"string",
      "TerminalIP":"string",
      "DeviceType":1
    };
    $scope.Occupation.Patient=Storage.get('UID');

    $scope.EmergencyContact={
      "Patient":"",
      "CategoryCode":"Contact",
      "ItemCode":"Contact002_3",
      "ItemSeq":1,
      "Value":"",
      "Description":"",
      "SortNo":1,
      "revUserId":"string",
      "TerminalName":"string",
      "TerminalIP":"string",
      "DeviceType":1
    };
    $scope.EmergencyContact.Patient=Storage.get('UID');


    $scope.EmergencyContactPhoneNumber={
      "Patient":"",
      "CategoryCode":"Contact",
      "ItemCode":"Contact002_4",
      "ItemSeq":1,
      "Value":"",
      "Description":"",
      "SortNo":1,
      "revUserId":"string",
      "TerminalName":"string",
      "TerminalIP":"string",
      "DeviceType":1
    };
    $scope.EmergencyContactPhoneNumber.Patient=Storage.get('UID');
  // var timeout = function() {
  //  var Timeout = $ionicPopup.alert({
    //    title: '连接超时',
    //    template: '已超时,请检查您的网络',
    //    okText: '关闭',           
    //  });
    //  Timeout.then(function(res) {
    //    console.log('success');
    //  });
    //  $timeout(function(){
    //    Timeout.close();
    //  },5000)
  // };
  var detail = [$scope.HomeAddress,$scope.PhoneNumber,$scope.Nationality,$scope.Occupation,$scope.EmergencyContact,$scope.EmergencyContactPhoneNumber];
  

  
  var loading = function() {
      $ionicLoading.show({
        template:'保存中,请稍候',
      });
      // $timeout(function() {
      //  $ionicLoading.hide();
      //  timeout();
      // },10000);
        
    };

    var hide = function() {
        $ionicLoading.hide();
    };
    

  $scope.save = function(){
    if($scope.users.InsuranceType!='') $scope.users.InsuranceType = $scope.users.InsuranceType.Name;
    loading();
    // 男用1表示，女用0表示
    if ($scope.users.Gender == '男') $scope.users.Gender=1;
    if($scope.users.Gender == '女') $scope.users.Gender=0;

    if($scope.users.BloodType == 'A型') $scope.users.BloodType=1;
    if($scope.users.BloodType == 'B型') $scope.users.BloodType=2;
    if($scope.users.BloodType == 'O型') $scope.users.BloodType=3;
    if($scope.users.BloodType == 'AB型') $scope.users.BloodType=4;
    if($scope.users.BloodType == '其他') $scope.users.BloodType=5;
    if($scope.users.IDNo.length!=15 && $scope.users.IDNo.length!=18 && $scope.users.IDNo!=''){
      $scope.logStatus='请输入正确的身份证号';
      hide();
      return
    };  
    var  phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    var isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
      if(!phoneReg.test($scope.PhoneNumber.Value) && (!isPhone.test($scope.PhoneNumber.Value)) && $scope.PhoneNumber.Value!=''){
        $scope.logStatus='请输入正确的联系电话';
        hide();
        return
      }
      if(!phoneReg.test($scope.EmergencyContactPhoneNumber.Value) && (!isPhone.test($scope.EmergencyContactPhoneNumber.Value)) && $scope.EmergencyContactPhoneNumber.Value!=''){
        $scope.logStatus='请输入正确的紧急联系人电话';
        hide();
        return
      }
    var a = function(){
      var alertS = $ionicPopup.alert({
        title: '已保存',
        template: '基本信息保存成功',
        okText: '确定',           
      });
      alertS.then(function(res) {
        console.log('success');

      });
      $timeout(function(){
        alertS.close();
      },5000)
      
    };
    var b = function(){
      var alertF = $ionicPopup.alert({
        title: '保存失败',
        template: '请按要求填选信息',
        okText: '确定',
      });
      alertF.then(function(res){
        console.log('failed');
      });
      
    };
    $scope.users.Birthday=Storage.get('b');

  //  Users.BasicDtlInfo($scope.HomeAddress).then(
  //    function(data){
  //      console.log($scope.HomeAddress.Patient);
  //      console.log($scope.HomeAddress.Value);
  //    },function(e){
  //      console.log(e);
  //    });

    // Users.BasicDtlInfo($scope.PhoneNumber).then(
  //    function(data){
  //      console.log($scope.PhoneNumber.Patient);
  //      console.log($scope.PhoneNumber.Value);
  //    },function(e){
  //      console.log(e);
  //    });

    // Users.BasicDtlInfo($scope.Nationality).then(
  //    function(data){
  //      console.log($scope.Nationality.Patient);
  //      console.log($scope.Nationality.Value);
  //    },function(e){
  //      console.log(e);
  //    });

    // Users.BasicDtlInfo($scope.Occupation).then(
  //    function(data){
  //      console.log($scope.Occupation.Patient);
  //      console.log($scope.Occupation.Value);
  //    },function(e){
  //      console.log(e);
  //    });

    // Users.BasicDtlInfo($scope.EmergencyContact).then(
  //    function(data){
  //      console.log($scope.EmergencyContact.Patient);
  //      console.log($scope.EmergencyContact.Value);
  //    },function(e){
  //      console.log(e);
  //    });

    // Users.BasicDtlInfo($scope.EmergencyContactPhoneNumber).then(
  //    function(data){
  //      console.log($scope.EmergencyContactPhoneNumber.Patient);
  //      console.log($scope.EmergencyContactPhoneNumber.Value);
  //    },function(e){
  //      console.log(e);
  //    });
      Users.BasicInfo($scope.users).then(
        function(data){
          console.log($scope.users.InsuranceType);
          console.log($scope.users.Gender);
          console.log($scope.users.BloodType);
          console.log($scope.users.Birthday);
          
          if(data.result=='数据插入成功'){
            Users.BasicDtlInfo(detail).then(
              function(data){
                console.log($scope.HomeAddress.Patient);
                console.log($scope.HomeAddress.Value);

                console.log($scope.PhoneNumber.Patient);
                console.log($scope.PhoneNumber.Value);

                console.log($scope.Nationality.Patient);
                console.log($scope.Nationality.Value);

                console.log($scope.Nationality.Patient);
                console.log($scope.Nationality.Value);

                console.log($scope.EmergencyContact.Patient);
                console.log($scope.EmergencyContact.Value);

                console.log($scope.EmergencyContactPhoneNumber.Patient);
                console.log($scope.EmergencyContactPhoneNumber.Value);
                
                hide();
                a();
                $state.go('new.clinicinfo');
              },function(e){
                console.log($scope.users.InsuranceType);
                console.log($scope.users.Gender);
                console.log($scope.users.BloodType);
                console.log($scope.users.Birthday);
                console.log(e);
                hide();
                a();
                $state.go('new.clinicinfo');
              });
            }
          },function(e){
            console.log(e);
            hide();
            b();
          });
  }

  $scope.reset = function(){
    $scope.users={
      "UserId":Storage.get('UID'),
      "UserName": "",
      "Birthday": "",
      "Gender": "",
      "BloodType": "",
      "IDNo": "",
      "DoctorId": "",
      "InsuranceType": "",
      "InvalidFlag": 9,
      "piUserId": "lzn",
      "piTerminalName": "sample string 11",
      "piTerminalIP": "sample string 12",
      "piDeviceType": 13
    };
    $scope.HomeAddress={
        "Patient":Storage.get('UID'),
        "CategoryCode":"Contact",
        "ItemCode":"Contact002_2",
        "ItemSeq":1,
        "Value":"",
        "Description":"",
        "SortNo":1,
        "revUserId":"string",
        "TerminalName":"string",
        "TerminalIP":"string",
        "DeviceType":1
      };
      $scope.PhoneNumber={
        "Patient":Storage.get('UID'),
        "CategoryCode":"Contact",
        "ItemCode":"Contact002_1",
        "ItemSeq":1,
        "Value":"",
        "Description":"",
        "SortNo":1,
        "revUserId":"string",
        "TerminalName":"string",
        "TerminalIP":"string",
        "DeviceType":1
      };
      $scope.Nationality={
        "Patient":Storage.get('UID'),
        "CategoryCode":"Contact",
        "ItemCode":"Contact001_3",
        "ItemSeq":1,
        "Value":"",
        "Description":"",
        "SortNo":1,
        "revUserId":"string",
        "TerminalName":"string",
        "TerminalIP":"string",
        "DeviceType":1
      };
      $scope.Occupation={
        "Patient":Storage.get('UID'),
        "CategoryCode":"Contact",
        "ItemCode":"Contact001_2",
        "ItemSeq":1,
        "Value":"",
        "Description":"",
        "SortNo":1,
        "revUserId":"string",
        "TerminalName":"string",
        "TerminalIP":"string",
        "DeviceType":1
      };
      $scope.EmergencyContact={
        "Patient":Storage.get('UID'),
        "CategoryCode":"Contact",
        "ItemCode":"Contact002_3",
        "ItemSeq":1,
        "Value":"",
        "Description":"",
        "SortNo":1,
        "revUserId":"string",
        "TerminalName":"string",
        "TerminalIP":"string",
        "DeviceType":1
      };
      $scope.EmergencyContactPhoneNumber={
        "Patient":Storage.get('UID'),
        "CategoryCode":"Contact",
        "ItemCode":"Contact002_4",
        "ItemSeq":1,
        "Value":"",
        "Description":"",
        "SortNo":1,
        "revUserId":"string",
        "TerminalName":"string",
        "TerminalIP":"string",
        "DeviceType":1
      };
    $scope.B="点击设置";  
  }
  // $scope.Hospital="";
  // $scope.DoctorId="";
  // $scope.UserName="";
  // $scope.Gender="";
  // $scope.BloodType="";
  // $scope.InsuranceType="";
  // $scope.Birthday="";
  // $scope.Height="";
  // $scope.Weight="";
  // $scope.HomeAddress="";
  // $scope.IDNo="";
  // $scope.PhoneNumber="";
  // $scope.Nationality="";
  // $scope.EmergencyContact="";
  // $scope.EmergencyContactPhoneNumber="";
}])

//LRZ 20151101
.controller('RiskCtrl',['$state','$scope','Patients','$state','$ionicSlideBoxDelegate','$ionicHistory','Storage',
  function($state,$scope,Patients,$state,$ionicSlideBoxDelegate,$ionicHistory,Storage){
  
    console.log("doing refreshing");
    $scope.userid = Storage.get('PatientID');
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
                "now": (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? 0:$scope.newRisks[$scope.index].M1.SBP), //params
                "target": 120               //params

            }, {
                "type": "舒张压",
                "state1": 20+80,
                "state2": 20,
                "state3": 20,
                "state4": 20,
                "state5": 20,
                "now":  (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? 0:$scope.newRisks[$scope.index].M1.DBP),         //params
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
                "bullet": (typeof($scope.newRisks[$scope.index].M2) === 'undefined' ? 3:$scope.newRisks[$scope.index].M2.Glucose)
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
    $scope.userid = Storage.get('PatientID');
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
                "now": (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? 0:$scope.newRisks[$scope.index].M1.SBP), //params
                "target": 120               //params

            }, {
                "type": "舒张压",
                "state1": 20+80,
                "state2": 20,
                "state3": 20,
                "state4": 20,
                "state5": 20,
                "now":  (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? 0:$scope.newRisks[$scope.index].M1.DBP),         //params
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
                "bullet": (typeof($scope.newRisks[$scope.index].M2) === 'undefined' ? 3:$scope.newRisks[$scope.index].M2.Glucose)
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
      $state.go('addpatient.riskquestion');
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
      $state.go('addpatient.risk');
  }

  $scope.NextPage = function(){
    window.location.href="/#/addpatient/create"
  };
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


//调查问卷的controller state riskquestions;//LRZ 20151101
.controller('RiskQuestionCtrl',['$scope','$state','Patients','Storage',function($scope,$state,Patients,Storage){
 
  $scope.userid = Storage.get('PatientID');
  // $scope.userid = "PID201506170002";
  // console.log($scope.userid);
  // console.log($scope.SBP);
  $scope.value = {SBP:undefined,DBP:undefined,glucose:undefined,period:undefined};

  $scope.clickCancel = function(){
    $state.go('addpatient.risk');
  };
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
      if(typeof($scope.value.SBP) != 'undefined' && typeof($scope.value.DBP) != 'undefined' ) {
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
      if(typeof($scope.value.period) != 'undefined' && typeof($scope.value.glucose) != 'undefined'){
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
    $state.go('addpatient.risk');
  }

}])

//GL 20151101
.controller('CreateCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', 'Dict', '$ionicPopup', function($scope, $http, $state, $stateParams, PlanInfo, Dict, $ionicPopup){ 
    $scope.create = {};
    $scope.create.EndDate;
    $scope.create.PlanList = new Array();
    $scope.create.AddFlag = "false"; //只允许当前有一个正在执行的计划

    $scope.$watch('$viewContentLoaded', function() { 
        GetPlanList();
    }); 


    //获取计划列表
    function GetPlanList()
    {
        var PatientId = "U201510260001";
        var promise = PlanInfo.GetPlanList(PatientId, "NULL", "", 0);  //PatientId, PlanNo, Module, Status
        promise.then(function(data) {
            for (var i=0; i< data.length; i++)
            {
                if((data[i].Status =="3") || (data[i].Status =="4"))
                {
                    $scope.create.PlanList.push(data[i]);
                }
                if(($scope.create.AddFlag) && (data[i].Status =="3"))
                {
                    $scope.create.AddFlag = "disabled";
                }
            } 
            //console.log($scope.create.PlanList);                      
        }, function(data) {  
        });  
    }

    $scope.SavePlanNo = function (PlanNo)
    {
        localStorage.setItem("CurrentPlanNo", PlanNo);
    }
    //创建新计划
    $scope.CreatePlan = function ()
    {

        var DateNow = TimeFormat(new Date())[1];
        var promise = Dict.GetNo(15, DateNow);  
        promise.then(function(data) {
            SetPlan(data.result);       
        }, function(data) {  
        });
    }  

    function SetPlan(PlanNo)
    {       
        var PatientId = "U201510260001";
        var StartDate = TimeFormat(new Date()); 
        var EndDate = new Array("9999/12/31", "99991231");
        var Module = "M1";
        var Status = "3";
        var DoctorId = "DOC201506180002";
        var promise = PlanInfo.SetPlan(PlanNo, PatientId, StartDate[1], EndDate[1], Module, Status, DoctorId, "1", "1", "1", 1);  
        promise.then(function(data) {  
            if(data.result == "数据插入成功")
            {
                $scope.create.PlanList.push({PlanName:"当前计划", PlanNo:PlanNo, StartDate:StartDate[1], EndDate: EndDate[1]});
            }                         
        }, function(data) {  
        });      
    }

    //日期格式转换
    function TimeFormat(piDate)
    {
        var Year = piDate.getFullYear().toString();
        var month = Number(piDate.getMonth()) + 1;
        var day = Number(piDate.getDate()); 

        var Month, Day;

        if (month < 10)
        {
            Month = "0" + month.toString();
        } 
        else
        {
            Month = month.toString();
        }
        if (day < 10)
        {
            Day = "0" + day.toString();
        }
        else
        {
            Day = day.toString();
        }
        var date1 = Year + "/" + Month + "/" + Day;
        var date2 = Year + Month + Day;
        var arry = new Array();
        arry[0] = date1;
        arry[1] = date2;
        return arry;
    }
}])

//GL 20151101
.controller('TaskListCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', '$ionicPopup', function($scope, $http, $state, $stateParams, PlanInfo, $ionicPopup){
    //console.log($stateParams.tt);
    //alert(1);
    $scope.TaskList = {};
    $scope.TaskList.EndDate;   //结束日期
    $scope.TaskList.taskList;

    //绑定体征值
    $scope.TaskList.SBP;
    $scope.TaskList.DBP;
    $scope.TaskList.BloodSugar;
    $scope.TaskList.Weight;

    var PlanNo = localStorage.getItem("CurrentPlanNo"); 

    $scope.$on('$ionicView.enter', function() {
        $scope.GetTasks(); 
    });

    $scope.GetTasks = function ()
    {
        var promise = PlanInfo.GetTasks(PlanNo, "T");  
        promise.then(function(data) {          
            $scope.TaskList.taskList = data; 
            console.log($scope.TaskList.taskList);
            GetSBP();
        }, function(data) {  
        });   
    }

    //写入体征目标值
    $scope.SetTarget = function(piType)
    {
        var Type;
        var Code;
        var Value;
        switch (piType)
        {
            case "SBP":
            Type = "Bloodpressure";
            Code = "Bloodpressure_1";
            Value = $scope.TaskList.SBP;
            break;
            case "DBP":
            Type = "Bloodpressure";
            Code = "Bloodpressure_2";
            Value = $scope.TaskList.DBP;
            break;
            case "BloodSugar":
            Type = "BloodSugar";
            Code = "BloodSugar_1";
            Value = $scope.TaskList.BloodSugar;
            break;
            default:
            Type = "Weight";
            Code = "Weight_1";
            Value = $scope.TaskList.Weight;
            break;
        }

        if (!isNaN(Value))
        {
            var promise = PlanInfo.SetTarget(PlanNo, Type, Code, Value, "Origin", "Instruction", "Unit", "piUserId", "piTerminalName", "piTerminalIP", 1);  
            promise.then(function(data) {
                if(data.result == "数据插入成功")
                {
                    //alert(Code);
                }

            }, function(data) {  
            }); 
        }
    }

    //写入结束日期
    $scope.SetEndDate = function ()
    { 
        if($scope.TaskList.EndDate) //格式正确
        {
            var EndDateStr = TimeFormat($scope.TaskList.EndDate)[1];  
            if(!isNaN(EndDateStr))
            {
                var promise = PlanInfo.GetPlanList("", PlanNo, "", 5);  
                promise.then(function(data) {
                    if(parseInt(EndDateStr) <= parseInt(data[0].StartDate))
                    {
                        $scope.TaskList.StartDate = data[0].StartDate;
                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: '结束日期必须大于开始日期{{TaskList.StartDate}}'
                        });
                        alertPopup.then(function(res) {
                            //console.log($scope.TaskList.StartDate);
                            $scope.TaskList.EndDate = null;
                        });
                     } 
                    else
                    {
                        var promise1 = PlanInfo.SetPlan(PlanNo, data[0].PatientId, data[0].StartDate, EndDateStr, data[0].Module, data[0].Status, data[0].DoctorId, "1", "1", "1", 1);             
                        promise1.then(function(data) { 
                            console.log(TimeFormat($scope.TaskList.EndDate)[1]);              
                        }, function(data) {  
                        });                             

                    }
                }, function(data) {  
                });                  
            }
        }                
    }
    //获取收缩压
    function GetSBP()
    {
        var promise = PlanInfo.GetTarget(PlanNo, "Bloodpressure", "Bloodpressure_1");  
        promise.then(function(data) {
            //console.log(data);
            if(data.Type)
            {
                $scope.TaskList.SBP = data.Value;
            }
            GetDBP();
        }, function(data) {  
        }); 
    }

    //获取舒张压
    function GetDBP()
    {
        var promise = PlanInfo.GetTarget(PlanNo, "Bloodpressure", "Bloodpressure_2");  
        promise.then(function(data) {
            //console.log(data);
            if(data.Type)
            {
                $scope.TaskList.DBP = data.Value;
            }
            GetBloodSugar();
        }, function(data) {  
        }); 
    }

    //获取血糖
    function GetBloodSugar()
    {
        var promise = PlanInfo.GetTarget(PlanNo, "BloodSugar", "BloodSugar_1");  
        promise.then(function(data) {
            //console.log(data);
            if(data.Type)
            {
                $scope.TaskList.BloodSugar = data.Value;
            }
            GetWeight();
        }, function(data) {  
        }); 
    } 

    //获取体重
    function GetWeight()
    {
        var promise = PlanInfo.GetTarget(PlanNo, "Weight", "Weight_1");  
        promise.then(function(data) {
            //console.log(data);
            if(data.Type)
            {
                $scope.TaskList.Weight = data.Value;
            }
            GetDenDateTime();
        }, function(data) {  
        }); 
    }

    //获取结束日期
    function GetDenDateTime()
    {
        //PatientId, PlanNo, Module, Status
        var promise = PlanInfo.GetPlanList("", PlanNo, "", 5);  
        promise.then(function(data) {
            if (data[0].EndDate != "99991231")
            {
                var Str = data[0].EndDate.substr(0, 4) + "/" + data[0].EndDate.substr(4, 2) + "/" + data[0].EndDate.substr(6, 2);
                $scope.TaskList.EndDate = new Date(Str);  
            }                                
        }, function(data) {  
        }); 
    }

    //日期格式转换
    function TimeFormat(piDate)
    {
        var Year = piDate.getFullYear().toString();
        var month = Number(piDate.getMonth()) + 1;
        var day = Number(piDate.getDate()); 

        var Month, Day;

        if (month < 10)
        {
            Month = "0" + month.toString();
        } 
        else
        {
            Month = month.toString();
        }
        if (day < 10)
        {
            Day = "0" + day.toString();
        }
        else
        {
            Day = day.toString();
        }
        var date1 = Year + "/" + Month + "/" + Day;
        var date2 = Year + Month + Day;
        var arry = new Array();
        arry[0] = date1;
        arry[1] = date2;
        return arry;
    }

}])

//GL 20151101
.controller('MainPlanCtrl',['$scope', '$http', '$state', '$stateParams', 'PlanInfo', '$ionicPopup', function($scope, $http, $state, $stateParams, PlanInfo, $ionicPopup){
    var Type = $stateParams.tt;
    console.log(Type);
    var PlanNo = localStorage.getItem("CurrentPlanNo");  
    $scope.task = {};
    $scope.task.list;
    var arry = new Array();

    //体重测量与风险评估
    $scope.task.Title;
    if(Type == "TA")
    {
        $scope.task.Title = "体重管理";
    }
    else
    {
        $scope.task.Title = "风险评估";
    }

    //锻炼
    $scope.task.Time;
    $scope.task.Freq;

    //药物治疗
    $scope.task.DrugName;
    $scope.task.DrugDose;
    $scope.task.DrugFreq;
    $scope.task.DrugWay;
    $scope.task.DrugTime;
    $scope.task.Module

    //特征测量
    $scope.task.MeasureTime = [{"Name":"早餐前", "Checked":false}, {"Name":"早餐后", "Checked":false}, {"Name":"午餐前", "Checked":false}, {"Name":"午餐后", "Checked":false}, {"Name":"晚餐前", "Checked":false}, {"Name":"晚餐后", "Checked":false}];

    $scope.$on('$ionicView.enter', function() {
        GettaskList(); 
    });


    //获取任务列表
    function GettaskList()
    {
        var promise = PlanInfo.GetTasks(PlanNo, Type + "0000");  
        promise.then(function(data) {            
            $scope.task.list = data; 
            for(var i=0; i < $scope.task.list.length; i++)
            {
                if ($scope.task.list[i].InvalidFlag === "1")
                {
                    $scope.task.list[i].ControlType = true;
                } 
                else
                {
                    $scope.task.list[i].ControlType = false;
                } 
                arry[i] = $scope.task.list[i].ControlType; 
                if (Type == "TB")
                {
                    $scope.task.list[i].Instruction =parseInt($scope.task.list[i].Instruction);   
                }      
            }
            console.log($scope.task.list);
        }, function(data) {  
        });   
    }

     //按下确定键触发
    $scope.Confirm = function()
    {
        var AddList = new Array();
        var DeleteList = new Array();
        var FlagBefore = false;
        var FlagNow = false;
        for (var i=0; i < arry.length; i++)
        {
            if (arry[i])
            {
                FlagBefore = true;
                break;
            }
        }
        for (var i=0; i < $scope.task.list.length; i++)
        {
            if ($scope.task.list[i].ControlType)
            {
                FlagNow = true;
                break;
            }
        }
        for (var i=0; i < $scope.task.list.length; i++)
        {
            if (($scope.task.list[i].ControlType)) //插入数据
            { 
                AddList.push({"PlanNo":PlanNo, 
                             "Type":$scope.task.list[i].Type, 
                             "Code":$scope.task.list[i].Code, 
                             "SortNo":'1', 
                             "Instruction":$scope.task.list[i].Instruction, 
                             "piUserId":"1",  
                             "piTerminalName":"1",  
                             "piTerminalIP":"1", 
                             "piDeviceType":0});               
            }
            if((!$scope.task.list[i].ControlType) && (arry[i])) //删除数据
            {
                DeleteList.push({"PlanNo":PlanNo, 
                                 "Type":$scope.task.list[i].Type, 
                                 "Code":$scope.task.list[i].Code, 
                                 "SortNo":'1'});
            }
        }
        if ((!FlagBefore) && (FlagNow)) //插入上级条目
        {
            AddList.push({"PlanNo":PlanNo, 
                         "Type":Type, 
                         "Code":Type + "0000", 
                         "SortNo":'1', 
                         "Instruction":"", 
                         "piUserId":"1",  
                         "piTerminalName":"1",  
                         "piTerminalIP":"1", 
                         "piDeviceType":0});                 
            
        }
        if ((FlagBefore) && (!FlagNow)) //删除上级条目
        {
            DeleteList.push({"PlanNo":PlanNo, 
                             "Type":Type, 
                             "Code":Type + "0000", 
                             "SortNo":'1'});
        }
        if(AddList.length > 0)
        {
            var promise = PlanInfo.SetTask(AddList);
            promise.then(function(data)
            {
                if (data.result == "数据插入成功")
                {
                    if (DeleteList.length > 0)
                    {
                        var promise1 = PlanInfo.DeleteTask(DeleteList);
                        promise1.then(function(data) 
                        {
                            if (data.result == "数据删除成功")
                            {
                                window.location.href = "#/addpatient/taskList";
                            }
                        },function(data){
                        });  
                    }
                    else
                    {
                         window.location.href = "#/addpatient/taskList";
                    }                   
                }
            },function(data){              
            });    
        }
        else
        {
            if (DeleteList.length > 0)
            {
                var promise1 = PlanInfo.DeleteTask(DeleteList);
                promise1.then(function(data) 
                {
                    if (data.result == "数据删除成功")
                    {
                        window.location.href = "#/addpatient/taskList";
                    }
                },function(data){
                });  
            }
            else
            {
                 window.location.href = "#/addpatient/taskList";
            }     
        }
    }

    //添加任务
    $scope.AddTask = function(obj)
    {
        if(Type == "TE")
        {
            AddDrug(obj);
        }

    }

    //编辑任务
    $scope.EditTask = function(obj)
    {
        if(Type == "TC")
        {
            EditExercise(obj);
        }
        else if(Type == "TF")
        {
            EditMeasure(obj);
        }
        else
        {

        }
    }

    function EditExercise(obj)
    {
        var Str;
        var Str1 = "";
        var Str2 = ""; 

        if (obj.Instruction)
        {
            var indexA = obj.Instruction.indexOf("时间");
            var indexB = obj.Instruction.indexOf("频次");
            if(indexA > 0)
            {
                if (indexB > 0)
                {
                    var Strlist = obj.Instruction.split(' ');
                    $scope.task.Time = Strlist[0].split('：')[1];
                    $scope.task.Freq = Strlist[1].split('：')[1];
                }
                else
                {
                    $scope.task.Time = obj.Instruction.split('：')[1];
                }
            }
            else
            {
                if (indexB > 0)
                {
                    $scope.task.Freq = obj.Instruction.split('：')[1];
                }
            }
        }        
        var myPopup = $ionicPopup.show({
        template:   '<label class="item item-input">'
                  +     '<span class="input-label">时间</span>'
                  +     '<input type="text" ng-model = "task.Time">'
                  + '</label>'
                  + '<label class="item item-input">'
                  +     '<span class="input-label">频次</span>'
                  +     '<input type="text" ng-model = "task.Freq">'
                  + '</label>',
        title: '设置',
        //subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
            {
              text: '取消',
              type: 'button-small',
              onTap: function(e) {
                  $scope.task.Time = "";
                  $scope.task.Freq = "";  
                  return ""; 
              }
            },
            {
              text: '确定',
              type: 'button-small button-positive',
              onTap: function(e) {
                  if ($scope.task.Time)
                  {
                      Str1 = "运动时间：" + $scope.task.Time + " ";
                  } 
                  if ($scope.task.Freq)  
                  {
                      Str2 = "运动频次：" + $scope.task.Freq;
                  } 
                  Str =  Str1 + Str2;
                  $scope.task.Time = "";
                  $scope.task.Freq = "";   
                  return Str;     
              }
            }             
          ]
        });
        myPopup.then(function(res) {
            if(res != "")
            {
                for (var i=0; i < $scope.task.list.length; i++)
                {
                      if($scope.task.list[i].Name == obj.Name)
                      {
                          $scope.task.list[i].Instruction = res;
                          break;
                      }
                }
            }
        });                
    } 

    function EditMeasure(obj)
    {  
        if (obj.Instruction != "")
        {
            for(var i=0; i<$scope.task.MeasureTime.length; i++)
            {
                if(obj.Instruction.indexOf($scope.task.MeasureTime[i].Name) > 0)
                {
                    $scope.task.MeasureTime[i].Checked = true;
                }
            }
        }   
        var myPopup = $ionicPopup.show({
        template:  '<ion-checkbox ng-repeat="item in task.MeasureTime" ng-model = "item.Checked">'
                  +'{{item.Name}}'
                  +'</ion-checkbox>',
        title: '选择时段',
        //subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
            {
              text: '取消',
              type: 'button-small',
              onTap: function(e) {
                  for(var i=0; i<$scope.task.MeasureTime.length; i++)
                  {
                      $scope.task.MeasureTime[i].Checked = false;
                  }  
                  return "";
              }
            },
            {
              text: '确定',
              type: 'button-small button-positive',
              onTap: function(e) {
                  var Str = "";
                  for(var i=0; i<$scope.task.MeasureTime.length; i++)
                  {
                      if($scope.task.MeasureTime[i].Checked)
                      {
                          Str = Str + "," + $scope.task.MeasureTime[i].Name;
                      }
                      $scope.task.MeasureTime[i].Checked = false;
                  }                  
                  return Str;     
              }
            }             
          ]
        });
        myPopup.then(function(res) {
            if(res != "")
            {
               for (var i=0; i < $scope.task.list.length; i++)
                {
                      if($scope.task.list[i].Name == obj.Name)
                      {
                          $scope.task.list[i].Instruction = "测量时段：" + res.substring(1);
                          break;
                      }
                }
            }
        });                
    } 
}])

//GL 20151101
.controller('healthEducationCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', function($scope, $http, $state, $stateParams, PlanInfo){ 
    var PlanNo = localStorage.getItem("CurrentPlanNo");  
    $scope.task = {};
    $scope.task.list;
    $scope.$watch('$ionicView.enter', function() { 
        GettaskList();      
    });
    var arry = new Array();

    //获取任务列表
    function GettaskList()
    {
        var promise = PlanInfo.GetTasks(PlanNo, "TD0000");  
        promise.then(function(data) {            
            $scope.task.list = data; 
            for(var i=0; i < $scope.task.list.length; i++)
            {
                if ($scope.task.list[i].InvalidFlag === "1")
                {
                    $scope.task.list[i].ControlType = true;
                } 
                else
                {
                    $scope.task.list[i].ControlType = false;
                } 
                arry[i] = $scope.task.list[i].ControlType;       
            }

            //console.log($scope.task.list);
        }, function(data) {  
        });   
    }

    //点击时选择类别
    $scope.SelectType = function (Code)
    {
        localStorage.setItem("healthEducationCode", Code);
        //console.log(localStorage.getItem("healthEducationCode"));
    }

    //点击确定或返回
    $scope.Confirm = function ()
    {
        var tempData;       
        var Flag = false;
        for (var i=0; i<arry.length; i++)
        {
            if (arry[i])
            {
                Flag = true;
                break;
            }
        }
        if (Flag)
        {
            tempData = [{"PlanNo":PlanNo, 
                          "Type":"TD", 
                          "Code":"TD0000", 
                          "SortNo":'1', 
                          "Instruction":"", 
                          "piUserId":"1",  
                          "piTerminalName":"1",  
                          "piTerminalIP":"1", 
                          "piDeviceType":0}];
              var promise = PlanInfo.SetTask(tempData);
              promise.then(function(data)
              {
                  if (data.result == "数据插入成功")
                  {
                      window.location.href = "#/addpatient/taskList";     
                  }
              },function(data){              
              });    
        }
        else
        {
            tempData = [{"PlanNo":PlanNo, 
                         "Type":"TD", 
                         "Code":"TD0000", 
                         "SortNo":'1'}];
            var promise1 = PlanInfo.DeleteTask(DeleteList);
                promise1.then(function(data) 
                {
                    if ((data.result == "数据删除成功") || (data.result == "数据未找到"))
                    {
                        window.location.href = "#/addpatient/taskList";
                    }
                },function(data){
                });  

        }        
    }

}])

//GL 20151101
.controller('healthEducationDetailCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', function($scope, $http, $state, $stateParams, PlanInfo){
    var Code = localStorage.getItem("healthEducationCode");
    var PlanNo = localStorage.getItem("CurrentPlanNo");  
    $scope.task = {};
    $scope.task.list;
    $scope.$watch('$viewContentLoaded', function() { 
        GettaskList();      
    });
    var arry = new Array();

    //获取任务列表
    function GettaskList()
    {
        var promise = PlanInfo.GetTasks(PlanNo, Code);  
        promise.then(function(data) {            
            $scope.task.list = data; 
            for(var i=0; i < $scope.task.list.length; i++)
            {
                if ($scope.task.list[i].InvalidFlag === "1")
                {
                    $scope.task.list[i].ControlType = true;
                } 
                else
                {
                    $scope.task.list[i].ControlType = false;
                } 
                arry[i] = $scope.task.list[i].ControlType;  
            }
            //console.log($scope.task.list);
        }, function(data) {  
        });   
    }

    $scope.Confirm = function ()
    {
        var AddList = new Array();
        var DeleteList = new Array();
        var FlagBefore = false;
        var FlagNow = false;

        for (var i=0; i < arry.length; i++)
        {
            if (arry[i])
            {
                FlagBefore = true;
                break;
            }
        }
        for (var i=0; i < $scope.task.list.length; i++)
        {
            if ($scope.task.list[i].ControlType)
            {
                FlagNow = true;
                break;
            }
        }
        for (var i=0; i < $scope.task.list.length; i++)
        {
            if (($scope.task.list[i].ControlType)) //插入数据
            { 
                AddList.push({"PlanNo":PlanNo, 
                             "Type":$scope.task.list[i].Type, 
                             "Code":$scope.task.list[i].Code, 
                             "SortNo":'1', 
                             "Instruction":"", 
                             "piUserId":"1",  
                             "piTerminalName":"1",  
                             "piTerminalIP":"1", 
                             "piDeviceType":0});               
            }
            if((!$scope.task.list[i].ControlType) && (arry[i])) //删除数据
            {
                DeleteList.push({"PlanNo":PlanNo, 
                                 "Type":$scope.task.list[i].Type, 
                                 "Code":$scope.task.list[i].Code, 
                                 "SortNo":'1'});
            }
        }
        
        if ((!FlagBefore) && (FlagNow)) //插入上级条目
        {
            AddList.push({"PlanNo":PlanNo, 
                         "Type":"TD", 
                         "Code":Code, 
                         "SortNo":'1', 
                         "Instruction":"", 
                         "piUserId":"1",  
                         "piTerminalName":"1",  
                         "piTerminalIP":"1", 
                         "piDeviceType":0});                 
            
        }
        if ((FlagBefore) && (!FlagNow)) //删除上级条目
        {
            DeleteList.push({"PlanNo":PlanNo, 
                             "Type":"TD", 
                             "Code":Code, 
                             "SortNo":'1'});
        }

        if(AddList.length > 0)
        {
            var promise = PlanInfo.SetTask(AddList);
            promise.then(function(data)
            {
                if (data.result == "数据插入成功")
                {
                    if (DeleteList.length > 0)
                    {
                        var promise1 = PlanInfo.DeleteTask(DeleteList);
                        promise1.then(function(data) 
                        {
                            if (data.result == "数据删除成功")
                            {
                                window.location.href = "#/addpatient/TD";
                            }
                        },function(data){
                        });  
                    }
                    else
                    {
                         window.location.href = "#/addpatient/TD";
                    }                   
                }
            },function(data){              
            });    
        }
        else
        {
            if (DeleteList.length > 0)
            {
                var promise1 = PlanInfo.DeleteTask(DeleteList);
                promise1.then(function(data) 
                {
                    if (data.result == "数据删除成功")
                    {
                        window.location.href = "#/addpatient/TD";
                    }
                },function(data){
                });  
            }
            else
            {
                 window.location.href = "#/addpatient/TD";
            }     
        }
    }
}])

//GL 20151101
.controller('DrugCtrl',['$scope', '$http', '$state', '$stateParams', '$ionicPopup', 'Dict', 'PlanInfo',function($scope, $http, $state, $stateParams, $ionicPopup, Dict, PlanInfo){
    var PlanNo = localStorage.getItem("CurrentPlanNo");  
    $scope.task = {};
    $scope.task.list;
    $scope.task.Module;
    $scope.task.DrugList;
    $scope.DrugName;
    $scope.task.Dose;
    $scope.task.Freq;
    $scope.task.Way;
    $scope.task.Time;

    $scope.$watch('$viewContentLoaded', function() { 
        $scope.GetDrugList(); 
        //GettaskList();    
    });

    //获取任务列表
    function GettaskList()
    {
        var promise = PlanInfo.GetTasks(PlanNo, "TE0001");  
        promise.then(function(data) {            
            $scope.task.list = data; 
            console.log($scope.task.list);
        }, function(data) {  
        });   
    }

    //获取备选药物列表
    $scope.GetDrugList = function  ()
    {
        var promise;
        if ($scope.task.Module == "M2")
        {
            promise = Dict.GetDiabetesDrug();
        }
        else
        {            
            promise = Dict.GetHypertensionDrug();  
        }
        promise.then(function(data) {            
            $scope.task.DrugList = data;
            console.log($scope.task.DrugList);
        }, function(data) {  
        }); 
    }

    //添加药物
    $scope.addItem = function ()
    {
        var myPopup = $ionicPopup.show({
        templateUrl: 'templates/plan/drugAdd.html',
        title: '添加药物',
        scope: $scope,
        buttons: [
            {
              text: '取消',
              type: 'button-small',
              onTap: function(e) { 
                  $scope.task.DrugName = "";
                  $scope.task.Dose = "";
                  $scope.task.Freq = "";
                  $scope.task.Way = "";
                  $scope.task.Time = "";      
              }
            },
            {
              text: '确定',
              type: 'button-small button-positive',
              onTap: function(e) {
                  var editArry = new Array();
                  editArry[0] = $scope.task.DrugName;
                  editArry[1] = $scope.task.Dose;
                  editArry[2] = $scope.task.Freq;
                  editArry[3] = $scope.task.Way;
                  editArry[4] = $scope.task.Time;  
                  $scope.task.DrugName = "";
                  $scope.task.Dose = "";
                  $scope.task.Freq = "";
                  $scope.task.Way = "";
                  $scope.task.Time = ""; 
                  return editArry; 
              }
            }             
          ]
        });
        myPopup.then(function(res) {
            if (res[0] != "")
            {
                for (var i=1; i<5; i++)
                {
                    if (!res[i])
                    {
                        res[i] = "";
                    }
                }
                $scope.task.list.push({"Name":res[0], "Instruction":res[1]+ "|" + res[2] + "|" + res[3] + "|" + res[4]});
            }
        });
    }

    //编辑药物
    $scope.EditTask = function (obj)
    { 
        $scope.task.DrugName = obj.Name;
        var temparry = obj.Instruction.split('|');
        $scope.task.Dose = temparry[0];
        $scope.task.Freq = temparry[1];
        $scope.task.Way = temparry[2];
        $scope.task.Time = temparry[3];


        var myPopup = $ionicPopup.show({
        templateUrl: 'templates/plan/drugEdit.html',
        title: '编辑药物',
        scope: $scope,
        buttons: [
            {
              text: '取消',
              type: 'button-small',
              onTap: function(e) { 
                  $scope.task.DrugName = "";
                  $scope.task.Dose = "";
                  $scope.task.Freq = "";
                  $scope.task.Way = "";
                  $scope.task.Time = "";      
              }
            },
            {
              text: '确定',
              type: 'button-small button-positive',
              onTap: function(e) {
                  var editArry = new Array();                
                  editArry[0] = $scope.task.Dose;
                  editArry[1] = $scope.task.Freq;
                  editArry[2] = $scope.task.Way;
                  editArry[3] = $scope.task.Time;  
                  $scope.task.DrugName = "";
                  $scope.task.Dose = "";
                  $scope.task.Freq = "";
                  $scope.task.Way = "";
                  $scope.task.Time = ""; 
                  return editArry; 
              }
            }             
          ]
        });
        myPopup.then(function(res) {
            for (var i=1; i<5; i++)
            {
                if (!res[i])
                {
                    res[i] = "";
                }
            }
            for (var i=0; i<$scope.task.list.length; i++)
            {
                if($scope.task.list[i].Name === obj.Name)
                {
                    $scope.task.list[i].Instruction = res[0]+ "|" + res[1]+ "|" + res[2]+ "|" + res[3];
                    break;
                }
            }           
        });
    }

    //删除药物
    $scope.RemoveItem = function (obj)
    {
        for (var i=0; i<$scope.task.list.length; i++)
        {
            if($scope.task.list[i].Name === obj.Name)
            {
                $scope.task.list.splice(i, 1);
                break;
            }
        }    
    }
}])

//临床信息控制器 ZXF 20151031
.controller('datepickerCtrl',function($scope,$state,$http,$ionicModal,$ionicHistory,Storage,GetClinicInfoDetail,GetClinicalList,
  GetHZID,Getexaminfo,Getdiaginfo,Getdruginfo) {
  $scope.SyncInfo={"userid":"PID00009999"};
  //$scope.SyncInfo={"userid":Storage.get('PatientID')};
//根据userid获取就诊信息列表（展示时用）
  // var a={UserId:$scope.SyncInfo.patientid};
  var promise2=GetClinicalList.GetClinicalInfoListbyUID({UserId:$scope.SyncInfo.userid});
  console.log($scope.SyncInfo.userid);
  promise2.then(function(data){
    $scope.cliniclist=data.DT_InPatientInfo;

    console.log($scope.cliniclist);
//点击查看详情根据UserId、Type、VisitId、Date获取具体检查信息modal形式展示
$ionicModal.fromTemplateUrl('partials/addpatient/examinationinfo.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(modal) {
  $scope.modalexam = modal;
});
$scope.onClickBackward = function(){
  $ionicHistory.goBack();
};
$scope.openexaminfomodal = function(index) {
  $scope.modalexam.show();
  console.log(index);
  console.log($scope.SyncInfo.userid);
  console.log($scope.cliniclist[index].VisitId);
  var promise1=Getexaminfo.Getexaminfobypiduid({UserId:$scope.SyncInfo.userid,VisitId:$scope.cliniclist[index].VisitId});
  promise1.then(function(data1){
    $scope.Examinationinfo=data1;
    $scope.Examinationinfo.length==0?$scope.show=true:$scope.show=false;
    console.log($scope.Examinationinfo);
  }, function(data1) {  
  });
};

$scope.closeexamModal = function() {
  $scope.modalexam.hide();
};
$scope.$on('$destroy', function() {
  $scope.modalexam.remove();
});
  //点击查看详情根据UserId、Type、VisitId、Date获取具体诊断信息modal形式展示
  $ionicModal.fromTemplateUrl('partials/addpatient/druginfo.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modaldiag = modal;
  });

  $scope.opendiaginfomodal = function(index) {
    $scope.modaldiag.show();
    var promise0=Getdiaginfo.Getdiaginfobypiduid({UserId:$scope.SyncInfo.userid,VisitId:$scope.cliniclist[index].VisitId});
    promise0.then(function(data0){
      $scope.Diagnosisinfo=data0;
      $scope.Diagnosisinfo.length==0?$scope.show=true:$scope.show=false;

      console.log($scope.Diagnosisinfo);
    },
    function(data0) {
    }
    )
  };

  $scope.closediagModal = function() {
    $scope.modaldiag.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.modaldiag.remove();
  });

 // });
//点击查看详情根据UserId、Type、VisitId、Date获取具体用药信息modal形式展示
$ionicModal.fromTemplateUrl('partials/addpatient/DiagnosisInfo.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(modal) {
  $scope.modaldrug = modal;
});

$scope.opendruginfomodal = function(index) {
  $scope.modaldrug.show();
    // var d={UserId:$scope.SyncInfo.patientid,Type:'DrugRecord',VisitId:$scope.clinicinfo[index].VisitId, Date:$scope.tt};
    var promise1=Getdruginfo.Getdruginfobypiduid({UserId:$scope.SyncInfo.userid,VisitId:$scope.cliniclist[index].VisitId});
    promise1.then(function(data2){
      $scope.DrugRecordinfo=data2;
      $scope.DrugRecordinfo.length==0?$scope.show=true:$scope.show=false;


      console.log($scope.DrugRecordinfo);
    }, function(data2) {  
    }
    )
  };

  $scope.closedrugModal = function() {
    $scope.modaldrug.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.modaldrug.remove();
  });
 //  $scope.$on('modal.hidden', function() {
 // });
 //  $scope.$on('modal.removed', function() {
 // });
}, function(data) {
});

//datepicker函数
var d=new Date();
$scope.tt=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
var weekDaysList = ["日", "一", "二", "三", "四", "五", "六"];
var monthList = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
$scope.datepickerObject = {
      titleLabel: '就诊日期',  //Optional
      todayLabel: '今天',  //Optional
      closeLabel: '关闭',  //Optional
      setLabel: '设置',  //Optional
      setButtonType : 'button-assertive',  //Optional
      todayButtonType : 'button-assertive',  //Optional
      closeButtonType : 'button-assertive',  //Optional
      inputDate: new Date(),    //Optional
      mondayFirst: true,    //Optional
      // disabledDates: disabledDates, //Optional
      weekDaysList: weekDaysList,   //Optional
      monthList: monthList, //Optional
      templateType: 'popup', //Optional
      showTodayButton: 'true', //Optional
      modalHeaderColor: 'bar-positive', //Optional
      modalFooterColor: 'bar-positive', //Optional
      from: new Date(1880, 8, 2),   //Optional
      to: new Date(2018, 8, 25),    //Optional
      callback: function (val) {    //Mandatory
        datePickerCallback(val);
      }
    };
    var datePickerCallback = function (val) {
      if (typeof(val) === 'undefined') {
        console.log('No date selected');
      } else {
    // var d=new Date(val);
    $scope.tt=val.getFullYear()+'-'+(val.getMonth()+1)+'-'+val.getDate();
    console.log('Selected date is : ', val)
    console.log(val)
  }
};

$scope.NextPage = function(){
  $state.go('addpatient.ModuleInfo');
};

//这是同步的button事件根据pid拿到最近十条就诊记录
$scope.synclinicinfo=function(){
    // UserId:"@UserId",HospitalCode:'@HospitalCode'
    var a={UserId:$scope.SyncInfo.userid,HospitalCode:'HJZYY'};
    var promise=GetHZID.GetHUserIdByHCode(a);
    promise.then(function(data){
      //拿到海总的就诊号用于后续同步
      $scope.HJZYYID=data.result;
      console.log($scope.HJZYYID)
//调用webservice



}, function(data) {
})
  };  


});
