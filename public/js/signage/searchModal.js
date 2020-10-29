// 검색창 초기화
function searchModalInit(){
    $('#myModal').hide();
    Keyboard.close();
    $("#searchBrandName").val('')
}

//검색 모달
    function searchModal(){
        count = 0;
        let searchModal = $('#myModal')[0]
        let searchClose = $('.searchClose')[0];                                
        
        searchClose.onclick = searchModalInit;

        window.onclick = function(event) {
            if (event.target == searchModal) {
                searchModalInit();
            }
        }
        searchModal.style.display = "block";
    }
    
    let $categoryChange = $('.categoryChange');
    let $searchNav = $('.searchNav');
    let $search_right = $('.search_right');
    let $searchInfo = $('.searchInfo');
    let $searchRightDetail = $('.searchRightDetail');
    let $searchRightAd = $('.searchRightAd');
    let $chooseCategory = $('#chooseCategory');
    let $searchLeft = $('.searchLeft');
    let $brandInfoLeft = $('.brandInfoLeft');
    let $searchCenter = $('.searchCenter');
    let $brandInfoCenter = $('.brandInfoCenter');
    let $categoryBtn = $('.categoryBtn');
    let $box_left = $('#box-left');
    let $box_center = $('#box-center');
    let $box_info = $('#box-info');
    let $brandMenuCenter = $('.brandMenuCenter');
    let $search_result = $('.searchResult')
    let $brandList = $('.brandList')
    let $searchList = $('.searchList')
    let $searchList2 = $('.searchList2')
    //검색모달 오픈
    function signageSearch(){
        $search_right.css('display','block');
        $searchInfo.css('display','block');
        $categoryChange.css('display','none');
        $searchRightDetail.css('display','none');
        $searchRightAd.css('display','none');
        $chooseCategory.text('TOTAL');
        $searchLeft.css('display','block');
        $brandInfoLeft.css('display','none');
        $searchCenter.css('display','block');
        $brandInfoCenter.css('display','none');
        $searchNav.css('display','block');
        $svgCat.css('fill','');
        $categoryBtn.removeClass('selected');
        $box_left.css('display','block');
        $box_center.css('display','block');
        $box_info.css('display','none');
        $brandMenuCenter.css('display','none');
        $('.svgCat').css('fill','')
        //카테고리 초기화
        mainPrev();
        //지도 초기화
        zoomReset();
        //이전 다음 버튼 초기화
        searchPrev();
        //카테고리 리스트 생성
        
        //전체브랜드 리스트 생성
        // searchBrandList();
        $('.brandList').css('display','block');
        //검색 모달 생성
        searchModal();
        //모달 플레이스 홀더
        searchModalLanguage();
        $searchList.css('display','block');
        $('.lv2category').removeClass('selectCat');
        $('.lv2category2').removeClass('selectCat');
        $('.searchCategory').removeClass('selected')
        $('.searchResult div').css('background-color','')
    }    
    //대분류 카테고리 리스트 생성
    searchCategoryListLV1();
    
    //전체 브랜드 리스트 생성
    function searchBrandList(){
        //리스트 초기화
        $search_result.empty();
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'));
        let jsonBrand_length = jsonBrand.length;
        let html = "";
        for(let i=0; i<jsonBrand_length; i++){
            let lanType1 = $eng.hasClass('choose') ? jsonBrand[i].BS_NameKor : jsonBrand[i].BS_NameEng;
            let lanType2 = $eng.hasClass('choose') ? jsonBrand[i].BC_NameKor : jsonBrand[i].BC_NameEng;
                html += "<div class='brandList' id="+jsonBrand[i].BS_ID+" onclick='brandClick(this)' data-lv1CategoryId="+jsonBrand[i].BCR_LV1_BC_ID+" data-lv2CateogryId="+jsonBrand[i].BCR_LV2_BC_ID+"><div class='categoryImg'><img src="+jsonBrand[i].BS_ThumbnailUrl+"></div>";
                html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">';
                html += "<ul><li><div class='searchBrand' data-kor='"+jsonBrand[i].BS_NameKor+"' data-eng='"+jsonBrand[i].BS_NameEng+"'>"+lanType1+"</div>";
                html += "<h4 class='searchLocation'>"+jsonBrand[i].LS_Floor+".<span class='searchLocation' data-kor='"+jsonBrand[i].BC_NameKor+"' data-eng='"+jsonBrand[i].BC_NameEng+"'>"+lanType2+"</span></h4><div class='searchTime'><span data-kor='영업시간 ' data-eng='open '>영업시간 </span>"+jsonBrand[i].BS_MainDtS.substring(0,5)+" ~ "+jsonBrand[i].BS_MainDtF.substring(0,5)+"</div></li></ul></div>";
                
        }
        $search_result.append(html);
        // console.log('html',html);
        
        
    }
    searchBrandList();
    //대분류 브랜드 리스트 생성 
    function LV1BrandList(lv1CatNum){
        //리스트 초기화
        // let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'));
            //검색내용이 있으면 리스트를 그려줌
        let lv1BrandList = [];
            lv1BrandList = jsonBrand.filter(data => data.BCR_LV1_BC_ID == lv1CatNum);
        let lv1BrandList_length = lv1BrandList.length;
        let html = "";
        for(let j=0; j<lv1BrandList_length; j++){
            let lanType1 = $eng.hasClass('choose') ? lv1BrandList[j].BS_NameKor : lv1BrandList[j].BS_NameEng;
            let lanType2 = $eng.hasClass('choose') ? lv1BrandList[j].BC_NameKor : lv1BrandList[j].BC_NameEng;
            html += "<div class='brandList' id="+lv1BrandList[j].BS_ID+" onclick='brandClick(this)' data-lv1CategoryId="+lv1BrandList[j].BCR_LV1_BC_ID+" ><div><div class='categoryImg'><img src="+lv1BrandList[j].BS_ThumbnailUrl+"></div></div>";
            html += "<ul><li><div class='searchBrand'>"+lanType1+"</div>";
            html += "<h4 class='searchLocation'>"+lv1BrandList[j].LS_Floor+"."+lanType2+"</h4><div class='searchTime'>영업시간 "+lv1BrandList[j].BS_MainDtS.substring(0,5)+" ~ "+lv1BrandList[j].BS_MainDtF.substring(0,5)+"</div></li></ul>";
        }
        $search_result.append(html);
    }

    //대분류 카테고리 리스트
    function searchCategoryListLV1(){
        $searchList.empty();
        $searchList2.empty();
        //로컬에 저장된 카테고리를 사용
        let searchCatLV1 = JSON.parse(localStorage.getItem('categoryLV1'));
        let searchCatLV1_length = searchCatLV1.length;
        let html = "";
        let html2 = "";
        for(let i=0; i<searchCatLV1_length; i++){
            let lanType = ( $eng.hasClass('choose') ) ? searchCatLV1[i].BC_NameKor : searchCatLV1[i].BC_NameEng;
            if(i < 9){
                html += "<li><label>";
                html += "<input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                html += "<div class='searchCategory searchCategoryFont categoryBack' data-lv1cat ="+Number(i+1)+" onclick='LV1Cat(this)' id='lv1Cateogry"+i+"' value='"+lanType+"'  data-kor="+searchCatLV1[i].BC_NameKor+" data-eng='"+searchCatLV1[i].BC_NameEng+"'>"+searchCatLV1[i].BC_NameKor+"</div>";
                html += "</label></li>";
                
            }
            else if(i >= 9){
                html2 += "<li><label>";
                html2 += "<input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                html2 += "<div class='searchCategory searchCategoryFont categoryBack' data-lv1cat ="+Number(i+1)+"  onclick='LV1Cat(this)' id='lv1Cateogry"+i+"' value='"+lanType+"'  data-kor="+searchCatLV1[i].BC_NameKor+" data-eng='"+searchCatLV1[i].BC_NameEng+"'>"+searchCatLV1[i].BC_NameKor+"</div>";
                html2 += "</label></li>";
                
            }

        }
        $searchList.append(html);
        $searchList2.append(html2);
    }

    //중분류 카테고리 렌더
    function lv2CatList(){
        let html = "";
        let html2 = "";
        for(let i=1; i<11; i++){
            html += "<ul class='lv2category2 searchCatSub"+i+"' data-lv2catid="+i+"></ul>"
        }
        $searchList2.after(html)

        for(let i=1; i<11; i++){
            html2 += "<ul class='lv2category searchCat"+i+"' data-lv2catid="+i+"></ul>"
        }
        $searchList2.after(html2)
        // BCR_LV1_CAT
        let cat_arr = [1,2,3,4,5,6,7,8,9,10]
        for(let i=0; i<cat_arr.length; i++){
            lv2CatRoad(cat_arr[i])
        }
    }
    lv2CatList();

    //중분류 카테고리 내용
    function lv2CatRoad(data){
        let searchCatLV2 = JSON.parse(localStorage.getItem('categoryLV2'));
        let searchCatLV2_length = searchCatLV2.length;
        let cat_lv2_arr = [];
        let cat_length;
        for(let i=0; i<searchCatLV2_length; i++){
            let html ="<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'><div class='searchCategory searchCategoryFont categoryBack' onclick='LV2Cat(this)' id='lv2Cateogry"+i+"' data-lv2cat ="+searchCatLV2[i].BC_ID+" data-kor='"+searchCatLV2[i].BC_NameKor+"' data-eng='"+searchCatLV2[i].BC_NameEng+"'>"+searchCatLV2[i].BC_NameKor+"</div></label></li>"
            if(searchCatLV2[i].BCR_LV1_BC_ID == data){
                cat_lv2_arr.push(searchCatLV2[i].BCR_LV1_BC_ID)
                cat_length = cat_lv2_arr.length;
                if(cat_length < 9){
                    $('.searchCat'+data+'').append(html)
                    $searchNav.css('display','none');
                }else if(cat_length >= 9){
                    $('.searchCatSub'+data+'').append(html)
                    $searchNav.css('display','none');
                }
            }
        }
    }
    lv2CatRoad();

    //대분류 카테고리 클릭
    let catChk = 0;
    function LV1Cat(e){
        //선택된 카테고리 아이디
        let lv1_cat = e.dataset.lv1cat 
        //상단 선택된 카테고리 명
        if(catChk == 0){
            let chooseCatName = e.textContent;
            $chooseCategory.text(chooseCatName);
        }
        //업종 광고 변경
        AD.showCategoryAD(e.dataset.lv1cat);
        sessionStorage.setItem('ad_category_id',e.dataset.lv1cat)
        //이전 다음 초기화
        searchPrev();
        //중분류 브랜드 리스트
        $('.brandList').css('display','none')
        $(`.brandList[data-lv1categoryid=${lv1_cat}]`).css('display','block')
        //카테고리 변경 버튼
        createCatBtn();
        localStorage.setItem('catlv2',e.dataset.lv1cat)
        $searchList.css('display','none')
        $searchList2.css('display','none')
        $(`.lv2category[data-lv2catid=${e.dataset.lv1cat}]`).addClass('selectCat')
        $('.searchCatSub'+e.dataset.lv1cat+'').css('display','none');
        $searchNav.css('display','none')
        //이전 다음 버튼 노출 여부
        if($('.searchCatSub'+e.dataset.lv1cat+'').children().length > 0){
            $searchNav.css('display','block')
        }
    }

    //중분류 카테고리 클릭
    function LV2Cat(e){
        let lv2Cateogry = e.id
        $('.brandList').css('display','none')
        $(`.brandList[data-lv2cateogryid=${e.dataset.lv2cat}]`).css('display','block')
        //카테고리 색상변경
        if($('.searchCheck').attr('checked',false)){
            $('.searchCategory').removeClass('selected');
        }
        if($(e).attr('checked',true)){
            $('#'+lv2Cateogry).addClass('selected');
        }  
    }

    //카테고리변경 버튼 생성
    function createCatBtn(){
        $categoryChange.css('display','block');
        $searchInfo.css('display','none');
        $searchRightDetail.css('display','none');
        $search_right.css('display','none');
        $searchRightAd.css('display','block');
    }

    //카테고리 변경하기 클릭
    function changeCategory(){
        $('.searchCategory').removeClass('selected')
        $('.lv2category').removeClass('selectCat')
        $searchList.css('display','block')
        signageSearch();
        localStorage.removeItem('catlv2');
        $('.brandList').css('display','block')
        catChk = 0;
        
    }


    
    let $searchPage = $('#searchPage')
    let $searchPrev = $('#searchPrev')
    let $searchNext = $('#searchNext')
    let $searchNext_img = $('#searchNext img')
    let $searchPrev_img = $('#searchPrev img')
    
    //카테고리 이전 버튼
    function searchPrev(){
        let cat_lv2 = localStorage.getItem('catlv2')
        if($searchPage.text()==2){
            $searchPage.text('1');
            //중분류 이전
            // if($(`.lv2category[data-lv2catid=${cat_lv2}]`).hasClass('selectCat') == 'none' && $(`.lv2category2[data-lv2catid=${cat_lv2}]`).hasClass('selectCat') == 'block'){
            if($(`.searchCatSub`+cat_lv2+`[data-lv2catid=${cat_lv2}]`).hasClass('selectCat') == true){
                $('.searchCat'+cat_lv2+'').addClass('selectCat')
                $('.searchCatSub'+cat_lv2+'').css('display','none')
                $('.searchCatSub'+cat_lv2+'').removeClass('selectCat')
            }
            //대분류 이전
            if($('.lv2category').hasClass('selectCat') == false && $('.lv2category').hasClass('selectCat') == false){
                $searchList.css('display','block')
                $searchList2.css('display','none')
            }

            $searchPrev.removeClass('searchPrevClick');
            $searchNext.addClass('searchNextClick');
            $searchNext_img.attr('src','/img/signage/right_arrow_active_icon.png');
            $searchPrev_img.attr('src','/img/signage/left_arrow_icon.png');
        }
    }
    //카테고리 다음 버튼
    function searchNext(){
        let cat_lv2 = localStorage.getItem('catlv2')
        if($searchPage.text()==1){
            $searchPage.text('2');
            //중분류 다음
            // if($(`.lv2category[data-lv2catid=${cat_lv2}]`).hasClass('selectCat') == true){
            if($(`.searchCat`+cat_lv2+`[data-lv2catid=${cat_lv2}]`).hasClass('selectCat') == true){
                // console.log('good');
                $('.searchCat'+cat_lv2+'').removeClass('selectCat');
                $('.searchCatSub'+cat_lv2+'').css('display','block').addClass('selectCat');
                // $('.searchCatSub'+cat_lv2+'').addClass('selectCat');
            }
            //대분류 다음
            if($('.lv2category').hasClass('selectCat') == false && $('.lv2category2').hasClass('selectCat') == false){
                $searchList.css('display','none')
                $searchList2.css('display','block')
            }

            $searchPrev.addClass('searchPrevClick');
            $searchNext.removeClass('searchNextClick');
            $searchNext_img.attr('src','/img/signage/right_arrow_icon.png');
            $searchPrev_img.attr('src','/img/signage/left_arrow_active_icon.png');
            
        }
    }

    //브랜드 리스트 클릭시
    function brandClick(e){
        $('.brandDetail').empty();
        $('.searchResult div').css('background-color','')
        $('#'+e.id).css('background-color','#f9eff6');
        $search_right.css('display','none');
        $searchRightAd.css('display','none');
        $searchRightDetail.css('display','block');
        $('.category_bottom div').css('display','block')
        // 업종 광고 변경
        AD.showCategoryAD(e.dataset.lv1categoryid);

        // let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'));
        let selectBrand = [];
        //BCR_LV1_BC_ID에 검색 
        selectBrand = jsonBrand.filter(data => data.BS_ID == e.id);

        let lanType1 = $eng.hasClass('choose') ? selectBrand[0].BS_NameKor : selectBrand[0].BS_NameEng;
        let lanType2 = $eng.hasClass('choose') ? selectBrand[0].BC_NameKor : selectBrand[0].BC_NameEng;
        let lanType3 = $eng.hasClass('choose') ? selectBrand[0].BS_ContentsKor : selectBrand[0].BS_ContentsEng;
        let lanType4 = $eng.hasClass('choose') ? '상세 보기' : 'Detail';
        let lanType5 = $eng.hasClass('choose') ? '위치 보기' : 'Location';

        let html = "<div><img src="+selectBrand[0].BS_ImageUrl+"></div>";
            html += "<div class='brandContents'><ul>";
            html += "<li><h2 class='brandName'>"+lanType1+"</h2></li>";
            html += "<li><h4 class='searchLocation'>"+selectBrand[0].LS_Floor+"."+lanType2+"</h4></li>";
            html += "<li><div class='brandInfo'>"+lanType3+"</div></li>";
            html += "</ul></div>";
            html += "<ul class='detailInfo'>";
            html += "<li><div class='infoImgNav' id="+'bs'+selectBrand[0].BS_ID+" data-lv1cat="+selectBrand[0].BCR_LV1_BC_ID+" onclick='storeInfo(this)'>"+lanType4+"</div></li>";
            html += "<li><div class='infoImgNav' id="+"area"+selectBrand[0].LS_Number+" onclick='storeLocation(this)'>"+lanType5+"</div></li></ul>";
        $('.brandDetail').append(html);
        // debugger;
        
    }


