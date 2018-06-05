'use strict';
/**
 * Controller of the dashboard
 */
angular.module('basic')
  .controller('TenantCtrl', ['ocdpservices', 'addtenantapi', 'bsLimit', 'smallAlert', 'addBsi', 'deletebsi', 'delbsiconfirm', 'creatbsi', 'getplan', 'updateinstance', 'addserve_Confirm', 'tenantname', 'tenant_del_Confirm', 'addTenant', 'updateTenant_dialog', '$rootScope', '$scope', 'Confirm', 'newconfirm', 'tenant', 'delconfirm', 'tenantchild', 'tree', 'tenantuser', 'tenantbsi', 'bsidata', 'user', 'serveinfo', 'Alert', 'service', 'absi', 'Cookie', 'userole', '$state', 'userinfo', 'infoconfirm', 'getdfbs', '_',
    function (ocdpservices, addtenantapi, bsLimit, smallAlert, addBsi, deletebsi, delbsiconfirm, creatbsi, getplan, updateinstance, addserve_Confirm, tenantname, tenant_del_Confirm, addTenant, updateTenant_dialog, $rootScope, $scope, Confirm, newconfirm, tenant, delconfirm, tenantchild, tree, tenantuser, tenantbsi, bsidata, user, serveinfo, Alert, service, absi, Cookie, userole, $state, userinfo, infoconfirm, getdfbs, _) {
      Array.prototype.unique = function () {
        let res = [this[0]];
        for (let i = 1; i < this.length; i++) {
          let repeat = false;
          for (let j = 0; j < res.length; j++) {
            if (this[i] === res[j]) {
              repeat = true;
              break;
            }
          }
          if (!repeat) {
            res.push(this[i]);
          }
        }
        return res;
      };

      let left_by_block = function () {
        let thisheight = $(window).height() - 80;
        $('.tree-classic').css('min-height', thisheight);
      };
      $scope.looklog = function (name) {
        userinfo.query({name: name, id: Cookie.get('tenantId')}, function (res) {
          infoconfirm.open(res);
        });
      };
      $(window).resize(function () {
        left_by_block();
      });
//      let out = ["hdfs", "hbase", "hive", "mapreduce", "spark", "kafka"];
      let out = [];
      ocdpservices.query({}, function (res) {
        out = res;
      });

      $(function () {
        left_by_block();
      });
      if (tree[0] && tree[0].id) {
        $scope.nodeId = tree[0].id;
      }
      if (tree && tree.length === 0) {
        $state.go('home.permission');
      }
      $scope.treeOptions = {
        nodeChildren: "children",
      };
      $scope.ismember = true;
      let allbsi = [];
      angular.forEach(absi, function (bsi) {
        if (bsi.status !== 'Failure') {
          allbsi.push(bsi);
        }
      });
      absi = angular.copy(allbsi);
      angular.forEach(tree, function (tre) {
        tre.bsis = [];
        angular.forEach(absi, function (bsi) {
          if (tre.id === bsi.tenantId) {
            tre.bsis.push(bsi);
          }
        });
      });
      angular.forEach(absi, function (bsi) {
        if (bsi.quota && typeof bsi.quota === "string") {
          bsi.quota = JSON.parse(bsi.quota);
        }
      });
      angular.forEach(absi, function (bsi) {
        if (bsi.quota) {
          angular.forEach(bsi.quota, function (quota, k) {
            if (k && k === 'instance_id') {
              bsi.instance_id = quota;
              delete bsi.quota[k];
            }
          });
        }
      });
      let refreshtenant = function (page) {
        let skip = (page - 1) * $scope.grid.tenantsize;
        if ($scope.childrens.length) {
          $scope.childrensitem = $scope.childrens.slice(skip, skip + $scope.grid.tenantsize);
        } else {
          $scope.childrensitem = [];
        }
        $(window).scrollTop(0);
      };
      let refresh = function (page) {
        let skip = (page - 1) * $scope.grid.bsisize;
        if ($scope.bsis.length) {
          $scope.bsisitem = $scope.bsis.slice(skip, skip + $scope.grid.bsisize);
        } else {
          $scope.bsisitem = [];
        }
        $(window).scrollTop(0);
      };
      let refreshuser = function (page) {
        let skip = (page - 1) * $scope.grid.usersize;
        if ($scope.users.length) {
          $scope.useritem = $scope.users.slice(skip, skip + $scope.grid.usersize);
        } else {
          $scope.useritem = [];
        }
        $(window).scrollTop(0);
      };
      $scope.$watch('grid.tenantpage', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          refreshtenant(newVal);
        }
      });
      $scope.$watch('grid.bsipage', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          refresh(newVal);
        }
      });
      $scope.$watch('grid.userpage', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          refreshuser(newVal);
        }
      });
      user.query(function (data) {
        $scope.allUsers = data;
      });
      let checkUsers = function (allusers, onlyUser) {
        let alluser = angular.copy(allusers);
        let canadd = [];
        angular.forEach(alluser, function (auser) {
          angular.forEach(onlyUser, function (ouser) {
            if (auser.id === ouser.userId) {
              auser.canadd = true;
            }
          });
        });
        angular.forEach(alluser, function (auser) {
          if (!auser.canadd) {
            canadd.push(auser);
          }
        });
        return canadd;
      };
      let gettenantuser = function (id) {
        $scope.users = [];
        tenantuser.query({id: id}, function (users) {
          $scope.users = users;
          $scope.grid.usertotal = $scope.users.length;
          $scope.grid.userpage = 1;
          refreshuser(1);
        });
      };
      let checkServe = function (allserve, onlyserve) {
        $scope.newServeArr = [];
        angular.forEach(allserve, function (item) {
          if (item.servesList.length > 0) {
            item.servesList = [];
          }
          angular.forEach(onlyserve, function (list) {
            if (item.serviceName && list.serviceName && item.serviceName.toUpperCase() === list.serviceName.toUpperCase()) {
              item.servesList.push(list);
            }
          });
        });
        angular.forEach($scope.servesArr, function (item) {
          if (item.servesList.length > 0) {
            $scope.newServeArr.push(item);
          }
        });
      };
      let getTenantServe = function (node) {
        tenantbsi.query({id: node.id}, function (bsis) {
          $scope.bsis = bsis;
          $scope.grid.bsitotal = $scope.bsis.length;
          checkServe($scope.servesArr, $scope.bsis);
          refresh(1);
        });
      };
      let loadserve = function (id, node) {
        service.query(function (data) {
          $scope.servesArr = [];
          angular.forEach(data, function (item) {
            let thisobj = {serviceName: item.servicename, servesList: []};
            $scope.servesArr.push(thisobj);
          });
          getTenantServe(node);
        });
      };
      let gerTenantChild = function (id) {
        $scope.childrens = [];
        tenantchild.query({name: Cookie.get("username"), id: id}, function (childrens) {
          $scope.childrens = childrens;
          $scope.grid.tenanttotal = $scope.childrens.length;
          refreshtenant(1);
        });
      };
      $scope.grid = {
        userpage: 1,
        usersize: 10,
        usertotal: 0,
        bsipage: 1,
        bsisize: 10,
        bsitotal: 0,
        tenantpage: 1,
        tenantsize: 8,
        tenanttotal: 0,
        showCompany: true, showProject: false, showChildnode: false, showbsi: false,
        roleTitle: tree[0] ? tree[0].name : '',
        treeId: '',
      };

      function getUserInfo(id, node) {
        gettenantuser(id);
        getTenantServe(node);
        gerTenantChild(id);
      }

      let roleDemoList =
        [
          'a10170cb-524a-11e7-9dbb-fa163ed7d0ae',
          'a1149421-524a-11e7-9dbb-fa163ed7d0ae',
          'a12a84d0-524a-11e7-9dbb-fa163ed7d0ae',
          'a13dd087-524a-11e7-9dbb-fa163ed7d0ae'
        ];
      $scope.roleDemoList = roleDemoList.slice(0, 1);
      $scope.checkInfo = function (id, name) {
        serveinfo.get({tenantId: id, serviceInstanceName: name}, function (res) {
          if (res.status.phase !== 'Provisioning') {
            let isout = false;
            angular.forEach(out, function (item) {
              if (item === res.spec.provisioning.backingservice_name.toLocaleLowerCase()) {
                isout = true;
              }
            });
            if (!isout) {
              newconfirm.open(res.spec.provisioning.credentials, res.status.phase);
            } else {
              if (res.spec.binding) {
                if ($scope.isroleId && res.spec.binding.length > 0) {
                  if ($scope.isroleId === 'a13dd087-524a-11e7-9dbb-fa163ed7d0ae' || $scope.isroleId === 'a12a84d0-524a-11e7-9dbb-fa163ed7d0ae') {
                    angular.forEach(res.spec.binding, function (item, i) {
                      if (item.bind_hadoop_user === Cookie.get("username")) {
                        newconfirm.open(res.spec.binding[i].credentials, res.status.phase);
                      }
                    });
                  } else if ($scope.isroleId === 'a1149421-524a-11e7-9dbb-fa163ed7d0ae' || $scope.isroleId === 'a10170cb-524a-11e7-9dbb-fa163ed7d0ae') {
                    newconfirm.open(res.spec.binding[0].credentials, res.status.phase);
                  }
                } else {
                  Alert.open('没有绑定！');
                }
              } else {
                Alert.open('没有绑定！');
              }
            }
          } else {
            Alert.open('正在创建！');
          }
        });
      };
      let ischengyuan = function (id) {
        userole.get({id: id, name: Cookie.get('username')}, function (data) {
          $scope.ismember = !(data.roleId && data.roleId !== 'a13dd087-524a-11e7-9dbb-fa163ed7d0ae');
          if (data.roleId) {
            $scope.isroleId = data.roleId;
            $scope.isrold = true;
          } else {
            $scope.isrold = false;
          }
        });
      };
      $scope.userAuthorize = function () {
        let thisuser = checkUsers($scope.allUsers, $scope.users);
        if (thisuser[0]) {
          Confirm.open(thisuser, $scope.roleDemoList, {
            oldUser: thisuser[0].username,
            oldRole: $scope.roleDemoList[0],
            oldUserId: thisuser[0].id,
            description: '',
            isAdd: true,
            nodeId: $scope.nodeId
          }).then(function () {
            ischengyuan($scope.nodeId);
            gettenantuser($scope.nodeId);
          });
        } else {
          Alert.open('所有用户已授权！');
        }
      };
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
            ischengyuan($scope.nodeId);
            angular.forEach($scope.users, function (item) {
              if (item.userId === res.userId) {
                item.roleId = res.roleId;
              }
            });
          }
        );
      };
      $(function () {
        $('.right-nav>li').click(function () {
          let idx = $(this).index();
          $('.right-nav>li').eq(idx).addClass('active').siblings().removeClass('active');
          $('.right-content>li').eq(idx).show().siblings().hide();
        });
      });
      $scope.delUser = function (userId, username) {
        delconfirm.open('用户', $scope.nodeId, userId, username).then(function (res) {
            angular.forEach($scope.users, function (item, i) {
              if (item.userId === res.message) {
                $scope.users.splice(i, 1);
              }
            });
            $scope.grid.usertotal = $scope.users.length;
            $scope.grid.userpage = 1;
            refreshuser(1);
          }
        );
      };
      let chartsFun = function (sdata, pIdx, idx) {
        let used = parseInt(sdata.used);
        let size = parseInt(sdata.size);
        let num = parseInt(used / size * 100);
        let chartsobj = {
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
          }
        };
        $scope.newServeArr[pIdx].servesList[idx].charsArr.push({'chartsobj': chartsobj, 'name': sdata.name});
      };
      $scope.toggleServeList = function (pIdx, idx, serveObj) {
        if ($scope.newServeArrs[pIdx].servesList[idx].isshow) {
          $scope.newServeArrs[pIdx].servesList[idx].isshow = false;
        } else {
          bsidata.get({id: serveObj.tenantId, name: serveObj.instanceName}, function (sdata) {
            $scope.newServeArrs[pIdx].servesList[idx].charsArr = [];
            $scope.newServeArrs[pIdx].servesList[idx].showused = sdata.items;
            for (let i = 0; i < sdata.items.length; i++) {
              chartsFun(sdata.items[i], pIdx, idx);
            }
          });
          $scope.newServeArrs[pIdx].servesList[idx].isshow = true;
        }
      };
      $scope.toggleServe = function (idx) {
        $scope.newServeArrs[idx].isshow = !$scope.newServeArrs[idx].isshow;
      };

      function ziyuan(bsis) {
        service.query(function (data) {
          $scope.servesArrs = [];
          $scope.newServeArrs = [];
          angular.forEach(data, function (item) {
            let thisobj = {serviceName: item.servicename, servesList: [], isshow: false};
            $scope.servesArrs.push(thisobj);
          });
          angular.forEach($scope.servesArrs, function (item) {
            if (item.servesList.length > 0) {
              item.servesList = [];
            }
            angular.forEach(bsis, function (list) {
              if (item.serviceName && list.serviceName && item.serviceName.toUpperCase() === list.serviceName.toUpperCase()) {
                item.servesList.push(list);
              }
            });
          });
          angular.forEach($scope.servesArrs, function (item) {
            if (item.servesList.length > 0) {
              $scope.newServeArrs.push(item);
            }
          });
        });
      }

      function classify(bsis) {
        ziyuan(bsis);
        getTenantServe($scope.nodeIf);
        $scope.fieldsHelper = {};
        if (bsis.length > 0) {
          $scope.sletr = [];
          let servicenames = [];
          angular.forEach(bsis, function (bsi) {
            servicenames.push(bsi.serviceName);
            bsi.isshow = false;
          });
          servicenames = servicenames.unique();
          angular.forEach(servicenames, function (servicename) {
            $scope.sletr.push({
              serviceName: servicename,
              isshow: false,
              servesList: []
            });
          });
          angular.forEach(bsis, function (bsi) {
            angular.forEach($scope.sletr, function (serve) {
              if (serve.serviceName === bsi.serviceName) {
                serve.servesList.push(bsi);
              }
            });
          });
          angular.forEach($scope.sletr, function (items) {
            angular.forEach(items.servesList, function (item) {
              item.ziyuan = [];
              item._attrs = [];
              if (item.quota) {
                let obj = JSON.parse(item.quota);
                angular.forEach(obj, function (quota, j) {
                  if (j !== "instance_id" && j !== "cuzBsiName") {
                    // build tool tips form df automatically
                    let bsmap = {};
                    getdfbs.get(function (data) {
                      angular.forEach(data.items, function (bs) {
                        let planInfo = {};
                        for(var idx=0; idx<bs.spec.plans.length; idx++){
                          if (!(_.isEmpty(bs.spec.plans[idx].metadata.customize))) {
                              angular.forEach(bs.spec.plans[idx].metadata.customize, function (ct, y) {
                                planInfo[y] = ct.desc + " 单位: " + ((typeof(ct.unit)=== "undefined") ? "个" : ct.unit);
                                $scope.fieldsHelper[y] = planInfo[y];
                              });
                          }
                        }
                        bsmap[bs.spec.name] = planInfo;
                       });
                       item.ziyuan.push({key: j, value: quota, tool:bsmap[items.serviceName][j]});
                    });
                  }
                });
              }
              if(item.attributes){
                let obj = JSON.parse(item.attributes);
                angular.forEach(obj, function (attr, j) {
                  if(_.startsWith(j, "ATTR_")) {
                    let k = j.substring(5);
                    item._attrs.push({key: k, value: attr});
                  }
                });
              }
            });
          });
        } else {
          $scope.sletr = [];
        }
      }

      $scope.addser = function (name, item) {
        addBsi.open(name, item, $scope.nodeId).then(function () {
          tenantbsi.query({id: $scope.nodeId}, function (bsis) {
            let bsitems = [];
            angular.forEach(bsis, function (bsi) {
              bsitems.push(bsi);
            });
            bsis = angular.copy(bsitems);
            classify(bsis);
          });
        });
      };

      $scope.delbsied = function (name) {
        delbsiconfirm.open($scope.nodeId, name).then(function () {
          tenantbsi.query({id: $scope.nodeId}, function (bsis) {
            let bsitems = [];
            angular.forEach(bsis, function (bsi) {
              bsitems.push(bsi);
            });
            bsis = angular.copy(bsitems);
            classify(bsis);
          });
        });
        /*
        deletebsi.delete({id: $scope.nodeId, name: name}, function () {
          tenantbsi.query({id: $scope.nodeId}, function (bsis) {
            let bsitems = [];
            angular.forEach(bsis, function (bsi) {
              bsitems.push(bsi);
            });
            bsis = angular.copy(bsitems);
            classify(bsis);
          });
        });
        */
      };
      $scope.showSelected = function (node) {
        ischengyuan(node.id);
        $scope.bsLimit = {};
        tenant.get({id: node.id}, function (tenant) {
          if (tenant.quota) {
            let quota = JSON.parse(tenant.quota);
            for (let k in quota) {
              $scope.bsLimit[k] = [];
              $scope.bsLimit[k].zt = {isshow: false, isde: false};
              for (let i in quota[k]) {
                $scope.bsLimit[k].push({key: i, val: quota[k][i]});
              }
            }
          }
        });
        Cookie.set('tenantId', node.id, 24 * 3600 * 1000);
        $scope.grid.roleTitle = node.name;
        $scope.nodeIf = node;
        $scope.nodeId = node.id;
        $scope.newServeArr = [];
        $scope.sletr = [];
        getUserInfo(node.id, node);
        tenantbsi.query({id: node.id}, function (bsis) {
          let bsitems = [];
          angular.forEach(bsis, function (bsi) {
            bsitems.push(bsi);
          });
          bsis = angular.copy(bsitems);
          if (bsis.length > 0) {
            classify(bsitems);
            $scope.roleDemoList = roleDemoList.slice(2);
            $scope.grid.showCompany = false;
            $scope.grid.showProject = false;
            $scope.grid.showChildnode = true;
            $('.right-nav>li').eq(2).addClass('active').siblings().removeClass('active');
            $('.right-content>li').eq(2).show().siblings().hide();
          } else {
            ziyuan(node.bsis);
            if (node.parentId) {
              $scope.grid.showCompany = false;
              $scope.grid.showProject = true;
              $scope.grid.showChildnode = false;
              $('.right-nav>li').eq(1).addClass('active').siblings().removeClass('active');
              $('.right-content>li').eq(1).show().siblings().hide();
              $scope.roleDemoList = roleDemoList.slice(2);
            } else if (!node.parentId) {
              $scope.grid.treeId = 2;
              $scope.roleDemoList = roleDemoList.slice(0, 1);
              $scope.grid.showCompany = true;
              $scope.grid.showProject = false;
              $scope.grid.showChildnode = false;
              $('.right-nav>li').eq(0).addClass('active').siblings().removeClass('active');
              $('.right-content>li').eq(0).show().siblings().hide();
            }
          }
        });
        $scope.grid.showbsi = node.children.length <= 0;
      };

      function createTree(trees) {
        $scope.dataForTheTree = [];
        $scope.treemap = {};
        angular.forEach(trees, function (item) {
          $scope.treemap[item.id] = item;
          $scope.treemap[item.id].children = [];
        });
        angular.forEach(trees, function (item) {
          if (item.parentId) {
            if ($scope.treemap[item.parentId]) {
              $scope.treemap[item.parentId].children.push(item);
            } else {
              delete $scope.treemap[item.id].parentId;
              $scope.dataForTheTree.push($scope.treemap[item.id]);
            }
          } else {
            $scope.dataForTheTree.push($scope.treemap[item.id]);
          }
        });
        let cinf = function (father) {
          angular.forEach(father.children, function (child) {
            cinf(child);
            angular.forEach(child.bsis, function (bsi) {
              father.bsis.push(bsi);
            });
          });
        };
        angular.forEach($scope.dataForTheTree, function (tree) {
          cinf(tree);
        });
        $scope.selected = $scope.dataForTheTree[0];
        let fristLoad = function (id, node) {
          Cookie.set('tenantId', id, 24 * 3600 * 1000);
          $scope.showSelected(node);
          gettenantuser(id);
          loadserve(id, node);
          gerTenantChild(id);
        };
        if ($scope.dataForTheTree[0] && $scope.dataForTheTree[0].id) {
          fristLoad($scope.dataForTheTree[0].id, $scope.dataForTheTree[0]);
        }
      }
      createTree(tree);
      $scope.deltenan = function (e, node) {
        e.stopPropagation();
        tenant_del_Confirm.open(node.name, node.id).then(function () {
          tenantname.query({name: Cookie.get('username')}, function (tree) {
            createTree(tree);
          });
        });
      };
      $scope.edittenan = function(e, node) {
        e.stopPropagation();
        updateTenant_dialog.open(node).then(function() {
          tenantname.query({name: Cookie.get('username')}, function (tree) {
            createTree(tree);
          });
        });
      };
      $scope.addTenant = function () {
        addTenant.open($scope.nodeId).then(function (tenant) {
          tenant.databaseInfo.children = [];
          $scope.nodeIf.children.push(tenant.databaseInfo);
          $scope.showSelected($scope.nodeIf);
        });
      };
      $scope.bsiToggle = function (idx) {
        $scope.sletr[idx].isshow = !$scope.sletr[idx].isshow;
      };
      $scope.svToggle = function (pIdx, idx) {
        $scope.sletr[pIdx].servesList[idx].isshow = !$scope.sletr[pIdx].servesList[idx].isshow;
      };
      $scope.addServe = function () {
        getdfbs.get(function (data) {
          let newItem = [...data.items];
          let existed_bsis = $scope.bsis.map(function (bsi) {
            return bsi.instanceName;
          });
          addserve_Confirm.open(newItem, $scope.nodeId, existed_bsis).then(function () {
            tenantbsi.query({id: $scope.nodeId}, function (bsis) {
              classify([...bsis]);
            });
          });
        });
      };
      $scope.editSv = function (pidx, idx) {
        $scope.sletr[pidx].servesList[idx].isde = true;
      };
      $scope.saveSv = function (pidx, idx, bsi) {
        let putobj = {
          parameters: {}
        };
        angular.forEach(bsi.ziyuan, function (item) {
          putobj.parameters[item.key] = item.value;
        });
        angular.forEach(bsi._attrs, function (item) {
          putobj.parameters["ATTR_" + item.key] = item.value;
        });
        updateinstance.put({id: $scope.nodeId, instanceName: bsi.instanceName}, putobj, function () {
            tenantbsi.query({id: $scope.nodeId}, function (bsis) {
              let bsitems = [];
              angular.forEach(bsis, function (bsi) {
                bsitems.push(bsi);
              });
              bsis = angular.copy(bsitems);
              classify(bsis);
              smallAlert.open('保存成功');
            });
          }, function (error) {
            if (error.data && error.data.resCodel === 4061) {
              smallAlert.open('可用容量不足');
            } else {
              smallAlert.open('保存失败');
            }
          }
        );
        $scope.sletr[pidx].servesList[idx].isde = false;
      };
      $scope.limitToggle = function (idx) {
        if ($scope.bsLimit[idx].zt.isshow) {
          $scope.bsLimit[idx].zt.isshow = false;
        } else {
          $scope.bsLimit[idx].zt.isshow = true;
        }
      };
      $scope.addBsLimit = function () {
        bsLimit.open();
      };
      $scope.editBsLimit = function (idx) {
        if (!$scope.bsLimit[idx].zt.isshow) {
          $scope.bsLimit[idx].zt.isshow = true;
        }
        $scope.bsLimit[idx].zt.isde = true;
      };
      $scope.saveBsLimit = function (idx, item) {
        $scope.bsLimit[idx].zt.isde = false;
        tenant.get({id: $scope.nodeId}, function (tenant) {
          let oldtenant = JSON.parse(tenant.quota);
          let oldqupta = oldtenant[idx];
          if (tenant.quota) {
            tenant.quota = '';
          }
          let postobj = {};
          angular.forEach($scope.bsLimit, function (bs, i) {
            postobj[i.toLowerCase()] = {};
            angular.forEach(bs, function (item) {
              postobj[i.toLowerCase()][item.key] = item.val - 0;
            });
          });
          tenant.quota = JSON.stringify(postobj);
          addtenantapi.updata(tenant, () => {}, (error) => {
            let newArr = [];
            angular.forEach(oldqupta, function (name, i) {
              let obj = {key: i, val: name};
              newArr.push(obj);
            });
            newArr.zt = item.zt;
            $scope.bsLimit[idx] = newArr;
            if (error.data && error.data.resCodel === 4061) {
              smallAlert.open('可用容量不足');
            } else {
              smallAlert.open('保存失败');
            }
          });
        });
      };
    }]);
