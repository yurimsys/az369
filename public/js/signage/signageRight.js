
//전체 브랜드 리스트 생성
    function searchBrandList(){
        //리스트 초기화
        $('.searchResult').empty()
        //let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'))
        console.log('=====')
        console.log(jsonBrand)
        for(let i=0; i<jsonBrand.length; i++){
            // console.log(jsonBrand)
            let opTime = jsonBrand[i].BS_MainDtS
                openTime = opTime.slice(-8,-3)
            let edTime = jsonBrand[i].BS_MainDtF
                endTime = edTime.slice(-8, -3)
                if($('#kor').hasClass('choose')){
                    let html = "<div class='brandList' id="+jsonBrand[i].BS_ID+" onclick='brandClick(this)'><div class='categoryImg'><img src="+jsonBrand[i].BS_ThumbnailUrl+"></div>";
                        html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">'
                        html += "<ul><li><div class='searchBrand'>"+jsonBrand[i].BS_NameKor+"</div>";
                        html += "<h4 class='searchLocation'>"+jsonBrand[i].LS_Floor+".<span class='searchLocation'>"+jsonBrand[i].BC_NameKor+"</span></h4><div class='searchTime'>영업시간 "+openTime+" ~ "+endTime+"</div></li></ul>";
                       
                    $('.searchResult').append(html)
                }else{
                    let html = "<div class='brandList' id="+jsonBrand[i].BS_ID+" onclick='brandClick(this)'><div class='categoryImg'><img src="+jsonBrand[i].BS_ThumbnailUrl+"></div>";
                        html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">'
                        html += "<ul><li><div class='searchBrand'>"+jsonBrand[i].BS_NameEng+"</div>";
                        html += "<h4 class='searchLocation'>"+jsonBrand[i].LS_Floor+".<span class='searchLocation'>"+jsonBrand[i].BC_NameEng+"</span></h4><div class='searchTime'>OpenTime "+openTime+" ~ "+endTime+"</div></li></ul>";
                    $('.searchResult').append(html)
                }


        //해당 브랜드에 이벤트가 있을시 이벤트 아이콘 추가
            // if(i==2 || i==4){
            //     html = "<div class='brandList' id='brand02' onclick='brandClick(this)'><div class='categoryImg'></div>";
            //     html += "<ul><li><div class='searchBrand'>여성보세의류샵<h4 class='searchEvent'>EVENT</h4></div>";
            //     html += "<h4 class='searchLocation'>1F.여성의류 쇼핑몰 (패션의류)</h4><div class='searchTime'>영업시간 00:00 ~ 00:00</div></li></ul>";
            //     html += "<hr class='searchLine'></div>"
            // }
           
        }
    }

//대분류 브랜드 리스트 생성 
    function LV1BrandList(lv1CatNum){
        //리스트 초기화
        // let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'))
        for(let i=0; i<jsonBrand.length; i++){
            //검색내용이 있으면 리스트를 그려줌
            if(jsonBrand[i].BCR_LV1_BC_ID == lv1CatNum){
                let lv1BrandList = []
                    lv1BrandList.push(jsonBrand[i])
                for(let j=0; j<lv1BrandList.length; j++){
                    //시간 자르기
                    let opTime = lv1BrandList[j].BS_MainDtS
                        openTime = opTime.slice(-8,-3)
                    let edTime = lv1BrandList[j].BS_MainDtF
                        endTime = edTime.slice(-8, -3)
                    if($('#kor').hasClass('choose')){
                        let html = "<div class='brandList' id="+lv1BrandList[j].BS_ID+" onclick='brandClick(this)'><div><div class='categoryImg'><img src="+lv1BrandList[j].BS_ThumbnailUrl+"></div></div>";
                            html += "<ul><li><div class='searchBrand'>"+lv1BrandList[j].BS_NameKor+"</div>";
                            html += "<h4 class='searchLocation'>"+lv1BrandList[j].LS_Floor+"."+lv1BrandList[j].BC_NameKor+"</h4><div class='searchTime'>영업시간 "+openTime+" ~ "+endTime+"</div></li></ul>";
                        $('.searchResult').append(html)
                    }else{
                        let html = "<div class='brandList' id="+lv1BrandList[j].BS_ID+" onclick='brandClick(this)'><div><div class='categoryImg'><img src="+lv1BrandList[j].BS_ThumbnailUrl+"></div></div>";
                            html += "<ul><li><div class='searchBrand'>"+lv1BrandList[j].BS_NameEng+"</div>";
                            html += "<h4 class='searchLocation'>"+lv1BrandList[j].LS_Floor+"."+lv1BrandList[j].BC_NameEng+"</h4><div class='searchTime'>OpenTime "+openTime+" ~ "+endTime+"</div></li></ul>";
                        $('.searchResult').append(html)
                    }

                }
            }
        }
    }