//검색창 플레이스홀더 내용 번역
    function searchModalLanguage(){
        $searchInfo.empty();
        let lanType1 = $eng.hasClass('choose') ? '이곳을 클릭하여 찾으시는 브랜드명을 검색하세요. (초성검색가능)' : 'Click here to search for the brand name you are looking for';
        let lanType2 = $eng.hasClass('choose') ? '위의<span style="color: #222222; font-weight: 500;"> 카테고리를 선택</span>하세요.' : 'Select a<span style="color: #222222; font-weight: 500;"> category </span>above.';
        let lanType3 = $eng.hasClass('choose') ? '카테고리 변경하기' : 'Change Category';
        let lanType4 = $eng.hasClass('choose') ? '닫기' : 'Close';
        let lanType5 = $eng.hasClass('choose') ? '검색' : 'Search';

        $('#searchBrandName').attr('placeholder',lanType1);
        let html = lanType2;
        $searchInfo.append(html);
        $('#chagneCategory').text(lanType3);
        $('.searchCloseName').text(lanType4);
        $('.searchTopName').text(lanType5);
    }

  
   //브랜드 위치보기
    function storeLocation(e){
        let storeArea = e.id.replace(/area/g,'')
        $('#myModal').css('display','none');
        //키보드 닫기
        searchModalInit();
        //검색 내역 초기화
        searchCancel();
        $('.floorBtn div').removeClass('floorSelect');
        $brandInfoCenter.css('display','none');
        $brandMenuCenter.css('display','none');
    //1층    
        if(storeArea >=1001 && storeArea <= 1230){
            $1f_store_path.css('fill','#E2E2E2');
            $center_left_1f.css('display','block');
            $center_left_2f.css('display','none');
            $center_left_3f.css('display','none');
            $('#floor1Btn').addClass('floorSelect');
            $nowFloor.text('1F');
            $1f_store_name.each(function(){
                // console.log('good!!!',$(this));
                // let storeName = this.childNodes[1].innerHTML;
                let storeName = $(this);
                
                let storeNumber;
                console.log('storeName',storeName.text());
                //svg텍스트가 선택한 브랜드 명과 같으면
                if(storeName.text() == $('#h'+storeArea+'-2').text()){
                    //해당 아이디를 가져옴
                    storeNumber = this.id.substring('1','5');
                    $('#h'+storeNumber).css('fill','#a91179');
                }
            })
            //좌표이동
                //1사 분면
                if((storeArea >= 1001 && storeArea <= 1026) ||(storeArea >= 1133 && storeArea <= 1147) || (storeArea >= 1220 && storeArea <= 1226)){
                    $central_svg_1f.css('left','424px').css('top','250px');
                    storeMapSize(1,15,2.125);
                }
                //2사 분면
                else if((storeArea >= 1027 && storeArea <= 1056) ||(storeArea >= 1148 && storeArea <= 1171)){
                    $central_svg_1f.css('left','-319px').css('top','273px');
                    storeMapSize(1,15,2.125);
                }
                //3사 분면
                else if((storeArea >= 1057 && storeArea <= 1096) ||(storeArea >= 1172 && storeArea <= 1196) ||(storeArea >= 1227 && storeArea<= 1230)){
                    $central_svg_1f.css('left','-378px').css('top','-435px');
                    storeMapSize(1,15,2.125);
                }
                //4사 분면
                else if((storeArea >= 1097 && storeArea <= 1132) ||(storeArea >= 1199 && storeArea <= 1219)){
                    $central_svg_1f.css('left','445px').css('top','-297px');
                    storeMapSize(1,15,2.125);
                }

            }
        
        //2층
            else if(storeArea>= 2001 && storeArea<= 2102){
                console.log('2층')
                $2f_store_path.css('fill','#E2E2E2');
                $center_left_1f.css('display','none');
                $center_left_2f.css('display','block');
                $center_left_3f.css('display','none');
                $('#floor2Btn').addClass('floorSelect');
                $nowFloor.text('2F');
                $2f_store_name.each(function(){
                    let storeName = $(this);
                    let storeNumber;
                    //svg텍스트가 선택한 브랜드 명과 같으면
                    if(storeName.text() == $('#h'+storeArea+'-2').text()){
                        //해당 아이디를 가져옴
                        storeNumber = this.id.substring('1','5');
                        $('#h'+storeNumber).css('fill','#a91179');
                    }
                })
                //좌표이동
                //1사 분면
                if((storeArea >= 2001 && storeArea <= 2010) ||(storeArea >= 2064 && storeArea <= 2067) || (storeArea == 2060 || storeArea == 2101)){
                    $central_svg_2f.css('left','424px').css('top','250px');
                    storeMapSize(2,15,2.125);
                }
                //2사 분면
                else if((storeArea >= 2011 && storeArea <= 2027) ||(storeArea >= 2068 && storeArea <= 2077) || storeArea == 2061){
                    $central_svg_2f.css('left','-319px').css('top','273px');
                    storeMapSize(2,15,2.125);
                }
                //3사 분면
                else if((storeArea >= 2028 && storeArea <= 2044) ||(storeArea >= 2078 && storeArea <= 2090) ||(storeArea == 2062)){
                    $central_svg_2f.css('left','-378px').css('top','-435px');
                    storeMapSize(2,15,2.125);
                }
                //4사 분면
                else if((storeArea >= 2045 && storeArea <= 2059) ||(storeArea >= 2091 && storeArea <= 2100) || storeArea == 2063){
                    $central_svg_2f.css('left','445px').css('top','-297px');
                    storeMapSize(2,15,2.125);
                }
            }
        //3층
            else if(storeArea >= 3001 && storeArea <= 3106){
                // console.log('3층')
                $3f_store_path.css('fill','#E2E2E2');
                $center_left_1f.css('display','none');
                $center_left_2f.css('display','none');
                $center_left_3f.css('display','block');
                $('#floor3Btn').addClass('floorSelect');
                $nowFloor.text('3F');
                $3f_store_name.each(function(){
                let storeName = $(this);
                let storeNumber;
                //svg텍스트가 선택한 브랜드 명과 같으면
                if(storeName.text() == $('#h'+storeArea+'-2').text()){
                    //해당 아이디를 가져옴
                    storeNumber = this.id.substring('1','5');
                    // storeNumber = $(this).attr('id').substring('1','5');
                    $('#h'+storeNumber).css('fill','#a91179');
                }
                //좌표이동
                //1사 분면
                if((storeArea >= 3001 && storeArea <= 3010) ||(storeArea >= 3060 && storeArea <= 3061) ||(storeArea >= 3068 && storeArea <= 3071) || (storeArea == 3106)){
                    $central_svg_3f.css('left','424px').css('top','250px');
                    storeMapSize(3,15,2.125);
                }
                //2사 분면
                else if((storeArea >= 3011 && storeArea <= 3027) ||(storeArea >= 3062 && storeArea <= 3063) ||(storeArea >= 3072 && storeArea <= 3081)){
                    $central_svg_3f.css('left','-319px').css('top','273px');
                    storeMapSize(3,15,2.125);
                }
                //3사 분면
                else if((storeArea >= 3028 && storeArea <= 3044) ||(storeArea >= 3064 && storeArea <= 3065) ||(storeArea >= 3082 && storeArea <= 3095)){
                    $central_svg_3f.css('left','-378px').css('top','-435px');
                    storeMapSize(3,15,2.125);
                }
                //4사 분면
                else if((storeArea >= 3045 && storeArea <= 3059) ||(storeArea >= 3066 && storeArea <= 3067) ||(storeArea >= 3096 && storeArea <= 3105)){
                    $central_svg_3f.css('left','445px').css('top','-297px');
                    storeMapSize(3,15,2.125);
                }
            })
        }
    }

