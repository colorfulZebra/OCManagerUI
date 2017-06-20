/**
 * Created by sorcerer on 2017/6/7.
 */
"use strict";
angular.module('basic.services', ['ngResource'])
  .service('Cookie', [function () {
    this.set = function (key, val, expires) {
      var date = new Date();
      date.setTime(date.getTime() + expires);
      document.cookie = key + "=" + val + "; expires=" + date.toUTCString();
    };
    this.get = function (key) {
      var reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
      var arr = document.cookie.match(reg);
      if (arr) {
        return (arr[2]);
      }
      return null;
    };
    this.clear = function (key) {
      this.set(key, "", -1);
    };
  }])
  .factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', function ($rootScope, $q, AUTH_EVENTS) {
    var CODE_MAPPING = {
      401: AUTH_EVENTS.loginNeeded,
      403: AUTH_EVENTS.httpForbidden,
      419: AUTH_EVENTS.loginNeeded,
      440: AUTH_EVENTS.loginNeeded
    };
    return {
      request: function (config) {
        if (/^\/login/.test(config.url)) {
          return config;
        }
        if (/^\/signin/.test(config.url)) {
          return config;
        }
        //$rootScope.region=
        //var tokens = Cookie.get('df_access_token');
        //var regions = Cookie.get('region');
        //var token = '';
        ////console.log(tokens);
        //
        //if (tokens && regions) {
        //  var tokenarr = tokens.split(',');
        //  var region = regions.split('-')[2];
        //  //if (/^\/lapi\/v1\/orgs/.test(config.url)) {
        //  //    console.log(config.url);
        //  //}
        //
        //  if (/^\/lapi\/v1\/orgs/.test(config.url) || /^\/oapi/.test(config.url) || /^\/api/.test(config.url) || /^\/payment/.test(config.url) || /^\/v1\/repos/.test(config.url)) {
        //
        //    token = tokenarr[region - 1];
        //  } else {
        //    token = tokenarr[0];
        //  }
        //
        //  //console.log('tokenarr', tokenarr[region-1]);
        //} else {
        //  //console.log('token错误');
        //}
        //console.log(tokens,token, regions);
        //if (config.headers && token) {
        //  config.headers["Authorization"] = "Bearer " + token;
        //}
        //
        //if (/^\/hawkular/.test(config.url)) {
        //  config.headers["Hawkular-Tenant"] = $rootScope.namespace;
        //}
        //if (/^\/registry/.test(config.url)) {
        //  var Auth = localStorage.getItem("Auth")
        //  config.headers["Authorization"] = "Basic " + Auth;
        //}
        //if (config.method == 'PATCH') {
        //  config.headers["Content-Type"] = "application/merge-patch+json";
        //}
        //console.log('config.url', config.url);
        $rootScope.loading = true;
        return config;
      },
      requestError: function (rejection) {
        $rootScope.loading = false;
        return $q.reject(rejection);
      },
      response: function (res) {
        $rootScope.loading = false;
        return res;
      },
      responseError: function (response) {
        //alert(11)
        $rootScope.loading = false;
        var val = CODE_MAPPING[response.status];
        if (val) {
          $rootScope.$broadcast(val, response);
        }
        return $q.reject(response);
      }
    };
  }])
  .service('Confirm', ['$uibModal', function ($uibModal) {
    this.open = function (userList, roleList, nameobj) {
      return $uibModal.open({
        templateUrl: 'views/tpl/confirm.html',
        size: 'default',
        controller: ['$scope', '$uibModalInstance','cGtenantuser', function ($scope, $uibModalInstance,cGtenantuser) {
          $scope.userList = userList;
          $scope.roleList = roleList;
          $scope.newUser = nameobj.oldUser;
          $scope.newRole = nameobj.oldRole;
          $scope.newUserId = nameobj.oldUserId;
          $scope.description = nameobj.description;
          $scope.isAdd = nameobj.isAdd;

          $scope.ok = function () {
            if($scope.isAdd){
              cGtenantuser.put({id:nameobj.nodeId},{
                "userId": $scope.newUserId,
                "roleId": $scope.newRole
              }, function (res) {
                $uibModalInstance.dismiss();
              })
            }else{
              cGtenantuser.put({id:nameobj.nodeId},{
                "userId": $scope.newUserId,
                "roleId": $scope.newRole
              }, function (res) {
                $uibModalInstance.dismiss();
              })
            }
            $uibModalInstance.close(true);
          };
          // 选择用户
          $scope.changeUser = function (name,id) {
            $scope.newUser = name;
            $scope.newUserId = id;
          }
          // 选择角色
          $scope.changeRole = function (id) {
            $scope.newRole = id;
          }
          $scope.cancel = function () {
            $uibModalInstance.dismiss();
          };
        }]
      }).result;
    };
  }])
  .service('newconfirm', ['$uibModal', function ($uibModal) {
    this.open = function (datacon) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/tpl/newconfirm.html',
        size: 'default',
        controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {


          $scope.con = datacon;

          $scope.cancel = function () {
            $uibModalInstance.dismiss();
          };
          $scope.ok = function () {
            $uibModalInstance.close(true);
          };
        }]
      }).result;
    };
  }]).service('delconfirm', ['$uibModal', function ($uibModal) {
    this.open = function (title,roleId, userId) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/tpl/delConfirm.html',
        size: 'default',
        controller: ['$scope', '$uibModalInstance','deltenantuser', function ($scope, $uibModalInstance,deltenantuser) {


          $scope.title = title;
          $scope.userId = userId;

          $scope.cancel = function () {
            $uibModalInstance.dismiss();
          };
          $scope.ok = function () {
            deltenantuser.delete({id:roleId,userId:userId},{}, function (res) {
              $uibModalInstance.dismiss();
            })
          };
        }]
      }).result;
    };
  }])
  //用户管理 -  添加用户
  .service('user_Confirm', ['$uibModal', function ($uibModal) {
    this.open = function (datacon) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/tpl/user_Confirm.html',
        size: 'default',
        controller: ['$scope', '$uibModalInstance', 'user', function ($scope, $uibModalInstance, user) {
          $scope.input = {
            username: '',
            email: '',
            description: ''
          }
          $scope.error = {
            namenull: false,
            emailnull: false
          }
          $scope.con = datacon;
          $scope.$watch('input', function (n, o) {
            if (n === o) {
              return
            }
            if (n.username && n.username.length > 0) {
              console.log('n', n);
              $scope.error.namenull = false
            }
            if (n.email && n.email.length > 0) {
              //console.log('n', n);
              $scope.error.emailnull = false
            }

          }, true)
          $scope.cancel = function () {
            $uibModalInstance.dismiss();
          };

          $scope.ok = function () {
            if ($scope.input.username === '' && $scope.input.email === '') {
              $scope.error.namenull = true;
              $scope.error.emailnull = true;
              return
            }
            if ($scope.input.username === '') {
              $scope.error.namenull = true;
              return
            }
            if ($scope.input.email === '') {
              $scope.error.emailnull = true;
              return
            }
            //console.log('$scope.input', $scope.input);
            user.create($scope.input, function (data) {
              $uibModalInstance.close(true);
            }, function (err) {

            })

          };
        }]
      }).result;
    };
  }])
  //用户管理 -  修改
  .service('user_change_Confirm', ['$uibModal', function ($uibModal) {
    this.open = function (datacon) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/tpl/user_change_Confirm.html',
        size: 'default',
        controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {


          $scope.con = datacon;

          $scope.cancel = function () {
            $uibModalInstance.dismiss();
          };
          $scope.ok = function () {
            $uibModalInstance.close(true);
          };
        }]
      }).result;
    };
  }])
  //用户管理 -  删除
  .service('user_del_Confirm', ['$uibModal', function ($uibModal) {
    this.open = function (name,id) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/tpl/user_del_Confirm.html',
        size: 'default',
        controller: ['$scope', '$uibModalInstance','user', function ($scope, $uibModalInstance,user) {


          $scope.con = name;

          $scope.cancel = function () {
            $uibModalInstance.dismiss();
          };
          $scope.ok = function () {
            console.log('id', id);
            user.delete({id:id}, function (data) {

              $uibModalInstance.close(true);
            }, function (err) {

            })

          };
        }]
      }).result;
    };
  }])

  //服务管理 -  添加
  .service('service_Confirm', ['$uibModal', function ($uibModal) {
    this.open = function (datacon) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/tpl/service_Confirm.html',
        size: 'default',
        controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
          $scope.input = {
            servicename: '',
            serviceuser:'',
            servicepassword:'',
            serviceurl:''

          }
          $scope.error = {
            servicenamenull: false,
            serviceusernull:false,
            servicepasswordnull:false,
            serviceurlnull:false
          }

          $scope.con = datacon;
          $scope.$watch('input', function (n, o) {
            if (n === o) {
              return
            }
            if (n.servicename && n.servicename.length > 0) {
              console.log('n', n);
              $scope.error.servicenamenull = false
            }
            if (n.serviceuser && n.serviceuser.length > 0) {
              console.log('n', n);
              $scope.error.serviceusernull = false
            }
            if (n.servicepassword && n.servicepassword.length > 0) {
              console.log('n', n);
              $scope.error.servicepasswordnull = false
            }
            if (n.serviceurl && n.serviceurl.length > 0) {
              console.log('n', n);
              $scope.error.serviceurlnull = false
            }

          }, true)

          $scope.cancel = function () {
            $uibModalInstance.dismiss();
          };
          $scope.ok = function () {
            if ($scope.input.servicename === '' && $scope.input.serviceuser === '' && $scope.input.servicepassword === '' && $scope.input.serviceurl === '') {
              $scope.error.servicenamenull = true;
              $scope.error.serviceusernull = true;
              $scope.error.servicepasswordnull = true;
              $scope.error.serviceurlnull = true;
              return
            }
            if ($scope.input.servicename === '') {
              $scope.error.servicenamenull = true;
              return
            }
            if ($scope.input.serviceuser === '') {
              $scope.error.serviceusernull = true;
              return
            }
            if ($scope.input.servicepassword === '') {
              $scope.error.servicepasswordnull = true;
              return
            }
            if ($scope.input.serviceurl === '') {
              $scope.error.serviceurlnull = true;
              return
            }
            $uibModalInstance.close(true);





          };







        }]
      }).result;
    };
  }])

  //服务管理 -  修改
  .service('service_change_Confirm', ['$uibModal', function ($uibModal) {
    this.open = function (datacon) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/tpl/service_change_Confirm.html',
        size: 'default',
        controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {


          $scope.con = datacon;

          $scope.cancel = function () {
            $uibModalInstance.dismiss();
          };
          $scope.ok = function () {
            $uibModalInstance.close(true);
          };
        }]
      }).result;
    };
  }])

  //服务管理 -  删除
  .service('service_del_Confirm', ['$uibModal', function ($uibModal) {
    this.open = function (datacon) {
      return $uibModal.open({
        backdrop: 'static',
        templateUrl: 'views/tpl/service_del_Confirm.html',
        size: 'default',
        controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {


          $scope.con = datacon;

          $scope.cancel = function () {
            $uibModalInstance.dismiss();
          };
          $scope.ok = function () {
            $uibModalInstance.close(true);
          };
        }]
      }).result;
    };
  }])
