/**
 * Created by lukaijie on 16/5/31.
 */
angular.module('directives', [])
    .directive('treeViewBody', [function () {
        return {
            restrict: 'E',
            templateUrl: '/tpl/treeViewBody.html',
            scope: {
                treeData: '=',
                canChecked: '=',
                textField: '@',
                itemClicked: '&',
                itemCheckedChanged: '&',
                itemTemplateUrl: '@'
            },
            controller: ['$scope', '$element', function ($scope, $element) {
                $scope.getItemIcon = function (item) {

                };
                $scope.isLeaf = function (item) { //是否显示子对象
                    if (item.properties.length > 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                $scope.getParentType = function (item) {
                    var index = item.$$hashKey.split(':')[1];
                    return $('li[id="' + index + '"]').parent().parent().attr('data-type') == 'array' ? true : false;
                };
                $scope.getType = function (item) {
                    return item.type;
                };
                $scope.getItem = function (item) {
                    return item.properties;
                };
                $scope.warpCallback = function (callback, item, $event, flag) {
                    $('.tree-view-body li span').removeClass('active');
                    $($event.currentTarget).addClass('active');
                    ($scope[callback] || angular.noop)({
                        $item: item,
                        $event: $event,
                        flag: flag,
                        datasource: $scope.treeData
                    });
                };
            }]
        }
    }])
    .directive('treeViewBodyMsg', [function () {
        return {
            restrict: 'E',
            templateUrl: '/tpl/treeViewBodyMsg.html',
            scope: {
                treeData: '=',
                canChecked: '=',
                textField: '@',
                itemClicked: '&',
                itemCheckedChanged: '&',
                itemTemplateUrl: '@'
            },
            controller: ['$scope', '$element', function ($scope, $element) {
                $scope.getItemIcon = function (item) {

                };
                $scope.isLeaf = function (item) { //是否显示子对象
                    if (item.properties.length > 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                $scope.getParentType = function (item) {
                    var index = item.$$hashKey.split(':')[1];
                    return $('li[id="' + index + '"]').parent().parent().attr('data-type') == 'array' ? true : false;
                };
                $scope.getType = function (item) {
                    return item.type;
                };
                $scope.getItem = function (item) {
                    return item.properties;
                };
                $scope.warpCallback = function (callback, item, $event, flag) {
                    $('.tree-view-body li span').removeClass('active');
                    $($event.currentTarget).addClass('active');
                    ($scope[callback] || angular.noop)({
                        $item: item,
                        $event: $event,
                        flag: flag,
                        datasource: $scope.treeData
                    });
                };
            }]
        }
    }]);