//브랜드 상세보기
    function storeInfo(e){
        if($(e).text() === '상세 보기' || ($(e).text() === 'Detail')){
            $eng.hasClass('choose') ? $(e).text('상세보기 닫기') : $(e).text('Close');
            //상세정보 정보 버튼에 아이디 추가
            $('.brandInfoBtn div').attr('id',e.id);
            $('.brandMenuBtn div').attr('id',e.id);
            $('.brandEventBtn div').attr('id',e.id);
            $(e).addClass('detail_click');
            $searchLeft.css('display','none');
            $brandInfoLeft.css('display','block');
            $searchCenter.css('display','none');
            brandNavInfo();
            AD.showCategoryAD(e.dataset.lv1cat);
            // AD.showCategoryAD(e.id.replace('bs',''));
        }else if($(e).text() === '상세보기 닫기' || $(e).text() === 'Close'){
            $eng.hasClass('choose') ? $(e).text('상세 보기') : $(e).text('Detail');
            $(e).removeClass('detail_click');
            $searchLeft.css('display','block');
            $brandInfoLeft.css('display','none');
            $searchCenter.css('display','block');
            $brandInfoCenter.css('display','none');
            $brandMenuCenter.css('display','none');
        }
    }

//브랜드 정보
    function brandNavInfo(){
        $('.brandInfoText').removeClass('selected');
        $('.brandInfoBtn div').addClass('selected');
        $brandInfoCenter.css('display','block');
        $brandMenuCenter.css('display','none');
        let brandID = $('.brandInfoBtn div').attr('id');
        brandInfoList(brandID.replace(/bs/g,''));
    }

