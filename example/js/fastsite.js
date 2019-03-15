/*
 * This file is part of fastsite.js
 * Copyright (c) 2019 Adrien THIERRY
 * https://github.com/adrien-thierry/fastsite.js
 *
 * sources : https://github.com/adrien-thierry/fastsite.js
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
function APP()
{
	var INDEX = 0;
	var SEED = new Date(Date.now()).getTime();
	var MAIN = document.location.href;
	var SNAPSHOP = document.documentElement.innerHTML;
	
	function parseDOM(_str)
	{
		var parser = new DOMParser(),
        _content = 'text/html',
        DOM = parser.parseFromString(_str, _content);
		return DOM;
	}
	
	function Rebuild()
	{
		var _app = new APP();
		_app.Build();
	}
	
	function loadSnap()
	{
		document.documentElement.innerHTML = SNAPSHOP;
		Rebuild();
	}
	
	function checkSnap()
	{
		if(!history.state || !history.state.view)
		{
			return;
		}
		var _dom = parseDOM(document.documentElement.innerHTML);
		for(var _v in history.state.view)
		{
			if(!_dom.querySelector(_v)) 
			{
				history.state.snap = true;
				history.replaceState(history.state, "page " + INDEX, document.location.href);
				return;
			};
		}
	}
	
	function loadContent(_href, _target, _history, _content, _head)
	{
		AJAX.GET(_href, {dt: SEED}, function(_err, _data)
		{
			var _hLoad;
			
			if(_data)
			{
				if(_head)
				{
					var _hdom = parseDOM(_data);
					var _hLoad = _hdom.querySelector("head").innerHTML;
					if(_hLoad && _hLoad.length > 0) document.querySelector("head").innerHTML = _hLoad;
				}
				
				if(_content)
				{
					var _dom = parseDOM(_data);
					var _toLoad = _dom.querySelector(_content).innerHTML;
					
					document.querySelector(_target).innerHTML = _toLoad;
					if(_target == "body") Rebuild();
					checkSnap(_toLoad);
					
					if(_history)
					{
						var _view = {};
						_view[_target] = _toLoad;
						if(_hLoad) _view.head = _hLoad;
						history.pushState({snap: false, view: _view}, "page " + INDEX++, _href);
					}
				}
				else 
				{
					document.querySelector(_target).innerHTML = _data;
					if(_target == "body") Rebuild();
					checkSnap(_data);
					
					if(_history)
					{
						var _view = {};
						_view[_target] = _data;
						if(_hLoad) _view.head = _hLoad;
						history.pushState({snap: false, view:_view}, "page " + INDEX++, _href);
					}
					
				}
			}
		});
	}

	function linkCB()
	{
		try
		{
			var _href = this.href;
			
			var _target =  this.getAttribute("app-view");
			if(_target == "undefined") _target = "body";
			
			var _history = this.getAttribute("app-history");
			if(_history == undefined || _history != "false") _history = true;
			else _history = false;
			
			var _content = this.getAttribute("app-content");
			
			var _head = this.getAttribute("app-head");
			if(_head != undefined && _head == "true") _head = true;
			else _head = false;
			
			loadContent(_href, _target, _history, _content, _head); 
			
		}catch(e){}
		return false;
	}

	this.Build = function()
	{
		var _a = document.getElementsByTagName("a");
		for(var _i = 0; _i < _a.length; _i++)
		{
			if(_a[_i].getAttribute("app"))
			{
				_a[_i].onclick = linkCB;
			}
		}
	}
	
	window.onpopstate = function(_h)
	{
		if(_h.state == null)
		{
			document.location.reload();
		}
		else 
		{
			if(_h.state.snap) loadSnap();
			if(_h.state.view)
			{
				for(var _v in _h.state.view)
				{
					document.querySelector(_v).innerHTML = _h.state.view[_v];
				}
			}
		}
	}
	
}

(function(){
var _app = new APP();
_app.Build();
})();

/**
 * @namespace AJAX
 */
var AJAX = {};

AJAX.x = function ()
{
    if (typeof XMLHttpRequest !== 'undefined')
    {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++)
    {
        try
        {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {}
    }
    return xhr;
};

/**
 * AJAX.Send - Send an ajax request
 * @memberof AJAX
 * @method
 * @param  {string} url the target request url
 * @param  {function} callback The callback function
 * @param  {string} method The method of the request (GET, POST, PUT, DELETE...)
 * @param  {object} data the data to send in url
 * @param {bool} async Set async for the request, default is true
 * @return {void}
 */
AJAX.Send = function (url, callback, method, data, async)
{
    if (async === undefined)
    {
        async = true;
    }
    var x = AJAX.x();
    x.open(method, url, async);
    x.addEventListener("error", function(){callback({"code":"500", "message":"Server error"}, null);}, false);
    x.addEventListener("abort", function(){callback({"code":"500", "message":"Network error"}, null);}, false);
    x.onreadystatechange = function ()
    {
        if (x.readyState == 4)
        {
          if (x.status === 200)
          {
            callback(null, x.responseText);
          }
          else
          {
            callback({"code":"404", "message":"Not found"}, null);
          }
        }
    };
    if (method == 'POST')
    {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data);
};

/**
 * AJAX.GET - Get ajax request
 * @memberof AJAX
 * @method
 * @param  {string} url the target request url
 * @param  {object} data the data to send in url
 * @param  {function} callback The callback function
 * @param {bool} async Set async for the request, default is true
 * @return {void}
 */
AJAX.GET = function (url, data, callback, async)
{
    var query = [];
    for (var key in data)
    {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    AJAX.Send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
};

/**
 * AJAX.POST - Post ajax request
 * @memberof AJAX
 * @method
 * @param  {string} url the target request url
 * @param  {string} data the data to send in url
 * @param  {function} callback The callback function
 * @param {bool} async Set async for the request, default is true
 * @return {void}
 */
AJAX.POST = function (url, data, callback, async)
{
    AJAX.Send(url, callback, 'POST', data, async);
};

/**
 * AJAX.PUT - Put ajax request
 * @memberof AJAX
 * @method
 * @param  {string} url the target request url
 * @param  {string} data the data to send in url
 * @param  {function} callback The callback function
 * @param {bool} async Set async for the request, default is true
 * @return {void}
 */
AJAX.PUT = function (url, data, callback, async)
{
    AJAX.Send(url, callback, 'PUT', data, async);
};

/**
 * AJAX.DELETE - Delete ajax request
* @memberof AJAX
 * @method
 * @param  {string} url the target request url
 * @param  {object} data the data to send in url
 * @param  {function} callback The callback function
 * @param {bool} async Set async for the request, default is true
 * @return {void}
 */
AJAX.DELETE = function (url, data, callback, async)
{
    var query = [];
    for (var key in data)
    {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    AJAX.Send(url + (query.length ? '?' + query.join('&') : ''), callback, 'DELETE', null, async);
};

window.AJAX = AJAX;