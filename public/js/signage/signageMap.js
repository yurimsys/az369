//*** 중앙 svg 스크립트 ***
    //이미지 확대
    let img_L = 0;
    let img_T = 0;
    let targetObj;

    function getLeft(o){
        return parseInt(o.style.left.replace('px', ''));
    }
    function getTop(o){
        return parseInt(o.style.top.replace('px', ''));
    }
    // 이미지 움직이기
    // function moveDrag(e){
    //     // console.log(e.target)
    //     clearTimeout(window.transform);
    //     let scrollTop = $('.mapScrollBtn').css('top')
    //     //console.log(scrollTop.slice(-6,-2))
    //     let nowTop = scrollTop.slice(-6,-2)
    //     let nowX;
    //     let e_obj = window.event? window.event : e;
    //     let dmvx = parseInt(e_obj.clientX + img_L);
    //     let dmvy = parseInt(e_obj.clientY + img_T);
        
    //     targetObj.style.left = dmvx +"px";
    //     targetObj.style.top = dmvy +"px";
    //     let centralMap = $('.centralSvg')
    //     window.transform = setTimeout(() => {
    //         if(nowTop > 5 && nowTop < 370){
    //                 console.log(nowTop/10)
    //                 // nowX = ((nowTop/10)* 0.00435)+1
    //                 nowX = ((nowTop/5)* 0.02115)+1
    //                 centralMap.css('transform','scale('+nowX+')')
    //         }    
    //     }, 5);
    //     //px10씩 증가때 마다 확대
    //     //0.0417 씩 확대
    //     //let scrollTop;
    //     if(nowTop < 5){
    //         $('.mapScrollBtn').css('top','5px')
    //         document.onmousemove = null;
    //         document.onmouseup = null;
    //         $('.centralSvg').removeClass('zoom')
    //         $('.centralSvg').css('left','0px')
    //         $('.centralSvg').css('top','0px')
    //         return;
    //     }else if( nowTop > 355){
    //         $('.mapScrollBtn').css('top','355px')
    //         document.onmousemove = null;
    //         document.onmouseup = null;
    //         $('.centralSvg').removeClass('zoom')
    //         // $('.centralSvg').css('left','')
    //         // $('.centralSvg').css('top','')
    //         return;
    //     }
    //     return false;
    // }
        // 이미지 움직이기
        function moveDrag(e){
        // console.log(e.target)
        let scrollTop = $('.mapScrollBtn').css('top')
        //console.log(scrollTop.slice(-6,-2))
        let nowTop = scrollTop.slice(-6,-2)
        let nowX;
        let nowPx;
        let e_obj = window.event? window.event : e;
        let dmvx = parseInt(e_obj.clientX + img_L);
        let dmvy = parseInt(e_obj.clientY + img_T);
        
        targetObj.style.left = dmvx +"px";
        targetObj.style.top = dmvy +"px";
        let centralMap = $('.centralSvg')
        if(nowTop > 5 && nowTop < 370){
                // nowPx = nowTop % 10
                // console.log(nowpx)
                nowX = ((nowTop/10)* 0.0415)+1
                console.log(nowX)
                centralMap.css('transform','scale('+nowX+')')
        }    
        if($('.mapScrollBtn').css('top') == '5px'){
            centralMap.css('transform','scale(1.0)')
        }else if($('.mapScrollBtn').css('top') == '355px'){
            centralMap.css('transform','scale(2.5)')
        }

        if(nowTop < 5){
            $('.mapScrollBtn').css('top','5px')
            document.onmousemove = null;
            document.onmouseup = null;
            $('.centralSvg').removeClass('zoom')
            $('.centralSvg').css('left','0px')
            $('.centralSvg').css('top','0px')
            return;
        }else if( nowTop > 355){
            $('.mapScrollBtn').css('top','355px')
            document.onmousemove = null;
            document.onmouseup = null;
            $('.centralSvg').removeClass('zoom')
            // $('.centralSvg').css('left','')
            // $('.centralSvg').css('top','')
            return;
        }
        return false;
    }


    function mapScroll(e, obj){
        targetObj = obj;
        let e_obj = window.event? window.event : e;
        img_L = getLeft(obj) - e_obj.clientX;
        img_T = getTop(obj) - e_obj.clientY;
        
        document.onmousemove = moveDrag;
        document.onmouseup = stopDrag;
        // console.log(moveDrag)
        if(e_obj.preventDefault)e_obj.preventDefault();
    }
    // 드래그 멈추기
    function stopDrag(){
        document.onmousemove = null;
        document.onmouseup = null;
    }
    // 드래그 시작
    function startDrag(e, obj){
        if($('.mapScrollBtn').css('top') == '5px'){
            return false;
        }

        targetObj = obj;
        let e_obj = window.event? window.event : e;
        img_L = getLeft(obj) - e_obj.clientX;
        img_T = getTop(obj) - e_obj.clientY;

        document.onmousemove = moveDrag;
        document.onmouseup = stopDrag;
        if(e_obj.preventDefault)e_obj.preventDefault();
    }
    //줌인 줌아웃 리셋
    $('#zoomIn').on('click',function(){
        if($('#zoomIn').attr('class') == 'plusBtn'){
            //이미지 커서 이동 css
            $('.centralMap img').css('left','0px')
            $('.centralMap img').css('top','0px')
            $('.centralSvg').addClass('oneX')
            $('#zoomIn').addClass('oneZoom')
        }else if($('#zoomIn').attr('class') == 'plusBtn oneZoom'){
            $('.centralMap img').addClass('twoX')
            $('#zoomIn').addClass('twoZoom')
        }
    })

    $('#zoomOut').on('click',function(){
        
        if($('#zoomIn').attr('class') == 'plusBtn oneZoom'){
            $('.centralMap img').removeClass('oneX')
            $('.centralMap img').removeClass('twoX')
            $('#zoomIn').removeClass('oneZoom')
        }else if($('#zoomIn').attr('class') == 'plusBtn oneZoom twoZoom'){
            //이미지 커서 이동 css
            $('.centralMap img').css('left','')
            $('.centralMap img').css('top','')
            $('.centralMap img').removeClass('twoX')
            $('#zoomIn').removeClass('twoZoom')
        }else if($('#zoomIn').attr('class') == 'plusBtn'){
            //이미지 커서 이동 css
            $('.centralMap img').css('left','')
            $('.centralMap img').css('top','')
            $('.centralMap img').removeClass('oneX')
            $('#zoomIn').removeClass('oneZoom')
            $('#zoomIn').removeClass('twoZoom')
        }
    })

    $('#zoomReset').on('click',function(){
        //이미지 커서 이동 css
        $('.centralMap img').css('left','')
        $('.centralMap img').css('top','')
        $('#zoomIn').removeClass('oneZoom')
        $('#zoomIn').removeClass('twoZoom')
        $('.centralMap img').removeClass('oneX')
        $('.centralMap img').removeClass('twoX')
    })

    //층수 클릭
    $('.floorBtn div').on('click',function(e){
        let nowFloor = e.target.id
        $('.floorBtn div').removeClass('floorSelcet')
        $('#'+nowFloor).addClass('floorSelcet')
    })    
//*** 중앙 svg 스크립트 종료 ***