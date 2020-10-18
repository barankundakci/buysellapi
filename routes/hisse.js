const express = require('express');
const router = express.Router();
const Database = require('../db/db');

const Hisse = Database.Hisse
const Hisse_Payload = Database.Hisse_Payload
const Payload = Database.Payload
const Jointable = Database.Jointable

randomRange =(min, max) => {
  return (Math.random() * (max - min) + min);
}

setTimeout(function tick() {
  Hisse.findAll().then(allHisse => {
    allHisse.forEach(element => {
      const positiveOrNegative = Math.floor(randomRange(0,2));
      const randomRatio = randomRange(0.01,0.1);
      if(element.fiyat - (element.fiyat*randomRatio) < 0)
        positiveOrNegative = 0;
      if(positiveOrNegative == 0){
        const increase = element.fiyat*randomRatio;
        element.fiyat += increase;
      }
      else {
        const decrease = element.fiyat*randomRatio;
        element.fiyat -= decrease
      }
      element.save();
    });
  });
  timerId = setTimeout(tick, 3600000); // (*)
}, 3600000);

router.post('/', function(req,res,next) {
  const symbol = req.body.symbol;
  const price = parseFloat(req.body.price);
  const hisseAdi = req.body.hisseAdi;
  if(symbol && price && hisseAdi){
    if(symbol.toUpperCase() !== symbol)
    {
      res.json({error:'Hisse sembolü büyük harfle olmalı.'});
      return;
    }
    if(symbol.length !== 3){
      res.json({error:'Hisse sembolü 3 harfli olmak zorunda'});
    }
    Hisse.findAll({where: {symbol:symbol}}).then(allHisse => {
      if(allHisse.length > 0)
      {
        res.json({error:'Böyle bir hisse var'});
        return;
      }
      const hisse = Hisse.build({
        symbol: symbol,
        fiyat: price,
        hisseadi: hisseAdi
      });
      hisse.save().then(data => res.json(data));
    });
}
  else {
    res.json({error:'Eksik parametre'});
  }
});

/* GET home page. */
router.get('/getAll', function(req, res, next) {
  Hisse.findAll().then(data => res.json(data));
});

router.get('/get/:id', function(req, res) {
  Hisse.findAll({where: {id: req.params.id}}).then(data => {
    if(data.length > 0)
      res.json(data);
    else
      res.json({error:'Böyle bir idde bir şey bulunamadı.'});
  })});


  router.get('/test', function(req, res) {
    Payload.findAll({include: [{
      model: Hisse_Payload,
      as: "hisse_payload"
    }]}).then(data => {
        res.json(data);
    })});

    router.get('/buy', function(req, res) {
      const symbol = req.query.symbol;
      const share = parseFloat(req.query.share);
      const userId = parseInt(req.query.userId);
      if(!(symbol && share && userId)){
        res.json({error:'Eksik parametre'});
      }
      else {
      Hisse.findAll({where: {
        symbol: symbol
      }}).then(data => {
        if(data.length < 1){
          res.json({error:'Hisse bulunamadi.'});
          return;
        }
        const hisseId = data[0].id;
        const hissePrice = data[0].fiyat;
        Payload.findAll({where :{id:userId}}).then(userData => {
          if(userData.length < 1)
          {
            res.json({error:'User bulunamadı.'});
            return;
          }
          const userTotalPrice = userData[0].totalPrice;
          if(userTotalPrice >= share*hissePrice){
            Hisse_Payload.findAll({where: {
              hisseId:hisseId
            }}).then(payloadData => {
              let ratio = 0;
              if(payloadData.length > 0){
                payloadData.forEach(element => {
                  if(element.active)
                    ratio += element.ratio;
                });
              }
              if(ratio+share <= 100)
              {
                Hisse_Payload.findAll({
                  where:{
                  hisseId:hisseId
                },
                include: [{
                  model: Payload,
                  as: "payload",
                  where: {
                    id:userId
                  }
                }],
              }).then(userHisse => {
                if(userHisse.length < 1) {
                  const newData = Hisse_Payload.build({
                    ratio:share,
                    active:true,
                    hisseId: hisseId
                  });
                  newData.save().then(val => {
                    const joinTable = Jointable.build({
                      hisse_payload_id: val.id,
                      payload_id: userId
                    });
                    joinTable.save().then(lastVal => {
                      userData[0].totalPrice -= share*hissePrice;
                      userData[0].save().then(lasttVal => {
                        res.json(val);
                      });
                    });
                  });
                }
                else {
                  userHisse[0].ratio += share;
                  userData[0].totalPrice -= share*hissePrice;
                  userHisse[0].save().then(lastVal => {
                    userData[0].save().then(lasttval => {
                      res.json(lastVal);
                    });
                  });
                }
              })
              }
              else{
                res.json({error:'Hisse dolu'})
              }
            })
          }
          else {
            res.json({error:'Para yetersiz'});
          }
        });
      });
    }
    });


    router.get('/sell', function(req, res) {
      const symbol = req.query.symbol;
      const share = parseFloat(req.query.share);
      const userId = parseInt(req.query.userId);
      if(!(symbol && share && userId)){
        res.json({error:'Eksik parametre'});
      }
      else {
        Hisse.findAll({where:{symbol:symbol}}).then(hisseData => {
          if(hisseData.length < 0){
            res.json({error:'Böyle bir hisse yok'});
            return;
          }
          const hisseId = hisseData[0].id;
          const hisseFiyat = hisseData[0].fiyat;
          Hisse_Payload.findAll({
            include: [{
              model: Payload,
              as: "payload",
              where: {
                id: userId
              }
            }],
            where:{
              hisseId:hisseId,
              active: true
          }
        }).then(hisse_payloadData => {
          let totalUserHissesi = 0;
          if(hisse_payloadData.length > 0){
            hisse_payloadData.forEach(element => {
              totalUserHissesi +=  element.ratio;
            });
            if(share > totalUserHissesi){
              res.json({error:'Bu kadar hisse yok'});
            }
            else {
              hisse_payloadData[0].ratio -= share;
              hisse_payloadData[0].payload[0].totalPrice += hisseFiyat*share;
              hisse_payloadData[0].save().then(returnVal => {
                hisse_payloadData[0].payload[0].save().then(vall => {
                  res.json(returnVal);
                });
              });
            }
          }
        })
        });
      }
    });


module.exports = router;