//중분류 브랜드 리스트 생성
    function LV2BrandList(lv2CatNum){
        $('#searchResult').empty();
        // let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'))
        //BCR_LV1_BC_ID에 검색 
        for(let i=0; i<jsonBrand.length; i++){
            //검색내용이 있으면 리스트를 그려줌
            if(jsonBrand[i].BCR_LV2_BC_ID == lv2CatNum){
                let lv2BrandList = []
                    lv2BrandList.push(jsonBrand[i])
                for(let j=0; j<lv2BrandList.length; j++){
                    let opTime = lv2BrandList[j].BS_MainDtS
                        openTime = opTime.slice(-8,-3)
                    let edTime = lv2BrandList[j].BS_MainDtF
                        endTime = edTime.slice(-8, -3)
                    if($('#kor').hasClass('choose')){
                        let html = "<div class='brandList' id="+lv2BrandList[j].BS_ID+" onclick='brandClick(this)'><div><div class='categoryImg'><img src="+lv2BrandList[j].BS_ThumbnailUrl+"></div></div>";
                            html += "<ul><li><div class='searchBrand'>"+lv2BrandList[j].BS_NameKor+"</div>";
                            html += "<h4 class='searchLocation'> "+lv2BrandList[j].LS_Floor+"."+lv2BrandList[j].BC_NameKor+"</h4><div class='searchTime'>영업시간 "+openTime+" ~ "+endTime+"</div></li></ul>";
                        $('.searchResult').append(html)
                    }else{
                        let html = "<div class='brandList' id="+lv2BrandList[j].BS_ID+" onclick='brandClick(this)'><div><div class='categoryImg'><img src="+lv2BrandList[j].BS_ThumbnailUrl+"></div></div>";
                            html += "<ul><li><div class='searchBrand'>"+lv2BrandList[j].BS_NameEng+"</div>";
                            html += "<h4 class='searchLocation'> "+lv2BrandList[j].LS_Floor+"."+lv2BrandList[j].BC_NameEng+"</h4><div class='searchTime'>Opentime "+openTime+" ~ "+endTime+"</div></li></ul>";
                        $('.searchResult').append(html) 
                    }

                }
            }
        }
    }

