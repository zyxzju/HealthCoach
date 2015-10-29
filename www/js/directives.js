angular.module('ionicApp.directives', [])

//隐藏tab栏
.directive('hideTabs',function($rootScope){ //XJZ

    return {

        restrict:'AE',
        link:function($scope){

            $rootScope.hideTabs = 'tabs-item-hide';
            $scope.$on('$destroy',function(){

                $rootScope.hideTabs = ' ';

            })
        }
    }
});
