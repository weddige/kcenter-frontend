angular.module('kcenter', ['kcenter.config'])
.controller('KCenterController', ['$http', '$timeout', 'COMPUTATION_SERVER', function($http, $timeout, COMPUTATION_SERVER) {
    this.params = [];
    this.options = [];
    this.param = '';
    this.tasks = [];
    this.computation_server = COMPUTATION_SERVER;
    //this.computation_server = 'http://m09vm9.ma.tum.de:8887';

    this.state = 'select';

    this.next = function next() {
        var self = this;
        this.params.push(this.param);
        var url = this.computation_server + '/algorithms/'
         + this.params.join('/');
        $http.get(url).success(function(data, status, headers) {
            if (data['suggestions']) {
                self.options = data['suggestions'];
            } else {
                self.params = [];
                self.param = '';
                self.init();
                if (status == 202) {
                    self.state = 'waiting';
                    self.wait(self.computation_server + headers('Location'));
                } else {
                    self.state = 'view';
                    self.data = data;
                }
            }
        });
    };

    this.wait = function wait(url) {
        var self = this;
        $http.get(url).success(function(data) {
            if (data['state'] == 'finished') {
			    self.state = 'view';
                self.data = data;
            } else if (data['state'] == 'failed') {
                self.state = 'error';
			} else {
			    setTimeout(function(){ self.wait(url); }, 1000);
		    }
        });
    }

    this.examples = function() {
        var self = this;
        var url = this.computation_server + '/tasks';
        $http.get(url).success(function(data) {
            self.tasks = data;
        });
        $timeout(function() { self.examples() }, 5000);
    }

    this.init = function init() {
        var self = this;
        var url = this.computation_server + '/algorithms';
        $http.get(url).success(function(data) {
            self.options = data['suggestions'];
        });
        this.examples();
    }

    this.restart = function restart() {
        this.state = 'select';
    }

    this.init();
}]);
