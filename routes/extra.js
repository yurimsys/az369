const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dbconf = require('../config/database');
const connection = mysql.createConnection(dbconf);

connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    }.bind(this));
};

router.get('/survey', function(req, res){
    res.render('az369_survey');
});

router.post('/survey', function(req, res){
    
    console.log(req.body);


    let query = `
        INSERT INTO admin_survey
            (NAME, Phone, Addr, WT_Contact_Period, WT_Rantal_Fee_Min, WT_Rantal_Fee_Max, WT_Deposit_Min,
            WT_Deposit_Max, WT_Insurance_Type, CUR_Rantal_Fee, CUR_Deposit, WT_Modify)
        VALUES
            (:NAME, :Phone, :Addr, :WT_Contact_Period, :WT_Rantal_Fee_Min, :WT_Rantal_Fee_Max, :WT_Deposit_Min,
            :WT_Deposit_Max, :WT_Insurance_Type, :CUR_Rantal_Fee, :CUR_Deposit, :WT_Modify)`;

    connection.query(query, {
        NAME : req.body.name,
        Phone : req.body.phone ,
        Addr : req.body.addr ,
        WT_Contact_Period : req.body.wt_contact_period ,
        WT_Rantal_Fee_Min : req.body.wt_rental_fee_min ,
        WT_Rantal_Fee_Max : req.body.wt_rental_fee_max ,
        WT_Deposit_Min : req.body.wt_deposit_min ,
        WT_Deposit_Max : req.body.wt_deposit_max ,
        WT_Insurance_Type : (req.body.wt_insurance_type === 'n') ? 'Null' : req.body.wt_insurance_type ,
        CUR_Rantal_Fee : req.body.cur_rental_fee ,
        CUR_Deposit : req.body.cur_deposit ,
        WT_Modify : req.body.wt_modify 
    }, function(err, result){
        if(err) throw err;
        res.render('az369_survey_send');
    });

});

router.get('/survey1', function(req, res){
    
    let ctrt = req.query.ctrt;
    
    if( ctrt == 'n') return res.render('az369_survey_02_N');
    if( ctrt == 'y') return res.render('az369_survey_02_Y');
    res.render('az369_survey_01');
});

router.post('/survey1', function(req, res){
    
    console.log(req.body);


    let query = `
        INSERT INTO admin_survey
            (NAME, Phone, Addr, WT_Contact_Period, WT_Rantal_Fee_Min, WT_Rantal_Fee_Max, WT_Deposit_Min,
            WT_Deposit_Max, WT_Insurance_Type, CUR_Rantal_Fee, CUR_Deposit, WT_Modify, CUR_has_Contract)
        VALUES
            (:NAME, :Phone, :Addr, :WT_Contact_Period, :WT_Rantal_Fee_Min, :WT_Rantal_Fee_Max, :WT_Deposit_Min,
            :WT_Deposit_Max, :WT_Insurance_Type, :CUR_Rantal_Fee, :CUR_Deposit, :WT_Modify, :CUR_has_Contract)`;

    connection.query(query, {
        NAME : req.body.name,
        Phone : req.body.phone ,
        Addr : req.body.addr ,
        WT_Contact_Period : req.body.wt_contact_period ,
        WT_Rantal_Fee_Min : req.body.wt_rental_fee_min ,
        WT_Rantal_Fee_Max : req.body.wt_rental_fee_max ,
        WT_Deposit_Min : req.body.wt_deposit_min ,
        WT_Deposit_Max : req.body.wt_deposit_max ,
        WT_Insurance_Type : req.body.wt_insurance_type ,
        CUR_Rantal_Fee : req.body.cur_rental_fee ,
        CUR_Deposit : req.body.cur_deposit ,
        WT_Modify : req.body.wt_modify,
        CUR_has_Contract : req.body.cur_has_contract 
    }, function(err, result){
        if(err) throw err;
        res.render('az369_survey_03');
    });

});

module.exports = router;