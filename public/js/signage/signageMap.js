//*** 중앙 svg 스크립트 ***

$.ajax({
    url: '/api/storeInfo',
    method: 'get',
    dataType: 'json',
    success: function(res){
        localStorage.setItem('storeInfo',JSON.stringify(res.data))
    }
})

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
    $('#2Fstore_name text').hide()
    $('#3Fstore_name text').hide()
    // $('#3Fstore_name text').hide()
    //줌인 줌아웃 리셋 
    $('#zoomIn').on('click',function(){
        $('#2Fstore').css('cursor','pointer');
        $('#3Fstore').css('cursor','pointer');
        if($('#zoomIn').attr('class') == 'plusBtn'){
            //이미지 커서 이동 css
            $('.centralSvg').css('left','0px')
            $('.centralSvg').css('top','0px')
            $(this).attr('class','plusBtn 1X')
            $('.centralSvg').css('transform','scale(1.375)')
            $('#2Fstore_name text').show()
            $('#3Fstore_name text').show()
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 1X'){
            $(this).attr('class','plusBtn 2X')
            $('.centralSvg').css('transform','scale(1.75)')
            $('#2Fstore_name text').css('font-size','14')
            $('#3Fstore_name text').css('font-size','14')
            $('#store_name text').css('font-size','14')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 2X'){
            $(this).attr('class','plusBtn 3X')
            $('.centralSvg').css('transform','scale(2.125)')
            $('#2Fstore_name text').css('font-size','15')
            $('#3Fstore_name text').css('font-size','15')
            $('#store_name text').css('font-size','15')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 3X'){
            $(this).attr('class','plusBtn 4X')
            $('.centralSvg').css('transform','scale(2.5)')
            $('#store_name text').css('font-size','16')
            $('#2Fstore_name text').css('font-size','16')
            $('#3Fstore_name text').css('font-size','16')
        }
    })

    $('#zoomOut').on('click',function(){
        if($('#zoomIn').attr('class') == 'plusBtn 1X'){
            // $('.centralSvg').removeClass('fullOne')
            $('.centralSvg').css('transform','')
            $('#zoomIn').attr('class', 'plusBtn')
            $('.centralSvg').css('left','')
            $('.centralSvg').css('top','')
            $('#store_name text').hide()
            $('#2Fstore_name text').hide()
            $('#3Fstore_name text').hide()
            // $('#store_name text').css('font-size','16')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 2X'){
            $('#zoomIn').attr('class', 'plusBtn 1X')
            $('.centralSvg').css('transform','scale(1.375)')
            $('#store_name text').css('font-size','13')
            $('#2Fstore_name text').css('font-size','13')
            $('#3Fstore_name text').css('font-size','13')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 3X'){
            $('#zoomIn').attr('class', 'plusBtn 2X')
            $('.centralSvg').css('transform','scale(1.75)')
            $('#store_name text').css('font-size','14')
            $('#2Fstore_name text').css('font-size','14')
            $('#3Fstore_name text').css('font-size','14')
        }
        else if($('#zoomIn').attr('class') == 'plusBtn 4X'){
            $('#zoomIn').attr('class', 'plusBtn 3X')
            $('.centralSvg').css('transform','scale(2.125)')
            $('#store_name text').css('font-size','15')
            $('#2Fstore_name text').css('font-size','15')
            $('#3Fstore_name text').css('font-size','15')
        }
    })

    $('#zoomReset').on('click',function(){
        $('.centralSvg').css('transform','')
        $('.centralSvg').css('left','')
        $('.centralSvg').css('top','')
        $('#zoomIn').attr('class', 'plusBtn')
        $('#store_name text').hide()
        $('#2Fstore_name text').hide()
        $('#3Fstore_name text').hide()
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

    //svg파일 클래스,텍스트 매칭
    function svgLocation(){
        let storeList = JSON.parse(localStorage.getItem('storeInfo'))
        $('#2Fstore path').each(function(){
            let svg3FStore = $(this).attr('id').replace('h','')
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''))
                }
            }
        })
        $('#2Fstore_name text').each(function(){
            let svg3FStoreName = $(this).attr('id').replace('h','').replace('-2','')
            //console.log(storeList)
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStoreName){
                    if($('#kor').hasClass('choose')){
                        $(this).children('tspan').text(storeList[i].BS_NameKor)
                    }else{
                        $(this).children('tspan').text(storeList[i].BS_NameEng)
                    }
                    
                }
            }
        })
        $('#3Fstore path').each(function(){
            let svg3FStore = $(this).attr('id').replace('h','')
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''))
                }
            }
        })
        $('#3Fstore_name text').each(function(){
            let svg3FStoreName = $(this).attr('id').replace('h','').replace('-2','')
            //console.log(storeList)
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStoreName){
                    if($('#kor').hasClass('choose')){
                        $(this).children('tspan').text(storeList[i].BS_NameKor)
                    }else{
                        $(this).children('tspan').text(storeList[i].BS_NameEng)
                    }
                    
                }
            }
        })
    }
    svgLocation();
//*** 중앙 svg 스크립트 종료 ***