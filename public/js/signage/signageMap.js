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
 
    let $svgCat = $('.svgCat')
    let $central_svg_1f = $('.centralSvg1F')
    let $central_svg_2f = $('.centralSvg2F')
    let $central_svg_3f = $('.centralSvg3F')
    let $1f_store_name = $('#1Fstore_name text')
    let $2f_store_name = $('#2Fstore_name text')
    let $3f_store_name = $('#3Fstore_name text')
    let $1f_store_path = $('#1Fstore path')
    let $2f_store_path = $('#2Fstore path')
    let $3f_store_path = $('#3Fstore path')
    let $centralSvg = $('.centralSvg')
    let $nowFloor = $('#nowFloor')
    $1f_store_name.hide();
    $2f_store_name.hide();
    $3f_store_name.hide();
    //줌인
    function zoomIn(){
        //이미지 커서 이동 css
        if($central_svg_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '12px'){
            storeMapSize(1,13,1.5);
            $central_svg_1f.css('left','0px');
            $central_svg_1f.css('top','0px');
            return false;
        }
        else if($central_svg_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '12px'){
            storeMapSize(2,13,1.5);
            $central_svg_2f.css('left','0px');
            $central_svg_2f.css('top','0px');
            return false;
        }
        else if($central_svg_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '12px'){
            storeMapSize(3,13,1.5);
            $central_svg_3f.css('left','0px');
            $central_svg_3f.css('top','0px');
            return false;
        }
        
        //2줌
        if($central_svg_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '13px'){
            storeMapSize(1,14,2.0);
            return false;
        }
        else if($central_svg_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '13px'){
            storeMapSize(2,14,2.0);
            return false;
        }
        else if($central_svg_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '13px'){
            storeMapSize(3,14,2.0);
            return false;
        }
        
        //3줌
        if($central_svg_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '14px'){
            storeMapSize(1,15,2.5);
            return false;
        }
        else if($central_svg_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '14px'){
            storeMapSize(2,15,2.5);
            return false;
        }
        else if($central_svg_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '14px'){
            storeMapSize(3,15,2.5);
            return false;
        }
        

        //4줌
        if($central_svg_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '15px'){
            storeMapSize(1,16,3.0);
            return false;
        }
        else if($central_svg_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '15px'){
            storeMapSize(2,16,3.0);
            return false;
        }
        else if($central_svg_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '15px'){
            storeMapSize(3,16,3.0);
            return false;
        }
        
    }

//줌 아웃
    function zoomOut(){
        //1줌
        if($central_svg_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '13px'){
            zoomReset();
        }
        else if($central_svg_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '13px'){
            zoomReset();
        }
        else if($central_svg_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '13px'){
            zoomReset();
        }

        //2줌
        if($central_svg_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '14px'){
            storeMapSize(1,13,1.5);
            return false;
        }
        else if($central_svg_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '14px'){
            storeMapSize(2,13,1.5);
            return false;
        }
        else if($central_svg_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '14px'){
            storeMapSize(3,13,1.5);
            return false;
        }
    
        //3줌
        if($central_svg_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '15px'){
            storeMapSize(1,14,2.0);
            return false;
        }
        else if($central_svg_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '15px'){
            storeMapSize(2,14,2.0);
            return false;
        }
        else if($central_svg_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '15px'){
            storeMapSize(3,14,2.0);
            return false;
        }
    
        //4줌
        if($central_svg_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '16px'){
            storeMapSize(1,15,2.5);
            return false;
        }
        else if($central_svg_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '16px'){
            storeMapSize(2,15,2.5);
            return false;
        }
        else if($central_svg_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '16px'){
            storeMapSize(3,15,2.5);
            return false;
        }
        
    }

    //지도 사이즈
    function storeMapSize(floor,size,scale){
        // console.log(size,'사이즈');
        $('.centralSvg'+floor+'F').css('transform','scale('+scale+')');
        $('#'+floor+'Fstore_name text').css('font-size',size);
        // console.log('여기',$('#'+floor+'Fstore_name text').css('font-size',size));
        //$('#'+floor+'Fstore').css('cursor','pointer');
        $('#'+floor+'Fstore_name text').show();
    }

