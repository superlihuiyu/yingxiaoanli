(function(w){
	w.lhy =Object.create(null);
	
	w.lhy.vMove=function (wrap,callBack){
			
			var inner = wrap.children[0];
			//3d硬件加速

			lhy.css(inner,"translateZ",1);
			//可移动最大值；也是最小值；
			var minY = wrap.clientHeight - inner.offsetHeight;
			
			//初始位置
			var startPoint={}
			//元素初始位置
			var elementPoint={};
			//上一次时间位置
			var lastPoint = 0;
			var lastTime = 0;
			//位置差 时间差
			var pointVal=0;
			var pointTime=1;
			
			
			//防抖动
			var isY=true;
			var isFirst = true;
			
			
			//Tween
			var Tween={
					 Linear: function(t,b,c,d){ return c*t/d + b; },
					 Back: function(t,b,c,d,s){
			            if (s == undefined) s = 1.70158;
			            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
			        }
				}
			wrap.addEventListener("touchstart",function(ev){
				ev=ev||event;
				var touchC=ev.changedTouches[0];
				inner.style.transition="none"
				//每当拿取页面元素的尺寸时，注意是尺寸是否有渲染完；没有的话，用异步；
				minY = wrap.clientHeight - inner.offsetHeight;
				
				startPoint={clientX:touchC.clientX,clientY:touchC.clientY}
				elementPoint={x:lhy.css(inner,"translateX"),y:lhy.css(inner,"translateY")};
				
				lastPoint=touchC.clientY;
				lastTime=new Date().getTime();
				
				inner.elasticd=false;
				pointVal=0;
				
				isFirst =true;
				isY=true;
				
				clearInterval(wrap.cleartimer);
				
				if(callBack&&typeof callBack["start"] ==="function"){
					callBack["start"].call(this);
				}
			})
			wrap.addEventListener("touchmove",function(ev){
				if(!isY){
					return;
				}
				ev=ev||event;
				var touchC=ev.changedTouches[0];
				
				var nowPoint=touchC;
				var dis = {x:0,y:0};
				dis.x =nowPoint.clientX - startPoint.clientX;
				dis.y = nowPoint.clientY - startPoint.clientY;
				var translateY=elementPoint.y+dis.y;
				
				
				var nowTime=new Date().getTime();
				pointVal=nowPoint.clientY-lastPoint;
				pointTime=nowTime-lastTime;
				
				
				lastPoint=nowPoint.clientY;
				lastTime=nowTime;
				
				if(translateY>0){
					var scale=document.documentElement.clientHeight/((document.documentElement.clientHeight+translateY)*2);
					translateY=lhy.css(inner,"translateY")+pointVal*scale;
					inner.elasticd=true;
				}else if(translateY<minY){
					var over=minY-translateY;
					var scale=document.documentElement.clientHeight/((document.documentElement.clientHeight+over)*2);
					translateY=lhy.css(inner,"translateY")+pointVal*scale;
					inner.elasticd=true;
				}
				
				//判断每次的move，每判断一次，就给isx false；
				if(isFirst){
					isFirst = false;//标记已经判断过
					if(Math.abs(dis.x) > Math.abs(dis.y) ){//判断是否为Y上滑动
						isY = false;//标记不在X上滑动
						return;
					}
				}

				lhy.css(inner,"translateY",translateY);
				if(callBack&&typeof callBack["move"] ==="function"){
					callBack["move"].call(this);
				}
			})
			wrap.addEventListener("touchend",function(ev){
				ev=ev||event;
				var touchC=ev.changedTouches[0];
				var speed = pointVal/pointTime;
				var translateY=lhy.css(inner,"translateY");	
				//bug:1.优化因速度所产生抖动
				speed=Math.abs(speed)<1?0:speed;
				var targetY=translateY+speed*200;
				//bug：5.过渡时间因根据速度的变化而变化，速度越大过渡时间越长；
				var time = Math.abs(speed)*0.15;
				//当过渡时间为超过1秒，会不够流畅；所以将时间控制在一秒内；
				time=time>1?1:time;
				//bug:4.当自动滑出区域时，没有回弹效果。用贝塞尔解决；
//				var bsr="";
				var type="Linear";
				if(targetY>0){
					targetY=0;
					type="Back";
//					bsr=" cubic-bezier(.11,1.29,.75,1.52)";
					//当为手动回弹时加入过渡时间；
					if(inner.elasticd){
						time = .5;
//						bsr="";
						type="Linear"
					}
				}else if(targetY<minY){
					targetY=minY;
//					bsr=" cubic-bezier(.11,1.29,.75,1.52)";
					type="Back";
					if(inner.elasticd){
						time = .5;
//						bsr="";
						type="Linear"
					}
				}
				
//				inner.style.transition=time+"s"+bsr;
//				clearInterval(wrap.cleartimer)
				
				move(type,targetY,time);
//				lhy.css(inner,"translateY",targetY);
				
				
			})
			
			function move(type,targetY,time){
				var point=0;
				
				var t=0;
				var b=lhy.css(inner,"translateY");
				var c=targetY-b;
				var d=time/0.02;
				var s=2.8;
				
				clearInterval(wrap.cleartimer);
				wrap.cleartimer=setInterval(function(){
					t++;
					//即点即停；
					if(t>d){
						clearInterval(wrap.cleartimer);
						if(callBack&&typeof callBack["end"] ==="function"){
							callBack["end"].call(this);
						}
						return;
					}
					point=Tween[type](t,b,c,d,s);
					lhy.css(inner,"translateY",point);
					if(callBack&&typeof callBack["move"] ==="function"){
						callBack["move"].call(this);
					}
				},20)
				
			}
			
		}
	
	w.lhy.css=function (node,type,val){
			//向元素中添加transforms属性，属性值为对象
			if(typeof node["transforms"]==="undefined"){
				node["transforms"]={};
			}
			//设置对象中的2D名值对
			if(arguments.length>=3){
				//用text变量作为transform属性的属性值字符串，
				var text ="";
				node["transforms"][type]=val;
				//遍历所创建的对象，使transform的操作累加起来
				for(item in node["transforms"]){
					if(node["transforms"].hasOwnProperty(item)){
						switch (item){
						case "translateX":
						case "translateY":
						case "translateZ":
						text+=item+"("+node["transforms"][item]+"px)";
							break;
						case "scale":
							text+=item+"("+node["transforms"][item]+")";
							break;
						case "rotate":
							text+=item+"("+node["transforms"][item]+"deg)";
							break;	
						}	
					}	
				}
				node.style.transform = node.style.webkitTransform = text;
				
			}else if(arguments.length==2){
				//读取
				val = node["transforms"][type];
				if(typeof val ==="undefined"){
					if(type ==="translateX"||type ==="translateY"||type ==="rotate"||"translateZ"){
						val = 0;
					}else if(type ==="scale"){
						val = 1;
					}
				}
				return val;
			}
			
		}
	w.lhy.carouse=function(urls){
		var pointsFlage=urls.length;
			
			var wrapNode=document.querySelector("#carouse-wrap");
			
			
			var addfeng =wrapNode.getAttribute("addfeng");
			addfeng = addfeng===null?false:true;
			if(addfeng){
				urls = urls.concat(urls);
			}
			var addmove=wrapNode.getAttribute("addmove");
			addmove=addmove===null?false:true
			
			
			
			var list  = document.createElement("ul");
			var listText=""
			for (var i = 0;i<urls.length;i++ ) {
				listText+='<li><a href="#"><img src='+urls[i]+'/></a></li>';
			}
			list.innerHTML=listText;
			wrapNode.appendChild(list);
			//开启3D硬件加速
			lhy.css(list,"translateZ",1);
			var imgs= document.querySelectorAll('#carouse-wrap>ul>li img');
			setTimeout(function(){
				var styleNode = document.createElement("style");
				styleNode.innerHTML+="#carouse-wrap>ul{width:"+urls.length+"00%;}"
				styleNode.innerHTML+="#carouse-wrap>ul>li{width:"+(1/urls.length*100)+"%;}"
				styleNode.innerHTML+="#carouse-wrap{height:"+imgs[0].offsetHeight+"px!important;}"
				document.head.appendChild(styleNode)
			},50)
			
			
			var pwrap =document.querySelector("#carouse-wrap>.points-wrap");
			if(pwrap){
				var pwrapText="";
				for (var i = 0;i<pointsFlage;i++ ) {	
					if(i==0){
						pwrapText+='<span class="active"></span>';
					}else{
						pwrapText+='<span></span>';
					}
				}
				pwrap.innerHTML=pwrapText;
				var points=document.querySelectorAll("#carouse-wrap>.points-wrap span");
			}
				
			//手指初始位置
			var startPoint ={};
			//滑屏元素位置
			var elementPoint={};
			//ul的抽象位置
			var now=0;

			var isFrist=true;
			var isX=true;
			wrapNode.addEventListener("touchstart",function(ev){
				ev=ev||event;				
				var touchC = ev.changedTouches[0];
				//无缝	
				if(addfeng){
					var now = lhy.css(list,"translateX")/document.documentElement.clientWidth;
				
					if(now == 0){
						now = -urls.length/2;
					}else if(now == 1-urls.length){
						now =1 -urls.length/2;
					}
					lhy.css(list,"translateX",now*document.documentElement.clientWidth);
				}
				
				startPoint={clientX:touchC.clientX,clientY:touchC.clientY,}
				list.style.transition="none";
				elementPoint={x:lhy.css(list,"translateX"),y:lhy.css(list,"translateY")};
				clearInterval(itmer);
				isFrist=true;
				isX=true;
			})
			wrapNode.addEventListener("touchmove",function(ev){
				if(!isX){
					return;
				}
				ev=ev||event;
				var touchC = ev.changedTouches[0];
				var nowPoint =touchC;
				var disY=nowPoint.clientY-startPoint.clientY;
				var disX =nowPoint.clientX-startPoint.clientX;
				
				if(isFrist){
					isFrist=false;
					if(Math.abs(disY) > Math.abs(disX)){
						isX=false;
						return;
					}
					
				}
				
				lhy.css(list,"translateX",disX+elementPoint.x);
				
			})
			
			wrapNode.addEventListener("touchend",function(ev){
				ev=ev||event;
				var touchC = ev.changedTouches[0];
				list.style.transition=".5s";
				//定义ul位置
				now =lhy.css(list,"translateX")/document.documentElement.clientWidth;
				now = Math.round(now);
				if(now>0){
					now=0;
				}else if(now<1-urls.length){
					now=1-urls.length
				}
				lhy.css(list,"translateX",now*document.documentElement.clientWidth);
				if(pwrap){
					for(var i=0;i<points.length;i++){
						points[i].className="";
					}
					points[-now%pointsFlage].className="active";
				}
				if(addmove){
					automove()
				}
				
			})
			
			//自动轮播
			var itmer=0;
			//抽象图片下标
//			var autoFlag=0
			if(addmove){
				automove();
			}
			function automove(){
				clearInterval(itmer);
	//				list.style.transition=".5s"
				itmer=setInterval(function(){
					if(now==1-urls.length){
						now=1-urls.length/2
						list.style.transition="none";
						lhy.css(list,"translateX",now*document.documentElement.clientWidth)
					}
					setTimeout(function(){
						now--;
						list.style.transition=".5s"
						lhy.css(list,"translateX",now*document.documentElement.clientWidth)
						if(pwrap){
							for(var i=0;i<points.length;i++){
								points[i].className="";
							}
							
							points[-now%pointsFlage].className="active";
						}
					},50)
					
				},3000)
			
			}
	}
})(window)
