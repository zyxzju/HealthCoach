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

  baseUrl: 'http://10.12.43.72:9000/Api/v1/',  //RESTful 服务器
  ImageAddressIP: "http://121.43.107.106:8088",
  ImageAddressFile : "/PersonalPhoto",
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
      myTrialPost:{method:'POST',params:{route:'DoctorInfo'}, timeout:10000},
      getUID:{method:'GET',params:{route:'UID', Type: '@Type', Name: '@Name'}, timeout:10000},
      UID:{method:'GET',params:{route:'UID'},timeout:10000},
			Activition:{method:'POST',params:{route:'Activition'},timeout:10000},//用户注册后激活
      GetPatientsList:{method:'GET',params:{route:'GetPatientsList',DoctorId:'@DoctorId',ModuleType:'@ModuleType',Plan:'@Plan',Compliance:'@Compliance',Goal:'@Goal'},timeout:20000},
      BasicInfo:{method:'GET',params:{route:'@route'},timeout:10000}, 
      PatientBasicInfo:{method:'POST',params:{route:'BasicInfo'},timeout:10000},
      PatientBasicDtlInfo:{method:'POST',params:{route:'BasicDtlInfo'},timeout:10000},
      setPatientDetailInfo:{method:'POST',params:{route:'BasicDtlInfo'},timeout:10000}
		})
	}
	var Service = function(){
		return $resource(CONFIG.baseUrl + ':path/:route',{
			path:'Service',
		},{
            sendSMS:{method:'POST',headers:{token:getToken()}, params:{route: 'sendSMS',phoneNo:'@phoneNo',smsType:'@smsType'}, timeout: 10000},
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
	serve.abort = function($scope){
		abort.resolve();
        $interval(function () {
        abort = $q.defer();
        serve.Users = Users(); 
        serve.Service = Service();
        serve.Dict = Dict();
        serve.BasicInfo = BasicInfo();
        serve.HJZYYID = HJZYYID();
        serve.ClinicalInfoList = ClinicalInfoList();
        serve.ClinicInfoDetail = ClinicInfoDetail();
        serve.examinfo = examinfo();
        serve.diaginfo = diaginfo();
        serve.druginfo = druginfo();
        }, 0, 1);  
	}
    serve.Users = Users();
    serve.Service = Service();
    serve.Dict = Dict();
    serve.BasicInfo = BasicInfo();
    serve.HJZYYID = HJZYYID();
    serve.ClinicalInfoList = ClinicalInfoList();
    serve.ClinicInfoDetail = ClinicInfoDetail();
    serve.examinfo = examinfo();
    serve.diaginfo = diaginfo();
    serve.druginfo = druginfo();
    return serve;
}])