//리셋
    function zoomReset(){
        $('#zoomIn').attr('class', 'plusBtn')
        if($central_svg_1f.css('display') == 'block'){
            storeMapSize(1,12,1);
            $1f_store_name.hide();
            $('#1Fstore').css('cursor','');
            $central_svg_1f.css('left','');
            $central_svg_1f.css('top','');
        }
        else if($central_svg_2f.css('display') == 'block'){
            storeMapSize(2,12,1);
            $2f_store_name.hide();
            $('#2Fstore').css('cursor','');
            $central_svg_2f.css('left','');
            $central_svg_2f.css('top','');
        }
        else if($central_svg_3f.css('display') == 'block'){
            storeMapSize(3,12,1);
            $3f_store_name.hide();
            $('#3Fstore').css('cursor','');
            $central_svg_3f.css('left','');
            $central_svg_3f.css('top','');
        }   
    }

    //층수 클릭
    $('.floorBtn div').on('click',function(e){
        let nowFloor = e.target.id;
        $('.floorBtn div').removeClass('floorSelcet');
        $('#'+nowFloor).addClass('floorSelcet');
        if(nowFloor == 'floor1Btn'){
            $central_svg_1f.css('display','block');
            $central_svg_2f.css('display','none');
            $central_svg_3f.css('display','none');
            $nowFloor.text('1F');
        }else if(nowFloor == 'floor2Btn'){
            $central_svg_1f.css('display','none');
            $central_svg_2f.css('display','block');
            $central_svg_3f.css('display','none');
            $nowFloor.text('2F');
        }else if(nowFloor == 'floor3Btn'){
            $central_svg_1f.css('display','none');
            $central_svg_2f.css('display','none');
            $central_svg_3f.css('display','block');
            $nowFloor.text('3F');
        }
    })    


    
    //svg파일 클래스,텍스트 매칭
    function svgLocation(){
        let storeList = JSON.parse(localStorage.getItem('storeInfo'));
        //상가 호수에 카테고리명 클래스 입력
        $1f_store_path.each(function(){
            let svg1FStore = $(this).attr('id').replace('h','');
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg1FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''));
                }
            }
        })
        //상가 호수에 브랜드명 입력
        $1f_store_name.each(function(){
            let svg2FStoreName = $(this).attr('id').replace('h','').replace('-2','');
            //console.log(storeList)
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg2FStoreName){
                    $('#eng').hasClass('choose') ? $(this).children('tspan').text(storeList[i].BS_NameKor) : $(this).children('tspan').text(storeList[i].BS_NameEng);
                }
            }
        })
        //상가 호수에 카테고리명 클래스 입력
        $2f_store_path.each(function(){
            let svg3FStore = $(this).attr('id').replace('h','');
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''));
                }
            }
        })
        //상가 호수에 브랜드명 입력
        $2f_store_name.each(function(){
            let svg2FStoreName = $(this).attr('id').replace('h','').replace('-2','');
            //console.log(storeList)
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg2FStoreName){
                    $('#eng').hasClass('choose') ? $(this).children('tspan').text(storeList[i].BS_NameKor) : $(this).children('tspan').text(storeList[i].BS_NameEng); 
                }
            }
        })
        //상가 호수에 카테고리명 클래스 입력
        $3f_store_path.each(function(){
            let svg3FStore = $(this).attr('id').replace('h','');
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''));
                }
            }
        })
        //상가 호수에 브랜드명 입력
        $3f_store_name.each(function(){
            let svg3FStoreName = $(this).attr('id').replace('h','').replace('-2','');
            //console.log(storeList)
            for(let i=0; i<storeList.length; i++){
                if(storeList[i].LS_Number == svg3FStoreName){
                    $('#eng').hasClass('choose') ? $(this).children('tspan').text(storeList[i].BS_NameKor) : $(this).children('tspan').text(storeList[i].BS_NameEng);
                }
            }
        })
    }
    $(document).ready(function(){
        svgLocation();
    })
    
//*** 중앙 svg 스크립트 종료 ***