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
      var saveUID = function(){
        var UIDpromise=userservice.UID('PhoneNo',logOn.username);
        UIDpromise.then(function(data){
          if(data.result!=null){
            Storage.set('UID', data.result);
            //window.plugins.jPushPlugin.setAlias(data.result);
          }
        },function(data){
        });
      }                
      var promise=userservice.userLogOn('PhoneNo' ,logOn.username,logOn.password,'HealthCoach');
      if(promise==7){
        $scope.logStatus='手机号验证失败！';
        return;
      }
      loading.loadingBarStart($scope);
      promise.then(function(data){
        loading.loadingBarFinish($scope);
        $scope.logStatus=data.result.substr(0,4);
        if($scope.logStatus=="登陆成功"){ 
          Storage.set('TOKEN', data.result.substr(12));
          Storage.set('USERNAME', logOn.username);
          Storage.set('isSignIN','YES');
          saveUID();
          $timeout(function(){$state.go('coach.home');} , 1000);
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
          $scope.logStatus="登陆成功";
          //Storage.set('TOKEN', data.result.substr(12));
          Storage.set('USERNAME', logOn.username);
          Storage.set('isSignIN','YES');
          saveUID();
          //PageFunc.confirm('未认证，激活,这个跳转在controller 77行');
          
          $timeout(function(){$state.go('upload')} , 500);  
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
            console.log(upload);
            Users.postDoctorInfo(upload).then(function(data){
              loading.loadingBarFinish($scope);
              $scope.logStatus=data.result;
              if(data.result=="数据插入成功"){
                $scope.logStatus='注册成功！';
                $timeout(function(){$state.go('upload');} , 500);
              }
            },function(data){
              loading.loadingBarFinish($scope);
              $scope.logStatus='网络错误1！';
            });            
          }else{
            loading.loadingBarFinish($scope);
            $scope.logStatus='系统错误！';
          }
        },function(data){
          loading.loadingBarFinish($scope);
          $scope.logStatus='网络错误2！';
        });
      }
      loading.loadingBarStart($scope);
      userservice.userRegister("PhoneNo",$rootScope.userId, userName, $rootScope.password,"HealthCoach")
      .then(function(data){
        userservice.userLogOn('PhoneNo' ,$rootScope.userId,$rootScope.password,'HealthCoach')
        .then(function(data){
          if(data.result.substr(0,4)=="登陆成功"){
            Storage.set('TOKEN', data.result.substr(12));
            saveUID();
          }
        },function(data){
          if(data.data.result=='暂未激活'){
            //Storage.set('TOKEN', data.result.substr(12));
            saveUID();
          }else{
            loading.loadingBarFinish($scope);
            $scope.logStatus='网络错误3！';
          }
        });
      },function(data){        
        if(data.data.result=='同一用户名的同一角色已经存在'){
          userservice.userLogOn('PhoneNo' ,$rootScope.userId,$rootScope.password,'HealthCoach')
          .then(function(data){
            if(data.result.substr(0,4)=="登陆成功"){
              Storage.set('TOKEN', data.result.substr(12));
              saveUID();
            }
          },function(data){
            if(data.data.result=='暂未激活'){
              //Storage.set('TOKEN', data.result.substr(12));
              saveUID();
            }else{
              loading.loadingBarFinish($scope);
              $scope.logStatus='网络错误4！';
            }
          });
        }else if(data.data==null && data.status==0){
          loading.loadingBarFinish($scope);
          $scope.logStatus='网络错误5！';
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
            $state.go('coach.i');
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
    if(veriusername!=0 && verifyCode!=0 && veriusername!='' && verifyCode!=''){
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
        if(data.result[0]=='您'){
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
          // loading.loadingBarFinish($scope);
          // $scope.logStatus='该账户已进行过注册！';
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
        //console.log(success);
      }, function(error) {
        // An error occurred
        //console.log(error);
      });
  }
}])

//lrz20151109
.controller('CoachIdUploadCtrl', ['$scope','$state','$ionicPopover','$stateParams','Storage','Patients','Camera','Users','$ionicActionSheet','$timeout','$rootScope','$cordovaDatePicker','CONFIG','PageFunc',
  function($scope,$state,$ionicPopover,$stateParams,Storage,Patients,Camera,Users,$ionicActionSheet,$timeout,$rootScope,$cordovaDatePicker,CONFIG,PageFunc) { //LRZ

  //获得信息
   // $scope.imgURI = Storage.get(14);
   // $scope.userInfo = JSON.parse(Storage.get("userInfo"));
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
     $scope.userInfo.BasicInfo.birthdayforshow = t[0] + t[1] + t[2] + t[3]  + '/' + t[4] + t[5] + '/' + t[6] + t[7];
       Users.getDocDtlInfo(Storage.get("UID")).then(function(data,headers){
        var temp = data;
        // //console.log(data);
        $scope.userInfo.DtInfo = {
          unitname: temp.UnitName,
          jobTitle: temp.JobTitle,
          level: temp.Level,
          dept: temp.Dept,
          photoAddress : temp.PhotoAddress,
          photoAddress_Check : temp.ActivatePhotoAddr  //LRZ1104
        }
          // console.log( $scope.userInfo.DtInfo);
          
          $scope.imgURI = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile_Check+'/'+ 
          (($scope.userInfo.DtInfo.photoAddress_Check) == null ?'greenadd.jpg':$scope.userInfo.DtInfo.photoAddress_Check);//LRZ1104
          // console.log($scope.imgURI);
           // var objStr=JSON.stringify($scope.userInfo);
           // Storage.set("userInfo",objStr);   
     });
   });


  //填表的预设数据 和需要填写的项目

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
      // alert(birthday);
      // alert($scope.userInfo.BasicInfo.birthday);
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



  // $scope.state = "未提交";
  //填表的预设数据 和需要填写的项目
  // $scope.imgURI = "img/Barot_Bellingham_tn.jpg";
  //the user skip this step put state to unuploaded.
  $scope.onClickSkip = function(){     
      // $scope.state = "未提交";
      // Storage.set(13,$scope.state);
      console.log("broadcasting");
      $rootScope.$broadcast("onClickSkip");
      $state.go('coach.i');
  };

  //the user submit
  $scope.onClickSubmit = function(){
      
      // $scope.state = "审核中";

      $scope.upload($scope.userInfo);
      console.log("broadcasting");
      $rootScope.$broadcast("onClickSubmit");
      $state.go('coach.i');
  };

  //upload
  $scope.upload = function(info){

    Users.postDoctorInfo($scope.userInfo.BasicInfo).then(function(res){
      //console.log(res);
      if(res.result == "数据插入成功"){
        if($scope.userInfo.DtInfo.photoAddress_Check != null)
          Users.postDoctorDtlInfo_Check($scope.userInfo.DtInfo).then(function(res){
          //console.log(res);
            if(res.result == "数据插入成功")
              $state.go('coach.i');
          });
        else
          Users.postDoctorDtlInfo($scope.userInfo.DtInfo).then(function(res){
            //console.log(res);
              if(res.result == "数据插入成功")
                $state.go('coach.i');
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
        PageFunc.confirm("是否上传","确认").then(function(res){
          if(res){
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
           } 
        })
      },2000);
    }, function(err) {
      PageFunc.message("上传失败", 1000, "消息");
    });   
  };
  
  $scope.choosePhotos = function() {
   Camera.getPictureFromPhotos().then(function(data) {
      $timeout(function(){
        PageFunc.confirm("是否上传","确认").then(function(res){
          if(res){
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
           } 
        })
      },2000);
    }, function(err) {
      PageFunc.message("上传失败", 1000, "消息");
    });   
  }

}])