.factory('userservice',['$http','$q' , 'Storage','Data', function($http,$q,Storage,Data){	 //XJZ
	var serve = {};
    var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

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
	   		console.log(err.data);
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


    //var passReg1=/([a-zA-Z]+[0-9]+|[0-9]+[a-zA-Z]+)/;
    //var passReg2=/^.[A-Za-z0-9]+$/;
	// var isPassValid = function(pass){
		// if(pass.length >18  ||  pass.length<6){
			// return 4;
		// }else if(!passReg1.test(pass)){
			// return 5;
		// }else if(!passReg2.test(pass)){
            // return 6;
		// }else{
			// return 0;
		// }
	// }
	// serve.isTokenValid = function(){
		// var isToken=Storage.get('token');
		// if(isToken==null){
			// return 0;
		// }else{
			// $http({
				// method:'GET',
				// url:'',
				// headers:{token:isToken},
			// })
			// .success(function(data,status,headers,config){

			// })
			// .error(function(data,status,headers,config){

			// });
		// }
	// }

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
    serve.GetPatientsList = function(_DoctorId,_ModuleType,_Plan,_Compliance,_Goal){
        var deferred = $q.defer();   
        Data.Users.GetPatientsList({DoctorId:_DoctorId,ModuleType:_ModuleType,Plan:_Plan,Compliance:_Compliance,Goal:_Goal},
        function(data,hearders,status){ 
            deferred.resolve(data);
        },
        function(err){
            deferred.reject(err);
        });
        return deferred.promise;
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
//照相机服务 LRZ
.factory('Camera', ['$q','$cordovaCamera','CONFIG', '$cordovaFileTransfer',function($q,$cordovaCamera,CONFIG,$cordovaFileTransfer) { //LRZ
 
  return {
    getPicture: function() {

      var options = { 
          quality : 75, 
          destinationType : 0, 
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
          imgURI = "data:image/jpeg;base64," + imageData;
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
          destinationType : 0, 
          sourceType : 0, 
          allowEdit : true,
          encodingType: 0,
          targetWidth: 300,
          targetHeight: 300
      };
        //从相册获得的照片不能被裁减 调研~
     var q = $q.defer();
      $cordovaCamera.getPicture(options).then(function(imageData) {
          imgURI = "data:image/jpeg;base64," + imageData;
          // console.log("succeed" + imageData);
          q.resolve(imgURI);
      }, function(err) {
          // console.log("sth wrong");
          imgURI = undefined;
          q.resolve(err);
      });      
      return q.promise; //return a promise      
    },

    uploadPicture : function(imgURI){
        // document.addEventListener('deviceready', onReadyFunction,false);
        // function onReadyFunction(){
          var uri = encodeURI(CONFIG.ImageAddressIP + "/upload.php");
          var options = {
            fileKey : "file",
            fileName : "ZXF" + ".jpg",
            chunkedMode : true,
            mimeType : "image/jpeg"
          };
          var q = $q.defer();
          console.log("jinlaile");
          $cordovaFileTransfer.upload(uri,imgURI,options)
            .then( function(r){
              console.log("Code = " + r.responseCode);
              console.log("Response = " + r.response);
              console.log("Sent = " + r.bytesSent);
              q.resolve(r);        
            }, function(err){
              alert("An error has occurred: Code = " + error.code);
              console.log("upload error source " + error.source);
              console.log("upload error target " + error.target);
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

  uploadPicture2: function(imgURI){
    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
   // as soon as this function is called FileTransfer "should" be defined
      console.log(FileTransfer);
      console.log(File);
    }
  }


}
  
}])



.factory('Patients',function(){ //LRZ
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
    }
  };
})

//用户类LRZ 调用DATA 主要负责和服务器互动 会改
.factory('Users', ['$q', '$http', 'Data','Storage','$resource','CONFIG',function ($q, $http, Data,Storage,$resource,CONFIG) { //LRZ
  var self = this;

  self.myTrial = function (DoctorInfo) {
    var deferred = $q.defer();
    Data.Users.myTrialPost(DoctorInfo, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  self.myTrial2 = function (userid) {
    
    // Storage.set(13131313,userid);
    //由于API中要求有userID变量 DATA 中只能写死 所以动态生成一个方法
    var temp = $resource(CONFIG.baseUrl + ':path/:uid/:route', {
      path:'Users',  
    }, {
      myTrialGET: {method:'GET', params:{uid: userid,route:'DoctorInfo'}, timeout: 10000}
    });


    var deferred = $q.defer();
    temp.myTrialGET({}, function (data, headers) {
      console.log("获得了数据"+data)
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
  
  //TDY 20151030
  self.getYesNoType = function(){
     var deferred = $q.defer();
/*     do
     {
*/ 
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
  self.BasicInfo = function (arr){
    var deferred = $q.defer();
    Data.Users.BasicInfo(arr,function (data,headers) {
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
  self.BasicDtlInfo = function(arr){
    var deferred = $q.defer();
    Data.Users.BasicDtlInfo(arr,function (data,headers) {
    deferred.resolve(data);
    }, function (err) {
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
  self.GetNo = function(_NumberingType,_TargetDate){
    var deferred = $q.defer();
    Data.Dict.GetNo({NumberingType:_NumberingType,TargetDate:_TargetDate},function (data,headers) {
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
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