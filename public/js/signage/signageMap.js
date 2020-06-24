//*** 중앙 svg 스크립트 ***

    //이미지 확대
    let img_L = 0;
    let img_T = 0;
    let m_left = [];
    let m_top = [];
    let targetObj;
    function getLeft(o){
        return parseInt(o.style.left.replace('px', ''));
    }
    function getTop(o){
        return parseInt(o.style.top.replace('px', ''));
    }

    //마우스 끌기 이벤트 
    // // 드래그 시작
    // function startDrag(e, obj){
    //     targetObj = obj;
    //     let e_obj = window.event? window.event : e;
    //     img_L = getLeft(obj) - e_obj.clientX;
    //     img_T = getTop(obj) - e_obj.clientY;
        
    //     document.onmousemove = moveDrag;
    //     document.onmouseup = stopDrag;
    //     if(e_obj.preventDefault)e_obj.preventDefault();
    // }
    // // 드래그 멈추기
    // function stopDrag(){
    //     document.onmousemove = null;
    //     document.onmouseup = null;
    // }
    // // 이미지 움직이기
    // function moveDrag(e){
    //     let e_obj = window.event? window.event : e;
    //     let dmvx = parseInt(e_obj.clientX + img_L);
    //     let dmvy = parseInt(e_obj.clientY + img_T);
        
    //     console.log('터치', img_L);
    //     // console.log('터치움직', document.ontouchmove);
    //     targetObj.style.left = dmvx +"px";
    //     targetObj.style.top = dmvy +"px";
    //     return false;
    // }

    targetObj = document.getElementsByClassName('centralSvg1F')[0]

    //터치 종료
    function cancelEnd(e){
        m_left = [];
        m_top = [];
    }
    

    targetObj = document.getElementsByClassName('centralSvg1F')[0]
    // 터치 이미지 움직이기
    function moveImg(e){
        // clearTimeout(refresh);
        // console.log(targetObj);
        let e_obj = window.event? window.event : e;
        img_L = getLeft(targetObj);
        img_T = getTop(targetObj);
        let clientX = e_obj.touches[0].clientX;
        let clientY = e_obj.touches[0].clientY;

        // console.log('gg');
        
        if( m_left.length < 2 || m_top.length < 2 ){
            m_left.push(clientX);
            m_top.push(clientY);
            return false;
        }

        let prev_L = m_left.shift();
        let prev_T = m_top.shift();

        let dmvx = parseInt(clientX - prev_L);
        let dmvy = parseInt(clientY - prev_T);
        
        targetObj.style.left = img_L + dmvx +"px";
        targetObj.style.top = img_T + dmvy +"px";

        // refreshTimeout();
        return false;
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
    let $center_left_1f = $('.centerLeft1F')
    let $central_map_1f = $('.centralMap1F')
    let $center_left_2f = $('.centerLeft2F')
    let $central_map_2f = $('.centralMap2F')
    let $center_left_3f = $('.centerLeft3F')
    let $central_map_3f = $('.centralMap3F')
    $1f_store_name.hide();
    $2f_store_name.hide();
    $3f_store_name.hide();

    //줌인
    function zoomIn(){
        //이미지 커서 이동 css
        if($center_left_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '12px'){
            storeMapSize(1,13,1.5);
            $central_svg_1f.css('left','0px');
            $central_svg_1f.css('top','0px');
            return false;
        }
        else if($center_left_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '12px'){
            storeMapSize(2,13,1.5);
            $central_svg_2f.css('left','0px');
            $central_svg_2f.css('top','0px');
            return false;
        }
        else if($center_left_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '12px'){
            storeMapSize(3,13,1.5);
            $central_svg_3f.css('left','0px');
            $central_svg_3f.css('top','0px');
            return false;
        }
        
        //2줌
        if($center_left_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '13px'){
            storeMapSize(1,14,2.0);
            return false;
        }
        else if($center_left_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '13px'){
            storeMapSize(2,14,2.0);
            return false;
        }
        else if($center_left_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '13px'){
            storeMapSize(3,14,2.0);
            return false;
        }
        
        //3줌
        if($center_left_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '14px'){
            storeMapSize(1,15,2.5);
            return false;
        }
        else if($center_left_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '14px'){
            storeMapSize(2,15,2.5);
            return false;
        }
        else if($center_left_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '14px'){
            storeMapSize(3,15,2.5);
            return false;
        }
        

        //4줌
        if($center_left_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '15px'){
            storeMapSize(1,16,3.0);
            return false;
        }
        else if($center_left_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '15px'){
            storeMapSize(2,16,3.0);
            return false;
        }
        else if($center_left_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '15px'){
            storeMapSize(3,16,3.0);
            return false;
        }
        
    }

//줌 아웃
    function zoomOut(){
        //1줌
        if($center_left_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '13px'){
            zoomReset();
        }
        else if($center_left_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '13px'){
            zoomReset();
        }
        else if($center_left_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '13px'){
            zoomReset();
        }

        //2줌
        if($center_left_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '14px'){
            storeMapSize(1,13,1.5);
            return false;
        }
        else if($center_left_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '14px'){
            storeMapSize(2,13,1.5);
            return false;
        }
        else if($center_left_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '14px'){
            storeMapSize(3,13,1.5);
            return false;
        }
    
        //3줌
        if($center_left_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '15px'){
            storeMapSize(1,14,2.0);
            return false;
        }
        else if($center_left_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '15px'){
            storeMapSize(2,14,2.0);
            return false;
        }
        else if($center_left_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '15px'){
            storeMapSize(3,14,2.0);
            return false;
        }
    
        //4줌
        if($center_left_1f.css('display') == 'block' && $1f_store_name.css('font-size') == '16px'){
            storeMapSize(1,15,2.5);
            return false;
        }
        else if($center_left_2f.css('display') == 'block' && $2f_store_name.css('font-size') == '16px'){
            storeMapSize(2,15,2.5);
            return false;
        }
        else if($center_left_3f.css('display') == 'block' && $3f_store_name.css('font-size') == '16px'){
            storeMapSize(3,15,2.5);
            return false;
        }
        
    }

    //지도 사이즈
    function storeMapSize(floor,size,scale){
        $('.centralSvg'+floor+'F').css('transform','scale('+scale+')');
        $('#'+floor+'Fstore_name text').css('font-size',size);
        //$('#'+floor+'Fstore').css('cursor','pointer');
        $('#'+floor+'Fstore_name text').show();
    }

//리셋
    function zoomReset(){
        $('#zoomIn').attr('class', 'plusBtn')
        if($center_left_1f.css('display') == 'block'){
            storeMapSize(1,12,1);
            $1f_store_name.hide();
            $('#1Fstore').css('cursor','');
            $central_svg_1f.css('left','');
            $central_svg_1f.css('top','');
            $center_left_1f.css('width','100%')
        }
        else if($center_left_2f.css('display') == 'block'){
            storeMapSize(2,12,1);
            $2f_store_name.hide();
            $('#2Fstore').css('cursor','');
            $central_svg_2f.css('left','');
            $central_svg_2f.css('top','');
            $center_left_2f.css('width','100%')
        }
        else if($center_left_3f.css('display') == 'block'){
            storeMapSize(3,12,1);
            $3f_store_name.hide();
            $('#3Fstore').css('cursor','');
            $central_svg_3f.css('left','');
            $central_svg_3f.css('top','');
            $center_left_3f.css('width','100%')
        }   
    }

    //층수 클릭
    $('.floorBtn div').on('click',function(e){
        let nowFloor = e.target.id;
        localStorage.removeItem('scale_down');
        localStorage.removeItem('scale_test'); 
        $('.floorBtn div').removeClass('floorSelect');
        $('#'+nowFloor).addClass('floorSelect');
        if(nowFloor == 'floor1Btn'){
            $center_left_1f.css('display','block');
            $center_left_2f.css('display','none');
            $center_left_3f.css('display','none');
            $nowFloor.text('1F');
            targetObj = document.getElementsByClassName('centralSvg1F')[0]
            el=document.getElementsByClassName('centralSvg1F')[0]
            init(1);
        }else if(nowFloor == 'floor2Btn'){
            $center_left_1f.css('display','none');
            $center_left_2f.css('display','block');
            $center_left_3f.css('display','none');
            $nowFloor.text('2F');
            targetObj = document.getElementsByClassName('centralSvg2F')[0]
            el=document.getElementsByClassName('centralSvg2F')[0]
            init(2);
        }else if(nowFloor == 'floor3Btn'){
            $center_left_1f.css('display','none');
            $center_left_2f.css('display','none');
            $center_left_3f.css('display','block');
            $nowFloor.text('3F');
            targetObj = document.getElementsByClassName('centralSvg3F')[0]
            el=document.getElementsByClassName('centralSvg3F')[0]
            init(3);
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

// 핀치 줌 
    let evCache = new Array();
    let prevDiff = -1;
    let el = document.getElementsByClassName('centralSvg1F')[0];
    function init(floor) {
        
        el.onpointerdown = pointerdown_handler;
        el.onpointermove = pointermove_handler;

        el.onpointerup = pointerup_handler;
        el.onpointercancel = pointerup_handler;
        el.onpointerout = pointerup_handler;
        el.onpointerleave = pointerup_handler;
    }


    function pointerdown_handler(ev) {
        evCache.push(ev);
    }

    //핀치줌 이벤트
    function pointermove_handler(ev) {
        
        for (var i = 0; i < evCache.length; i++) {
            if (ev.pointerId == evCache[i].pointerId) {
                evCache[i] = ev;
                break;
            }
        }

        
        let now_floor;
        if($('#floor1Btn').hasClass('floorSelect') == true){
            now_floor = 1;
        }else if($('#floor2Btn').hasClass('floorSelect') == true){
            now_floor = 2;
        }else if($('#floor3Btn').hasClass('floorSelect') == true){
            now_floor = 3;
        }

        if (evCache.length == 2) {
            // let location_x 
            // let location_y 
            let location_x = Math.abs(evCache[0].clientX - evCache[1].clientX);
            let location_y = Math.abs(evCache[0].clientY - evCache[1].clientY);
            let now_scale = ev.currentTarget.style.transform.replace('scale(','').replace(')','')

            let move_scale;
            let up_scale;
            let down_scale;

            move_scale = (location_y + location_x) / 2000;
            
            down_scale = Number(now_scale) - move_scale
            
            up_scale = Number(now_scale) + move_scale
            
            
            //줌인
            if (prevDiff > 0) {
                if (move_scale > prevDiff) {
                    
                    //현재 확대할 줌이 현재 사이즈 보다 클때 줌 
                    if(Number(up_scale) > Number(localStorage.getItem('scale_test'))){
                        
                        zoom(ev, up_scale, now_floor)
                        //현재 사이즈 값 로컬에 저장
                        localStorage.setItem('scale_test',up_scale)
                    }
                }

                //줌 아웃

                if (move_scale < prevDiff) {
                    //현재 축소할 줌이 현재 사이즈 보다 클때 축소 
                    if(Number(down_scale) > Number(localStorage.getItem('scale_down'))){
                        localStorage.setItem('scale_down',down_scale)
                        //현재 사이즈 값 로컬에 저장
                        zoom(ev, down_scale, now_floor)
                    }
                }
            }
            prevDiff = move_scale;
        }
    }

    //확대할 줌
    function zoom(ev, now_scale,now_floor){
            //svg파일 좌표 지정
            ev.currentTarget.style.left = '0px';
            ev.currentTarget.style.top = '0px';

            $('#'+now_floor+'Fstore_name text').css('font-size','14px');
            $('#'+now_floor+'Fstore_name text').show();

            //확대크기 지정
            ev.currentTarget.style.transform = 'scale('+now_scale+')';
            localStorage.removeItem('scale_down');
            localStorage.removeItem('scale_test');
            //확대가 3배가 이상일때 3배로 고정
            if(now_scale >= 3){
                ev.currentTarget.style.transform = 'scale(3.0)';
                return;

            //1배 이하일때 1배로 고정 및 좌표값 삭제
            }else if(now_scale <= 1){
                $('#'+now_floor+'Fstore_name text').hide();
                // ev.currentTarget.style.transform = 'scale(1.0)';
                zoomReset();
                ev.currentTarget.style.left = '';
                ev.currentTarget.style.top = '';
                return;
            }



    }


    function pointerup_handler(ev) {
        log(ev.type, ev);
        remove_event(ev);
        if (evCache.length < 2) {
            prevDiff = -1;
        }
    }

    function remove_event(ev) {
        for (var i = 0; i < evCache.length; i++) {
            if (evCache[i].pointerId == ev.pointerId) {
                evCache.splice(i, 1);
                break;
            }
        }
    }

    var logEvents = false;

    function log(prefix, ev) {
        if (!logEvents) return;
        var o = document.getElementsByTagName('output')[0];
        var s = prefix + ": pointerID = " + ev.pointerId +
        " ; pointerType = " + ev.pointerType +
        " ; isPrimary = " + ev.isPrimary;
        o.innerHTML += s + " ";
    } 

