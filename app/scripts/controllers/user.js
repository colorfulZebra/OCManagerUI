'use strict';

/**
 * Main Controller
 */
angular.module('basic')
  .controller('UserCtrl', ['$rootScope', '$scope', 'user', 'user_Confirm', 'user_change_Confirm', 'user_del_Confirm', function ($rootScope, $scope, user, user_Confirm, user_change_Confirm, user_del_Confirm) {

    function loaduser() {
      user.query(function (data) {
        console.log('data', data);
        $scope.users = data;
      }, function (err) {
        console.log('err', err);
      })
    }
    loaduser()
    //用户管理-添加
    $scope.adduser = function () {
      user_Confirm.open().then(function () {
        loaduser()
      })
    };
//用户管理-修改
    $scope.changeuser = function () {
      user_change_Confirm.open();
    };
//用户管理-删除
    $scope.deluser = function (name,id) {

      user_del_Confirm.open(name,id).then(function () {
        loaduser()
      })
    };
  }]);
