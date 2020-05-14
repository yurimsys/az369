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
    $('#1Fstore_name text').hide()
    $('#2Fstore_name text').hide()
    $('#3Fstore_name text').hide()


    //줌인
    function zoomIn(){
        //이미지 커서 이동 css

        if($('.centralSvg1F').css('display') == 'block' && $('#1Fstore_name text').css('font-size') == '12px'){
            storeMapSize(1,13,1.375)
            $('.centralSvg').css('left','0px')
            $('.centralSvg').css('top','0px')
            return false;
        }
        else if($('.centralSvg2F').css('display') == 'block' && $('#2Fstore_name text').css('font-size') == '12px'){
            storeMapSize(2,13,1.375)
            $('.centralSvg').css('left','0px')
            $('.centralSvg').css('top','0px')
            return false;
        }
        else if($('.centralSvg3F').css('display') == 'block' && $('#3Fstore_name text').css('font-size') == '12px'){
            storeMapSize(3,13,1.375)
            $('.centralSvg').css('left','0px')
            $('.centralSvg').css('top','0px')
            return false;
        }
        
        //2줌
        if($('.centralSvg1F').css('display') == 'block' && $('#1Fstore_name text').css('font-size') == '13px'){
            storeMapSize(1,14,1.75)
            return false;
        }
        else if($('.centralSvg2F').css('display') == 'block' && $('#2Fstore_name text').css('font-size') == '13px'){
            storeMapSize(2,14,1.75)
            return false;
        }
        else if($('.centralSvg3F').css('display') == 'block' && $('#3Fstore_name text').css('font-size') == '13px'){
            storeMapSize(3,14,1.75)
            return false;
        }
        
        //3줌
        if($('.centralSvg1F').css('display') == 'block' && $('#1Fstore_name text').css('font-size') == '14px'){
            storeMapSize(1,15,2.125)
            return false;
        }
        else if($('.centralSvg2F').css('display') == 'block' && $('#2Fstore_name text').css('font-size') == '14px'){
            storeMapSize(2,15,2.125)
            return false;
        }
        else if($('.centralSvg3F').css('display') == 'block' && $('#3Fstore_name text').css('font-size') == '14px'){
            storeMapSize(3,15,2.125)
            return false;
        }
        

        //4줌
        if($('.centralSvg1F').css('display') == 'block' && $('#1Fstore_name text').css('font-size') == '15px'){
            storeMapSize(1,16,2.5)
            return false;
        }
        else if($('.centralSvg2F').css('display') == 'block' && $('#2Fstore_name text').css('font-size') == '15px'){
            storeMapSize(2,16,2.5)
            return false;
        }
        else if($('.centralSvg3F').css('display') == 'block' && $('#3ㄹstore_name text').css('font-size') == '15px'){
            storeMapSize(3,16,2.5)
            return false;
        }
        
    }

//줌 아웃
    function zoomOut(){
        //1줌
        if($('.centralSvg1F').css('display') == 'block' && $('#1Fstore_name text').css('font-size') == '13px'){
            zoomReset();
        }
        else if($('.centralSvg1F').css('display') == 'block' && $('#2Fstore_name text').css('font-size') == '13px'){
            zoomReset();
        }
        else if($('.centralSvg1F').css('display') == 'block' && $('#3Fstore_name text').css('font-size') == '13px'){
            zoomReset();
        }

        //2줌
        if($('.centralSvg1F').css('display') == 'block' && $('#1Fstore_name text').css('font-size') == '14px'){
            storeMapSize(1,13,1.375)
            return false;
        }
        else if($('.centralSvg2F').css('display') == 'block' && $('#2Fstore_name text').css('font-size') == '14px'){
            storeMapSize(2,13,1.375)
            return false;
        }
        else if($('.centralSvg3F').css('display') == 'block' && $('#3Fstore_name text').css('font-size') == '14px'){
            storeMapSize(3,13,1.375)
            return false;
        }
    
        //3줌
        if($('.centralSvg1F').css('display') == 'block' && $('#1Fstore_name text').css('font-size') == '15px'){
            storeMapSize(1,14,1.75)
            return false;
        }
        else if($('.centralSvg2F').css('display') == 'block' && $('#2Fstore_name text').css('font-size') == '15px'){
            storeMapSize(2,14,1.75)
            return false;
        }
        else if($('.centralSvg3F').css('display') == 'block' && $('#3Fstore_name text').css('font-size') == '15px'){
            storeMapSize(3,14,1.75)
            return false;
        }
    
        //4줌
        if($('.centralSvg1F').css('display') == 'block' && $('#1Fstore_name text').css('font-size') == '16px'){
            storeMapSize(1,15,2.125)
            return false;
        }
        else if($('.centralSvg2F').css('display') == 'block' && $('#2Fstore_name text').css('font-size') == '16px'){
            storeMapSize(2,15,2.125)
            return false;
        }
        else if($('.centralSvg3F').css('display') == 'block' && $('#3Fstore_name text').css('font-size') == '16px'){
            storeMapSize(3,15,2.125)
            return false;
        }
        
    }

    //지도 사이즈
    function storeMapSize(floor,size,scale){
        $('.centralSvg'+floor+'F').css('transform','scale('+scale+')')
        $('#'+floor+'Fstore_name text').css('font-size',size)
        $('#'+floor+'Fstore').css('cursor','pointer');
        $('#'+floor+'Fstore_name text').show()
    }

//리셋
    function zoomReset(){
        if($('.centralSvg1F').css('display') == 'block'){
            storeMapSize(1,12,1)
            $('#1Fstore_name text').hide()
            $('#1Fstore').css('cursor','');
            $('#zoomIn').attr('class', 'plusBtn')
            $('.centralSvg').css('left','')
            $('.centralSvg').css('top','')
        }
        else if($('.centralSvg2F').css('display') == 'block'){
            storeMapSize(2,12,1)
            $('#2Fstore_name text').hide()
            $('#2Fstore').css('cursor','');
            $('#zoomIn').attr('class', 'plusBtn')
            $('.centralSvg').css('left','')
            $('.centralSvg').css('top','')
        }
        else if($('.centralSvg3F').css('display') == 'block'){
            storeMapSize(3,12,1)
            $('#3Fstore_name text').hide()
            $('#3Fstore').css('cursor','');
            $('#zoomIn').attr('class', 'plusBtn')
            $('.centralSvg').css('left','')
            $('.centralSvg').css('top','')
        }   
    }

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

        //상가 호수에 카테고리명 클래스 입력
        $('#1Fstore path').each(function(){
            let svg3FStore = $(this).attr('id').replace('h','')
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''))
                }
            }
        })
        //상가 호수에 브랜드명 입력
        $('#1Fstore_name text').each(function(){
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
        //상가 호수에 카테고리명 클래스 입력
        $('#2Fstore path').each(function(){
            let svg3FStore = $(this).attr('id').replace('h','')
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''))
                }
            }
        })
        //상가 호수에 브랜드명 입력
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
        //상가 호수에 카테고리명 클래스 입력
        $('#3Fstore path').each(function(){
            let svg3FStore = $(this).attr('id').replace('h','')
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''))
                }
            }
        })
        //상가 호수에 브랜드명 입력
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