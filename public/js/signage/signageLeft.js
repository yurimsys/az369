//*** 메인 좌측 카테고리 선택 스크립트 ***
// window.addEventListener('touchstart', function(e) {
//     if (e.targetTouches.length === 2) {
//       e.preventDefault();
//     }
//   }, false);
//   let test1 = monitorEvents(document.body, 'mouse')
//   console.log(test1);
  
  
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

    let $category_list = $('.categoryList')
    let $category_list2 = $('.categoryList2')
    let $category_prev = $('.categoryPrev img')
    let $category_next = $('.categoryNext img')

    //카테고리 리스트
    function LV1CatList(){
        let categoryList = JSON.parse(localStorage.getItem('categoryLV1'))
            categoryList_length = categoryList.length;
        for(let i=0; i<categoryList_length; i++){
            if(i <7){
                let html = "<li>";
                    html += '<div class="categoryBtn categoryFont categoryBack" data-catclass="'+categoryList[i].BC_NameEng+'" id="mainCatNum'+i+'" onclick="selectCat(this)"><span id="categoryIcon'+i+'"class="categoryIconBox categoryIcon'+i+'"></span><span class="categoryName" data-Kor="'+categoryList[i].BC_NameKor+'" data-Eng="'+categoryList[i].BC_NameEng+'">'+categoryList[i].BC_NameKor+'</span></div>';
                    html += "</li>";
                $category_list.append(html);
            }
            if(i >= 7){
                let html2 = "<li>";
                    html2 += '<div class="categoryBtn categoryFont categoryBack" data-catclass="'+categoryList[i].BC_NameEng+'" id="mainCatNum'+i+'" onclick="selectCat(this)"><span id="categoryIcon'+i+'"class="categoryIconBox categoryIcon'+i+'"></span><span class="categoryName" data-Kor="'+categoryList[i].BC_NameKor+'" data-Eng="'+categoryList[i].BC_NameEng+'">'+categoryList[i].BC_NameKor+'</span></div>';
                    html2 += "</li>";
                $category_list2.append(html2);
            }
        }
    }
    LV1CatList();
    let count = 0;
    let $svg_cat = $('.svgCat')
    function selectCat(e){
        let catId = e.id;
        let svg_class = $('#'+catId).data('catclass').replace(/ /g, '');
        let $catId_class = $('#'+catId).hasClass('selected');
        let $svg_class = $('.'+svg_class)
        //클릭시 전체 색상 초기화
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

    let $now_page = $('#nowPage')

    //카테고리 다음버튼
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
    //카테고리 이전버튼
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