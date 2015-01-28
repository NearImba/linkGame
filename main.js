/**
 * Created by meiyu on 2015/1/8.
 */
(function (Global) {
    /* image data Config */
    var imgType = {
        "A": "",
        "B": "",
        "C": "",
        "D": "",
        "E": "",
        "F": "",
        "G": "",
        "H": "",
        "I": "",
        "J": "",
        "K": ""
     }

    function returnImgTypeKeyByIndex(n){
        var m = 0,v = null;
        for(var s in imgType){
            if(n == m){
               v = s;
               break;
            }else{
                m++;
            }
        }
        return v;
    }

    function myAddClass(dom,cName){
        if(dom.className.indexOf(cName) <= -1){
            dom.className += (" " + cName);
        }
    }

    function myRemoveClass(dom,cName){
        if(dom.className.indexOf(cName)>= 0){
            dom.className = dom.className.replace(cName,"")
        }
    }

    /* block Object define */
    var block = function (p) {
        this.status = false; //
        this.type = p.type;
        this.locationX = -1;
        this.locationY = -1;

        this.setLocation = function (x, y) {
            this.locationX = x;
            this.locationY = y;
        }
    }

    var wallBlock = function () {
        this.status = true;
        this.locationX = -1;
        this.locationY = -1;

        this.setLocation = function (x, y) {
            this.locationX = x;
            this.locationY = y;
        }
    }

    /* block Object define end */

    function isDeadLock() {
        return false;
    }
/*
width
height
 */
    var blockWidth = 30;
    var linkGame = Global.linkGame = function (p) {

        var matchNum = 0;

        var W = (p && p.width) || 10;
        var H = (p && p.height) || 10;
        var blockCss = p.blockCss || "block";

        this.W = W;
        this.H = H;

        var firstClick = null,secondClick = null;

        var canvas = null,drawContext = null;

        var blocks = [],walls = [];

        var blockArray = [];

        var tips = [null,null];

        var gameDiv = null;

        var gameThis = this;

        var gameContainer = (p && p.contaner) ||document.body;

        var beginTime = 0,endTime = 0,score = 100,tipCount = 0,randCount = 0,timeX = 0.0003;

        for(var i = 0; i < H+2; i ++){
            var arr = [];
            for(var j = 0; j < W+2; j++){
                arr[j] = 0;
            }
            blockArray.push(arr);
        }


        this.initGameData = function () {
            matchNum = 0;
            var n = W*H/2 , m = Object.keys(imgType).length;
            if( W*H%2 === 0) {
                while (n > 0) {
                    var i = Math.floor(Math.random()*m);

                    blocks.push(new block({type:returnImgTypeKeyByIndex(i)}));
                    blocks.push(new block({type:returnImgTypeKeyByIndex(i)}));

                    n--;
                }

                return true;
            } else {
                return false;
            }
        }

        this.setBlocks = function () {
            for(var j = 0; j < (H+2); j++){
                for(var i = 0; i < (W+2); i++) {
                    if( j === 0 || i === 0 || j === (H+1) || i === (W+1)) {
                        blockArray[j][i] = new wallBlock();
                        blockArray[j][i].setLocation(i,j);
                    } else {
                        var n = Math.floor(Math.random() * blocks.length);
                        blocks[n].setLocation(i,j);
                        blockArray[j][i] = blocks.splice(n,1)[0];
                    }
                }
            }

            gameDiv = this.gameDiv = document.createElement("div");
            canvas = document.createElement("canvas");
            gameDiv.className = "gameBody";
            canvas.className = "gameCanvas"
            canvas.width = (W + 2) * blockWidth;
            canvas.height = (H + 2) * blockWidth;
            gameDiv.style.width = canvas.style.width = canvas.width + "px";
            gameDiv.style.height = canvas.style.height = canvas.height + "px";

            gameDiv.appendChild(canvas);
            gameContainer.appendChild(gameDiv);

            drawContext = canvas.getContext("2d");

            for(var j = 0; j < (H+2) ; j++) {
                for(var i = 0; i < (W+2); i++) {
                    var blockDiv = document.createElement("div");

                    blockDiv.dataStore = blockArray[j][i];

                    if(blockArray[j][i].constructor == wallBlock){
                        blockDiv.className = "wallBlock";
                    } else {
                        blockDiv.className = blockCss;

                        blockDiv.innerHTML = blockArray[j][i].type;

                        //blockDiv.innerHTML += blockArray[j][i].locationX + "," + blockArray[j][i].locationY;

                        blockDiv.onclick = function () {
                            //alert(this.dataStore.locationX + "," + this.dataStore.locationY);
                            if(this.dataStore.status === true) {
                                return;
                            }

                            if(firstClick === null) {
                                firstClick = this;
                                firstClick.className += " clicked";
                            } else if (secondClick === null) {
                                secondClick = this;
                                secondClick.className += " clicked";
                                var result = ifCanBeMatched(firstClick.dataStore, secondClick.dataStore);
                                if (result){
                                    drawLine(result)
                                    firstClick.className += " matched";
                                    secondClick.className += " matched";
                                    firstClick.dataStore.status = true;
                                    secondClick.dataStore.status = true;
                                    matchNum += 2;



                                    if(matchNum === W*H){
                                        gameThis.getScore();
                                    }else{
                                        if(isThereNoDeadLock()){
                                            //gameThis.showTip();
                                        }else{
                                            alert("dead Lock");
                                        }
                                    }
                                } else {
                                    firstClick.className = firstClick.className.split(" ")[0];
                                    secondClick.className = firstClick.className.split(" ")[0];
                                    console.log("matching error")
                                }

                                var allBlockForRemoveTips = gameDiv.getElementsByClassName(blockCss);
                                for(var z = 0; z < allBlockForRemoveTips.length; z++){
                                    myRemoveClass(allBlockForRemoveTips[z],"tipClass");
                                }
                                firstClick = null;
                                secondClick = null;
                            }
                        }

                    }

                    gameDiv.appendChild(blockDiv);
                }
            }
        }

        function ifCanBeMatched(first, second) {

            if(first.type !== second.type) {
                return false
            }

            function isInALine (a , b) {
                if(a.locationX === b.locationX && a.locationY !== b.locationY) {
                    
                    if(Math.abs(a.locationY - b.locationY) === 1){
                        return true;
                    }
                    var r = true;
                    for(var i = (Math.min(a.locationY, b.locationY) + 1) ; i < Math.max(a.locationY, b.locationY);i++){
                        if(blockArray[i][a.locationX].status === false){
                            r = false;
                            break;
                        }
                    }
                    return r;
                } else if (a.locationY === b.locationY && a.locationX !== b.locationX) {
                    if(Math.abs(a.locationX - b.locationX) === 1){
                        return true;
                    }
                    
                    var r = true;
                    for(var i = (Math.min(a.locationX, b.locationX) + 1) ; i < Math.max(a.locationX, b.locationX);i++){
                        if(blockArray[a.locationY][i].status === false){
                            r = false;
                            break;
                        }
                    }
                    return r;
                } else {
                    return false;
                }
            }

            if(isInALine(first,second)){
                return [{x:first.locationX,y:first.locationY},{x:second.locationX,y:second.locationY}];
            }

            if((isInALine(first,blockArray[first.locationY][second.locationX]) && blockArray[first.locationY][second.locationX].status && isInALine(second,blockArray[first.locationY][second.locationX]))){
                return [{x:first.locationX,y:first.locationY},{x:second.locationX,y:first.locationY},{x:second.locationX,y:second.locationY}];
            }

            if((isInALine(first,blockArray[second.locationY][first.locationX]) && blockArray[second.locationY][first.locationX].status &&isInALine(second,blockArray[second.locationY][first.locationX]))){
                return [{x:first.locationX,y:first.locationY},{x:first.locationX,y:second.locationY},{x:second.locationX,y:second.locationY}];
            }

            var r = false;
            for(var i = 0; i < W + 2; i++){
                if(isInALine(first,blockArray[first.locationY][i]) && blockArray[first.locationY][i].status && isInALine(blockArray[first.locationY][i],blockArray[second.locationY][i]) && blockArray[second.locationY][i].status && isInALine(blockArray[second.locationY][i],second)){
                    r = true;
                    r = [{x:first.locationX,y:first.locationY},{x:i,y:first.locationY},{x:i,y:second.locationY},{x:second.locationX,y:second.locationY}];
                    break;
                }
            }

            for(var i = 0; i < H + 2; i++){
                if(isInALine(first,blockArray[i][first.locationX]) && blockArray[i][first.locationX].status && isInALine(blockArray[i][first.locationX],blockArray[i][second.locationX]) && blockArray[i][second.locationX].status && isInALine(blockArray[i][second.locationX],second)){
                    r = true;
                    r = [{x:first.locationX,y:first.locationY},{x:first.locationX,y:i},{x:second.locationX,y:i},{x:second.locationX,y:second.locationY}];
                    break;
                }
            }
            return r;
        }

        function drawLine(arr) {
            function locationToPx(a){
                return a*blockWidth + blockWidth/2;
            }

            function clearCanvas() {
                drawContext.beginPath();
                drawContext.rect(0,0,canvas.width,canvas.height);
                drawContext.fillStyle = "#fff";
                drawContext.fill();
                drawContext.closePath();
            }
            if(drawContext){
                clearCanvas();
                drawContext.beginPath();
                drawContext.strokeStyle = "#f00"
                drawContext.moveTo(locationToPx(arr[0].x),locationToPx(arr[0].y));
                for(var i = 1; i < arr.length; i++){
                    drawContext.lineTo(locationToPx(arr[i].x),locationToPx(arr[i].y));
                }
                drawContext.stroke();
                drawContext.closePath();
            }else{
                alert("canvas error");
            }
        }

        function isThereNoDeadLock(){
            var allUnMatchedBlocks = [];
            var a = gameDiv.getElementsByClassName(blockCss);
            tips =[null,null];
            for(var j = 0;j < a.length;j++){
                if(a[j].dataStore.status == false){
                    allUnMatchedBlocks.push(a[j]);
                }
            }

            function dealThisType(t) {
                if(tips[0] !== null){
                    return;
                }

                var dr = [],done = false;
                for(var n = 0; n < allUnMatchedBlocks.length; n++){
                    if(allUnMatchedBlocks[n].dataStore.type == t){
                        dr.push(allUnMatchedBlocks[n]);
                    }
                }

                for(var i = 0; i < dr.length - 1; i ++){
                    for(var j = i+1; j < dr.length; j++){
                        if(ifCanBeMatched(dr[i].dataStore,dr[j].dataStore)){
                            tips[0] = (dr[i]);
                            tips[1] = (dr[j]);
                            done = true;
                            break;
                        }
                    }
                    if(done) break;
                }
            }

            for(var i in imgType){
                dealThisType(i);
            }

            if(tips[0] === null || tips[1] === null){
                return false;
            }else{
                return true;
            }
        }

        this.randBlocks = function () {
            var allBlockForRemoveTips = gameDiv.getElementsByClassName(blockCss);
            for(var z = 0; z < allBlockForRemoveTips.length; z++){
                myRemoveClass(allBlockForRemoveTips[z],"tipClass");
            }
            randCount++;
            var allUnMatchedBlocks = [];
            var a = gameDiv.getElementsByClassName(blockCss);

            for(var j = 0;j < a.length;j++){
                if(a[j].dataStore.status == false){
                    allUnMatchedBlocks.push(a[j]);
                }
            }

            function swapBlocks(f,s){
                var fNextDom = f.nextSibling,sNextDom = s.nextSibling;

                gameDiv.insertBefore(s,fNextDom);
                gameDiv.insertBefore(f,sNextDom);

                var x1 = f.dataStore.locationX, y1 = f.dataStore.locationY;
                var x2 = s.dataStore.locationX, y2 = s.dataStore.locationY;

                var xy = blockArray[y1][x1];
                blockArray[y1][x1] = blockArray[y2][x2];
                blockArray[y2][x2] = xy;

                f.dataStore.setLocation(x2,y2);
                s.dataStore.setLocation(x1,y1);
            }

            var q = allUnMatchedBlocks.length;
            for(var i = 0; i < q; i++){
                var q1 = Math.floor(Math.random()*q);
                if(i != q1){
                    swapBlocks(allUnMatchedBlocks[i],allUnMatchedBlocks[q1]);
                }
            }

            if(!isThereNoDeadLock()){
                alert("dead Lock");
            }
        }

        this.showTip = function (){
            tipCount ++;
            if(tips[0] !== null && tips[1] !== null){
                myAddClass(tips[0],"tipClass")
                myAddClass(tips[1],"tipClass")
            }
        }

        this.Start = function () {
            if(this.initGameData()){
                this.setBlocks();
                beginTime = new Date();
                if(!isThereNoDeadLock()){
                    alert("dead Lock");
                }
            } else {
                console.log("init data error")
            }

        }

        this.getScore = function (){
            endTime = new Date()
            score = Math.round(score - tipCount - randCount - (endTime - beginTime)*timeX);
            alert("score:" + score)
        }

        if(p.tipButton){
            p.tipButton.onclick = this.showTip;
        }

        if(p.randButton){
            p.randButton.onclick = this.randBlocks;
        }

        /*
        window.debug1 = function (){
            console.log(gameDiv.getElementsByClassName(blockCss))
        }

        window.debug2 = function (){
            console.log(blockArray);
        }
        */
    }

})(window);