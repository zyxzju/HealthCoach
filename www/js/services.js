angular.module('ionicApp.service', ['ionic','ngResource','ngCordova'])

//localStorage调用 XJZ
.factory('Storage', ['$window', function ($window) { 
	return {
    set: function(key, value) {
    	$window.localStorage.setItem(key, value);
    },
    get: function(key) {
    	return $window.localStorage.getItem(key);
    },
    rm: function(key) {
    	$window.localStorage.removeItem(key);
    },
    clear: function() {
    	$window.localStorage.clear();
    }
	};
}])

.constant('CONFIG', {
 
  baseUrl: 'http://121.43.107.106:9000/Api/v1/',  //RESTful 服务器  121.43.107.106:9000
  ImageAddressIP: "http://121.43.107.106:8088",
  ImageAddressFile : "/PersonalPhoto",
  ImageAddressFile_Check : "/PersonalPhotoCheck",  //lrz20151104
  wsServerIP : "ws://" + "121.43.107.106" + ":4141",
  // ImageAddress = ImageAddressIP + ImageAddressFile + "/" + DoctorId + ".jpg";
  consReceiptUploadPath: 'cons/receiptUpload',
  userResUploadPath: 'user/resUpload',

  cameraOptions: {  // 用new的方式创建对象? 可以避免引用同一个内存地址, 可以修改新的对象而不会影响这里的值: 用angular.copy
    quality: 75,
    destinationType: 0,  // Camera.DestinationType = {DATA_URL: 0, FILE_URI: 1, NATIVE_URI: 2};
    sourceType: 0,  // Camera.PictureSourceType = {PHOTOLIBRARY: 0, CAMERA: 1, SAVEDPHOTOALBUM: 2};
    allowEdit: true,  // 会导致照片被正方形框crop, 变成正方形的照片
    encodingType: 0,  // Camera.EncodingType = {JPEG: 0, PNG: 1};
    targetWidth: 100,  // 单位是pix/px, 必须和下面的属性一起出现, 不会改变原图比例?
    targetHeight: 100,
    // mediaType: 0,  // 可选媒体类型: Camera.MediaType = {PICTURE: 0, VIDEO: 1, ALLMEDIA: 2};
    // correctOrientation: true,
    saveToPhotoAlbum: false,
    popoverOptions: { 
      x: 0,
      y:  32,
      width : 320,
      height : 480,
      arrowDir : 15  // Camera.PopoverArrowDirection = {ARROW_UP: 1, ARROW_DOWN: 2, ARROW_LEFT: 4, ARROW_RIGHT: 8, ARROW_ANY: 15};
    },
    cameraDirection: 0  // 默认为前/后摄像头: Camera.Direction = {BACK : 0, FRONT : 1};
  },

  uploadOptions: {
    // fileKey: '',  // The name of the form element. Defaults to file. (DOMString)
    // fileName: '.jpg',  // 后缀名, 在具体controller中会加上文件名; 这里不能用fileName, 否则将CONFIG.uploadOptions赋值给任何变量(引用赋值)后, 如果对该变量的同名属性fileName的修改都会修改CONFIG.uploadOptions.fileName
    fileExt: '.jpg',  // 后缀名, 在具体controller中会加上文件名
    httpMethod: 'POST',  // 'PUT'
    mimeType: 'image/jpg',  // 'image/png'
    //params: {_id: $stateParams.consId},
    // chunkedMode: true,
    //headers: {Authorization: 'Bearer ' + Storage.get('token')}
  }
  /* List all the roles you wish to use in the app
  * You have a max of 31 before the bit shift pushes the accompanying integer out of
  * the memory footprint for an integer
  */
})