//대분류 카테고리 리스트
    function searchCategoryListLV1(){
        $('.searchList').empty()
        $('.searchList2').empty()
        //로컬에 저장된 카테고리를 사용
        let searchCatLV1 = JSON.parse(localStorage.getItem('categoryLV1'))
        for(let i=0; i<searchCatLV1.length; i++){
            // console.log(searchCatLV1)
            if($('#kor').hasClass('choose')){
                if(i < 9){
                    let html = "<li><label>"
                        html += "<input type='checkbox' name='searchCategoryList' data-lv1cat ="+Number(i+1)+" onclick='LV1Cat(this)' id='lv1Cateogry"+i+"' class='searchCheck' value='"+searchCatLV1[i].BC_NameKor+"'>"
                        html += "<div class='searchCategory searchCategoryFont categoryBack'>"+searchCatLV1[i].BC_NameKor+"</div>"
                        html += "</label></li>"
                    $('.searchList').append(html)
                }
                if(i > 8){
                    let html = "<li><label>"
                        html += "<input type='checkbox' name='searchCategoryList' data-lv1cat ="+Number(i+1)+"  onclick='LV1Cat(this)' id='lv1Cateogry"+i+"' class='searchCheck' value='"+searchCatLV1[i].BC_NameKor+"'>"
                        html += "<div class='searchCategory searchCategoryFont categoryBack'>"+searchCatLV1[i].BC_NameKor+"</div>"
                        html += "</label></li>"
                    $('.searchList2').append(html)
                }
            }else if($('#eng').hasClass('choose')){
                if(i < 9){
                    let html = "<li><label>"
                        html += "<input type='checkbox' name='searchCategoryList' data-lv1cat ="+Number(i+1)+" onclick='LV1Cat(this)' id='lv1Cateogry"+i+"' class='searchCheck' value='"+searchCatLV1[i].BC_NameEng+"'>"
                        html += "<div class='searchCategory searchCategoryFont categoryBack'>"+searchCatLV1[i].BC_NameEng+"</div>"
                        html += "</label></li>"
                    $('.searchList').append(html)
                }
                if(i > 8){
                    let html = "<li><label>"
                        html += "<input type='checkbox' name='searchCategoryList' data-lv1cat ="+Number(i+1)+"  onclick='LV1Cat(this)' id='lv1Cateogry"+i+"' class='searchCheck' value='"+searchCatLV1[i].BC_NameEng+"'>"
                        html += "<div class='searchCategory searchCategoryFont categoryBack'>"+searchCatLV1[i].BC_NameEng+"</div>"
                        html += "</label></li>"
                    $('.searchList2').append(html)
                }
            }


        }
    }

//중분류 카테고리 리스트
function searchCategoryListLV2(lv2CatNum){
    let searchCatLV2 = JSON.parse(localStorage.getItem('categoryLV2'))
    let resultCatLV2 = new Array();
    //console.log(searchCatLV2)
    $('.searchList').empty()
    $('.searchList2').empty()
    //중분류 카테고리
    for(let i=0; i<searchCatLV2.length; i++){
        if(searchCatLV2[i].BCR_LV1_BC_ID == lv2CatNum){
            let jsonTest = searchCatLV2[i]
            resultCatLV2.push(jsonTest)
        }
    }
    for(let j=0; j<resultCatLV2.length; j++){
        if($('#kor').hasClass('choose')){
            if(j < 9){
                let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                    html += "<div class='searchCategory searchCategoryFont categoryBack' onclick='LV2Cat(this)' id='lv2Cateogry"+j+"' data-lv2cat ="+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</div></label></li>"
                $('.searchList').append(html);
            }
            if( j > 8){
                let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                    html += "<div class='searchCategory searchCategoryFont categoryBack' onclick='LV2Cat(this)' id='lv2Cateogry"+j+"' data-lv2cat ="+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</div></label></li>"
                $('.searchList2').append(html);
            }
        }else{
            if(j < 9){
                let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                    html += "<div class='searchCategory searchCategoryFont categoryBack' onclick='LV2Cat(this)' id='lv2Cateogry"+j+"' data-lv2cat ="+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameEng+"</div></label></li>"
                $('.searchList').append(html);
            }
            if(j > 8){
                let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                    html += "<div class='searchCategory searchCategoryFont categoryBack' onclick='LV2Cat(this)' id='lv2Cateogry"+j+"' data-lv2cat ="+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameEng+"</div></label></li>"
                $('.searchList2').append(html);
            }
        }

    }
}

//*** 검색 모달 스크립트 ***

//검색 모달
    function searchModal(){
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
        searchModal.style.display = "block";
    }


//검색모달 오픈
    function signageSearch(){
        $('.searchRight').css('display','block')
        $('.searchInfo').css('display','block')
        $('.categoryChange').css('display','none')
        $('.searchRightDetail').css('display','none')
        $('.searchRightAd').css('display','none');
        $('#chooseCategory').text('TOTAL')
        //이전 다음 버튼 초기화
        searchPrev();
        //카테고리 리스트 생성
        searchCategoryListLV1();
        //전체브랜드 리스트 생성
        searchBrandList();
        //검색 모달 생성
        searchModal();
        //모달내용 번역
        searchModalLanguage();

    }    

