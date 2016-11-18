"use strict"

var moment = require('moment');

function paysafeService(mongoose,log) {

    var model = undefined;

    this.getpaySafeModel = function(){

    	try{
    		if(mongoose.model('node_paysafe')){
    			model = mongoose.model('node_paysafe');
    		}
    	} catch(e){
    		if(e.name == "MissingSchemaError"){
    			var schema = mongoose.Schema({
    				'amount':{type:String, required:true},
    				'transaction_date':{type:Date, required:true},
    				'cc_first_6':{type:String, required:true},
    				'input_date':{type:Date, required:true},
    				'case_number':{type:String, required:true},
    				'cc_last_4':{type:String, required:true},
    				'reason_description':{type:String, required:true}
    			})
    			model = mongoose.model('node_paysafe', schema);
    		}
    	}
    	return model;
    }

    this.saveData = function(data,callback){
        var paysafeModel = this.getpaySafeModel();
		if(data['Report Date'] == 'Grand Totals:'){
			callback({data:"Invalid"});
		} else {
			var apaySafe = new paysafeModel({
				'amount':data['Amount'].replace(/[{()}$]/g, ''),
				'transaction_date':moment(Date.parse(data['Trans Date'])).format('MM-DD-YYYY'),
				'cc_first_6':data['Card No'].slice(0,6),
				'input_date':moment(Date.parse(data['Report Date'])).format('MM-DD-YYYY'),
				'case_number':data['Case No'],
				'cc_last_4':data['Card No'].slice(12,16),
				'reason_description':data['CBReasonCodeDesc']
			})
			apaySafe.save(function(err,result){
				if(result){
					callback(result);
				} else {
					console.log(err);
				}
			})
		}

    }

}

module.exports = paysafeService;