.factory('Data', ['$resource', '$q','$interval' ,'CONFIG','Storage' , function($resource,$q,$interval ,CONFIG,Storage){ //XJZ
	var serve={};
	var abort = $q.defer;
	var getToken=function(){
		return Storage.get('token') ;
	}

	var Users = function(){
		return $resource(CONFIG.baseUrl + ':path/:route',{
			path:'Users',
		},{
			LogOn:{method:'POST',headers:{token:getToken()}, params:{route: 'LogOn'}, timeout: 10000},
			Register:{method:'POST', params:{route: 'Register'}, timeout: 10000},
			ChangePassword:{method:'POST',params:{route:'ChangePassword'},timeout: 10000},
			Verification:{method:'POST',params:{route:'Verification'},timeout:10000},
      postDoctorInfo:{method:'POST',params:{route:'DoctorInfo'}, timeout:10000},//lrz20151102
      postDoctorDtlInfo:{method:'POST',params:{route:'DoctorDtlInfo'}, timeout:10000},//lrz20151102
      getUID:{method:'GET',params:{route:'UID', Type: '@Type', Name: '@Name'}, timeout:10000},
      UID:{method:'GET',params:{route:'UID'},timeout:10000},
			Activition:{method:'POST',params:{route:'Activition'},timeout:10000},//用户注册后激活
      Roles:{method:'GET',params:{route:'Roles',UserId:'@UserId'},timeout:10000,isArray:true},
      GetAppoitmentPatientList:{method:'GET',params:{route:'GetAppoitmentPatientList',$top:'@top',$skip:'@skip',$orderby:'@orderby',$filter:'@filter', healthCoachID:'@healthCoachID',Status:'@Status'},timeout:10000,isArray:true},
      GetPatientsList:{method:'GET',params:{route:'GetPatientsPlan',$top:'@top',$skip:'@skip',$orderby:'@orderby',$filter:'@filter', DoctorId:'@DoctorId',Module:'@ModuleType',VitalType:'@VitalType',VitalCode:'@VitalCode'},timeout:10000,isArray:true},
      BasicInfo:{method:'GET',params:{route:'@route'},timeout:10000}, 
      PatientBasicInfo:{method:'POST',params:{route:'BasicInfo'},timeout:10000},
      PhoneNo:{method:'GET',params:{route:'PhoneNo',UserId:'@UserId'},timeout:10000},
      PatientBasicDtlInfo:{method:'POST',params:{route:'BasicDtlInfo'},timeout:10000},
      setPatientDetailInfo:{method:'POST',params:{route:'BasicDtlInfo'},timeout:10000},
      getiHealthCoachList:{method:'GET',params:{route:'HealthCoaches',PatientId:'@PatientId'},timeout:10000,isArray:true},
      ReserveHealthCoach:{method:'POST',params:{route:'ReserveHealthCoach'},timeout:10000},//预约
      getHealthCoachInfo:{method:'GET',params:{route:'GetHealthCoachInfo',HealthCoachID:'@HealthCoachID'},timeout:10000},//预约
		})
	}
	var Service = function(){
		return $resource(CONFIG.baseUrl + ':path/:route',{
			path:'Service',
		},{
            sendSMS_lzn:{method:'POST',params:{route: 'sendSMS',mobile:'@mobile',smsType:'@smsType',content:'@content'}, timeout: 10000},
            sendSMS:{method:'POST',headers:{token:getToken()}, params:{route: 'sendSMS',phoneNo:'@phoneNo',smsType:'@smsType'}, timeout: 10000},
            PushNotification:{method:'GET',params:{route:'PushNotification',platform:'@platform',Alias:'@Alias',notification:'@notification',title:'@title',id:'@id'},timeout:10000},
            checkverification:{method:'POST',headers:{token:getToken()}, params:{route: 'checkverification', mobile:'@mobile',smsType: '@smsType', verification:'@verification'},timeout: 10000},

		})
	}	
  var Dict = function(){
    return $resource(CONFIG.baseUrl + ':path/:route',{
      path:'Dict',
    },{
          getYesNoType:{method:'GET',params:{route: 'Type/YesNoType'},isArray:true, timeout: 10000},
          getHyperTensionDrugTypeName:{method:'GET',params:{route: 'HypertensionDrug/TypeNames'},isArray:true, timeout: 10000},
          getHyperTensionDrugName:{method:'GET',params:{route: 'HypertensionDrug'}/*,headers:{"Content-Type":"application/xml; charset=utf-8"}*/,isArray:true, timeout: 10000},
          getDiabetesDrugTypeName:{method:'GET',params:{route: 'DiabetesDrug/TypeNames'},isArray:true, timeout: 10000},
          getDiabetesDrugName:{method:'GET',params:{route: 'DiabetesDrug'}/*,headers:{"Content-Type":"application/xml; charset=utf-8"}*/,isArray:true, timeout: 10000},
          getDietHabbit:{method:'GET',params:{route: 'Type/DietHabbit'},isArray:true, timeout: 10000},
          getDrinkFrequency:{method:'GET',params:{route: 'Type/DrinkFrequency'},isArray:true, timeout: 10000},
          GetInsuranceType:{method:'GET',isArray:true, params:{route:'GetInsuranceType'},timeout:10000},
          Type:{method:'GET',isArray:true,params:{route:'Type/Category'},timeout:10000},
          GetNo:{method:'GET',params:{route:'GetNo',NumberingType:'@NumberingType',TargetDate:'@TargetDate'},timeout:10000}
    })
  }
  var BasicInfo = function () {//ZXF
    return $resource(CONFIG.baseUrl + ':path/:userid/BasicInfo', {path:'Users',userid:'@userid'},
    {
      GetBasicInfoByPid: {method:'GET', timeout: 100000},
                // GetSignsDetailByPeriod: {method:'GET', params:{route: 'VitalSigns'}, timeout: 10000}
              });
  };
  var BasicDtlInfo = function () {
      return $resource(CONFIG.baseUrl + ':path/:UserId/BasicDtlInfo',{path:'Users',UserId:'@UserId'},
      { 
        GetBasicDtlInfo:{method:'GET',timeout:10000}
      })
    };
  var HJZYYID = function () {//ZXF
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'ClinicInfo',route:'GetLatestHUserIdByHCode',UserId:"@UserId",HospitalCode:'@HospitalCode'},
        {
                // GetClinicalNewMobile: {method:'GET', timeout: 10000},params:{route: '@UserId','@AdmissionDate','@ClinicDate','@Num' },
                GetHUserIdByHCode: {method:'GET',  timeout: 100000}
              });
      };
  var ClinicInfoDetail = function () {//ZXF
      return $resource(CONFIG.baseUrl + ':path/:route', {path:'ClinicInfo',route:'GetClinicInfoDetail',UserId:"@UserId",Type:'@Type',VisitId:'@VisitId',Date:'@Date'},
        {
                // GetClinicalNewMobile: {method:'GET', timeout: 10000},params:{route: '@UserId','@AdmissionDate','@ClinicDate','@Num' },
                GetClinicInfoDetailBy: {method:'GET',  timeout: 1000000}
              });
      };
  var ClinicalInfoList = function () {//ZXF
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'ClinicInfo',route:'GetClinicalInfoList',UserId:"@UserId"},
        {
                // GetClinicalNewMobile: {method:'GET', timeout: 10000},params:{route: '@UserId','@AdmissionDate','@ClinicDate','@Num' },
                GetClinicalInfoListbyUID: {method:'GET',  timeout: 1000000}
              });
      };
  var examinfo = function () {//ZXF
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'ClinicInfo',route:'GetExaminationList',UserId:"@UserId",VisitId:'@VisitId'},
        {
                // GetClinicalNewMobile: {method:'GET', timeout: 10000},params:{route: '@UserId','@AdmissionDate','@ClinicDate','@Num' },
                Getexaminfobypiduid: {method:'GET', isArray:true, timeout: 100000}

              });
      };
  var diaginfo = function () {//ZXF
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'ClinicInfo',route:'GetDiagnosisInfoList',UserId:"@UserId",VisitId:'@VisitId'},
        {
                // GetClinicalNewMobile: {method:'GET', timeout: 10000},params:{route: '@UserId','@AdmissionDate','@ClinicDate','@Num' },
                Getdiaginfobypiduid: {method:'GET', isArray:true, timeout: 100000}

              });
      };
  var druginfo = function () {//ZXF
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'ClinicInfo',route:'GetDrugRecordList',UserId:"@UserId",VisitId:'@VisitId'},
        {
                // GetClinicalNewMobile: {method:'GET', timeout: 10000},params:{route: '@UserId','@AdmissionDate','@ClinicDate','@Num' },
                Getdruginfobypiduid: {method:'GET', isArray:true, timeout: 100000}

              });
      };

  var RiskInfo = function(){
    return $resource(CONFIG.baseUrl + ':path/:route',{
      path:'RiskInfo',
    },{
        
        // POST Api/v1/RiskInfo/RiskResult //这个不要了
        postEvalutionResult:{method:'POST',params:{route: 'RiskResult'}, timeout: 20000},
        // GET Api/v1/RiskInfo/RiskInput?UserId={UserId}
        getEvalutionInput:{method:'GET',params:{route:'RiskInput',UserId:'@UserId'},timeout:10000},
        // GET Api/v1/RiskInfo/RiskResults?UserId={UserId}
        getEvalutionResults:{method:'GET',params:{route:'RiskResults',UserId:'@UserId'},isArray : true,timeout:10000},
        // GET Api/v1/RiskInfo/RiskResult?UserId={UserId}&AssessmentType={AssessmentType}
        getNewResult:{method:'GET',params:{route:'RiskResults',UserId:'@UserId',AssessmentType:'@AssessmentType'},timeout:10000},
        // GET Api/v1/RiskInfo/GetDescription?SBP={SBP}
        getSBPDescription:{method:'GET',params:{route:'GetDescription',SBP:'@SBP'},timeout:20000},
        // GET Api/v1/RiskInfo/Parameters?Indicators={Indicators}
        getIndicators:{method:'GET',params:{route:'Parameters',Indicators:'@Indicators'},timeout:10000},
        // POST Api/v1/RiskInfo/TreatmentIndicators
        postTreatmentIndicators:{method:'POST',params:{route:'TreatmentIndicators'},timeout:20000},
        // POST Api/v1/RiskInfo/PsParameters
        postPsParameters:{method:'POST',params:{route:'PsParameters'},timeout:10000}, 
        // GET Api/v1/RiskInfo/GetMaxSortNo?UserId={UserId}
        getMaxSortNo:{method:'GET',params:{route:'GetMaxSortNo',UserId:'@UserId'},timeout:10000},
        // POST Api/v1/RiskInfo/AddM1Risk?PatientId={PatientId}&RecordDate={RecordDate}&RecordTime={RecordTime}&piUserId={piUserId}&piTerminalName={piTerminalName}&piTerminalIP={piTerminalIP}&piDeviceType={piDeviceType} 
        AddM1Risk:{method:'POST',param:{route:'AddM1Risk',PatientId:'@PatientId',RecordDate:'@RecordDate',RecordTime:'@RecordTime',piUserId:'@piUserId',piTerminalName:'@piTerminalName',piTerminalIP:'@piTerminalIP',piDeviceType:'@piDeviceType'},timeout:20000},
        // POST Api/v1/RiskInfo/AddM3Risk?PatientId={PatientId}&RecordDate={RecordDate}&RecordTime={RecordTime}&piUserId={piUserId}&piTerminalName={piTerminalName}&piTerminalIP={piTerminalIP}&piDeviceType={piDeviceType}         
        AddM3Risk:{method:'POST',param:{route:'AddM3Risk',PatientId:'@PatientId',RecordDate:'@RecordDate',RecordTime:'@RecordTime',piUserId:'@piUserId',piTerminalName:'@piTerminalName',piTerminalIP:'@piTerminalIP',piDeviceType:'@piDeviceType'},timeout:20000},
        // GET Api/v1/RiskInfo/M1RiskInput?UserId={UserId} 
        getM1Input:{method:'GET',params:{route:'M1RiskInput',UserId:'@UserId'},timeout:10000},
        // GET Api/v1/RiskInfo/M3RiskInput?UserId={UserId} 
        getM3Input:{method:'GET',params:{route:'M3RiskInput',UserId:'@UserId'},timeout:10000}
    })
  }

  var PlanInfo = function () {
          return $resource(CONFIG.baseUrl + ':path/:route', {path:'PlanInfo'},
          {
              SetPlan: {method:'POST', params:{route: 'Plan'},timeout: 10000}, 
              GetPlanList: {method:'GET', isArray:true, params:{route: 'Plan'},timeout: 10000},
              SetTask: {method:'POST', params:{route: 'Task'},timeout: 10000},
              DeleteTask: {method:'POST', params:{route: 'deleteTask'},timeout: 10000},
              GetTasks: {method:'GET', isArray:true, params:{route: 'Tasks'},timeout: 10000},   //有标志位 
              GetTarget: {method:'GET', params:{route: 'Target'},timeout: 10000},
              SetTarget: {method:'POST', params:{route: 'Target'},timeout: 10000}
          });
      };

    //ZXF的
  var PlanInfo1 = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'PlanInfo',route:'Plan',PatientId:'@PatientId',PlanNo:'@PlanNo',Module:'@Module',Status:'@Status'},
        {
              
              GetplaninfobyPlanNo:{method:'GET', timeout: 10000, isArray:true},
              // PlanInfoChart: {method:'GET', params:{route: 'PlanInfoChart'},timeout: 10000, isArray:true}
            });
      };

  var PlanchartInfo = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'PlanInfo',route:'PlanInfoChart'},//,UserId:'@UserId',PlanNo:'@PlanNo',StartDate:'@StartDate',EndDate:'@EndDate',ItemType:'@ItemType',ItemCode:'@ItemCode'
        {
              
              GetchartInfobyPlanNo:{method:'GET', timeout: 10000, isArray:true},
              // PlanInfoChart: {method:'GET', params:{route: 'PlanInfoChart'},timeout: 10000, isArray:true}
            });
      };
  var VitalSigns=function(){
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'VitalInfo',route:'VitalSigns',UserId:'@UserId',StartDate:'@StartDate',EndDate:'@EndDate'},//,UserId:'@UserId',PlanNo:'@PlanNo',StartDate:'@StartDate',EndDate:'@EndDate',ItemType:'@ItemType',ItemCode:'@ItemCode'
        {
              // GET Api/v1/VitalInfo/VitalSigns?UserId={UserId}&StartDate={StartDate}&EndDate={EndDate}
              GetVitalSignsbydate:{method:'GET', timeout: 10000, isArray:true},
              // PlanInfoChart: {method:'GET', params:{route: 'PlanInfoChart'},timeout: 10000, isArray:true}
            });

      }
  var MessageInfo = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'MessageInfo'},
              {
                submitSMS: {method:'POST', params:{route: 'message'},timeout: 10000},
                GetSMSDialogue:{method:'GET', isArray:true, params:{route: 'messages'},timeout: 10000}
        
        });
    };
	serve.abort = function($scope){
		abort.resolve();
        $interval(function () {
        abort = $q.defer();
        serve.Users = Users(); 
        serve.Service = Service();
        serve.Dict = Dict();
        serve.BasicInfo = BasicInfo();
        serve.BasicDtlInfo = BasicDtlInfo();
        serve.HJZYYID = HJZYYID();
        serve.ClinicalInfoList = ClinicalInfoList();
        serve.ClinicInfoDetail = ClinicInfoDetail();
        serve.examinfo = examinfo();
        serve.diaginfo = diaginfo();
        serve.druginfo = druginfo();
        serve.RiskInfo = RiskInfo();
        serve.PlanInfo = PlanInfo(); 
        serve.PlanInfo1 = PlanInfo1();
        serve.PlanchartInfo = PlanchartInfo();
        serve.VitalSigns = VitalSigns();
        serve.MessageInfo = MessageInfo();
        }, 0, 1);  
	}
    serve.Users = Users();
    serve.Service = Service();
    serve.Dict = Dict();
    serve.BasicInfo = BasicInfo();
    serve.BasicDtlInfo = BasicDtlInfo();
    serve.HJZYYID = HJZYYID();
    serve.ClinicalInfoList = ClinicalInfoList();
    serve.ClinicInfoDetail = ClinicInfoDetail();
    serve.examinfo = examinfo();
    serve.diaginfo = diaginfo();
    serve.druginfo = druginfo();
    serve.RiskInfo = RiskInfo();
    serve.PlanInfo = PlanInfo();
    serve.PlanInfo1 = PlanInfo1();
    serve.PlanchartInfo = PlanchartInfo();
    serve.VitalSigns = VitalSigns(); 
    serve.MessageInfo = MessageInfo();
    return serve;
}])

