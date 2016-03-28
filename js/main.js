window.onload = function() {
	var zIndex = 1 ;
	var bTub = document.getElementById("thumbnail") ;
	var aThumb = bTub.getElementsByTagName("img") ;
	var bPuz = document.getElementById("puzzle") ;
	var aLi = bPuz.getElementsByTagName("li") ;
	var oBegin = document.getElementsByTagName("input")[0] ;
	var i = imgPath = 0 ;
	var sDate = null ;
	var aPos = [] ;
	var aPuz = [] ;

	for( i =  0 ; i < 20 ; i++) aPuz.push(i+1) ;

	for( i = 0 ; i < aThumb.length ; i++) {
		aThumb[i].index = i ;
		aThumb[i].onmouseover = function() {
			this.className += " hover"
		} ; 
		aThumb[i].onmouseout = function() {
			this.className = this.className.replace(/\shover/,"")
		} ;
		aThumb[i].onclick = function() {
			for( i = 0 ; i < aThumb.length ; i++) aThumb[i].className = "" ;
			this.className = "selected" ;
		    imgPath = this.index ;
		    bPuz.innerHTML = "" ;
		    oBegin.value = "开始游戏" ;
		    createMask() ;
		    aPuz.sort(function(a,b) {return a - b}) ;
		    playGame(false) ;
		}
	} 

	function createMask() {
		var oMask = document.createElement("div") ;
		oMask.id = "mask" ;
		oMask.style.zIndex = zIndex ;
		bPuz.appendChild(oMask) ;
	} ;
	createMask() ;

	oBegin.onclick = function() {
		sDate = new Date() ;
		bPuz.innerHTML = "" ;
		this.value = "\u91cd\u65b0\u5f00\u59cb" ;
		playGame(true) ;
	}

	function playGame(ran) {
		ran && aPuz.sort(function(a,b) {return Math.random() > 0.5 ? -1 : 1}) ;

		var oFrag = document.createDocumentFragment() ;
		for( i = 0 ; i < aPuz.length ; i++) {
			var oLi = document.createElement("li") ;
			var oImg = document.createElement("img") ;
			oImg.src = "img/pic" + ( imgPath + 1 ) + "/" + aPuz[i] + ".png" ;
			oLi.appendChild(oImg) ;
			oFrag.appendChild(oLi) ;
		}
		bPuz.appendChild(oFrag) ;
		bPuz.style.background = "url(img/pic"+(imgPath+1)+"/bg.png) no-repeat" ;

		for( i = 0 ; i < aLi.length ; i++) {
			aLi[i].index = i ;
			aLi[i].style.top = aLi[i].offsetTop + "px" ;
			aLi[i].style.left = aLi[i].offsetLeft + "px" ;
			aPos.push({"left":aLi[i].offsetLeft , "top":aLi[i].offsetTop})
		}
		for (i = 0; i < aLi.length; i++)   
		{
			aLi[i].style.position = "absolute";
			aLi[i].style.margin = "0";
			drag(aLi[i])
		}

		function drag(obj , handle) {
			var handle = handle || obj ;
			handle.style.cursor = "move" ;
			handle.onmousedown = function(event) {
				var event = event || window.event ;
				var disX = event.clientX - this.offsetLeft ;
				var disY = event.clientY - this.offsetTop ;
				var oNear = null ;
				obj.style.zIndex = zIndex++ ;
				document.onmousemove = function(event) {
					var event = event || window.event ;
					var iL = event.clientX - disX ;
					var iT = event.clientY - disY ;
					var maxL = obj.parentNode.clientWidth - obj.offsetWidth ;
					var maxT = obj.parentNode.clientHeight - obj.offsetHeight ;

					iL < 0 && (iL = 0) ;
					iT < 0 && (iT = 0) ;
					iL > maxL && (iL = maxL) ;
					iT > maxT && (iT = maxT) ;
					obj.style.left = iL + "px" ;
					obj.style.top = iT + "px" ;

					for ( i = 0 ; i < aLi.length ; i++) aLi[i].className = "" ;

					oNear = findNear(obj) ;
				    oNear && (oNear.className = "puzzle_hover") ;

				    return false ;
				}
				document.onmouseup = function() {
					document.onmousemove = null ;
					document.onmouseup = null ;
					if(oNear) {
						var tIndex = obj.index ;
						obj.index = oNear.index ;
						oNear.index = tIndex ;
						startMove(obj , aPos[obj.index])
						startMove(oNear , aPos[oNear.index] , function() {
							if (finish()) {
								var iHour = iMin = iSec = 0 ;
								var nDate = new Date() ;
								var iRemain = parseInt((nDate.getTime() - sDate.getTime()) / 1000) ;
								iHour = parseInt(iRemain / 3600) ;
								iRemain %= 3600 ;
								iMin = parseInt(iRemain / 60) ;
								iRemain %= 60 ;
								iSec = iRemain ;
								alert("\u606d\u559c\u60a8\uff0c\u62fc\u56fe\u5b8c\u6210\uff01\n\n\u7528\u65f6\uff1a" + iHour  + "\u5c0f\u65f6" + iMin + "\u5206" + iSec + "\u79d2") ;
								createMask() ;
							};
						}) ;
						oNear.className = "" ;
					} else {
						startMove(obj,aPos[obj.index])
					}
					handle.releaseCapture && handle.releaseCapture() ;
				} ;
				this.setCapture && this.setCapture() ;
				return false ;
			}
		}

		function findNear(obj) {
			var filterLi = [] ;
			var aDistance = [] ;
			for( i = 0 ; i < aLi.length ; i++) aLi[i] != obj && (isButt(obj,aLi[i]) && (aDistance.push(getDistance(obj,aLi[i])), filterLi.push(aLi[i]))) ;
			var minNum = Number.MAX_VALUE ;
			var minLi = null ;
			for( i = 0 ; i < aDistance.length ; i++) aDistance[i] < minNum && (minNum = aDistance[i] , minLi = filterLi[i]) ;
			return minLi	
		}
	}
	playGame() ;

	function finish() {
		var aTemp = [] ;
		var suc = true ;
		aTemp.length = 0 ;
		for( i = 0 ; i < aLi.length ; i++) {
			for( var j = 0 ; j < aLi.length ; j++) {
				i == aLi[j]["index"] && aTemp.push(aLi[j].getElementsByTagName("img")[0].src.match(/(\d+)\./)[1])
			}
		}
	    for( i = 1 ; i <= aTemp.length ; i++) {
	    	if( i != aTemp[i-1]) {
	    		suc = false ;
	    		break ;
	    	}
	    }
	    return suc ;
	}

	function isButt(obj1 , obj2) {
		var l1 = obj1.offsetLeft ;
		var t1 = obj1.offsetTop ;
		var dl1 = obj1.offsetLeft + obj1.offsetWidth ;
		var dt1 = obj1.offsetTop + obj1.offsetHeight ;

		var l2 = obj2.offsetLeft ;
		var t2 = obj2.offsetTop ;
		var dl2 = obj2.offsetLeft + obj2.offsetWidth ;
		var dt2 = obj2.offsetTop + obj2.offsetHeight ;

		return !(dl1 < l2 || dt1 < t2 || dl2 < l1 || dt2 < t1 ) ;
	}

	function getDistance(obj1 , obj2) {
		var a = (obj1.offsetLeft + obj1.offsetWidth / 2) - (obj2.offsetLeft + obj2.offsetWidth / 2) ;
		var b = (obj1.offsetTop + obj1.offsetHeight / 2) - (obj2.offsetTop + obj2.offsetHeight / 2) ;
		return Math.sqrt(a * a + b * b) ;
	}

	function getStyle(obj , attr) {
		return parseFloat(obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj , null)[attr])
	}

	function startMove(obj , pos , onEnd) {
		clearInterval(obj.timer) ;
		obj.timer = setInterval(function(){
			doMove(obj , pos , onEnd) ;
		},30)
	}

	function doMove(obj , pos , onEnd) {
		var curL = getStyle(obj , "left") ;
		var curT = getStyle(obj , "top") ;
		var speedL = (pos.left - curL) / 5 ;
		var speedT = (pos.top - curT) / 5 ;
		speedL = speedL > 0 ? Math.ceil(speedL) : Math.floor(speedL) ;
		speedT = speedT > 0 ? Math.ceil(speedT) : Math.floor(speedT) ;
		if(pos.left == curL && pos.top == curT) {
			clearInterval(obj.timer) ;
			onEnd && onEnd() ;
		} else {
			obj.style.left = curL + speedL + "px" ;
			obj.style.top = curT + speedT + "px" ;
		}
	}
}