function loading1(){
  var canvas = document.getElementById("loading1"),
      ctx = canvas.getContext("2d"),
      w = canvas.width,
      h = canvas.height,
      x = w/2,
      y = h/2,
      radius = 30;
      ctx.fillStyle = "#000";
      ctx.fillRect(0,0,w,h);

      var r = [3,4,4.5,6,6,7];
      var angle = [10,25,45,65,90,120];
      var alpha = [0.25,0.35,0.45,0.65,0.8,1];
      var x1=[],y1=[];
      
      setInterval(function(){
          ctx.fillStyle = "#000";
          ctx.fillRect(0,0,w,h);
          x1 = [];
          y1 = [];
          for(var i = 0; i < r.length; i ++){
              if(angle[i] >= 360) angle[i] = 0;
              ctx.beginPath();
              ctx.font = "1rem sans-serif";
              ctx.fillStyle = "rgba(156,236,255,"+alpha[i]+")";
              x1.push( x + radius*Math.cos(angle[i]*Math.PI/180));
              y1.push( y + radius*Math.sin(angle[i]*Math.PI/180));
              ctx.arc(x1[i],y1[i],r[i],0,2*Math.PI, true);
              ctx.closePath();
              ctx.fill();
              angle[i] += 5;
          }
      },25);
}

function isEmpty(obj){
  var name;
  for(name in obj){
      return false;
  }
  return true;
}

function loading2(arg){
  this.init(arg);
}
loading2.prototype = {
  // constructor:loading2,
  init: function (arg) {
      var isConsist = !isEmpty(arg);
      this.block = isConsist ? arg.block ? arg.block : 12 : 12;
      this.height = isConsist ? arg.height ? arg.height : 15 : 15;
      this.width = isConsist ? arg.width ? arg.width : 3 : 3;
      this.time = isConsist ? arg.time ? arg.time : 100 : 100;
      
      this.cvs = document.getElementById(arg.id),
      this.ctx = this.cvs.getContext("2d");
      this.ctx.width = this.height*6;
      this.ctx.height = this.height*6;
      
      this.ctx.translate(this.ctx.width/2, this.ctx.height/2);
      var radius = 2;
      this.view(radius);
  },
  loop: function(alpha){
      this.ctx.rotate(Math.PI*2/this.block);
      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(0,0,0,"+alpha+")";
      this.ctx.arc(0, this.ctx.width/2-this.height*2,this.width/2, 0 ,Math.PI, true);
      this.ctx.arc(0, this.ctx.width/2-this.height, this.width/2, Math.PI, 0, true);
      this.ctx.closePath();
      this.ctx.fill();
  },
  view: function(radius){
      var that = this;
      this.ctx.rotate(Math.PI*2/this.block);
      for(var i = 1; i <= this.block; i ++){
          this.loop(i/this.block);
      }
      setTimeout(function(){
          that.ctx.clearRect(-that.ctx.width/2, -that.ctx.height/2, that.ctx.width, that.ctx.height);
          radius >= that.block? radius = 1:radius += 1;
          that.view(radius);
      }, that.time);
  
  }
}