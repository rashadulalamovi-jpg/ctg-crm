(function(){
  var ENDPOINT = 'https://ctgclickshop.com/api/ready-stock/sync';
  var lastFingerprint = '';
  var running = false;

  function availableModels(){
    if(typeof stockDB === 'undefined' || !stockDB || !Array.isArray(stockDB.batches)) return [];
    var names = {};
    stockDB.batches.forEach(function(batch){
      var available = 0;
      try{
        available = typeof sellableAvail === 'function'
          ? Number(sellableAvail(batch)) || 0
          : Math.max(0,(Number(batch.qtyReceived)||0)-(Number(batch.qtySold)||0));
      }catch(e){
        available = Math.max(0,(Number(batch.qtyReceived)||0)-(Number(batch.qtySold)||0));
      }
      var model = String(batch.model||'').trim();
      if(available > 0 && model) names[model.toLowerCase()] = model;
    });
    return Object.keys(names).sort().map(function(key){ return names[key]; });
  }

  async function publishPublicReadyStock(force){
    if(running || typeof firebase === 'undefined' || !firebase.auth) return;
    var user = firebase.auth().currentUser;
    if(!user) return;
    var models = availableModels();
    var fingerprint = JSON.stringify(models);
    if(!force && fingerprint === lastFingerprint) return;
    running = true;
    try{
      var token = await user.getIdToken();
      await fetch(ENDPOINT,{
        method:'POST',
        mode:'no-cors',
        headers:{'content-type':'text/plain;charset=UTF-8'},
        body:JSON.stringify({token:token,models:models})
      });
      lastFingerprint = fingerprint;
      console.info('Public Ready Stock synced:',models.length,'models');
    }catch(error){
      console.warn('Public Ready Stock sync:',error);
    }finally{
      running = false;
    }
  }

  window.publishPublicReadyStock = publishPublicReadyStock;
  window.addEventListener('load',function(){ setTimeout(function(){ publishPublicReadyStock(true); },5000); });
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) publishPublicReadyStock(false); });
  setInterval(function(){ publishPublicReadyStock(false); },60000);
})();
