//*** 메인 우측 하단 날씨, 시간,언어 선택 스크립트 ***

    //현재 기상상황
    function skyState(){
        $.ajax({
            url: 'http://api.openweathermap.org/data/2.5/weather?q=Pyeongtaek,%20KR&appid=47e6ad3f944264b19fae6989cd782a07',
            dataType: 'json',
            success: function(json){
                let skyState = json.weather[0].main;
                //console.log(skyState, ' 기상 상태')
            }
        })
    }
    //1시간 마다 재실행 
    skyState();
    setInterval(function(){
        test = this;
        test.skyState()
    },3600000)

    //현재 미세먼지 상황
    function dustState(){
        $.ajax({
            url:'https://api.waqi.info/feed/Suwon/?token=1e20d40a5d021e3c440d37f1e04d7002f5b08c30',
            dataType:'json',
            success: function(json){
                let nowTemp = json.data.iaqi.t.v
                let nowDust = json.data.iaqi.pm10.v
                //현재 온도
                $('#temp').text(Math.round(nowTemp)+'°')
                if(nowDust < 30){
                    nowDust = '좋음'
                    $('#dust').css('color','blue')
                    $('#dust').text(nowDust)
                }else if(nowDust < 80){
                    nowDust = '보통'
                    $('#dust').css('color','#53ec5d')
                    $('#dust').text(nowDust)
                }else if(nowDust < 150){
                    nowDust = '나쁨'
                    $('#dust').css('color','orange')
                    $('#dust').text(nowDust)
                }else if(nowDust > 150){
                    nowDust = '매우나쁨'
                    $('#dust').css('color','red')
                    $('#dust').text(nowDust)
                }
            }
        })
    }
    //미세먼지 1시간 마다 재실행
    dustState();
    setInterval(function(){
        test = this;
        test.dustState()
    },3600000)  


    //날짜 함수
    function dayCount(){
        this.day = new Date()
        nowYear = String(day.getFullYear())
        nowMon = String(day.getMonth() + 1)
        nowDay = String(day.getDate());
        if (nowMon.length == 1) {
            nowMon = "0" + nowMon
        }
        let NowToday = nowYear+'.'+ nowMon+'.'+ nowDay;
        $('#dayCount').text(NowToday)
    }
    dayCount();
    //날짜 12시간마다 재실행
    setInterval(function(){
        test = this;
        test.dayCount()
    },43200000)

    //시간 함수
    this.timeCount = function(){
        let time = new Date();
        let nowHour = time.getHours();
        let nowMt = time.getMinutes();
        let nowTime;
        if ( nowHour < 12  &&  nowHour  >= 0 ) {
            if(nowMt <10){
                nowMt = '0'+nowMt
            }   
            if(nowHour<10){
                nowTime = 'AM 0'+nowHour+':'+nowMt;
               
            }else{
                nowTime = 'AM '+nowHour+':'+nowMt;
            }
        
        } else if (  nowHour >= 12  &&  nowHour  < 24  ) {
            if(nowMt <10){
                nowMt = '0'+nowMt
            }   
            if(nowHour >=12){
                nowTime = 'PM 0'+(Number(nowHour)-12)+':'+nowMt;
            }else if(nowHour > 21){
                nowTime = 'PM '+(Number(nowHour)-12)+':'+nowMt;
            }
        }
        $('#timeCount').text(nowTime)
    }
    //시간 함수 30초 마다 재실행
    setInterval(function(){
        test = this;
        test.timeCount()
    },30000)
    timeCount();

    //언어선택
    $('#kor').on('click',function(){
        if($('#kor').attr('class') == 'languageSelect'){
            $('#kor').addClass('choose')
            $('#eng').removeClass('choose')
        }
    })
    $('#eng').on('click',function(){
        if($('#eng').attr('class') == 'languageSelect'){
            $('#kor').removeClass('choose')
            $('#eng').addClass('choose')            
        }
    })
//*** 메인 우측 하단 날씨, 시간, 언어 선택 스크립트 종료 ***
