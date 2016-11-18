/**
 * Created by surendrak on 18-11-2016.
 */
"use strict"

var moment = require('moment');

function paysafeMysqlService(connection,log){

    var createTable = "CREATE TABLE paysafe_node(id int(11) NOT NULL AUTO_INCREMENT,"+
        "input_date DATE DEFAULT NULL,"+
        "transaction_date DATE DEFAULT NULL,"+
        "case_number varchar(50) DEFAULT NULL,"+
        "amount decimal(6,3) DEFAULT NULL,"+
        "reason_description varchar(200) DEFAULT NULL,"+
        "cc_first_6 varchar(6) DEFAULT NULL,"+
        "cc_last_4 varchar(4) DEFAULT NULL,"+
        "PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=latin1";

    connection.query(createTable, function(err, rows){
        if(err) {
            log.info(err);
        } else {
            log.info('Table is Created');
        }
    });

    this.saveData = function(data,callback){
        var insertRecord = 'INSERT INTO paysafe_node(input_date,transaction_date,case_number,amount,reason_description,cc_first_6,cc_last_4) VALUE(?,?,?,?,?,?,?)';
        if(data['Report Date'] == 'Grand Totals:'){
            callback({data:"Invalid"});
        } else {
            //Incsert a record.
            connection.query(insertRecord,[moment(Date.parse(data['Report Date'])).format('YYYY-MM-DD'),moment(Date.parse(data['Trans Date'])).format('YYYY-MM-DD'),data['Case No'],data['Amount'].replace(/[{()}$]/g, ''),data['CBReasonCodeDesc'],data['Card No'].slice(0,6),data['Card No'].slice(12,16)], function(err,res){
                if(err) {
                    log.info(err);
                } else {
                    callback(res);
                }
            });
        }

    }


}

module.exports = paysafeMysqlService;