//검색모달 내용 번역
    function searchModalLanguage(){
        $('.searchInfo').empty();
        if($('#eng').hasClass('choose')){
            $('#searchBrandName').attr('placeholder','Click here to search for the brand name you are looking for')
            //위의<span style="color: #222222; font-weight: 500;"> 카테고리를 선택</span>하세요.
            let html = "Select a<span style='color: #222222; font-weight: 500;'> category </span>above."
            $('.searchInfo').append(html);
            $('#chagneCategory').text('Change Category')
            $('.searchCloseName').text('Close')
            $('.searchTopName').text('Search')
        }else{
            let html = "위의<span style='color: #222222; font-weight: 500;'> 카테고리를 선택</span>하세요."
            $('#searchBrandName').attr('placeholder','이곳을 클릭하여 찾으시는 브랜드명을 검색하세요.')
            $('.searchInfo').append(html);
            $('#chagneCategory').text('카테고리 변경하기')
            $('.searchCloseName').text('닫기')
            $('.searchTopName').text('검색')
        }
    }

//브랜드 리스트 클릭시
    function brandClick(e){
        $('.brandDetail').empty();
        $('.searchResult div').css('background-color','')
        $('#'+e.id).css('background-color','#f9eff6');
        $('.searchRight').css('display','none')
        $('.searchRightAd').css('display','none');
        $('.searchRightDetail').css('display','block')

        // let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'))
        //BCR_LV1_BC_ID에 검색 
        for(let i=0; i<jsonBrand.length; i++){
            if(jsonBrand[i].BS_ID == e.id){            
                let selectBrand = []
                    selectBrand.push(jsonBrand[i])
                if($('#kor').hasClass('choose')){
                    let html = "<div><img src="+selectBrand[0].BS_ImageUrl+"></div>";
                        html += "<div class='brandContents'><ul>";
                        html += "<li><h2 class='brandName'>"+selectBrand[0].BS_NameKor+"</h2></li>"
                        html += "<li><h4 class='searchLocation'>"+selectBrand[0].LS_Floor+"."+selectBrand[0].BC_NameKor+"</h4></li>"
                        html += "<li><div class='brandInfo'>"+selectBrand[0].BS_ContentsKor+"</div></li>"
                        html += "</ul></div>"
                        html += "<ul class='detailInfo'>"
                        html += "<li><div class='infoImgNav' id="+selectBrand[0].LS_Number+" onclick='storeInfo(this)'>상세 보기</div></li>"
                        html += "<li><div class='infoImgNav' id="+selectBrand[0].LS_Number+" onclick='storeLocation(this)'>위치 보기</div></li></ul>"
                    $('.brandDetail').append(html)
                }else{
                    let html = "<div><img src="+selectBrand[0].BS_ImageUrl+"></div>";
                        html += "<div class='brandContents'><ul>";
                        html += "<li><h2 class='brandName'>"+selectBrand[0].BS_NameEng+"</h2></li>"
                        html += "<li><h4 class='searchLocation'>"+selectBrand[0].LS_Floor+"."+selectBrand[0].BC_NameEng+"</h4></li>"
                        html += "<li><div class='brandInfo'>"+selectBrand[0].BS_ContentsEng+"</div></li>"
                        html += "</ul></div>"
                        html += "<ul class='detailInfo'>"
                        html += "<li><div class='infoImgNav'>Detail</div></li>"
                        html += "<li><div class='infoImgNav' id="+selectBrand[0].LS_Number+" onclick='storeLocation(this)'>Location</div></li></ul>"
                    $('.brandDetail').append(html)
                }
            }
        }
    }