// Coach HomePage/Me Controller 主页的controller 主要负责从home状态跳转到 其他三个状态/读取localstorage的数据
// ----------------------------------------------------------------------------------------
.controller('CoachHomeCtrl', 
  ['$scope','$state','$stateParams','$cordovaBarcodeScanner','Storage','Users','CONFIG','$timeout',
  function($scope,$state,$stateParams,$cordovaBarcodeScanner,Storage,Users,CONFIG,$timeout) { //LRZ
   
   // //console.log($stateParams.info);
   // //console.log($stateParams.info.intro);
   // $scope.items = $stateParams.info;
   // $scope.state = $stateParams.state;

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
     // //console.log( $scope.userInfo.DtInfo.photoAddress);
     // $scope.imgURI = $scope.userInfo.DtInfo.photoAddress;
      if(typeof($scope.userInfo.DtInfo.photoAddress) == 'undefined')
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
}])
// Coach Personal Config Controller 个人设置页面的controller  还没啥用
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
// Coach Personal Infomation Controller 个人信息页面的controller  主要负责 修改数据  上传从localstorage读取个人信息 
// ----------------------------------------------------------------------------------------
.controller('CoachPersonalInfoCtrl', ['$scope','$state','$ionicHistory','Storage','PageFunc','Users','$ionicActionSheet','Camera','CONFIG','$timeout','$rootScope',
  function($scope,$state,$ionicHistory,Storage,PageFunc,Users,$ionicActionSheet,Camera,CONFIG,$timeout,$rootScope) {
   //获得信息
   // $scope.userInfo = JSON.parse(Storage.get("userInfo"));
   // Storage.set('UID','DOC201506180002');

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
     // var temp2 = String($scope.userInfo.BasicInfo.bithday);
     // //console.log($scope.userInfo.BasicInfo.birthday);
     var t = String($scope.userInfo.BasicInfo.birthday);
     //console.log(t);

     $scope.userInfo.BasicInfo.birthdayforshow = t[0] + t[1] + t[2] + t[3]  + '/' + t[4] + t[5] + '/' + t[6] + t[7];
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
       // PageFunc.message(JSON.stringify($scope.userInfo.DtInfo),100000,Storage.get("UID"));
        // //console.log( $scope.userInfo.DtInfo.photoAddress);
        if(typeof($scope.userInfo.DtInfo.photoAddress) == 'undefined')
         $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+'non.jpg';
        else $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ $scope.userInfo.DtInfo.photoAddress;
        // $scope.imgURI = CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+'non.jpg';
        Storage.set('doctorphoto',$scope.imgURI);
           var objStr=JSON.stringify($scope.userInfo);
           Storage.set("userInfo",objStr);
     });
   });

   


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
      alert($scope.userInfo.BasicInfo.birthday);
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
           $state.go('coach.i');
          }
        });
    else{
          $scope.userInfo = JSON.parse(Storage.get("userInfo"));
          $state.go('coach.i'); 
      }  

  };
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
                  Users.postDoctorDtlInfo($scope.userInfo.DtInfo).then(function(res){
                  //console.log(res);
                  if(res.result == "数据插入成功")
                  $rootScope.$broadcast("onClickSubmit");
                  $state.go('coach.i');
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
          PageFunc.confirm("是否上传","确认").then(function(res){
            if(res){
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
             } 
          })
        },2000);
      }, function(err) {
        PageFunc.message("上传失败", 1000, "消息");
      });
  };

  //选择相册
  $scope.choosePhotos = function() {
   Camera.getPictureFromPhotos().then(function(data) {
      $timeout(function(){
        PageFunc.confirm("是否上传","确认").then(function(res){
          if(res){
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
           } 
        })
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
// Coach Personal Schedule Controller 个人日程页面 主要负责 
// ----------------------------------------------------------------------------------------
.controller('CoachScheduleCtrl', ['$scope','$state','$ionicHistory','$http',
  function($scope,$state,$ionicHistory,$http) { //LRZ

  $http.get('js/data.json').success(function(data) {
    $scope.calendar = data.calendar; 
    // $scope.whichartist= $state.params.aId;
    // //console.log($scope.whichartist);
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
.controller('myPatientCtrl', ['$cordovaBarcodeScanner','$ionicPopup','$ionicLoading','$scope', '$state', '$http','$timeout','$interval','Storage' ,'userINFO','PageFunc','CONFIG' ,function($cordovaBarcodeScanner,$ionicPopup,$ionicLoading,$scope, $state, $http,$timeout,$interval,Storage,userINFO,PageFunc,CONFIG){
  var PIDlist=new Array();//PID列表
  var PIDlistLength;//PID列表长度
  var loaditems=0;//已加载条目
  var PatientsList,PatientsList1,PatientsList2,PatientsListOrigin;
  var PatientsBasic=new Array();//输出到页面的json 
  var refreshing=0;//控制连续刷新时序            
  $scope.patients=PatientsBasic;
  $scope.moredata = true;  //控制上拉加载

    //-----------------------------------------------------------------------------//
  var DOCID=Storage.get('UID');
  var rankList = new Array();
  var rankPID = new Array();  
  $scope.rankBy='默认排序';   
  //loading图标显示
  $ionicLoading.show({
    content: '加载中',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.rankPatients=function(){
    var rank;var propertyName;
    rankList[0]=PatientsListOrigin;
    switch($scope.rankBy){
      case '计划进度':rank=1;propertyName='Process';break;
      case '依从率':rank=2;propertyName='ComplianceRate';break;
      default:rank=0;
    }
    if(rankPID[rank]==undefined){
      var compare=function(propertyName) { 
        return function (object1, object2) { 
          var value1 = object1[propertyName]; 
          var value2 = object2[propertyName]; 
          if (value2 < value1) { 
            return -1; 
          } 
          else if (value2 > value1) { 
            return 1; 
          } 
          else { 
            return 0; 
          } 
        } 
      } 
      rankList[rank]=PatientsListOrigin;
      rankList[rank].sort(compare(propertyName));
      var temp=new Array();
      for(var i in rankList[rank]){
        temp.push(rankList[rank][i].PatientId);
        
      }
      rankPID[rank]=temp; 
    }
    PatientsBasic=[];loaditems=0;
    PIDlist=rankPID[rank];
    PatientsList=rankList[rank];
    firstget();
  }
  var onePatientBasic= function(PID){
    userINFO.BasicInfo(PID).then(function(data){
      var str=JSON.stringify(data);
      var str=JSON.parse(str);
      //两个JSON拼数据,把PatientsList中的字段加到PatientsBasic
      if(PatientsList[loaditems].photoAddress=='' || PatientsList[loaditems].photoAddress==null){    
        str.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/' +'non.jpg';
      }else{
        str.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ PatientsList[loaditems].photoAddress;
      }
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
        $timeout(function(){$scope.moredata = false;},2000);
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
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete'); //刷新完成，重新激活刷新
      refreshing=0;
  }
  var netError = function(){
    $ionicLoading.hide();
    refreshing=0;
    PageFunc.confirm('网络好像不太稳定', '网络错误');   
  }
  var getPIDlist = function(){
    userINFO.GetPatientsList(DOCID,'HM1','0','0')
    .then(function(data){
      var datastr=JSON.stringify(data);
      var datastr=JSON.parse(datastr);
      PatientsList1=datastr;
      for(var i in PatientsList1){
        PIDlist.push(PatientsList1[i].PatientId);
      }
      
      userINFO.GetPatientsList(DOCID,'HM2','0','0')
      .then(function(data){
        var datastr=JSON.stringify(data);
        var datastr=JSON.parse(datastr);
        PatientsList2=datastr;
        for(var i in PatientsList2){
          PIDlist.push(PatientsList2[i].PatientId);
        }
        PIDlistLength=PIDlist.length;
        
        rankPID[0]=PIDlist;
        if(PatientsList1!='' && PatientsList2!=''){
          var s1=JSON.stringify(PatientsList1);
          var s2=JSON.stringify(PatientsList2);
          s1=s1.substring(0,s1.length-1);s1=s1.substr(1);
          s2=s2.substring(0,s2.length-1);s2=s2.substr(1);          
          PatientsList=JSON.parse('['+s1 + ',' + s2+ ']');
        }else{
          if(PatientsList1!=''){
            PatientsList=PatientsList1;
          }else if(PatientsList2!=''){
            PatientsList=PatientsList2;
          }else{
            PatientsList=[];
          }
        }
        PatientsListOrigin=PatientsList;
        firstget();         
      },function(data){
        netError();
      })
    },function(data){
      netError();
    });
  }
  //获取PIDlist并加载10条
  getPIDlist();

  $scope.PIDdetail = function(Patient){
    Storage.set("PatientID",Patient.UserId);
    Storage.set("isManage","Yes");
    Storage.set("PatientName",Patient.UserName);
    Storage.set('PatientAge',Patient.Age);
    Storage.set('PatientGender',Patient.GenderText);     
    Storage.set("PatientPhotoAddress",Patient.photoAddress);
    $state.go('manage.plan');
  }

  $scope.doRefresh =function() {
    if(refreshing==0){
      refreshing=1;$scope.rankBy='默认排序';
      PatientsBasic=[];PIDlist=[];
      loaditems=0;PIDlistLength=0;
      getPIDlist();
    }
  }
  $scope.loadMore = function(){
    if(PIDlistLength==loaditems && PIDlistLength!=0){
      $scope.moredata=true;
    } 
    if((PIDlistLength-loaditems)>10){
      getPatientsBasic(PIDlist.slice(loaditems,loaditems+10));
    }else if(loaditems>=10){
      getPatientsBasic(PIDlist.slice(loaditems));
    }  
   $scope.$broadcast('scroll.infiniteScrollComplete');
  }  
  $scope.setwidth=function(patient){
    var divwidth=patient.Age + '%';
    return {width:divwidth}; 
  };
    //扫一扫，具体跳转再改
  $scope.QRscan = function(){
    var isMyPID=0;
    $cordovaBarcodeScanner
    .scan()
    .then(function(data) {
      // Success! Barcode data is here
      // var s = "Result: " + data.text + "<br/>" +
      // "Format: " + data.format + "<br/>" +
      // "Cancelled: " + data.cancelled;
      for(var i in PIDlist){
        if(data.text==PIDlist[i]){
          isMyPID=1;
          Storage.set("PatientID",data.text);
          for(var i in PatientsBasic){
            if(PatientsBasic[i].PatientID == data.text){
              Storage.set("PatientName",PatientsBasic[i].UserName);
              Storage.set('PatientAge',PatientsBasic[i].Age);
              Storage.set('PatientGender',PatientsBasic[i].GenderText);     
              Storage.set("PatientPhotoAddress",PatientsBasic[i].photoAddress); 
              break;             
            }
          }
          $state.go('manage.plan');
          break; 
        }
      }
      if(isMyPID==0){
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
                Storage.set("newPatientID",data.text);
                $state.go('addpatient.basicinfo');
              }
            }
          ]
        });
      }
    }, function(error) {      
    });
  }         
}])
.controller('newpatientsCtrl', ['$scope', '$state','$ionicLoading', '$http', '$interval','$timeout' ,'userINFO','PageFunc','Storage','CONFIG' ,function($scope, $state,$ionicLoading, $http, $interval,$timeout,userINFO,PageFunc,Storage,CONFIG){
  var PIDlist=new Array();
  var PIDlistLength;
  var loaditems=0;
  var PatientsList;
  var PatientsBasic=new Array(); 
  var refreshing=0;//控制连续刷新时序   
  var DOCID=Storage.get('UID');          
  $scope.patients=PatientsBasic;
  $scope.moredata = true;
  $ionicLoading.show({
    content: '加载中',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });
  var onePatientBasic= function(PID){     
    userINFO.BasicInfo(PID).then(function(data){
      var str=JSON.stringify(data);
      var str=JSON.parse(str);
      if(PatientsList[loaditems].photoAddress=='' || PatientsList[loaditems].photoAddress==null){    
        str.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/' +'non.jpg';
      }else{
        str.photoAddress =CONFIG.ImageAddressIP+CONFIG.ImageAddressFile+'/'+ PatientsList[loaditems].photoAddress;
      }
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
        $timeout(function(){$scope.moredata = false;},2000);
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
      $ionicLoading.hide();     
      $scope.$broadcast('scroll.refreshComplete'); //刷新完成，重新激活刷新
      refreshing=0;
  }
  var netError = function(){
       $ionicLoading.hide();
      PageFunc.confirm('网络好像不太稳定', '网络错误');   
  }
  var getPIDlist = function(){
    userINFO.GetPatientsList(DOCID,'M1','0','0')
    .then(function(data){
      var datastr=JSON.stringify(data);
      var datastr=JSON.parse(datastr);
      PatientsList=datastr;       
      for(var i in PatientsList){
        PIDlist.push(PatientsList[i].PatientId);
      }
      PIDlistLength=PIDlist.length; 
      firstget();
    },function(data){
      netError();
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
    if(PIDlistLength==loaditems && PIDlistLength!=0){
      $scope.moredata=true;
    } 
    if((PIDlistLength-loaditems)>10){
      getPatientsBasic(PIDlist.slice(loaditems,loaditems+10));
    }else if(loaditems>=10){
      getPatientsBasic(PIDlist.slice(loaditems));
    }
   
   $scope.$broadcast('scroll.infiniteScrollComplete');
  } 
  $scope.onItemDelete = function(index) {
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

//GL 20151103 交流
.controller('ChatDetailCtrl' ,function($scope, $http,$state, $stateParams, $resource, MessageInfo, $ionicScrollDelegate, CONFIG, Storage,GetBasicInfo,Data) 
{ 

    // $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
    //   var promise=GetBasicInfo.GetBasicInfoByPid(Storage.get('PatientID'));
    //     promise.then(function(data){
    //       $scope.clinicinfo=data;
    //       //console.log($scope.clinicinfo)
    //       $scope.Name=data.UserName;
    //       $scope.age=data.Age;
    //       $scope.gender=data.GenderText;
    //     }, function(data) {
    //     })
    //    });
  
  
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
      $state.go('coach.home');
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
          
        //告诉服务器由用户登陆
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
                    $scope.Dialog.DisplayOnes.push({"IDFlag": "Send","SendDateTime": data.Time,"Content":$scope.Dialog.SMScontent});
                    $ionicScrollDelegate.scrollBottom(true);
                    $scope.SocketSubmit(Receiver +  "||" + SendBy + "||" + data.Time + "||" + $scope.Dialog.SMScontent);
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

.controller('ModuleInfoCtrl',['$scope','$state','$http', '$ionicHistory', '$stateParams', 'Storage','GetBasicInfo', function($scope,$state,$http, $ionicHistory, $stateParams, Storage,GetBasicInfo) {
  
  $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
    $scope.Name=Storage.get('PatientName');
    $scope.age=Storage.get('PatientAge');
    $scope.gender=Storage.get('PatientGender');
       // var promise=GetBasicInfo.GetBasicInfoByPid(Storage.get('PatientID'));
       //  promise.then(function(data){
       //    $scope.clinicinfo=data;
       //    //console.log($scope.clinicinfo)
       //    $scope.Name=data.UserName;
       //    $scope.age=data.Age;
       //    $scope.gender=data.GenderText;
       //  }, function(data) {
       //  })
       });
  //进入页面获取患者的基本信息
  
  $scope.backtocoach=function(){
    $state.go('coach.home');
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

  GetBasicInfo.getiHealthCoachList(PatientId).then(function(data,status){
    for (var i=0;i<data.length;i++)
    {
      if (data[i].moduleCode != "")
      {
        Storage.set(data[i].moduleCode,'Yes');
      }
    }
  },function(data,status){
    $scope.getStatus = status;
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
  var PatientID = Storage.get('PatientID');
  var Module = $stateParams.Module;
  var HModule = "H" + Module;
  $scope.getStatus = "";
  $scope.test = {"test":{"Type":"1","Name":"是"}};

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
            $scope.DiabetesDrugArray[a].Type = $scope.DiabetesDrugArray[b-1].Type;
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
          for (var m = 0; m < a; m++)
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
          for (var n = 0; n < b; n++)
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

.controller('newpatientCtrl',['$scope','$state','Storage','Users','Dict','$ionicLoading',function($scope,$state,Storage,Users,Dict,$ionicLoading){

  
  
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
        });     
    }
  }

}])
.controller('newbasicinfoCtrl',['$scope','$state','Storage','Users','Dict','$ionicPopup','$timeout','$ionicScrollDelegate','$ionicLoading','userservice','GetBasicInfo','BasicDtlInfo',function($scope,$state,Storage,Users,Dict,$ionicPopup,$timeout,$ionicScrollDelegate,$ionicLoading,userservice,GetBasicInfo,BasicDtlInfo){
  $scope.scrollBottom = function() {
      $ionicScrollDelegate.scrollBottom(true);
    };
  $scope.scrollTop = function() {
      $ionicScrollDelegate.scrollTop(true);
    };

    

  $scope.PhoneNo=Storage.get('phoneno');
  var DoctorId = Storage.get('UID');

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
    "DoctorId": DoctorId,
    "InsuranceType": "",
    "InvalidFlag": 0,
    "piUserId": "lzn",
    "piTerminalName": "sample string 11",
    "piTerminalIP": "sample string 12",
    "piDeviceType": 13
    };
    

    
    

    

  $scope.users.UserId=Storage.get('newPatientID');
  
  if($scope.users.UserId!=null && $scope.PhoneNo==null){
    Users.PhoneNo($scope.users.UserId).then(
      function(data){
        console.log(data);
        $scope.PhoneNo=data;
      },function(e){
          console.log(e);
      });
  }

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
                    for(var i=0;i<24;i++){
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
                          $scope.users.DoctorId=DoctorId;
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
                      $state.go('addpatient.clinicinfo');
                    },function(e){
                      
                      console.log(e);
                      hide();
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
                            hide();
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
            hide();
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
                            hide();
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
                hide();
              });
          }
        },function(e){
            console.log()
            console.log(e);
            hide();
        });
          
    }
    Storage.set('PatientID',$scope.users.UserId);
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


//调查问卷的controller state riskquestions;//LRZ 20151104 几个bug修复
.controller('RiskQuestionCtrl',['$scope','$state','$rootScope','Patients','Storage',function($scope,$state,$rootScope,Patients,Storage){
 
  $scope.userid = Storage.get('PatientID');
  // $scope.userid = "PID201506170002";
  // console.log($scope.userid);
  // console.log($scope.SBP);
  $scope.value = {SBP:undefined,DBP:undefined,glucose:undefined,period:undefined};

  $scope.clickCancel = function(){
    $state.go('addpatient.risk');
  };
  $scope.clickCancel1 = function(){
    $state.go('Independent.risk');
  };
  // console.log($scope.SBP);
  $scope.clickSubmit = function(){
    //upload 
    // $rootScope.$broadcast("NewEvaluationSubmit");
    Patients.getMaxSortNo($scope.userid).then(function(data){
      var maxsortno = data.result; 
      // console.log("赫赫");
      console.log(data);
   
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
          Patients.postTreatmentIndicators(temp).then(function(res){
            if(res.result == "数据插入成功"){
              console.log("broadcasting h");
              $rootScope.$broadcast("NewEvaluationSubmit");
            }
          });
          // console.log(tt);
        }

        var t1;
        if($scope.value.glucose<6.1) t1 = "正常血糖.";
        else if($scope.value.glucose<7.0) t1 = "糖尿病前期.";
        else  t1 = "糖尿病.";
        var temp =  {
          "UserId": $scope.userid,
          "SortNo": parseInt(maxsortno)+1,
          "AssessmentType": "M2",
          "AssessmentName": "糖尿病",
          "AssessmentTime": time2,
          "Result": t1 + "||"+ $scope.value.period + "||" + String($scope.value.glucose)+ "||",
          "revUserId": "sample string 7",
          "TerminalName": "sample string 8",
          "TerminalIP": "sample string 9",
          "DeviceType": 10
        };
        // console.log(temp.Result);
        if(typeof($scope.value.period) != 'undefined' && typeof($scope.value.glucose) != 'undefined'){
          // console.log("上传血糖数据");
          Patients.postTreatmentIndicators(temp).then(function(res){
            if(res.result == "数据插入成功"){
              console.log("broadcasting d");
              $rootScope.$broadcast("NewEvaluationSubmit");
            }
          });
        }
        //POST RESULT
        // console.log($scope.description);
        //
        //全局广播更新
        // console.log("broadcasting");
        // $rootScope.$broadcast("NewEvaluationSubmit");
      })
    // console.log($scope.description);
    })
    // console.log($scope.description);
    // Patients.
    if (Storage.get('isManage') == "Yes")
    {
      $state.go('Independent.risk');
    }
    else
    {
      $state.go('addpatient.risk');
    }
  }

}])

//GL 20151101 创建计划
.controller('CreateCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', 'Dict', '$ionicPopup', 'Storage', '$ionicHistory', function($scope, $http, $state, $stateParams, PlanInfo, Dict, $ionicPopup, Storage, $ionicHistory){ 
    $scope.create = {};
    $scope.create.EndDate;
    $scope.create.PlanList = new Array();
    $scope.create.AddFlag = true; //只允许当前有一个正在执行的计划

    $scope.$watch('$viewContentLoaded', function() { 
        GetPlanList();
    }); 
    $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
      $scope.Name=Storage.get('PatientName');
      $scope.age=Storage.get('PatientAge');
      $scope.gender=Storage.get('PatientGender');
    }, function(data) {
    });
    $scope.onClickBackward = function(){
      $state.go('coach.home');
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
                    if (data[i].StartDate != "")
                    {
                        data[i].StartDate = data[i].StartDate.substr(0, 4) + '/' + data[i].StartDate.substr(4, 2) + '/' + data[i].StartDate.substr(6, 2)
                    }
                    if(data[i].EndDate != "")
                    {
                        data[i].EndDate = data[i].EndDate.substr(0, 4) + '/' + data[i].EndDate.substr(4, 2) + '/' + data[i].EndDate.substr(6, 2)
                    }

                    $scope.create.PlanList.push(data[i]);
                }
                if(($scope.create.AddFlag) && (data[i].Status =="3"))
                {
                    $scope.create.AddFlag = false;
                }
            } 
            ////console.log($scope.create.PlanList);                      
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
                $scope.create.PlanList.push({PlanName:"当前计划", PlanNo:PlanNo, StartDate:StartDate[1], EndDate: EndDate[1]});
                $scope.create.AddFlag = false;
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
.controller('TaskListCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', '$ionicPopup', '$ionicHistory','Storage', function($scope, $http, $state, $stateParams, PlanInfo, $ionicPopup, $ionicHistory,Storage){
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

    $scope.$on('$ionicView.enter', function() {
        $scope.GetTasks(); 
    });

    $scope.onClickBackward = function(){
      $ionicHistory.goBack();
    };

    $scope.GetTasks = function ()
    {
        var promise = PlanInfo.GetTasks(PlanNo, "T");  
        promise.then(function(data) {          
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
    
}])

//GL 20151101
.controller('MainPlanCtrl',['$scope', '$http', '$state', '$stateParams', 'PlanInfo', '$ionicPopup', '$ionicHistory', 'Storage',function($scope, $http, $state, $stateParams, PlanInfo, $ionicPopup, $ionicHistory,Storage){
    var Type = $stateParams.tt;
    //console.log(Type);
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

    // //药物治疗
    // $scope.task.DrugName;
    // $scope.task.DrugDose;
    // $scope.task.DrugFreq;
    // $scope.task.DrugWay;
    // $scope.task.DrugTime;
    // $scope.task.Module

    //体征测量
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
            //console.log($scope.task.list);
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
                              if (localStorage.getItem("isManage") == "Yes")
                              {
                                window.location.href = "#/manage/taskList";
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
                        if (localStorage.getItem("isManage") == "Yes")
                              {
                                window.location.href = "#/manage/taskList";
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

    //返回   
    $scope.onClickBackward = function(){
        $ionicHistory.goBack();
    }
}])

//GL 20151101 健康教育
.controller('healthEducationCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo', '$ionicHistory', 'Storage',function($scope, $http, $state, $stateParams, PlanInfo, $ionicHistory,Storage){ 
    var PlanNo = localStorage.getItem("CurrentPlanNo");  
    $scope.task = {};
    $scope.task.list;
    $scope.$on('$ionicView.enter', function() { 
        GettaskList();      
    });

    $scope.$on('$ionicView.enter', function() { 
        $scope.Confirm();   
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
        }, function(data) {  
        });   
    }

    //点击时选择类别
    $scope.SelectType = function (Code)
    {
        localStorage.setItem("healthEducationCode", Code);
        ////console.log(localStorage.getItem("healthEducationCode"));
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
                  // {
                  //   if (localStorage.getItem("isManage") == "No")
                  //   {
                  //     window.location.href = "#/addpatient/taskList";  
                  //   }
                  //   else
                  //   {
                  //     window.location.href = "#/manage/taskList"; 
                  //   }    
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
            var promise1 = PlanInfo.DeleteTask(tempData);
            promise1.then(function(data) 
            {
                if ((data.result == "数据删除成功") || (data.result == "数据未找到"))
                {
                    // if (localStorage.getItem("isManage") == "No")
                    // {
                    //   window.location.href = "#/addpatient/taskList";  
                    // }
                    // else
                    // {
                    //   window.location.href = "#/manage/taskList"; 
                    // } 
                }
            },function(data){

            });  
        }        
    }

    //返回  
    $scope.onClickBackward = function(){
        //$ionicHistory.goBack();
        if (localStorage.getItem("isManage") == "Yes")
        {
          window.location.href = "#/manage/taskList";  
        }
        else
        {
          window.location.href = "#/addpatient/taskList"; 
        }    
    }
}])

//GL 20151101
.controller('healthEducationDetailCtrl', ['$scope', '$http', '$state', '$stateParams', 'PlanInfo','$ionicHistory',  function($scope, $http, $state, $stateParams, PlanInfo, $ionicHistory){
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
            ////console.log($scope.task.list);
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
            if (($scope.task.list[i].ControlType) && (!arry[i])) //插入数据
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
                              if (localStorage.getItem("isManage") == "Yes")
                              {
                                window.location.href = "#/manage/TD";
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
                         if (localStorage.getItem("isManage") == "Yes")
                          {
                            window.location.href = "#/manage/TD";
                          }
                          else
                          {
                            window.location.href = "#/addpatient/TD";
                          }
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
                        if (localStorage.getItem("isManage") == "Yes")
                        {
                          window.location.href = "#/manage/TD";
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
                 if (localStorage.getItem("isManage") == "Yes")
                  {
                    window.location.href = "#/manage/TD";
                  }
                  else
                  {
                    window.location.href = "#/addpatient/TD";
                  }
            }     
        }
    }
 
    //返回   
    $scope.onClickBackward = function(){
        $ionicHistory.goBack();
    }
}])

//GL 20151101 药物治疗
.controller('DrugCtrl',['$scope', '$http', '$state', '$stateParams', '$ionicPopup', 'Users', 'PlanInfo', '$ionicHistory', function($scope, $http, $state, $stateParams, $ionicPopup, Users, PlanInfo, $ionicHistory){
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
                    $scope.task.DeleteList.push({"PlanNo":PlanNo, "Type":Type, "Code":Type + "0001", "SortNo":(i+1).toString()});
                }
            }                      
            $scope.task.list = data;
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
            ////console.log($scope.task.DrugList);
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
                    for (var i=1; i<5; i++)
                    {
                        if (!res[i])
                        {
                            res[i] = "";
                        }
                    }
                    $scope.task.list.push({"Description":res[0], "Instruction":res[0] + ":" + res[1]+ "|" + res[2] + "|" + res[3] + "|" + res[4]});
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
                for (var i=1; i<5; i++)
                {
                    if (!res[i])
                    {
                        res[i] = "";
                    }
                }
                for (var i=0; i<$scope.task.list.length; i++)
                {
                    if($scope.task.list[i].Description === obj.Description)
                    {
                        $scope.task.list[i].Instruction = res[0] + ":" + res[1]+ "|" + res[2]+ "|" + res[3]+ "|" + res[4];
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
            if($scope.task.list.length = 0)
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
        var promise = PlanInfo.SetTask(obj);
        promise.then(function(data)
        {
            if (data.result == "数据插入成功")
            {
                ////console.log("数据插入成功");
                $ionicHistory.goBack();
            }
        },function(data){              
        });   
    }

    function DeleteTask(obj)
    {
        var promise = PlanInfo.DeleteTask(obj);
        promise.then(function(data) 
        {
            if (data.result == "数据删除成功")
            {
                $ionicHistory.goBack();
            }
        },function(data){
        });   
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
.controller('datepickerCtrl',function($scope,$state,$http,$ionicModal,$ionicHistory,Storage,GetClinicInfoDetail,GetClinicalList,
  GetHZID,Getexaminfo,Getdiaginfo,Getdruginfo,GetBasicInfo,PageFunc) {

  
 $scope.synclinicinfo=function(){//同步动作
  $http({
    method:'GET',
    url:'http://10.12.43.56:57772/csp/hz_mb/Bs.WebService.cls?soap_method=GetPatient',
    params:{
      'UserId':Storage.get("PatientID"),
      'PatientId':$scope.HJZYYID,
      'StartDateTime': $scope.tt,
      'HospitalCode':'HJZYY'
    },
    timeout: 30000,
      // }).success(function(data,header,config,status){
      }).success(function(data,header){
        var status=data.slice(data.search('Status'),data.search('/Status'));
        console.log(data.slice(data.search('Status'),data.search('/Status')));
        var wetherhaveerr1=data.match("Error");//查看是否包含error，有则认定同步不成功
        var wetherhaveerr2=data.match("error");

        var noArr=status.match(/\d+/g);
        // console.log(noArr);
        //根据status内的内容判断是否同步成功，输出不同弹框
       if (wetherhaveerr1==null&&wetherhaveerr2==null) {
                if (!(noArr[1]==0&&noArr[3]==0&&noArr[5]==0&&noArr[7]==0&&noArr[9]==0&&noArr[11]==0)) {
                  var sysResult="诊断："+noArr[1]+"条"+"、"+"检查："+noArr[3]+"条"+"、"+"化验："+noArr[5]+"条"+"、"+"用药："+noArr[7]+"条"+"、"+"手术："+noArr[9]+"条"+"、"+"体征："+noArr[11]+"条";
                PageFunc.message(sysResult,20000,"同步成功");
                //同步成功 刷新页面
                  GetClinicalList.GetClinicalInfoListbyUID({UserId:Storage.get("PatientID")}).then(function(data){
                      $scope.cliniclist=data.DT_InPatientInfo;

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
                        var promise1=Getexaminfo.Getexaminfobypiduid({UserId:Storage.get("PatientID"),VisitId:$scope.cliniclist[index].VisitId});
                        promise1.then(function(data1){
                          $scope.Examinationinfo=data1;
                          $scope.Examinationinfo.length==0?$scope.show=true:$scope.show=false;
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
                      $ionicModal.fromTemplateUrl('partials/addpatient/DiagnosisInfo.html', {
                        scope: $scope,
                        animation: 'slide-in-up'
                      }).then(function(modal) {
                        $scope.modaldiag = modal;
                      });

                      $scope.opendiaginfomodal = function(index) {
                        $scope.modaldiag.show();
                        var promise0=Getdiaginfo.Getdiaginfobypiduid({UserId:Storage.get("PatientID"),VisitId:$scope.cliniclist[index].VisitId});
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

                      $scope.opendruginfomodal = function(index) {
                        $scope.modaldrug.show();
                          // var d={UserId:$scope.SyncInfo.patientid,Type:'DrugRecord',VisitId:$scope.clinicinfo[index].VisitId, Date:$scope.tt};
                          var promise1=Getdruginfo.Getdruginfobypiduid({UserId:Storage.get("PatientID"),VisitId:$scope.cliniclist[index].VisitId});
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
                  }, function(data) {
                  });
                }else if ($scope.HJZYYID!=""){
                  PageFunc.message("可能原因：就诊ID错误或者时间设置过短",20000,"同步失败");
                };
              }else{
                PageFunc.message("系统错误",20000,"同步失败");
              };
        
      //响应成功

    }).error(function(data,header){
      //处理响应失败
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
      $scope.HJZYYID=data.result;
      // console.log($scope.HJZYYID);
    });


  //根据userid获取就诊信息列表（展示时用）
  var promise2=GetClinicalList.GetClinicalInfoListbyUID({UserId:PatientID});
  promise2.then(function(data){
      $scope.cliniclist=data.DT_InPatientInfo;

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
  }, function(data) {
  });



  //datepicker函数
  var d=new Date();
  var month=(d.getMonth()+1);
  var day=d.getDate();
  if(month<10){
    month='0'+(d.getMonth()+1);
  };
  if (day<10) {
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
        from: new Date(1880, 8, 2),   //Optional
        to: new Date(2018, 8, 25),    //Optional
        callback: function (val) {    //Mandatory
          datePickerCallback(val);
        }
      };
      var datePickerCallback = function (val) {
        if (typeof(val) === 'undefined') {
          //console.log('No date selected');
        } else {
          var truemonth=(val.getMonth()+1);
          var trueday=val.getDate();
          if(truemonth<10){
            truemonth='0'+(val.getMonth()+1);
          };
          if (trueday<10) {
            trueday='0'+val.getDate();
          };
      $scope.tt=val.getFullYear()+'-'+truemonth+'-'+trueday;
    }
  };

  $scope.backtocoach=function(){
    $state.go('coach.home');
  }
  $scope.NextPage = function(){
    $state.go('addpatient.ModuleInfo');
  };

 
})

//抽象页面上用户信息的控制器 ZXF 20151102
.controller('mainCtrl',function($scope, $state,$http, Storage,GetBasicInfo){
  // var promise=GetBasicInfo.GetBasicInfoByPid(Storage.get('PatientID'));
  // promise.then(function(data){
  //   $scope.clinicinfo=data;
  //   //console.log($scope.clinicinfo)
  //   $scope.Name=data.UserName;
  //   $scope.age=data.Age;
  //   $scope.gender=data.GenderText;
  // }, function(data) {
  // })
  // $scope.backtocoach=function(){
  //   $state.go('coach.home');
  // }
})

// 依从率图的控制器amcharts部分 ZXF 20151102
.controller('planCtrl',function($scope, $state,$http, Storage,GetBasicInfo,GetPlanInfo,GetPlanchartInfo) {
  $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
    $scope.Name=Storage.get('PatientName');
    $scope.age=Storage.get('PatientAge');
    $scope.gender=Storage.get('PatientGender');
    var promise=GetBasicInfo.GetBasicInfoByPid(Storage.get('PatientID'));
    promise.then(function(data){
      $scope.clinicinfo=data;
      // $scope.Name=data.UserName;
      // $scope.age=data.Age;
      // $scope.gender=data.GenderText;    
    }, function(data) {
    })
  var PatintId = Storage.get('PatientID');

// var PatintId ="PID201506180013";
console.log(PatintId);
//进入页面，调用函数获取任务列表（当前、往期计划）
var promiseS1=GetPlanInfo.GetplaninfobyPlanNo({PatientId:PatintId,PlanNo:'NULL',Module:'M1',Status:'3'});
promiseS1.then(function(data1){
  //console.log(data1);
  //在调用同一函数，status=4，调取往期计划planno
  GetPlanInfo.GetplaninfobyPlanNo({PatientId:PatintId,PlanNo:'NULL',Module:'M1',Status:'4'}).then(
    function(s){
      $scope.formerPlanInfo=s;
      Storage.set("formerplan",angular.toJson($scope.formerPlanInfo));
      //console.log($scope.formerPlanInfo);
    }, function(e) {  
    });

  if (data1.length==0) {
  $scope.latestplan="无执行中的计划";
  $scope.diaplaysm=true;
}else{
//页面载入时显示的当前计划，收缩压的图
Storage.set("latestplanstartdate",data1[0].StartDate);
Storage.set("latestplanenddate",data1[0].EndDate);
Storage.set("latestplanno",data1[0].PlanNo);
$scope.latestPlanInfo=data1;
$scope.latestplan=data1[0].PlanNo;
//console.log($scope.latestplan);

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
    //console.log($scope.HPchartdate);
      //调用绘图的方法 传参
      createStockChart($scope.HPchartdate,"收缩压","mmHg");
      $scope.HPchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
    }, function(data) {
      /////
    });
  //点击切换各个体征的图
  $scope.changeVitalInfo = function(option) {
    // console.log(option);
    Storage.set("selectedvitaltype",option.SignName);
    // console.log(Storage.get("selectedvitaltype"));

 //传参调函画图
drawcharts(option.SignName,PatintId,data1[0].PlanNo,data1[0].StartDate,data1[0].EndDate)


  };
};

}, function(e) {
    ///// 
  }
  );

// $scope.planList={"pl":""};
$scope.changeplan= function(changedplan){
 $scope.planno=changedplan;

 $scope.localselectedname=Storage.get("selectedvitaltype");

$scope.plan=angular.fromJson(Storage.get("formerplan"));


if (changedplan==Storage.get("latestplanno")) {
  $scope.startdate=Storage.get("latestplanstartdate");
  $scope.enddate=Storage.get("latestplanenddate");
}else{
  for (var i = 0; i <= $scope.plan.length-1; i++) {
    //console.log($scope.plan[i].PlanName);
    if ($scope.plan[i].PlanNo==changedplan) {
     $scope.startdate= $scope.plan[i].StartDate;
     $scope.enddate=$scope.plan[i].EndDate;
   };
 };
};

drawcharts($scope.localselectedname,PatintId,$scope.planno,$scope.startdate,$scope.enddate)


$scope.changeVitalInfo = function(option) {
   Storage.set("selectedvitaltype",option.SignName);
   $scope.selectedname=option.SignName;
 //传参调函画图
drawcharts($scope.selectedname,PatintId,$scope.planno,$scope.startdate,$scope.enddate)

};
};
//提振参数选择下拉框选项 默认收缩压selected

});  

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
console.log($scope.options[0]);
console.log($scope.vitalInfo);
  //切换体征选项后，重新绘制
var drawcharts=function(param,PatientId,plannumber,Sdate,Edate){
  if (param=="舒张压") {
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'Bloodpressure',ItemCode:'Bloodpressure_2'}).then(
      function(data){
        $scope.LPchartdate=data;
        createStockChart($scope.LPchartdate,"舒张压","mmHg");
        $scope.LPchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
    });
  };
  if (param=="收缩压") {
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'Bloodpressure',ItemCode:'Bloodpressure_1'}).then(
      function(data){
        $scope.HPchartdate=data;
        createStockChart($scope.HPchartdate,"收缩压","mmHg");
        $scope.HPchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
      /////
    });
  };
  if (param=="脉率") {
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'Pulserate',ItemCode:'Pulserate_1'}).then(
      function(data){
        $scope.HBchartdate=data;
        createStockChart($scope.HBchartdate,"脉率","次/分钟");
        $scope.HBchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
    });
  };
  if(param=="凌晨血糖"){
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_2'}).then(
      function(data){
        $scope.BSchartdate=data;
        createStockChart($scope.BSchartdate,"凌晨血糖","nmol/L");
        $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
    });
  };
  if(param=="睡前血糖"){
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_3'}).then(
      function(data){
        $scope.BSchartdate=data;
        createStockChart($scope.BSchartdate,"睡前血糖","nmol/L");
        $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
    });
  }
  if(param=="早餐前血糖"){
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_4'}).then(
      function(data){
        $scope.BSchartdate=data;
        createStockChart($scope.BSchartdate,"早餐前血糖","nmol/L");
        $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
    });
  };
  if(param=="早餐后血糖"){
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_5'}).then(
      function(data){
        $scope.BSchartdate=data;
        createStockChart($scope.BSchartdate,"早餐后血糖","nmol/L");
        $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
    });
  };
  if(param=="午餐前血糖"){
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_6'}).then(
      function(data){
        $scope.BSchartdate=data;
        createStockChart($scope.BSchartdate,"午餐前血糖","nmol/L");
        $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
    });
  };
  if(param=="午餐后血糖"){
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_7'}).then(
      function(data){
        $scope.BSchartdate=data;
        createStockChart($scope.BSchartdate,"午餐后血糖","nmol/L");
        $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
    });
  };
  if(param=="晚餐前血糖"){
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_8'}).then(
      function(data){
        $scope.BSchartdate=data;
        createStockChart($scope.BSchartdate,"晚餐前血糖","nmol/L");
        $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
    });
  };
  if(param=="晚餐后血糖"){
    GetPlanchartInfo.GetchartInfobyPlanNo({UserId:PatientId,PlanNo:plannumber,StartDate:Sdate,EndDate:Edate,ItemType:'BloodSugar',ItemCode:'BloodSugar_9'}).then(
      function(data){
        $scope.BSchartdate=data;
        createStockChart($scope.BSchartdate,"晚餐后血糖","nmol/L");
        $scope.BSchartdate.length==0?$scope.diaplaysm=true:$scope.diaplaysm=false;
      }, function(data) {
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
  }
  $scope.backtocoach=function(){
    $state.go('coach.home');
  }

})

//ZXF 20151102 体征列表
 .controller('vitaltableCtrl', function($scope,$state,$cordovaDatePicker,Storage,GetVitalSigns,GetBasicInfo) {

      $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
            var promise=GetBasicInfo.GetBasicInfoByPid(Storage.get('PatientID'));
              promise.then(function(data){
                $scope.clinicinfo=data;
                //console.log($scope.clinicinfo)
                $scope.Name=data.UserName;
                $scope.age=data.Age;
                $scope.gender=data.GenderText;
              }, function(data) {
              })
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
      //console.log($scope.selectedstartdate);
     $scope.selecrtedenddate=date=year+'-'+month+'-'+day;
     //console.log($scope.selecrtedenddate);
     $scope.StartDateforuse =parseInt(yestodayyear+''+yestodaymonth+''+yestoday);
     //console.log($scope.StartDateforuse);
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
              // //console.log(val.getMonth());
              chooenmonth='0'+''+(val.getMonth()+1);
            };
            if (val.getDate()<10) {
               chooenday='0'+''+val.getDate();
            };



            var date=val.getFullYear()+'-'+chooenmonth+'-'+chooenday;    
            // //console.log(date);         
            var dateuser=parseInt(val.getFullYear()+''+chooenmonth+''+chooenday);
             //console.log(dateuser);
           if(setstate==0){
            $scope.selectedstartdate=date;
           //console.log($scope.selectedstartdate);
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
