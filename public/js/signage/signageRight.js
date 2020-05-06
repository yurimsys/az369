
//브랜드 리스트
$.ajax({
    url: '/brandList',
    method: 'get',
    dataType: 'json',
    success: function(res){
        localStorage.setItem('brandList',JSON.stringify(res.data))

    }
})


//*** 검색 모달 스크립트 ***
    //검색 모달
    let searchModal = $('#myModal')[0]
    let searchClose = $('.searchClose')[0];                                          
    searchClose.onclick = function() {
        searchModal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == searchModal) {
            searchModal.style.display = "none";
        }
    }
    
    //검색모달 오픈
    function searchCategoryMenu(){
        ////여기부터
        $('.searchList').empty()
        $('.searchList2').empty()
        $('.searchResult').empty()
        //여기까지
        $('.searchRight').css('display','block')
        $('.searchInfo').css('display','block')
        $('.categoryChange').css('display','none')
        $('.searchRightDetail').css('display','none')
        $('.searchRightAd').css('display','none');
        $('#chooseCategory').text('TOTAL')
        
        //로컬에 저장된 카테고리를 사용
        let jsonCat = JSON.parse(localStorage.getItem('category'))
        for(let i=0; i<jsonCat.length; i++){
            if(i < 9){
                let html = "<li><label>"
                    html += "<input type='checkbox' name='searchCategoryList' data-catnum ="+Number(i+1)+" onclick='modalCat(this)' id='search"+i+"' class='searchCheck' value='"+jsonCat[i].BC_NameKor+"'>"
                    html += "<div class='searchCategory searchCategoryFont'>"+jsonCat[i].BC_NameKor+"</div>"
                    html += "</label></li>"
                $('.searchList').append(html)
            }
            if(i > 8){
                let html = "<li><label>"
                    html += "<input type='checkbox' name='searchCategoryList' data-catnum ="+Number(i+1)+"  onclick='modalCat(this)' id='search"+i+"' class='searchCheck' value='"+jsonCat[i].BC_NameKor+"'>"
                    html += "<div class='searchCategory searchCategoryFont'>"+jsonCat[i].BC_NameKor+"</div>"
                    html += "</label></li>"
                $('.searchList2').append(html)
            }
        }
        //브랜드 리스트
        let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
        console.log(jsonBrand)
        for(let i=0; i<jsonBrand.length; i++){
            let html = "<div class='brandList' id='brand01' onclick='catTest(this)'><div class='categoryImg'></div>";
                html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">'
                html += "<ul><li><div class='searchBrand'>"+jsonBrand[i].BS_NameKor+"</div>";
                html += "<h4 class='searchLocation'>테이블 넣어야 함</h4><div class='searchTime'>영업시간 00:00 ~ 00:00</div></li></ul>";
                html += "<hr class='searchLine'></div>"
            // if(i==2 || i==4){
            //     html = "<div class='brandList' id='brand02' onclick='catTest(this)'><div class='categoryImg'></div>";
            //     html += "<ul><li><div class='searchBrand'>여성보세의류샵<h4 class='searchEvent'>EVENT</h4></div>";
            //     html += "<h4 class='searchLocation'>1F.여성의류 쇼핑몰 (패션의류)</h4><div class='searchTime'>영업시간 00:00 ~ 00:00</div></li></ul>";
            //     html += "<hr class='searchLine'></div>"
            // }
            //$('.searchResult').append(html)
        }
        searchModal.style.display = "block";
    }

    //카테고리 클릭
    let catChk = 0;
    function modalCat(e){
        //선택된 카테고리 아이디
        let selectCategoryId = e.id
        //상단 선택된 카테고리 명
        if(catChk == 0){
            let chooseCatName = $("#"+selectCategoryId).val();
            $('#chooseCategory').text(chooseCatName)
        }
        // console.log( $('#'+selectCategoryId).data('catnum'))
        //카테고리, 브랜드 리스트 초기화
        $('.searchResult').empty()

        $.ajax({
            url: '/categoryLV2',
            method: 'post',
            dataType: 'json',
            data: {'catNum' : $('#'+selectCategoryId).data('catnum')},
            success: function(res){
                $('.searchList').empty()
                $('.searchList2').empty()
                //중분류 카테고리
                for(let i=0; i<res.data.length; i++){
                    if(i < 9){
                        let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                            html += "<div class='searchCategory searchCategoryFont' onclick='midClass(this)' id='search0'>"+res.data[i].BC_NameKor+"</div></label></li>"
                        $('.searchList').append(html);
                    }
                    if( i > 8){
                        let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                            html += "<div class='searchCategory searchCategoryFont' onclick='midClass(this)' id='search0'>"+res.data[i].BC_NameKor+"</div></label></li>"
                        $('.searchList2').append(html);
                    }
                }
            }
        })

        // catChk = 1;
        //대분류 브랜드 리스트
        for(let i=0; i<10; i++){
            console.log('sad')
            let html = "<div class='brandList' id='brand0"+i+"' onclick='catTest(this)'><div><div class='categoryImg'></div></div>";
                html += "<ul><li><div class='searchBrand'>김밥천국</div>";
                html += "<h4 class='searchLocation'>1F.분식 (음식점)</h4><div class='searchTime'>영업시간 00:00 ~ 00:00</div></li></ul>";
                html += "<hr class='searchLine'></div>"
            $('.searchResult').append(html)
        }

        //카테고리 변경 버튼
        createCatBtn();
    }

    //카테고리변경 버튼 생성
    function createCatBtn(){
        $('.categoryChange').css('display','block')
        $('.searchInfo').css('display','none')
        $('.searchRightDetail').css('display','none')
        $('.searchRight').css('display','none')
        $('.searchRightAd').css('display','block');
    }

    //중분류 클릭
    function midClass(e){
        console.log(e.id)
        // $(e).addClass('selected')
        if($('.searchCheck').attr('checked',false)){
            $('.searchCategory').removeClass('selected')
        }
        if($(e).attr('checked',true)){
            $(e).addClass('selected')
        }
        
        
    }

    //브랜드 리스트 클릭시
    function catTest(e){
        // console.log(e.id)
        $('.searchResult div').css('background-color','')
        $('#'+e.id).css('background-color','#f9eff6');
        
        $('.searchRight').css('display','none')
        $('.searchRightAd').css('display','none');
        $('.searchRightDetail').css('display','block')
    }

    //카테고리 변경하기 클릭
    function changeCategory(){
        searchCategoryMenu();
        catChk = 0;
    }

    //카테고리 이전 다음버튼
    function searchPrev(){
        if($('#searchPage').text()==2){
            $('#searchPage').text('1')
            $('.searchList').css('display','block')
            $('.searchList2').css('display','none')
            $('#searchPrev').removeClass('searchPrevClick')
            $('#searchNext').addClass('searchNextClick')
        }
    }

    function searchNext(){
        if($('#searchPage').text()==1){
            $('#searchPage').text('2')
            $('.searchList').css('display','none')
            $('.searchList2').css('display','block')
            $('#searchPrev').addClass('searchPrevClick')
            $('#searchNext').removeClass('searchNextClick')
        }
    }

//*** 검색 모달 스크립트 종료 ***


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
        if(nowDay <10){
            nowDay = '0'+nowDay
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
