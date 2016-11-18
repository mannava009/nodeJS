var request = require('request');
var cheerio = require('cheerio');
var bunyan = require('bunyan');
var fs = require('fs');
var moment = require('moment');
var tabletojson = require('tabletojson');
var mongoose = require('mongoose');
var mysql = require('mysql');
var log = bunyan.createLogger({name: "paysafe"});
var paysafeService = require('./paysafeService');
var paysafeMysqlService = require('./paysafeMysqlService');
var paysafeservice;
var paysafemysqlservice;

req = request.defaults({
    jar: true,                 // save cookies to jar
    headers: {
        'User-Agent': 'Super Cool Browser', // optional headers
        'max-age':100
    }
});

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://192.168.203.116:27017/cb360automation');

var db = mongoose.connection;
db.once('open', function callback() {
    log.info({data:"Mongo database is connected"});
    paysafeservice = new paysafeService(mongoose,log);
});

db.on('error', function (err) {
    log.info(err);
});

var pool =  mysql.createPool({
    host : 'ibasesqldb',
    user : 'root',
    password: '1Base1t',
    database: 'cb360automation'
});

pool.getConnection(function(err, connection){
    if(err){
        console.log(err);
    } else {
        log.info("Mysql connected Database");
        paysafemysqlservice = new paysafeMysqlService(connection,log);
    }
});

function  getMethod() {
    var start = new Date();
    // POST data then scrape the page
    var options = {
        url: "https://merituspayment.com/merchants/frmLogin.aspx"
    };
    req.get(options, function(err, resp, body) {
        log.info('Get:', new Date() - start, 'ms');
        var loadDataTime = new Date();
        // load the html into cheerio
        var $ = cheerio.load(body);
        // do something with the page here
        var data = {"__EVENTTARGET":"","__EVENTARGUMENT":"","__VIEWSTATE":$('#__VIEWSTATE').val(),
            "__VIEWSTATEGENERATOR":$('#__VIEWSTATEGENERATOR').val(),"ctl00$ContentPlaceHolder1$txtLoginID":"31495","ctl00$ContentPlaceHolder1$txtPassword":"1326C0mcastic",
            "ctl00$ContentPlaceHolder1$btnLogin":$('#ContentPlaceHolder1_btnLogin').val()};
        log.info('Get1:', new Date() - loadDataTime, 'ms');
        login(data);
    });
}

function login(data) {
    var loginDate = new Date();
    req.post({
        url: "https://merituspayment.com/merchants/frmLogin.aspx",
        form: data
    }, function(err, resp, body) {
        log.info("post:", new Date() - loginDate , "ms");
        var responseTime = new Date();
        // load the html into cheerio
        var $ = cheerio.load(body);
        // do something with the page here
        log.info("post1:", new Date() - responseTime , "ms");

        getReports();
    });
}

function getReports(){
    var data = {"__EVENTTARGET":"ctl00$ContentPlaceHolder1$btnExpExcelChargebackDay","__EVENTARGUMENT":"",
        "__LASTFOCUS":"","__VIEWSTATE":"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",
        "__VIEWSTATEGENERATOR":"78FC0077","__VIEWSTATEENCRYPTED":"","__PREVIOUSPAGE":"z-bjoV_pmfCLfDctEXPThYp83YjxdASmWV1tJivrxSWJv1Oe9Dde3BLbBzEubqM4ZGZMe9DUCCOw1Kns8ewhPClqhNLVtUMHpDTg0oC-qd2_QD4puYZlzvyslRGb4oHIb44zemiJzg085VlGkDTRKAJWDW7JggQ81K7TBDMEsAQ1",
        "ContentPlaceHolder1_wdcFromDate_clientState":"|0|012016-10-1-0-0-0-0||[[[[]],[],[]],[{},[]],'012016-10-1-0-0-0-0']",
        "ContentPlaceHolder1_wdcToDate_clientState":"|0|012016-10-31-0-0-0-0||[[[[]],[],[]],[{},[]],'012016-10-31-0-0-0-0']",
        "ctl00$ContentPlaceHolder1$ddlCBType":"-1","ctl00$ContentPlaceHolder1$ddlTransType":"-1",
        "ctl00$ContentPlaceHolder1$ddlCardType":"-1","ContentPlaceHolder1_wceTransAmount_clientState":"|0|01||[[[[]],[],[]],[{},[]],'01']",
        "ContentPlaceHolder1_wceTransAmount":"","ContentPlaceHolder1_wteAuthCode_clientState":"|0|01||[[[[]],[],[]],[{},[]],'01']",
        "ContentPlaceHolder1_wteAuthCode":"","ctl00$ContentPlaceHolder1$tbxLastFour":"","ctl00$ContentPlaceHolder1$rdExport":"1",
        "ctl00$ContentPlaceHolder1$cboPageSize":"10","ContentPlaceHolder1_window2_clientState":"[[[[null,3,null,null,'430px','260px',1,null,null,1,null,3]],[[[[[null,'Adjustment Details',null]],[[[[[]],[],[]],[{},[]],null],[[[[]],[],[]],[{},[]],null],[[[[]],[],[]],[{},[]],null]],[]],[{},[]],null],[[[[null,null,null,null]],[],[]],[{},[]],null]],[]],[{},[]],'3,3,,,430px,260px,0']",
        "_ig_def_dp_cal_clientState":"[[null,[],null],[{},[]],'01,2016,11']",
        "ctl00$_IG_CSS_LINKS_":"~/App_Themes/Blue/Blue.css|../../ig_res/Default/ig_monthcalendar.css|../../ig_res/Default/ig_dialogwindow.css|../../ig_res/Default/ig_texteditor.css|../../ig_res/Default/ig_shared.css"};
    var reportsDate = new Date();
    req.post({
    url: "https://merituspayment.com/merchants/web/SecureReportForms/frmChargebackDetail.aspx?ct=0&dt=0&rd=0",
    form: data
  }, function(err, resp, body) {
        log.info("getData:",new Date() - reportsDate , "ms");

    // load the html into cheerio
    var res = body.split('</script>');
 
    var $ = cheerio.load(res[2]);
        var respDate = new Date();

 /*   var stream = fs.createWriteStream("chargeBackReports.xls");
        stream.once('open', function(fd) {
        stream.write(body);
        stream.end();
    });*/
        log.info("getData1:", new Date()-respDate, "ms");
        var tablesAsJson = tabletojson.convert(res[2]);
        var metaData = tablesAsJson[0];
        var dataBaseTime = new Date();
        for (var key in metaData) {
            var report = metaData[key];
          //  var idate = moment(report['Trans Date']).format();
         //   console.log(idate);
          // paysafeservice.saveData(report, function(result) {
             //   if(key == (metaData.length-1)){
               //     log.info("Mongo database:", new Date()- dataBaseTime, "ms");
               // }
           // });
           // paysafemysqlservice.saveData(report, function (result) {
             //   if(key == (metaData.length-1)){
               // 	log.info("Mysql database:", new Date()- dataBaseTime, "ms");
               // }
           // })
        }
    });
}

getMethod();
