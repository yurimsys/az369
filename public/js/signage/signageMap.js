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
    function moveDrag(e){
        let e_obj = window.event? window.event : e;
        let dmvx = parseInt(e_obj.clientX + img_L);
        let dmvy = parseInt(e_obj.clientY + img_T);
        
        targetObj.style.left = dmvx +"px";
        targetObj.style.top = dmvy +"px";
        return false;
    }
    // 드래그 시작
    function startDrag(e, obj){
        targetObj = obj;
        let e_obj = window.event? window.event : e;
        img_L = getLeft(obj) - e_obj.clientX;
        img_T = getTop(obj) - e_obj.clientY;

        document.onmousemove = moveDrag;
        document.onmouseup = stopDrag;
        if(e_obj.preventDefault)e_obj.preventDefault();
    }
    // 드래그 멈추기
    function stopDrag(){
        document.onmousemove = null;
        document.onmouseup = null;
    }

    //줌인 줌아웃 리셋
    $('#zoomIn').on('click',function(){
        if($('#zoomIn').attr('class') == 'plusBtn'){
            //이미지 커서 이동 css
            $('.centralSvg').css('left','0px')
            $('.centralSvg').css('top','0px')
            $(this).attr('class','plusBtn 1X')
            $('.centralSvg').css('transform','scale(1.375)')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 1X'){
            $(this).attr('class','plusBtn 2X')
            $('.centralSvg').css('transform','scale(1.75)')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 2X'){
            $(this).attr('class','plusBtn 3X')
            $('.centralSvg').css('transform','scale(2.125)')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 3X'){
            $(this).attr('class','plusBtn 4X')
            $('.centralSvg').css('transform','scale(2.5)')
        }
    })

    $('#zoomOut').on('click',function(){
        if($('#zoomIn').attr('class') == 'plusBtn 1X'){
            // $('.centralSvg').removeClass('fullOne')
            $('.centralSvg').css('transform','')
            $('#zoomIn').attr('class', 'plusBtn')
            $('.centralSvg').css('left','')
            $('.centralSvg').css('top','')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 2X'){
            $('#zoomIn').attr('class', 'plusBtn 1X')
            $('.centralSvg').css('transform','scale(1.375)')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 3X'){
            $('#zoomIn').attr('class', 'plusBtn 2X')
            $('.centralSvg').css('transform','scale(1.75)')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 4X'){
            $('#zoomIn').attr('class', 'plusBtn 3X')
            $('.centralSvg').css('transform','scale(2.125)')
        }
    })

    $('#zoomReset').on('click',function(){
        $('.centralSvg').css('transform','')
        $('.centralSvg').css('left','')
        $('.centralSvg').css('top','')
        $('#zoomIn').attr('class', 'plusBtn')
    })

    //층수 클릭
    $('.floorBtn div').on('click',function(e){
        let nowFloor = e.target.id
        $('.floorBtn div').removeClass('floorSelcet')
        $('#'+nowFloor).addClass('floorSelcet')
        if(nowFloor == 'floor1Btn'){
            $('.centralSvg1F').css('display','block');
            $('.centralSvg2F').css('display','none');
            $('.centralSvg3F').css('display','none');
            $('#nowFloor').text('1F')
        }else if(nowFloor == 'floor2Btn'){
            $('.centralSvg1F').css('display','none');
            $('.centralSvg2F').css('display','block');
            $('.centralSvg3F').css('display','none');
            $('#nowFloor').text('2F')
        }else if(nowFloor == 'floor3Btn'){
            $('.centralSvg1F').css('display','none');
            $('.centralSvg2F').css('display','none');
            $('.centralSvg3F').css('display','block');
            $('#nowFloor').text('3F')
        }
    })    
//*** 중앙 svg 스크립트 종료 ***