//대분류 카테고리 클릭
    let catChk = 0;
    function LV1Cat(e){
        //선택된 카테고리 아이디
        let lv1CatId = e.id
        //상단 선택된 카테고리 명
        if(catChk == 0){
            let chooseCatName = $("#"+lv1CatId).val();
            $('#chooseCategory').text(chooseCatName)
        }
        //카테고리, 브랜드 리스트 초기화
        $('.searchResult').empty()
        //이전 다음 초기화
        searchPrev();
        //중분류 브랜드 리스트
        LV1BrandList($('#'+lv1CatId).data('lv1cat'));
        //중분류 카테고리 리스트
        searchCategoryListLV2($('#'+lv1CatId).data('lv1cat'));
        //카테고리 변경 버튼
        createCatBtn();
    }

//중분류 카테고리 클릭
    function LV2Cat(e){
        let lv2Cateogry = e.id
        //중분류 브랜드 리스트
        if($('.searchCheck').attr('checked',false)){
            $('.searchCategory').removeClass('selected')
            LV2BrandList($('#'+lv2Cateogry).data('lv2cat'));
        }
        if($(e).attr('checked',true)){
            $('#'+lv2Cateogry).addClass('selected')
        }
        
    }

//카테고리변경 버튼 생성
    function createCatBtn(){
        $('.categoryChange').css('display','block')
        $('.searchInfo').css('display','none')
        $('.searchRightDetail').css('display','none')
        $('.searchRight').css('display','none')
        $('.searchRightAd').css('display','block');
    }

//카테고리 변경하기 클릭
    function changeCategory(){
        signageSearch();
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
            $('#searchNext img').attr('src','/img/signage/right_arrow_active_icon.png')
            $('#searchPrev img').attr('src','/img/signage/left_arrow_icon.png')
        }
    }

    function searchNext(){
        if($('#searchPage').text()==1){
            $('#searchPage').text('2')
            $('.searchList').css('display','none')
            $('.searchList2').css('display','block')
            $('#searchPrev').addClass('searchPrevClick')
            $('#searchNext').removeClass('searchNextClick')
            $('#searchNext img').attr('src','/img/signage/right_arrow_icon.png')
            $('#searchPrev img').attr('src','/img/signage/left_arrow_active_icon.png')
            
        }
    }

//브랜드 위치보기
    function storeLocation(e){
        if(e.id >1000 && e.id < 1231){
            console.log('1층')
            $('#1Fstore path').css('fill','#E2E2E2')
            $('#h'+e.id).css('fill','#a91179')
            $('#myModal').css('display','none')
            $('.centralSvg1F').css('display','block');
            $('.centralSvg2F').css('display','none');
            $('.centralSvg3F').css('display','none');
            $('.floorBtn div').removeClass('floorSelcet')
            $('#floor1Btn').addClass('floorSelcet')
            $('#nowFloor').text('1F')
        }
        else if(e.id > 2000 && e.id < 2103){
            console.log('2층')
            $('#2Fstore path').css('fill','#E2E2E2')
            $('#h'+e.id).css('fill','#a91179')
            $('#myModal').css('display','none')
            $('.centralSvg1F').css('display','none');
            $('.centralSvg2F').css('display','block');
            $('.centralSvg3F').css('display','none');
            $('.floorBtn div').removeClass('floorSelcet')
            $('#floor2Btn').addClass('floorSelcet')
            $('#nowFloor').text('2F')
        }
        else if(e.id>3000 && e.id < 3107){
            console.log('3층')
            $('#3Fstore path').css('fill','#E2E2E2')
            $('#h'+e.id).css('fill','#a91179')
            $('#myModal').css('display','none')
            $('.centralSvg1F').css('display','none');
            $('.centralSvg2F').css('display','none');
            $('.centralSvg3F').css('display','block');
            $('.floorBtn div').removeClass('floorSelcet')
            $('#floor3Btn').addClass('floorSelcet')
            $('#nowFloor').text('3F')
        }
    }

