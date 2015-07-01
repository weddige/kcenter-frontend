angular.module('kcenter', [])
.controller('KCenterController', ['$http', function($http) {
    this.params = [];
    this.options = [];
    this.param = '';
    this.computation_server = 'http://localhost:8887';

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
                    self.wait(this.computation_server + headers('Location'));
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
			} else {
			    setTimeout(function(){ self.wait(url); }, 1000);
		    }
        });
    }

    this.init = function init(self) {
        var self = this;
        var url = this.computation_server + '/algorithms';
        $http.get(url).success(function(data) {
            self.options = data['suggestions'];
        });
    }

    this.restart = function restart() {
        this.state = 'select';
    }

    this.init();
}]);

var computation_server = 'http://localhost:8887';


function get_value(item) {
	var result = item.getAttribute('value');
	if (result == null) {
		var selected = item.childNodes[item.selectedIndex];
		if (selected)
			result = selected.getAttribute('value')||selected.innerText;
	}
	return result;
}

function wait_for_result(uri) {
	var request = new XMLHttpRequest();
    request.open('GET', computation_server + uri);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            data = JSON.parse(request.responseText);
            if (data['state'] == 'finished') {
			    show_result(data);
			} else {
			    setTimeout(function(){ wait_for_result(uri); }, 1000);
			}
        }
    }
    request.send();
}
