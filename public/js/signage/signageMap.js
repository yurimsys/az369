//*** 중앙 svg 스크립트 ***
// $("body").contextmenu( function() {

//     return false;
    
//     });

//우클릭 방지
    // $("body").contextmenu( function() {

    //     return false;
    
    // });

    //이미지 확대
    //처음 이미지의 위치 변수
    let img_L = 0;
    let img_T = 0;
    //이동중인 이미지의 위치 배열
    let m_left = [];
    let m_top = [];
    let targetObj;
    function getLeft(o){
        return parseInt(o.style.left.replace('px', ''));
    }
    function getTop(o){
        return parseInt(o.style.top.replace('px', ''));
    }

    /* 각 central1F, central2F, central3F에 <svg viewBox = ... 에 함수가 지정되어있음 */
    //마우스 끌기 이벤트 
    // // 드래그 시작
    function startDrag(e, obj){
        targetObj = obj;
        let e_obj = window.event? window.event : e;

        //현재 이미지 위치를 구함
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
    // 이미지 움직이기
    function moveDrag(e){
        let e_obj = window.event? window.event : e;
        let dmvx = parseInt(e_obj.clientX + img_L);
        let dmvy = parseInt(e_obj.clientY + img_T);
        
        // console.log('터치', img_L);
        // console.log('터치움직', document.ontouchmove);
        targetObj.style.left = dmvx +"px";
        targetObj.style.top = dmvy +"px";
        return false;
    }

    //터치 이벤트

    targetObj = document.getElementsByClassName('centralSvg1F')[0]

    //터치 종료
    function cancelEnd(e){
        e.preventDefault();

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
    //각 지도 호실별 카테고리 클래스
    let $svgCat = $('.svgCat');
    //1층 svg 파일
    let $central_svg_1f = $('.centralSvg1F');
    //2층 svg 파일
    let $central_svg_2f = $('.centralSvg2F');
    //3층 svg 파일
    let $central_svg_3f = $('.centralSvg3F');
    //1층 svg파일 내에 매장명
    let $1f_store_name = $('#1Fstore_name text');
    //2층 svg파일 내에 매장명
    let $2f_store_name = $('#2Fstore_name text');
    //3층 svg파일 내에 매장명
    let $3f_store_name = $('#3Fstore_name text');
    //1층 svg파일 내에 호실
    let $1f_store_path = $('#1Fstore path');
    //2층 svg파일 내에 호실
    let $2f_store_path = $('#2Fstore path');
    //3층 svg파일 내에 호실
    let $3f_store_path = $('#3Fstore path');
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

    //줌인 중앙 네비게이션 + 버튼
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
        
        //2배줌
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
        
        //3배줌
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
        

        //4배줌
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

    //지도 리셋
    function zoomReset(){
        $('#zoomIn').attr('class', 'plusBtn')
        //1층이 활성화 되어있는 경우
        if($center_left_1f.css('display') == 'block'){
            storeMapSize(1,12,1);
            $1f_store_name.hide();
            $('#1Fstore').css('cursor','');
            $central_svg_1f.css('left','');
            $central_svg_1f.css('top','');
            $center_left_1f.css('width','100%')
        }
        //2층이 활성화 되어있는 경우
        else if($center_left_2f.css('display') == 'block'){
            storeMapSize(2,12,1);
            $2f_store_name.hide();
            $('#2Fstore').css('cursor','');
            $central_svg_2f.css('left','');
            $central_svg_2f.css('top','');
            $center_left_2f.css('width','100%')
        }
        //3층이 활성화 되어있는 경우
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
        //저장된 확대, 축소값을 제거
        localStorage.removeItem('scale_down');
        localStorage.removeItem('scale_up'); 
        $('.floorBtn div').removeClass('floorSelect');
        $('#'+nowFloor).addClass('floorSelect');
        //1층의 경우
        if(nowFloor == 'floor1Btn'){
            $center_left_1f.css('display','block');
            $center_left_2f.css('display','none');
            $center_left_3f.css('display','none');
            $nowFloor.text('1F');
            targetObj = document.getElementsByClassName('centralSvg1F')[0]
            el=document.getElementsByClassName('centralSvg1F')[0]
            init(1);
        }
        //2층의 경우
        else if(nowFloor == 'floor2Btn'){
            console.log('gooooooooooo2f');
            console.log($center_left_2f.css('display'));
            $center_left_1f.css('display','none');
            $center_left_2f.css('display','block');
            $center_left_3f.css('display','none');
            $nowFloor.text('2F');
            targetObj = document.getElementsByClassName('centralSvg2F')[0]
            el=document.getElementsByClassName('centralSvg2F')[0]
            init(2);
        }
        //3층의 경우
        else if(nowFloor == 'floor3Btn'){
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
        let storeList_length = storeList.length;
        //상가 호수에 카테고리명 클래스 입력
        $1f_store_path.each(function(){
            //상가 호수를 돌려서 data와 동일할시
            // let svg1FStore = $(this).attr('id').replace('h','');
            let svg1FStore = this.id.replace('h','');

            for(let i=0; i<storeList_length; i++){
                if(storeList[i].LS_Number == svg1FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''));
                }
            }
        })
        //상가 호수에 브랜드명 입력
        $1f_store_name.each(function(){
            let svg2FStoreName = this.id.replace('h','').replace('-2','');
            for(let i=0; i<storeList_length; i++){
                if(storeList[i].LS_Number == svg2FStoreName){
                    // $eng.hasClass('choose') ? $(this).children('tspan').text(storeList[i].BS_NameKor) : $(this).children('tspan').text(storeList[i].BS_NameEng);
                    $eng.hasClass('choose') ? this.children[0].innerHTML = storeList[i].BS_NameKor : this.children[0].innerHTML = storeList[i].BS_NameEng;
                }
            }
        })
        //상가 호수에 카테고리명 클래스 입력
        $2f_store_path.each(function(){
            let svg3FStore = this.id.replace('h','');
            for(let i=0; i<storeList_length; i++){
                if(storeList[i].LS_Number == svg3FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''));
                }
            }
        })
        //상가 호수에 브랜드명 입력
        $2f_store_name.each(function(){
            let svg2FStoreName = this.id.replace('h','').replace('-2','');
            for(let i=0; i<storeList_length; i++){
                if(storeList[i].LS_Number == svg2FStoreName){
                    $eng.hasClass('choose') ? this.children[0].innerHTML = storeList[i].BS_NameKor : this.children[0].innerHTML = storeList[i].BS_NameEng;
                }
            }
        })
        //상가 호수에 카테고리명 클래스 입력
        $3f_store_path.each(function(){
            let svg3FStore = this.id.replace('h','');
            for(let i=0; i<storeList_length; i++){
                if(storeList[i].LS_Number == svg3FStore){
                    $(this).addClass('svgCat '+storeList[i].BC_NameEng.replace(/ /g, ''));
                }
            }
        })
        //상가 호수에 브랜드명 입력
        $3f_store_name.each(function(){
            let svg3FStoreName = this.id.replace('h','').replace('-2','');
            for(let i=0; i<storeList_length; i++){
                if(storeList[i].LS_Number == svg3FStoreName){
                    $eng.hasClass('choose') ? this.children[0].innerHTML = storeList[i].BS_NameKor : this.children[0].innerHTML = storeList[i].BS_NameEng;
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
        ev.preventDefault();
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

            //줌한 값 
            // console.log('test',location_x + location_y);
            move_scale = (location_x + location_y) / 2000;

            down_scale = Number(now_scale) - move_scale
            up_scale = Number(now_scale) + move_scale
            
            //prevDiff의 기본값은 -1 처음 확대 및 축소를 해야 맨 아래줄에서 재선언 됨
            //확대, 축소할 값
            let event_move;
            if (prevDiff > 0) {
                //줌인
                if (move_scale > prevDiff) {
                    //현재 확대할 줌이 현재 사이즈 보다 클때 줌 
                    if(Number(up_scale) > Number(localStorage.getItem('scale_up'))){
                        
                        //배열에 저장후 터치를 뗀 후(?) 몇초내에 움직이지 않는 경우(?) 마지막 값을 실행
                        //현재 사이즈 값 로컬에 저장
                        localStorage.setItem('scale_up',up_scale);
                        event_move = up_scale;
                        // zoom(ev, up_scale, now_floor)
                    }
                }

                //줌 아웃
                if (move_scale < prevDiff) {
                    //현재 축소할 줌이 현재 사이즈 보다 클때 축소 
                    if(Number(down_scale) > Number(localStorage.getItem('scale_down'))){
                        //현재 사이즈 값 로컬에 저장
                        
                        localStorage.setItem('scale_down',down_scale);
                        event_move = down_scale;
                        // zoom(ev, down_scale, now_floor)
                    }
                }
                zoom(ev, event_move, now_floor);
            }
            // if(prevDiff > 1){
            //     zoom(ev, event_move, now_floor)
            // }
            
            //처음 확대 및 축소했을때의 값을 prevDiff에 저장 이후 위의 조건문으로 돌아감
            prevDiff = move_scale;
        }
    }

    
    //확대할 줌
    function zoom(ev, now_scale,now_floor){
        ev.preventDefault();
        //svg파일 좌표 지정 삭제 시 확대 후 움직이지 않음
        ev.currentTarget.style.left = '0px';
        ev.currentTarget.style.top = '0px';

        $('#'+now_floor+'Fstore_name text').css('font-size','14px');
        $('#'+now_floor+'Fstore_name text').show();
        
        //확대크기 지정
        ev.currentTarget.style.transform = 'scale('+now_scale+')';
        //이전 확대,축소값 제거
        localStorage.removeItem('scale_down');
        localStorage.removeItem('scale_up');
        //확대가 3배가 이상일때 3배로 고정
        if(now_scale >= 3){
            ev.currentTarget.style.transform = 'scale(3.0)';
            return false;

        //1배 이하일때 1배로 고정 및 좌표값 삭제
        }else if(now_scale <= 1.1){
            ev.preventDefault();
            $('#'+now_floor+'Fstore_name text').hide();
            //1배 화면으로 고정
            ev.currentTarget.style.transform = 'scale(1.0)';
            //1배 일때는 터치로 하여 움직임이 불가능 하도록 설정
            ev.currentTarget.style.left = '';
            ev.currentTarget.style.top = '';
            return false;
        }

    }


    function pointerup_handler(ev) {
        log(ev.type, ev);
        remove_event(ev);
        //현재 터치된 수의 갯수가 2개 미만이면 터치 아웃
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
    //로그기록 사용하지않음
    function log(prefix, ev) {
        if (!logEvents) return;
        var o = document.getElementsByTagName('output')[0];
        var s = prefix + ": pointerID = " + ev.pointerId +
        " ; pointerType = " + ev.pointerType +
        " ; isPrimary = " + ev.isPrimary;
        o.innerHTML += s + " ";
    } 

