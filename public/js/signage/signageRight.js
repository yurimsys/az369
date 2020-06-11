
//*** 메인 우측 하단 날씨, 시간,언어 선택 스크립트 ***
$(document).ready(function(){
    let default_url = urlParam();
    if(default_url.device_cd == undefined){
        location.href = 'http://az369.com/sign?device_cd=1fa'
    }
})



//현위치
    function nowLocation(){
        let nowLocation = urlParam();
        // $('#'+nowLocation.device_cd+ ' rect').css('fill','red')
        console.log(nowLocation.device_cd.substring(0,1));
        if(nowLocation.device_cd.substring(0,1) == 1){
            $central_svg_1f.css('display','block');
            $central_svg_2f.css('display','none');
            $central_svg_3f.css('display','none');
            $('#floor1Btn').addClass('floorSelcet');
            $nowFloor.text('1F');
        }
        else if(nowLocation.device_cd.substring(0,1) == 2){
            $central_svg_1f.css('display','none');
            $central_svg_2f.css('display','block');
            $central_svg_3f.css('display','none');
            $('#floor2Btn').addClass('floorSelcet');
            $nowFloor.text('2F');
        }
        else{
            $central_svg_1f.css('display','none');
            $central_svg_2f.css('display','none');
            $central_svg_3f.css('display','block');
            $('#floor3Btn').addClass('floorSelcet');
            $nowFloor.text('3F');
        }
        $('.'+nowLocation.device_cd).css('display','block')
        
    }
    nowLocation();
    //메인 돌아가기
    function signageMain(){
        //카테고리 초기화
        count = 0;
        mainPrev();
        $box_left.css('display','block');
        $box_center.css('display','block');
        $box_info.css('display','none');
        zoomReset();
        $categoryBtn.removeClass('selected');
        $('.svgCat').css('fill','');
        $('.floorBtn div').removeClass('floorSelcet');
        let deviceParam = urlParam();
        if(deviceParam.device_cd === undefined){
            $central_svg_1f.css('display','block');
            $central_svg_2f.css('display','none');
            $central_svg_3f.css('display','none');
            $('#floor1Btn').addClass('floorSelcet');
            $('#nowFloor').text('1F');
            location.href=location.origin+'/sign?device_cd=1fa';
        }
        else if(deviceParam.device_cd.substring(0,1) == '1'){
            $central_svg_1f.css('display','block');
            $central_svg_2f.css('display','none');
            $central_svg_3f.css('display','none');
            $('#floor1Btn').addClass('floorSelcet')
            $nowFloor.text('1F');
        }        
        else if(deviceParam.device_cd.substring(0,1) == '2'){
            
            $central_svg_1f.css('display','none');
            $central_svg_2f.css('display','block');
            $central_svg_3f.css('display','none');
            $('#floor2Btn').addClass('floorSelcet');
            $nowFloor.text('2F');
        }
        else if(deviceParam.device_cd.substring(0,1) == '3'){
            $central_svg_1f.css('display','none');
            $central_svg_2f.css('display','none');
            $central_svg_3f.css('display','block');
            $('#floor3Btn').addClass('floorSelcet');
            $nowFloor.text('3F');
        }
    }
    
//이용안내
    function signageInfo(){
        $box_left.css('display','none');
        $box_center.css('display','none');
        $box_info.css('display','block');
    }

//url 매개변수
    function urlParam(){
        var array = [], hash;
        var url_Address = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        //?device_cd=2fa
        for (var i = 0; i < url_Address.length; i++) {
            hash = url_Address[i].split('=');
            array.push(hash[1]);
            // console.log(hash);
            array[hash[0]] = hash[1];
        }
        return array;
    }


//현재 기상상황
    let $weather = $('.weather')
    function skyState(){
        $.ajax({
            url: 'http://api.openweathermap.org/data/2.5/weather?q=Pyeongtaek,%20KR&appid=47e6ad3f944264b19fae6989cd782a07',
            dataType: 'json',
            success: function(json){
                let skyState = json.weather[0].main;
                // console.log(skyState, ' 기상 상태')
                // 
                if(skyState == 'Clear'){
                    let html = "<img src='/img/signage/weather/weather_01m_icon.png'></img>";
                    $weather.append(html);
                }else if(skyState == 'Clouds'){
                    let html = "<img src='/img/signage/weather/weather_03_icon.png'></img>";
                    $weather.append(html);
                }else if(skyState == 'Drizzle'){
                    let html = "<img src='/img/signage/weather/weather_04_icon.png'></img>";
                    $weather.append(html);
                }else if(skyState == 'Mist'){
                    let html = "<img src='/img/signage/weather/weather_03_icon.png'></img>";
                    $weather.append(html);
                }else if(skyState == 'Rain'){
                    let html = "<img src='/img/signage/weather/weather_04_icon.png'></img>";
                    $weather.append(html);
                }else{
                    let html = "<img src='/img/signage/weather/weather_02m_icon.png'></img>";
                    $weather.append(html);
                }

            }
        })
    }