//브랜드 메뉴
    function brandNavMenu(e){
        $('.brandInfoText').removeClass('selected');
        $(e).addClass('selected');
        $brandInfoCenter.css('display','none');
        $brandMenuCenter.css('display','block');
        brandMenuList(e.id);
    }

//브랜드 상세정보 
    function brandInfoList(bsID){
        $('.brandInfoDetail_txt').empty();
        $('#infoStoreName').empty();
        $('#infoStoreNumber').empty();
        let jsonBrandInfoList = JSON.parse(localStorage.getItem('brandList'));
        let brandInfoList = [];   
        brandInfoList = jsonBrandInfoList.filter(data => data.BS_ID == bsID);
        let lanType1 = $eng.hasClass('choose') ? "<dd style='color: #999;'>"+brandInfoList[0].BS_PersonalDayKor+' 휴무'+"</dd></dl>" : "<dd style='color: #999;'>"+'Closed for the '+brandInfoList[0].BS_PersonalDayEng+"</dd></dl>";
        let lanType2 = $eng.hasClass('choose') ? brandInfoList[0].BS_Addr1Kor : brandInfoList[0].BS_Addr1Eng;
        let lanType3 = $eng.hasClass('choose') ? brandInfoList[0].BS_Addr2Kor : brandInfoList[0].BS_Addr2Eng;
        let lanType4 = $eng.hasClass('choose') ? brandInfoList[0].BS_NameKor : brandInfoList[0].BS_NameEng;

        let lanName1 = $eng.hasClass('choose') ? "<h3>상세정보 <span>단체석 예약, 포장 가능</span></h3>" : "<h3>Information <span>Group seat reservation and packing available</span></h3>";
        let lanName2 = $eng.hasClass('choose') ? "<dl><dt><i class='far fa-clock'></i> 영업시간</dt>" : "<dl><dt><i class='far fa-clock'></i> OpenTime</dt>";
        let lanName3 = $eng.hasClass('choose') ? "<dl><dt><i class='fas fa-mobile-alt'></i> 전화번호</dt>" : "<dl><dt><i class='fas fa-mobile-alt'></i> Phone</dt>";
        let lanName4 = $eng.hasClass('choose') ? "<dl><dt><i class='fas fa-map-marker-alt'></i> 주소</dt>" : "<dl><dt><i class='fas fa-map-marker-alt'></i> Address</dt>";
        let lanName5 = $eng.hasClass('choose') ? $('#infoStoreNumber').append(brandInfoList[0].LS_Number + ' 호') : $('#infoStoreNumber').append('Room No. '+brandInfoList[0].LS_Number)
        //html
        let html = lanName1;
            html += lanName2;
            html += "<dd>"+brandInfoList[0].BS_MainDtS.substring(0,5)+' ~ '+brandInfoList[0].BS_MainDtF.substring(0,5)+"</dd>";
            html += lanType1;
            html += lanName3;
            html += "<dd>"+brandInfoList[0].BS_Phone+"</dd>";
            html += "<dd>"+brandInfoList[0].BS_CEOPhone+"</dd></dl>";

            html += lanName4;
            html += "<dd>"+lanType2+"</dd>";
            html += "<dd>"+lanType3+"</dd></dl>";
            // debugger;
        $('.brandInfoDetail_txt').append(html);
        $('#infoStoreName').append(lanType4);
    }

    //브랜드 메뉴 정보
    function brandMenuList(bsID){
        let $event_menu_one = $('#eventMenuOne')
        let $event_menu_two = $('#eventMenuTwo')
        let eventList = JSON.parse(localStorage.getItem('eventList'));
        let normalList = JSON.parse(localStorage.getItem('normalList'));
        let brnadId = bsID.replace(/bs/,'');
        let resultEvent = [];
        let resultNormal = [];
        let eventOne = [];
        let eventTwo = [];
        let eventThree = [];
    //현재 브랜드의 값을 도출
        resultEvent = eventList.filter(data => data.M_BS_ID == brnadId);
        resultNormal = normalList.filter(data => data.M_BS_ID == brnadId);
        console.log('resultNormal',resultNormal);
    //M_MC_ID가 같은것 끼리 묶어주기
        eventOne = resultEvent.filter(data => data.M_MC_ID == 1);
        eventTwo = resultEvent.filter(data => data.M_MC_ID == 2);
        eventThree = resultEvent.filter(data => data.M_MC_ID == 3);
  
        let eventOne_length = eventOne.length;
        let eventTwo_length = eventTwo.length;
        let resultNormal_length = resultNormal.length;
        $event_menu_one.empty();
        $event_menu_two.empty();
        $('#normalList').empty();

        let html = "";
        for(let i=0; i<eventOne_length; i++){
            let languageType1 = $eng.hasClass('choose') ? eventOne[i].M_NameKor : eventOne[i].M_NameEng;
            let languageName1 = $eng.hasClass('choose') ? eventOne[0].MC_NameKor : eventOne[0].MC_NameEng;
                html += '<li><div class="menu_best_pic"><img src='+eventOne[i].M_ImageUrl+'></div>';
                html += '<div class="menu_best_name">'+languageType1+'</div>';
                html += '<div class="menu_best_price">'+eventOne[i].M_Price+'</div></li>';
            $('#eventMenuOneName').text(languageName1);
        
        }
        $event_menu_one.append(html);
 
        let html2 = "";
        for(let i=0; i<eventTwo_length; i++){
            let languageType2 = $eng.hasClass('choose') ? eventTwo[i].M_NameKor : eventTwo[i].M_NameEng;
            let languageName2 = $eng.hasClass('choose') ? eventTwo[0].MC_NameKor : eventTwo[0].MC_NameEng;
                html2 += '<li><div class="menu_best_pic"><img src='+eventTwo[i].M_ImageUrl+'></div>';
                html2 += '<div class="menu_best_name">'+languageType2+'</div>';
                html2 += '<div class="menu_best_price">'+eventTwo[i].M_Price+'</div></li>';
            $('#eventMenuTwoName').text(languageName2);
        }
        $event_menu_two.append(html2);
        
        let normal_count = 0;
        let html3 = "<li>";
        let html4 = "<li>";
        for(let i=0; i<resultNormal_length; i++){
            let languageType3 = $eng.hasClass('choose') ? resultNormal[i].M_NameKor : resultNormal[i].M_NameEng;

            //증가할때 마다 좌우로 나눠줌
            normal_count += 1;
            if(normal_count % 2 != 0){
                html3 += '<dl>';
                html3 += '<dt>'+languageType3+'</dt>';
                html3 += '<dd><h6>'+resultNormal[i].M_Price+'</h6></dd></dl>';
            }else{
                html4 += '<dl>';
                html4 += '<dt>'+languageType3+'</dt>';
                html4 += '<dd><h6>'+resultNormal[i].M_Price+'</h6></dd></dl>';
            }
        }
        //반복문 탈출 후 리스트 닫아주고 두개를 합쳐준 후 normalList에 추가
        html3 += "</li>";
        html4 += "</li>";
        let normal_html = html3 + html4
        $('#normalList').append(normal_html);
    }