//*** 메인 좌측 카테고리 선택 스크립트 ***  
//브랜드 리스트
    $.ajax({
        url: '/api/brandList',
        method: 'get',
        dataType: 'json',
        async : false,
        success: function(res){
            localStorage.setItem('brandList',JSON.stringify(res.data))
        }
    })
//대분류 카테고리 
    $.ajax({
        url: '/api/categoryLV1',
        method: 'get',
        dataType: 'json',
        async : false,
        success: function(res){
            //카테고리 저장
            localStorage.setItem('categoryLV1',JSON.stringify(res.data))
        }
    })
//중분류 카테고리 
    $.ajax({
        url: '/api/categoryLV2',
        method: 'get',
        dataType: 'json',
        async : false,
        success: function(res){
            //카테고리 저장
            localStorage.setItem('categoryLV2',JSON.stringify(res.data))
        }
    })
//svg파일 상가 정보
    $.ajax({
        url: '/api/storeInfo',
        method: 'get',
        dataType: 'json',
        async : false,
        success: function(res){
            localStorage.setItem('storeInfo',JSON.stringify(res.data))
        }
    })
//일반 영문
    $.ajax({
        url: '/api/language',
        method: 'get',
        dataType: 'json',
        async : false,
        success: function(res){
            //번역 저장
            localStorage.setItem('language',JSON.stringify(res.data))
        }
    })
//중복제거 브랜드 리스트
    $.ajax({
        url: '/api/brandListOverLap',
        method: 'get',
        dataType: 'json',
        async : false,
        success: function(res){
            localStorage.setItem('brandListOverLap',JSON.stringify(res.data))
        }
    })
//브랜드 메뉴 리스트
    $.ajax({
        url: '/api/brandMenuList',
        method: 'get',
        dataType: 'json',
        async : false,
        success: function(res){
            localStorage.setItem('eventList',JSON.stringify(res.event))
            localStorage.setItem('normalList',JSON.stringify(res.normal))
        }
    })
    //메인 좌측 카테고리 리스트 변수 선언
    let $category_list = $('.categoryList')
    //메인 좌측 두번째 카테고리 리스트 변수 선언
    let $category_list2 = $('.categoryList2')
    //메인 좌측 카테고리 리스트 좌측 화살표
    let $category_prev = $('.categoryPrev img')
        //메인 좌측 카테고리 리스트 우측 화살표
    let $category_next = $('.categoryNext img')

    //메인 좌측 카테고리 리스트
    function LV1CatList(){
        //대분류 카테고리 데이터 변수 선언
        let categoryList = JSON.parse(localStorage.getItem('categoryLV1'))
            categoryList_length = categoryList.length;
        let html = "";
        let html2 = "";
        for(let i=0; i<categoryList_length; i++){
            //카테고리는 한 리스트에 7개씩만 보여줌
            if(i <7){
                html += "<li>";
                html += '<div class="categoryBtn categoryFont categoryBack" data-catclass="'+categoryList[i].BC_NameEng+'" id="mainCatNum'+i+'" onclick="selectCat(this)"><span id="categoryIcon'+i+'"class="categoryIconBox categoryIcon'+i+'"></span><span class="categoryName" data-Kor="'+categoryList[i].BC_NameKor+'" data-Eng="'+categoryList[i].BC_NameEng+'">'+categoryList[i].BC_NameKor+'</span></div>';
                html += "</li>";
            }
            
            if(i >= 7){
                html2 += "<li>";
                html2 += '<div class="categoryBtn categoryFont categoryBack" data-catclass="'+categoryList[i].BC_NameEng+'" id="mainCatNum'+i+'" onclick="selectCat(this)"><span id="categoryIcon'+i+'"class="categoryIconBox categoryIcon'+i+'"></span><span class="categoryName" data-Kor="'+categoryList[i].BC_NameKor+'" data-Eng="'+categoryList[i].BC_NameEng+'">'+categoryList[i].BC_NameKor+'</span></div>';
                html2 += "</li>";
            }
        }
        $category_list.append(html);
        $category_list2.append(html2);
    }
    
    //카테고리 리스트 실행
    LV1CatList();
    
    //좌측 카테고리 클릭 시 지도에 해당 영역 표시
    let count = 0;
    function selectCat(e){
        let $svg_cat = $('.svgCat')
        let catId = e.id;
        let svg_class = $('#'+catId).data('catclass').replace(/ /g, '');
        let $catId_class = $('#'+catId).hasClass('selected');
        let $svg_class = $('.'+svg_class)
        //클릭시 전체 색상을 회색으로 변경
        if(count == 0){
            $svg_cat.css('fill','#e2e2e2');   
            count = 1;
        }
        //클릭한 것만 색상표시
        if($catId_class == false ){
            $(e).addClass('selected');
            //svg클래스
            $svg_class.css('fill','');
        }
        //클릭한게 없으면 초기상태로 되돌림
        else if($catId_class == true ){
            $(e).removeClass('selected');
            $svg_class.css('fill','#e2e2e2');
            if($('.categoryList div').hasClass('selected') == false && $('.categoryList2 div').hasClass('selected') == false){
                $svg_cat.css('fill','');
                
                count = 0;
                return count;
            }
        }
    }

    //좌측 카테고리 리스트 현재 페이지 수
    let $now_page = $('#nowPage')

    //카테고리 다음버튼 클릭
    function mainNext(e){
        if($now_page.text()==1){
            $now_page.text('2');
            $category_list.css('display','none');
            $category_list2.css('display','block');
            $category_prev.attr('src','/img/signage/left_arrow_active_icon.png');
            $category_next.attr('src','/img/signage/right_arrow_icon.png');
            // $('#prev').addClass('clickPrevBtn')
            // $('#next').removeClass('clickNextBtn')

        }
    }
    //카테고리 이전버튼 클릭
    function mainPrev(){
        if($now_page.text()==2){
            $now_page.text('1');
            $category_list.css('display','block');
            $category_list2.css('display','none');
            $category_next.attr('src','/img/signage/right_arrow_active_icon.png');
            $category_prev.attr('src','/img/signage/left_arrow_icon.png');
        }
    }

    

//*** 메인 좌측 카테고리 선택 스크립트 종료 ***