.factory('userservice',['$http','$q' , 'Storage','Data', function($http,$q,Storage,Data){	 //XJZ
	var serve = {};
    var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    serve.Roles = function (_UserId){
      var deferred = $q.defer();
      Data.Users.Roles({UserId:_UserId},
        function(data){
          deferred.resolve(data);
        },function(err){
          deferred.reject(err);
        });
      return deferred.promise;
    }
    serve.userLogOn = function(_PwType,_username,_password,_role){
        if(!phoneReg.test(_username)){
        	return 7; 
        }
		var deferred = $q.defer();   
        Data.Users.LogOn({PwType:_PwType, username:_username, password:_password, role: _role},
   		function(data,hearders,status){ 
   			deferred.resolve(data);
   		},
   		function(err){
	   		deferred.reject(err);
       	});
        return deferred.promise;
    }

    serve.UID = function(_Type,_Name){
      if(!phoneReg.test(_Name)){
          return 7; 
        }

      var deferred = $q.defer();
        Data.Users.getUID({Type: _Type, Name: _Name},
          function(data,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
    }
// LZN 20151120
    serve.sendSMS_lzn = function(_mobile,_smsType,_content){
       var deferred = $q.defer();
        Data.Service.sendSMS_lzn({mobile: _mobile, smsType:_smsType,content:_content},
        function(data,headers){
          deferred.resolve(data);
        },
        function(err){
          deferred.reject(err);   
        });
        return deferred.promise;
    }
     // LZN 20151120
    serve.PushNotification = function(arr){
      var deferred = $q.defer();
      Data.Service.PushNotification(arr,function (data,headers){
        deferred.resolve(data);
        },
        function(err){
          deferred.reject(err);
      })
      return deferred.promise;
    }
    serve.sendSMS = function( _phoneNo,_smsType){
        if(!phoneReg.test(_phoneNo)){
        	return 7; 
        }
        
        var deferred = $q.defer();
        Data.Service.sendSMS({phoneNo: _phoneNo, smsType:_smsType},
       	function(data,status){
       		deferred.resolve(data,status);
       	},
       	function(err){
       		deferred.reject(err);		
       	});
       	return deferred.promise;
    }
    serve.checkverification = function(_mobile,_smsType,_verification){
    	var deferred = $q.defer();
    	Data.Service.checkverification({mobile:_mobile,smsType:_smsType,verification:_verification},
    		function(data,status){
    			deferred.resolve(data);
    		},
    		function(err){
    			deferred.reject(err);
    		})
    	return deferred.promise;
    }

    serve.changePassword = function(_OldPassword,_NewPassword,_UserId){
    	var deferred = $q.defer();
        Data.Users.ChangePassword({OldPassword:_OldPassword, NewPassword: _NewPassword, UserId:_UserId,  "revUserId": "sample string 4","TerminalName": "sample string 5", "TerminalIP": "sample string 6","DeviceType": 1},
        	function(data,headers,status){
        		deferred.resolve(data);
        	},
        	function(err){
        		deferred.reject(err);
        	})
        return deferred.promise;
    }

    serve.userRegister = function(_PwType, _userId, _UserName, _Password,_role){
    	var deferred = $q.defer();
    	Data.Users.Register({"PwType":_PwType,"userId":_userId,"Username":_UserName,"Password":_Password,role:_role,"revUserId": "sample string 6","TerminalName": "sample string 7","TerminalIP": "sample string 8","DeviceType": 1},
    		function(data,headers,status){
            	deferred.resolve(data);
    		},
    		function(err){
                deferred.reject(err);;
    		})
    	return deferred.promise;
    }
	return serve;
}])
.factory('userINFO',['$http','$q' , 'Storage','Data', function($http,$q,Storage,Data){
    var serve={};
    serve.BasicInfo = function(_UserId){
        var urltemp=_UserId+'/BasicInfo';
        var deferred = $q.defer();   
        Data.Users.BasicInfo({route:urltemp},
        function(data,hearders,status){ 
            deferred.resolve(data);
        },
        function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }
    serve.GetPatientsList = function(top,skip,orderby,filter,_DoctorId,_Module,_VitalType,_VitalCode){
        var deferred = $q.defer(); 
        Data.Users.GetPatientsList({$top:top,$skip:skip,$orderby:orderby,$filter:filter,DoctorId:_DoctorId,Module:_Module,VitalType:_VitalType,VitalCode:_VitalCode},
        function(data){ 
            deferred.resolve(data);
        },
        function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    }
    serve.GetAppoitmentPatientList = function(top,skip,orderby,filter,_healthCoachID,_Status){
        var deferred = $q.defer(); 
        Data.Users.GetAppoitmentPatientList({$top:top,$skip:skip,$orderby:orderby,$filter:filter,healthCoachID:_healthCoachID,Status:_Status},
        function(data){ 
            deferred.resolve(data);
        },
        function(err){
            deferred.reject(err);
        });
        return deferred.promise;      
   }
    return serve;    
}])
.factory('loading',['$interval','$ionicLoading', function($interval,$ionicLoading){
  var serve={};
  var timerStart,timerFinish;
  var repeat;
  serve.loadingBarStart=function($scope){
    repeat=0;
    timerStart = $interval(function(){
      if(repeat==65){
        $scope.barwidth="width:"+repeat+"%";
        $interval.cancel(timerStart);
        timerStart=undefined;        
      }else{
        $scope.barwidth="width:"+repeat+"%";
        repeat++;
      }
    },4);
  }
  serve.loadingBarFinish=function($scope){
    $interval.cancel(timerStart);
    timerStart=undefined; 
    timerFinish = $interval(function(){
      if(repeat==100){
        $scope.barwidth="width:0%";
        $interval.cancel(timerFinish);
        timerFinish=undefined;        
      }else{
      $scope.barwidth="width:"+repeat+"%";
      repeat++;
      }
    },1);    
  }

  return serve;
}])
//极光推送服务 TDY 20151026
.factory('jpushService',['$http','$window',function($http,$window){ //TDY
	var jpushServiceFactory={};

	//var jpushapi=$window.plugins.jPushPlugin;

	//启动极光推送
	var _init=function(){
		$window.plugins.jPushPlugin.init();
		$window.plugins.jPushPlugin.setDebugMode(true);
	}

	//停止极光推送
	var _stopPush=function(){
		$window.plugins.jPushPlugin.stopPush();
	}

	//重启极光推送
	var _resumePush=function(){
		$window.plugins.jPushPlugin.resumePush();
	}

	//设置标签和别名
	var _setTagsWithAlias=function(tags,alias){
		$window.plugins.jPushPlugin.setTagsWithAlias(tags,alias);
	}

	//设置标签
	var _setTags=function(tags){
		$window.plugins.jPushPlugin.setTags(tags);
	}

	//设置别名
	var _setAlias=function(alias){
		$window.plugins.jPushPlugin.setAlias(alias);
	}


	jpushServiceFactory.init=_init;
	jpushServiceFactory.stopPush=_stopPush;
	jpushServiceFactory.resumePush=_resumePush;

	jpushServiceFactory.setTagsWithAlias=_setTagsWithAlias;
	jpushServiceFactory.setTags=_setTags;
	jpushServiceFactory.setAlias=_setAlias;

	return jpushServiceFactory;
}])
//照相机服务 LRZ 20151104
.factory('Camera', ['$q','$cordovaCamera','CONFIG', '$cordovaFileTransfer',function($q,$cordovaCamera,CONFIG,$cordovaFileTransfer) { //LRZ
 
  return {
    getPicture: function() {

      var options = { 
          quality : 75, 
          destinationType : 1, 
          sourceType : 1, 
          allowEdit : true,
          encodingType: 0,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CONFIG.popoverOptions,
          saveToPhotoAlbum: false
      };

     var q = $q.defer();

      $cordovaCamera.getPicture(options).then(function(imageData) {
          imgURI = imageData;
          // console.log("succeed" + imageData);
          q.resolve(imgURI);
      }, function(err) {
          // console.log("sth wrong");
          imgURI = undefined;
          q.resolve(err);
      });      
      return q.promise; //return a promise
    },

    getPictureFromPhotos: function(){
      var options = { 
          quality : 75, 
          destinationType : 1, 
          sourceType : 0, 
          allowEdit : true,
          encodingType: 0,
          targetWidth: 300,
          targetHeight: 300
      };
        //从相册获得的照片不能被裁减 调研~
     var q = $q.defer();
      $cordovaCamera.getPicture(options).then(function(imageData) {
          imgURI = imageData;
          // console.log("succeed" + imageData);
          q.resolve(imgURI);
      }, function(err) {
          // console.log("sth wrong");
          imgURI = undefined;
          q.resolve(err);
      });      
      return q.promise; //return a promise      
    },

    uploadPicture : function(imgURI,fileName){
        // document.addEventListener('deviceready', onReadyFunction,false);
        // function onReadyFunction(){
          var uri = encodeURI(CONFIG.ImageAddressIP + "/upload.php");
          var options = {
            fileKey : "file",
            fileName : fileName,
            chunkedMode : true,
            mimeType : "image/jpeg"
          };
          var q = $q.defer();
          // console.log("jinlaile");
          $cordovaFileTransfer.upload(uri,imgURI,options)
            .then( function(r){
              console.log("Code = " + r.responseCode);
              console.log("Response = " + r.response);
              console.log("Sent = " + r.bytesSent);
              r.res = true;
              q.resolve(r);        
            }, function(error){
              alert("An error has occurred: Code = " + error.code);
              console.log("upload error source " + error.source);
              console.log("upload error target " + error.target);
              error.res = false;         
              q.resolve(error); 
            }, function (progress) {
              console.log(progress);
            })

            ;
          return q.promise;  
        // }


        // var ft = new FileTransfer();
        // $cordovaFileTransfer.upload(imgURI, uri, win, fail, options);
      
    },
    uploadPicture_Check : function(imgURI,fileName){
        // document.addEventListener('deviceready', onReadyFunction,false);
        // function onReadyFunction(){
          var uri = encodeURI(CONFIG.ImageAddressIP + "/upload_check.php");
          var options = {
            fileKey : "file",
            fileName : fileName,
            chunkedMode : true,
            mimeType : "image/jpeg"
          };
          var q = $q.defer();
          // console.log("jinlaile");
          $cordovaFileTransfer.upload(uri,imgURI,options)
            .then( function(r){
              console.log("Code = " + r.responseCode);
              console.log("Response = " + r.response);
              console.log("Sent = " + r.bytesSent);
              r.res = true;
              q.resolve(r);        
            }, function(error){
              alert("An error has occurred: Code = " + error.code);
              console.log("upload error source " + error.source);
              console.log("upload error target " + error.target);
              error.res = false;
              q.resolve(error);          
            }, function (progress) {
              console.log(progress);
            })

            ;
          return q.promise;  
        // }


        // var ft = new FileTransfer();
        // $cordovaFileTransfer.upload(imgURI, uri, win, fail, options);
      
    },
    downloadPicture: function(url,userid){ 

      var q = $q.defer();
      var targetPath = cordova.file.documentsDirectory + userid+".jpg";
      var trustHosts = true;
      var options = {};

      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
        .then(function(r) {
          q.resolve(r);  
        }, function(err) {
          q.resolve(err); 
        }, function (progress) {
        });

      return q.promise;  
    }


  }
  
}])




.factory('Patients',['Data','$q','$resource','CONFIG',function(Data,$q,$resource,CONFIG){ //LRZ
  //get patients
  //remove certain patients
  //add  patients
  //blablabla used by two controllers

  return {
    all: function() {
      return patients_array;
    },
    remove: function(patient) {
      patients_array.splice(patients_array.indexOf(chat), 1);
    },
    get: function(patientid) {
      for (var i = 0; i < patients_array.length; i++) {
        if (patients_array[i].id === parseInt(patientid)) {
          return patients_array[i];
        }
      }
      return null;
    },
    getEvalutionResults: function(userid){

      var deferred = $q.defer();
      Data.RiskInfo.getEvalutionResults({"UserId":userid}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;        
    },
    getEvalutionInput: function(userid){
      //获取填表所需输入 
      var deferred = $q.defer();
      Data.RiskInfo.getEvalutionInput({"UserId":userid}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;        
    },
    getSBPDescription: function(sbp){
      //获取填表所需输入 
      var deferred = $q.defer();
      Data.RiskInfo.getSBPDescription({"SBP":sbp}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;        
    },
    getNewResult: function(userid){
      var deferred = $q.defer();
      Data.RiskInfo.getSBPDescription({"UserId":userid}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise; 
    },
    postEvalutionResult:function(result){
      console.log("uploading")
      var deferred = $q.defer();
        Data.RiskInfo.postEvalutionResult(result, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
        console.log(err);
      });
      return deferred.promise; 

    },
    postTreatmentIndicators: function(result){
      var deferred = $q.defer();
        Data.RiskInfo.postTreatmentIndicators(result, function (data, headers) {
        console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise; 
    },
    getMaxSortNo:function(userid){
      var deferred = $q.defer();
        Data.RiskInfo.getMaxSortNo({"UserId":userid}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;       
    },
    postQuestionM1: function(data){
      var t = new Date();
      var t1 = String(t.getFullYear());
      var t2 = String(t.getDate());
      var t3 = String(t.getMonth() + 1);
      var t4 = String(t.getHours());
      var t5 = String(t.getMinutes());

      var RecordDate = t1 + (t3.length == 2? t3: '0' + t3) +   (t2.length == 2? t2: '0' + t2) ;
      var RecordTime = (t4.length == 2? t4: '0' + t4) + (t5.length == 2? t5: '0' + t5);
      var deferred = $q.defer();

        Data.RiskInfo.AddM1Risk({route:'AddM1Risk',PatientId:Storage.get('PatientID'),RecordDate:RecordDate,RecordTime:'2241',piUserId:'1',piTerminalName:'1',piTerminalIP:'1',piDeviceType:'1'},data,function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise; 
    },
    postQuestionM3: function(data){
      var t = new Date();
      var t1 = String(t.getFullYear());
      var t2 = String(t.getDate());
      var t3 = String(t.getMonth() +1 );
      var t4 = String(t.getHours());
      var t5 = String(t.getMinutes());

      var RecordDate = t1 + (t3.length == 2? t3: '0' + t3) +   (t2.length == 2? t2: '0' + t2) ;
      var RecordTime = (t4.length == 2? t4: '0' + t4) + (t5.length == 2? t5: '0' + t5);

      var deferred = $q.defer();
       var t = new Date();
       var RecordDate = t.getFullYear();
       var RecordTime = t.getTime();
        Data.RiskInfo.AddM3Risk({route:'AddM3Risk',PatientId:Storage.get('PatientID'),RecordDate:RecordDate,RecordTime:RecordTime,piUserId:'1',piTerminalName:'1',piTerminalIP:'1',piDeviceType:'1'}, data,function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise; 
    },
    getQuestionM1: function(userid){

      var deferred = $q.defer();
        Data.RiskInfo.getM1Input({UserId:userid},function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise; 
    },  
    getQuestionM3: function(userid){

      var deferred = $q.defer();
        Data.RiskInfo.getM3Input({UserId:userid},function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise; 
    }  

  }
}])


//LRZ20151113 风险评估service
.factory('RiskService',['Patients','Data','Storage','$rootScope',function(Patients, Data, Storage,$rootScope){
  var self = this;
  // 风险评估列表
  var riskList = [];
  //高血压风险的画图数据   
  var graphData_hy = {
        "type": "serial",
        "theme": "light",
          "dataProvider": [{
              "type": "收缩压",
              "state1": 40+80,
              "state2": 20,
              "state3": 20,
              "state4": 20,
              "state5": 20,
              "now": 0, //params
              "target": 120               //params

          }, {
              "type": "舒张压",
              "state1": 20+80,
              "state2": 20,
              "state3": 20,
              "state4": 20,
              "state5": 20,
              "now":  0,         //params
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
  //糖尿病风险的画图数据
  var graphData_diab = {
        "type": "serial",
        "theme": "light",
          "dataProvider": [{
              "type": "一年死亡风险",
              "state1": 2.5,
              "state2": 2.5,
              "state3": 2.5,
              "state4": 2.5,
              "state5": 2.5,
              "now": 0, //params
              "target": 0               //params

          }, {
              "type": "三年死亡风险",
              "state1": 3,
              "state2": 3,
              "state3": 3,
              "state4": 3,
              "state5": 3,
              "now":  0,         //params
              "target": 0             //params
          }],
          "valueAxes": [{
              "stackType": "regular",
              "axisAlpha": 0.3,
              "gridAlpha": 0,
               "minimum" :0
          }],
          "startDuration": 0.1,
          "graphs": [{
              //"balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>2.5%</b></span>",
              "fillAlphas": 0.8,
              //"labelText": "[[value]]",
              "lineAlpha": 0.3,
              "title": "很安全",
              "type": "column",
              "color": "#000000",
              "columnWidth": 0.618,
              "valueField": "state1"
          }, {
              //"balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>120-140mmHg</b></span>",
              "fillAlphas": 0.8,
             // "labelText": "[[value]]",
              "lineAlpha": 0.3,
              "title": "正常",
              "type": "column",
              "color": "#000000",
              "columnWidth": 0.618,
              "valueField": "state2"
          }, {
              //"balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>140-160mmHg</b></span>",
              "fillAlphas": 0.8,
              //"labelText": "[[value]]",
              "lineAlpha": 0.3,
              "title": "良好",
              "type": "column",
              "color": "#000000",
              "columnWidth": 0.618,
              "valueField": "state3"
          }, {
             // "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>160-180mmHg</b></span>",
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
              //"balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
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
      
  //心衰风险的画图数据
  var graphData_xs = {
    "type": "gauge",
    "theme": "light",
    "axes": [ {
      "axisThickness": 2,
      "axisAlpha": 0.2,
      "tickAlpha": 0.2,
      "valueInterval": 10,
      "bands": [ {
        "color": "#84b761",
        "endValue": 30,
        "startValue": 0
      }, {
        "color": "#fdd400",
        "endValue": 60,
        "startValue": 30
      }, {
        "color": "#cc4748",
        "endValue": 100,
        "innerRadius": "95%",
        "startValue": 60
      } ],
      "bottomText": "死亡率 百分比",
      "bottomTextYOffset": -20,
      "endValue": 100
    } ],
    "arrows": [ {} ],
    "export": {
      "enabled": true
    }
    };

  self.getGraphData = function(module,index){
    // console.log("1");
    var temp = {};

    switch(module){
      case 'M1': temp = graphData_hy;
                 // console.log(temp); 
                 temp.dataProvider[0].now = riskList[index].M1.SBP;
                 temp.dataProvider[1].now = riskList[index].M1.DBP;
                 break;
      case 'M2': temp = graphData_diab; 
                 temp.dataProvider[0].bullet = riskList[index].M2.Glucose;
                 break;
      case 'M3': temp = graphData_xs;
                 temp.dataProvider[0].now = riskList[index].M3.f1;
                 temp.dataProvider[1].now = riskList[index].M3.f2;
    };
    return temp;
  }

  self.getIndexBySortNo = function(sortno){
      for (var i = riskList.length - 1; i >= 0; i--) {
        if(riskList[i].num == sortno) {
          var temp = i;
          // console.log("得到了这一条数据");
          // console.log(riskList[temp]);
          break;
        }
      };
      return temp;
  }
  self.getRiskList = function(){
    // console.log("riskList");
    return riskList;
  }
 self.getSingleRisk = function(no){
    return riskList[no];
  }
  var sortList = function(risks){
    console.log("start sorting lists");
    //先整理列表的模块名
    for (var i = risks.length - 1; i >= 0; i--) {
          switch (risks[i].AssessmentType){
            case 'M1' : risks[i].AssessmentName = "高血压模块";       
                        var temp = risks[i].Result.split("||",8);
                        //分割字符串 获得血压数据 SBP||DBP||5 factors
                        risks[i].Result = temp[0];
                        risks[i].SBP = temp[1];
                        risks[i].DBP = temp[2];
                        risks[i].f1 = temp[3];
                        risks[i].f2 = temp[4];
                        risks[i].f3 = temp[5];
                        risks[i].f4 = temp[6];
                        risks[i].f5 = temp[7];
                        break;
            case 'M2' : risks[i].AssessmentName = "糖尿病模块";
                        //分割字符串 获得血糖数据 结果||测量时间||血糖值
                        var temp = risks[i].Result.split("||",3);
                        risks[i].Result = temp[0];
                        risks[i].Period = temp[1];
                        risks[i].Glucose = temp[2];
                        break;
            case 'M3' : risks[i].AssessmentName = "心衰模块"; 
                      //分割字符串 获得血糖数据 分级||填表结果||blablabla
                        var temp = risks[i].Result.split("||",3);
                        risks[i].Result = temp[0];
                        risks[i].f1 = temp[1];
                        risks[i].f2 = temp[2];                   
          } 
      };
      //将同一个number 的整合到 一个对象中
      var newRisks = [];
      for (var i = 0; i <= risks.length - 1; i++) {
          if(i == 0) {
            switch(risks[i].AssessmentType){
                case 'M1' : var temp = {num: risks[i].SortNo, M1:risks[i],M2:undefined,M3:undefined};break;
                case 'M2' : var temp = {num: risks[i].SortNo, M2:risks[i],M1:undefined,M3:undefined};break;
                case 'M3' : var temp = {num: risks[i].SortNo, M3:risks[i],M2:undefined,M1:undefined};
            }
            newRisks.push(temp);
          }
          else{
            if(risks[i].SortNo == newRisks[newRisks.length-1].num){
                switch(risks[i].AssessmentType){
                  case 'M1' : newRisks[newRisks.length-1].M1 = risks[i];break;
                  case 'M2' : newRisks[newRisks.length-1].M2 = risks[i];break;
                  case 'M3' : newRisks[newRisks.length-1].M3 = risks[i];
                }
            }
            else{
                switch(risks[i].AssessmentType){
                  case 'M1' : var temp = {num: risks[i].SortNo, M1:risks[i]};break;
                  case 'M2' : var temp = {num: risks[i].SortNo, M2:risks[i]};break;
                  case 'M3' : var temp = {num: risks[i].SortNo, M3:risks[i]};
                }
                newRisks.push(temp);            
            }
          }        
      };
      //不显示没填写的项目&& 异常项目 lrz20151103
      for (var i = newRisks.length - 1; i >= 0; i--) {
        if(typeof(newRisks[i].M1) == 'undefined' 
          || typeof(newRisks[i].M1.SBP) == 'undefined' 
          || typeof(newRisks[i].M1.DBP) == 'undefined')
          {
            newRisks[i].M1show = false;
            newRisks[i].M1 = {Result: "您本次没有进行高血压的风险评估"};
          }
        else  newRisks[i].M1show = true;
        
        if(typeof(newRisks[i].M2) == 'undefined' || 
           typeof(newRisks[i].M2.AssessmentTime) == 'undefined' ||
           typeof(newRisks[i].M2.Period) == 'undefined' ||
           typeof(newRisks[i].M2.Glucose) == 'undefined')
          {
            newRisks[i].M2show = false;
            newRisks[i].M2 = {Result :"您本次没有进行糖尿病的风险评估"};
          }
        else newRisks[i].M2show = true;

        if(typeof(newRisks[i].M3) == 'undefined' || 
           typeof(newRisks[i].M3.AssessmentTime) == 'undefined' ||
           typeof(newRisks[i].M3.f1) == 'undefined' ||
           typeof(newRisks[i].M3.f2) == 'undefined')
          {
            newRisks[i].M3show = false;
            newRisks[i].M3 = {Result :"您本次没有进行心衰的风险评估"};
          }
        else newRisks[i].M3show = true;
      };
      // console.log(newRisks);
      console.log("finished sorting lists");    
      return newRisks;
  }

  self.initial = function(){
    console.log("service初始化");
    var pid = Storage.get('PatientID');
    // var pid = "PID201506170002";
    console.log("service从LS取出了pid" + pid);
    //得到所有的数据
    Patients.getEvalutionResults(pid).then(function(data){
      //没有数据或者取失败广播告诉controller取不出来了
      // console.log(data);
      if(data == [] || data == null ){
        console.log("service从WS取数据失败----broadcasting");
        $rootScope.$broadcast("RisksGetFail");
        return ;
      }
      else{
        console.log("service从WS取数据成功----broadcasting");
        //整理列表 按照 什么 排好
        riskList = sortList(data);
        // console.log(riskList);
        //广播告诉controller 可以取了
        $rootScope.$broadcast("RisksGet");        
      }

    });
  }

  
  return self;

}])
//用户类LRZ 调用DATA 主要负责和服务器互动 会改
.factory('Users', ['$q', '$http', 'Data','Storage','$resource','CONFIG',function ($q, $http, Data,Storage,$resource,CONFIG) { 
  var self = this;

  //LRZ 20151102
  self.postDoctorInfo = function (data) {
    // console.log(data);

    
    var DoctorInfo = {
      "UserId": String(data.id),
      "UserName": String(data.name),
      "Birthday": String(data.birthday),
      "Gender": (data.gender == '男' ? 1:2),
      "IDNo": String(data.idno),
      "InvalidFlag": 0,
      "piUserId": "蛤蛤蛤",
      "piTerminalName": "蛤蛤蛤",
      "piTerminalIP": "蛤蛤蛤",
      "piDeviceType": 2
    };
    var deferred = $q.defer();
    Data.Users.postDoctorInfo(DoctorInfo, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  //LRZ 20151102
  self.postDoctorDtlInfo = function (data) {
    var DoctorInfo = {
      UserId: Storage.get('UID'),
      unitname:data.unitname,
      jobTitle: data.jobTitle,
      level: data.level,
      dept: data.dept,
      photoAddress: data.photoAddress
    };

    var temp = [{
                "Doctor": DoctorInfo.UserId,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_4",
                "ItemSeq": "1",
                "Value": DoctorInfo.photoAddress,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"
              },
              {
                "Doctor": DoctorInfo.UserId,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_5",
                "ItemSeq": "1",
                "Value": DoctorInfo.unitname,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"    
                },
              {
                "Doctor": DoctorInfo.UserId,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_6",
                "ItemSeq": "1",
                "Value": DoctorInfo.jobTitle,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"   
              },
              {
                "Doctor": DoctorInfo.UserId,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_7",
                "ItemSeq": "1",
                "Value": DoctorInfo.level,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"  
              },
              {
                "Doctor": DoctorInfo.UserId,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_8",
                "ItemSeq": "1",
                "Value": DoctorInfo.dept,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"  
              }
    ];

    console.log(temp);
    var deferred = $q.defer();
    Data.Users.postDoctorDtlInfo(temp, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
//LRZ 20151110
  self.postDoctorDtlInfo_Check = function (data) {
    var DoctorInfo = {
      UserId: Storage.get('UID'),
      unitname:data.unitname,
      jobTitle: data.jobTitle,
      level: data.level,
      dept: data.dept,
      photoAddress: data.photoAddress,
      photoAddress_Check: data.photoAddress_Check
    };

    var temp = [
              {
                "Doctor": DoctorInfo.UserId,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_5",
                "ItemSeq": "1",
                "Value": DoctorInfo.unitname,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"    
                },
              {
                "Doctor": DoctorInfo.UserId,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_6",
                "ItemSeq": "1",
                "Value": DoctorInfo.jobTitle,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"   
              },
              {
                "Doctor": DoctorInfo.UserId,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_7",
                "ItemSeq": "1",
                "Value": DoctorInfo.level,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"  
              },
              {
                "Doctor": DoctorInfo.UserId,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_8",
                "ItemSeq": "1",
                "Value": DoctorInfo.dept,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"  
              }
    ];

    console.log(temp);
    var deferred = $q.defer();
    Data.Users.postDoctorDtlInfo(temp, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }; 
//LRZ 20151105   
  self.postDoctorDtlInfo_Single = function (userid,code,value) {
    var temp = [{
                "Doctor": userid,
                "CategoryCode": "Contact",
                "ItemCode": "Contact001_" + String(code),
                "ItemSeq": "1",
                "Value": value,
                "Description": "null",
                "SortNo": "1",
                "piUserId": "sample string 8",
                "piTerminalName": "sample string 9",
                "piTerminalIP": "sample string 10",
                "piDeviceType": "11"
              }
    ];
    console.log(temp);
    var deferred = $q.defer();
    Data.Users.postDoctorDtlInfo(temp, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };      
  //LRZ 20151102
  self.getDocInfo = function (userid) {
    
    // Storage.set(13131313,userid);
    //由于API中要求有userID变量 DATA 中只能写死 所以动态生成一个方法
    var temp = $resource(CONFIG.baseUrl + ':path/:uid/:route', {
      path:'Users',  
    }, {
      myTrialGET: {method:'GET', params:{uid: userid,route:'DoctorInfo'}, timeout: 10000}
    });


    var deferred = $q.defer();
    temp.myTrialGET({}, function (data, headers) {
      // console.log("获得了数据"+data)
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  //LRZ 20151102
  self.getDocDtlInfo = function (userid) {
    
    // Storage.set(13131313,userid);
    //由于API中要求有userID变量 DATA 中只能写死 所以动态生成一个方法
    var temp = $resource(CONFIG.baseUrl + ':path/:uid/:route', {
      path:'Users',  
    }, {
      myTrialGET: {method:'GET', params:{uid: userid,route:'DoctorDtlInfo'}, timeout: 10000}
    });


    var deferred = $q.defer();
    temp.myTrialGET({}, function (data, headers) {
      // console.log("获得了数据"+data)
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  //TDy 20151106
  self.addnewpatient = function(DoctorId, PatientId,Module){
    var temp = [{
      "Doctor": DoctorId,
      "CategoryCode": "H"+Module,
      "ItemCode": "Patient",
      "ItemSeq": 1,
      "Value": PatientId,
      "Description": "null",
      "SortNo": 1,
      "piUserId": DoctorId,
      "piTerminalName": "sample string 9",
      "piTerminalIP": "sample string 10",
      "piDeviceType": 2  
    }];
    var deferred = $q.defer();
    Data.Users.postDoctorDtlInfo(temp, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  //TDy 20151106
  self.addnewhealthcoach = function(DoctorId, PatientId,Module){
    var temp = [{
      "Patient": PatientId,
      "CategoryCode": "H"+Module,
      "ItemCode": "Doctor",
      "ItemSeq": 1,
      "Value": DoctorId,
      "Description": "null",
      "SortNo": 1,
      "piUserId": DoctorId,
      "piTerminalName": "sample string 9",
      "piTerminalIP": "sample string 10",
      "piDeviceType": 2  
    },
    {
      "Patient": PatientId,
      "CategoryCode": "H"+Module,
      "ItemCode": "InvalidFlag",
      "ItemSeq": 1,
      "Value": "0",
      "Description": "null",
      "SortNo": 1,
      "piUserId": DoctorId,
      "piTerminalName": "sample string 9",
      "piTerminalIP": "sample string 10",
      "piDeviceType": 2 
    }];
    var deferred = $q.defer();
    Data.Users.setPatientDetailInfo(temp, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  //TDY 20151030
  self.getquestionnaire = function(UserId,CategoryCode) {
    var temp = $resource(CONFIG.baseUrl + ':path/:UserId/:CategoryCode', {
      path:'ModuleInfo',  
    }, {
      getModuleInfo:{method:'GET',params:{UserId: UserId, CategoryCode: CategoryCode},isArray:true, timeout: 10000}
    });

    var deferred = $q.defer();
    temp.getModuleInfo({UserId: UserId, CategoryCode: CategoryCode},
          function(data,status){
            // var data = {results: data};
            //console.log(data);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

  //TDY 20151030
  self.getHyperTensionDrugNameByType = function(Type) {
    var Filtet1 = "Type eq " + "'" + Type + "'";
    var filter1 = $resource(CONFIG.baseUrl + ':path/:route',{
      path:'Dict',
    },{
          getHyperTensionDrugNameByType:{method:'GET',params:{route: 'HypertensionDrug', $filter:Filtet1}/*,headers:{"Content-Type":"application/xml; charset=utf-8"}*/,isArray:true, timeout: 10000},
    });

    var deferred = $q.defer();
    filter1.getHyperTensionDrugNameByType({},
          function(data,status){
            // var data = {results: data};
            //console.log(data);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

  //TDY 20151030
  self.getDiabetesDrugNameByType = function(Type) {
    var Filtet2 = "Type eq " + "'" + Type + "'";
    var filter2 = $resource(CONFIG.baseUrl + ':path/:route',{
      path:'Dict',
    },{
          getDiabetesDrugNameByType:{method:'GET',params:{route: 'DiabetesDrug', $filter:Filtet2}/*,headers:{"Content-Type":"application/xml; charset=utf-8"}*/,isArray:true, timeout: 10000},
    });

    var deferred = $q.defer();
    filter2.getDiabetesDrugNameByType({},
          function(data,status){
            // var data = {results: data};
            //console.log(data);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };
   // LZN 20151116 预约
  self.getAppointmentByPatientID = function(_healthCoachID,_Status,PatientID) {
    var Filter3 = "PatientID eq " + "'" + PatientID + "'";
    var filter3 = $resource(CONFIG.baseUrl + ':path/:route',{
      path:'Users',
    },{
        getAppointmentByPatientID:{method:'GET',params:{route: 'GetAppoitmentPatientList',healthCoachID:'@healthCoachID',Status:'@Status',$filter:Filter3},isArray:true,timeout:10000},
    });
    var deferred = $q.defer();
    filter3.getAppointmentByPatientID({healthCoachID:_healthCoachID,Status:_Status,PatientID:PatientID},
      function (data,status){
        deferred.resolve(data);
      },
      function (err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  // LZN 20151117
  self.getHealthCoachInfo = function(_HealthCoachID) {
     var deferred = $q.defer();
      Data.Users.getHealthCoachInfo({HealthCoachID:_HealthCoachID},
        function (data,headers) {
          deferred.resolve(data);
      },function (err) {
          deferred.reject(err);
      });
      return deferred.promise;
  };

  //TDY 20151030
  self.getYesNoType = function(){
     var deferred = $q.defer();
      Data.Dict.getYesNoType({},
          function(data,status){
            var check = {results: data};
            console.log(check);
            console.log(check.results[1]);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
      
      //console.log(deferred.promise);
        return deferred.promise;      
     /*}while(typeof(check.results[1]) == "undefined")*/
  };

  //TDY 20151030
  self.getHyperTensionDrugTypeName = function(){
     var deferred = $q.defer();
      Data.Dict.getHyperTensionDrugTypeName({},
          function(data,status){
            // var data = {results: data};
            //console.log(data);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

  //TDY 20151030
  self.getHyperTensionDrugName = function(){
     var deferred = $q.defer();
      Data.Dict.getHyperTensionDrugName({},
          function(data,status){
            // var data = {results: data};
            //console.log(data);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

  //TDY 20151030
  self.getDiabetesDrugTypeName = function(){
     var deferred = $q.defer();
      Data.Dict.getDiabetesDrugTypeName({},
          function(data,status){
            // var data = {results: data};
            //console.log(data);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

  //TDY 20151030
  self.getDiabetesDrugName = function(){
     var deferred = $q.defer();
      Data.Dict.getDiabetesDrugName({},
          function(data,status){
            // var data = {results: data};
            //console.log(data);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

  //TDY 20151030
  self.getDietHabbit = function(){
     var deferred = $q.defer();
      Data.Dict.getDietHabbit({},
          function(data,status){
            // var data = {results: data};
            //console.log(data);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

  //TDY 20151030
  self.getDrinkFrequency = function(){
     var deferred = $q.defer();
      Data.Dict.getDrinkFrequency({},
          function(data,status){
            // var data = {results: data};
            //console.log(data);
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

  //TDY 20151030
  self.setPatientDetailInfo = function(obj){
    var deferred = $q.defer();
      Data.Users.setPatientDetailInfo(obj,
          function(data,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

  //LZN 20151030
  self.PatientBasicInfo = function (arr){
    var deferred = $q.defer();
    Data.Users.PatientBasicInfo(arr,function (data,headers) {
      deferred.resolve(data);
      }, function (err) {
          deferred.reject(err);
      });
      return deferred.promise;
  };

  //LZN 20151030
  self.UID = function (_Type,_Name){
      
      

    var deferred = $q.defer();
    Data.Users.UID({Type:_Type,Name:_Name},function (data,headers){
       deferred.resolve(data);
     }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  //LZN 20151030
  self.PatientBasicDtlInfo = function(arr){
    var deferred = $q.defer();
    Data.Users.PatientBasicDtlInfo(arr,function (data,headers) {
    deferred.resolve(data);
    }, function (err) {
         deferred.reject(err);
    });
    return deferred.promise;
  };
   self.PhoneNo = function(_UserId){
    var deferred = $q.defer();
    Data.Users.PhoneNo({UserId:_UserId},function (data,headers){
      deferred.resolve(data);
    },function (err){
        deferred.reject(err);
    });
    return deferred.promise;
  };

    return self;
    // LZN 20151118 预约
  self.ReserveHealthCoach = function(arr){
    var deferred = $q.defer();
    Data.Users.ReserveHealthCoach(arr,function (data,headers){
      deferred.resolve(data);
    },function (err){
      deferred.reject(err);
    });
    return deferred.promise;
  };

    return self;
}])

//LZN 20151030
.factory('Dict',['$q','$http','Data',function($q,$http,Data){
  var self = this;
  self.GetInsuranceType = function(){
    var deferred = $q.defer();
    Data.Dict.GetInsuranceType(function (data,headers) {
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  self.Type = function(_Category){
    var deferred = $q.defer();
    Data.Dict.Type({Category:_Category},function (data,headers) {
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
 





  self.GetNo = function(_NumberingType,_TargetDate){
    var deferred = $q.defer();
    Data.Dict.GetNo({NumberingType:_NumberingType,TargetDate:_TargetDate},function (data,headers) {
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  self.GetHypertensionDrug = function () {
        var deferred = $q.defer();       
        Data.Dict.GetHypertensionDrug(function (data, headers) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
       return deferred.promise;
    }; 

    self.GetDiabetesDrug = function () {
        var deferred = $q.defer();       
        Data.Dict.GetDiabetesDrug(function (data, headers) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
       return deferred.promise;
    }; 
  return self;
}])


//ZXF 20151031
.factory('Getdruginfo', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;
  self.Getdruginfobypiduid = function (arr) {
    var deferred = $q.defer();
    Data.druginfo.Getdruginfobypiduid(arr, function (data, headers) {
      deferred.resolve(data);
       // console.log(data);
     }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  
  return self;
}])

//ZXF 20151031
.factory('Getdiaginfo', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;
  self.Getdiaginfobypiduid = function (arr) {
    var deferred = $q.defer();
    Data.diaginfo.Getdiaginfobypiduid(arr, function (data, headers) {
      deferred.resolve(data);
       // console.log(data);
     }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  
  return self;
}])

//ZXF 20151031
.factory('Getexaminfo', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;
  self.Getexaminfobypiduid = function (arr) {
    var deferred = $q.defer();
    Data.examinfo.Getexaminfobypiduid(arr, function (data, headers) {
      deferred.resolve(data);
       // console.log(data);
     }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  
  return self;
}])

//ZXF 20151031
.factory('GetClinicalList', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;
  self.GetClinicalInfoListbyUID = function (arr) {
    var deferred = $q.defer();
    Data.ClinicalInfoList.GetClinicalInfoListbyUID(arr, function (data, headers) {
      deferred.resolve(data);
       // console.log(data);
     }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  
  return self;
}])


//根据userid获取hjzyy的就诊id//ZXF 20151031
.factory('GetHZID', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;
  self.GetHUserIdByHCode = function (arr) {
    var deferred = $q.defer();
    Data.HJZYYID.GetHUserIdByHCode(arr, function (data, headers) {
      deferred.resolve(data);
       // console.log(data);
     }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  
  return self;
}])

//ZXF 20151031
.factory('GetBasicInfo', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;
  self.GetBasicInfoByPid = function (PatientId) {
    var deferred = $q.defer();
    Data.BasicInfo.GetBasicInfoByPid({userid:PatientId}, function (data, headers) {
      deferred.resolve(data);
       // console.log(data);
     }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  
  self.getiHealthCoachList = function(PatientId){
    var deferred = $q.defer();
    Data.Users.getiHealthCoachList({PatientId:PatientId},function(data,headers){
      deferred.resolve(data);
    },function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };

  return self;
}])

// LZN 20151103
.factory('BasicDtlInfo',['$q','$http','Data',function($q,$http,Data){
  var self = this;
  self.GetBasicDtlInfo = function(_UserId){
    var deferred = $q.defer();
    Data.BasicDtlInfo.GetBasicDtlInfo({UserId:_UserId},function (data,headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  return self;
}])

//ZXF 20151031
.factory('GetClinicInfoDetail', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;
  self.GetClinicInfoDetailBy = function (arr) {
    var deferred = $q.defer();
    Data.ClinicInfoDetail.GetClinicInfoDetailBy(arr, function (data, headers) {
      deferred.resolve(data);
       // console.log(data);
     }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  
  return self;
}])

//ZXF 20151031
.factory('UserInfo', ['$http', '$q', function ($http, $q) {  
  return {  
    query : function(a,b,c,d) {  
      var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
      $http({method: 'GET', url: 'http://10.12.43.72:9000/Api/v1/BasicInfo/VitalSigns',params: {"PatientId": a,"Module":b,"StartDate":c,"Num":d}}).//"U201508170003", "M1", "20151013", "7"  
      success(function(data, status, headers, config) {  
        deferred.resolve(data);  // 声明执行成功，即http请求数据成功，可以返回数据了  
      }).  
      error(function(data, status, headers, config) {  
        deferred.reject(data);   // 声明执行失败，即服务器返回错误  
      });  
      return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API  
    } // end query  
  };  
}])

.factory('PlanInfo', ['$q', '$http', 'Data',function ( $q,$http, Data) {
    var self = this;

    self.SetPlan = function (PlanNo, PatientId, StartDate, EndDate, Module, Status, DoctorId, piUserId, piTerminalName, piTerminalIP, piDeviceType) {
        var deferred = $q.defer();
        Data.PlanInfo.SetPlan({PlanNo:PlanNo, PatientId:PatientId, StartDate:StartDate, EndDate:EndDate, Module:Module, Status:Status, DoctorId:DoctorId, piUserId:piUserId, piTerminalName:piTerminalName, piTerminalIP:piTerminalIP, piDeviceType:piDeviceType}, function (data, headers) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    self.GetPlanList = function (PatientId, PlanNo, Module, Status) {
        var deferred = $q.defer();
        Data.PlanInfo.GetPlanList({PatientId:PatientId, PlanNo:PlanNo, Module:Module, Status:Status}, function (data, headers) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    self.SetTask = function (obj) {
        var deferred = $q.defer();
        Data.PlanInfo.SetTask(obj, function (data, headers) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    self.DeleteTask = function (obj) {
        var deferred = $q.defer();
        Data.PlanInfo.DeleteTask(obj, function (data, headers) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    self.GetTasks = function (PlanNo, ParentCode) {
        var deferred = $q.defer();
        Data.PlanInfo.GetTasks({PlanNo:PlanNo, ParentCode:ParentCode, Date:"1", PatientId:"1"}, function (data, headers) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };


    self.GetTarget = function (PlanNo, Type, Code) {
        var deferred = $q.defer();
        Data.PlanInfo.GetTarget({PlanNo:PlanNo, Type:Type, Code:Code}, function (data, headers) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    self.SetTarget = function (Plan, Type, Code, Value, Origin, Instruction, Unit, piUserId, piTerminalName, piTerminalIP, piDeviceType) {
        var deferred = $q.defer();
        Data.PlanInfo.SetTarget({Plan:Plan, Type:Type, Code:Code, Value:Value, Origin:Origin, Instruction:Instruction, Unit:Unit, piUserId:piUserId, piTerminalName:piTerminalName, piTerminalIP:piTerminalIP, piDeviceType:piDeviceType}, function (data, headers) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };


    return self;
}])

//ZXF 20151102
.factory('GetVitalSigns', ['$q', '$http', 'Data', function ( $q,$http, Data) {
  var self = this;
  self.GetVitalSignsbydate = function (UserId,StartDate,EndDate) {//UserId,PlanNo,StartDate,EndDate,ItemType,ItemCode
    var deferred = $q.defer();
    Data.VitalSigns.GetVitalSignsbydate({UserId:UserId,StartDate:StartDate,EndDate:EndDate}, function (data, headers) {//{UserId:UserId,PlanNo:PlanNo,StartDate:StartDate,EndDate:EndDate,ItemType:ItemType,ItemCode:ItemCode}
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

//ZXF 20151102
.factory('GetPlanchartInfo', ['$q', '$http', 'Data', function ( $q,$http, Data) {
  var self = this;
  self.GetchartInfobyPlanNo = function (arr) {//UserId,PlanNo,StartDate,EndDate,ItemType,ItemCode
    var deferred = $q.defer();
    Data.PlanchartInfo.GetchartInfobyPlanNo(arr, function (data, headers) {//{UserId:UserId,PlanNo:PlanNo,StartDate:StartDate,EndDate:EndDate,ItemType:ItemType,ItemCode:ItemCode}
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

//ZXF 20151102
.factory('GetPlanInfo', ['$q', '$http', 'Data', function ( $q,$http, Data) {
  var self = this;
  self.GetplaninfobyPlanNo = function (arr) {
    var deferred = $q.defer();
    Data.PlanInfo1.GetplaninfobyPlanNo(arr, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

// --------交流-苟玲----------------
.factory('MessageInfo', ['$q', '$http', 'Data',function ( $q,$http, Data) {
    var self = this;
    self.submitSMS = function (SendBy,Content,Receiver,piUserId,piTerminalName,piTerminalIP,piDeviceType) {
      var deferred = $q.defer();
      Data.MessageInfo.submitSMS({SendBy:SendBy,Content:Content,Receiver:Receiver,piUserId:piUserId,piTerminalName:piTerminalName,piTerminalIP:piTerminalIP,piDeviceType:piDeviceType}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
    };

    self.GetSMSDialogue = function (Reciever,SendBy,top,skip) {
      var deferred = $q.defer();
      Data.MessageInfo.GetSMSDialogue({Reciever:Reciever,SendBy:SendBy, $orderby:"SendDateTime desc", $top:top,$skip:skip}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    return self;
}])
//大师兄的弹窗业务service 可以随便调用
.factory('PageFunc', ['$ionicPopup', '$ionicScrollDelegate', '$ionicSlideBoxDelegate', '$ionicModal', '$timeout', function ($ionicPopup, $ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicModal, $timeout) {
  return {
    message: function (_msg, _time, _title) {
      var messagePopup = $ionicPopup.alert({
        title: _title || '消息',  // String. The title of the popup.
        // cssClass: '',  // String, The custom CSS class name.
        // subTitle: '',  // String (optional). The sub-title of the popup.
        template: _msg,  // String (optional). The html template to place in the popup body.
        // templateUrl: '',  // String (optional). The URL of an html template to place in the popup   body.
        okText: '确认',  // String (default: 'OK'). The text of the OK button.
        okType: 'button-energized'  // String (default: 'button-positive'). The type of the OK button.
      });

      if (_time) {
        $timeout(function () {
          messagePopup.close('Timeout!');
        }, _time);
      }

      // messagePopup.then(function(res) {
      //   console.log(res);
      // });

      // 这里返回Popup实例, 便于在调用的地方编程执行messagePopup.close()关闭alert; 需要的话还可以执行messagePopup.then(callback).
      return messagePopup;
    },
    confirm: function (_msg, _title) {
      var confirmPopup = $ionicPopup.confirm({
        title: _title,
        // cssClass: '',
        // subTitle: '',
        template: _msg,
        // templateUrl: '',
        cancelText: '取消', // String (default: 'Cancel'). The text of the Cancel button.
        cancelType: 'button-default', // String (default: 'button-default'). The type of the Cancel button.
        okText: '确定',
        okType: 'button-energized'
      });

      // confirmPopup.then(function(res) {  // true if press 'OK' button, false if 'Cancel' button
      //   console.log(res);
      // });
      
      // 这里返回Popup实例, 便于在调用的地方执行confirmPopup.then(callback).
      return confirmPopup;  
    },
    prompt: function (_msg, _title) {
      var promptPopup = $ionicPopup.prompt({
        title: _title,
        // cssClass: '',
        // subTitle: '',
        template: _msg,
        // templateUrl: '',
        inputType: 'password',  // String (default: 'text'). The type of input to use
        inputPlaceholder: _msg,  // String (default: ''). A placeholder to use for the input.
        cancelText: '取消', // String (default: 'Cancel'). The text of the Cancel button.
        cancelType: 'button-default', // String (default: 'button-default'). The type of the Cancel button.
        okText: '确定',
        okType: 'button-energized'
      });

      // promptPopup.then(function(res) {  // true if press 'OK' button, false if 'Cancel' button
      //   console.log(res);
      // });
      
      // 这里返回Popup实例, 便于在调用的地方执行promptPopup.then(callback).
      return promptPopup;  
    },
    edit: function (_msg, _title) {
      var promptPopup = $ionicPopup.prompt({
        title: _title,
        // cssClass: '',
        // subTitle: '',
        template: _msg,
        // templateUrl: '',
        inputType: 'text',  // String (default: 'text'). The type of input to use
        inputPlaceholder: _msg,  // String (default: ''). A placeholder to use for the input.
        cancelText: '取消', // String (default: 'Cancel'). The text of the Cancel button.
        cancelType: 'button-default', // String (default: 'button-default'). The type of the Cancel button.
        okText: '确定',
        okType: 'button-energized'
      });

      // promptPopup.then(function(res) {  // true if press 'OK' button, false if 'Cancel' button
      //   console.log(res);
      // });
      
      // 这里返回Popup实例, 便于在调用的地方执行promptPopup.then(callback).
      return promptPopup;  
    },     
    selection: function (_msg, _title, _res, $scope) {
      var selectionPopup = $ionicPopup.show({
        title: _title,
        // cssClass: '',
        // subTitle: '',
        template: _msg,
        // templateUrl: '',
        scope: $scope, // Scope (optional). A scope to link to the popup content. 这里的scope等于$scope, 可以通过$scope和popup页面的数据绑定
        buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
          text: '取消',
          type: 'button-default',
          onTap: function(e) {
            // e.preventDefault() will stop the popup from closing when tapped.
            // e.preventDefault();
            // 点击按钮的默认效果就是关闭popup, 只有加e.preventDefault()才会阻止关闭
          }
        }, {
          text: '确定',
          type: 'button-positive',
          onTap: function(e) {
            // Returning a value will cause the promise to resolve with the given value.
            // console.log($scope.ince.selected);  // 这里不能单纯用$scope.ince, 必须用对象
            // e.preventDefault();
            return $scope[_res].selected;  // 这里必须使用$scope, 文档中用scope是不对的; 不能单纯用$scope.ince, 必须用对象
          }
        }]
      });

      // selectionPopup.then(function(res) {  // true if press 'OK' button, false if 'Cancel' button
      //   console.log(res);
      // });
      
      // 这里返回Popup实例, 便于在调用的地方执行promptPopup.then(callback).
      return selectionPopup;  
    },
    viewer: function ($scope, images, $index) {
      $ionicModal.fromTemplateUrl('partials/modal/viewer.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.viewerModal = modal;
        $scope.viewerModal.show();

        $timeout(function () {  // 在这里初始化, 加$timeout在.show()完成后再初始化; 也可以放到'modal.shown'监听事件中初始化
          // $ionicSlideBoxDelegate.$getByHandle('viewer').slide($index);  // 用ion-slide-box的active-slide代替
          $scope.currentIndex = $index;
          $scope.slidesCount = $ionicSlideBoxDelegate.$getByHandle('viewer').slidesCount();
          // $ionicSlideBoxDelegate.$getByHandle('viewer').update();
          
          // console.log(tapTimeStamp);
        });  // 放在这里就不需要设置延时时间了
      });

      // console.log(tapTimeStamp);

      $scope.actions = $scope.actions || {};
      $scope.error = $scope.error || {};
      $scope.images = images;
      $scope.zoomMin = 1;
      $scope.zoomMax = 3;
      var tapTimeStamp;
      var exitTimeout;
      var tapInterval = 300;

      // Triggered in the modal to close it or zoom the image
      $scope.actions.exit = function ($event) {
        // console.log($event);
        
        if (tapTimeStamp && $event.timeStamp - tapTimeStamp < tapInterval) {
          $timeout.cancel(exitTimeout);
        }
        else {
          tapTimeStamp = $event.timeStamp;
          exitTimeout = $timeout(function () {
            $scope.viewerModal.remove()
            .then(function () {
              // $scope.viewerModal = null;
              // console.log(tapTimeStamp);
              // tapTimeStamp = null;
              // exitTimeout = null;
            });
          }, tapInterval);
        }
      };

      $scope.actions.zoom = function ($index) {
        // console.log('double-tap');
        var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + $index).getScrollPosition().zoom;
        if (zoomFactor === $scope.zoomMax) {
          $ionicScrollDelegate.$getByHandle('scrollHandle' + $index).zoomTo(1, true);  // 缩放到1
        }
        else {
          $ionicScrollDelegate.$getByHandle('scrollHandle' + $index).zoomBy(2, true);  // 乘以2
        }
      };

      $scope.actions.updateSlideStatus = function($index) {
        var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + $index).getScrollPosition().zoom;
        // console.log($ionicScrollDelegate.$getByHandle('scrollHandle' + $index).getScrollPosition());
        if (zoomFactor === $scope.zoomMin) {
          $ionicSlideBoxDelegate.enableSlide(true);
        } else {
          $ionicSlideBoxDelegate.enableSlide(false);
        }
      };

      $scope.actions.getIndex = function () {
        // $scope.slidesCount = $ionicSlideBoxDelegate.$getByHandle('viewer').slidesCount();
        $scope.currentIndex = $ionicSlideBoxDelegate.$getByHandle('viewer').currentIndex();
        // $scope.error.viewerError = '';
        // console.log($scope.currentIndex, $scope.slidesCount);
      };
    }
  };
}]);