//1시간 마다 재실행 
    skyState();
    setInterval(function(){
        skyInterval = this;
        skyInterval.skyState();
    },3600000)

//현재 미세먼지 상황
    let $dust = $('#dust')
    function dustState(){
        $.ajax({
            url:'https://api.waqi.info/feed/Suwon/?token=1e20d40a5d021e3c440d37f1e04d7002f5b08c30',
            dataType:'json',
            success: function(json){
                let nowTemp = json.data.iaqi.t.v;
                let nowDust = json.data.iaqi.pm10.v;
                //현재 온도
                $('#temp').text(Math.round(nowTemp)+'°')
                if($('#kor').hasClass('choose') == false){
                    if(nowDust < 30){
                        nowDust = '좋음';
                        $dust.css('color','#40CFD9');
                        $dust.text(nowDust);
                    }else if(nowDust < 80){
                        nowDust = '보통';
                        $dust.css('color','#53ec5d');
                        $dust.text(nowDust);
                    }else if(nowDust < 150){
                        nowDust = '나쁨';
                        $dust.css('color','#C7622D');
                        $dust.text(nowDust);
                    }else if(nowDust > 150){
                        nowDust = '매우나쁨';
                        $dust.css('color','#C72D2D');
                        $dust.text(nowDust);
                    }

                }else{
                    if(nowDust < 30){
                        nowDust = ' Good';
                        $dust.css('color','#40CFD9');
                        $dust.text(nowDust);
                    }else if(nowDust < 80){
                        nowDust = ' Usually';
                        $dust.css('color','#53ec5d');
                        $dust.text(nowDust);
                    }else if(nowDust < 150){
                        nowDust = ' Bad';
                        $dust.css('color','#C7622D');
                        $dust.text(nowDust);
                    }else if(nowDust > 150){
                        nowDust = ' Wrong';
                        $dust.css('color','#C72D2D');
                        $dust.text(nowDust);
                    }
                }


            }
        })
    }

//미세먼지 1시간 마다 재실행
    dustState();
    setInterval(function(){
        dustInterval = this;
        dustInterval.dustState();
    },3600000)  

//날짜 함수
    function dayCount(){

        this.day = new Date();
        nowYear = String(day.getFullYear());
        nowMon = String(day.getMonth() + 1);
        nowDay = String(day.getDate());
        if (nowMon.length == 1) {
            nowMon = "0" + nowMon;
        }
        if(nowDay <10){
            nowDay = '0'+nowDay;
        }
        let NowToday = nowYear+'.'+ nowMon+'.'+ nowDay;
        $('#dayCount').text(NowToday);
    }
    dayCount();
    //날짜 12시간마다 재실행
    setInterval(function(){
        dayInterval = this;
        dayInterval.dayCount();
    },43200000)

//시간 함수
    this.timeCount = function(){
        let time = new Date();
        let nowHour = time.getHours();
        let nowMt = time.getMinutes();
        let nowTime;
        if ( nowHour < 12  &&  nowHour  >= 0 ) {
            if(nowMt <10){
                nowMt = '0'+nowMt;
            }   
            if(nowHour<10){
                nowTime = 'AM 0'+nowHour+':'+nowMt;
               
            }else{
                nowTime = 'AM '+nowHour+':'+nowMt;
            }
        
        } else if (  nowHour >= 12  &&  nowHour  < 24  ) {
            if(nowMt <10){
                nowMt = '0'+nowMt;
            }   
            if(nowHour >=12){
                nowTime = 'PM 0'+(Number(nowHour)-12)+':'+nowMt;
            }else if(nowHour > 21){
                nowTime = 'PM '+(Number(nowHour)-12)+':'+nowMt;
            }
        }
        $('#timeCount').text(nowTime);
    }
    //시간 함수 30초 마다 재실행
    setInterval(function(){
        timeInterval = this;
        timeInterval.timeCount();
    },30000)
    timeCount();

//언어선택
    let $eng = $('#eng')
    let $kor = $('#kor')
    let $search_total = $('.searchTotal')
    let $info_img = $('#infoImg')
    function languageKor(){
            $kor.removeClass('choose');
            $eng.addClass('choose');
            $('.rightNav_list').css('width','50%');   
            $search_total.css('height', '38px');
            $search_total.css('letter-spacing', '-0.96px');
            $info_img.attr('src','/img/signage/main_info_img_ko.png')
        
        $('[data-kor]').each(function(){
            $(this).html($(this).data('kor'));
            dustState();
            svgLocation();
        })
    }
    function languageEng(){
            $kor.addClass('choose');
            $eng.removeClass('choose');    
            $('.rightNav_list').css('width','65%');
            $search_total.css('height', '7%');
            $search_total.css('letter-spacing', '-1.96px');
            $info_img.attr('src','/img/signage/main_info_img_en.png')
        
        $('[data-eng]').each(function(){
            $(this).html($(this).data('eng'));
            // $('.modal-content').html()
            dustState();
            svgLocation();
        })
    }

//*** 메인 우측 하단 날씨, 시간, 언어 선택 스크립트 종료 ***

