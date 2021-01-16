const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://broker.hivemq.com");
const THM = require("./models/THM");
const express = require("express");
const app = express();
const http = require("http");
const mongoose = require("mongoose");
var MongoClient = require("mongodb").MongoClient;
//var lastMois = 0;
require("dotenv").config({ path : "variables.env" });
var db;

client.on("connect", () => {
    console.log("mqtt connect")
    client.subscribe("dodam_THM");
});

client.on("message", (topic, message) =>{
    var thm =  JSON.parse(message);
    var date = new Date();

    var year = date.getFullYear();
    var month = date.getMonth();
    var today = date.getDate();
    var hours = date.getHours();
    var sec = date.getSeconds();

    var c_date = getFormatDate(year, month, today);
    var month_add_1 = getFormatDate(year, month+1, today);
    console.log("d : " + c_date);
    var c_time = hours >= 10? hours.toString():'0'+hours;


    
    date = new Date();

    year = date.getFullYear();
    month = date.getMonth();
    today = date.getDate();
    hours = date.getHours();
    sec = date.getSeconds();
    console.log("time = " + hours + " : " +sec);

    c_date = getFormatDate(year, month, today);
    month_add_1 = getFormatDate(year, month+1, today);
    console.log("d : " + c_date);
    c_time = hours >= 10? hours.toString():'0'+hours;

    //var d = "{ date : "+c_date+", time : "+c_time+", temp:"+thm.temp+", humi: "+thm.humi+", mois: "+thm.mois+"}";

    thm.created_date = c_date;
    thm.created_time = c_time;
    console.log(thm);

    var device = db.collection("device");

    const thm_model =  new THM({
        device_name : ""+thm.device_name+"",
        temp : thm.temp,
        humi : thm.humi,
        mois : thm.mois,
        created_date : month_add_1,
        created_time : thm.created_time
        // created_at : thm.created_at
    });

    try{

        var lastMois;


        // const saveTHM = thm_model.save();
        device.updateMany({device_id : thm.device_name},
            {$push : {data : { date : c_date, time : c_time, temp: thm.temp, humi: thm.humi, mois: thm.mois}}},
             (err) => {
                if(err) console.log("err : ", err);
            });
        console.log("insert successfully");

        
    
        device.findOne({device_id:thm.device_name}, {_id:0, data:1})
        .then((result)=>{

            
            if(result != null){
                lastMois = result.data[result.data.length-1];
                if((thm.mois - lastMois.mois)>=20){
                device.updateMany({device_id:thm.device_name}, {$push : {water : thm.created_date}},
                    (err) =>{
                        if(err) console.log("err : "+err);
                    });
            }}

        })
        .catch((err)=>{
            console.log(err);
        });

    }catch(err){
        console.log({message : err});
    }


});

app.set("port" , "3000");
var server = http.createServer(app);

server.listen(3000, (err) => {
    if(err){
        return console.log(err);
    }else{
        console.log("server ready");
        mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
            if(!err) console.log("connect to db");
        });
        MongoClient.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true}, (err, database)=>{
            if(err){
                console.log("err : ", err);
            }else{
                console.log("MongoClient connection is successed");
                db = database.db("dodamdodam");
            }
        });
    }
})

function getFormatDate(_year, _month, _today){
    _month = _month >= 10 ? _month : '0' + _month;  //month 두자리로 저장
    _today = _today >= 10 ? _today : '0' + _today;          //day 두자리로 저장
    return  _year + '-' + _month + '-' + _today;       //'-' 추가하여 yyyy-mm-dd 형태 생성 가능
}
