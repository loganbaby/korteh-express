var ctrl = new ScrollMagic.Controller({
    globalSceneOptions: {
      triggerHook: 'onLeave'
    }
  });
  
  $("section").each(function() {
    new ScrollMagic.Scene({
      triggerElement: this
    })
    .setPin(this)
    .addTo(ctrl);
  });
  
  var wh = window.innerHeight;
   
  new ScrollMagic.Scene({
    offset: wh*5
  })
  .setClassToggle("section#six", "is-active")
  .addTo(ctrl);