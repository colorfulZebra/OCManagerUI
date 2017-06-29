'use strict';

/**
 * Controller of the dashboard
 */
angular.module('basic')
  .controller('TenantCtrl', ['$rootScope', '$scope', 'Confirm', 'newconfirm', 'tenant', 'delconfirm', 'tenantchild', 'tree', 'tenantuser', 'tenantbsi', 'bsidata', 'user', 'serveinfo', 'Alert', 'service', 'absi',
    function ($rootScope, $scope, Confirm, newconfirm, tenant, delconfirm, tenantchild, tree, tenantuser, tenantbsi, bsidata, user, serveinfo, Alert, service, absi) {
      var thisheight = $(window).height() - 80;
      $('.tree-classic').height(thisheight);
      $scope.nodeId = tree[0].id;
      $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true,
        injectClasses: {
          ul: "a1",
          li: "a2",
          liSelected: "a7",
          iExpanded: "a3",
          iCollapsed: "a4",
          iLeaf: "a5",
          label: "a6",
          labelSelected: "a8"
        }
      }
      $scope.selected = tree[0];
      $scope.dataForTheTree = [];
      $scope.treemap = {};
      angular.forEach(tree, function (tre, i) {
        //console.log('tre', tre);
        tre.bsis = [];
        angular.forEach(absi, function (bsi, j) {
          if (tre.id === bsi.tenantId) {
            tre.bsis.push(bsi)
          }
        })
      })
      angular.forEach(tree, function (item, i) {
        $scope.treemap[item.id] = item
        $scope.treemap[item.id].children = [];
      })


      angular.forEach(tree, function (item, i) {
        if (item.parentId) {
          //console.log('$scope.treemap[item.parentId]', $scope.treemap[item.parentId]);
          if ($scope.treemap[item.parentId]) {
            $scope.treemap[item.parentId].children.push(item)
          } else {
            delete $scope.treemap[item.id].parentId
            $scope.dataForTheTree.push($scope.treemap[item.id])
          }
        } else {
          $scope.dataForTheTree.push($scope.treemap[item.id])
        }
      })
      angular.forEach($scope.dataForTheTree, function (tree, i) {
        cinf(tree)
      })
      function cinf(father) {
        angular.forEach(father.children, function (child, i) {
          cinf(child)
          angular.forEach(child.bsis, function (bsi, j) {
            father.bsis.push(bsi)
          })
        })

      }

      //console.log('$scope.dataForTheTree', $scope.dataForTheTree);
      var refresh = function (page) {
        var skip = (page - 1) * $scope.grid.bsisize;
        if ($scope.bsis.length) {
          $scope.bsisitem = $scope.bsis.slice(skip, skip + $scope.grid.bsisize);
        } else {
          $scope.bsisitem = [];
        }
      };
      var refreshuser = function (page) {
        var skip = (page - 1) * $scope.grid.usersize;
        if ($scope.users.length) {
          $scope.useritem = $scope.users.slice(skip, skip + $scope.grid.usersize);
        } else {
          $scope.useritem = [];
        }
      };
      $scope.$watch('grid.bsipage', function (newVal, oldVal) {
        if (newVal != oldVal) {
          refresh(newVal);
        }
      });
      $scope.$watch('grid.userpage', function (newVal, oldVal) {
        if (newVal != oldVal) {
          refreshuser(newVal);
        }
      });
      //获取所有用户列表
      user.query(function (data) {
        $scope.allUsers = data;
      }, function (err) {
        console.log('err', err);
      })
      ////筛选可授权用户
      var checkUsers = function (alluser, onlyUser) {
        for (var i = 0; i < alluser.length; i++) {
          for (var z = 0; z < onlyUser.length; z++) {
            if (alluser[i].id == onlyUser[z].userId) {
              alluser.splice(i, 1);
            }
          }
        }
        return alluser;
      }

      // 获取租户下用户列表
      var gettenantuser = function (id) {
        $scope.users = [];
        tenantuser.query({id: id}, function (users) {
          console.log('user', users);
          $scope.users = users;
          $scope.grid.usertotal = $scope.users.length;
          refreshuser(1)
        }, function (err) {

        });
      }
      /// 获取租户下的服务

      var getTenantServe = function (node) {
        //if (!node) {
        //  $scope.bsis = [];
        //
        //  tenantbsi.query({id: id}, function (bsis) {
        //    $scope.bsis = bsis;
        //    $scope.grid.bsitotal = $scope.bsis.length;
        //    checkServe($scope.servesArr, $scope.bsis);
        //    refresh(1);
        //    //console.log('bsi', bsis);
        //  }, function (err) {
        //
        //  })
        //}else {
          //alert(1)
          $scope.bsis=node.bsis;
          $scope.grid.bsitotal = $scope.bsis.length;
          checkServe($scope.servesArr, $scope.bsis);
          refresh(1);
          //console.log('bsi', bsis);
        //}

      }
      // 得到所有服务类型
      var loadserve = function (id,node) {
        service.query(function (data) {
          $scope.servesArr = [];
          angular.forEach(data, function (item, i) {
            var thisobj = {serviceTypeName: item.servicename, servesList: []};
            $scope.servesArr.push(thisobj);

          });
          getTenantServe(node);
        }, function (err) {
          console.log('err', err);
        })
      }

      var checkServe = function (allserve, onlyserve) {
        $scope.newServeArr = [];
        angular.forEach(allserve, function (item, i) {
          if (item.servesList.length > 0) {
            item.servesList = [];
          }
          angular.forEach(onlyserve, function (list, z) {
            if (item.serviceTypeName == list.serviceTypeName) {
              item.servesList.push(list);
            }
          })
        });
        angular.forEach($scope.servesArr, function (item, i) {
          if (item.servesList.length > 0) {
            $scope.newServeArr.push(item);
          }
        });
        console.log('$scope.newServeArr', $scope.newServeArr);
        console.log('$scope.servesArr', $scope.servesArr);
      }
      /// 获取租户下子公司列表
      var gerTenantChild = function (id) {
        $scope.childrens = [];
        tenantchild.query({id: id}, function (childrens) {
          console.log('child', childrens);
          $scope.childrens = childrens
        }, function (err) {

        })
      }
      ///页面初次加载;
      var fristLoad = function (id,node) {
        gettenantuser(id);
        loadserve(id,node);
        gerTenantChild(id);
      }
      fristLoad($scope.dataForTheTree[0].id,$scope.dataForTheTree[0]);
      /////获取租户信息
      var getUserInfo = function (id, node) {
        gettenantuser(id);
        //console.log(node);

        getTenantServe(node);
        gerTenantChild(id);

      }
      $scope.grid = {
        userpage: 1,
        usersize: 10,
        usertotal: 0,
        bsipage: 1,
        bsisize: 10,
        bsitotal: 0,
        showCompany: true,//展示子公司列表
        showProject: false,//展示子项目列表
        showChildnode: false,//展示子项目列表
        roleTitle: tree[1].name,
        treeId: ''
      };
      var roleDemoList = ['a10170cb-524a-11e7-9dbb-fa163ed7d0ae',
        'a1149421-524a-11e7-9dbb-fa163ed7d0ae',
        'a12a84d0-524a-11e7-9dbb-fa163ed7d0ae',
        'a13dd087-524a-11e7-9dbb-fa163ed7d0ae'
      ]
      $scope.roleDemoList = roleDemoList.slice(0, 1)
      ///访问信息

      $scope.checkInfo = function (id, name) {
        serveinfo.get({tenantId: id, serviceInstanceName: name}, function (res) {
          if (res.status.phase == 'Active') {
            newconfirm.open(res);
          } else {
            Alert.open('正在创建！');
          }

        }, function (err) {

        });

      }
      //用户授权
      $scope.userAuthorize = function () {
        var thisuser = checkUsers($scope.allUsers, $scope.users);
        Confirm.open(thisuser, $scope.roleDemoList, {
          oldUser: thisuser[0].username,
          oldRole: $scope.roleDemoList[0],
          oldUserId: $scope.users[0].userId,
          description: '',
          isAdd: true,
          nodeId: $scope.nodeId
        }).then(
          function (res) {
            $scope.users.push(res);
            refreshuser(1);
          }
        )
      }
      //修改用户授权
      $scope.updataUser = function (item) {
        Confirm.open($scope.users, $scope.roleDemoList, {
          oldUser: item.userName,
          oldRole: item.roleId,
          oldUserId: item.userId,
          description: item.userDescription,
          isAdd: false,
          nodeId: $scope.nodeId
        }).then(
          function (res) {
            console.log('res', res);
            angular.forEach($scope.users, function (item, i) {
              if (item.userId == res.userId) {
                item.roleId = res.roleId;
              }
            })
          }
        )
      }

      // 左侧导航切换
      $scope.showSelected = function (node) {
        $scope.grid.roleTitle = node.name;
        $scope.nodeIf = node;
        $scope.nodeId = node.id;
        $scope.newServeArr = [];
        getUserInfo(node.id, node);
        if (node.children.length > 0 && node.parentId) {
          $scope.grid.showCompany = false;
          $scope.grid.showProject = true;
          $scope.grid.showChildnode = false;
          $('.right-nav>li').eq(1).addClass('active').siblings().removeClass('active');
          $('.right-content>li').eq(1).show().siblings().hide();

        } else if (node.children.length > 0) {
          $scope.grid.treeId = 2
          $scope.roleDemoList = roleDemoList.slice(1, 2)
          $scope.grid.showCompany = true;
          $scope.grid.showProject = false;
          $scope.grid.showChildnode = false;
          $('.right-nav>li').eq(0).addClass('active').siblings().removeClass('active');
          $('.right-content>li').eq(0).show().siblings().hide();

        } else {
          $scope.roleDemoList = roleDemoList.slice(2)
          $scope.grid.showCompany = false;
          $scope.grid.showProject = false;
          $scope.grid.showChildnode = true;
          $('.right-nav>li').eq(2).addClass('active').siblings().removeClass('active');
          $('.right-content>li').eq(2).show().siblings().hide();
        }
      }
      //右侧tabel切换
      $(function () {
        $('.right-nav>li').click(function () {
          console.log($(this).index())
          var idx = $(this).index();
          $('.right-nav>li').eq(idx).addClass('active').siblings().removeClass('active');
          $('.right-content>li').eq(idx).show().siblings().hide();
        })
      })
      // 删除用户
      $scope.delUser = function (userId) {
        delconfirm.open('用户', $scope.nodeId, userId).then(
          function (res) {
            angular.forEach($scope.users, function (item, i) {
              if (item.userId == res.message) {
                $scope.users.splice(i, 1);
              }
            })
            refreshuser(1);
          }
        )
      }


      var chartsFun = function (sdata, pIdx, idx) {
        var used = parseInt(sdata.used);
        var size = parseInt(sdata.size);
        var num = parseInt(used / size * 100);
        var chartsobj = {
          options: {
            title: {
              text: ''
            },
            tooltip: {
              enabled: false
            },
            credits: {
              enabled: false
            },
            subtitle: {
              text: '<span style="color:#ff304a; font-size:16px;">' + num + '%</span>',
              style: {
                lineHeight: '20px'
              },
              align: 'center',
              verticalAlign: 'middle',
              x: 0,
              y: 5

            }
          },
          series: [{
            type: 'pie',
            colors: ['#ff304a', '#c6c6c6'],
            data: [
              ['已用', used],
              ['未使用', size - used]
            ],
            dataLabels: {
              enabled: false
            },
            innerSize: '80%'
          }],
          size: {
            height: 150,
            width: 150
          },

          func: function (chart) {
            //setup some logic for the chart
          }
        }
        $scope.newServeArr[pIdx].servesList[idx].charsArr.push({'chartsobj': chartsobj, 'name': sdata.name});
      }
      $scope.toggleServeList = function (pIdx, idx, serveObj) {
        if ($scope.newServeArr[pIdx].servesList[idx].isshow) {
          $scope.newServeArr[pIdx].servesList[idx].isshow = false;
        } else {
          //bsidata.get({id: serveObj.tenantId, name: serveObj.instanceName}, function (sdata) {
          bsidata.get({id: 'san', name: 'n4j'}, function (sdata) {
            $scope.newServeArr[pIdx].servesList[idx].charsArr = [];
            for (var i = 0; i < sdata.items.length; i++) {
              chartsFun(sdata.items[i], pIdx, idx)
            }
          }, function (err) {
            console.log('sbsierr', err);
          })


          $scope.newServeArr[pIdx].servesList[idx].isshow = true;
        }
      }
      $scope.toggleServe = function (idx) {
        if ($scope.newServeArr[idx].isshow) {
          $scope.newServeArr[idx].isshow = false;
        } else {
          $scope.newServeArr[idx].isshow = true;
        }
      }
    }]);
