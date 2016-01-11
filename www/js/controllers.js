angular.module('appControllers', ['ionic','ionicApp.service', 'ngCordova','ionic-datepicker','ui.calendar'])

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
//登录  
.controller('SignInCtrl', ['$scope','$state', '$timeout', 'userservice','Storage','loading','PageFunc' , 'jpushService',function($scope, $state, $timeout, userservice, Storage,loading,PageFunc,jpushService) {
  $scope.barwidth="width:0%";
  if(Storage.get('USERNAME')!=null){
    $scope.logOn={username:Storage.get('USERNAME'),password:""};
  }else{
    $scope.logOn={username:"",password:""};
  }
  $scope.signIn = function(logOn) {
    $scope.logStatus='';
    if((logOn.username!="") && (logOn.password!="")){ 
      var cont=0;
      var saveUID = function(){
        var UIDpromise=userservice.UID('PhoneNo',logOn.username);
        UIDpromise.then(function(data){
          loading.loadingBarFinish($scope);
          if(data.result!=null){
            $scope.logStatus="登录成功";
            Storage.set('UID', data.result);
            $timeout(function(){$state.go('coach.patients');} , 500);
            //window.plugins.jPushPlugin.setAlias(data.result);
          }
        },function(data){
          if(cont++<5){
            saveUID();
          }else{
            loading.loadingBarFinish($scope);
            $scope.logStatus="网络错误"
          }
        });
      }                
      var promise=userservice.userLogOn('PhoneNo' ,logOn.username,logOn.password,'HealthCoach');
      if(promise==7){
        $scope.logStatus='手机号验证失败！';
        return;
      }
      loading.loadingBarStart($scope);
      promise.then(function(data){
        // loading.loadingBarFinish($scope);
        // $scope.logStatus=data.result.substr(0,4);
        if(data.result.substr(0,4)=="登陆成功"){ 
          Storage.set('TOKEN', data.result.substr(12));
          Storage.set('USERNAME', logOn.username);
          Storage.set('isSignIN','YES');
          saveUID();
          // $timeout(function(){$state.go('coach.patients');} , 1000);
        }
      },function(data){ 
        loading.loadingBarFinish($scope);
        if(data.data==null && data.status==0){
          $scope.logStatus='网络错误！';
          return;          
        }
        if(data.status==404){
          $scope.logStatus='连接服务器失败！';
          return;          
        }
        if(data.data.result=='暂未激活'){
          //Storage.set('TOKEN', data.result.substr(12));
          Storage.set('USERNAME', logOn.username);
          Storage.set('isSignIN','YES');
          saveUID();          
          return;        
        } 
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
.controller('userdetailCtrl',['$scope','$state','$cordovaDatePicker','$rootScope','$timeout' ,'userservice','Storage','loading','Users' ,function($scope,$state,$cordovaDatePicker,$rootScope,$timeout,userservice,Storage,loading,Users){
  $scope.barwidth="width:0%";
  $scope.userName='';
  $scope.birthday="点击设置";
  var upload={
    "id": "",
    "name": "",
    "birthday": "",
    "gender": "",
    "idno": "sample string 5",
    "InvalidFlag": 0,
    "piUserId": "sample string 7",
    "piTerminalName": "sample string 8",
    "piTerminalIP": "sample string 9",
    "piDeviceType": 2
  }
  var datePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
    } else {
      $scope.datepickerObject.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      upload.birthday=parseInt(yyyy+m+d);
      var birthday=yyyy+'/'+m+'/'+d;
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
    $scope.logStatus='';
    if(userName!='' && userGender!='' && $scope.birthday!='' && $scope.birthday!='点击设置'){
      upload.name=userName;
      upload.gender=userGender == '男'?1:2;
      var saveUID = function(){
        UIDpromise=userservice.UID('PhoneNo',$rootScope.userId)
        .then(function(data){
          if(data.result!=null){
            Storage.set('UID', data.result);
            Storage.set('USERNAME', $rootScope.userId);
            upload.id=Storage.get('UID');
            Users.postDoctorInfo(upload).then(function(data){
              loading.loadingBarFinish($scope);
              $scope.logStatus=data.result;
              if(data.result=="数据插入成功"){
                $scope.logStatus='注册成功！';
                $timeout(function(){$state.go('upload');} , 500);
              }
            },function(data){
              loading.loadingBarFinish($scope);
              $scope.logStatus='网络错误！';
            });            
          }else{
            loading.loadingBarFinish($scope);
            $scope.logStatus='系统错误！';
          }
        },function(data){
          loading.loadingBarFinish($scope);
          $scope.logStatus='网络错误！';
        });
      }
      loading.loadingBarStart($scope);
      userservice.userRegister("PhoneNo",$rootScope.userId, userName, $rootScope.password,"HealthCoach")
      .then(function(data){
        userservice.userLogOn('PhoneNo' ,$rootScope.userId,$rootScope.password,'HealthCoach')
        .then(function(data){
          if(data.result.substr(0,4)=="登录成功"){
            Storage.set('TOKEN', data.result.substr(12));
            saveUID();
          }
        },function(data){
          if(data.data.result=='暂未激活'){
            //Storage.set('TOKEN', data.result.substr(12));
            saveUID();
          }else{
            loading.loadingBarFinish($scope);
            $scope.logStatus='网络错误！';
          }
        });
      },function(data){
        if(data.data==null && data.status==0){
          loading.loadingBarFinish($scope);
          $scope.logStatus='网络错误！';
          return;          
        }        
        if(data.data.result=='同一用户名的同一角色已经存在'){
          userservice.userLogOn('PhoneNo' ,$rootScope.userId,$rootScope.password,'HealthCoach')
          .then(function(data){
            if(data.result.substr(0,4)=="登录成功"){
              Storage.set('TOKEN', data.result.substr(12));
              saveUID();
            }
          },function(data){
            if(data.data.result=='暂未激活'){
              //Storage.set('TOKEN', data.result.substr(12));
              saveUID();
            }else{
              loading.loadingBarFinish($scope);
              $scope.logStatus='网络错误！';
            }
          });
        }else if(data.data==null && data.status==0){
          loading.loadingBarFinish($scope);
          $scope.logStatus='网络错误！';
          return;          
        }else{
          loading.loadingBarFinish($scope);
          $scope.logStatus=data.data.result;          
        }     
      });
    }else{
      $scope.logStatus='请输入完整信息！';
    }
  }
}])
//设置密码   
.controller('setPasswordCtrl', ['$scope','$state','$rootScope' ,'$timeout' , 'userservice','Storage','loading' ,function($scope,$state,$rootScope,$timeout,userservice,Storage,loading) {
  $scope.barwidth="width:0%";
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
    $scope.logStatus='';
    if((setPassword.newPass!="") && (setPassword.confirm!="")){
      if(setPassword.newPass == setPassword.confirm){
        if(setPassState=='register'){
          $rootScope.password=setPassword.newPass;
          $state.go('userdetail');
        }else{
          var userId=Storage.get('UID');
          loading.loadingBarStart($scope);
          userservice.changePassword('#*bme319*#',setPassword.newPass,userId)
          .then(function(data){
            loading.loadingBarFinish($scope);
            $scope.logStatus=data.result;
            if(data.result=='修改密码成功'){
              $timeout(function(){$state.go('signin');} , 500);
            }
          },function(data){
            loading.loadingBarFinish($scope);
            if(data.data==null && data.status==0){
              $scope.logStatus='网络错误！';
              return;          
            }
            $scope.logStatus=data.data.result;
          });
        }
      }else{
        $scope.logStatus="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus="请输入两遍新密码"
    }
  }
}])
//修改密码   
.controller('changePasswordCtrl',['$scope','$state','$timeout', '$ionicHistory', 'userservice','Storage','loading' , function($scope , $state,$timeout, $ionicHistory, userservice,Storage,loading){
  $scope.barwidth="width:0%";
  $scope.ishide=true;
  $scope.change={oldPassword:"",newPassword:"",confirmPassword:""};
  $scope.passwordCheck = function(change){
    $scope.logStatus1='';
    loading.loadingBarStart($scope);
    userservice.userLogOn('PhoneNo',Storage.get('USERNAME'),change.oldPassword,'HealthCoach')
    .then(function(data){
      loading.loadingBarFinish($scope);
      $scope.logStatus1='验证成功';
      $timeout(function(){$scope.ishide=false;} , 500);
    },function(data){
      loading.loadingBarFinish($scope);
      if(data.data==null && data.status==0){
        $scope.logStatus1='网络错误！';
        return;          
      }
      if(data.data.result=="暂未激活"){
        $scope.logStatus1='验证成功';
        $timeout(function(){$scope.ishide=false;} , 500);
        return;
      }      
      $scope.logStatus1='密码错误';
    });
  }

  $scope.gotoChange = function(change){
    $scope.logStatus2='';
    if((change.newPassword!="") && (change.confirmPassword!="")){
      if(change.newPassword == change.confirmPassword){
        loading.loadingBarStart($scope);
        userservice.changePassword(change.oldPassword,change.newPassword,Storage.get('UID'))
        .then(function(data){
          loading.loadingBarFinish($scope);
          $scope.logStatus2='修改成功';
          $timeout(function(){
            $scope.change={originalPassword:"",newPassword:"",confirmPassword:""};
            $state.go('coach.home');
            $scope.ishide=true;
          } , 500);
        },function(data){
          loading.loadingBarFinish($scope);
          if(data.data==null && data.status==0){
            $scope.logStatus2='网络错误！';
            return;          
          }
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
.controller('phonevalidCtrl', ['$scope','$state','$interval','$rootScope', 'Storage', 'userservice','loading' , function($scope, $state,$interval,$rootScope,Storage,userservice,loading) {
  $scope.barwidth="width:0%";
  var setPassState=Storage.get('setPasswordState');
  $scope.veriusername="" 
  $scope.verifyCode="";
  $scope.veritext="获取验证码";
  $scope.isable=false;
  $scope.gotoReset = function(veriusername,verifyCode){
    $scope.logStatus='';
    if(veriusername!='' && verifyCode!=''){
      loading.loadingBarStart($scope);
      $rootScope.userId=veriusername;
      userservice.checkverification(veriusername,'verification',verifyCode)
      .then(function(data){
        loading.loadingBarFinish($scope);
        if(data.result==1){
          $scope.logStatus='验证成功！';
          $state.go('setpassword');
        }else{
          $scope.logStatus='验证码错误！';
        }        
      },function(data){
        loading.loadingBarFinish($scope);
        if(data.data==null && data.status==0){
          $scope.logStatus='网络错误！';
          return;          
        }
        $scope.logStatus='验证失败！';
    });
    }else{
      $scope.logStatus="请输入完整信息！"
    }
  }
   
  $scope.getcode=function(veriusername){
    $scope.logStatus='';
    var operation=Storage.get('setPasswordState');
    var sendSMS = function(){  
      userservice.sendSMS(veriusername,'verification')
      .then(function(data){
        loading.loadingBarFinish($scope);
        unablebutton();    
        if(data[0]=='您'){
          $scope.logStatus="您的验证码已发送，重新获取请稍后";
        }else{
          $scope.logStatus='验证码发送成功！';
        }
      },function(data){
        loading.loadingBarFinish($scope);
        if(data.data==null && data.status==0){
          $scope.logStatus='网络错误！';
          return;          
        }
        $scope.logStatus='验证码发送失败！';
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
    loading.loadingBarStart($scope);
    promise.then(function(data){
      if(data.result!=null){
        if(operation=='reset'){
          Storage.set('UID',data.result);
          sendSMS();//发送验证码
        }else{
          userservice.Roles(data.result).then(function(data){
            loading.loadingBarFinish($scope);
            var flag=0;
            for(var i in data){
              if(data[i]=='HealthCoach'){
                $scope.logStatus='该账户已进行过注册！';
                flag=1;
                break;
              }
            }
            if(flag==0){
              sendSMS();
            }
          },function(){
            loading.loadingBarFinish($scope);
            $scope.logStatus='网络出错了，请再次发送';
          })
        }
      }else{
        if(operation=='reset'){
          loading.loadingBarFinish($scope);
          Storage.set('UID','');
          $scope.logStatus="用户不存在";
        }else{
          sendSMS();
        }
      }
    },function(data){
      loading.loadingBarFinish($scope);
      if(data.data==null && data.status==0){
          $scope.logStatus='网络错误！';
          return;          
      }
      $scope.logStatus='网络出错了，请再次发送';
    })
  }
}])
//lrz20151112
.controller('CoachIdUploadCtrl', ['$scope','$state','$ionicPopover','$stateParams','Storage','Patients','Camera','Users','$ionicActionSheet','$timeout','$rootScope','CONFIG','PageFunc','$cordovaDatePicker',
  function($scope,$state,$ionicPopover,$stateParams,Storage,Patients,Camera,Users,$ionicActionSheet,$timeout,$rootScope,CONFIG,PageFunc,$cordovaDatePicker) { //LRZ

  //获得信息
   // $scope.imgURI = Storage.get(14);
   // $scope.userInfo = JSON.parse(Storage.get("userInfo"));
   $scope.loadingDone = false;
   $scope.datepickerObject = {};
   $scope.dict = {};
   $scope.userInfo = {BasicInfo:{},DtInfo:{}};

   //从字典中搜索选中的对象。
   var searchObj = function(code,array){
      for (var i = 0; i < array.length; i++) {
        if(array[i].Type == code) return array[i];
      };
      return "未填写";
   }

   var GetDocInfo = function(){
     Users.getDocInfo(Storage.get("UID")).then(function(data,headers){
        var temp = data;
        console.log(data);
        $scope.userInfo.BasicInfo = {
         name:temp.DoctorName ,
         gender:searchObj(data.Gender,$scope.dict.SexType),
         birthday:temp.Birthday,
         id:temp.DoctorId == null? Storage.get("UID"):temp.DoctorId,
         idno:temp.IDNo
       }
       console.log($scope.userInfo.BasicInfo.gender)
       // switch(temp.Gender){
       //  case '1' : $scope.userInfo.BasicInfo.gender = "男性"; break;
       //  case '2' : $scope.userInfo.BasicInfo.gender = "女性"; break;
       //  default : $scope.userInfo.BasicInfo.gender = " ";
       // }
       // var temp2 = String($scope.userInfo.BasicInfo.bithday);
       // //console.log($scope.userInfo.BasicInfo.birthday);
       var t = String($scope.userInfo.BasicInfo.birthday);
       //console.log(t);
        $scope.Info = {
          name: $scope.userInfo.BasicInfo.name,
          gender: $scope.userInfo.BasicInfo.gender==1?'男':'女',
          birthday:$scope.userInfo.BasicInfo.birthday,
          id: Storage.get('UID')
        }
        $scope.userInfo.BasicInfo.dateforshow = new Date(1979,0,1);
        if (typeof($scope.userInfo.BasicInfo.birthday) == 'undefined' || $scope.userInfo.BasicInfo.birthday == null || $scope.userInfo.BasicInfo.birthday == 'null') $scope.userInfo.BasicInfo.birthdayforshow = "未设定";
        else {
          $scope.userInfo.BasicInfo.birthdayforshow = t[0] + t[1] + t[2] + t[3]  + '/' + t[4] + t[5] + '/' + t[6] + t[7];

          $scope.userInfo.BasicInfo.dateforshow.setDate(t[6] + t[7])    ;
          $scope.userInfo.BasicInfo.dateforshow.setMonth(t[4] + t[5])   ;
          $scope.userInfo.BasicInfo.dateforshow.setMonth( $scope.userInfo.BasicInfo.dateforshow.getMonth() -1 )   ;
          $scope.userInfo.BasicInfo.dateforshow.setFullYear(t[0] + t[1] + t[2] + t[3])  ;
        }
        // $scope.datepickerObject.inputDate = $scope.userInfo.BasicInfo.dateforshow;
        // console.log( $scope.userInfo.BasicInfo.dateforshow);
        
        // console.log($scope.datepickerObject.inputDate);
         Users.getDocDtlInfo(Storage.get("UID")).then(function(data,headers){
          var temp = data;
          console.log(data);
          $scope.userInfo.DtInfo = {
            unitname: searchObj(temp.UnitName,$scope.dict.UnitName),
            jobTitle: searchObj(temp.JobTitle,$scope.dict.JobTitle),
            level: searchObj(temp.Level,$scope.dict.TitleLevel),
            dept: searchObj(temp.Dept,$scope.dict.Dept),
            photoAddress : temp.PhotoAddress,
            photoAddress_Check : temp.ActivatePhotoAddr  //LRZ1104
          }
            console.log( $scope.userInfo.DtInfo);
            
            $scope.imgURI = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile_Check+'/'+ 
            (($scope.userInfo.DtInfo.photoAddress_Check) == null ?'DefaultAvatar.jpg':$scope.userInfo.DtInfo.photoAddress_Check);//LRZ1104
            // console.log($scope.imgURI);
             // var objStr=JSON.stringify($scope.userInfo);
             // Storage.set("userInfo",objStr); 
             initDatePicker($scope.userInfo.BasicInfo.dateforshow);  
             $scope.loadingDone = true;
       });
     });
  }

   $scope.$watch('$viewContentLoaded', function() {   
        GetHealthCoachInfo( Storage.get("UID") ); //获取专员个人信息
        GetDict(); //获得填写表单
        GetDocInfo(); //获得信息
        // GetCommentList(Storage.get("UID") ,''); //获取专员的2条评论(所有模块)
  }); 


    //restful获取专员个人信息
  var GetHealthCoachInfo= function(HealthCoachID)
   {
     var promise =  Users.GetHealthCoachInfo(HealthCoachID); 
     promise.then(function(data)
     { 
       $scope.HealthCoachInfo = data;
       console.log(data);
       if(($scope.HealthCoachInfo.imageURL=="")||($scope.HealthCoachInfo.imageURL==null)){
            $scope.HealthCoachInfo.imageURL="img/DefaultAvatar.jpg";
          }
        else{ $scope.HealthCoachInfo.imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+$scope.HealthCoachInfo.imageURL;
          }
        $scope.$broadcast('scroll.refreshComplete'); 
      },function(err) {   
    });      
  }
  //填表的预设数据 和需要填写的项目

  var GetDict = function(){
    $scope.dict.SexType = [{"Type":"1","Name":"男性"},{"Type":"2","Name":"女性"},{"Type":"3","Name":"其他"},{"Type":"4","Name":"未知"}];
    // var promise = Users.GetSexType();
    // promise.then(function(data){
    //   $scope.dict.SexType  = data;
    //   console.log(data);
    // },function(err){
    //   // PageFunc.message("获得字典失败");
    // });
    $scope.dict.TitleLevel = [{"Type":"1","Name":"正高"},{"Type":"2","Name":"副高"},{"Type":"3","Name":"中级"},{"Type":"4","Name":"初级"}];
    // var promise2 = Users.GetTitleLevel();
    // promise2.then(function(data){
    //   $scope.dict.TitleLevel  = data;
    //   console.log(data);
    // },function(err){
    //   // PageFunc.message("获得字典失败");
    // });
    $scope.dict.JobTitle = [{"Type":"1","Name":"主任医师"},{"Type":"2","Name":"副主任医师"},{"Type":"3","Name":"主治医师"},{"Type":"4","Name":"住院医师"}];
    // var promise3 = Users.GetJobTitle();
    // promise3.then(function(data){
    //   $scope.dict.JobTitle  = data;
    //   console.log(data);
    // },function(err){
    //   // PageFunc.message("获得字典失败");
    // });    

    $scope.dict.Dept =  [{"Type":"210403","Name":"心内科门诊"},{"Type":"210103","Name":"内分泌科门诊"}];

    $scope.dict.UnitName = [{Name:"海军总医院",Type:"HJZYY"}];


  }
  // date picker -------------------------------
  var datePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      //console.log('No date selected');
    } else {
      // console.log(val);
      $scope.datepickerObject.inputDate = val;      
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var birthday=yyyy+'/'+mm+'/'+dd;
      $scope.userInfo.BasicInfo.birthday= String(yyyy) + (String(mm).length>1?String(mm):('0'+String(mm)))+ (String(dd).length>1?String(dd):('0'+String(dd))) ;
      $scope.userInfo.BasicInfo.birthdayforshow = birthday;
      // console.log($scope.datepickerObject);
      // alert(birthday);
      // alert($scope.userInfo.BasicInfo.birthday);
    }
  };

  // console.log($scope.datepickerObject);

  var initDatePicker = function(v)
  {
    console.log("enter initial date function");
    var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
    var weekDaysList=["日","一","二","三","四","五","六"];
    console.log($scope.datepickerObject);
    console.log(v);
    $scope.datepickerObject = {
      titleLabel: '出生日期',  //Optional
      todayLabel: '今天',  //Optional
      closeLabel: '取消',  //Optional
      setLabel: '设置',  //Optional
      setButtonType : 'button-assertive',  //Optional
      todayButtonType : 'button-assertive',  //Optional
      closeButtonType : 'button-assertive',  //Optional
      inputDate: v,    //Optional
      mondayFirst: false,    //Optional
      // disabledDates: disabledDates, //Optional
      weekDaysList: weekDaysList,   //Optional
      monthList: monthList, //Optional
      templateType:'popup', //Optional
      showTodayButton: 'false', //Optional
      modalHeaderColor: 'bar-positive', //Optional
      modalFooterColor: 'bar-positive', //Optional
      from: new Date(1900, 1, 1),   //Optional
      to: new Date(),    //Optional
      closeOnSelect: false, //Optional
      callback: function (val) {    //Mandatory
        datePickerCallback(val);
      }

    };
    console.log("finish initial date function");       
  }
  // $scope.state = "未提交";
  //填表的预设数据 和需要填写的项目
  // $scope.imgURI = "img/Barot_Bellingham_tn.jpg";
  //the user skip this step put state to unuploaded.
  $scope.onClickSkip = function(){     
      // $scope.state = "未提交";
      // Storage.set(13,$scope.state);
      console.log("broadcasting");
      $rootScope.$broadcast("onClickSkip");
      $state.go('coach.home');
  };

  //the user submit
  $scope.onClickSubmit = function(){
      
      // $scope.state = "审核中";

      $scope.upload($scope.userInfo);
      console.log("broadcasting");
      $rootScope.$broadcast("onClickSubmit");
      // $state.go('coach.i');
  };
  //upload
  $scope.upload = function(info){
    if($scope.userInfo.BasicInfo.name == null || 
      $scope.userInfo.BasicInfo.birthday == null ||
      $scope.userInfo.DtInfo.unitname == null ||
      $scope.userInfo.DtInfo.level == null ||
      $scope.userInfo.DtInfo.jobTitle == null ||
      $scope.userInfo.DtInfo.dept == null 
      ){
      PageFunc.message("有未填信息", 1000, "注意");
      return;
    }
    console.log($scope.userInfo);
    Users.postDoctorInfo($scope.userInfo.BasicInfo).then(function(res){
      //console.log(res);
      if(res.result == "数据插入成功"){
        // if($scope.userInfo.DtInfo.photoAddress_Check != null)
        //   Users.postDoctorDtlInfo_Check($scope.userInfo.DtInfo).then(function(res){
        //   //console.log(res);
        //     if(res.result == "数据插入成功")
        //       $state.go('coach.i');
        //   });
        // else

          Users.postDoctorDtlInfo_Check($scope.userInfo.DtInfo).then(function(res){
            //console.log(res);
              if(res.result == "数据插入成功"){
                 Users.postDoctorDtlInfo_byCode(Storage.get("UID"),"Personal","Description",$scope.HealthCoachInfo.Description).then(function(res){
                  if(res.result == "数据插入成功")  $state.go('coach.home');
                 })
              }
                
            });                  
      }

    });

    // var temp = Camera.uploadPicture($scope.imgURI,Storage.get('UID'));
    // var temp2 = Camera.uploadPicture2($scope.imgURI);
    
  };
    //-----------------------------------------------------------

  $scope.onClickCamera = function(){
  
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
   // $timeout(function() {
   //   hideSheet();
   // }, 2000);
  }; 
  $scope.takePicture = function() {
   Camera.getPicture().then(function(data) {
      $timeout(function(){
        // PageFunc.confirm("是否上传","确认").then(function(res){
        //   if(res){
            $scope.isEdited = true;
            var d = new Date();
            var temp = d.getTime();
            var filename = Storage.get('UID')+'_'+String(temp)+'.jpg';
            Camera.uploadPicture_Check(data,filename).then(function(r){
              if(r.res){
                $scope.userInfo.DtInfo.photoAddress_Check = filename;
                $scope.imgURI = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile_Check+'/'+ $scope.userInfo.DtInfo.photoAddress_Check;
                Users.postDoctorDtlInfo_Single(Storage.get('UID'),9,$scope.userInfo.DtInfo.photoAddress_Check);
                // Storage.set('doctorphoto',$scope.imgURI);
                PageFunc.message("上传成功"+Storage.get("UID"),1000,"确认")
              }
              else  PageFunc.message("上传失败"+Storage.get("UID"),1000,"确认")             
            });
        //    } 
        // })
      },2000);
    }, function(err) {
      PageFunc.message("上传失败", 1000, "消息");
    });   
  };
  
  $scope.choosePhotos = function() {
   Camera.getPictureFromPhotos().then(function(data) {
      $timeout(function(){
        // PageFunc.confirm("是否上传","确认").then(function(res){
        //   if(res){
            $scope.isEdited = true;
            var d = new Date();
            var temp = d.getTime();
            var filename = Storage.get('UID')+'_'+String(temp)+'.jpg';
            Camera.uploadPicture_Check(data,filename).then(function(r){
              if(r.res){
                $scope.userInfo.DtInfo.photoAddress_Check = filename;
                $scope.imgURI = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile_Check+'/'+ $scope.userInfo.DtInfo.photoAddress_Check;
                Users.postDoctorDtlInfo_Single(Storage.get('UID'),9,$scope.userInfo.DtInfo.photoAddress_Check);
                // Storage.set('doctorphoto',$scope.imgURI);
                PageFunc.message("上传成功"+Storage.get("UID"),1000,"确认")
              }
              else  PageFunc.message("上传失败"+Storage.get("UID"),1000,"确认")             
            });
        //    } 
        // })
      },2000);
    }, function(err) {
      PageFunc.message("上传失败", 1000, "消息");
    });   
  }

}])


// Coach HomePage/Me Controller 主页的controller 主要负责从home状态跳转到 其他三个状态/读取localstorage的数据
// ----------------------------------------------------------------------------------------
.controller('CoachHomeCtrl', 
  ['$scope','$state','$stateParams','$cordovaBarcodeScanner','$ionicPopup','userINFO','Storage','Users','CONFIG','$timeout','$ionicLoading',
  function($scope,$state,$stateParams,$cordovaBarcodeScanner,$ionicPopup,userINFO,Storage,Users,CONFIG,$timeout,$ionicLoading) { //LRZ
   
   // //console.log($stateParams.info);
   // //console.log($stateParams.info.intro);
   // $scope.items = $stateParams.info;
   // $scope.state = $stateParams.state;
  $scope.$watch('$viewContentLoaded', function() {   
        GetHealthCoachInfo( Storage.get("UID") ); //获取专员个人信息
        GetCommentList(Storage.get("UID") ,''); //获取专员的2条评论(所有模块)
  }); 


    //restful获取专员个人信息
  var GetHealthCoachInfo= function(HealthCoachID)
   {
     var promise =  Users.GetHealthCoachInfo(HealthCoachID); 
     promise.then(function(data)
     { 
       $scope.HealthCoachInfo = data;
       console.log(data);
       if(($scope.HealthCoachInfo.imageURL=="")||($scope.HealthCoachInfo.imageURL==null)){
            $scope.HealthCoachInfo.imageURL="img/DefaultAvatar.jpg";
          }
        else{ $scope.HealthCoachInfo.imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+$scope.HealthCoachInfo.imageURL;
          }
        $scope.$broadcast('scroll.refreshComplete'); 
      },function(err) {   
    });      
  }

      //restful获取专员评论列表
      var GetCommentList= function(DoctorId ,CategoryCode)
       {
         var promise =  Users.GetCommentList(DoctorId, CategoryCode, 2); 
         promise.then(function(data)
        { 
          $scope.CommentList=data;
          for(i=0;i<$scope.CommentList.length;i++){
           if(($scope.CommentList[i].imageURL=="")||($scope.CommentList[i].imageURL==null)){
                  $scope.CommentList[i].imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+"non.jpg";
                }
            else{ 
                  $scope.CommentList[i].imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+$scope.CommentList[i].imageURL;
                }
           }
         },function(err) {   
        });      
      }
   //应该从服务器获得，此处写死
   $scope.state = '未提交';
   // $scope.name = Storage.get(131);
   // $scope.company = Storage.get(132);
   // $scope.position = Storage.get(133);
   // $scope.selfintro = Storage.get(134);
   // $scope.imgURI = Storage.get(14);
   // //console.log($scope.infom);

   //从服务器获得用户信息 
   $scope.userInfo = {BasicInfo:{},DtInfo:{}};


   Users.getDocInfo(Storage.get("UID")).then(function(data,headers){
      var temp = data;
      // //console.log(data);
      $scope.userInfo.BasicInfo = {
       name:((typeof(temp.DoctorName) == 'undefined' || temp.DoctorName == "null" || temp.DoctorName == null ) ? '请填写姓名': temp.DoctorName),
       gender:temp.Gender==1?'男':'女',
       birthday:temp.Birthday,
       id:temp.DoctorId,
       idno:temp.IDNo
     }
   });

   Users.getDocDtlInfo(Storage.get("UID")).then(function(data,headers){
      var temp = data;
      // //console.log(data);
      $scope.userInfo.DtInfo = {
        unitname: ((typeof(temp.UnitName) == 'undefined' ||temp.UnitName == "null" || temp.UnitName == null ) ? '请填写单位': temp.UnitName),
        jobTitle: ((typeof(temp.JobTitle) == 'undefined' ||temp.JobTitle == "null" || temp.JobTitle == null ) ? '请填写职位': temp.JobTitle),
        level: ((typeof(temp.Level) == 'undefined' ||temp.Level == "null" || temp.Level == null ) ? '请填写职级': temp.Level),
        dept: ((typeof(temp.Dept) == 'undefined' ||temp.Dept == "null" || temp.Dept == null ) ? '请填写科室': temp.Dept),
       photoAddress : temp.PhotoAddress
     }
     // //console.log( $scope.userInfo.DtInfo.photoAddress);
     // $scope.imgURI = $scope.userInfo.DtInfo.photoAddress;
      if(typeof($scope.userInfo.DtInfo.photoAddress) == 'undefined' || $scope.userInfo.DtInfo.photoAddress == "null" || $scope.userInfo.DtInfo.photoAddress == null)
       $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+'non.jpg';
      else $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ $scope.userInfo.DtInfo.photoAddress;

      Storage.set('doctorphoto',$scope.imgURI);
   });
   // var doRefresh = function(){};
   // $timeout(doRefresh(),500);

   var doRefresh = function(){
      $scope.userInfo = {BasicInfo:{},DtInfo:{}};
     Users.getDocInfo(Storage.get("UID")).then(function(data,headers){
        var temp = data;
        // //console.log(data);
        $scope.userInfo.BasicInfo = {
         name:temp.DoctorName ,
         gender:temp.Gender==1?'男':'女',
         birthday:temp.Birthday,
         id:temp.DoctorId,
         idno:temp.IDNo
       }
     });
     
     Users.getDocDtlInfo(Storage.get("UID")).then(function(data,headers){
        var temp = data;
        // //console.log(data);
        $scope.userInfo.DtInfo = {
          unitname: temp.UnitName,
          jobTitle: temp.JobTitle,
          level: temp.Level,
          dept: temp.Dept,
          photoAddress : temp.PhotoAddress
       }
       //console.log( $scope.userInfo.DtInfo.photoAddress);
        if(typeof($scope.userInfo.DtInfo.photoAddress) == 'undefined')
         $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+'non.jpg';
        else $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ $scope.userInfo.DtInfo.photoAddress;
        Storage.set('doctorphoto',$scope.imgURI);
     });
     
  }

  $scope.onClickTest = function(){
    //console.log("yeah");
    doRefresh();
  }
  $scope.onClickPersonalInfo = function(){
      $state.go('personalinfo');
  };

  $scope.onClickPersonalConfig = function(){
      $state.go('config');
  };

  $scope.onClickPersonalSchedule = function(){
      $state.go('schedule');
  };

  $scope.addpatient = function(){
      Storage.set("isManage","No");
      $state.go('addpatient.newpatient');
  }
  $scope.onClickCheck = function(){
    //console.log("yeah");
    $state.go('upload');
  }
  $scope.$on('onClickSkip',function(){
    console.log("接受到了跳过广播");
    if($scope.state != "待审核" && $scope.state != "已通过" ) $scope.state = "未提交";
  }) 

  $scope.$on('onClickSubmit',function(){
    console.log("接受到了提交广播");
    if($scope.state != "已通过" ) $scope.state = "待审核";
  })     
 $scope.QRscan = function(){
    var DOCID=Storage.get('UID');
    var isMyPID=0;
    var setData =function(thisPatient){
      Storage.set("PatientID",thisPatient.PatientId);     
      Storage.set("PatientPhotoAddress",thisPatient.photoAddress);
      Storage.set("PatientName",thisPatient.PatientName);
      if(thisPatient.photoAddress=='' || thisPatient.photoAddress==null){    
        thisPatient.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/' +'non.jpg';
      }else{
        thisPatient.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ thisPatient.photoAddress;
      }
      userINFO.BasicInfo(thisPatient.PatientId).then(function(data){
        Storage.set('PatientAge',data.Age+'岁');
        Storage.set('PatientGender',data.GenderText);
        $state.go('manage.plan');
      },function(data){
        // fail请求数据
      });
    }
    $cordovaBarcodeScanner
    .scan()
    .then(function(data) {
      // Success! Barcode data is here
      // var s = "Result: " + data.text + "<br/>" +
      // "Format: " + data.format + "<br/>" +
      // "Cancelled: " + data.cancelled;
      if(data.cancelled!=true){
        $ionicLoading.show({ template: '正在查询'});
        var newpid=data.text
        var tempf="PatientId eq '"+newpid+"'";
        userINFO.GetPatientsList(1000,0,'PatientName',tempf,DOCID,'HM1','0','0')
        .then(function(data){
          if(data.length==1){
            setData(data[0]);
          }else{
            userINFO.GetPatientsList(1000,0,'PatientName',tempf,DOCID,'HM2','0','0')
            .then(function(data){
              if(data.length==1){
                setData(data[0]);
              }else{
                userINFO.GetPatientsList(1000,0,'PatientName',tempf,DOCID,'HM3','0','0')
                .then(function(data){
                  $ionicLoading.hide();
                  if(data.length==1){
                    setData(data[0]);
                  }else{
                    var myPopup = $ionicPopup.show({
                    template: '<center>该用户不在患者列表中，是否创建新患者？</center>',
                    //title: '',
                    //subTitle: '2',
                    scope: $scope,
                    buttons: [
                      { text: '取消',
                      type: 'button-small',
                      onTap: function(e) {                
                      }
                      },
                      {
                      text: '<b>确定</b>',
                      type: 'button-small button-positive ',
                      onTap: function(e) {
                        Storage.set("newPatientID",newpid);
                        $state.go('addpatient.basicinfo');
                      }
                      }
                    ]
                    });
                  }                  
                },function(){
                  $ionicLoading.hide();
                  alert('网络问题');
                  // fail请求数据
                });
              }
            },function(data){
              $ionicLoading.hide();
              alert('网络问题');
              // fail请求数据
            });            
          }
        },function(data){
          $ionicLoading.hide();
          alert('网络问题');
          // fail请求数据
        });
      }
    }, function(error) {
      alert('扫码FAILED');
    });
  }      
}])



//专员的评价列表
.controller('CoachCommentListCtrl',['$scope', '$ionicHistory', '$ionicSideMenuDelegate','Users','Storage', 'CONFIG', '$ionicScrollDelegate', '$ionicLoading', '$ionicPopover',
   function($scope, $ionicHistory, $ionicSideMenuDelegate, Users, Storage, CONFIG, $ionicScrollDelegate, $ionicLoading, $ionicPopover) {
    
      $scope.setting={selectedModoule:" "}; //默认加载全部模块
      $scope.scrollToTop=false; //“回到顶部按钮”初始隐藏
      $scope.CommentList = new Array();
      $scope.moreComment=false;  //上拉加载更多，没有更多数据标志
      $scope.alertText='正在努力加载中...';

      //回到顶部函数
      $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop();
      };

    //滚动时获取滚动长度，超出某长度则显示“回到顶部按钮”
     $scope.getScrollPosition = function() {
        $scope.moveData = $ionicScrollDelegate.getScrollPosition().top;
       
        if($scope.moveData>=100){
            $scope.scrollToTop=true;
         }else if($scope.moveData<100){
           $scope.scrollToTop=false;
         }
      };

      //后退
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
       }

      //下拉刷新评论
      $scope.refreshComment = function() {
         $scope.CommentList=new Array();
         //$scope.alertText='正在努力加载中...';
         $scope.moreComment=false;
         GetCommentList(Storage.get("UID"),  $scope.setting.selectedModoule, 10, 0);
       }

      //上啦加载更多评论
       $scope.loadMoreComment = function () {
           //console.log(333);
           GetCommentList(Storage.get("UID"),  $scope.setting.selectedModoule, 5, $scope.CommentList.length);    
        }

      //restful获取评论列表
      var GetCommentList= function(DoctorId ,CategoryCode,num, skip)
       {
           $scope.alertText='正在努力加载中...';
           var promise =  Users.GetCommentList(DoctorId ,CategoryCode, num, skip); 
           promise.then(function(data)
          { 
            for(var i=0;i<data.length;i++){
              if((data[i].imageURL=="")||(data[i].imageURL==null)){
                    data[i].imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+"non.jpg";
                  }
              else
              { 
                  data[i].imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+data[i].imageURL;
              }
              $scope.CommentList.push(data[i]);
            }

            //本次获取的数量少于num，则说明没有更多数据了
            if(data.length < num){
                $scope.moreComment=false;
                      $scope.alertText='没有更多数据...';
                $ionicLoading.show({
                  template: '没有更多数据',
                  noBackdrop: false,
                  duration: 1000,
                  hideOnStateChange: true
                });
            }
            else
            {
               $scope.moreComment=true;
            }

            },function(err) {   
          }).finally(function () {
              $scope.$broadcast('scroll.refreshComplete');
              $scope.$broadcast('scroll.infiniteScrollComplete');
          });     
       }

      //初始化
      GetCommentList(Storage.get("UID"), '', 10, 0);
      //筛选
      $ionicPopover.fromTemplateUrl('templates/popover-sort.html', {
          scope: $scope,
        }).then(function(popover) {
          $scope.popover = popover;
      });
       
      $scope.modouleList = [
        { text: "全部", value: " " },
        { text: "高血压", value: "HM1" },
        { text: "糖尿病", value: "HM2"},
        { text: "心衰", value: "HM3" },
      ];

      $scope.filterModoule= function(){
        $scope.CommentList=new Array();
        //$scope.alertText='正在努力加载中...';
        GetCommentList(Storage.get("UID"), $scope.setting.selectedModoule, 10, 0); 
        $scope.popover.hide();
      };
}])
// Coach Personal Config Controller 个人设置页面的controller  
// ----------------------------------------------------------------------------------------
.controller('CoachPersonalConfigCtrl', ['$scope','$state','$ionicHistory','$ionicPopup','$timeout' ,'Storage',function($scope,$state,$ionicHistory,$ionicPopup,$timeout,Storage) { //LRZ
  $scope.onClickBackward = function(){
      $state.go('coach.home');
  };

  $scope.onClickChangePassword = function(){
    $state.go('changepassword');
  }
  $scope.onClickSignOut = function(){
    var myPopup = $ionicPopup.show({
      template: '<center>确定要退出登录吗?</center>',
      title: '退出',
      //subTitle: '2',
      scope: $scope,
      buttons: [
        { text: '取消',
          type: 'button-small',
          onTap: function(e) {
            
          }
        },
        {
          text: '<b>确定</b>',
          type: 'button-small button-positive ',
          onTap: function(e) {
              var USERNAME=Storage.get('USERNAME');
              Storage.clear();
              Storage.set('USERNAME',USERNAME);
              $timeout(function(){
              $ionicHistory.clearHistory();
              $ionicHistory.clearCache();
              $state.go('signin');
              },100);
              
          }
        }
      ]
    });
  }  
}])
// Coach Personal Infomation Controller 20151112
// ----------------------------------------------------------------------------------------
.controller('CoachPersonalInfoCtrl', ['$scope','$state','$ionicHistory','Storage','PageFunc','Users','$ionicActionSheet','Camera','CONFIG','$timeout','$rootScope',
  function($scope,$state,$ionicHistory,Storage,PageFunc,Users,$ionicActionSheet,Camera,CONFIG,$timeout,$rootScope) {
   //获得信息
   // $scope.userInfo = JSON.parse(Storage.get("userInfo"));
   // Storage.set('UID','DOC201506180002');

   $scope.userInfo = {BasicInfo:{},DtInfo:{}};
   $scope.loadingDone = false;
   $scope.dict = {};
   $scope.$watch('$viewContentLoaded', function() {   
        GetHealthCoachInfo( Storage.get("UID") ); //获取专员个人信息
        // GetCommentList(Storage.get("UID") ,''); //获取专员的2条评论(所有模块)
        GetDict();
        GetDocInfo();
  }); 
  
  //从字典中搜索选中的对象。
  var searchObj = function(code,array){
      for (var i = 0; i < array.length; i++) {
        if(array[i].Type == code) return array[i];
      };
      return "未填写";
  }

    //restful获取专员个人信息
  var GetHealthCoachInfo= function(HealthCoachID)
   {
     var promise =  Users.GetHealthCoachInfo(HealthCoachID); 
     promise.then(function(data)
     { 
       $scope.HealthCoachInfo = data;
       console.log(data);
       if(($scope.HealthCoachInfo.imageURL=="")||($scope.HealthCoachInfo.imageURL==null)){
            $scope.HealthCoachInfo.imageURL="img/DefaultAvatar.jpg";
          }
        else{ $scope.HealthCoachInfo.imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+$scope.HealthCoachInfo.imageURL;
          }
        $scope.$broadcast('scroll.refreshComplete'); 
      },function(err) {   
    });      
  }

  var GetDocInfo = function(){
      Users.getDocInfo(Storage.get("UID")).then(function(data,headers){
      var temp = data;
      console.log(data.gender);
      console.log($scope.dict.SexType);
      $scope.userInfo.BasicInfo = {
       name:temp.DoctorName ,
       gender:searchObj(temp.Gender,$scope.dict.SexType),
       birthday:temp.Birthday,
       id:temp.DoctorId,
       idno:temp.IDNo
     }

      // switch(temp.Gender){
      //   case '1' : $scope.userInfo.BasicInfo.gender = "男"; break;
      //   case '2' : $scope.userInfo.BasicInfo.gender = "女"; break;
      //   default : $scope.userInfo.BasicInfo.gender = " "
      //  }
     // var temp2 = String($scope.userInfo.BasicInfo.bithday);
     // //console.log($scope.userInfo.BasicInfo.birthday);
     var t = String($scope.userInfo.BasicInfo.birthday);
     //console.log(t);
      $scope.userInfo.BasicInfo.dateforshow = new Date(1979,0,1);
      if (typeof($scope.userInfo.BasicInfo.birthday) == 'undefined' || $scope.userInfo.BasicInfo.birthday == null || $scope.userInfo.BasicInfo.birthday == 'null') $scope.userInfo.BasicInfo.birthdayforshow = "未填写生日";
      else {
        $scope.userInfo.BasicInfo.birthdayforshow = t[0] + t[1] + t[2] + t[3]  + '/' + t[4] + t[5] + '/' + t[6] + t[7];

        $scope.userInfo.BasicInfo.dateforshow.setDate(t[6] + t[7])    ;
        $scope.userInfo.BasicInfo.dateforshow.setMonth(t[4] + t[5])   ;
        $scope.userInfo.BasicInfo.dateforshow.setMonth( $scope.userInfo.BasicInfo.dateforshow.getMonth() -1 )   ;
        $scope.userInfo.BasicInfo.dateforshow.setFullYear(t[0] + t[1] + t[2] + t[3])  ;
      }
       Users.getDocDtlInfo(Storage.get("UID")).then(function(data,headers){
        var temp = data;
        // console.log(data);
        $scope.userInfo.DtInfo = {
          unitname: searchObj(temp.UnitName,$scope.dict.UnitName),
          jobTitle: searchObj(temp.JobTitle,$scope.dict.JobTitle),
          level:  searchObj(temp.Level,$scope.dict.TitleLevel),
          dept:  searchObj(temp.Dept,$scope.dict.Dept),
          photoAddress : temp.PhotoAddress
        }
       // PageFunc.message(JSON.stringify($scope.userInfo.DtInfo),100000,Storage.get("UID"));
        console.log($scope.userInfo);
        if(typeof($scope.userInfo.DtInfo.photoAddress) == 'undefined' || $scope.userInfo.DtInfo.photoAddress == "null" || $scope.userInfo.DtInfo.photoAddress == null)
         $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+'non.jpg';
        else $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ $scope.userInfo.DtInfo.photoAddress;
        // $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+'non.jpg';
        Storage.set('doctorphoto',$scope.imgURI);
        initialDatePicker($scope.userInfo.BasicInfo.dateforshow);
        $scope.loadingDone = true;
           // var objStr=JSON.stringify($scope.userInfo);
           // Storage.set("userInfo",objStr);
       });
     });
  }

  //填表的预设数据 和需要填写的项目

  var GetDict = function(){
    $scope.dict.SexType = [{"Type":"1","Name":"男性"},{"Type":"2","Name":"女性"},{"Type":"3","Name":"其他"},{"Type":"4","Name":"未知"}];
    // var promise = Users.GetSexType();
    // promise.then(function(data){
    //   $scope.dict.SexType  = data;
    //   console.log(data);
    // },function(err){
    //   // PageFunc.message("获得字典失败");
    // });
    $scope.dict.TitleLevel = [{"Type":"1","Name":"正高"},{"Type":"2","Name":"副高"},{"Type":"3","Name":"中级"},{"Type":"4","Name":"初级"}];
    // var promise2 = Users.GetTitleLevel();
    // promise2.then(function(data){
    //   $scope.dict.TitleLevel  = data;
    //   console.log(data);
    // },function(err){
    //   // PageFunc.message("获得字典失败");
    // });
    $scope.dict.JobTitle = [{"Type":"1","Name":"主任医师"},{"Type":"2","Name":"副主任医师"},{"Type":"3","Name":"主治医师"},{"Type":"4","Name":"住院医师"}];
    // var promise3 = Users.GetJobTitle();
    // promise3.then(function(data){
    //   $scope.dict.JobTitle  = data;
    //   console.log(data);
    // },function(err){
    //   // PageFunc.message("获得字典失败");
    // });    

    $scope.dict.Dept =  [{"Type":"210403","Name":"心内科门诊"},{"Type":"210103","Name":"内分泌科门诊"}];

    $scope.dict.UnitName = [{Name:"海军总医院",Type:"HJZYY"}];


  }  

   


   // $scope.imgURIback = $scope.imgURI;

  // date picker -------------------------------
  var datePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      //console.log('No date selected');
    } else {
      $scope.datepickerObject.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var birthday=yyyy+'/'+mm+'/'+dd;
      $scope.userInfo.BasicInfo.birthday= String(yyyy) + (String(mm).length>1?String(mm):('0'+String(mm)))+ (String(dd).length>1?String(dd):('0'+String(dd))) ;
      $scope.userInfo.BasicInfo.birthdayforshow = birthday;
      // alert($scope.userInfo.BasicInfo.birthday);
    }
  };

  var initialDatePicker = function(v){
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
        inputDate: v,    //Optional
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
  }

  $scope.onClickBackward = function(){
    if($scope.isEdited == true)
      PageFunc.confirm("是否放弃修改","确认").then( 
        function(res){
          if(res){
           // //console.log("点了queren");
           //复原备份
           // //console.log($scope.backup);
           $scope.userInfo = JSON.parse(Storage.get("userInfo"));
           //console.log($scope.userInfo);
           $state.go('coach.home');
          }
        });
    else{
          $scope.userInfo = JSON.parse(Storage.get("userInfo"));
          $state.go('coach.home'); 
      }  

  };



  $scope.test = function(){
    
  }
  //点击保存上传更新
  $scope.onClickSave = function(){
    PageFunc.confirm("是否上传新信息","确认").then( 
        function(res){
          if(res){
           // //console.log("点了queren");
              // 这两个service里面还没有写好 
              // ----------------------------------------------------------
              var objStr=JSON.stringify($scope.userInfo);
              Storage.set("userInfo",objStr);
              Users.postDoctorInfo($scope.userInfo.BasicInfo).then(function(res){
                //console.log(res);
                if(res.result == "数据插入成功"){
                  Users.postDoctorDtlInfo_Check($scope.userInfo.DtInfo).then(function(res){
                  //console.log(res);
                  if(res.result == "数据插入成功"){
                      Users.postDoctorDtlInfo_byCode(Storage.get("UID"),"Personal","Description",$scope.HealthCoachInfo.Description).then(function(res){
                            if(res.result == "数据插入成功") {
                                $rootScope.$broadcast("onClickSubmit");
                                $state.go('coach.home');
                            }                 
                      })

                  }

                  });                  
                }

              });
              
              
          }
          else{
            // $scope.imgURI = $scope.imgURIback;
            // $scope.userInfo = Storage.get('userinfo');
          }
        });    
  };
  // 更改头像
  $scope.onClickChangeHead = function(){  
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
   // $timeout(function() {
   //   hideSheet();
   // }, 2000);
  };
  //拍照
  $scope.takePicture = function() {
     Camera.getPicture().then(function(data) {
        $timeout(function(){
          // PageFunc.confirm("是否上传","确认").then(function(res){
          //   if(res){
              $scope.isEdited = true;
              var d = new Date();
              var temp = d.getTime();
              var filename = Storage.get('UID')+'_'+String(temp)+'.jpg';
              Camera.uploadPicture(data,filename).then(function(r){
                if(r.res){
                  $scope.userInfo.DtInfo.photoAddress = filename;
                  $scope.imgURI = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+ $scope.userInfo.DtInfo.photoAddress;
                  Users.postDoctorDtlInfo_Single(Storage.get('UID'),4,$scope.userInfo.DtInfo.photoAddress);
                  Storage.set('doctorphoto',$scope.imgURI);
                  PageFunc.message("上传成功"+Storage.get("UID"),1000,"确认")
                }
                else  PageFunc.message("上传失败"+Storage.get("UID"),1000,"确认")             
              });
          //    } 
          // })
        },2000);
      }, function(err) {
        PageFunc.message("上传失败", 1000, "消息");
      });
  };

  //选择相册
  $scope.choosePhotos = function() {
   Camera.getPictureFromPhotos().then(function(data) {
      $timeout(function(){
        // PageFunc.confirm("是否上传","确认").then(function(res){
        //   if(res){
            $scope.isEdited = true;
            var d = new Date();
            var temp = d.getTime();
            var filename = Storage.get('UID')+'_'+String(temp)+'.jpg';
            Camera.uploadPicture(data,filename).then(function(r){
              if(r.res){
                $scope.userInfo.DtInfo.photoAddress = filename;
                $scope.imgURI = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+ $scope.userInfo.DtInfo.photoAddress;
                Users.postDoctorDtlInfo_Single(Storage.get('UID'),4,$scope.userInfo.DtInfo.photoAddress);
                Storage.set('doctorphoto',$scope.imgURI);
                PageFunc.message("上传成功"+Storage.get("UID"),1000,"确认")
              }
              else  PageFunc.message("上传失败"+Storage.get("UID"),1000,"确认")             
            });
        //    } 
        // })
      },2000);
    }, function(err) {
      PageFunc.message("上传失败", 1000, "消息");
    });
  }  
  //更改姓名
  $scope.onClickEditName = function(){
    PageFunc.edit("姓名","修改").then(function(res){
      if(res){
        $scope.isEdited = true;
        $scope.userInfo.BasicInfo.name = res;
      }
      else{
        $scope.isEdited = false;
      }
    });
  };
  //更改性别
  $scope.onClickEditGender = function(){
    var results = ['男','女'];
    $scope.selection = {  
      inces: results
    };
    $scope.ince = {  // <select>默认值
      selected: results[0]
    };
    PageFunc.selection('<select ng-options="_ince for _ince in selection.inces" ng-model="ince.selected"></select>', '请选择性别', 'ince', $scope).then(function (res) {  // 传入模板, 标题, 返回值, $scope
      if(res){
        
        $scope.userInfo.BasicInfo.gender = res;
      }
      else{
        $scope.isEdited = false;
      }
    });    
  };
  //更改单位
  $scope.onClickEditUnitName = function(){
    var results = ["海军总医院","浙医二院","浙医一院"];
    $scope.selection = {  
      inces: results
    };
    $scope.ince = {  // <select>默认值
      selected: results[0]
    };
    PageFunc.selection('<select ng-options="_ince for _ince in selection.inces" ng-model="ince.selected"></select>', '请选择工作单位', 'ince', $scope).then(function (res) {  // 传入模板, 标题, 返回值, $scope
      if(res){
        
        $scope.userInfo.DtInfo.unitname = res;
      }
      else{
        $scope.isEdited = false;
      }
    }); 
  };
  //更改职称
  $scope.onClickEditJobTitle = function(){
    var results = ["医士","住院医师","主治医师","副主任医师","主任医师"];
    $scope.selection = {  
      inces: results
    };
    $scope.ince = {  // <select>默认值
      selected: results[0]
    };
    PageFunc.selection('<select ng-options="_ince for _ince in selection.inces" ng-model="ince.selected"></select>', '请选择职务', 'ince', $scope).then(function (res) {  // 传入模板, 标题, 返回值, $scope
      if(res){
        
        $scope.userInfo.DtInfo.jobTitle = res;
      }
      else{
        $scope.isEdited = false;
      }
    }); 
  };
  //更改级别
  $scope.onClickEditLevel = function(){
    var results = ["正高","副高","中级","初级"];
    $scope.selection = {  
      inces: results
    };
    $scope.ince = {  // <select>默认值
      selected: results[0]
    };
    PageFunc.selection('<select ng-options="_ince for _ince in selection.inces" ng-model="ince.selected"></select>', '请选择级别', 'ince', $scope).then(function (res) {  // 传入模板, 标题, 返回值, $scope
      if(res){
        
        $scope.userInfo.DtInfo.level = res;
      }
      else{
        $scope.isEdited = false;
      }
    }); 
  };
  //更改科室
  $scope.onClickEditDept = function(){
    var results = [{no:'210403',dept:'心内科门诊'},{no:'210103',dept:"内分泌科"}];
    $scope.selection = {  
      inces: results
    };
    $scope.ince = {  // <select>默认值
      selected: results[0]
    };
    PageFunc.selection('<select ng-options="_ince.dept for _ince in selection.inces" ng-model="ince.selected"></select>', '请选择科室', 'ince', $scope).then(function (res) {  // 传入模板, 标题, 返回值, $scope
      if(res){
        $scope.userInfo.DtInfo.deptNO = res.no
        $scope.userInfo.DtInfo.dept = res.dept;
      }
      else{
        $scope.isEdited = false;
      }
    }); 
  };


}])
//lrz20151124
// Coach Personal Schedule Controller 个人日程页面 主要负责 
// ----------------------------------------------------------------------------------------
.controller('CoachScheduleCtrl', ['$scope','$state','$ionicHistory','$http','ScheduleService','$ionicLoading','$timeout','$ionicModal',
  function($scope,$state,$ionicHistory,$http,ScheduleService,$ionicLoading,$timeout,$ionicModal) { //LRZ
  $scope.loadingDone = false;
  

  ScheduleService.initialize();

  $scope.data = {calendar : [],selectedDate: undefined, selectedTime:undefined};

  // $scope.eventSources = [];
  $scope.events = [];
  $scope.tempDate = new Date();

  $scope.datesOptions = [];
  $ionicLoading.show({
    content: '加载中',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $timeout(function(){
    $ionicLoading.hide();
  },6666);

  var initializeCalendar = function(){


    $scope.eventSources = [$scope.events];
    $scope.uiConfig = ScheduleService.getConfig();
  }

  //  $scope.uiConfig = {
  //     calendar:{
  //       header: {
  //         left: 'prev,next today',
  //         center: 'title',
  //         right: 'month,agendaWeek,agendaDay'
  //       },
  //       height: 500,
  //       lang: 'zh-cn',
  //       scrollTime: '10:00:00',
  //       buttonIcons: false, 
  //       weekNumbers: false,
  //       editable: false,
  //       eventLimit: true
  //     }
  //   };

  // $scope.eventSources = [$scope.events];

  // $http.get('js/data.json').success(function(data) {
  //   $scope.calendar = data.calendar; 
  //   // $scope.whichartist= $state.params.aId;
  //   // //console.log($scope.whichartist);
  //   $scope.data = { showDelete: false, showReorder: false };

  // $scope.onItemDelete = function(dayIndex,item) {
  //   // $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item), 1);
  //   $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item), 1);
  // }

  // $scope.toggleStar = function(item) {
  //  item.star = !item.star;
  // }


  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {


    // console.log(dates);
    $scope.datesOptions = ScheduleService.getDates();

    $scope.modal.show();
    $scope.loadingDone2 = true;
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
    // $scope.loadingDone2 = false;
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
  
  $scope.onClickTest = function(){


      // $scope.events.push({
      //   title: '吃个豕',
      //   start: new Date(2015, 10, 29),
      //   end: new Date(2015, 10, 30),
      //   stick: true
      // });

      // console.log($scope.events);

      // try{
      //   $scope.calendar.fullCalendar('refetchEvents');
      // }
      // catch(err)
      // {
      //   console.log(err);
      // }

    // GET Api/v1/Users/Calendar?DoctorId={DoctorId}
    // console.log($scope.data.calendar);
    // ScheduleService.postCalendar();

    $scope.openModal();


    // for (var i = $scope.data.calendar.length - 1; i >= 0; i--) {
    //   console.log($scope.data.calendar[i]);
    // };

    // $scope.tempDate.setDate($scope.tempDate.getDate()+1); 
    // console.log($scope.tempDate )
  }
  $scope.onClickCancel = function(){
    $scope.closeModal();
  }
  $scope.onClickAdd = function(){
      console.log($scope.data);
      $scope.closeModal();
  }
  $scope.onClickBackward = function(){
     $ionicHistory.goBack();
  }
  $scope.onClickRefresh =function(){
    ScheduleService.initialize(); 
      $ionicLoading.show({
    content: '加载中',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

      $timeout(function(){
        $ionicLoading.hide();
      },2500);
  }
  $scope.$on('GotCanlendar',function(){
  // $scope.loadingDone = false;
    $scope.events.length = 0;
    $scope.events = ScheduleService.getEvents();
    $scope.today = ScheduleService.getTodayProgress();
    if($scope.loadingDone == false){
      initializeCalendar();
      $scope.loadingDone = true;      
    }
    else{
      while($scope.eventSources.length > 0){
        $scope.eventSources.pop();
      }

      $scope.eventSources.push($scope.events);
      try{
          $scope.calendar.fullCalendar('refetchEvents');
      }
      catch(err){
      console.log("日历刷新");
       }
    }


    // try{
    //       $scope.calendar.fullCalendar('refetchEvents');
    // }
    // catch(err){
    //   console.log("日历刷新");
    // }
    // else $scope.eventSources = [$scope.events];

    // for (var i = $scope.data.calendar.length - 1; i >= 0; i--) {

    //   console.log($scope.data.calendar[i]);

    // };

    $ionicLoading.hide();
  })

  $scope.$on('newCanlendar',function(){
    console.log("newCanlendar------------broadcast aquired");
    ScheduleService.initialize();
    // console.log($scope.data.calendar);
  })

}])
//lrz20151125
.controller('CoachScheduleDtlCtrl',['$scope','$state','$stateParams','ScheduleService','$ionicModal','$timeout','PageFunc',function($scope,$state,$stateParams,ScheduleService,$ionicModal,$timeout,PageFunc){
  
  // url: '/schedule/:date/:period/:num',

  $scope.params = {SortNo:$stateParams.num,Date:$stateParams.date,Period:$stateParams.period};

  $scope.event = ScheduleService.getEventByParams($scope.params);

  $scope.eventdetail = $scope.event.Description.split("||",4);
  console.log($scope.event);
  console.log($scope.eventdetail);
  for (var i = $scope.eventdetail.length - 1; i >= 0; i--) {
   
    if(typeof($scope.eventdetail[i]) === 'undefined' || $scope.eventdetail[i] =="" )  {
      // console.log($scope.eventdetail);
      // $scope.eventdetail.splice($scope.eventdetail.indexOf($scope.eventdetail[i]),1);      
    }

  };
  

  var deepCopy = function(source) { 
      var result={};
      for (var key in source) {
            result[key] = typeof source[key]==='object'? deepCoyp(source[key]): source[key];
         } 
         return result; 
  }
  var eventB = deepCopy($scope.event);
  //
  var datePickerCallback = function (val) {
      if (typeof(val) === 'undefined') {
        console.log('No date selected');
      } else {
      $scope.datepickerObject.inputDate=val;
        var dd=val.getDate();
        var mm=val.getMonth()+1;
        var yyyy=val.getFullYear();
        var birthday=yyyy+'/'+mm+'/'+dd; 
        $scope.event.DateTime=birthday;
      }
  };

  var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  var weekDaysList=["日","一","二","三","四","五","六"];
  var tt = new Date();
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
    from: new Date(),   //Optional
    to: new Date(tt.setDate(tt.getDate()+30)),    //Optional
    callback: function (val) {    //Mandatory
      datePickerCallback(val);
    }
  };  

  $ionicModal.fromTemplateUrl('my-modal-2.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {


    // console.log(dates);
    $scope.datesOptions = ScheduleService.getDates();

    $scope.modal.show();
    $scope.loadingDone2 = true;
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
    // $scope.loadingDone2 = false;
  };

  $scope.onClickBackward = function(){
    $state.go('schedule');
  }

  $scope.onClickChangeApp = function(){

    $scope.openModal();
  }

  $scope.onClickCancel = function(){
    $scope.event = deepCopy(eventB);
    $scope.closeModal();
  }

  $scope.onClickConfirm = function(){
    // var tt = $scope.event.Status;
    // $scope.event.Status = 0;
    // ScheduleService.cancelOneCalendar($scope.event);


    // var temp = new Object($scope.event);
    // ScheduleService.cancelOneCalendar($scope.event).then(function(promise){
      // var temp2 = new Object($scope.event);
        // $scope.event.Status = tt;
    PageFunc.confirm("确认修改日程信息","确认").then(function(res){

      if(res){


            var tempDate = $scope.event.DateTime.split("/",3);

            if(tempDate.length != 3){

              PageFunc.confirm("请选择日期或者取消退出","确认");
              
            }

            else{

                  var t =  tempDate[0] + 
                         (tempDate[1].length==2 ? tempDate[1] : '0' +tempDate[1])  + 
                         (tempDate[2].length==2 ? tempDate[2] : '0' +tempDate[2]) ;

                  $scope.event.DateTime = t;
                  // console.log(t);
                  

                  ScheduleService.postCalendar($scope.event);
                  
                  $timeout(function(){
                    ScheduleService.cancelOneCalendar(eventB);            
                    $scope.closeModal();
                    $state.go('schedule');        
                  },100);

            }

            

      }
    })



  }

  $scope.onClickCancelApp = function(){
    // $scope.event.Status = 0;
    PageFunc.confirm("确认取消日程","确认").then(function(res){
      if(res){
            ScheduleService.cancelOneCalendar($scope.event);
            $state.go('schedule');
      }
    })

  }

  $scope.onClickFinishApp = function(){
    // $scope.event.Status = 0;
    PageFunc.confirm("确认完成日程","确认").then(function(res){
      if(res){
            $scope.event.Status = 5;
            ScheduleService.postCalendar($scope.event);
            $timeout(function(){
               ScheduleService.cancelOneCalendar(eventB);
            },100);
            $state.go('schedule');
      }
    })

  }

}])
.controller('CoachMessageCtrl',['$state','$scope','MessageInfo','Storage', function($state,$scope,MessageInfo,Storage){ 
  $scope.$on('$ionicView.enter', function() {
    MessageInfo.GetDataByStatus(Storage.get('UID'),1,'{Status}',1,0)
    .then(function(data){
      $scope.systemMessage=data[0];
    }) 
    MessageInfo.GetDataByStatus(Storage.get('UID'),'appointment','{Status}',1,0)
    .then(function(data){
      $scope.appointmentMessage=data[0];
    })     
    MessageInfo.GetDataByStatus(Storage.get('UID'),2,'{Status}',9999,0)
    .then(function(data){
      var temp=[];var flag;
      temp.push(data[0]);
      for(i=1;i<data.length;i++){
        flag=1;
        for(j=0;j<temp.length;j++){
          if(data[i].SenderID==temp[j].SenderID){
            flag=0;break;
          }
        }
        if(flag){
          temp.push(data[i]);
        } 
      }
      $scope.patientsMessages=temp;
      temp=[];
    })     
  }); 
  $scope.gotoChatDetail = function (message){
    console.log(message)
    Storage.set("PatientID",message.SenderID);
    Storage.set("isManage","Yes");
    Storage.set("PatientName",message.SenderName);
    $state.go('manage.chat');
    // Storage.set('PatientAge',message.Age);
    // Storage.set('PatientGender',message.GenderText);     
    // Storage.set("PatientPhotoAddress",message.photoAddress);
  } 
  // $scope.goToHome = function(){
  //   $state.go('coach.home');
  // }
}])
.controller('CoachMessageDetailCtrl',['$state','$scope','$stateParams','MessageInfo','Storage', function($state,$scope,$stateparams,MessageInfo,Storage){ 
  $scope.$on('$ionicView.enter', function() {
    $scope.messages=[];
    if($stateparams.messageType=='system'){
      $scope.headerText = '系统消息';
      MessageInfo.GetDataByStatus(Storage.get('UID'),1,'{Status}',100,0)
      .then(function(data){
        console.log(data)
        $scope.messages=data;
      })       
    }else if($stateparams.messageType=='appointment'){
      $scope.headerText = '预约消息';  
    }else{
      $scope.headerText = '直接跳转聊天界面chatdetail？';
    } 
  });  
}])
.controller('myPatientCtrl', ['$rootScope', '$compile', '$ionicScrollDelegate', '$ionicPopover','$cordovaBarcodeScanner','$filter','$ionicModal', '$ionicPopup','$ionicLoading','$scope', '$state', '$http','$timeout','$interval','$ionicHistory','Storage' ,'userINFO','PageFunc','CONFIG','Data' ,function($rootScope,$compile,$ionicScrollDelegate,$ionicPopover,$cordovaBarcodeScanner,$filter,$ionicModal, $ionicPopup,$ionicLoading,$scope, $state, $http,$timeout,$interval,$ionicHistory,Storage,userINFO,PageFunc,CONFIG,Data){
  var PIDlist=new Array();//PID列表
  var PIDlistLength=0,PIDlistLengthshow//PID列表长度
  var PatientsList=new Array();//输出到页面的json  
  var refreshing=1;//控制连续刷新时序            
  // $scope.patients=PatientsBasic;
  $scope.moredata = false;  //控制上拉加载
  $scope.clearIt=true;
    //-----------------------------------------------------------------------------//
  var DOCID=Storage.get('UID');
   
  // loading图标显示
  $scope.scrollTop = function(){
    $ionicScrollDelegate.$getByHandle('myPatientScroll').scrollTop(true);
  }
  // $scope.touchme =function(){
  //   $scope.need
  // }
  $scope.onScoll = function(){
    if($ionicScrollDelegate.getScrollPosition().top>200){
      $scope.$apply(function () {
     　　$scope.needtoTop=true;
      });
    }else{
      $scope.$apply(function () {
     　　$scope.needtoTop=false;
      });
    }
  }
  // $scope.openpopover=function($event){     
    //   // backbeforesearch();
    //   $ionicPopover.fromTemplateUrl('partials/individual/rank-patients.html', {
    //     scope: $scope,
    //   }).then(function(popover) {
    //     $scope.popover = popover;
    //     console.log(ranks);
    //     $rootScope.ranks=ranks;
    //     $compile($('#popcontent').contents())($scope);
    //     var stopListening = $scope.$on('popover.hidden', function() {
    //       stopListening();
    //       $scope.popover.remove();
    //     });
    //   });
    //   $timeout(function(){$scope.popover.show($event);},40);
  // }
  $scope.$on('$ionicView.enter', function() {
    $ionicPopover.fromTemplateUrl('partials/individual/rank-patients.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.ranks=ranks;
      $scope.popover = popover;  
    });    
  });
  var dataloading=function(){
    $ionicLoading.show({
      // content: '加载中',
      animation: 'fade-in',
      // showBackdrop: true,
      // maxWidth: 200,
      // showDelay: 0
    });
  }
  dataloading();
  var orderConfig;
  var filterConfig;
  var Props,categories,ranks;
  var filterAge,filterModule,filterStartDate,filterStatus,filterComplianceRate; 
  var index1,rankindex;
  var DOinitial = function(){
    Props=[{Name:'模块',checked:false,clicked:true},{Name:'计划状态',checked:false,clicked:false},{Name:'计划起始',checked:false,clicked:false}, {Name:'依从率',checked:false,clicked:false},{Name:'年龄',checked:false,clicked:false}];
    categories=[[{Name:'高血压',checked:false},{Name:'糖尿病',checked:false},{Name:'心衰',checked:false}],
    [{Name:'进行中',checked:false},{Name:'已完成',checked:false},{Name:'无计划',checked:false}],
    [{Name:'两周内',checked:false},{Name:'一个月内',checked:false},{Name:'三个月内',checked:false}],
    [{Name:'30%以下',checked:false},{Name:'30%~60%',checked:false},{Name:'60%~80%',checked:false},{Name:'80%以上',checked:false}],
    [{Name:'30岁以下',checked:false},{Name:'30岁~50岁',checked:false},{Name:'50岁~60岁',checked:false},{Name:'60岁以上',checked:false}]];
    ranks=[{Name:'依从率最低',ordername:'SMSCount desc,ComplianceRate,Status desc,RemainingDays,StartDate desc',clicked:false},
    {Name:'依从率最高',ordername:'SMSCount desc,ComplianceRate desc,Status desc,RemainingDays,StartDate desc',clicked:false},
    {Name:'计划剩余天数',ordername:'SMSCount desc,Status desc,RemainingDays,ComplianceRate,StartDate desc',clicked:false},
    {Name:'只显示高血压',ordername:'高血压',clicked:false},
    {Name:'只显示糖尿病',ordername:'糖尿病',clicked:false},
    {Name:'只显示心衰',ordername:'心衰',clicked:false}]
    rankindex=0;index1=0;
    filterAge=[];
    filterModule=[];
    filterStartDate='';
    filterStatus=[];
    filterComplianceRate=[];
    orderConfig ="SMSCount desc,Status desc,RemainingDays,ComplianceRate,StartDate desc";
    filterConfig = "PatientName ge  ''";
  }
  DOinitial();
  $scope.rankBy = function(index){ 
    $ionicScrollDelegate.$getByHandle('myPatientScroll').scrollTop(); 
    $scope.popover.hide();     
    ranks[rankindex].clicked=!ranks[rankindex].clicked;
    if(rankindex!=index){
      if(index<3){
        orderConfig=ranks[index].ordername;
        ranks[index].clicked=true;
        $scope.ranks=ranks;
        filterModule='';
        categories[0][0].checked=false;categories[0][1].checked=false;categories[0][2].checked=false;
        Props[0].checked=false;
        refreshing=1;dataloading();
        PatientsList=[];PIDlist=[];PIDlistLength=0;
        getPIDlist();
      }else if(index==3 ||index==4 || index==5){
        filterModule=[ranks[index].ordername];
        ranks[index].clicked=true;
        categories[0][index-3].checked=true;
        if(index==3){
          categories[0][1].checked=false;
          categories[0][2].checked=false;
        }else if(index==4){
          categories[0][0].checked=false;
          categories[0][2].checked=false;
        }else if(index==5){
          categories[0][0].checked=false;
          categories[0][1].checked=false;
        }
        Props[0].checked=true; 
      }       
    }
    rankindex=index;    
  }
  $scope.resetfilter= function(){
    $scope.popover.hide();
    ranks[rankindex].clicked=false;
    DOinitial();
    refreshing=1;
    PatientsList=[];PIDlist=[];
    PIDlistLength=0;dataloading(); 
    getPIDlist();     
    $scope.categories=categories[0];
    // $scope.letusFilter();
  }
  //搜索
  var querylength=0;
  $scope.searchflag=false;
  var backup=[];var flag=0;
  $scope.startSearch = function(query){
    querylength1=query.PatientName.length;
    if(querylength1>0){
      $scope.clearIt=false;
      $scope.searchflag=true;
    }
    if(querylength1==0){
      $scope.clearIt=true;
      $scope.searchflag=false  
    }
    if(flag==0){
      flag=1;
      backup=[];
      backup.push(orderConfig);backup.push(filterConfig);backup.push(PatientsList);backup.push(PIDlistLength);
      backup.push(categories);backup.push(Props);backup.push(ranks);backup.push(rankindex);backup.push(index1);
      backup.push(filterAge);backup.push(filterModule);backup.push(filterStartDate);backup.push(filterStatus);backup.push(filterComplianceRate);
      DOinitial();
      $scope.moredata = true;
    }
    querylength=querylength1
  }
  $scope.onlineSearch = function(){
    filterConfig = "substringof('"+$scope.query.PatientName +"',PatientName)";
    PatientsList=[];PIDlist=[];
    PIDlistLength=0;dataloading(); 
    $scope.searchflag=false;
    getPIDlist();
  }
  var backbeforesearch = function(){
    $scope.searchflag=false;$scope.query="";querylength=0;$scope.clearIt=true;flag=0;
    if(backup!=''){
      filterComplianceRate=backup.pop();
      filterStatus=backup.pop();
      filterStartDate=backup.pop();
      filterModule=backup.pop();
      filterAge=backup.pop();
      index1=backup.pop();
      rankindex=backup.pop();
      ranks=backup.pop();
      Props=backup.pop();
      categories=backup.pop();
      PIDlistLength=backup.pop();
      PatientsList=backup.pop();
      filterConfig=backup.pop();
      orderConfig=backup.pop();
      $scope.patients=PatientsList;
      backup=[];      
    }
  }

  $scope.doResume = function(){
    if($scope.query.PatientName==''){
      backbeforesearch();
    }
  }
  $scope.clearSearch = function(){
    $scope.query="";
    backbeforesearch();
  }

  var onePatientBasic= function(PID,listIndex){
    userINFO.BasicInfo(PID).then(function(data){
      PatientsList[listIndex].Age=data.Age+'岁';
      PatientsList[listIndex].GenderText=data.GenderText;
    },function(data){
    }); 
  }
  var getPatientsBasic=function(list){
    // for(var p in list){        //3行无延时请求数据
    //   onePatientBasic(list[p],p);
    // }
    var repeat=PIDlistLength;  
    var timer;
    timer = $interval(function(){
      if(repeat==0){
        $ionicLoading.hide();
        refreshing=0;
        $interval.cancel(timer);
        timer=undefined;        
      }else{
      onePatientBasic(list[PIDlistLength-repeat],PIDlistLength-repeat);
      repeat--;
      }
    },5);
  }
  var netError = function(){
    $ionicLoading.hide();
    refreshing=0;
    PageFunc.confirm('网络好像不太稳定', '网络错误'); 
    $scope.$broadcast('scroll.refreshComplete');  
  }

  var getPIDlist = function(){
    userINFO.GetPatientsList(14,PIDlistLength,orderConfig,filterConfig,DOCID,'HM1','0','0')
    .then(function(data){
      var temp={};
      // $ionicScrollDelegate.scrollTop(true);
      for(var i=0;i<data.length;i++){  
        temp=data[i];
        if(temp.photoAddress=='' || temp.photoAddress==null){    
          temp.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/' +'non.jpg';
        }else{
          temp.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ temp.photoAddress;
        }
        if(temp.Process!=''){
          temp.Process=parseInt(temp.Process*100);
        }
        if(temp.ComplianceRate!=''){
          temp.ComplianceRate=parseInt(temp.ComplianceRate*100);
        }
        temp.SMSCount=parseInt(temp.SMSCount);
        temp.Age='';
        temp.GenderText='';
        temp.Module="高血压";
        PatientsList.push(temp);
        PIDlist.push(temp.PatientId);          
      } 
      userINFO.GetPatientsList(19 ,PIDlistLength,orderConfig,filterConfig,DOCID,'HM2','0','0')
      .then(function(data){
        for(var i=0;i<data.length;i++){
          temp=data[i];
          if(temp.photoAddress=='' || temp.photoAddress==null){    
            temp.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/' +'non.jpg';
          }else{
            temp.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ temp.photoAddress;
          }
          if(temp.Process!=''){
            temp.Process=parseInt(temp.Process*100);
          }
          if(temp.ComplianceRate!=''){
            temp.ComplianceRate=parseInt(temp.ComplianceRate*100);
          }
          temp.SMSCount=parseInt(temp.SMSCount);
          temp.Age='';
          temp.GenderText='';
          temp.Module="糖尿病";
          PatientsList.push(temp);
          PIDlist.push(temp.PatientId);          
        }
        userINFO.GetPatientsList(19 ,PIDlistLength,orderConfig,filterConfig,DOCID,'HM3','0','0')
        .then(function(data){
          for(var i=0;i<data.length;i++){
            temp=data[i];
            if(temp.photoAddress=='' || temp.photoAddress==null){    
              temp.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/' +'non.jpg';
            }else{
              temp.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ temp.photoAddress;
            }
            if(temp.Process!=''){
              temp.Process=parseInt(temp.Process*100);
            }
            if(temp.ComplianceRate!=''){
              temp.ComplianceRate=parseInt(temp.ComplianceRate*100);
            }
            temp.SMSCount=parseInt(temp.SMSCount);
            temp.Age='';
            temp.GenderText='';
            temp.Module="心衰";
            PatientsList.push(temp);
            PIDlist.push(temp.PatientId);          
          }
          if((PIDlist.length-PIDlistLength)==15){
            $scope.moredata = false;
          }         
          $scope.patients=PatientsList;
          console.log(PatientsList);
          PIDlistLength=PIDlist.length;
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete'); //刷新完成，重新激活刷新
          getPatientsBasic(PIDlist);
        },function(data){
          netError();
        })      
      },function(data){
        netError();
      })        
    },function(data){
      netError();
    });
  }
  $scope.PIDdetail = function(Patient){
    $rootScope.SMSCount=parseInt(Patient.SMSCount);
    Storage.set("PatientID",Patient.PatientId);
    Storage.set("isManage","Yes");
    Storage.set("PatientName",Patient.PatientName);
    Storage.set('PatientAge',Patient.Age);
    Storage.set('PatientGender',Patient.GenderText);     
    Storage.set("PatientPhotoAddress",Patient.photoAddress);
    $ionicHistory.clearHistory();
    if(Patient.SMSCount==0){
      $state.go('manage.plan');
    }else{    
      Patient.SMSCount=0;
      $state.go('manage.chat');
    }
  }

  $scope.doRefresh =function() {
    if(refreshing==0){
      refreshing=1;
      PatientsList=[];PIDlist=[];PIDlistLength=0;
      getPIDlist();
    }
  }
  $scope.loadMore = function(){
    if($scope.moredata==false){
      $scope.moredata=true;
      getPIDlist();
    }  
   $scope.$broadcast('scroll.infiniteScrollComplete');
  }  
    // 扫一扫 
  $scope.QRscan = function(){
    // backbeforesearch();
    var isMyPID=0;
    var setData =function(thisPatient){
      Storage.set("PatientID",thisPatient.PatientId);     
      Storage.set("PatientPhotoAddress",thisPatient.photoAddress);
      Storage.set("PatientName",thisPatient.PatientName);
      if(thisPatient.photoAddress=='' || thisPatient.photoAddress==null){    
        thisPatient.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/' +'non.jpg';
      }else{
        thisPatient.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ thisPatient.photoAddress;
      }
      userINFO.BasicInfo(thisPatient.PatientId).then(function(data){
        Storage.set('PatientAge',data.Age+'岁');
        Storage.set('PatientGender',data.GenderText);
        $state.go('manage.plan');
      },function(data){
        // fail请求数据
      });
    }
    $cordovaBarcodeScanner
    .scan()
    .then(function(data) {
      // Success! Barcode data is here
      // var s = "Result: " + data.text + "<br/>" +
      // "Format: " + data.format + "<br/>" +
      // "Cancelled: " + data.cancelled;
      if(data.cancelled!=true){
        $ionicLoading.show({ template: '正在查询'});
        var newpid=data.text
        var tempf="PatientId eq '"+newpid+"'";
        userINFO.GetPatientsList(1000,0,orderConfig,tempf,DOCID,'HM1','0','0')
        .then(function(data){
          if(data.length==1){
            setData(data[0]);
          }else{
            userINFO.GetPatientsList(1000,0,orderConfig,tempf,DOCID,'HM2','0','0')
            .then(function(data){
              if(data.length==1){
                setData(data[0]);
              }else{
                userINFO.GetPatientsList(1000,0,orderConfig,tempf,DOCID,'HM3','0','0')
                .then(function(data){
                  $ionicLoading.hide();
                  if(data.length==1){
                    setData(data[0]);
                  }else{
                    var myPopup = $ionicPopup.show({
                    template: '<center>该用户不在患者列表中，是否创建新患者？</center>',
                    //title: '',
                    //subTitle: '2',
                    scope: $scope,
                    buttons: [
                      { text: '取消',
                      type: 'button-small',
                      onTap: function(e) {                
                      }
                      },
                      {
                      text: '<b>确定</b>',
                      type: 'button-small button-positive ',
                      onTap: function(e) {
                        Storage.set("newPatientID",newpid);
                        $state.go('addpatient.basicinfo');
                      }
                      }
                    ]
                    });
                  }                  
                },function(){
                  $ionicLoading.hide();
                  alert('网络问题');
                  // fail请求数据
                });
              }
            },function(data){
              $ionicLoading.hide();
              alert('网络问题');
              // fail请求数据
            });            
          }
        },function(data){
          $ionicLoading.hide();
          alert('网络问题');
          // fail请求数据
        });
      }
    }, function(error) {
      alert('扫码FAILED');
    });
  }  

  //筛选

  $scope.byRange = function () {   
    return function predicateFunc(item) {
      var tempflag=false;
      if(filterAge!=''){
        for(var i in filterAge){
          var tt=item['Age'].substring(0,item['Age'].length-1)
          if(filterAge[i][0] <= tt && tt <=filterAge[i][1]){
            tempflag=true;
            break;
          }
        } 
        if(tempflag==false){
          return false;
        }else{
          tempflag=false;
        }       
      }

      if(filterModule!=''){
        for(var i in filterModule){
          if(filterModule[i]==item['Module']){
            tempflag=true;
            break;
          }
        }
        if(tempflag==false){
          return false;
        }else{
          tempflag=false;
        }        
      }
      // if(filterStartDate!=''){
      //   if(filterStartDate<=String(item['StartDate'])){
      //     tempflag=true;
      //   }else{
      //     tempflag=false;
      //   }
      //   if(tempflag==false){
      //     return false;
      //   }else{
      //     tempflag=false;
      //   } 
      // }
      // if(filterStatus!=''){
      //   for(var i in filterStatus){
      //     if(filterStatus[i]==String(item['Status'])){
      //       tempflag=true;
      //       break;
      //     }
      //   }
      //   if(tempflag==false){
      //     return false;
      //   }else{
      //     tempflag=false;
      //   } 
      // }  
      // if(filterComplianceRate!=''){
      //   for(var i in filterComplianceRate){
      //     if(filterComplianceRate[i][0] <= item['ComplianceRate'] && item['ComplianceRate'] <=filterComplianceRate[i][1]){
      //       tempflag=true;
      //       break;
      //     }
      //   } 
      //   if(tempflag==false){
      //     return false;
      //   }else{
      //     tempflag=false;
      //   }       
      // }    

      return true;
    };
  };
  $ionicModal.fromTemplateUrl('partials/individual/coach-patients-filter.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
    $scope.categories=categories[0];
  });
  $scope.switchTo = function(index){
    $scope.categories=categories[index];  
    Props[index1].clicked=false;
    index1=index;
    Props[index1].clicked=true;
  }
  $scope.modelopen = function() {
    $scope.popover.hide();
    $scope.modal.show();
    $scope.props=Props;
  };
  $scope.checkit = function(index){
    if(index1!=2){
      categories[index1][index].checked=!categories[index1][index].checked;     
    }else{
      var t=!categories[index1][index].checked;
      for(var i in categories[index1]){
        categories[index1][i].checked=false;
      }
      categories[index1][index].checked=t;
    }
    for(var i in categories[index1]){
      if(categories[index1][i].checked == true){
        Props[index1].checked=true;
        break;
      }
      Props[index1].checked=false;
    }

  }
  $scope.letusFilter =function(){
    $scope.modal.hide();
    //年龄
    var temp=[];filterAge=[];
    if(categories[4][0].checked){
      temp.push([0,30]);
    }
    if(categories[4][1].checked){
      temp.push([30,50]);
    }
    if(categories[4][2].checked){
      temp.push([50,60]);
    }
    if(categories[4][3].checked){
      temp.push([60,150]);
    }
    if(temp!=''){
      for(var i=temp.length-1; i>0;i--){
        if(temp[i][0]==temp[i-1][1]){
          temp[i-1][1]=temp[i][1];
        }else{
          filterAge.push([temp[i][0],temp[i][1]]);
        }
      } 
      filterAge.push([temp[0][0],temp[0][1]]);      
    }
    //依从率
    temp=[];filterComplianceRate=[];
    if(categories[3][0].checked){
      temp.push([0,30]);
    }
    if(categories[3][1].checked){
      temp.push([30,60]);
    }
    if(categories[3][2].checked){
      temp.push([60,80]);
    }
    if(categories[3][3].checked){
      temp.push([80,150]);
    }
    if(temp!=''){
      for(var i=temp.length-1; i>0;i--){
        if(temp[i][0]==temp[i-1][1]){
          temp[i-1][1]=temp[i][1];
        }else{
          filterComplianceRate.push([temp[i][0],temp[i][1]]);
        }
      } 
      filterComplianceRate.push([temp[0][0],temp[0][1]]);      
    }    
    //模块
    temp=[];
    for(var i in categories[0]){
      if(categories[0][i].checked==true){
        temp.push(categories[0][i].Name)
      }      
    }
    filterModule=temp;
    //起始日期
    if(categories[2][0].checked==true){
      var uom = new Date(new Date()-14*86400000); 
      var dd=uom.getDate();
      var mm=uom.getMonth()+1;
      uom = String(uom.getFullYear())  + (mm<10?('0'+String(mm)):String(mm)) + (dd<10?('0'+String(dd)):String(dd)); 
      filterStartDate=parseInt(uom);
    }else if(categories[2][1].checked==true){
      var uom = new Date(new Date()-31*86400000); 
      var dd=uom.getDate();
      var mm=uom.getMonth()+1
      uom = String(uom.getFullYear())  + (mm<10?('0'+String(mm)):String(mm)) + (dd<10?('0'+String(dd)):String(dd)); 
      filterStartDate=parseInt(uom);     
    }else if(categories[2][2].checked==true){
      var uom = new Date(new Date()-92*86400000); 
      var dd=uom.getDate();
      var mm=uom.getMonth()+1
      uom = String(uom.getFullYear())  + (mm<10?('0'+String(mm)):String(mm)) + (dd<10?('0'+String(dd)):String(dd)); 
      filterStartDate=parseInt(uom);
    }else{
      filterStartDate='';
    }
    //计划
    temp=[];
    if(categories[1][0].checked==true){
      temp.push('3');
    }
    // if(categories[1][2].checked==true){
    //   temp.push('0');   
    // }
    if(categories[1][2].checked==true){
      temp.push('0');   
    }
    filterStatus=temp;
    //FILTER VIA WEB
    temp='';var filterConfig1='';
    if(filterStartDate!=''){
      filterConfig1="StartDate ge  '"+filterStartDate+"'";    
      temp=1;
    }
    if(filterComplianceRate!=''){
      var tc='',smallC,bigC;
      for(var i in filterComplianceRate){
        bigC=filterComplianceRate[i][1]*0.01;smallC=filterComplianceRate[i][0]*0.01;
        if(i==0){
          tc="(ComplianceRate ge  "+smallC+" and ComplianceRate lt  "+bigC+")";
        }else{
          tc=tc+" or (ComplianceRate ge  "+smallC+" and ComplianceRate lt  "+bigC+")";
        }
      }
      if(filterComplianceRate.length>1){
        tc="("+tc+")";
      }      
      if(temp==0){
        filterConfig1=tc;
      }else{
        filterConfig1=filterConfig1+" and "+tc;
      }
      temp=1;
    }
    if(filterStatus!=''){
      var ts='';
      for(var i in filterStatus){
        if(i==0){
          ts="Status eq '"+filterStatus[i]+"'";
        }else{
          ts=ts + " or Status eq '"+filterStatus[i]+"'";
        }
      }
      if(filterStatus.length>1){
        ts="("+ts+")";
      }
      if(temp==0){
        filterConfig1=ts;
      }else{
        filterConfig1=filterConfig1+" and "+ts;
      }
      temp=1;      
    }
    if(temp!=1){
      filterConfig1 = "PatientName ge  ''";
    }
    if(filterConfig1!=filterConfig){
      filterConfig=filterConfig1;
      refreshing=1;dataloading();
      PatientsList=[];PIDlist=[];PIDlistLength=0;
      getPIDlist(); 
    }
  }
  $scope.closeFilter = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });       
}])
.controller('newpatientsCtrl', ['$ionicPopover', '$scope', '$state','$ionicLoading', '$http','$cordovaBarcodeScanner',  '$ionicPopup','$interval','$timeout' ,'userINFO','PageFunc','Storage','CONFIG' ,function($ionicPopover,$scope, $state,$ionicLoading, $http,$cordovaBarcodeScanner,  $ionicPopup, $interval,$timeout,userINFO,PageFunc,Storage,CONFIG){
  var PIDlist=new Array();
  var PIDlistLength;
  var PatientsList=[];
  var refreshing=0;//控制连续刷新时序   
  var DOCID=Storage.get('UID');          
  $scope.moredata = false;
  var dataloading= function(){
    $ionicLoading.show({
      content: '加载中',
      // animation: 'fade-in',
      // showBackdrop: true,
      // maxWidth: 200,
      // showDelay: 0
    });
  }
  dataloading();
  $scope.f={module:'病种',Status:'预约状态'}
  var subConfig=[[{Name:'高血压',filterprop:" and module eq  '高血压模块'"},{Name:'糖尿病',filterprop:" and module eq  '糖尿病模块'"},{Name:'心衰',filterprop:" and module eq  '心力衰竭模块'"},{Name:'全部',filterprop:''}],
      [{Name:'预约申请中',filterprop:"AppointmentStatus eq  '1'"},{Name:'已预约',filterprop:"AppointmentStatus eq  '4'"},{Name:'全部',filterprop:"(AppointmentStatus eq  '1' or AppointmentStatus eq  '4')"}],
      [{Name:'更多'}]];
  $scope.openpopover=function($event,xx){
    $scope.xx=xx;  
    $ionicPopover.fromTemplateUrl('partials/individual/filterNewpatients.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
      $scope.props=subConfig[xx];
      var stopListening = $scope.$on('popover.hidden', function() {
        stopListening();
        $scope.popover.remove();
      });
    });
    $timeout(function(){$scope.popover.show($event);},30);
  }
  var filtermodule='';
  var filterAppointmentStatus="(AppointmentStatus eq  '1' or AppointmentStatus eq  '4')";
  $scope.select1='';
  $scope.select2='';
  $scope.rankBy = function(prop){
    $scope.popover.hide();
    if($scope.xx==0){
      filtermodule=prop.filterprop;
      if(prop.Name!='全部'){
        $scope.f.module=prop.Name;
        $scope.select1={'color':'#fb6a1b'};
      }else{
        $scope.f.module='病种';
        $scope.select1='';
      }
    }
    if($scope.xx==1){
      filterAppointmentStatus=prop.filterprop;
      if(prop.Name!='全部'){
        $scope.f.Status=prop.Name;
        $scope.select2={'color':'#fb6a1b'};
      }else{
        $scope.f.Status='预约状态';
        $scope.select2='';
      }
    }
    filterConfig=filterAppointmentStatus+filtermodule;
    PatientsList=[];PIDlist=[];
    PIDlistLength=0;dataloading();
    getPIDlist();
  }    
  // $scope.$on('$ionicView.enter', function() {
  //   $ionicPopover.fromTemplateUrl('partials/individual/filterNewpatients.html', {
  //     scope: $scope,
  //   }).then(function(popover1) {
  //     $scope.popover1 = popover1;
  //     $scope.props=subConfig[0];
  //   }); 
  //   $ionicPopover.fromTemplateUrl('partials/individual/filterNewpatients.html', {
  //     scope: $scope,
  //   }).then(function(popover2) {
  //     $scope.popover2 = popover2;
  //     $scope.props=subConfig[1];
  //     var stopListening = $scope.$on('popover.hidden', function() {
  //       stopListening();
  //       popover2.remove();
  //     });
  //   });    
  // });
  var netError = function(){
      $ionicLoading.hide();
      refreshing=0;
      $scope.$broadcast('scroll.refreshComplete');
      PageFunc.confirm('网络好像不太稳定', '网络错误');   
  }
  var dateHowFar = function(date){ 
    var t=new Date();
    // console.log(date,t) 
    var yyyy=parseInt(date.substr(0,4));
    var mm=date.substr(5,2)-1;
    var dd=parseInt(date.substr(8,2));
    var hh=parseInt(date.substr(11,2));
    var mins=parseInt(date.substr(14,2));
    var sec=parseInt(date.substr(17,2));   
    var t0=new Date(yyyy,mm,dd,hh,mins,sec);
    // console.log(t,t0)
    var diff=parseInt((t.getTime()-t0.getTime())/60000);
    // console.log(diff);
    var h=parseInt(diff/60);
    var d=parseInt(h/24);
    var mo=parseInt(d/30.5);
    if(d>365){
      return '1年前'
    }else if(d>29){
      return mo+'个月前';
    }else if((24+t.getHours())<h){
      return (d+1)+'天前';
    }else if(t.getDate()!=dd){
      return '昨天';
    }else if(1<=h){
      return h+'小时前';
    }else if(1<=diff){
      return diff+'分钟前';
    }else{
      return '刚刚';
    } 
  }
  var orderConfig ="AppointmentStatus,ApplicationTime desc,AppointmentTime,name";
  var filterConfig = "(AppointmentStatus eq  '1' or AppointmentStatus eq  '4')";
  var decoration =function(data){
    if(data.length!=0){
      var temp={};
      for(var i=0;i<data.length;i++){  
        temp=data[i];
        console.log(temp);
        if(temp.imageURL=='' || temp.imageURL==null){    
          temp.imageURL =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/' +'non.jpg';
        }else{
          temp.imageURL =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ temp.imageURL;
        }
        if(temp.age==undefined  ||temp.age==''){
          temp.age='';
        }else{
          temp.age=temp.age+'岁';
        }
        if(temp.sex=="1"){
          temp.GenderText='男';
        }else if(temp.sex=="2"){
          temp.GenderText='女';
        }
        if(temp.module=='高血压模块'){
          temp.Module="高血压";
        }else if(temp.module=='糖尿病模块'){
          temp.Module="糖尿病";
        }else if(temp.module=='心力衰竭模块'){
          temp.Module="心衰";
        }
        if(temp.AppointmentStatus=="1"){
          temp.AppointmentText="预约中";
        }else if(temp.AppointmentStatus=="4"){
          temp.AppointmentText="已预约";
        }

        temp.ApplyTime= dateHowFar(temp.ApplicationTime);
        // console.log(temp.AppointmentTime)
        temp.AppointmentTime = temp.AppointmentTime.substr(5,2)+'-'+ temp.AppointmentTime.substr(8,8);
        if(temp.AppointmentTime[10]==':'){
          temp.AppointmentTime=temp.AppointmentTime.substr(0,10);
        }

        PatientsList.push(temp);
        PIDlist.push(temp.PatientID);          
      }      
    }
  }
  var getPIDlist = function(){
    userINFO.GetAppoitmentPatientList(14,PIDlistLength,orderConfig,filterConfig,DOCID,'{Status}')
    .then(function(data){
      decoration(data);
      if((PIDlist.length-PIDlistLength)==15){
        $scope.moredata = false;
      }
      PIDlistLength=PIDlist.length;
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete'); //刷新完成，重新激活刷新
      refreshing=0;
      $scope.patients=PatientsList;
    },function(data){
      netError();
    });
  }
  $scope.viewDetail = function(patient){
    Storage.set("PatientID",patient.PatientID);
    if (patient.AppointmentStatus == "1")
    {
      $state.go('addappointment');
    }
    else
    {
      $state.go('checkappointment');
    }
  }
  $scope.doRefresh =function() {
    if(refreshing==0){
      refreshing=1;
      PatientsList=[];PIDlist=[];
      PIDlistLength=0;
      getPIDlist();
    }

  }
  $scope.loadMore = function(){
    if($scope.moredata==false){
      $scope.moredata=true;
      getPIDlist();
    }  
    $scope.$broadcast('scroll.infiniteScrollComplete');
  } 
  // $scope.onItemDelete = function(index) {
  //   $scope.patients.splice(index, 1);
  // } 
  $scope.QRscan = function(){
    var isMyPID=0;
    var setData =function(thisPatient){
      Storage.set("PatientID",thisPatient.PatientId);     
      Storage.set("PatientPhotoAddress",thisPatient.photoAddress);
      Storage.set("PatientName",thisPatient.PatientName);
      if(thisPatient.photoAddress=='' || thisPatient.photoAddress==null){    
        thisPatient.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/' +'non.jpg';
      }else{
        thisPatient.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ thisPatient.photoAddress;
      }
      userINFO.BasicInfo(thisPatient.PatientId).then(function(data){
        Storage.set('PatientAge',data.Age+'岁');
        Storage.set('PatientGender',data.GenderText);
        $state.go('manage.plan');
      },function(data){
        // fail请求数据
      });
    }
    $cordovaBarcodeScanner
    .scan()
    .then(function(data) {
      // Success! Barcode data is here
      // var s = "Result: " + data.text + "<br/>" +
      // "Format: " + data.format + "<br/>" +
      // "Cancelled: " + data.cancelled;
      if(data.cancelled!=true){
        $ionicLoading.show({ template: '正在查询'});
        var newpid=data.text
        var tempf="PatientId eq '"+newpid+"'";
        userINFO.GetPatientsList(1000,0,'PatientName',tempf,DOCID,'HM1','0','0')
        .then(function(data){
          if(data.length==1){
            setData(data[0]);
          }else{
            userINFO.GetPatientsList(1000,0,'PatientName',tempf,DOCID,'HM2','0','0')
            .then(function(data){
              if(data.length==1){
                setData(data[0]);
              }else{
                userINFO.GetPatientsList(1000,0,'PatientName',tempf,DOCID,'HM3','0','0')
                .then(function(data){
                  $ionicLoading.hide();
                  if(data.length==1){
                    setData(data[0]);
                  }else{
                    var myPopup = $ionicPopup.show({
                    template: '<center>该用户不在患者列表中，是否创建新患者？</center>',
                    //title: '',
                    //subTitle: '2',
                    scope: $scope,
                    buttons: [
                      { text: '取消',
                      type: 'button-small',
                      onTap: function(e) {                
                      }
                      },
                      {
                      text: '<b>确定</b>',
                      type: 'button-small button-positive ',
                      onTap: function(e) {
                        Storage.set("newPatientID",newpid);
                        $state.go('addpatient.basicinfo');
                      }
                      }
                    ]
                    });
                  }                  
                },function(){
                  $ionicLoading.hide();
                  alert('网络问题');
                  // fail请求数据
                });
              }
            },function(data){
              $ionicLoading.hide();
              alert('网络问题');
              // fail请求数据
            });            
          }
        },function(data){
          $ionicLoading.hide();
          alert('网络问题');
          // fail请求数据
        });
      }
    }, function(error) {
      alert('扫码FAILED');
    });
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

//GL 20151103 交流
.controller('ChatDetailCtrl' ,function($rootScope,$scope, $http,$state, $stateParams, $resource, MessageInfo, $ionicScrollDelegate, CONFIG, Storage,GetBasicInfo,Data) 
{ 

  
  
    // $scope.backtocoach=function(){
    //   $state.go('coach.home');
    // };

    $scope.Dialog = {};
    $scope.DoctorId = localStorage.getItem("UID");
    $scope.DoctorName =  localStorage.getItem("DoctorName");
    $scope.imageURL = localStorage.getItem("PatientPhotoAddress"); //医生头像地址

    $scope.PatientId = localStorage.getItem("PatientID");
    $scope.PatientName = localStorage.getItem("PatientName");;
    $scope.Dialog.SMScontent = "";
    var WsUserId = $scope.DoctorId;
    var WsUserName = $scope.DoctorId; 
    var wsServerIP = CONFIG.wsServerIP; 

    $scope.myImage = localStorage.getItem("doctorphoto"); //患者头像地址
    var temp='';
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.SMSCount=0;  //$viewContentLoaded
      if(temp!=$scope.PatientId){
        var c=0;
        var setRead =function(){
            MessageInfo.messageRead($scope.PatientId,$scope.DoctorId)
            .then(function(){
              temp=$scope.PatientId;
            },function(){
              if(c++<10){
                setRead();
              }
            });
        }        
        setRead();        
      }
    });    
    // var urltemp2 = Storage.get('UID') + '/BasicDtlInfo';
    // Data.Users.GetPatientDetailInfo({route:urltemp2}, 
    //    function (success, headers) {
    //     console.log(success);
    //       if( (success.PhotoAddress=="") || (success.PhotoAddress==null))
    //       {
    //         $scope.myImage = "img/DefaultAvatar.jpg";
    //       }
    //       else 
    //       {
    //         $scope.myImage = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile + "/" + success.PhotoAddress;
    //       } 

    //    }, 
    //   function (err) {
    //     // 目前好像不存在userid不对的情况，都会返回一个结果
    //   });  
    $scope.backtocoach=function(){
      $state.go('coach.patients');
    }
    $scope.Dialog.DisplayOnes = new Array(); //显示的消息
    $scope.Dialog.UnitCount = 9;//每次点击加载的条数
    $scope.Dialog.Skip = $scope.Dialog.UnitCount;//跳过的条数
    //加载更多
    $scope.DisplayMore = function ()
    { 
        GetSMSDialogue($scope.Dialog.Skip);
        $scope.Dialog.Skip = $scope.Dialog.Skip + $scope.Dialog.UnitCount;
    }


    //socket初始化
    $scope.SocketInit = function ()
    {
        $scope.socket = io.connect(wsServerIP);
          
        //告诉服务器由用户登录
        $scope.socket.emit('login', {userid:WsUserId, username:WsUserName});                
          
        //监听消息
        $scope.socket.on('message', function(obj){
            var DataArry = obj.content.split("||");
            if (DataArry[0] == WsUserId)
            {
              if(DataArry[1] == $scope.PatientId)
              {
                  $scope.Dialog.DisplayOnes.push({"IDFlag": "Receive","SendDateTime": DataArry[2],"Content":DataArry[3]});
                  //console.log($scope.Dialog);
                  $ionicScrollDelegate.scrollBottom(true);
                  $scope.$apply();
                  //SetSMSRead(ThisUserId, TheOtherId);//改写阅读状态
                  //playBeep();
              }              
            }   
        });
    } 
    //socket发送消息到服务器   
    $scope.SocketSubmit = function(WsContent)
    {      
        var obj = {
          userid: WsUserId,
          username: WsUserName,
          content: WsContent
        };
        $scope.socket.emit('message', obj);
      return false;
    },

     //获取消息对话
    GetSMSDialogue = function(skip)
    {
        var promise = MessageInfo.GetSMSDialogue($scope.DoctorId,$scope.PatientId, $scope.Dialog.UnitCount,skip);
        promise.then(function(data) 
        { 
            if(data.length > 0)
            {
                var NewData = data.reverse(); //倒序
                if($scope.Dialog.DisplayOnes)
                {
                    $scope.Dialog.DisplayOnes = NewData.concat($scope.Dialog.DisplayOnes);
                }
                else
                {
                    $scope.Dialog.DisplayOnes = NewData;
                }
            } 
            $scope.$broadcast('scroll.refreshComplete');           
            //$ionicScrollDelegate.scrollBottom(true);
        }, 
        function(data) {   
        });      
    }


    var footerBar; // gets set in $ionicView.enter
    var scroller;
    var txtInput; // ^^^

    $scope.$watch('$viewContentLoaded', function() {  
        GetSMSDialogue(0);
        $scope.SocketInit();
        footerBar = document.body.querySelector('#userMessagesView .bar-footer');
        scroller = document.body.querySelector('#userMessagesView .scroll-content');
        txtInput = angular.element(footerBar.querySelector('textarea'));
    }); 
 
  
    //发送消息
    $scope.submitSMS = function() {
        var SendBy = $scope.DoctorId;
        var Receiver = $scope.PatientId;
        var piUserId = "1";
        var piTerminalName = "1";
        var piTerminalIP = "1";
        var piDeviceType = 19;
        if($scope.Dialog.SMScontent != "")
        {
            var promise = MessageInfo.submitSMS(SendBy,$scope.Dialog.SMScontent,Receiver,piUserId,piTerminalName,piTerminalIP,piDeviceType);  
            promise.then(function(data) {    
                if (data.Flag == "1")
                {
                    if (data.Time == null)
                    {
                        data.Time = "";
                    }
                    $scope.Dialog.DisplayOnes.push({"IDFlag": "Send","Time": data.Time,"Content":$scope.Dialog.SMScontent});
                    $ionicScrollDelegate.scrollBottom(true);
                    $scope.SocketSubmit(Receiver +  "||" + SendBy + "||" + data.Time + "||" + $scope.Dialog.SMScontent + "||" + data.SendDateTime);
                    $scope.Dialog.SMScontent = "";
                }              
            }, function(data) {   
            });      
        }
    }

    $scope.Dialog.SMSbottom = "44px";
    $scope.$on('taResize', function(e, ta) {
        //console.log('taResize');
        if (!ta) return;
        
        var taHeight = ta[0].offsetHeight;
        //console.log('taHeight: ' + taHeight);
        
        if (!footerBar) return;
        
        var newFooterHeight = taHeight + 10;
        newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
        
        footerBar.style.height = newFooterHeight + 'px';
        scroller.style.bottom = newFooterHeight + 'px';
        $scope.Dialog.SMSbottom = newFooterHeight + 'px';
    });

     // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
    function keepKeyboardOpen() {
        //console.log('keepKeyboardOpen');
        txtInput.one('blur', function() {
            console.log('textarea blur, focus back on it');
            txtInput[0].focus();
        });
    } 
})


.controller('AccountCtrl', function($scope) { //LRZ
  $scope.settings = {
    enableFriends: true
  };

  
  // $scope.
})

.controller('ModuleInfoCtrl',['$scope','$state','$http', '$ionicHistory',  '$ionicLoading','$stateParams', '$timeout', 'Storage','GetBasicInfo', function($scope,$state,$http, $ionicHistory, $ionicLoading, $stateParams, $timeout, Storage,GetBasicInfo) {
  
  $scope.$on('$ionicView.enter', function() {
  //   $http.get('partials/data1.json').success(function(data) {
  //     $scope.ModuleInfo = data;
  //   });
    $scope.Name=Storage.get('PatientName');
    $scope.age=Storage.get('PatientAge');
    $scope.gender=Storage.get('PatientGender');

  });
  //loading图标显示
  $ionicLoading.show({
    content: '加载中',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });
  
  $timeout(function(){
    $ionicLoading.hide();
  },10000);
  $scope.backtocoach=function(){
    $state.go('coach.patients');
  }

  var UserId = Storage.get('UID');
  var PatientId = Storage.get('PatientID');
  Storage.set('HM1','No');
  Storage.set('HM2','No');
  Storage.set('HM3','No');

  //var Module = $stateParams.Module;
  $scope.onClickBackward = function(){
      $ionicHistory.goBack();
  };


  $http.get('partials/data1.json').success(function(data) {
      $scope.ModuleInfo = data;
  });

  if (Storage.get("isManage") == "Yes")
  {
    GetBasicInfo.getiHealthCoachList(PatientId).then(function(data,status){
      for (var i=0;i<data.length;i++)
      {
        if (data[i].CategoryCode != "")
        {
          Storage.set(data[i].CategoryCode,'Yes');
          for (var j=0;j<$scope.ModuleInfo.length;j++)
          {
            if (data[i].CategoryCode == "H" + $scope.ModuleInfo[j].ModuleCode && data[i].HealthCoachID != UserId)
            {
              $scope.ModuleInfo[j].Flag = false;
            }
          }
        }
      }
      $ionicLoading.hide();
    },function(data,status){
      $scope.getStatus = status;
    });
  }
  else
  {
    GetBasicInfo.getiHealthCoachList(PatientId).then(function(data,status){
      for (var i=0;i<data.length;i++)
      {
        if (data[i].CategoryCode != "")
        {
          Storage.set(data[i].CategoryCode,'Yes');
          for (var j=0;j<$scope.ModuleInfo.length;j++)
          {
            if (data[i].CategoryCode == "H" + $scope.ModuleInfo[j].ModuleCode)
            {
              $scope.ModuleInfo[j].Flag = false;
            }
          }
        }
      }
      $ionicLoading.hide();
    },function(data,status){
      $scope.getStatus = status;
    });
  }
  

  $scope.NextPage =function(){
    $state.go('addpatient.risk');
  };
}])

// .controller('ModuleInfoListCtrl',['$scope','$state','$http', '$ionicHistory', '$stateParams', 'Storage', 'Users', function($scope,$state,$http, $ionicHistory, $stateParams, Storage, Users) {
  
//  $scope.all={first:""};

//   var UserId = Storage.get('UID');
//   var Module = $stateParams.Module;
//   $scope.onClickBackward1 = function(){
//       $state.go('addpatient.ModuleInfo');
//   };
//   $scope.onClickBackward3 = function(){
//       $state.go('manage.ModuleInfo');
//   };

//   var promise=Users.getquestionnaire(UserId,Module);
//    promise.then(function(data,status){
//      $scope.ModuleInfoList = data;
//   },function(data,status){
//     $scope.getStatus = status;
//   });
// }])

.controller('ModuleInfoListDetailCtrl',['$scope','$state','$http', '$ionicHistory', '$stateParams',  '$timeout', '$ionicPopup', '$ionicLoading', 'Storage', 'Users', function($scope,$state,$http, $ionicHistory, $stateParams,  $timeout,$ionicPopup, $ionicLoading,Storage, Users) {
  
  var UserId = Storage.get('UID');
  var PatientID = Storage.get('PatientID');
  var Module = $stateParams.Module;
  var HModule = "H" + Module;
  $scope.getStatus = "";
  $scope.test = {"test":{"Type":"1","Name":"是"}};
  $scope.isloaded = false;

  //loading图标显示
  $ionicLoading.show({
    content: '加载中',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $timeout(function(){
    $ionicLoading.hide();
  },10000);

  if ($stateParams.ListName != "" || typeof($stateParams.ListName) != "undefined")
  {
    var ListName = $stateParams.ListName;
  } 
  $scope.DietHabbitValue = "请选择饮食习惯";
  $scope.DietHabbitData = "";
  $scope.ListName = ListName;
  $scope.HypertensionDrugArray = [{"ID":1,"Type":"","Name":""}];
  $scope.HypertensionDrugData = [{"ID":1,"Type":"","Name":""}];
  $scope.DiabetesDrugArray = [{"ID":1,"Type":"","Name":""}];
  $scope.DiabetesDrugData = [{"ID":1,"Type":"","Name":""}];
  $scope.obj = [];
  $scope.dflag = [];
  var a=0;
  var b=0;
  $scope.HTypeName = "";
  $scope.DTypeName = "";
  $scope.HDrugName = "";
  $scope.DDrugName = "";
  $scope.YesNoType = "";
  $scope.DrinkFrequency = "";
  $scope.onClickBackward1 = function(){
      $state.go('addpatient.ModuleInfo');
  };
  $scope.onClickBackward2 = function(){
      window.location.href="#/addpatient/ModuleInfo/" +Module;
  };
  $scope.onClickBackward3 = function(){
      $state.go('manage.ModuleInfo');
  };
  $scope.onClickBackward4 = function(){
      window.location.href="#/manage/ModuleInfo/" +Module;
  };
  var getHTypeName= function(Type){
    for (var i=0;i<$scope.HTypeName.length;i++)
    {
      if (Type == $scope.HTypeName[i].Type)
      {
        return $scope.HTypeName[i].Name;
      }
        
    }
  };
  var getDTypeName = function(Type){
    for (var i=0;i<$scope.DTypeName.length;i++)
    {
      if (Type == $scope.DTypeName[i].Type)
      {
        return $scope.DTypeName[i].Name;
      }
        
    }
  };

  var getYesNoValue = function(Type){
    for (var i=0;i<$scope.YesNoType.length;i++)
    {
      if (Type == $scope.YesNoType[i].Type)
      {
        return $scope.YesNoType[i];
      }
    }
  };

  var getDrinkFrequencyValue = function(Type){
    for (var i=0;i<$scope.DrinkFrequency.length;i++)
    {
      if (Type == $scope.DrinkFrequency[i].Type)
      {
        return $scope.DrinkFrequency[i];
      }
    }
  };

  var getHType = function(Type){
    for (var i=0;i<$scope.HTypeName.length;i++)
    {
      if (Type == $scope.HTypeName[i].Type)
      {
        return $scope.HTypeName[i];
      }
    }
  };

  var getHName = function(Type1,Type2,index){
    Users.getHyperTensionDrugNameByType(Type1).then(function(data,status){
      $scope.HypertensionDrugArray[index].Name = data;
      for (var i=0;i<$scope.HypertensionDrugArray[index].Name.length;i++)
      {
        if (Type2 == $scope.HypertensionDrugArray[index].Name[i].Code)
        {
          $scope.HypertensionDrugData[index].Name = $scope.HypertensionDrugArray[index].Name[i];
          break;
        }
      }
    },function(data){
     $scope.getStatus = status;
    });
      
  };

  var getDType = function(Type){
    for (var i=0;i<$scope.DTypeName.length;i++)
    {
      if (Type == $scope.DTypeName[i].Type)
      {
        return $scope.DTypeName[i];
      }
    }
  };

  var getDName = function(Type1,Type2,index){
    Users.getDiabetesDrugNameByType(Type1).then(function(data,status){
      $scope.DiabetesDrugArray[index].Name = data;
      for (var i=0;i<$scope.DiabetesDrugArray[index].Name.length;i++)
      {
        if (Type2 == $scope.DiabetesDrugArray[index].Name[i].Code)
        {
          $scope.DiabetesDrugData[index].Name = $scope.DiabetesDrugArray[index].Name[i];
          break;
        }
      }
    },function(data){
     $scope.getStatus = status;
    });
  };

  // $http.get('partials/data.json').success(function(data) {
  //     $scope.ModuleInfoList = data;
  // });

  Users.getHyperTensionDrugTypeName().then(function(data,status){
        $scope.HypertensionDrugArray[0].Type = data;
        $scope.HTypeName = data;
    },function(data,status){
      $scope.getStatus = status;
  }); 

  Users.getDiabetesDrugTypeName().then(function(data,status){
      $scope.DiabetesDrugArray[0].Type = data;
      $scope.DTypeName = data;
    },function(data,status){
      $scope.getStatus = status;
  });

  Users.getYesNoType().then(function(data,status){
    $scope.YesNoType = data;
  },function(data,status){
    $scope.getStatus = status;
  });

  Users.getDrinkFrequency().then(function(data,status){
    $scope.DrinkFrequency = data;
  },function(data,status){
    $scope.getStatus = status;
  });

  Users.getquestionnaire(PatientID,Module).then(function(data,status){
    $scope.ModuleInfoList = data;
    $scope.ModuleInfoListDetail = data;
    var temparray = [];
    var count = 0;
    for (var i=0;i<$scope.ModuleInfoListDetail.length;i++)
    {
      
      if ($scope.ModuleInfoListDetail[i].Value !="")
      {
        if ($scope.ModuleInfoListDetail[i].OptionCategory == "DietHabbit")
        {
          $scope.DietHabbitValue = $scope.ModuleInfoListDetail[i].Content;
        }
        else if ($scope.ModuleInfoListDetail[i].OptionCategory == "Cm.MstHypertensionDrug")
        {
          if ($scope.ModuleInfoListDetail[i].ItemSeq > 1)
          {
            a = $scope.ModuleInfoListDetail[i].ItemSeq - 1;
            temparray.push(i);
          }
          if (a==0) {
            $scope.HypertensionDrugData[a].Type = getHType($scope.ModuleInfoListDetail[i].Value.split(',')[0]);
            getHName($scope.ModuleInfoListDetail[i].Value.split(',')[0],$scope.ModuleInfoListDetail[i].Value.split(',')[1],a);
          }
          else
          {
            $scope.HypertensionDrugArray.push({"ID":a+1,"Type":"","Name":""});
            $scope.HypertensionDrugArray[a].Type = $scope.HypertensionDrugArray[a-1].Type;
            $scope.HypertensionDrugData.push({"ID":a+1,"Type":getHType($scope.ModuleInfoListDetail[i].Value.split(',')[0]),"Name":""});
            getHName($scope.ModuleInfoListDetail[i].Value.split(',')[0],$scope.ModuleInfoListDetail[i].Value.split(',')[1],a);
          }
        }
        else if ($scope.ModuleInfoListDetail[i].OptionCategory == "Cm.MstDiabetesDrug")
        {
          if ($scope.ModuleInfoListDetail[i].ItemSeq > 1)
          {
            b = $scope.ModuleInfoListDetail[i].ItemSeq - 1;
            temparray.push(i);
          }
          if (b==0) {
            $scope.DiabetesDrugData[b].Type = getDType($scope.ModuleInfoListDetail[i].Value.split(',')[0]);
            getDName($scope.ModuleInfoListDetail[i].Value.split(',')[0],$scope.ModuleInfoListDetail[i].Value.split(',')[1],b);
          }
          else
          {
            $scope.DiabetesDrugArray.push({"ID":b+1,"Type":"","Name":""});
            $scope.DiabetesDrugArray[b].Type = $scope.DiabetesDrugArray[b-1].Type;
            $scope.DiabetesDrugData.push({"ID":b+1,"Type":getDType($scope.ModuleInfoListDetail[i].Value.split(',')[0]),"Name":""});
            getDName($scope.ModuleInfoListDetail[i].Value.split(',')[0],$scope.ModuleInfoListDetail[i].Value.split(',')[1],b);
            // $scope.DiabetesDrugArray.push({"ID":b+1,"Type":"","Name":""});
            // $scope.DiabetesDrugData.push({"ID":b+1,"Type":getDType($scope.ModuleInfoListDetail[i].Value.split(',')[0]),"Name":getDName($scope.ModuleInfoListDetail[i].Value.split(',')[0],$scope.ModuleInfoListDetail[i].Value.split(',')[1])});
          }
        }
        else if ($scope.ModuleInfoListDetail[i].OptionCategory == "DrinkFrequency")
        {
          $scope.ModuleInfoListDetail[i].Description = getDrinkFrequencyValue($scope.ModuleInfoListDetail[i].Value);
        }
        else if ($scope.ModuleInfoListDetail[i].OptionCategory == "YesNoType")
        {
          $scope.ModuleInfoListDetail[i].Description = getYesNoValue($scope.ModuleInfoListDetail[i].Value);
        }
        else 
        {
          $scope.ModuleInfoListDetail[i].Description = $scope.ModuleInfoListDetail[i].Value;
        }
      }
    }
    for (var i=0;i<temparray.length;i++)
    {
      $scope.ModuleInfoListDetail.splice(temparray[i]-count,1);
      count++;
    }
    $scope.isloaded = true;
    $ionicLoading.hide();
    //console.log($scope.ModuleInfoListDetail);
  },function(data,status){
    $scope.getStatus = status;
  });

  // $scope.YesNoType = [{"Type":"1","Name":"是"},{"Type":"2","Name":"否"},{"Type":"3","Name":"未知"}];
  // $timeout(function() { 
  
  // }, 200);

  // $timeout(function() { 
    
  // }, 100);

  $scope.getHyperTensionDrugNameByType = function(Type, $index){
    $scope.HypertensionDrugArray[$index].Name = "";
    Users.getHyperTensionDrugNameByType(Type.Type).then(function(data,status){
      $scope.HypertensionDrugArray[$index].Name = data;
    },function(data){
     $scope.getStatus = status;
    });
  };
  // $timeout(function() {
    
  // }, 100);

  $scope.getDiabetesDrugNameByType = function(Type, $index){
    $scope.DiabetesDrugArray[$index].Name = "";
    Users.getDiabetesDrugNameByType(Type.Type).then(function(data,status){
      $scope.DiabetesDrugArray[$index].Name = data;
    },function(data){
     $scope.getStatus = status;
    });
  };


  // $timeout(function() { 
  Users.getDietHabbit().then(function(data,status){
    $scope.DietHabbit = data;
    $scope.CheckboxValue = data;
  },function(data,status){
    $scope.getStatus = status;
  });
  // }, 200);

  // $timeout(function() { 
  
  // }, 150);

  //[{Patient:Patient, CategoryCode:"M", ItemCode:ItemCode, ItemSeq:ItemSeq, Value:Value, Description: "", SortNo:ItemSeq, revUserId: "sample string 4",TerminalName: "sample string 5", TerminalIP: "sample string 6",DeviceType: 1}]
  $scope.Save = function(){
    $scope.dflag = [];
    for (var k=0; k<$scope.ModuleInfoListDetail.length;k++)
    {
      
      if ($scope.ModuleInfoListDetail[k].ParentCode == ListName) {
        if ($scope.ModuleInfoListDetail[k].OptionCategory == "")
        {
          $scope.obj.push({"Patient":PatientID, "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": "1", "Value": $scope.ModuleInfoListDetail[k].Description, "Description":"", "SortNo":"1", "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});  
          $scope.dflag.push({"Flag":true});
        }
        else if ($scope.ModuleInfoListDetail[k].OptionCategory == "DietHabbit") 
        {
          if ($scope.DietHabbitValue != "" || $scope.DietHabbitValue != "请选择饮食习惯")
          {
            $scope.obj.push({"Patient":PatientID, "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": 1, "Value": $scope.DietHabbitData, "Description":"", "SortNo":1, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            $scope.dflag.push({"Flag":true});
          }
          else
          {
            $scope.obj.push({"Patient":PatientID, "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": 1, "Value": "0", "Description":"", "SortNo":1, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            $scope.dflag.push({"Flag":true});
          }
        } 
        else if ($scope.ModuleInfoListDetail[k].OptionCategory == "Cm.MstHypertensionDrug")
        {
          for (var m = 0; m < a+1; m++)
          {
            if ($scope.HypertensionDrugData[m].Name.Type !="")
            {
              $scope.obj.push({"Patient":PatientID, "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": m+1, "Value": $scope.HypertensionDrugData[m].Type.Type+","+$scope.HypertensionDrugData[m].Name.Code, "Description":"", "SortNo":m+1, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            }
            else
            {
              $scope.obj.push({"Patient":PatientID, "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": n+1, "Value": "", "Description":"", "SortNo":n+1, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            }
          }
          $scope.dflag.push({"Flag":true});
        }
        else if ($scope.ModuleInfoListDetail[k].OptionCategory == "Cm.MstDiabetesDrug")
        {
          for (var n = 0; n < b+1; n++)
          {
            if ($scope.DiabetesDrugData[n].Name.Type !="")
            {
              $scope.obj.push({"Patient":PatientID, "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": n+1, "Value": $scope.DiabetesDrugData[n].Type.Type+","+$scope.DiabetesDrugData[n].Name.Code, "Description":"", "SortNo":n+1, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            }
            else
            {
              $scope.obj.push({"Patient":PatientID, "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": n+1, "Value": "", "Description":"", "SortNo":n+1, "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
            }
          }
          $scope.dflag.push({"Flag":true});
        }
        else if ($scope.ModuleInfoListDetail[k].OptionCategory == "YesNoType" || $scope.ModuleInfoListDetail[k].OptionCategory == "DrinkFrequency")
        {
          if ($scope.ModuleInfoListDetail[k].Description != "" && typeof($scope.ModuleInfoListDetail[k].Description) != "undefined")
          {
            $scope.obj.push({"Patient":PatientID, "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": "1", "Value": $scope.ModuleInfoListDetail[k].Description.Type, "Description":"", "SortNo":"1", "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
          }
          else
          {
            $scope.obj.push({"Patient":PatientID, "CategoryCode":"M", "ItemCode": $scope.ModuleInfoListDetail[k].ItemCode, "ItemSeq": "1", "Value": "0", "Description":"", "SortNo":"1", "revUserId":"sample string 4","TerminalName":"sample string 5", "TerminalIP":"sample string 6", "DeviceType": 1});
          }
        }
        else 
        {
          $scope.dflag.push({"Flag":false});
        }
          
      }
    };
    if (Storage.get(HModule)=="No")
    {
      Users.addnewpatient(UserId,PatientID,Module).then(function(data,status){
        $scope.getStatus = data;
        if (data.result == "数据插入成功")
        {
          Users.addnewhealthcoach(UserId,PatientID,Module).then(function(data,status){
            $scope.getStatus = data.result;
            if (data.result == "数据插入成功")
            {
              Storage.set(HModule,"Yes");
            }
            else
            {
              console.log(data.result);
              return;
            }
          },function(data,status){
            $scope.getStatus = status;
            return;
          });
        }
        else
        {
          console.log(data.result);
        }
      },function(data,status){
        $scope.getStatus = status;
      });
    }
      
      Users.setPatientDetailInfo($scope.obj).then(function(data,status){
        $scope.getStatus = data;
        if (data.result == "数据插入成功")
        {
          if (Storage.get("isManage") == "Yes")
          {
            window.location.href="#/manage/ModuleInfo/" +Module;
          }
          else
          {
            window.location.href="#/addpatient/ModuleInfo/" +Module;            
          }
        }
        else
        {
          console.log(data.result);
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
                $scope.DietHabbitData = $scope.DietHabbitData.substr(1);
              }
              return $scope.DietHabbitValue;        
            }
          }
        ]
    });
    myPopup.then(function(res) {
    //console.log('Tapped!', res);
  });
  };

  $scope.DietChange = function(obj){
     for(var i = 0; i < $scope.DietHabbit.length; i++)
      {
        var f =i+1;
        if ($scope.DietHabbit[i].Name == obj.Name)
        {
            if (obj.Type == true) {
              $scope.DietHabbitValue = $scope.DietHabbitValue + "," + obj.Name;
              $scope.DietHabbitData = $scope.DietHabbitData + "," + f;
            }
            else  {
              var check = $scope.DietHabbitValue.split(',');
              var flag = $scope.DietHabbitData.split(',');
              $scope.DietHabbitValue = "";
              $scope.DietHabbitData = "";
              for (var j=0; j<check.length;j++) {
                if (check[j] == obj.Name)
                {
                  check[j] = "";
                  flag[j] = "";
                }
              };
              for (var j=0; j<check.length;j++) {
                if (check[j] !="")
                {
                  $scope.DietHabbitValue = $scope.DietHabbitValue + "," +check[j];
                  $scope.DietHabbitData = $scope.DietHabbitData + "," +flag[j];
                }
              };
            };
            break;
        }
      }
  };

  
  $scope.addhyperdrug = function(){
    a++;
    $scope.HypertensionDrugArray.push({"ID":a+1,"Type":"","Name":""});
    $scope.HypertensionDrugData.push({"ID":a+1,"Type":"","Name":""});
    Users.getHyperTensionDrugTypeName().then(function(data,status){
        $scope.HypertensionDrugArray[a].Type = data;
    },function(data,status){
      $scope.getStatus = status;
    }); 
  };
  $scope.deletehyperdrug = function(){
    if (a >0) {
      a--;
      $scope.HypertensionDrugArray.pop({"ID":a+1,"Type":"","Name":""});
      $scope.HypertensionDrugData.pop({"ID":a+1,"Type":"","Name":""});
    };
  };
  $scope.adddiabetesdrug = function(){
    b++;
    $scope.DiabetesDrugArray.push({"ID":b+1,"Type":"","Name":""});
    $scope.DiabetesDrugData.push({"ID":b+1,"Type":"","Name":""});
    Users.getDiabetesDrugTypeName().then(function(data,status){
        $scope.DiabetesDrugArray[b].Type = data;
    },function(data,status){
      $scope.getStatus = status;
    }); 
    };
  $scope.deletediabetesdrug = function(){
    if (b >0) {
      b--;
      $scope.DiabetesDrugArray.pop({"ID":b+1,"Type":"","Name":""});
      $scope.DiabetesDrugData.pop({"ID":b+1,"Type":"","Name":""});
    };
  };
}])
// LZN 20151117 预约
.controller('addappointmentCtrl',['$scope','$state','Storage','Users','Dict','$ionicLoading','PageFunc',function($scope,$state,Storage,Users,Dict,$ionicLoading,PageFunc){
   $scope.$on('$ionicView.beforeEnter', function() {
    $scope.patient={};
    $ionicLoading.show({
          template: '<ion-spinner icon="bubbles" class="spinner-calm"></ion-spinner>',
          noBackdrop: false,
          duration: 100000,
          hideOnStateChange: true
    });
    Users.getAppointmentByPatientID(Storage.get('UID'),'1',Storage.get('PatientID')).then(
      function(data){
        $scope.patient.name=data[0].name;
        $scope.patient.age=data[0].age;
        $scope.patient.module=data[0].module;
        $scope.patient.Description=data[0].Description;
        if($scope.patient.name!=null && $scope.patient.age!=null && $scope.patient.module!=null && $scope.patient.Description!=null){
          $ionicLoading.hide();
        } 
      },function(e){
        console.log(e);
      });
    });
    $scope.agree = function()
    {
      $state.go('confirmappointment')
    }
    $scope.cancel = function()
    {
      $state.go('coach.newpatients')
    }
}])
.controller('confirmappointmentCtrl',['$scope','$state','Storage','Users','userservice','Dict','$ionicLoading','$ionicModal','PageFunc','ScheduleService','$timeout',function($scope,$state,Storage,Users,userservice,Dict,$ionicLoading,$ionicModal,PageFunc,ScheduleService,$timeout){
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.patient={};
    $scope.healthcoach={};
    $ionicLoading.show({
          template: '<ion-spinner icon="bubbles" class="spinner-calm"></ion-spinner>',
          noBackdrop: false,
          duration: 100000,
          hideOnStateChange: true
        });

    var datePickerCallback = function (val) {
      if (typeof(val) === 'undefined') {
        console.log('No date selected');
      } else {
      $scope.datepickerObject.inputDate=val;
        var dd=val.getDate();
        var mm=val.getMonth()+1;
        var yyyy=val.getFullYear();
        var birthday=yyyy+'-'+mm+'-'+dd; 
        $scope.data.selectedDate=birthday;
      }
  };

  var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  var weekDaysList=["日","一","二","三","四","五","六"];
  var tt = new Date();
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
    from: new Date(),   //Optional
    to: new Date(tt.setDate(tt.getDate()+30)),    //Optional
    callback: function (val) {    //Mandatory
      datePickerCallback(val);
    }
  };  
   
    Users.getAppointmentByPatientID(Storage.get('UID'),'1',Storage.get('PatientID')).then(
      function(data){
        console.log(data);
        $scope.patient.name=data[0].name;
        $scope.patient.age=data[0].age;
        $scope.patient.module=data[0].module;
        $scope.patient.Description=data[0].Description;
      },function(e){
        console.log(e);
      });
    Users.getHealthCoachInfo(Storage.get('UID')).then(
      function(data){
        $scope.healthcoach.name=data.name;
      },function(e){
        console.log(e);
      });
    Users.getDocDtlInfo(Storage.get('UID')).then(
      function(data){
        $scope.healthcoach.Unit=data.UnitName;
        $scope.healthcoach.Dept=data.Dept;
        $scope.healthcoach.Add=$scope.healthcoach.Unit+'  '+$scope.healthcoach.Dept;
      },function(e){
        console.log(e);
      });
    if($scope.patient.name!=null && $scope.patient.age!=null && $scope.patient.module!=null && $scope.patient.Description!=null && $scope.healthcoach.name!=null && $scope.healthcoach.Add!=null){
      $ionicLoading.hide();
    }
     // 获取双方手机号
    Users.PhoneNo(Storage.get('PatientID')).then(
      function(data){
        console.log(data);
        var s="";
        for(var i=0;i<11;i++){
      
          s=s+data[i];
        };
        $scope.phoneno_patient=s;
        console.log($scope.phoneno_patient);
        },function(e){
          console.log(e);
      });
  });
    // Users.PhoneNo(Storage.get('UID')).then(
    //   function(data){
    //     console.log(data);
    //     var s="";
    //     for(var i=0;i<11;i++){
      
    //       s=s+data[i];
    //     };
    //     $scope.phoneno_coach=s;
    //     console.log($scope.phoneno_coach);
    //     },function(e){
    //       console.log(e);
    //   });
 $scope.loadingDone = false;
  

  ScheduleService.initialize();

  $scope.data = {calendar : [],selectedDate: undefined, selectedTime:undefined};

  // $scope.eventSources = [];
  $scope.events = [];
  $scope.tempDate = new Date();

  $scope.datesOptions = [];
  $ionicLoading.show({
    content: '加载中',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $timeout(function(){
    $ionicLoading.hide();
  },6666);

  var initializeCalendar = function(){


    $scope.eventSources = [$scope.events];
    $scope.uiConfig = ScheduleService.getConfig();
  }

  //  $scope.uiConfig = {
  //     calendar:{
  //       header: {
  //         left: 'prev,next today',
  //         center: 'title',
  //         right: 'month,agendaWeek,agendaDay'
  //       },
  //       height: 500,
  //       lang: 'zh-cn',
  //       scrollTime: '10:00:00',
  //       buttonIcons: false, 
  //       weekNumbers: false,
  //       editable: false,
  //       eventLimit: true
  //     }
  //   };

  // $scope.eventSources = [$scope.events];

  // $http.get('js/data.json').success(function(data) {
  //   $scope.calendar = data.calendar; 
  //   // $scope.whichartist= $state.params.aId;
  //   // //console.log($scope.whichartist);
  //   $scope.data = { showDelete: false, showReorder: false };

  // $scope.onItemDelete = function(dayIndex,item) {
  //   // $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item), 1);
  //   $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item), 1);
  // }

  // $scope.toggleStar = function(item) {
  //  item.star = !item.star;
  // }


  $ionicModal.fromTemplateUrl('my-modal3.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
   $scope.onClickConfirm = function() { 
    if(typeof($scope.data.selectedDate)!='undefined' && typeof($scope.data.selectedTime)!='undefined'){
      $scope.healthcoach.date = $scope.data.selectedDate;
      $scope.healthcoach.time = $scope.data.selectedTime;
      if($scope.healthcoach.time=='上午') $scope.healthcoach.time='8:00:00';
      if($scope.healthcoach.time=='下午') $scope.healthcoach.time='14:00:00';
      if($scope.healthcoach.time=='晚上') $scope.healthcoach.time='18:00:00';
      $scope.healthcoach.Time = $scope.healthcoach.date+' '+$scope.healthcoach.time;
      $scope.closeModal();
    }
   
  }
  $scope.onClickCancel = function(){
    $scope.closeModal();
  }

  $scope.openModal = function() {


    // console.log(dates);
    $scope.datesOptions = ScheduleService.getDates();

    $scope.modal.show();
    $scope.loadingDone2 = true;
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
    // $scope.loadingDone2 = false;
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
 $scope.$on('GotCanlendar',function(){
  // $scope.loadingDone = false;
    $scope.events.length = 0;
    $scope.events = ScheduleService.getEvents();

    if($scope.loadingDone == false){
      initializeCalendar();
      $scope.loadingDone = true;      
    }
    else{
      while($scope.eventSources.length > 0){
        $scope.eventSources.pop();
      }

      $scope.eventSources.push($scope.events);
      try{
          $scope.calendar.fullCalendar('refetchEvents');
      }
      catch(err){
      console.log("日历刷新");
       }
    }


    // try{
    //       $scope.calendar.fullCalendar('refetchEvents');
    // }
    // catch(err){
    //   console.log("日历刷新");
    // }
    // else $scope.eventSources = [$scope.events];

    // for (var i = $scope.data.calendar.length - 1; i >= 0; i--) {

    //   console.log($scope.data.calendar[i]);

    // };

    $ionicLoading.hide();
  })

  $scope.$on('newCanlendar',function(){
    console.log("newCanlendar------------broadcast aquired");
    ScheduleService.initialize();
    // console.log($scope.data.calendar);
  })

    // lrz接口保留
    // $ionicModal.fromTemplateUrl('partials/appointment/confirmappointment.html',{
    //   scope: $scope,
    //   animation: 'slide-in-up'
    // }).then(function(modal) {
    //   $scope.timemodal = modal;
    // });
    //   $scope.opentimeModal = function() {
    //     $scope.timemodal.show();
    //   };
    //   $scope.closetimeModal = function() {
    //     $scope.timemodal.hide();
    //   };
    //   $scope.$on('$destroy', function() {
    //     $scope.modalexam.remove();
    //   });


    // 

    var loading = function() {
      $ionicLoading.show({
        template:'正在预约......',
      });
    };

    var hide = function() {
      $ionicLoading.hide();
    };

    var netError = function(){
        $ionicLoading.hide();
   
        PageFunc.confirm('网络好像不太稳定', '网络错误');   
    };
    $scope.confirm = function(){
      loading();
      
      
     
  

      if($scope.patient.name==null && $scope.patient.age==null && $scope.patient.module==null && $scope.patient.Description==null && $scope.healthcoach.name==null){
        netError();
      }
      else{
        var myDate = new Date();
        var y = myDate.getFullYear();
        var m = myDate.getMonth();
        var d = myDate.getDate(); 
        var h = myDate.getHours();
        var min = myDate.getMinutes();
        var s = myDate.getSeconds();
        var m = m+1;
        var time = y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' +s;
        // if($scope.healthcoach.time=='上午') $scope.healthcoach.time='8:00:00';
        // if($scope.healthcoach.time=='下午') $scope.healthcoach.time='14:00:00';
        // if($scope.healthcoach.time=='晚上') $scope.healthcoach.time='18:00:00';
        var module='';
        if($scope.patient.module=='高血压模块') module='HM1';
        if($scope.patient.module=='糖尿病模块') module='HM2';
        if($scope.patient.module=='心力衰竭模块') module='HM3';
        $scope.reservation={
          "DoctorId": Storage.get('UID'),
          "PatientId": Storage.get('PatientID'),
          "Module": module,
          "Description": $scope.patient.Description,
          "Status": 4,
          "ApplicationTime": time,
          "AppointmentTime": $scope.healthcoach.Time,
          "AppointmentAdd": $scope.healthcoach.Add,
          "Redundancy": "haha",
          "revUserId": "1",
          "TerminalName": "1",
          "TerminalIP": "1",
          "DeviceType": 1
        }

    
        $scope.Push={
          "platform":"android",
          "Alias":Storage.get('PatientID'),
          "notification":"您有一条新的预约，请注意查收短信",
          "title":"预约",
          "id":Storage.get('UID')
        }
        
        $scope.content = $scope.healthcoach.name+','+$scope.healthcoach.date+''+$scope.healthcoach.time+','+$scope.healthcoach.Unit;
       
        // 调试写死
        // $scope.sendSMS={
        //   "mobile":"18626860001",
        //   "smsType":"confirmtoPatient",
        //   "content":$scope.content
        // }

        $scope.patientsendSMS={
          "mobile":$scope.phoneno_patient,
          "smsType":"confirmtoPatient",
          "content":$scope.content
        }

        // $scope.coachsendSMS={
        //   "mobile":$scope.phoneno_coach,
        //   "smsType":"confirmtoHealthCoach",
        //   "content":
        // }

        // userservice.PushNotification($scope.Push).then(
        //   function(data){
        //     console.log(data);
        //     },function(e){
        //     console.log(e);
        //   });
    
        // userservice.sendSMS_lzn($scope.patientsendSMS).then(
        //   function(data){
        //     },function(e){
        //     console.log(e);
        //     console.log($scope.patientsendSMS);
        //   });
        // userservice.sendSMS_lzn($scope.coachsendSMS).then(
        //   function(data){
        //     },function(e){
        //     console.log(e);
        //     console.log($scope.coachsendSMS);
        //   });
        Users.ReserveHealthCoach($scope.reservation).then(
          function(data){
            if(data.result=="数据插入成功"){
             var tempDate = $scope.data.selectedDate.split("-",3);
                console.log(tempDate);
                $scope.data.DateTime = tempDate[0] + 
                    (tempDate[1].length==2 ? tempDate[1] : '0' +tempDate[1])  + 
                    (tempDate[2].length==2 ? tempDate[2] : '0' +tempDate[2]) ;
                console.log($scope.data);
                
                $scope.data.Description = $scope.patient.name+'||'+$scope.patient.age+'||'+$scope.patient.module+'||'+$scope.patient.Description;
                $scope.data.Period = $scope.data.selectedTime;
                $scope.data.Status = 4;
                ScheduleService.postCalendar($scope.data);
                hide();

                $state.go('checkappointment') 
              }
            },function(e){
            netError();
          });
      }                                                                                          
    }
     // });
}])
.controller('checkappointmentCtrl',['$scope','$state','Storage','Users','userservice','Dict','$ionicLoading','$ionicModal','PageFunc','ScheduleService','$timeout',function($scope,$state,Storage,Users,userservice,Dict,$ionicLoading,$ionicModal,PageFunc,ScheduleService,$timeout){
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.patient={};
    $scope.healthcoach={};
    $scope.getdata={};
    $scope.Calendar={};
    $ionicLoading.show({
          template: '<ion-spinner icon="bubbles" class="spinner-calm"></ion-spinner>',
          noBackdrop: false,
          duration: 100000,
          hideOnStateChange: true
    });
    var datePickerCallback = function (val) {
      if (typeof(val) === 'undefined') {
        console.log('No date selected');
      } else {
      $scope.datepickerObject.inputDate=val;
        var dd=val.getDate();
        var mm=val.getMonth()+1;
        var yyyy=val.getFullYear();
        var birthday=yyyy+'-'+mm+'-'+dd; 
        $scope.data.selectedDate=birthday;
      }
  };

  var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  var weekDaysList=["日","一","二","三","四","五","六"];
  var tt = new Date();
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
    from: new Date(),   //Optional
    to: new Date(tt.setDate(tt.getDate()+30)),    //Optional
    callback: function (val) {    //Mandatory
      datePickerCallback(val);
    }
  };  
  

 

    Users.getAppointmentByPatientID(Storage.get('UID'),'4',Storage.get('PatientID')).then(
      function(data){
        console.log(data);
        $scope.patient.name=data[0].name;
        $scope.patient.age=data[0].age;
        $scope.patient.module=data[0].module;
        $scope.patient.Description=data[0].Description;
        $scope.healthcoach.Time=data[0].AppointmentTime;
        console.log($scope.healthcoach.Time);
        $scope.healthcoach.Add=data[0].AppointmentAdd;
        var temp = $scope.healthcoach.Time.split(' ',2);
        console.log(temp);
        $scope.healthcoach.date=temp[0];
        $scope.healthcoach.time=temp[1];
        $scope.getdata.Description = $scope.patient.name+'||'+$scope.patient.age+'||'+$scope.patient.module+'||'+$scope.patient.Description;
        if($scope.healthcoach.time=='8:00:00') $scope.getdata.Period='上午';
        if($scope.healthcoach.time=='14:00:00') $scope.getdata.Period='下午';
        if($scope.healthcoach.time=='18:00:00') $scope.getdata.Period='晚上';
        var date = $scope.healthcoach.date.split('-',3);
        console.log(date);
        $scope.getdata.DateTime = date[0]+(date[1].length==2 ? date[1] : '0' +date[1])+(date[2].length==2 ? date[2] : '0' +date[2]) ;
        console.log($scope.getdata);
        console.log($scope.healthcoach.date);
        console.log($scope.healthcoach.time);
        console.log($scope.healthcoach.Time);
      },function(e){
        console.log(e);
      });
    Users.getHealthCoachInfo(Storage.get('UID')).then(
      function(data){
        $scope.healthcoach.name=data.name;
      },function(e){
        console.log(e);
      });
    Users.getDocDtlInfo(Storage.get('UID')).then(
      function(data){
        $scope.healthcoach.Unit=data.UnitName;
        // $scope.healthcoach.Dept=data.Dept;
        // $scope.healthcoach.Add=$scope.healthcoach.Unit+'  '+$scope.healthcoach.Dept;
      },function(e){
        console.log(e);
      });
    if($scope.patient.name!=null && $scope.patient.age!=null && $scope.patient.module!=null && $scope.patient.Description!=null && $scope.healthcoach.name!=null && $scope.healthcoach.Add!=null && $scope.healthcoach.Time!=null){
      $ionicLoading.hide();
    }
 // 获取双方手机号
    Users.PhoneNo(Storage.get('PatientID')).then(
      function(data){
        console.log(data);
        var s="";
        for(var i=0;i<11;i++){
      
          s=s+data[i];
        };
        $scope.phoneno_patient=s;
        console.log($scope.phoneno_patient);
        },function(e){
          console.log(e);
      });
    });
   
    // Users.PhoneNo(Storage.get('UID')).then(
    //   function(data){
    //     console.log(data);
    //     var s="";
    //     for(var i=0;i<11;i++){
      
    //       s=s+data[i];
    //     };
    //     $scope.phoneno_coach=s;
    //     console.log($scope.phoneno_coach);
    //     },function(e){
    //       console.log(e);
    //   });
$scope.loadingDone = false;
  

  ScheduleService.initialize();

  $scope.data = {calendar : [],selectedDate: undefined, selectedTime:undefined};

  // $scope.eventSources = [];
  $scope.events = [];
  $scope.tempDate = new Date();

  $scope.datesOptions = [];
  $ionicLoading.show({
    content: '加载中',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $timeout(function(){
    $ionicLoading.hide();
  },6666);

  var initializeCalendar = function(){


    $scope.eventSources = [$scope.events];
    $scope.uiConfig = ScheduleService.getConfig();
  }

  //  $scope.uiConfig = {
  //     calendar:{
  //       header: {
  //         left: 'prev,next today',
  //         center: 'title',
  //         right: 'month,agendaWeek,agendaDay'
  //       },
  //       height: 500,
  //       lang: 'zh-cn',
  //       scrollTime: '10:00:00',
  //       buttonIcons: false, 
  //       weekNumbers: false,
  //       editable: false,
  //       eventLimit: true
  //     }
  //   };

  // $scope.eventSources = [$scope.events];

  // $http.get('js/data.json').success(function(data) {
  //   $scope.calendar = data.calendar; 
  //   // $scope.whichartist= $state.params.aId;
  //   // //console.log($scope.whichartist);
  //   $scope.data = { showDelete: false, showReorder: false };

  // $scope.onItemDelete = function(dayIndex,item) {
  //   // $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item), 1);
  //   $scope.calendar[dayIndex].schedule.splice($scope.calendar[dayIndex].schedule.indexOf(item), 1);
  // }

  // $scope.toggleStar = function(item) {
  //  item.star = !item.star;
  // }


  $ionicModal.fromTemplateUrl('my-modal4.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.onClickConfirm = function() { 
    if(typeof($scope.data.selectedDate)!='undefined' && typeof($scope.data.selectedTime)!='undefined'){
      $scope.healthcoach.date = $scope.data.selectedDate;
      $scope.healthcoach.time = $scope.data.selectedTime;
      if($scope.healthcoach.time=='上午') $scope.healthcoach.time='8:00:00';
      if($scope.healthcoach.time=='下午') $scope.healthcoach.time='14:00:00';
      if($scope.healthcoach.time=='晚上') $scope.healthcoach.time='18:00:00';
      $scope.healthcoach.Time = $scope.healthcoach.date+' '+$scope.healthcoach.time;
      $scope.closeModal();
    }
   
  }
  $scope.onClickCancel = function(){
    $scope.closeModal();
  }
  $scope.openModal = function() {


    // console.log(dates);
    $scope.datesOptions = ScheduleService.getDates();

    $scope.modal.show();
    $scope.loadingDone2 = true;
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
    // $scope.loadingDone2 = false;
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
   $scope.$on('GotCanlendar',function(){
  // $scope.loadingDone = false;
    $scope.events.length = 0;
    $scope.events = ScheduleService.getEvents();

    if($scope.loadingDone == false){
      initializeCalendar();
      $scope.loadingDone = true;      
    }
    else{
      while($scope.eventSources.length > 0){
        $scope.eventSources.pop();
      }

      $scope.eventSources.push($scope.events);
      try{
          $scope.calendar.fullCalendar('refetchEvents');
      }
      catch(err){
      console.log("日历刷新");
       }
    }


    // try{
    //       $scope.calendar.fullCalendar('refetchEvents');
    // }
    // catch(err){
    //   console.log("日历刷新");
    // }
    // else $scope.eventSources = [$scope.events];

    // for (var i = $scope.data.calendar.length - 1; i >= 0; i--) {

    //   console.log($scope.data.calendar[i]);

    // };

    $ionicLoading.hide();
  })

  $scope.$on('newCanlendar',function(){
    console.log("newCanlendar------------broadcast aquired");
    ScheduleService.initialize();
    // console.log($scope.data.calendar);
  })

    // lrz接口保留
    // $ionicModal.fromTemplateUrl('partials/appointment/confirmappointment.html',{
    //   scope: $scope,
    //   animation: 'slide-in-up'
    // }).then(function(modal) {
    //   $scope.timemodal = modal;
    // });
    //   $scope.opentimeModal = function() {
    //     $scope.timemodal.show();
    //   };
    //   $scope.closetimeModal = function() {
    //     $scope.timemodal.hide();
    //   };
    //   $scope.$on('$destroy', function() {
    //     $scope.modalexam.remove();
    //   });
  

   var loading = function() {
      $ionicLoading.show({
        template:'正在预约......',
      });
    };

    var hide = function() {
      $ionicLoading.hide();
    };

    var netError = function(){
        $ionicLoading.hide();
   
        PageFunc.confirm('网络好像不太稳定', '网络错误');   
    };
  $scope.back = function(){
    $state.go('coach.newpatients')
  }
  $scope.change1 = function (value){
　if(value=='1'){
　document.getElementById('txt1').disabled=false;　
　}else{
　document.getElementById('txt1').disabled=true;　
　}
}
  $scope.change2 = function (value){
　if(value=='1'){
　document.getElementById('txt2').disabled=false;　
　}else{
　document.getElementById('txt2').disabled=true;　
　}
}


  $scope.modify = function (){
    $scope.change1(1);
    $scope.change2(1);
  }
   $scope.save = function (){
    console.log($scope.healthcoach.Add);

    $scope.change1(0);
    $scope.change2(0);
    var myDate = new Date();
    var y = myDate.getFullYear();
    var m = myDate.getMonth();
    var d = myDate.getDate(); 
    var h = myDate.getHours();
    var min = myDate.getMinutes();
    var s = myDate.getSeconds();
    var m = m+1;
    var time = y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' +s;
    // if($scope.healthcoach.time=='上午') $scope.healthcoach.time='8:00:00';
    // if($scope.healthcoach.time=='下午') $scope.healthcoach.time='14:00:00';
    // if($scope.healthcoach.time=='晚上') $scope.healthcoach.time='18:00:00';
     var module='';
        if($scope.patient.module=='高血压模块') module='HM1';
        if($scope.patient.module=='糖尿病模块') module='HM2';
        if($scope.patient.module=='心力衰竭模块') module='HM3';
    $scope.reservation={
      "DoctorId": Storage.get('UID'),
      "PatientId": Storage.get('PatientID'),
      "Module": module,
      "Description": $scope.patient.Description,
      "Status": 4,
      "ApplicationTime": time,
      "AppointmentTime": $scope.healthcoach.Time,
      "AppointmentAdd": $scope.healthcoach.Add,
      "Redundancy": "haha",
      "revUserId": "1",
      "TerminalName": "1",
      "TerminalIP": "1",
      "DeviceType": 1
      }
    
console.log($scope.reservation.AppointmentTime);
    // $scope.coachsendSMS={
    //   "mobile":$scope.phoneno_coach,
    //   "smsType":"confirmtoHealthCoach",
    //   "content":
    // }
    $scope.Push={
          "platform":"android",
          "Alias":Storage.get('PatientID'),
          "notification":"您有一条新的预约，请注意查收短信",
          "title":"预约",
          "id":Storage.get('UID')
        }
        $scope.content = $scope.healthcoach.name+','+$scope.healthcoach.Time+','+$scope.healthcoach.Unit;
        console.log($scope.content);
        // 写死
    $scope.sendSMS={
          "mobile":"18626860001",
          "smsType":"confirmtoPatient",
          "content":$scope.content
        }
    // $scope.patientsendSMS={
    //       "mobile":$scope.phoneno_patient,
    //       "smsType":"confirmtoPatient",
    //       "content":$scope.content,
    //     }
    // userservice.PushNotification($scope.Push).then(
    //       function(data){
    //         console.log(data);
    //         console.log($scope.Push);
    //         },function(e){
    //         console.log(e);
    //       });
     // userservice.sendSMS_lzn($scope.sendSMS).then(
     //      function(data){
     //        },function(e){
     //        console.log(e);
     //        console.log($scope.sendSMS);
     //      });
    // userservice.sendSMS_lzn($scope.patientsendSMS).then(
    //       function(data){
    //         },function(e){
    //         console.log(e);
    //         console.log($scope.patientsendSMS);
    //       });
    // userservice.sendSMS_lzn( $scope.coachsendSMS).then(
    //       function(data){
    //         },function(e){
    //         console.log(e);
    //         console.log( $scope.coachsendSMS);
    //       });
    Users.ReserveHealthCoach($scope.reservation).then(
          function(data){
            if(data.result=="数据插入成功"){
              console.log($scope.reservation.AppointmentTime);
              if($scope.data.selectedDate!=null){
                $scope.Calendar = ScheduleService.getCalendarByParams($scope.getdata);
                console.log($scope.getdata);
                console.log($scope.Calendar);
                if(typeof($scope.Calendar)!='undefined'){
                  ScheduleService.cancelOneCalendar($scope.Calendar);
                }
                var tempDate = $scope.data.selectedDate.split("-",3);
                console.log(tempDate);
                $scope.data.DateTime = tempDate[0] + 
                    (tempDate[1].length==2 ? tempDate[1] : '0' +tempDate[1])  + 
                    (tempDate[2].length==2 ? tempDate[2] : '0' +tempDate[2]) ;
                console.log($scope.data);
                
                $scope.data.Description = $scope.patient.name+'||'+$scope.patient.age+'||'+$scope.patient.module+'||'+$scope.patient.Description;
                $scope.data.Period = $scope.data.selectedTime;
                $scope.data.Status = 4;
                ScheduleService.postCalendar($scope.data);

              }
              hide();
              $state.go('coach.newpatients') 
              
            }
          },function(e){
              console.log($scope.reservation);
            netError();
          });
   
  }
}])

.controller('newpatientCtrl',['$scope','$state','Storage','Users','Dict','$ionicLoading','PageFunc',function($scope,$state,Storage,Users,Dict,$ionicLoading,PageFunc){

  
  
  // $scope.PhoneNo="";
  $scope.onClickBack=function(){
    $state.go('coach.home')
  }
  $scope.PhoneNo={pn:''};
  var loading = function() {
      $ionicLoading.show({
        template:'处理中......',
      });
    };

    var hide = function() {
        $ionicLoading.hide();
    };

    var netError = function(){
        $ionicLoading.hide();
   
        PageFunc.confirm('网络好像不太稳定', '网络错误');   
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
            // $scope.logStatus='正在注册';
            // Dict.GetNo('17','{TargetDate}').then(
            //  function(data){
            //    var PatientID=(data.result);
            //    console.log(PatientID);
            //    Storage.set('PatientID',PatientID);
            //    hide();
            //    $state.go('new.basicinfo')
            //  },function(e){
            //    console.log(e);
            //  }); 
            hide();   
            $state.go('addpatient.basicinfo')
          }
          else{
            Storage.set('newPatientID',id);
            hide();
            $state.go('addpatient.basicinfo') 
          }
        },function(e){
          console.log(e);
          netError();
        });     
    }
  }

}])
.controller('newbasicinfoCtrl',['$scope','$state','Storage','Users','Dict','$ionicPopup','$timeout','$ionicScrollDelegate','$ionicLoading','userservice','GetBasicInfo','BasicDtlInfo','PageFunc',function($scope,$state,Storage,Users,Dict,$ionicPopup,$timeout,$ionicScrollDelegate,$ionicLoading,userservice,GetBasicInfo,BasicDtlInfo,PageFunc){
  $scope.scrollBottom = function() {
      $ionicScrollDelegate.scrollBottom(true);
    };
  $scope.scrollTop = function() {
      $ionicScrollDelegate.scrollTop(true);
    };

  $scope.$on('$ionicView.beforeEnter', function() { 
   

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
      "DoctorId": Storage.get('UID'),
      "InsuranceType": "",
      "InvalidFlag": 0,
      "piUserId": "lzn",
      "piTerminalName": "sample string 11",
      "piTerminalIP": "sample string 12",
      "piDeviceType": 13
      };
      

      
      

      

    $scope.users.UserId=Storage.get('newPatientID');


    var  phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    if($scope.users.UserId!=null && !phoneReg.test($scope.PhoneNo)){
      Users.PhoneNo($scope.users.UserId).then(
        function(data){
          console.log(data);
          var s="";
          for(var i=0;i<11;i++){
        
            s=s+data[i];
          };

          $scope.PhoneNo=s;
          console.log($scope.PhoneNo);
        },function(e){
            console.log(e);
        });
    }
  });

  $scope.$on('$ionicView.afterLeave', function() {
    Storage.rm('newPatientID');
    Storage.rm('phoneno');
  });

  $scope.users={
    "UserId":Storage.get('newPatientID'),
    "UserName": "",
    "Birthday": "",
    "Gender": "",
    "BloodType": "",
    "IDNo": "",
    "DoctorId": Storage.get('UID'),
    "InsuranceType": "",
    "InvalidFlag": 0,
    "piUserId": "lzn",
    "piTerminalName": "sample string 11",
    "piTerminalIP": "sample string 12",
    "piDeviceType": 13
    };
    
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

  $scope.users.Birthday=Storage.get('b');
  // console.log($scope.users.Birthday);
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

    $scope.patientid = Storage.get('newPatientID');
    $scope.HomeAddress={
      "Patient":$scope.patientid,
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
    // $scope.HomeAddress.Patient=Storage.get('PatientID');

  $scope.PhoneNumber={
      "Patient":$scope.patientid,
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
    // $scope.PhoneNumber.Patient=Storage.get('PatientID');

    $scope.Nationality={
      "Patient":$scope.patientid,
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
    // $scope.Nationality.Patient=Storage.get('PatientID');

    $scope.Occupation={
      "Patient":$scope.patientid,
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
    // $scope.Occupation.Patient=Storage.get('PatientID');

    $scope.EmergencyContact={
      "Patient":$scope.patientid,
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
    // $scope.EmergencyContact.Patient=Storage.get('PatientID');


    $scope.EmergencyContactPhoneNumber={
      "Patient":$scope.patientid,
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

    // $scope.EmergencyContactPhoneNumber.Patient=Storage.get('PatientID');
  // var timeout = function() {
  //  var Timeout = $ionicPopup.alert({
    //    title: '网络错误',
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
   
      
  Dict.Type("AboBloodType").then(
      function(data){
        $scope.BloodTypes=[];
        for(var i=0;i<5;i++){
          $scope.BloodTypes[i]=data[i].Name;
        };
        // console.log($scope.BloodTypes);
        if($scope.BloodTypes!=""){
          Dict.Type("SexType").then(
            function(data){
              $scope.Genders=[];
              for(var i=0;i<4;i++){
                $scope.Genders[i]=data[i].Name;
              }
              // console.log($scope.Genders);
              // console.log(data);
              if($scope.Genders!=""){
                Dict.GetInsuranceType().then(
                  function(data){
                    $scope.InsuranceTypes=[];
                    for(var i=0;i<data.length;i++){
                      $scope.InsuranceTypes[i]=data[i].Name;
                    };
                    // console.log($scope.InsuranceTypes);
                  
                    // $scope.InsuranceTypes=data.Name;
                    // console.log($scope.InsuranceTypes);
                    if($scope.InsuranceTypes!=""){
                      console.log($scope.users.UserId);
                      if($scope.users.UserId!=null){
                      GetBasicInfo.GetBasicInfoByPid($scope.users.UserId).then(
                        function(data){
                          console.log(data);
                          
                          $scope.users.UserName=data.UserName;
                          if(data.Birthday!=null && data.Birthday!=NaN){
                            $scope.users.Birthday=data.Birthday;
                            $scope.users.Birthday=parseInt($scope.users.Birthday);
                            var a=Math.floor($scope.users.Birthday/10000);
                            var b=$scope.users.Birthday-a*10000;
                            var c=Math.floor(b/100);
                            var d=b-c*100;
                            $scope.B=a+'/'+c+'/'+d;
                          }
                          $scope.users.Gender=data.Gender;
                          if($scope.users.Gender=='1') $scope.users.Gender='男性';
                          if($scope.users.Gender=='2') $scope.users.Gender='女性';
                          if($scope.users.Gender=='3') $scope.users.Gender='其他';
                          if($scope.users.Gender=='4') $scope.users.Gender='未知';
                          $scope.users.BloodType=data.BloodType;
                          if($scope.users.BloodType=='1') $scope.users.BloodType='A型';
                          if($scope.users.BloodType=='2') $scope.users.BloodType='B型';
                          if($scope.users.BloodType=='3') $scope.users.BloodType='O型';
                          if($scope.users.BloodType=='4') $scope.users.BloodType='AB型';
                          if($scope.users.BloodType=='5') $scope.users.BloodType='其他';

                          $scope.users.IDNo=data.IDNo;
                          $scope.users.DoctorId= Storage.get('UID');
                          $scope.users.InsuranceType=data.InsuranceType;
                          console.log($scope.users);
                          
                          if(data!=""){
                            BasicDtlInfo.GetBasicDtlInfo($scope.users.UserId).then(
                              function(data){
                                console.log(data);
                                $scope.HomeAddress.Value=data.HomeAddress;
                                if(data.PhoneNumber!="") $scope.PhoneNumber.Value=data.PhoneNumber;
                                $scope.Nationality.Value=data.Nationality;
                                $scope.Occupation.Value=data.Occupation;
                                $scope.EmergencyContact.Value=data.EmergencyContact;
                                $scope.EmergencyContactPhoneNumber.Value=data.EmergencyContactPhoneNumber;
                              },function(e){
                                console.log(e);
                              });
                          }
                        },function(e){
                          console.log(e);
                        });
                    }

                    }
                    

                    
                  },function(e){
                  console.log(e);
                });
              }
            },function(e){
              console.log(e);
          });
        }
    },function(e){
        console.log(e);
    });


  
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
  var netError = function(){
    $ionicLoading.hide();
   
    PageFunc.confirm('网络好像不太稳定', '网络错误');   
    };
    var hide = function() {
        $ionicLoading.hide();
    };
    

  $scope.save = function(){
    var detail = [$scope.HomeAddress,$scope.PhoneNumber,$scope.Nationality,$scope.Occupation,$scope.EmergencyContact,$scope.EmergencyContactPhoneNumber];
    if(Storage.get('b')!=null)

  $scope.users.Birthday=Storage.get('b');
// $scope.PhoneNumber.Value=Storage.get('phoneno');
    // if(){
      // if($scope.users.InsuranceType!='') $scope.users.InsuranceType = $scope.users.InsuranceType.Name;
    
      // if($scope.users.Gender!='') $scope.users.Gender = $scope.users.Gender.Name;
      // if($scope.users.BloodType!='') $scope.users.BloodType = $scope.users.BloodType.Name;
    // }
    loading();
    
    if($scope.users.Gender =='男性') $scope.users.Gender=1;
    if($scope.users.Gender =='女性') $scope.users.Gender=2;
    if($scope.users.Gender =='其他') $scope.users.Gender=3;
    if($scope.users.Gender =='未知') $scope.users.Gender=4;

    // // 男用1表示，女用0表示
    // if ($scope.users.Gender == '男') $scope.users.Gender=1;
    // if($scope.users.Gender == '女') $scope.users.Gender=0;
    
    if($scope.users.BloodType == 'A型' || $scope.users.BloodType == '1') $scope.users.BloodType=1;
    if($scope.users.BloodType == 'B型' || $scope.users.BloodType == '2') $scope.users.BloodType=2;
    if($scope.users.BloodType == 'O型' || $scope.users.BloodType == '3') $scope.users.BloodType=3;
    if($scope.users.BloodType == 'AB型' || $scope.users.BloodType =='4') $scope.users.BloodType=4;
    if($scope.users.BloodType == '其他' || $scope.users.BloodType =='5') $scope.users.BloodType=5;
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
    var p='';
    // console.log($scope.users.UserId);
    if($scope.users.UserId!=null){
     
      userservice.Roles($scope.users.UserId).then(
        function(data){
          // console.log(data);
          var l=data.length;
          
          for(var i=0;i<l;i++) {
            if (data[i]=='Patient'){
              p=1;
              console.log(p);
            }
          };
          if(p==1){
            Users.PatientBasicInfo($scope.users).then(
              function(data){
                console.log($scope.users.InsuranceType);
                console.log($scope.users.Gender);
                console.log($scope.users.BloodType);
                console.log($scope.users.Birthday);
                
                if(data.result=='数据插入成功'){
                  Users.PatientBasicDtlInfo(detail).then(
                    function(data){
                      
                      
                      hide();
                      a();
                      Storage.set("PatientID",Storage.get("newPatientID"));
                      $state.go('addpatient.clinicinfo');
                    },function(e){
                      
                      console.log(e);
                      netError();
                      // hide();
                      // a();
                      // $state.go('addpatient.clinicinfo');
                    });
                  }
                },function(e){
                  console.log($scope.users);
                  console.log($scope.users.Birthday);
                  console.log(e);
                
                  hide();
                  b();
                });
                }
          if(p==0){
            userservice.userRegister("PhoneNo",$scope.PhoneNo,$scope.users.UserName,"123456","Patient").then(
        function(data){
          if(data.result=='新建角色成功，密码与您已有账号一致'){
            // Users.UID('PhoneNo',$scope.PhoneNo).then(
            //   function(data){
            //     $scope.patientid=data.result;
            //     $scope.users.UserId=data.result;
            //     console.log($scope.patientid);
            //     console.log($scope.users.UserId);
            //     if($scope.users.UserId!=null){
                  Users.PatientBasicInfo($scope.users).then(
                    function(data){
                      
                      console.log($scope.users.Birthday);
                      // $timeout(2000);
                      if(data.result=='数据插入成功'){
                        Users.PatientBasicDtlInfo(detail).then(
                          function(data){
                            hide();
                            a();
                            Storage.set("PatientID",Storage.get("newPatientID"));
                            $state.go('addpatient.clinicinfo');
                          },function(e){
                            console.log(e);
                            netError();
                            // hide();
                            // a();
                            //$state.go('addpatient.clinicinfo');
                          });
                      }
                    },function(e){
                      console.log(e);
                      console.log($scope.users.Birthday);
                      hide();
                      b();
                    });
                }
              },function(e){
                console.log(e);
                hide();
              });
          }
        // },function(e){
        //     console.log()
        //     console.log(e);
        // });
        //   }
        //   console.log('qwrwewerest'+p);别管后4行
        },function(e){
            console.log(e);
            netError();
            // hide();
        });
    }
    else{
      userservice.userRegister("PhoneNo",$scope.PhoneNo,$scope.users.UserName,"123456","Patient").then(
        function(data){
          if(data.result=='注册成功'){
            Users.UID('PhoneNo',$scope.PhoneNo).then(
              function(data){
                $scope.patientid=data.result;
                $scope.users.UserId=data.result;
                console.log($scope.patientid);
                console.log($scope.users.UserId);
                Storage.set('newPatientID',data.result);
                $scope.HomeAddress.Patient=data.result;
                $scope.PhoneNumber.Patient=data.result;
                $scope.Nationality.Patient=data.result;
                $scope.Occupation.Patient=data.result;
                $scope.EmergencyContact.Patient=data.result;
                $scope.EmergencyContactPhoneNumber.Patient=data.result;
                if($scope.users.UserId!=null && $scope.patientid!=null &&  $scope.EmergencyContactPhoneNumber.Patient!=null){
                  Users.PatientBasicInfo($scope.users).then(
                    function(data){
                      
                      console.log($scope.users.Birthday);
                      // $timeout(2000);
                      if(data.result=='数据插入成功'){
                        Users.PatientBasicDtlInfo(detail).then(
                          function(data){
                            hide();
                            a();
                            Storage.set("PatientID",Storage.get("newPatientID"));
                            $state.go('addpatient.clinicinfo');
                          },function(e){
                            console.log(e);
                            netError();
                            // hide();
                            a();
                            //$state.go('addpatient.clinicinfo');
                          });
                      }
                    },function(e){
                      console.log(e);
                      console.log($scope.users);
                      console.log($scope.users.Birthday);
                      hide();
                      b();
                    });
                }
              },function(e){
                console.log(e);
                netError();
                // hide();
              });
          }
        },function(e){
            console.log()
            console.log(e);
            netError();
            // hide();
        });
          
    }
    // Storage.set('PatientID',$scope.users.UserId);
    // console.log(p);
    // if(p!=1){
    //  Users.Register("PhoneNo",$scope.PhoneNo,$scope.users.UserName,"123456","Patient").then(
    //    function(data){
    //      if(data.result=='注册成功'){
    //        Users.UID('PhoneNo',$scope.PhoneNo).then(
    //          function(data){
    //            $scope.patientid=data.result;
    //            $scope.users.UserId=data.result;
    //            console.log($scope.patientid);
    //            console.log($scope.users.UserId);
    //            if($scope.users.UserId!=null){
    //              Users.BasicInfo($scope.users).then(
    //                function(data){
                      
    //                  console.log($scope.users.Birthday);
    //                  // $timeout(2000);
    //                  if(data.result=='数据插入成功'){
    //                    Users.BasicDtlInfo(detail).then(
    //                      function(data){
    //                        hide();
    //                        a();
    //                        $state.go('new.clinicinfo');
    //                      },function(e){
    //                        console.log(e);
    //                        hide();
    //                        a();
    //                        $state.go('new.clinicinfo');
    //                      });
    //                  }
    //                },function(e){
    //                  console.log(e);
    //                  console.log($scope.users.Birthday);
    //                  hide();
    //                  b();
    //                });
    //            }
    //          },function(e){
    //            console.log(e);
    //          });
    //      }
    //    },function(e){
    //        console.log()
    //        console.log(e);
    //    });
    // // }
      // },function(e){
      //  console.log(e);
      // });
    
    // else{Users.BasicInfo($scope.users).then(
    //    function(data){
    //      console.log($scope.users.InsuranceType);
    //      console.log($scope.users.Gender);
    //      console.log($scope.users.BloodType);
    //      console.log($scope.users.Birthday);
          
    //      if(data.result=='数据插入成功'){
    //        Users.BasicDtlInfo(detail).then(
    //          function(data){
                
                
    //            hide();
    //            a();
    //            $state.go('new.clinicinfo');
    //          },function(e){
                
    //            console.log(e);
    //            hide();
    //            a();
    //            $state.go('new.clinicinfo');
    //          });
    //        }
    //      },function(e){
    //        console.log(e);
    //      console.log($scope.users.Birthday);
    //        hide();
    //        b();
    //      });
    // }
  }

  $scope.reset = function(){
    $scope.users={
      "UserId":Storage.get('newPatientID'),
      "UserName": "",
      "Birthday": "",
      "Gender": "",
      "BloodType": "",
      "IDNo": "",
      "DoctorId": "",
      "InsuranceType": "",
      "InvalidFlag": 0,
      "piUserId": "lzn",
      "piTerminalName": "sample string 11",
      "piTerminalIP": "sample string 12",
      "piDeviceType": 13
    };
    $scope.HomeAddress={
        "Patient":Storage.get('newPatientID'),
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
        "Patient":Storage.get('newPatientID'),
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
        "Patient":Storage.get('newPatientID'),
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
        "Patient":Storage.get('newPatientID'),
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
        "Patient":Storage.get('newPatientID'),
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
        "Patient":Storage.get('newPatientID'),
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
    detail=[];
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

//LRZ 20151104 几个bug修复
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
    //不显示没填写的项目 lrz20151103
    for (var i = $scope.newRisks.length - 1; i >= 0; i--) {
      if(typeof($scope.newRisks[i].M1) == 'undefined' 
        || typeof($scope.newRisks[i].M1.SBP) == 'undefined' 
        || typeof($scope.newRisks[i].M1.DBP) == 'undefined')
        $scope.newRisks[i].M1show = false;
      else  $scope.newRisks[i].M1show = true;
        // console.log($scope.newRisks[i].M1show);
      if(typeof($scope.newRisks[i].M2) == 'undefined' || 
         typeof($scope.newRisks[i].M2.AssessmentTime) == 'undefined' ||
         typeof($scope.newRisks[i].M2.Period) == 'undefined' ||
         typeof($scope.newRisks[i].M2.Glucose) == 'undefined')
        $scope.newRisks[i].M2show = false;
      else $scope.newRisks[i].M2show = true;
    };    
    // $ionicSlideBoxDelegate.$getByHandle('slide1').enableSlide(true);
    if($scope.whichone != undefined){
      for (var i = $scope.newRisks.length - 1; i >= 0; i--) {
        if($scope.newRisks[i].num == $scope.whichone) {
          $scope.index = i;
          console.log($scope.newRisks[$scope.index]);
          if(($scope.newRisks[$scope.index].M1show != $scope.newRisks[$scope.index].M2show)){
              
              // $ionicSlideBoxDelegate.$getByHandle('my-handle').slide(($scope.newRisks[$scope.index].M1show)?0:1,500);
              console.log('参数不全，禁止了滑动');
              // $ionicSlideBoxDelegate.$getByHandle('my-handle').enableSlide(false);
          }
          // else $ionicSlideBoxDelegate.$getByHandle('slide1').enableSlide(true);
          break;
        }
      };

    // console.log($scope.newRisks[$scope.index]);  
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
              "now": (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? -1000:$scope.newRisks[$scope.index].M1.SBP), //params
              "target": 120               //params

          }, {
              "type": "舒张压",
              "state1": 20+80,
              "state2": 20,
              "state3": 20,
              "state4": 20,
              "state5": 20,
              "now":  (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? -1000:$scope.newRisks[$scope.index].M1.DBP),         //params
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
              "balloonText": "<b>[[title]]</b><br><span style='font-size:40px'>[[category]]: <b>[[value]]</b></span>",
              "fillAlphas": 0,
              "columnWidth": 0.5,
              "lineThickness": 5,
              "labelText": "[[value]]"+" 当前",
              "clustered": false,
              "lineAlpha": 1.5,
              "stackable": false,
              "columnWidth": 0.618,
              "noStepRisers": true,
              "title": "当前",
              "type": "step",
              "color": "#000000",
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
              "bullet": (typeof($scope.newRisks[$scope.index].M2) === 'undefined' ? -100:$scope.newRisks[$scope.index].M2.Glucose)
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
              "lineThickness": 5,
              "fillAlphas": 0,
              "labelText": "[[value]]"+" 当前",
              "lineColor": "#000000", 
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
    }
    $scope.data = { showDelete: false, showReorder: false };
    $scope.dbtshow = false;
  });
    

  $scope.doRefresh = function(){
    console.log("doing refreshing");
    // $scope.userid = Storage.get('UID');
    // $scope.userid = "PID201506170002";
    $scope.userid = Storage.get('PatientID');
    Patients.getEvalutionResults($scope.userid).then(function(dat){
      $scope.risks = dat;
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

      //不显示没填写的项目 lrz20151103
      for (var i = $scope.newRisks.length - 1; i >= 0; i--) {
        if(typeof($scope.newRisks[i].M1) == 'undefined' 
          || typeof($scope.newRisks[i].M1.SBP) == 'undefined' 
          || typeof($scope.newRisks[i].M1.DBP) == 'undefined')
          $scope.newRisks[i].M1show = false;
        else  $scope.newRisks[i].M1show = true;
          console.log($scope.newRisks[i].M1show);
        if(typeof($scope.newRisks[i].M2) == 'undefined' || 
           typeof($scope.newRisks[i].M2.AssessmentTime) == 'undefined' ||
           typeof($scope.newRisks[i].M2.Period) == 'undefined' ||
           typeof($scope.newRisks[i].M2.Glucose) == 'undefined')
          $scope.newRisks[i].M2show = false;
        else $scope.newRisks[i].M2show = true;
      };


      $scope.data = { showDelete: false, showReorder: false };
      $scope.dbtshow = false;
      $scope.$broadcast('scroll.refreshComplete'); 
    });
  }

  
  $scope.onClickEvaluation = function(){
      //open a new page to collect patient info  
      $state.go('addpatient.riskquestion');
  }
  $scope.onClickEvaluation1 = function(){
    $state.go('Independent.riskquestion');
  }

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

  $scope.onClickBackward1 = function(){
      // $state.go("risk");
      $state.go('Independent.risk');
  }
  $scope.onClickBackward12 = function(){
      // $state.go("risk");
      $state.go('manage.plan');
  }
  $scope.NextPage = function(){
    window.location.href="#/addpatient/create"
  };
  $scope.BacktoManage = function(){
    window.location.href="#/manage/plan";
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
  $scope.$on('NewEvaluationSubmit', function () {
    console.log("检测到有新的提交，刷新");
    $scope.doRefresh();
  })
}])

//LRZ 20151117 新的风险评估页面列表controller
.controller('NewRiskCtrl',['$state','$scope','Patients','$state','$ionicSlideBoxDelegate','$ionicHistory','Storage','RiskService','$ionicLoading','$timeout',
  function($state,$scope,Patients,$state,$ionicSlideBoxDelegate,$ionicHistory,Storage,RiskService,$ionicLoading,$timeout){
  
    console.log("doing refreshing");
    RiskService.initial();

    $ionicLoading.show({
      template: "载入中"
    });

    $timeout(function(){
      $ionicLoading.hide();
    },6000);


      // $scope.chart = AmCharts.makeChart("chartdiv",$scope.data1);
      // $scope.chart2 = AmCharts.makeChart("chartdiv2",$scope.data2);
    
    $scope.data = { showDelete: false, showReorder: false };
    

  $scope.doRefresh = function(){
    RiskService.initial();
  }

  
  $scope.onClickEvaluation = function(){
      //open a new page to collect patient info  
      $state.go('addpatient.riskquestion');
  }
  $scope.onClickEvaluation1 = function(){
    $state.go('Independent.riskquestion');
  }

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

  $scope.onClickBackward1 = function(){
      // $state.go("risk");
      $state.go('Independent.risk');
  }
  $scope.onClickBackward12 = function(){
      // $state.go("risk");
      $state.go('manage.plan');
  }
  $scope.NextPage = function(){
    window.location.href="#/addpatient/create"
  };
  $scope.BacktoManage = function(){
    window.location.href="#/manage/plan";
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
  $scope.$on('NewEvaluationSubmit', function () {
    console.log("检测到有新的提交，刷新");
    RiskService.initial();

  })

  $scope.$on('RisksGet',function(){
    console.log("Controller knows RisksGet");
    $scope.$broadcast('scroll.refreshComplete');
    $scope.newRisks = RiskService.getRiskList();
    // console.log($scope.newRisks);
    $ionicLoading.hide();
  })

  $scope.$on('RisksGetFail',function(){
   $ionicLoading.hide();
  })
}])

//LRZ 20151117 新的风险评估页面细节controller
.controller('RiskDtlCtrl',['$state','$scope','RiskService','$ionicSlideBoxDelegate','Storage','$timeout',function($state,$scope,RiskService,$ionicSlideBoxDelegate,Storage,$timeout){
  // $scope.chartDone = false;
  $scope.whichone = $state.params.num;
  console.log($scope.whichone);
  $scope.chart = null;
  $scope.isHiding = false;
  if(RiskService.getRiskList() == [])  {
    RiskService.initial();
  }
  
  $scope.Mlist = [];

  var sortMlist = function(){
     if($scope.item.M1show) {
      $scope.item.M1.flist = [{name:'高血压发病率',f:$scope.item.M1.f1},
      {name:'高血压五年死亡率',f:$scope.item.M1.f2},
      {name:'心血管疾病',f:$scope.item.M1.f3},
      {name:'中风十年发生率',f:$scope.item.M1.f4},
      {name:'心衰率',f:$scope.item.M1.f5}];
      $scope.Mlist.push($scope.item.M1);
     }
     if($scope.item.M2show) $scope.Mlist.push($scope.item.M2);
     if($scope.item.M3show) {
      $scope.item.M3.flist = [{name:'一年死亡率',f:$scope.item.M3.f1},
      {name:'三年死亡率',f:$scope.item.M3.f2}];
      $scope.Mlist.push($scope.item.M3);
     }
     console.log($scope.Mlist);
  }
  // console.log($scope.myslide);
  // console.log($scope.riskSingle);



    //根据state传入的SortNo 从Service 预载入的列表中取出数据
  $scope.index = RiskService.getIndexBySortNo($scope.whichone);
  $scope.item = RiskService.getSingleRisk($scope.index);
  if(typeof($scope.item) != 'undefined') sortMlist();

  // 得到画图数据
  // if($scope.item.M1show != false)
  //   $scope.chartData = RiskService.getGraphData('M1',$scope.index);
  // else if ($scope.item.M2show != false){
  //   // $scope.myslide.slide(1,500);
  //   $scope.chartData = RiskService.getGraphData('M2',$scope.index);    
  // }
  // else{
  //   // $scope.myslide.slide(2,500);
  //   $scope.chartData = RiskService.getGraphData('M3',$scope.index);  
  // }
  
  console.log($scope.item);

  // AmCharts.makeChart('riskchart', $scope.chartData);
  // $scope.chartDone = true;
  // console.log($scope.chart);
  
  $scope.myslide = $ionicSlideBoxDelegate.$getByHandle('riskhandle');
  // $scope.$apply();

  // chart.validateData();
  // chart.validateNow();
  // chart.write('chartdiv222');
  // $scope.chartDone = true;
  // chart.handleResize();
  // 画图
  // 判断 有几个图显示几个图
  // var p_chart = AmCharts.makeChart("riskchart",chart,500);
  // $scope.chartDone = true;
  
  //slidebox控制
  $scope.$on('$ionicView.afterEnter',function(){
    
    $scope.slideHasChanged(0);
    // console.log($scope.myslide);
    // $timeout(5000);
    // if($scope.item.M1show == true){
    //   null;      
    // }
    // // $scope.chartData = RiskService.getGraphData('M1',$scope.index);
    // else if ($scope.item.M2show == true){
    //   // console.log('no hyper'); 
    //   $scope.myslide.slide(1,50);
    // // $scope.chartData = RiskService.getGraphData('M2',$scope.index);    
    // }
    // else{
    //   $scope.myslide.slide(2,50);
    //   // $scope.chartData = RiskService.getGraphData('M3',$scope.index);  
    // }
  })

$scope.$on('RisksGet',function(){
  $scope.index = RiskService.getIndexBySortNo($scope.whichone);
  $scope.item = RiskService.getSingleRisk($scope.index);
   if(typeof($scope.item) != 'undefined') sortMlist();
})

  $scope.slideHasChanged = function($index){
    var ii = $index;
    console.log(ii);
    // console.log($scope.item.M1show);
    // var status = 0;
    // if(M1show && M2Show && M3show) 
    // switch(ii){
    //   case 0: if($scope.item.M1show == false){
    //             if($scope.item.M2show == false){
    //               $scope.myslide.slide(2,500);
    //             }
    //             else $scope.myslide.slide(1,500);                 
    //           }
    //           else break;
    //   case 1: if($scope.item.M2show == false){                
    //           }
    //           else break;
    //   case 2:if($scope.item.M3show == false){
    //             if($scope.item.M2show == false){
    //               $scope.myslide.slide(1,500);break;
    //             }
    //             else $scope.myslide.slide(0,500); break;                
    //           }
    //           else break;
    //   }

    // switch(ii){
    //   case 0: if($scope.item.M1show == true){
    //             $scope.isHiding = false;
    //             $scope.chartData    = RiskService.getGraphData('M1',$scope.index);
    //             AmCharts.makeChart('riskchart', $scope.chartData); break;        
    //           }
    //           else {
    //               $scope.isHiding = true; break;
    //           }
    //           // $scope.chart.validateData();
    //           // $scope.chart.validateNow(true,false);
    //   case 1: if($scope.item.M2show == true){
    //             $scope.isHiding = false;
    //             $scope.chartData    = RiskService.getGraphData('M2',$scope.index);
    //             AmCharts.makeChart('riskchart', $scope.chartData);break;        
    //           }
    //           else {
    //               $scope.isHiding = true; break;
    //           }
    //           // $scope.chart.dataProvider  = $scope.chartData.dataProvider;
    //           // $scope.chart.validateData();
    //           // $scope.chart.validateNow(true,false);
    //   case 2: if($scope.item.M3show == true){
    //             $scope.isHiding = false;
    //             $scope.chartData     = RiskService.getGraphData('M3',$scope.index);
    //             AmCharts.makeChart('riskchart', $scope.chartData); 
    //           }
    //           else {
    //               $scope.isHiding = true; break;
    //           }
    //           // $scope.chart.validateData();
    //           // $scope.chart.validateNow(true,false);
    // }

    switch($scope.Mlist[ii].AssessmentType){
      case 'M1' : $scope.chartData     = RiskService.getGraphData('M1',$scope.index);
                        AmCharts.makeChart('riskchart', $scope.chartData); break;
      case 'M2' : $scope.chartData     = RiskService.getGraphData('M2',$scope.index);
                        AmCharts.makeChart('riskchart', $scope.chartData); break;
      case 'M3' : $scope.chartData     = RiskService.getGraphData('M3',$scope.index);
                        AmCharts.makeChart('riskchart', $scope.chartData); break;
    }
  }

}])
//调查问卷的controller state riskquestions;
//LRZ 20151121 完整的评估功能
.controller('RiskQuestionCtrl',['$scope','$state','$rootScope','Patients','Storage','$ionicLoading','$timeout',function($scope,$state,$rootScope,Patients,Storage,$ionicLoading,$timeout){
 
  $scope.userid = Storage.get('PatientID');
  // $scope.userid = "PID201506170002";
  // console.log($scope.userid);
  // console.log($scope.SBP);
  $scope.hasLoaded = {M1:false,M2:true,M3:false};
  $scope.value = {M1: undefined, M2:undefined , M3: undefined};
  $scope.value.M1 = {
    AbdominalGirth: undefined,
    Af: undefined,
    Age: undefined,
    BMI: undefined,
    Chd: undefined,
    Creatinine: undefined,
    DBP: undefined,
    Diabetes: undefined,
    Gender: undefined,
    Hdlc: undefined,
    Heartattack: undefined,
    Heartrate: undefined,
    Height: undefined,
    Lvh: undefined,
    Parent: undefined,
    SBP: undefined,
    Smoke: undefined,
    Stroke: undefined,
    Tcho: undefined,
    Treat: undefined,
    Valve: undefined,
    Weight: undefined
  };
  $scope.value.M2 = {
    glucose : undefined,
    period: undefined
  };
  $scope.value.M3 = {
    AA: undefined,
    Age: undefined,
    BMI: undefined,
    Beta: undefined,
    Creatinine: undefined,
    Diabetes: undefined,
    EF: undefined,
    Gender: undefined,
    HF18: undefined,
    Height: undefined,
    Lung: undefined,
    NYHA: undefined,
    SBP: undefined,
    Smoke: undefined,
    Weight: undefined,
  };
  // Patients.getQuestionM1(Storage.get("PatientID")).then(function(promise){
  //   $scope.value.M1 = promise;
  // });
  // Patients.getQuestionM3(Storage.get("PatientID")).then(function(promise){
  //   $scope.value.M3 = promise;
  // });

  // $scope.value = {SBP:undefined,DBP:undefined,glucose:undefined,period:undefined,NYHA:undefined};
  $scope.setedValue = {NYHA: [{level:'I',description:'体力活动没有限制，进行一般强度的体力活动不会一起过度疲劳、心悸、呼吸困难（气短）。'},
                              {level:'II',description:'体力活动受到轻微的限制，休息时没有不适感，进行一般强度的体力活动导致疲劳、心悸、呼吸困难(气短)。'},
                              {level:'III',description:'体力活动受到明显的限制，休息时没有不适感，进行轻微的体力活动就会导致疲劳、心悸、呼吸困难(气短)。'},
                              {level:'IV',description:'进行任何体力活动均会产生不适的感觉。休息时会有心衰症状，并且这些症状会因为进行任何体力活动而加重。'}],
                              selected : null}
  $scope.setedValue.selected = $scope.setedValue.NYHA[0].description; 
  $scope.list = {M1show : false, M2show:false, M3show:false};

  $scope.clickCancel = function(){
    $state.go('addpatient.risk');
  };

  $scope.clickCancel1 = function(){
    $state.go('Independent.risk');
  };

  $scope.toggleGroup = function(whichone) {
    switch(whichone){
      case 1 : $scope.list.M1show = !$scope.list.M1show; break;
      case 2 : $scope.list.M2show = !$scope.list.M2show; break;
      case 3 : $scope.list.M3show = !$scope.list.M3show; break;
    }

    if(whichone == 1 && $scope.list.M1show == true && !$scope.hasLoaded.M1){
      $scope.hasLoaded.M1 = true;
      $ionicLoading.show({template:'从临床拉数据过来，等一下'});
      $timeout(function(){
        $scope.$broadcast('loadingDone');
      },5000)
      // Patients.getQuestionM1('PID201511170001').then(function(promise){
      Patients.getQuestionM1(Storage.get("PatientID")).then(function(promise){
      // if(promise.data = null)
        var t1 = $scope.value.M1.SBP == undefined? 0:$scope.value.M1.SBP;
        var t2 = $scope.value.M1.DBP == undefined? 0:$scope.value.M1.DBP;
        $scope.value.M1 = promise;
      // else $scope.value.M1 = {name : "xiaobiaoza"};
        $scope.$broadcast('loadingDone');
        $scope.value.M1.Af= $scope.value.M1.Af=='1' ? true:false;
        $scope.value.M1.Chd= $scope.value.M1.Chd=='1' ? true:false;
        $scope.value.M1.Diabetes= $scope.value.M1.Diabetes=='1' ? true:false;
        $scope.value.M1.Gender= $scope.value.M1.Gender=='1' ? true:false;
        $scope.value.M1.Heartattack= $scope.value.M1.Heartattack=='1' ? true:false;
        $scope.value.M1.Lvh= $scope.value.M1.Lvh=='1' ? true:false;
        $scope.value.M1.Parent= $scope.value.M1.Parent=='1' ? true:false;
        $scope.value.M1.Smoke= $scope.value.M1.Smoke=='1' ? true:false;
        $scope.value.M1.Stroke = $scope.value.M1.Stroke =='1' ? true:false;
        $scope.value.M1.Treat= $scope.value.M1.Treat=='1' ? true:false;
        $scope.value.M1.Valve= $scope.value.M1.Valve=='1' ? true:false;

        $scope.value.M1.SBP = t1 ==0 ? $scope.value.M1.SBP : t1;
        $scope.value.M1.DBP = t2 ==0 ? $scope.value.M1.DBP : t2;
        console.log($scope.value.M1);
        
      });
    }
      //点下拉框从临床同步数据


    if(whichone == 3 && $scope.list.M3show == true && !$scope.hasLoaded.M3){
      $scope.hasLoaded.M3 = true;
      $ionicLoading.show({template:'从临床拉数据过来，等一下'});
      $timeout(function(){
        $scope.$broadcast('loadingDone');
      },5000);
      // Patients.getQuestionM3('PID201511170001').then(function(promise){
      Patients.getQuestionM3(Storage.get('PatientID')).then(function(promise){
      // if(promise.data = null)
        var t = ($scope.value.M3.NYHA == 1 || $scope.value.M3.NYHA == 2 || $scope.value.M3.NYHA == 3||$scope.value.M3.NYHA == 4) ? $scope.value.M3.NYHA: 1;
        $scope.value.M3 = promise;
        console.log($scope.value.M3);
        $scope.$broadcast('loadingDone');
        $scope.value.M3.AA= $scope.value.M3.AA=='1' ? true:false;
        $scope.value.M3.Beta= $scope.value.M3.Beta=='1' ? true:false;
        $scope.value.M3.Diabetes= $scope.value.M3.Diabetes=='1' ? true:false;
        $scope.value.M3.Gender= $scope.value.M3.Gender=='1' ? true:false;
        $scope.value.M3.HF18= $scope.value.M3.HF18=='1' ? true:false;
        $scope.value.M3.Lung= $scope.value.M3.Lung=='1' ? true:false;
        $scope.value.M3.Smoke= $scope.value.M3.Smoke=='1' ? true:false;
       
        $scope.value.M3.NYHA = t;
        $scope.setedValue.selected = $scope.setedValue.NYHA[$scope.value.M3.NYHA -1].description;
        console.log($scope.value.M3);
        
      });   
    }
      //点下拉框从临床同步数据
 
  };
  // console.log($scope.SBP);
  $scope.clickSubmit = function(){
    //upload
    //加判断，如果有模块什么东西不全 那就不上传
    console.log($scope.value);
    var hasBlank = {M1:false,M2:false,M3:false};
    
    for(var item in $scope.value.M1){
      if($scope.value.M1[item] == undefined || $scope.value.M1[item] == "NaN" ||$scope.value.M1[item] ==null || $scope.value.M1[item] == 'undefined' || $scope.value.M1[item] == 'null' || typeof($scope.value.M1[item]) === "undefined"){
        hasBlank.M1 = true;
        break;
      }
    }    
    for(var item in $scope.value.M2){
      if($scope.value.M2[item] == undefined || $scope.value.M2[item] == "NaN" ||$scope.value.M2[item] ==null || $scope.value.M2[item] == 'undefined' || $scope.value.M2[item] == 'null' || typeof($scope.value.M2[item]) === "undefined"){
        hasBlank.M2 = true;
        break;
      }
    }   
    for(var item in $scope.value.M3){
      if($scope.value.M3[item] == undefined || $scope.value.M3[item] == "NaN" ||$scope.value.M3[item] ==null || $scope.value.M3[item] == 'undefined' || $scope.value.M3[item] == 'null' || typeof($scope.value.M3[item]) === "undefined"){
        hasBlank.M3 = true;
        break;
      }
    }   
    console.log(hasBlank);
    // $rootScope.$broadcast("NewEvaluationSubmit");
    $timeout(function(){
        $scope.$broadcast('loadingDone');
      },5000);
    Patients.getMaxSortNo($scope.userid).then(function(data){
      //得到最大的sortno便于当前插入到哪一个
      var maxsortno = data.result;   
      console.log("得到最大的sortno ＝ " );
      console.log(maxsortno);
      var time2 = new Date();
      time2.setHours(time2.getHours()+8);
      console.log("当前时间为 ＝ ");
      console.log(time2);



       //上传血压数据 得到血压等级 得到5个风险因子
      if(!(hasBlank.M1)){

        Patients.getSBPDescription(parseInt($scope.value.M1.SBP)).then(function(data2){
          console.log("血压的等级描述为  ： ");
          console.log(data2)
          // 从服务器取一部分 +　在本地　算　or 加数据不全提示
          //得到血压等级以后 再 将整个 数据po上去
          var des = data2.result;
          transferM1CheckboxesFromBooltoNum();
          //post 问卷信息 返回 评估结果
          console.log("高血压问卷结果为"); 
          console.log($scope.value.M1);
          Patients.postQuestionM1($scope.value.M1,Storage.get('PatientID')).then(function(data3){
            console.log("高血压评估结果为"); 
            console.log(data3);
            // data2.Message: "出现错误。"
            // DBP: 0
            // Framingham: "NaN"
            // Harvard: 6.07
            // HeartFailureRisk: 22
            // Hyper: 0
            // SBP: 0
            // StrokeRisk: 29
            // 拼接 血压等级描述 两压  5个因子 
            var t = des + "||" +
                    String($scope.value.M1.SBP) + "||" +
                    String($scope.value.M1.DBP) + "||" +
                    data3.Hyper + "||" +
                    data3.Harvard  + "||" +
                    data3.Framingham + "||" +
                    data3.StrokeRisk + "||" +
                    data3.HeartFailureRisk;
            // var t = data.result + "||"+String($scope.value.M1.SBP)+"||"+String($scope.value.M1.DBP) +"||100%||100%||100%||100%||100%";
            // console.log(t);
            console.log("预备上传的incicator ＝ ")
            console.log(t);
            // console.log(time2);
            var temp = {
                "UserId": $scope.userid,
                "SortNo": parseInt(maxsortno)+1,
                "AssessmentType": "M1",
                "AssessmentName": "高血压",
                "AssessmentTime": time2,
                "Result": t,
                "revUserId": $scope.userid,
                "TerminalName": "2",
                "TerminalIP": "10",
                "DeviceType": 10
              };
            //其实这个判断已经没啥用了 不过留着避免用户 神经病一样的使用 
            if(typeof($scope.value.M1.SBP) != 'undefined' && typeof($scope.value.M1.DBP) != 'undefined') {
              console.log("上传血压数据");
              Patients.postTreatmentIndicators(temp).then(function(res){
                if(res.result == "数据插入成功"){
                  console.log("broadcasting hypt");
                  $rootScope.$broadcast("NewEvaluationSubmit");
                }
                else{
                  $ionicLoading.show({template:"<p>上传存在问题</p><p>请仔细检查再提交</p>"});
                  $timeout(function(){
                    $ionicLoading.hide();
                  },2000);   
                }
              });
            }
          });

        });        
      }

       

      

      //上传糖尿病信息 糖尿病暂时不需要 post 问卷结果再得到评估结果 直接 本地算 
      if(!(hasBlank.M2)){

        var t1;
        if($scope.value.M2.glucose<6.1) t1 = "正常血糖.";
        else if($scope.value.M2.glucose<7.0) t1 = "糖尿病前期.";
        else  t1 = "糖尿病.";
        console.log("糖尿病等级  = ");
        console.log(t1);
        var temp =  {
          "UserId": $scope.userid,
          "SortNo": parseInt(maxsortno)+1,
          "AssessmentType": "M2",
          "AssessmentName": "糖尿病",
          "AssessmentTime": time2,
          "Result": t1 + "||"+ $scope.value.M2.period + "||" + String($scope.value.M2.glucose)+ "||",
          "revUserId": "sample string 7",
          "TerminalName": "sample string 8",
          "TerminalIP": "sample string 9",
          "DeviceType": 10
        };
        // console.log(temp.Result);
        if(typeof($scope.value.M2.period) != 'undefined' && typeof($scope.value.M2.glucose) != 'undefined'){
          console.log("上传血糖数据");
          Patients.postTreatmentIndicators(temp).then(function(res){
            if(res.result == "数据插入成功"){
              console.log("broadcasting diab");
              $rootScope.$broadcast("NewEvaluationSubmit");
            }
            else{
                  $ionicLoading.show({template:"<p>上传存在问题</p><p>请仔细检查再提交</p>"});
                  $timeout(function(){
                    $ionicLoading.hide();
                  },2000);                 
            }
          });
        }

      }
 

      //上传心衰信息
      if(!(hasBlank.M3)){

        var t3 =  parseInt($scope.value.M3.NYHA);
        switch(t3){
          case  1 : t3 = $scope.setedValue.NYHA[0].description;break;
          case  2 : t3 = $scope.setedValue.NYHA[1].description;break;
          case  3 : t3 = $scope.setedValue.NYHA[2].description;break;
          case  4 : t3 = $scope.setedValue.NYHA[3].description;break;
          default : t3 = $scope.setedValue.NYHA[0].description;;
        }
        var t4 =  parseInt($scope.value.M3.NYHA);
        switch(t4){
          case  1 : t4 = $scope.setedValue.NYHA[0].level;break;
          case  2 : t4 = $scope.setedValue.NYHA[1].level;break;
          case  3 : t4 = $scope.setedValue.NYHA[2].level;break;
          case  4 : t4 = $scope.setedValue.NYHA[3].level;break;
          default : t4 = $scope.setedValue.NYHA[0].level;;
        }

        var t = "NYHA 第" + t4 +"级 ";

        var t3 = t + t3;

        console.log(t3);
        Patients.postQuestionM3($scope.value.M3,Storage.get('PatientID')).then(function(promise_d){
            console.log("心衰评估结果为");
            console.log(promise_d);
        
            var temp =  {
              "UserId": $scope.userid,
              "SortNo": parseInt(maxsortno)+1,
              "AssessmentType": "M3",
              "AssessmentName": "心衰",
              "AssessmentTime": time2,
              "Result": t3 + "||"+ String(promise_d.One) + "||" + String(promise_d.Three) ,
              "revUserId": "sample string 7",
              "TerminalName": "sample string 8",
              "TerminalIP": "sample string 9",
              "DeviceType": 13
            };
            console.log(temp.Result);
            if(typeof($scope.value.M3.NYHA) != 'undefined' && typeof($scope.value.M3.NYHA) != 'undefined'){
            
              Patients.postTreatmentIndicators(temp).then(function(res){
                if(res.result == "数据插入成功"){
                  console.log("broadcasting heart failure");
                  $rootScope.$broadcast("NewEvaluationSubmit");
                }
                else{
                  $ionicLoading.show({template:"<p>上传存在问题</p><p>请仔细检查再提交</p>"});
                  $timeout(function(){
                    $ionicLoading.hide();
                  },2000);                  
                }
              });
            }
        });

      }

    if(hasBlank.M1 && hasBlank.M2 && hasBlank.M3) {
      $ionicLoading.show({template:"没有填写完整的问卷就不提交了"});
      $timeout(function(){
        $ionicLoading.hide();
      },2000);
    }
    if (Storage.get('isManage') == "Yes")
    {
      $state.go('Independent.risk');
    }
    else
    {
      $state.go('addpatient.risk');
    }
    })

  }

  $scope.slideHasChanged = function($index){

    $scope.list.M1show = false;
    $scope.list.M2show = false;
    $scope.list.M3show = false;

  }

  var calcuBMI = function(h,w){
    return w*10000/(h*h);
  }

  var transferM1CheckboxesFromBooltoNum = function(){
    $scope.value.M1.Af = $scope.value.M1.Af==true ? '1':'2';
    $scope.value.M1.Diabetes = $scope.value.M1.Diabetes==true ? '1':'2';
    $scope.value.M1.Gender = $scope.value.M1.Gender==true ? '1':'2';
    $scope.value.M1.Heartattack = $scope.value.M1.Heartattack==true ? '1':'2';
    $scope.value.M1.Lvh = $scope.value.M1.Lvh==true ? '1':'2';
    $scope.value.M1.Parent = $scope.value.M1.Parent==true ? '1':'2';
    $scope.value.M1.Smoke = $scope.value.M1.Smoke==true ? '1':'2';
    $scope.value.M1.Stroke = $scope.value.M1.Stroke==true ? '1':'2';
    $scope.value.M1.Treat = $scope.value.M1.Treat==true ? '1':'2';
    $scope.value.M1.Valve = $scope.value.M1.Valve==true ? '1':'2';
    $scope.value.M1.Chd = $scope.value.M1.Chd==true ? '1':'2';
  }

  var transferM1CheckboxesFromNumtoBool =function(){
    $scope.value.M1.Af= $scope.value.M1.Af=='1' ? true:false;
    $scope.value.M1.Chd= $scope.value.M1.Chd=='1' ? true:false;
    $scope.value.M1.Diabetes= $scope.value.M1.Diabetes=='1' ? true:false;
    $scope.value.M1.Gender= $scope.value.M1.Gender=='1' ? true:false;
    $scope.value.M1.Heartattack= $scope.value.M1.Heartattack=='1' ? true:false;
    $scope.value.M1.Lvh= $scope.value.M1.Lvh=='1' ? true:false;
    $scope.value.M1.Parent= $scope.value.M1.Parent=='1' ? true:false;
    $scope.value.M1.Smoke= $scope.value.M1.Smoke=='1' ? true:false;
    $scope.value.M1.Stroke = $scope.value.M1.Stroke =='1' ? true:false;
    $scope.value.M1.Treat= $scope.value.M1.Treat=='1' ? true:false;
    $scope.value.M1.Valve= $scope.value.M1.Valve=='1' ? true:false;    
  }

  var transferM3CheckboxesFromBooltoNum = function(){
    $scope.value.M3.AA= $scope.value.M3.AA==true?'1' :'2';
    $scope.value.M3.Beta= $scope.value.M3.Beta==true?'1' :'2';
    $scope.value.M3.Diabetes= $scope.value.M3.Diabetes==true?'1' :'2';
    $scope.value.M3.Gender= $scope.value.M3.Gender==true?'1' :'2';
    $scope.value.M3.HF18= $scope.value.M3.HF18==true?'1' :'2';
    $scope.value.M3.Lung= $scope.value.M3.Lung==true?'1' :'2';
    $scope.value.M3.Smoke= $scope.value.M3.Smoke==true?'1' :'2';    
  } 

  var transferM3CheckboxesFromNumtoBool = function(){
    $scope.value.M3.AA= $scope.value.M3.AA=='1' ? true:false;
    $scope.value.M3.Beta= $scope.value.M3.Beta=='1' ? true:false;
    $scope.value.M3.Diabetes= $scope.value.M3.Diabetes=='1' ? true:false;
    $scope.value.M3.Gender= $scope.value.M3.Gender=='1' ? true:false;
    $scope.value.M3.HF18= $scope.value.M3.HF18=='1' ? true:false;
    $scope.value.M3.Lung= $scope.value.M3.Lung=='1' ? true:false;
    $scope.value.M3.Smoke= $scope.value.M3.Smoke=='1' ? true:false;
    if($scope.value.M3.NYHA >=1 && $scope.value.M3.NYHA <=4 ) 
    $scope.setedValue.selected = $scope.setedValue.NYHA[$scope.value.M3.NYHA -1].description;    
  }

  $scope.rangeHasChanged = function(whichone){
    // console.log("111111");
    if(whichone == 1)
    $scope.value.M1.BMI = calcuBMI($scope.value.M1.Height,$scope.value.M1.Weight);
    else if(whichone == 3){
      $scope.value.M3.BMI = calcuBMI($scope.value.M3.Height,$scope.value.M3.Weight);
      if($scope.value.M3.NYHA ==1 || $scope.value.M3.NYHA ==2 || $scope.value.M3.NYHA ==3 || $scope.value.M3.NYHA ==4)
      $scope.setedValue.selected = $scope.setedValue.NYHA[$scope.value.M3.NYHA -1].description; 
      else{
        $scope.value.M3.NYHA =1;
        $scope.setedValue.selected = $scope.setedValue.NYHA[$scope.value.M3.NYHA -1].description;
      }      
    }

  }


  $scope.$on('loadingDone',function(){

    $ionicLoading.hide();

  })

  $scope.onclicktest = function (){
    // $scope.value.M1.Af = $scope.value.M1.Af==true ? '1':'2';
    // $scope.value.M1.Diabetes = $scope.value.M1.Diabetes==true ? '1':'2';
    // $scope.value.M1.Gender = $scope.value.M1.Gender==true ? '1':'2';
    // $scope.value.M1.Heartattack = $scope.value.M1.Heartattack==true ? '1':'2';
    // $scope.value.M1.Lvh = $scope.value.M1.Lvh==true ? '1':'2';
    // $scope.value.M1.Parent = $scope.value.M1.Parent==true ? '1':'2';
    // $scope.value.M1.Smoke = $scope.value.M1.Smoke==true ? '1':'2';
    // $scope.value.M1.Stroke = $scope.value.M1.Stroke==true ? '1':'2';
    // $scope.value.M1.Treat = $scope.value.M1.Treat==true ? '1':'2';
    // $scope.value.M1.Valve = $scope.value.M1.Valve==true ? '1':'2';
    // $scope.value.M1.Chd = $scope.value.M1.Chd==true ? '1':'2';

    // console.log($scope.value.M3)    
    // $scope.value.M3.AA= $scope.value.M3.AA==true?'1' :'2';
    // $scope.value.M3.Beta= $scope.value.M3.Beta==true?'1' :'2';
    // $scope.value.M3.Diabetes= $scope.value.M3.Diabetes==true?'1' :'2';
    // $scope.value.M3.Gender= $scope.value.M3.Gender==true?'1' :'2';
    // $scope.value.M3.HF18= $scope.value.M3.HF18==true?'1' :'2';
    // $scope.value.M3.Lung= $scope.value.M3.Lung==true?'1' :'2';
    // $scope.value.M3.Smoke= $scope.value.M3.Smoke==true?'1' :'2';
    // console.log($scope.value.M3)

    // Patients.postQuestionM1($scope.value.M1).then(function(promise){
    //   console.log(promise);
    // });
    // var t = new Date();
    // var t1 = t.getFullYear();
    // var t2 = t.getDate();
    // var t3 = t.getMonth();
    // var t4 = t.getHours();
    // var t5 = t.getMinutes();
    // console.log(t4);
    // console.log(t5);

    // var t = new Date();
    // var t1 = String(t.getFullYear());
    // var t2 = String(t.getDate());
    // var t3 = String( t.getMonth() + 1);
    // var t4 = String(t.getHours());
    // var t5 = String(t.getMinutes());

    // var RecordDate = t1 + (t3.length == 2? t3: '0' + t3) +   (t2.length == 2? t2: '0' + t2) ;
    // var RecordTime = (t4.length == 2? t4: '0' + t4) + (t5.length == 2? t5: '0' + t5);
    // console.log(RecordTime);
    // console.log(RecordDate);
  }
}])
//GL 20151101 创建计划
.controller('CreateCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', 'Dict', '$ionicPopup', 'Storage', '$ionicHistory', '$ionicLoading', function($scope, $http, $state, $stateParams, PlanInfo, Dict, $ionicPopup, Storage, $ionicHistory, $ionicLoading){ 
    $scope.create = {};
    $scope.create.EndDate;
    $scope.create.PlanList = new Array();
    $scope.create.AddFlag = true; //只允许当前有一个正在执行的计划

    $scope.isloaded = false;

    //loading图标显示
    $ionicLoading.show({
        content: '加载中',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    $scope.$watch('$ionicView.enter', function() { 
        GetPlanList();
    }); 
    $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
        $scope.Name=Storage.get('PatientName');
        $scope.age=Storage.get('PatientAge');
        $scope.gender=Storage.get('PatientGender');
    }, function(data) {
    });
    $scope.onClickBackward = function(){
        $state.go('coach.patients');
    }
       
    //获取计划列表
    function GetPlanList()
    {
        var PatientId = localStorage.getItem("PatientID");
        var promise = PlanInfo.GetPlanList(PatientId, "NULL", "", 0);  //PatientId, PlanNo, Module, Status
        promise.then(function(data) {
            for (var i=0; i< data.length; i++)
            {
                if((data[i].Status =="3") || (data[i].Status =="4"))
                {
                    if(($scope.create.AddFlag) && (data[i].Status =="3"))
                    {
                        $scope.create.AddFlag = false;
                    }  
                    if (data[i].StartDate != "")
                    {
                        data[i].StartDate = "： " + data[i].StartDate.substr(0, 4) + '/' + data[i].StartDate.substr(4, 2) + '/' + data[i].StartDate.substr(6, 2)
                    }
                    if (data[i].EndDate == "99991231")
                    {
                        data[i].EndDate = ""
                    }
                    else
                    {
                        if(data[i].EndDate != "")
                        {
                            data[i].EndDate = "-" + data[i].EndDate.substr(0, 4) + '/' + data[i].EndDate.substr(4, 2) + '/' + data[i].EndDate.substr(6, 2)
                        }
                    }
                    if(data[i].Status == '3') //字体颜色
                    {
                        data[i].Status = "#009100"
                    }
                    else
                    {
                        data[i].Status = "#F75000"
                    }
                    $scope.create.PlanList.push(data[i]);

                }                            
            } 
            //console.log($scope.create.PlanList); 
            $ionicLoading.hide();
            $scope.isloaded = true;                     
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
        var PatientId = localStorage.getItem("PatientID");
        var StartDate = TimeFormat(new Date()); 
        var EndDate = new Array("9999/12/31", "99991231");
        var Module = "M1";
        var Status = "3";
        var DoctorId = Storage.get('UID');
        var promise = PlanInfo.SetPlan(PlanNo, PatientId, StartDate[1], EndDate[1], Module, Status, DoctorId, "1", "1", "1", 1);  
        promise.then(function(data) {  
            if(data.result == "数据插入成功")
            {
                //$scope.create.PlanList.push({PlanName:"当前计划", PlanNo:PlanNo, StartDate:"", EndDate: ""});
                $scope.create.AddFlag = false;
                localStorage.setItem("CurrentPlanNo", PlanNo);
                if (localStorage.getItem("isManage") == "Yes") //新计划插入成功，页面直接跳转到任务列表
                {
                  window.location.href = "#/manage/taskList";
                }
                else
                {
                  window.location.href = "#/addpatient/taskList";
                } 
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

    $scope.backtomain=function(){
        localStorage.removeItem("M1");
        localStorage.removeItem("M2");
        localStorage.removeItem("M3");
        $state.go('coach.patients');
    };
}])

//GL 20151101 一级任务列表
.controller('TaskListCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', '$ionicPopup', '$ionicHistory','Storage', '$ionicLoading', "$rootScope",function($scope, $http, $state, $stateParams, PlanInfo, $ionicPopup, $ionicHistory, Storage, $ionicLoading,$rootScope){
    ////console.log($stateParams.tt);
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

    $scope.isloaded = false;

    //用于暂存的列表 lrz20160108
    if(!$rootScope.TempList) $rootScope.TempList = {};
    if(!$rootScope.TempList.AddList) $rootScope.TempList.AddList = new Array();
    if(!$rootScope.TempList.DeleteList) $rootScope.TempList.DeleteList = new Array();


    //loading图标显示
    $ionicLoading.show({
        content: '加载中',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    $scope.$on('$ionicView.enter', function() {
        $scope.GetTasks(); 
    });

    $scope.onClickBackward = function(){
        $rootScope.TempList.AddList.length = 0;
        $rootScope.TempList.DeleteList.length = 0;
        $ionicHistory.goBack();
    };

    $scope.GetTasks = function ()
    {
        var promise = PlanInfo.GetTasks(PlanNo, "T");  
        promise.then(function(data) { 
            for (var i = 0; i < data.length; i++)  
            {
                if (data[i].Type == "TA")
                {
                    data[i].Description = "icon ion-ios-speedometer"
                }
                else if(data[i].Type == "TB")
                {
                    data[i].Description = "icon ion-android-restaurant"
                }
                else if(data[i].Type == "TC")
                {
                    data[i].Description = "icon ion-android-bicycle"
                }
                else if(data[i].Type == "TD")
                {
                    data[i].Description = "icon ion-ios-film"
                }
                else if(data[i].Type == "TE")
                {
                    data[i].Description = "icon ion-beaker"
                }
                else if(data[i].Type == "TF")
                {
                    data[i].Description = "icon ion-ios-pulse-strong"
                }
                else if(data[i].Type == "TG")
                {
                    data[i].Description = "icon ion-ios-bolt"
                }
                 else if(data[i].Type == "TY")
                {
                    data[i].Description = "icon ion-ios-color-wand"
                }
                 else
                {
                    data[i].Description = "icon ion-compose"
                }
                if (data[i].InvalidFlag === "1")
                {
                    data[i].ControlType = true;
                } 
                else
                {
                    data[i].ControlType = false;
                } 
            }       
            $scope.TaskList.taskList = data; 
            //console.log($scope.TaskList.taskList);
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
        var Unit;
        switch (piType)
        {
            case "SBP":
            Type = "Bloodpressure";
            Code = "Bloodpressure_1";
            Value = $scope.TaskList.SBP;
            Unit = "mmhg";
            break;
            case "DBP":
            Type = "Bloodpressure";
            Code = "Bloodpressure_2";
            Value = $scope.TaskList.DBP;
            Unit = "mmhg";
            break;
            case "BloodSugar":
            Type = "BloodSugar";
            Code = "BloodSugar_1";
            Value = $scope.TaskList.BloodSugar;
            Unit = "mmol/L";
            break;
            default:
            Type = "Weight";
            Code = "Weight_1";
            Value = $scope.TaskList.Weight;
            Unit = "kg";
            break;
        }

        if (!isNaN(Value))
        {
            var promise = PlanInfo.SetTarget(PlanNo, Type, Code, Value, "", "", Unit, "piUserId", "piTerminalName", "piTerminalIP", 1);  
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
                            ////console.log($scope.TaskList.StartDate);
                            $scope.TaskList.EndDate = null;
                        });
                     } 
                    else
                    {
                        var promise1 = PlanInfo.SetPlan(PlanNo, data[0].PatientId, data[0].StartDate, EndDateStr, data[0].Module, data[0].Status, data[0].DoctorId, "1", "1", "1", 1);             
                        promise1.then(function(data) { 
                            //console.log(TimeFormat($scope.TaskList.EndDate)[1]);              
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
            ////console.log(data);
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
            ////console.log(data);
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
            ////console.log(data);
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
            ////console.log(data);
            if(data.Type)
            {
                $scope.TaskList.Weight = data.Value;
            }
            GetEndDateTime();
        }, function(data) {  
        }); 
    }

    //获取结束日期
    function GetEndDateTime()
    {
        //PatientId, PlanNo, Module, Status
        var promise = PlanInfo.GetPlanList("", PlanNo, "", 5);  
        promise.then(function(data) {
            if (data[0].EndDate != "99991231")
            {
                var Str = data[0].EndDate.substr(0, 4) + "/" + data[0].EndDate.substr(4, 2) + "/" + data[0].EndDate.substr(6, 2);
                $scope.TaskList.EndDate = new Date(Str);  
            } 
            $ionicLoading.hide();
            $scope.isloaded = true;                               
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

    //按下确定后返回   
    $scope.onClickBackward = function(){
        $ionicHistory.goBack();
    }
    
    //从rootScope中取出所有的数组 上传 然后删除数组
    $scope.onClickSubmit = function(){
        //lrz20160108 从rootscope取出列表上传
        // $ionicHistory.goBack();

        console.log($rootScope.TempList.AddList);
        console.log($rootScope.TempList.DeleteList);
        if($rootScope.TempList.AddList.length>0){
          console.log("有添加")
          PlanInfo.SetTask($rootScope.TempList.AddList).then(function(data){
              if(data.result=='数据插入成功'){
                console.log("添加")
                    $rootScope.TempList.AddList.length = 0;

                    if($rootScope.TempList.DeleteList.length>0){
                      console.log("有添加又有删除")
                      PlanInfo.DeleteTask($rootScope.TempList.DeleteList).then(function(data){
                        if(data.result=='数据删除成功'){
                          console.log("删除")
                             $rootScope.TempList.DeleteList.length = 0;
                             $ionicHistory.goBack();
                        }
                      })
                    }

                    else {
                       console.log("有添加没有删除")
                      $ionicHistory.goBack(); 
                    }
              }
          })
        }
        else{
            if($rootScope.TempList.DeleteList.length>0){
              console.log("只有删除")
              PlanInfo.DeleteTask($rootScope.TempList.DeleteList).then(function(data){
                if(data.result=='数据删除成功'){
                    console.log("deleted")
                    $rootScope.TempList.DeleteList.length = 0;
                    $ionicHistory.goBack();                      
                }
              })
            }

          else {
            console.log("啥也没有")
            $ionicHistory.goBack();
          }
        }        
        
    }
}])

//GL 20151101
.controller('MainPlanCtrl',['$scope', '$http', '$state', '$stateParams', 'PlanInfo', '$ionicPopup', '$ionicHistory', 'Storage', '$ionicLoading', "Dict", "$rootScope",function($scope, $http, $state, $stateParams, PlanInfo, $ionicPopup, $ionicHistory, Storage, $ionicLoading, Dict,$rootScope){
    var Type = $stateParams.tt;
    //console.log(Type);
    var PlanNo = localStorage.getItem("CurrentPlanNo");  
    $scope.task = {};
    $scope.task.list;
    var arry = new Array();
    //用于暂存的列表
    if(!$rootScope.TempList.AddList) $rootScope.TempList.AddList = new Array();
    if(!$rootScope.TempList.DeleteList) $rootScope.TempList.DeleteList = new Array();
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
    $scope.task.freqList;

    // //药物治疗
    // $scope.task.DrugName;
    // $scope.task.DrugDose;
    // $scope.task.DrugFreq;
    // $scope.task.DrugWay;
    // $scope.task.DrugTime;
    // $scope.task.Module

    //体征测量
    $scope.task.MeasureTime = new Array();
    $scope.task.MeasureOtherTime;
   
     // = [{"Name":"早餐前", "Checked":false}, {"Name":"早餐后", "Checked":false}, {"Name":"午餐前", "Checked":false}, {"Name":"午餐后", "Checked":false}, {"Name":"晚餐前", "Checked":false}, {"Name":"晚餐后", "Checked":false}];

    $scope.isloaded = false;

    //loading图标显示
    $ionicLoading.show({
        content: '加载中',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    $scope.$on('$ionicView.enter', function() {
        GettaskList(); 
    });

    $scope.$watch('$viewContentLoaded', function() {
        if ((Type == 'TF') || (Type == 'TC') )
        {
            var category = "ExeciseFreq";
            if(Type == 'TF')
            {
                category = "DrugTime";
            }      
            GetType(category);
        }        
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
            //console.log($scope.task.list);
            $ionicLoading.hide();
            $scope.isloaded = true;
        }, function(data) {  
        });   
    }

     //按下确定键触发
    // $scope.Confirm = function()
    // {
    //     var AddList = new Array();
    //     var DeleteList = new Array();
    //     var FlagBefore = false;
    //     var FlagNow = false;
    //     for (var i=0; i < arry.length; i++)
    //     {
    //         if (arry[i])
    //         {
    //             FlagBefore = true;
    //             break;
    //         }
    //     }
    //     for (var i=0; i < $scope.task.list.length; i++)
    //     {
    //         if ($scope.task.list[i].ControlType)
    //         {
    //             FlagNow = true;
    //             break;
    //         }
    //     }
    //     for (var i=0; i < $scope.task.list.length; i++)
    //     {
    //         if (($scope.task.list[i].ControlType)) //插入数据
    //         { 
    //             AddList.push({"PlanNo":PlanNo, 
    //                          "Type":$scope.task.list[i].Type, 
    //                          "Code":$scope.task.list[i].Code, 
    //                          "SortNo":'1', 
    //                          "Instruction":$scope.task.list[i].Instruction, 
    //                          "piUserId":"1",  
    //                          "piTerminalName":"1",  
    //                          "piTerminalIP":"1", 
    //                          "piDeviceType":0});               
    //         }
    //         if((!$scope.task.list[i].ControlType) && (arry[i])) //删除数据
    //         {
    //             DeleteList.push({"PlanNo":PlanNo, 
    //                              "Type":$scope.task.list[i].Type, 
    //                              "Code":$scope.task.list[i].Code, 
    //                              "SortNo":'1'});
    //         }
    //     }
    //     if ((!FlagBefore) && (FlagNow)) //插入上级条目
    //     {
    //         AddList.push({"PlanNo":PlanNo, 
    //                      "Type":Type, 
    //                      "Code":Type + "0000", 
    //                      "SortNo":'1', 
    //                      "Instruction":"", 
    //                      "piUserId":"1",  
    //                      "piTerminalName":"1",  
    //                      "piTerminalIP":"1", 
    //                      "piDeviceType":0});                 
            
    //     }
    //     if ((FlagBefore) && (!FlagNow)) //删除上级条目
    //     {
    //         DeleteList.push({"PlanNo":PlanNo, 
    //                          "Type":Type, 
    //                          "Code":Type + "0000", 
    //                          "SortNo":'1'});
    //     }
    //     if(AddList.length > 0)
    //     {
    //         var promise = PlanInfo.SetTask(AddList);
    //         promise.then(function(data)
    //         {
    //             if (data.result == "数据插入成功")
    //             {
    //                 if (DeleteList.length > 0)
    //                 {
    //                     var promise1 = PlanInfo.DeleteTask(DeleteList);
    //                     promise1.then(function(data) 
    //                     {
    //                         if (data.result == "数据删除成功")
    //                         {
    //                           if (localStorage.getItem("isManage") == "Yes")
    //                           {
    //                             window.location.href = "#/manage/taskList";
    //                           }
    //                           else
    //                           {
    //                             window.location.href = "#/addpatient/taskList";
    //                           } 
    //                         }
    //                     },function(data){
    //                     });  
    //                 }
    //                 else
    //                 {
    //                      if (localStorage.getItem("isManage") == "Yes")
    //                           {
    //                             window.location.href = "#/manage/taskList";
    //                           }
    //                           else
    //                           {
    //                             window.location.href = "#/addpatient/taskList";
    //                           }            
    //                 }
    //             }
    //         },function(data){              
    //         });    
    //     }
    //     else
    //     {
    //         if (DeleteList.length > 0)
    //         {
    //             var promise1 = PlanInfo.DeleteTask(DeleteList);
    //             promise1.then(function(data) 
    //             {
    //                 if (data.result == "数据删除成功")
    //                 {
    //                     if (localStorage.getItem("isManage") == "Yes")
    //                           {
    //                             window.location.href = "#/manage/taskList";
    //                           }
    //                           else
    //                           {
    //                             window.location.href = "#/addpatient/taskList";
    //                           } 
    //                 }
    //             },function(data){
    //             });  
    //         }
    //         else
    //         {
    //              if (localStorage.getItem("isManage") == "Yes")
    //                   {
    //                     window.location.href = "#/manage/taskList";
    //                   }
    //                   else
    //                   {
    //                     window.location.href = "#/addpatient/taskList";
    //                   } 
    //         }
    //     }
    // }
     //按下确定键触发 LRZ 20160108 将所有列表暂时存到rootscope 
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
        if(AddList.length > 0){
            // $rootScope.TempList.AddList.concat(AddList);
            console.log(AddList);
            
            for (var i = AddList.length - 1; i >= 0; i--) {
             $rootScope.TempList.AddList.push(AddList[i]);
            };

            console.log($rootScope.TempList.AddList);
            if (DeleteList.length > 0){
                // $rootScope.TempList.DeleteList.concat(DeleteList);


                  for (var i = DeleteList.length - 1; i >= 0; i--) {
                   $rootScope.TempList.DeleteList.push(DeleteList[i]);
                  };
                  if (localStorage.getItem("isManage") == "Yes")
                    {
                      window.location.href = "#/manage/taskList";
                    }
                    else
                    {
                      window.location.href = "#/addpatient/taskList";
                    } 
            }
            else
            {
              if (localStorage.getItem("isManage") == "Yes")
                  {
                    window.location.href = "#/manage/taskList";
                  }
                  else
                  {
                    window.location.href = "#/addpatient/taskList";
                  }            
            } 
        }
        else
        {
            if (DeleteList.length > 0)
            {
                for (var i = DeleteList.length - 1; i >= 0; i--) {
                   $rootScope.TempList.DeleteList.push(DeleteList[i]);
                  };
                if (localStorage.getItem("isManage") == "Yes")
                      {
                        window.location.href = "#/manage/taskList";
                      }
                      else
                      {
                        window.location.href = "#/addpatient/taskList";
                      } 
            }
            else
            {
                 if (localStorage.getItem("isManage") == "Yes")
                      {
                        window.location.href = "#/manage/taskList";
                      }
                      else
                      {
                        window.location.href = "#/addpatient/taskList";
                      } 
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
                  +     '<select ng-model = "task.Freq">'
                  +         '<option  value="">请选择</option>'
                  +         '<option  ng-repeat = "item in task.freqList" value="{{item.Name}}">{{item.Name}}</option>'
                  +     '</select>'
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
            var arry = obj.Instruction.split("：")[1].split(",")
            if (arry[arry.length -1].indexOf("餐") < 0)
            {
                $scope.task.MeasureOtherTime = arry[arry.length -1];
            }
        }   
        var myPopup = $ionicPopup.show({
        template:  '<ion-checkbox ng-repeat="item in task.MeasureTime" ng-model = "item.Checked">'
                  +'{{item.Name}}'
                  +'</ion-checkbox>'
                  +'<label class="item item-input">'
                  +   '<span class="input-label">其他</span>'
                  +   '<input type="text" ng-model = "task.MeasureOtherTime" placeholder="请输入...">'
                  +'</label>'  ,
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
                  if ($scope.task.MeasureOtherTime)
                  {
                      Str = Str + ',' + $scope.task.MeasureOtherTime
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

    //返回 
     $scope.onClickBackward = function(){
        $ionicHistory.goBack();
     }



    //获取运动频次或测量时间段
    function GetType (Category)
    {
        var promise = Dict.Type(Category);  
        promise.then(function(data) {
            if (Category == 'ExeciseFreq')
            {
                $scope.task.freqList = data;
            }
            else
            {
                for (var i = 0; i < data.length; i++)
                {
                    if ((data[i].Name != '起床后空腹时') && (data[i].Name != '其他'))
                    {
                        $scope.task.MeasureTime.push({"Name":data[i].Name, "Checked":false});                
                    }
                }
            }
            
        }, function(data) {  
        });
    }
}])

//GL 20151101 健康教育
.controller('healthEducationCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', '$ionicHistory', 'Storage', '$ionicLoading', '$ionicPopup', "$rootScope",function($scope, $http, $state, $stateParams, PlanInfo, $ionicHistory, Storage, $ionicLoading, $ionicPopup,$rootScope){ 
    var Type = $stateParams.tt;
    var PlanNo = localStorage.getItem("CurrentPlanNo");  
    $scope.task = {};
    $scope.task.list;

    $scope.isloaded = false;
    if(!$rootScope.TempList.AddList) $rootScope.TempList.AddList = new Array();
    if(!$rootScope.TempList.DeleteList) $rootScope.TempList.DeleteList = new Array();
    //loading图标显示
    $ionicLoading.show({
        content: '加载中',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    $scope.$on('$ionicView.enter', function() { 
        GettaskList();      
    });

    var arry = new Array();

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
            }
            $ionicLoading.hide();
            $scope.isloaded = true;
        }, function(data) {  
        });   
    } 

    $scope.task.detailList = new Array(); //全部三级任务详情
    $scope.task.secondlist; //某一项三级任务列表
    $scope.task.AddList = new Array();
    $scope.task.DeleteList = new Array();

    $scope.ShowDetail = function (piType)
    {
        var index;
        var existFlag = false;
        for (var i = 0; i < $scope.task.detailList.length; i++)
        {
            if ($scope.task.detailList[i].piType == piType)
            {
                existFlag = true;
                index = i;
                break;
            }
        }
        if (existFlag)
        {
            ShowPop(index);
        }
        else
        {
            var piArry = new Array();
            var promise = PlanInfo.GetTasks(PlanNo, piType);  
            promise.then(function(data) {
                if (data.length > 0)
                {
                    for(var i=0; i < data.length; i++)
                    {
                        if (data[i].InvalidFlag === "1")
                        {
                            data[i].ControlType = true;
                        } 
                        else
                        {
                            data[i].ControlType = false;
                        } 
                        piArry[i] = data[i].ControlType;                                                       
                    }
                    $scope.task.detailList.push({piType:piType, "Detail":data, "OriginFlag": piArry});
                    ShowPop($scope.task.detailList.length - 1);
                }            
            }, function(data) {  
            });   
        }
    } 
    function ShowPop(index)
    {
        $scope.task.secondlist = $scope.task.detailList[index].Detail;
        var Arry2 = $scope.task.detailList[index].OriginFlag;
        var piType = $scope.task.detailList[index].piType;

        var myPopup = $ionicPopup.show({
            template: '<ion-checkbox ng-repeat = "item in task.secondlist" ng-model= "item.ControlType">'
                      + '{{item.Name}}'
                      + '</ion-checkbox>',
            title: '选择内容',
            scope: $scope,
            buttons: [
            {
                text: '取消',
                type: 'button-small', 
                onTap: function(e) {
                    for (var i = 0; i < Arry2.length; i++)
                    {
                        $scope.task.detailList[index].Detail[i].ControlType = Arry2[i];
                    }
                    return 0;
                }              
            },
            {
                text: '确定',
                type: 'button-small button-positive',  
                onTap: function(e) {                   
                    return 1;
                }               
            }]
        });
        myPopup.then(function(res) {           
            if (res == 1)
            {
                var FlagBefore = false;
                var FlagNow = false;

                for (var i=0; i < Arry2.length; i++)
                {
                    if (Arry2[i])
                    {
                        FlagBefore = true;
                        break;
                    }
                }
                for (var i=0; i < $scope.task.secondlist.length; i++)
                {
                    if ($scope.task.secondlist[i].ControlType)
                    {
                        FlagNow = true;
                        break;
                    }
                }
                for (var i=0; i < $scope.task.secondlist.length; i++)
                {
                    if (($scope.task.secondlist[i].ControlType) && (!Arry2[i])) //插入数据
                    { 
                        $scope.task.AddList.push({"PlanNo":PlanNo, 
                                     "Type":$scope.task.secondlist[i].Type, 
                                     "Code":$scope.task.secondlist[i].Code, 
                                     "SortNo":'1', 
                                     "Instruction":"", 
                                     "piUserId":"1",  
                                     "piTerminalName":"1",  
                                     "piTerminalIP":"1", 
                                     "piDeviceType":0});               
                    }
                    if((!$scope.task.secondlist[i].ControlType) && (Arry2[i])) //删除数据
                    {
                        $scope.task.DeleteList.push({"PlanNo":PlanNo, 
                                         "Type":$scope.task.secondlist[i].Type, 
                                         "Code":$scope.task.secondlist[i].Code, 
                                         "SortNo":'1'});
                    }
                }
                
                if ((!FlagBefore) && (FlagNow)) //插入上级条目
                {
                    $scope.task.AddList.push({"PlanNo":PlanNo, 
                                 "Type":Type, 
                                 "Code":piType, 
                                 "SortNo":'1', 
                                 "Instruction":"", 
                                 "piUserId":"1",  
                                 "piTerminalName":"1",  
                                 "piTerminalIP":"1", 
                                 "piDeviceType":0});  
                    for(var i = 0; i < $scope.task.list.length; i++)
                    {
                        if ($scope.task.list[i].Code == piType)
                        {
                            $scope.task.list[i].ControlType = true;
                            break;
                        }
                    }               
                    
                }
                if ((FlagBefore) && (!FlagNow)) //删除上级条目
                {
                    $scope.task.DeleteList.push({"PlanNo":PlanNo, 
                                     "Type":Type, 
                                     "Code":piType, 
                                     "SortNo":'1'});
                    for(var i = 0; i < $scope.task.list.length; i++)
                    {
                        if ($scope.task.list[i].Code == piType)
                        {
                            $scope.task.list[i].ControlType = false;
                            break;
                        }
                    }  
                }
                $scope.task.detailList[index].Detail = $scope.task.secondlist;
                for (var i = 0; i < $scope.task.secondlist.length; i++)
                {
                    $scope.task.detailList[index].OriginFlag[i] = $scope.task.secondlist[i].ControlType;
                }
            }
        });
    }

    //点击确定或返回
    // $scope.Confirm = function ()
    // {
    //     var FlagBefore = false;
    //     var FlagNow = false;
    //     for (var i=0; i<arry.length; i++)
    //     {
    //         if (arry[i]) 
    //         {
    //             FlagBefore = true;
    //             break;
    //         }
    //     }
    //     for (var i=0; i<$scope.task.list.length; i++)
    //     {
    //         if ($scope.task.list[i].ControlType) 
    //         {
    //             FlagNow = true;
    //             break;
    //         }
    //     }
    //     if (!(FlagBefore) && (FlagNow))  //插入上层条目
    //     {
    //         $scope.task.AddList.push({"PlanNo":PlanNo, 
    //                                   "Type":Type, 
    //                                   "Code":Type + "0000", 
    //                                   "SortNo":'1', 
    //                                   "Instruction":"", 
    //                                   "piUserId":"1",  
    //                                   "piTerminalName":"1",  
    //                                   "piTerminalIP":"1", 
    //                                   "piDeviceType":0})
    //     }
    //     if ((FlagBefore) && !(FlagNow)) //删除上层条目
    //     {
    //         $scope.task.DeleteList.push({"PlanNo":PlanNo, 
    //                                      "Type":Type, 
    //                                      "Code":Type + "0000", 
    //                                      "SortNo":'1'})
    //     }
    //     if($scope.task.AddList.length > 0)
    //     {
    //         var promise = PlanInfo.SetTask($scope.task.AddList);
    //         promise.then(function(data)
    //         {
    //             if (data.result == "数据插入成功")
    //             {
    //                 if ($scope.task.DeleteList.length > 0)
    //                 {
    //                     var promise1 = PlanInfo.DeleteTask($scope.task.DeleteList);
    //                     promise1.then(function(data) 
    //                     {
    //                         if (data.result == "数据删除成功")
    //                         {
    //                           if (localStorage.getItem("isManage") == "Yes")
    //                           {
    //                             window.location.href = "#/manage/taskList";
    //                           }
    //                           else
    //                           {
    //                             window.location.href = "#/addpatient/taskList";
    //                           } 
    //                         }
    //                     },function(data){
    //                     });  
    //                 }
    //                 else
    //                 {
    //                     if (localStorage.getItem("isManage") == "Yes")
    //                     {
    //                       window.location.href = "#/manage/taskList";
    //                     }
    //                     else
    //                     {
    //                       window.location.href = "#/addpatient/taskList";
    //                     }            
    //                 }
    //             }
    //         },function(data){              
    //         });    
    //     }
    //     else
    //     {
    //         if ($scope.task.DeleteList.length > 0)
    //         {
    //             var promise1 = PlanInfo.DeleteTask($scope.task.DeleteList);
    //             promise1.then(function(data) 
    //             {
    //                 if (data.result == "数据删除成功")
    //                 {
    //                     if (localStorage.getItem("isManage") == "Yes")
    //                     {
    //                       window.location.href = "#/manage/taskList";
    //                     }
    //                     else
    //                     {
    //                       window.location.href = "#/addpatient/taskList";
    //                     } 
    //                 }
    //             },function(data){
    //             });  
    //         }
    //         else
    //         {
    //             if (localStorage.getItem("isManage") == "Yes")
    //             {
    //               window.location.href = "#/manage/taskList";
    //             }
    //             else
    //             {
    //               window.location.href = "#/addpatient/taskList";
    //             } 
    //         }
    //     }             
    // }   

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
        if(AddList.length > 0){
            for (var i = AddList.length - 1; i >= 0; i--) {
                   $rootScope.TempList.AddList.push(AddList[i]);
            };
            if (DeleteList.length > 0){
                  for (var i = DeleteList.length - 1; i >= 0; i--) {
                         $rootScope.TempList.DeleteList.push(DeleteList[i]);
                  };
                  if (localStorage.getItem("isManage") == "Yes")
                    {
                      window.location.href = "#/manage/taskList";
                    }
                    else
                    {
                      window.location.href = "#/addpatient/taskList";
                    } 
            }
            else
            {
              if (localStorage.getItem("isManage") == "Yes")
                  {
                    window.location.href = "#/manage/taskList";
                  }
                  else
                  {
                    window.location.href = "#/addpatient/taskList";
                  }            
            } 
        }
        else
        {
            if (DeleteList.length > 0)
            {
                  for (var i = DeleteList.length - 1; i >= 0; i--) {
                         $rootScope.TempList.DeleteList.push(DeleteList[i]);
                  };
                if (localStorage.getItem("isManage") == "Yes")
                      {
                        window.location.href = "#/manage/taskList";
                      }
                      else
                      {
                        window.location.href = "#/addpatient/taskList";
                      } 
            }
            else
            {
                 if (localStorage.getItem("isManage") == "Yes")
                      {
                        window.location.href = "#/manage/taskList";
                      }
                      else
                      {
                        window.location.href = "#/addpatient/taskList";
                      } 
            }
        }
    }
}])

//GL 20151101 药物治疗
.controller('DrugCtrl',['$scope', '$http', '$state', '$stateParams', '$ionicPopup', 'Users', 'PlanInfo', '$ionicHistory', '$ionicLoading', '$rootScope',function($scope, $http, $state, $stateParams, $ionicPopup, Users, PlanInfo, $ionicHistory, $ionicLoading,$rootScope){
    var PlanNo = localStorage.getItem("CurrentPlanNo");
    var Type = $stateParams.tt;
    $scope.task = {};
    $scope.task.list = new Array();
    $scope.task.Module;
    $scope.task.DrugList;
    $scope.DrugName;
    $scope.task.Dose;
    $scope.task.Freq;
    $scope.task.Way;
    $scope.task.Time;
    $scope.task.DeleteList = new Array();
    var TypeList = ["；用药剂量：", "；用药频次：", "；用药途径：", "；用药时间："];
    if(!$rootScope.TempList.AddList) $rootScope.TempList.AddList = new Array();
    if(!$rootScope.TempList.DeleteList) $rootScope.TempList.DeleteList = new Array();
    $scope.isloaded = false;

    //loading图标显示
    $ionicLoading.show({
        content: '加载中',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    $scope.$on('$ionicView.enter', function() {
        GettaskList(); 
    });

    $scope.$watch('$viewContentLoaded', function() { 
        $scope.GetDrugList();           
    });

    //获取任务列表
    function GettaskList()
    {
        var promise = PlanInfo.GetTasks(PlanNo, Type + "0000");  
        promise.then(function(data) { 
            //console.log(data);
            for (var i=0; i<data.length; i++)
            {   
                if(data[i].Instruction == "")
                {
                    data.splice(i, 1);
                }
                else
                {
                    data[i].Description = data[i].Instruction.split(':')[0];
                    data[i].OptionCategory = "";
                    var arry = data[i].Instruction.split(':')[1].split('|');
                    for (var j = 0; j < arry.length; j++)
                    {
                        if (arry[j] != "")
                        {
                            data[i].OptionCategory += TypeList[j] + arry[j];
                        }
                    }
                    if (data[i].OptionCategory != "")
                    {
                        data[i].OptionCategory = data[i].OptionCategory.substring(1);
                    }
                    $scope.task.DeleteList.push({"PlanNo":PlanNo, "Type":Type, "Code":Type + "0001", "SortNo":(i+1).toString()});
                }
            }                      
            $scope.task.list = data;
            $ionicLoading.hide();
            $scope.isloaded = true;
            ////console.log($scope.task.list);
            ////console.log($scope.task.DeleteList);
        }, function(data) {  
        });   
    }

    //获取备选药物列表
    $scope.GetDrugList = function  ()
    {
        var promise;
        if ($scope.task.Module == "M2")
        {
            promise = Users.getDiabetesDrugName();
        }
        else
        {            
            promise = Users.getHyperTensionDrugName();  
        }
        promise.then(function(data) {            
            $scope.task.DrugList = data;
            //console.log($scope.task.DrugList);
        }, function(data) {  
        }); 
    }

    //添加药物
    $scope.addItem = function ()
    {
        var myPopup = $ionicPopup.show({
        templateUrl: 'partials/addpatient/plan/drugAdd.html',
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
                  return [""];   
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
            if ((res[0] != "")&&(res[0]))
            {
                var Flag = false;
                for(var i=0; i<$scope.task.list.length;i++)
                {
                    if($scope.task.list[i].Description == res[0])
                    {
                        Flag = true;
                    }
                }
                if (Flag)
                {
                    RepeatAlert(); //弹出警告框
                }
                else
                {
                    var OptionCategory = "";
                    for (var i=1; i<5; i++)
                    {
                        if (!res[i])
                        {
                            res[i] = "";
                        }
                        else
                        {
                            OptionCategory += TypeList[i - 1] + res[i];
                        }                                              
                    }
                    if (OptionCategory != "")
                    {
                        OptionCategory = OptionCategory.substring(1);
                    }
                    $scope.task.list.push({"Description":res[0], "Instruction":res[0] + ":" + res[1]+ "|" + res[2] + "|" + res[3] + "|" + res[4], "OptionCategory": OptionCategory});
                    ////console.log($scope.task.list.length);
                    //SetTask({"PlanNo":PlanNo, "Type":Type, "Code":Type + "0000", "SortNo":'1', "Instruction":"", "piUserId":"1",  "piTerminalName":"1",  "piTerminalIP":"1",  "piDeviceType":0});

                }
            }
        });
    }

    //编辑药物
    $scope.EditTask = function (obj)
    { 
        $scope.task.DrugName = obj.Description;
        var temparry = obj.Instruction.split(':')[1].split('|');
        $scope.task.Dose = temparry[0];
        $scope.task.Freq = temparry[1];
        $scope.task.Way = temparry[2];
        $scope.task.Time = temparry[3];


        var myPopup = $ionicPopup.show({
        templateUrl: 'partials/addpatient/plan/drugEdit.html',
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
                  return [""]; 
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
            if(res[0] != "")
            {
                var OptionCategory = "";
                for (var i=1; i<5; i++)
                {
                    if (!res[i])
                    {
                        res[i] = "";
                    }
                    else
                    {
                        OptionCategory += TypeList[i - 1] + res[i];
                    }                   
                }
                if (OptionCategory != "")
                {
                    OptionCategory = OptionCategory.substring(1);
                }
                for (var i=0; i<$scope.task.list.length; i++)
                {
                    if($scope.task.list[i].Description === obj.Description)
                    {
                        $scope.task.list[i].Instruction = res[0] + ":" + res[1]+ "|" + res[2]+ "|" + res[3]+ "|" + res[4];
                        $scope.task.list[i].OptionCategory = OptionCategory;
                        break;
                    }
                }           

            }
        });
    }

    //删除药物
    $scope.RemoveItem = function (obj)
    {
        for (var i=0; i<$scope.task.list.length; i++)
        {
            if($scope.task.list[i].Description === obj.Description)
            {
                $scope.task.list.splice(i, 1);
                break;
            }
        }    
    }

    $scope.Confirm = function ()
    {
        var AddList = new Array();
        if ($scope.task.list.length > 0)
        {
            AddList.push({"PlanNo":PlanNo, "Type":Type, "Code":Type + "0000", "SortNo":'1', "Instruction":"", "piUserId":"1",  "piTerminalName":"1",  "piTerminalIP":"1",  "piDeviceType":0}); //父级条目
        }
        for(var i=0; i< $scope.task.list.length; i++)
        {
            AddList.push({"PlanNo":PlanNo, "Type":Type, "Code":Type + "0001", "SortNo":(i+1).toString(), "Instruction":$scope.task.list[i].Instruction, "piUserId":"1",  "piTerminalName":"1",  "piTerminalIP":"1",  "piDeviceType":0});
        }
        if ($scope.task.DeleteList.length > 0)
        {
            if($scope.task.list.length == 0)
            {
                $scope.task.DeleteList.push({"PlanNo":PlanNo, "Type":Type, "Code":Type + "0000", "SortNo":'1'}); //删除父级条目
                DeleteTask($scope.task.DeleteList);
            }
            else
            {
                 var promise = PlanInfo.DeleteTask($scope.task.DeleteList);
                  promise.then(function(data) 
                  {
                      if (data.result == "数据删除成功")
                      {
                          SetTask(AddList);
                      }
                  },function(data){
                  });  
            }
        }
        else
        {
            SetTask(AddList);
        }
    }

    function SetTask(obj)
    {
        // var promise = PlanInfo.SetTask(obj);
        // promise.then(function(data)
        // {
        //     if (data.result == "数据插入成功")
        //     {
        //         ////console.log("数据插入成功");
        //         $ionicHistory.goBack();
        //     }
        // },function(data){              
        // });   

        for (var i = obj.length - 1; i >= 0; i--) {
               $rootScope.TempList.AddList.push(obj[i]);
        };
       
        $ionicHistory.goBack();
    }

    function DeleteTask(obj)
    {
        // var promise = PlanInfo.DeleteTask(obj);
        // promise.then(function(data) 
        // {
        //     if (data.result == "数据删除成功")
        //     {
        //         $ionicHistory.goBack();
        //     }
        // },function(data){
        // });   
        for (var i = obj.length - 1; i >= 0; i--) {
               $rootScope.TempList.DeleteList.push(obj[i]);
        };

        $ionicHistory.goBack();
    }

    function RepeatAlert()
    {
        var alertPopup = $ionicPopup.alert({
            title: '提示',
            template: '这种药物在列表中已存在！'
        });
        alertPopup.then(function(res) {
            ////console.log($scope.TaskList.StartDate);
            $scope.task.list.Name = null;
        });
    }

    //返回   
    $scope.onClickBackward = function(){
        $ionicHistory.goBack();
    }
}])



//临床信息控制器 ZXF 20151031
.controller('datepickerCtrl',function($scope,$state,$http,$ionicModal,$ionicHistory,$ionicLoading,Storage,GetClinicInfoDetail,GetClinicalList,
  GetHZID,Getexaminfo,Getdiaginfo,Getdruginfo,GetBasicInfo,PageFunc) {

  //   loading图标显示
  // $ionicLoading.show({
  //   content: '加载中',
  //   animation: 'fade-in',
  //   showBackdrop: true,
  //   maxWidth: 200,
  //   showDelay: 0
    // });
  $scope.basicclinicinfo={
    HJZYYID:""
  };

   $scope.synclinicinfo=function(){//同步动作
    // console.log(Storage.get("PatientID"));
    // console.log($scope.tt);
    // console.log($scope.basicclinicinfo.HJZYYID);
    $ionicLoading.show({
      template:'同步需要时间较长，请耐心等候…',
    });
    $http({
      method:'GET',
      url:'http://10.12.43.56:57772/csp/hz_mb/Bs.WebService.cls?soap_method=GetPatient',
        // http://localhost:57772/csp/hz_mb/%25SOAP.WebServiceInvoke.cls?CLS=Bs.WebService&OP=GetBasicInfo
        params:{
          'UserId':Storage.get("PatientID"),
          'PatientId':$scope.basicclinicinfo.HJZYYID,
          'StartDateTime': $scope.tt,
          'HospitalCode':'HJZYY'
        },
      timeout: 60000,
        // }).success(function(data,header,config,status){
        }).success(function(data,header){
          var status=data.slice(data.search('Status'),data.search('/Status'));
          console.log(data.slice(data.search('Status'),data.search('/Status')));
          var wetherhaveerr1=data.match("Error");//查看是否包含error，有则认定同步不成功
          var wetherhaveerr2=data.match("error");

          var noArr=status.match(/\d+/g);

          // console.log(noArr);
          //根据status内的内容判断是否同步成功，输出不同弹框
         if (wetherhaveerr1==null&&wetherhaveerr2==null) 
         {  //响应成功
          if (!(noArr[1]==0&&noArr[3]==0&&noArr[5]==0&&noArr[7]==0&&noArr[9]==0&&noArr[11]==0)) 
          {
            var sysResult="诊断："+noArr[1]+"条"+"、"+"检查："+noArr[3]+"条"+"、"+"化验："+noArr[5]+"条"+"、"+"用药："+noArr[7]+"条"+"、"+"手术："+noArr[9]+"条"+"、"+"体征："+noArr[11]+"条";
            $ionicLoading.hide();
            PageFunc.message(sysResult,20000,"同步成功");
                    //同步成功 刷新页面
                    GetClinicalList.GetClinicalInfoListbyUID({UserId:Storage.get("PatientID")}).then(function(data)
                    {
                      $scope.cliniclist=data.DT_InPatientInfo;
                    }, function(data) {
                    });
                  }
                  else if ($scope.HJZYYID!="")
                  {
                    $ionicLoading.hide();
                    PageFunc.message("可能原因：就诊ID错误或者时间设置过短",20000,"同步失败");
                  };
                }
                else
                {
                  $ionicLoading.hide();
                  PageFunc.message("系统错误",20000,"同步失败");
                };     
              }).error(function(data,header){
        //处理响应失败
        $ionicLoading.hide();
        PageFunc.message("响应超时",20000,"同步失败");
      });
  }; 



    $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
    $scope.Name=Storage.get('PatientName');
    $scope.age=Storage.get('PatientAge');
    $scope.gender=Storage.get('PatientGender');    

  //进入页面获取患者的基本信息
  

  //首先获取pid
    var PatientID=Storage.get("PatientID");
    console.log(PatientID);
  //根据pid获取海总最近一次就诊id
   GetHZID.GetHUserIdByHCode({UserId:PatientID,HospitalCode:'HJZYY'}).then(function(data){
      //拿到海总的就诊号用于后续同步
      console.log(data.result);
      $scope.HJZYYID=data.result;
      // console.log($scope.HJZYYID);
    });


  //根据userid获取就诊信息列表（展示时用）
  var promise2=GetClinicalList.GetClinicalInfoListbyUID({UserId:PatientID});
  promise2.then(function(data){
    $scope.cliniclist=data.DT_InPatientInfo;
    console.log($scope.cliniclist.length);

  }, function(data) {
  });
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
    var promise1=Getexaminfo.Getexaminfobypiduid({UserId:PatientID,VisitId:$scope.cliniclist[index].VisitId});
    promise1.then(function(data1){
      $scope.Examinationinfo=data1;
      $scope.Examinationinfo.length==0?$scope.show=true:$scope.show=false;
    }, function(data1) {  
    });
  };
  $scope.descstyle=[];
  var judgement1=true;
  $scope.showalldesc=function(index){
    console.log(index);
    judgement1 = !judgement1;
    console.log(judgement1);
    if (judgement1) {
      $scope.descstyle[index]='nowrap';
    }else{
      $scope.descstyle[index]='pre-wrap';
    };
  };
  var judgement2=true;
  $scope.resultstyle=[];
  $scope.showallresult=function(index){
    console.log(index);
    judgement2 = !judgement2;
    console.log(judgement2);
    if (judgement2) {
      $scope.resultstyle[index]='nowrap';
    }else{
      $scope.resultstyle[index]='pre-wrap';
    };
  };
  $scope.closeexamModal = function() {
    $scope.modalexam.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.modalexam.remove();
  });
  //点击查看详情根据UserId、Type、VisitId、Date获取具体诊断信息modal形式展示
  $ionicModal.fromTemplateUrl('partials/addpatient/DiagnosisInfo.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modaldiag = modal;
  });
  $scope.DiagnosisNamestyle=[];
  var judgement4=true;
  $scope.showallDiagnosisName=function(index){
    console.log(index);
    judgement4 = !judgement4;
    console.log(judgement4);
    if (judgement4) {
      $scope.DiagnosisNamestyle[index]='nowrap';
    }else{
      $scope.DiagnosisNamestyle[index]='pre-wrap';
    };
  };
  $scope.opendiaginfomodal = function(index) {
    $scope.modaldiag.show();
    var promise0=Getdiaginfo.Getdiaginfobypiduid({UserId:PatientID,VisitId:$scope.cliniclist[index].VisitId});
    promise0.then(function(data0){
      $scope.Diagnosisinfo=data0;
      $scope.Diagnosisinfo.length==0?$scope.show=true:$scope.show=false;

      //console.log($scope.Diagnosisinfo);
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

  //点击查看详情根据UserId、Type、VisitId、Date获取具体用药信息modal形式展示
  $ionicModal.fromTemplateUrl('partials/addpatient/druginfo.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modaldrug = modal;
  });
  $scope.OrderContentstyle=[];
  var judgement3=true;
  $scope.showallOrderContent=function(index){
    console.log(index);
    judgement3 = !judgement3;
    console.log(judgement3);
    if (judgement3) {
      $scope.OrderContentstyle[index]='nowrap';
    }else{
      $scope.OrderContentstyle[index]='pre-wrap';
    };
  };
  $scope.opendruginfomodal = function(index) {
    $scope.modaldrug.show();
      // var d={UserId:$scope.SyncInfo.patientid,Type:'DrugRecord',VisitId:$scope.clinicinfo[index].VisitId, Date:$scope.tt};
      var promise1=Getdruginfo.Getdruginfobypiduid({UserId:PatientID,VisitId:$scope.cliniclist[index].VisitId});
      promise1.then(function(data2){
        $scope.DrugRecordinfo=data2;
        $scope.DrugRecordinfo.length==0?$scope.show=true:$scope.show=false;


        //console.log($scope.DrugRecordinfo);
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


  //datepicker函数
  var d=new Date();
  var month=(d.getMonth()+1);
  var day=d.getDate();
  if(month<10)
  {
    month='0'+(d.getMonth()+1);
  };
  if (day<10) 
  {
    day='0'+d.getDate();
  };
  $scope.tt=d.getFullYear()+'-'+month+'-'+day;
  });
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
        from: new Date(1950, 8, 2),   //Optional
        to: new Date(),    //Optional
        callback: function (val) {    //Mandatory
          datePickerCallback(val);
        }
      };
      var datePickerCallback = function (val) {
        if (typeof(val) === 'undefined') 
        {
          //console.log('No date selected');
        } 
        else 
        {
          var truemonth=(val.getMonth()+1);
          var trueday=val.getDate();
          if(truemonth<10)
          {
            truemonth='0'+(val.getMonth()+1);
          };
          if (trueday<10) 
          {
            trueday='0'+val.getDate();
          };
      $scope.tt=val.getFullYear()+'-'+truemonth+'-'+trueday;
    }
  };

  $scope.backtocoach=function(){
    $state.go('coach.patients');
  }
  $scope.NextPage = function(){
    $state.go('addpatient.ModuleInfo');
  };

 
})

//抽象页面上用户信息的控制器 ZXF 20151102
.controller('mainCtrl',['$scope','$rootScope','$state','Storage','MessageInfo', function($scope,$rootScope, $state,Storage,MessageInfo){
  var getSMSCount = function(doc,pid){
    MessageInfo.messageNum(doc,pid).then(function(data){ 

      $rootScope.SMSCount=parseInt(data.result);
    },function(){
      getSMSCount();
    });
  }
  var PID;
  var doc=Storage.get('UID');
  $scope.$on('$ionicView.enter', function(){
    $scope.SMSCount=$rootScope.SMSCount;
    var pid=Storage.get('PatientID');
    if(pid!=PID){
      $scope.SMSCount=0;
      PID=pid;
    }
    getSMSCount(doc,PID);
  })
  // $scope.$on('$ionicView.enter', function(){
  //   $scope.SMSCount=0;
  // })
}])

// 依从率图的控制器amcharts部分 ZXF 20151102
.controller('planCtrl',function($scope, $state,$http,$ionicPopover,$ionicLoading,Storage,GetBasicInfo,GetPlanInfo,GetPlanchartInfo) {


  //根据手机屏幕高度调整chart高度
  // $scope.test='这是测试';
  var phoneheight = (window.innerHeight > 0) ? window.innerHeight : screen.height; 
  var chartheight=phoneheight-290;
  Storage.set("phoneheight",phoneheight);
  
  if (chartheight>400) 
  {
    chartheight=400;
  };
  chartheight=chartheight+'px';

  $scope.suitstyle=function()
  {
  return {'height':'300px'};
  }
  //载入页面加载。。。
  $scope.$on('$ionicView.enter', function() 
  {   
    // loading图标显示
    $ionicLoading.show({
      content: '加载中',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    //默认进入依从图，button颜色改变
    $scope.mybuttonStyle={'color':'blue','font-weight':'bold'};
    $scope.Name=Storage.get('PatientName');
    $scope.age=Storage.get('PatientAge');
    $scope.gender=Storage.get('PatientGender');
    var promise=GetBasicInfo.GetBasicInfoByPid(Storage.get('PatientID'));
    promise.then(function(data){
      $scope.clinicinfo=data;
    }, function(data) {
    })

  var PatintId = Storage.get('PatientID');

  //进入页面，调用函数获取任务列表（当前、往期计划）
  var promiseS1=GetPlanInfo.GetplaninfobyPlanNo({PatientId:PatintId,PlanNo:'NULL',Module:'M1',Status:'3'});
  promiseS1.then(function(data1){
    // console.log(data1);
    Storage.set("selectedvitaltype",'收缩压');   
    //计划进度情况
    if (data1.length!=0&&data1[0].EndDate!="99991231") 
    {
      $scope.now=true;
      $scope.before=false;
      var myDate = new Date();
      var month=(myDate.getMonth()+1);
      var day=myDate.getDate();
      if ((myDate.getMonth()+1)<10) 
      {
        month='0'+''+(myDate.getMonth()+1);
      };
      if (myDate.getDate()<10) 
      {
         day='0'+''+myDate.getDate();
      };
      var today=myDate.getFullYear()+'-'+month+'-'+day;
      console.log(today);   
      //获取时间间隔天数的函数
      function GetDateDiff(startDate,endDate)  
      {  
          var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();     
          var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();     
          var dates = Math.abs((startTime - endTime))/(1000*60*60*24);     
          return  dates;    
      };
      
      //转换时间类型      
      function changedatestyle(date)
      {
      var yyyy=date.slice(0,4);
      var mm=date.slice(4,6);
      var dd=date.slice(6,8);
      var changeddate=yyyy+'-'+mm+'-'+dd;
      return changeddate;
        
      };
      var startdate=changedatestyle(data1[0].StartDate);
      console.log(startdate);
      //计划已经进行的时间
      var passday=GetDateDiff(startdate,today);
      //计划还要进行的时间
      var enddate=changedatestyle(data1[0].EndDate);
      console.log(enddate);

      var processingday=GetDateDiff(today,enddate);
      //获取计划总时间
      var planlength=GetDateDiff(startdate,enddate);
      //计划进展百分比
      $scope.process=Math.floor((passday/planlength)*100);
      //离结束还有的天数
      $scope.undodays=processingday;
      if ($scope.process==0)
       {
        $scope.process=1
      };
    }else
    {
      $scope.now=0;
      $scope.before=0;
      $scope.none=1;
    };
    

    if (data1.length==0) 
    {
    $scope.latestplan="余余余无执行中的计划";
    $scope.planno="余余余无执行中的计划";
    $ionicLoading.hide();
    $scope.diaplaysm=true;
    }else
    {
    //页面载入时显示的当前计划，收缩压的图
    Storage.set("latestplanstartdate",data1[0].StartDate);
    $scope.startdate=data1[0].StartDate;

    Storage.set("latestplanenddate",data1[0].EndDate);
    $scope.enddate=data1[0].EndDate;

    Storage.set("latestplanno",data1[0].PlanNo);
    $scope.planno=data1[0].PlanNo;
    $scope.latestPlanInfo=data1;
    $scope.latestplan=data1[0].PlanNo;
    //console.log($scope.latestplan);

    //
    var d = {
      UserId:PatintId,
      PlanNo:data1[0].PlanNo,
      StartDate:data1[0].StartDate,
      EndDate:data1[0].EndDate,
      ItemType:'Bloodpressure',
      ItemCode:'Bloodpressure_1'
    };
    GetPlanchartInfo.GetchartInfobyPlanNo(d).then(
    function(data){
      $scope.HPchartdate=data;
        // if ($scope.diaplaysm=false) 
        //   {
            var dataisnone=false;
            for (var i = 0; i <= data.length-1; i++) 
            {
              if (data[i].Value!='#') 
              {
                dataisnone=true;
                break;
              };
            };
            console.log(dataisnone);
          if ($scope.HPchartdate.length==0||dataisnone==false) 
            {
              $scope.diaplaysm=true
            };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };

            createStockChart($scope.HPchartdate,"收缩压","mmHg");
              
              $ionicLoading.hide();
      }, function(data) {
        /////
      });

  };

    //再调用同一函数，status=4，调取往期计划planno
      GetPlanInfo.GetplaninfobyPlanNo({PatientId:PatintId,PlanNo:'NULL',Module:'M1',Status:'4'}).then(
      function(s){
        $scope.formerPlanInfo=s;
        Storage.set("formerplan",angular.toJson($scope.formerPlanInfo));
      }, function(e) {  
      });

  }, function(e) {
      ///// 
    });
  });

  //切换不同计划时
  $scope.changeplan= function(changedplan)
  {
    // var wetherdraw=true;
    $scope.planno=changedplan;
    Storage.set('selectedplan',changedplan);
    console.log(Storage.get('selectedplan'));
    $scope.localselectedname=Storage.get("selectedvitaltype");
    $scope.plan=angular.fromJson(Storage.get("formerplan"));
    if (changedplan==Storage.get("latestplanno")) 
    {
      if (Storage.get("latestplanenddate")=="99991231")
       {
         $scope.now=0;
         $scope.before=0;
         $scope.none=1;
       }else
       {
        $scope.now=1;
        $scope.before=0;
        $scope.none=0;
       };
      $scope.startdate=Storage.get("latestplanstartdate");
      $scope.enddate=Storage.get("latestplanenddate");
    }else
    {
      if (changedplan=="余余余无执行中的计划") 
      {
        // wetherdraw=false;
        // $scope.planno='';
        $scope.now=0;
        $scope.before=0;
        $scope.none=1;
      }else
      {
       $scope.now=0;
       $scope.before=1;
       $scope.none=0;
       for (var i = 0; i <= $scope.plan.length-1; i++) 
       {
          //console.log($scope.plan[i].PlanName);
          if ($scope.plan[i].PlanNo==changedplan) 
          {
           $scope.startdate= $scope.plan[i].StartDate;
           $scope.enddate=$scope.plan[i].EndDate;
         };
       };
     };
   };
  drawcharts($scope.localselectedname,Storage.get('PatientID'),$scope.planno,$scope.startdate,$scope.enddate);
  };
  //切换体征
  $scope.changeVitalInfo = function(option) 
    {
      console.log($scope.planno);
       $scope.selectedname=option.SignName;
       if ($scope.planno=="余余余无执行中的计划") 
        {
             //传参调函画图
         drawcharts($scope.selectedname,Storage.get('PatientID'),$scope.planno,99991231,99991231);
        }else
        {
             //传参调函画图
          drawcharts($scope.selectedname,Storage.get('PatientID'),$scope.planno,$scope.startdate,$scope.enddate);
        }
       $ionicLoading.show
          ({
            content: '加载中',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
          });
       Storage.set("selectedvitaltype",option.SignName);
    

    };
 //提振参数选择下拉框选项 默认收缩压selected
  $scope.options = [{"SignName":"收缩压"},
    {"SignName":"舒张压"},
    {"SignName":"脉率"},
    {"SignName":"凌晨血糖"},
    {"SignName":"睡前血糖"},
    {"SignName":"早餐前血糖"},
    {"SignName":"早餐后血糖"},
    {"SignName":"午餐前血糖"},
    {"SignName":"午餐后血糖"},
    {"SignName":"晚餐前血糖"},
    {"SignName":"晚餐后血糖"},
  ];  
  $scope.vitalInfo =$scope.options[0];
  // console.log($scope.options[0]);
  // console.log($scope.vitalInfo);
    //切换体征选项后，重新绘制
  var drawcharts=function(param,PatientId,plannumber,Sdate,Edate){
    if (param=="舒张压") {
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'Bloodpressure',ItemCode:'Bloodpressure_2'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.LPchartdate=data;
          console.log($scope.LPchartdate);
          // $scope.LPchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;

          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.LPchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true;
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.LPchartdate,"舒张压","mmHg");

          // createStockChart($scope.LPchartdate,"舒张压","mmHg");
        }, function(data) 
          {
            $scope.LPchartdate='';
            console.log(1);
            $ionicLoading.hide();
          });
    };
    if (param=="收缩压") {
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'Bloodpressure',ItemCode:'Bloodpressure_1'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.HPchartdate=data;

          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.HPchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.HPchartdate,"收缩压","mmHg");
          // createStockChart($scope.HPchartdate,"收缩压","mmHg");
          // $scope.HPchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
          {
            $ionicLoading.hide();
            /////
          });
    };
    if (param=="脉率") {
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'Pulserate',ItemCode:'Pulserate_1'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.HBchartdate=data;
          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.HBchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.HBchartdate,"脉率","次/分钟");
          // createStockChart($scope.HBchartdate,"脉率","次/分钟");
          // $scope.HBchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
          {
          $ionicLoading.hide();
          });
    };
    if(param=="凌晨血糖"){
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_2'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.BSchartdate=data;
          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.BSchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.BSchartdate,"凌晨血糖","nmol/L");
          // createStockChart($scope.BSchartdate,"凌晨血糖","nmol/L");
          // $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
          {
            $ionicLoading.hide();
          });
    };
    if(param=="睡前血糖"){
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_3'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.BSchartdate=data;
          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.BSchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.BSchartdate,"睡前血糖","nmol/L");
          // createStockChart($scope.BSchartdate,"睡前血糖","nmol/L");
          // $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
          {
            $ionicLoading.hide();
          });
    }
    if(param=="早餐前血糖"){
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_4'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.BSchartdate=data;
          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.BSchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.BSchartdate,"早餐前血糖","nmol/L");
          // createStockChart($scope.BSchartdate,"早餐前血糖","nmol/L");
          // $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
          {
            $ionicLoading.hide();
          });
    };
    if(param=="早餐后血糖"){
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_5'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.BSchartdate=data;
          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.BSchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.BSchartdate,"早餐后血糖","nmol/L");
          // createStockChart($scope.BSchartdate,"早餐后血糖","nmol/L");
          // $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
            {
                $ionicLoading.hide();
            });
    };
    if(param=="午餐前血糖"){
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_6'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.BSchartdate=data;
          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.BSchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.BSchartdate,"午餐前血糖","nmol/L");
          // createStockChart($scope.BSchartdate,"午餐前血糖","nmol/L");
          // $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
          {
            $ionicLoading.hide();
          });
    };
    if(param=="午餐后血糖"){
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_7'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.BSchartdate=data;
          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.BSchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.BSchartdate,"午餐后血糖","nmol/L");
          // createStockChart($scope.BSchartdate,"午餐后血糖","nmol/L");
          // $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
          {
            $ionicLoading.hide();
          });
    };
    if(param=="晚餐前血糖"){
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_8'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.BSchartdate=data;
          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.BSchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.BSchartdate,"晚餐前血糖","nmol/L");
          // createStockChart($scope.BSchartdate,"晚餐前血糖","nmol/L");
          // $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
        {
          $ionicLoading.hide();
        });
    };
    if(param=="晚餐后血糖"){
      GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_9'}).then(
        function(data){
          $ionicLoading.hide();
          $scope.BSchartdate=data;
          var dataisnone=false;
          for (var i = 0; i <= data.length-1; i++) 
          {
            if (data[i].Value!='#') 
            {
              dataisnone=true;
              break;
            };
          };
          console.log(dataisnone);
          if ($scope.BSchartdate.length==0||dataisnone==false) 
          {
            $scope.diaplaysm=true;
            // chart="";
          };
          if (dataisnone) 
          {
            $scope.diaplaysm=false;
          };
            createStockChart($scope.BSchartdate,"晚餐后血糖","nmol/L");
          // createStockChart($scope.BSchartdate,"晚餐后血糖","nmol/L");
          // $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
        }, function(data) 
        {
          $ionicLoading.hide();
        });
    };
  }
  //传参绘图
  function createStockChart(ChartData,title,unit) {

    chart="";
    chart = AmCharts.makeChart("chartdiv3", {
      "type": "serial",
      "theme": "light",
      "legend": {
       "useGraphSettings": true
     },

     "dataProvider": ChartData,
     "valueAxes": [{
      // "integersOnly": true,
          // "maximum": 160,
          // "minimum": 60,
          "reversed": false,
          "axisAlpha": 0,
          "dashLength": 5,
          "gridCount": 10,
          "position": "left",

          
        }],
        "startDuration": 0.5,
        "graphs": [{
          "balloonText": "[[category]]: <p>[[title]]：[[value]] [[unit]]</p>",
          "bullet": "round",
          "type": "smoothedLine",
          "valueField": "Value",
          "title":title,
          "fillAlphas": 0
        }],
        "chartScrollbar": {
         "gridAlpha":0,
         // "hideXScrollbar":true,
         'maximum':0.5,
         // "scrollDuration":0.5,
         "color":"#888888",
         "scrollbarHeight":25,
         "backgroundAlpha":0,
          // "selectedBackgroundAlpha":0.1,
          // "selectedBackgroundColor":"#888888",
          "graphFillAlpha":0,
          "autoGridCount":true,
          // "selectedGraphFillAlpha":1,
          "graphLineAlpha":0.2,
          "graphLineColor":"#c2c2c2",
          // "selectedGraphLineColor":"#888888",
          // "selectedGraphLineAlpha":1

        },

        "chartCursor": {
         "pan" :true,
         "cursorAlpha": 0,
         "zoomable": false
       },
       "categoryField": "Date",
       "dataDateFormat": "YYYY-MM-DD",
       "categoryAxis": {
         "gridPosition": "start",
        // "parseDates": true,
        "axisAlpha": 0,
        "fillAlpha": 0.05,
        "fillColor": "#000000",
        "minPeriod": "DD",
        "gridAlpha": 0
          // ,
          // "position": "top"
        },
        "export": {
         "enabled": true,
         "position": "bottom-right"
       }
     })

    chart.addListener("rendered", zoomChart);

    zoomChart();

    function zoomChart() {
        chart.zoomToIndexes(chart.dataProvider.length - 5, chart.dataProvider.length - 1);
    }
    }
    //返回主页面
    $scope.backtocoach=function(){
      $state.go('coach.home');
    };

})


//ZXF 20151102 体征列表
 .controller('vitaltableCtrl', function($rootScope,$scope,$state,$cordovaDatePicker,Storage,GetVitalSigns,GetBasicInfo) {

      $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
        $scope.SMSCount=$rootScope.SMSCount;
        $scope.tablestyle={'color':'#3d6399','font-weight':'bold'};
            // var promise=GetBasicInfo.GetBasicInfoByPid(Storage.get('PatientID'));
            //   promise.then(function(data){
            //     $scope.clinicinfo=data;
            //     //console.log($scope.clinicinfo)
            //     $scope.Name=data.UserName;
            //     $scope.age=data.Age;
            //     $scope.gender=data.GenderText;
            //   }, function(data) {
            //   })
      $scope.Name=Storage.get('PatientName');
      $scope.age=Storage.get('PatientAge');
      $scope.gender=Storage.get('PatientGender');
             });
        
  
      $scope.backtocoach=function(){
        $state.go('coach.home');
      }

     var PatintId=Storage.get('PatientID');
     
     var setstate;
     $scope.getbackgroundcolor = function(index){
      // var temp='{background-color:#EEEEEE}'
      
      if(index%2){
        // temp={background-color:#EEEEEE};
        return {'background-color':'#EEEEEE'};
      }else{
        // temp='';
        return '';
      }
      // //console.log(index%2);
      // return temp;
     }
     //调函数
  var showthetable=function(PatintId,date1,date2){
    GetVitalSigns.GetVitalSignsbydate(PatintId,date1,date2).then(
      function(data){
        $scope.vitalsigns=data;
        if (data.length==0) {
          $scope.displaytable=true;
        }else{
          $scope.displaytable=false;
        };
        Storage.set("vitalsigns",angular.toJson( $scope.vitalsigns));
        //console.log($scope.vitalsigns);
        $scope.allsigns=angular.fromJson(Storage.get("vitalsigns"));
        Storage.rm("vitalsigns");
      }, function(data) {
          /////
    });
      //数据展示
    
  };
     //新建，页面初始时显示的时间，开始时间是昨天，结束时间是当天
     var d=new Date();
     var day=d.getDate();
     var month=d.getMonth()+1;
     var year=d.getFullYear();
     var yestoday=d.getDate()-1;
     var yestodaymonth=d.getMonth()+1;
     var yestodayyear=d.getFullYear();
  //这里应该会涉及到昨天是哪天的问题
     if (d.getDate()<=9) {
      //console.log(d.getDate());
       day='0'+''+d.getDate();
       yestoday='0'+''+(d.getDate()-1);
      //console.log(day);
      if ((d.getDate()==1)&&(d.getMonth()>=1)) {
        yestodaymonth=d.getMonth(); 
       switch(d.getMonth()){ 
       case 2 : yestoday =28 ; 
       break; 
       case 1,3,5,7,8,10,12 : yestoday = 31; 
       break; 
       case 4,6,9,11 : yestoday = 30; 
       break; 
       }
      }else if((d.getDate()==1)&&(d.getMonth()==0)) {
         yestodayyear=d.getFullYear()-1;
         yestodaymonth=12,
         yestoday=31;
     }; 
     };
     if (month<10) {
      month='0'+month;
     };
     if (yestodaymonth<10) {
      yestodaymonth='0'+yestodaymonth;
     };

     $scope.selectedstartdate=yestodayyear+'-'+yestodaymonth+'-'+yestoday;
     $scope.selecrtedenddate=date=year+'-'+month+'-'+day;
     $scope.StartDateforuse =parseInt(yestodayyear+''+yestodaymonth+''+yestoday);
     $scope.EndDateforuse =parseInt(year+''+month+''+day);
     console.log($scope.EndDateforuse);
     Storage.set("EndDateforvitasign",$scope.EndDateforuse);
     Storage.set("StartDateforvitasign",$scope.StartDateforuse);
       //调用函数显示昨天的数据
       showthetable(PatintId,$scope.StartDateforuse,$scope.EndDateforuse);


        $scope.setStart = function(){
          setstate=0;
        } 
        $scope.setEnd = function(){
          setstate=1;
        } 


        var datePickerCallback = function (val) {
          if (typeof(val) === 'undefined') {
            //console.log('No date selected');
          } else {

            $scope.inputDate=val;
            var chooenmonth=(val.getMonth()+1);
            var chooenday=val.getDate();
            if ((val.getMonth()+1)<10) {
              chooenmonth='0'+''+(val.getMonth()+1);
            };
            if (val.getDate()<10) {
               chooenday='0'+''+val.getDate();
            };
            var date=val.getFullYear()+'-'+chooenmonth+'-'+chooenday;    
            var dateuser=parseInt(val.getFullYear()+''+chooenmonth+''+chooenday);

           if(setstate==0){
            $scope.selectedstartdate=date;
             Storage.set("StartDateforvitasign",dateuser )

             }else if(setstate==1){

           $scope.selecrtedenddate=date       
              //console.log($scope.selecrtedenddate);
              Storage.set("EndDateforvitasign",dateuser )
             }
          }
        };
        var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
        var weekDaysList=["日","一","二","三","四","五","六"];
        $scope.datepickerObject = {
          titleLabel: '日期',  //Optional
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
        

  //点击搜索，调用函数
  $scope.bowerdata=function(){
   var startjikan=Storage.get("StartDateforvitasign");
    var endjikan=Storage.get("EndDateforvitasign");
    console.log(startjikan);
   console.log(endjikan);
    showthetable(PatintId,startjikan,endjikan);
  };




})
