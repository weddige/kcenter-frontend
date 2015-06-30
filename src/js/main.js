var computation_server = 'http://localhost:8887';
var test = null;

function get_value(item) {
	var result = item.getAttribute('value');
	if (result == null) {
		var selected = item.childNodes[item.selectedIndex];
		if (selected)
			result = selected.getAttribute('value')||selected.innerText;
	}
	return result;
}

function show_result(data) {
    var results = document.getElementById('workspace');
	var innerHTML = '<table>';
	innerHTML += '<tr><th>Description</th></td><td>' + data['description'] + '</td></tr>';
	innerHTML += '<tr><th>Result</th><td>';
	for (p in data['result']) {
		innerHTML += '(' + data['result'][p] + '), '
	}
	innerHTML += '</td></tr><tr><th>Objective</th><td>'
	innerHTML += data['objective']
	innerHTML += '</td></tr><tr><th>Visualisation</th></td><td>';
	innerHTML += '<img src="' + computation_server + data['img'] + '" / >';
	innerHTML += '</td></tr></table>';

	results.innerHTML = innerHTML;

    var button = document.createElement('button');
    button.setAttribute('onclick', 'update_task_form();');
    button.setAttribute('type', 'button');
    button.innerText = 'Neuer Task';
    results.appendChild(button);
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

function update_task_form() {
			var container = document.getElementById('workspace');
			var args = [];
			var arg_fields = container.children[0].getElementsByClassName('task_arg');
			for (i=0; i<arg_fields.length; i++) {
				args.push(get_value(arg_fields[i]));
			}

			var uri = computation_server + '/algorithms';
			for (arg in args)
				uri = uri + '/' + args[arg];
			var request = new XMLHttpRequest();
            request.open('GET', uri);

			request.onreadystatechange = function() {
		        if (request.readyState == 2) {
		            if (request.status == 202) {
		                container.innerHTML = '<img src="img/balls64.gif" alt="Please wait" />'
		                return wait_for_result(request.getResponseHeader('Location'));
		            }
                } else if (request.readyState == 4) {
					if (request.status == 200) {
                    	var data = JSON.parse(request.responseText);
                        if (data['suggestions']) {

                            var form = document.createElement('form');
                            form.innerText = data['title'];
                            form.setAttribute('id', 'task_form');
                            for (arg in args) {
                                var input = document.createElement('input');
                                input.setAttribute('id', arg);
                                input.setAttribute('type', 'hidden');
                                input.setAttribute('class', 'task_arg');
                                input.setAttribute('value', args[arg]);
                                form.appendChild(input);
                            }

                            var select = document.createElement('select');
                            select.setAttribute('id', args.length);
                            select.setAttribute('class', 'task_arg');
                            var innerHTML = '';
                            for (i in data['suggestions']) {
                                innerHTML += '<option>' + data['suggestions'][i] + '</option>'
                            }
                            select.innerHTML = innerHTML;
                            form.appendChild(select);

                            var button = document.createElement('button');
                            button.setAttribute('onclick', 'update_task_form();');
                            button.setAttribute('type', 'button');
                            button.innerText = 'Weiter';
                            form.appendChild(button);

                            container.innerHTML = form.outerHTML;
                        } else {
                            data = JSON.parse(request.responseText);
			                show_result(data);
                        }
					}
                }
            }
            request.send();
}

document.addEventListener("DOMContentLoaded", update_task_form, false);
