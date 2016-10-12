var md5 = require("MD5");
var http = require('http');
var https = require('https');
var url = require('url');

var prism = function(server, key, secret){
    this.server = url.parse(server);
    this.key = key;
    this.secret = function(){
        return secret;
    }
    this.rpc = function(api, options){
        params = options.params;

        var reqopt = {
            hostname: this.server.hostname,
            port: this.server.port,
            path: this.server.path,
            method: options.type,
            headers: {"User-Agent": "Prism-JS/1"}
        };

        var is_https = reqopt.protocol=="https:";

        params["client_id"] = this.key;
        if (options.type == "GET") {
            GetParams = params;
            PostParams = {};
        }else{
            PostParams = params;
            GetParams = {};
        }

        if(is_https){
            params["client_secret"] = this.secret();
        }else{
            params["sign_method"] = "md5"
            params["sign_time"] = Date.parse(new Date())/1000
            params["sign"] = sign(options.type, "/api/"+api, {}, GetParams, PostParams, this.secret())
        }

        reqopt.path += "/" + api;
        var params_str = build_query(params);
        if(options.type=="GET"){
            reqopt.path += "?" + params_str;
        }else if(options.type=="POST"){
            reqopt.headers["Content-Length"] = params_str.length;
            reqopt.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        requestor = is_https ? https : http;
        var req = requestor.request(reqopt, rpc_callback(options.success, options.error));
        req.on('error', options.error);

        if(options.type=="POST"){
            req.write(params_str);
        }
        req.end();
    }
}

function response(headers, data){
    var rsp = {
        'headers': headers,
        'data': data,
        'request_id': headers["x-request-id"]
    }
    try{
        rsp.data = JSON.parse(data.toString());
        rsp.is_json = true;
    }catch(e){}
    return rsp;
}

function rpc_callback(on_success, on_error){
    var fp = function(res){
        if(res.statusCode==200){
            res.on('data', function(data){
                var rsp = response(res.headers, data);
                on_success(rsp);
            });
        }else{
            res.on('data', function(data){
                var rsp = response(res.headers, data);
                on_error({"code": res.statusCode, request_id: rsp.request_id, "response": rsp});
            });
        }
    }
    return fp;
}

function build_query(object){
    data = [];
    for(k in object){
        data.push(encodeURIComponent(k) + "=" + encodeURIComponent(object[k]))
    }
    return data.join("&")
}

function sort_obj(object){
    var ks = Object.keys(object);
    ks.sort();
    var d = [];
    for(i=0;i<ks.length;i++){
        d.push( ks[i] + "=" + object[ks[i]] );
    }
    return encodeURIComponent(d.join("&"));
}

function sign(method, path, headers, GetParam, PostParam, secret){
    var d = [];
    d.push(secret);
    d.push(method);
    d.push(encodeURIComponent(path));
    d.push(sort_obj(headers));
    d.push(sort_obj(GetParam));
    d.push(sort_obj(PostParam));
    d.push(secret);
    signstr = d.join("&");
    return md5(signstr).toUpperCase();
}

module.exports = function(url, key, secret) {
    return new prism(url, key, secret)
}