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
			Activition:{method:'POST',params:{route:'Activition'},timeout:10000} //用户注册后激活
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
	serve.abort = function($scope){
		abort.resolve();
        $interval(function () {
        abort = $q.defer();
        serve.Users = Users(); 
        serve.Service = Service();
        }, 0, 1);  
	}
    serve.Users = Users();
    serve.Service = Service();
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

    return self;
}]);