//브랜드 상세보기
function storeInfo(e){
    console.log(e.id)
    $(e).text('상세보기 닫기상세보기 닫기')
    $('.searchLeft').css('display','none');
    $('.brandInfoLeft').css('display','block')
    $('.searchCenter').css('display','none');
    $('.brandInfoCenter').css('display','block')
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
                // console.log(skyState, ' 기상 상태')
                // 
                if(skyState == 'Clear'){
                    let html = "<img src='/img/signage/weather/weather_01m_icon.png'></img>"
                    $('.weather').append(html)
                }else if(skyState == 'Clouds'){
                    let html = "<img src='/img/signage/weather/weather_03_icon.png'></img>"
                    $('.weather').append(html)
                }else if(skyState == 'Drizzle'){
                    let html = "<img src='/img/signage/weather/weather_04_icon.png'></img>"
                    $('.weather').append(html)
                }else if(skyState == 'Mist'){
                    let html = "<img src='/img/signage/weather/weather_03_icon.png'></img>"
                    $('.weather').append(html)
                }else if(skyState == 'Rain'){
                    let html = "<img src='/img/signage/weather/weather_04_icon.png'></img>"
                    $('.weather').append(html)
                }

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
                if($('#kor').hasClass('choose') == true){
                    if(nowDust < 30){
                        nowDust = '좋음'
                        $('#dust').css('color','#0054FF')
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

                }else{
                    if(nowDust < 30){
                        nowDust = ' Good'
                        $('#dust').css('color','blue')
                        $('#dust').text(nowDust)
                    }else if(nowDust < 80){
                        nowDust = ' Usually'
                        $('#dust').css('color','#53ec5d')
                        $('#dust').text(nowDust)
                    }else if(nowDust < 150){
                        nowDust = ' Bad'
                        $('#dust').css('color','orange')
                        $('#dust').text(nowDust)
                    }else if(nowDust > 150){
                        nowDust = ' Wrong'
                        $('#dust').css('color','red')
                        $('#dust').text(nowDust)
                    }
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
    function languageKor(){
        if($('#kor').attr('class') == 'languageSelect'){
            $('#kor').addClass('choose')
            $('#eng').removeClass('choose')
            $('.rightNav_list').css('width','50%')    
            $('.searchTotal').css('height', '38px')
            $('.searchTotal').css('letter-spacing', '-0.96px')
        }
        $('[data-kor]').each(function(){
            $(this).html($(this).data('kor'))
            dustState()
            svgLocation();
        })
    }
    function languageEng(){
        //$("#svgTest").load(window.location.href + "#svgTest svg")
        
        if($('#eng').attr('class') == 'languageSelect'){
            $('#kor').removeClass('choose')
            $('#eng').addClass('choose')        
            $('.rightNav_list').css('width','62%')    
            $('.searchTotal').css('height', '7%')
            $('.searchTotal').css('letter-spacing', '-1.96px')
        }
        $('[data-eng]').each(function(){
            $(this).html($(this).data('eng'))
            // $('.modal-content').html()
            dustState()
            svgLocation();
        })
    }

//메인 돌아가기
    function signageMain(){
        zoomReset();
        $('.categoryBtn ').removeClass('selected')
        $('#1Fstore path').css('fill','')
        $('#2Fstore path').css('fill','')
        $('#3Fstore path').css('fill','')
        $('.floorBtn div').removeClass('floorSelcet')
        let deviceParam = urlParam();
        if(deviceParam[0].substring('0','1') == 1){

            $('.centralSvg1F').css('display','block');
            $('.centralSvg2F').css('display','none');
            $('.centralSvg3F').css('display','none');
            $('#floor1Btn').addClass('floorSelcet')
            $('#nowFloor').text('1F')
        }        
        else if(deviceParam[0].substring('0','1') == 2){
            $('.centralSvg1F').css('display','none');
            $('.centralSvg2F').css('display','block');
            $('.centralSvg3F').css('display','none');
            $('#floor2Btn').addClass('floorSelcet')
            $('#nowFloor').text('2F')
        }
        else if(deviceParam[0].substring('0','1') == 3){
            $('.centralSvg1F').css('display','none');
            $('.centralSvg2F').css('display','none');
            $('.centralSvg3F').css('display','block');
            $('#floor3Btn').addClass('floorSelcet')
            $('#nowFloor').text('3F')
        }
        
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
        // console.log(array)
        return array;
    }
//*** 메인 우측 하단 날씨, 시간, 언어 선택 스크립트 종료 ***
