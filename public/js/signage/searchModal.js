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

    //검색모달 오픈
    function signageSearch(){
        $('.search_right').css('display','block');
        $('.searchInfo').css('display','block');
        $('.categoryChange').css('display','none');
        $('.searchRightDetail').css('display','none');
        $('.searchRightAd').css('display','none');
        $('#chooseCategory').text('TOTAL');
        $('.searchLeft').css('display','block');
        $('.brandInfoLeft').css('display','none');
        $('.searchCenter').css('display','block');
        $('.brandInfoCenter').css('display','none');
        $('.searchNav').css('display','block');
        $('.svgCat').css('fill','');
        $('.categoryBtn').removeClass('selected');
        $('#box-left').css('display','block');
        $('#box-center').css('display','block');
        $('#box-info').css('display','none');
        $('.brandMenuCenter').css('display','none');
        //카테고리 초기화
        mainPrev();
        //지도 초기화
        zoomReset();
        //이전 다음 버튼 초기화
        searchPrev();
        //카테고리 리스트 생성
        searchCategoryListLV1();
        //전체브랜드 리스트 생성
        searchBrandList();
        //검색 모달 생성
        searchModal();
        //모달 플레이스 홀더
        searchModalLanguage();
    }    

    
    //전체 브랜드 리스트 생성
    function searchBrandList(){
        //리스트 초기화
        $('.searchResult').empty();
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'));
        for(let i=0; i<jsonBrand.length; i++){
            let lanType1 = $('#kor').hasClass('choose') ? jsonBrand[i].BS_NameKor : jsonBrand[i].BS_NameEng;
            let lanType2 = $('#kor').hasClass('choose') ? jsonBrand[i].BC_NameKor : jsonBrand[i].BC_NameEng;
            let html = "<div class='brandList' id="+jsonBrand[i].BS_ID+" onclick='brandClick(this)' data-lv1CategoryId="+jsonBrand[i].BCR_LV1_BC_ID+"><div class='categoryImg'><img src="+jsonBrand[i].BS_ThumbnailUrl+"></div>";
                html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">';
                html += "<ul><li><div class='searchBrand'>"+lanType1+"</div>";
                html += "<h4 class='searchLocation'>"+jsonBrand[i].LS_Floor+".<span class='searchLocation'>"+lanType2+"</span></h4><div class='searchTime'>영업시간 "+jsonBrand[i].BS_MainDtS.substring(0,5)+" ~ "+jsonBrand[i].BS_MainDtF.substring(0,5)+"</div></li></ul>";
            $('.searchResult').append(html);

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
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'));
            //검색내용이 있으면 리스트를 그려줌
        let lv1BrandList = [];
            lv1BrandList = jsonBrand.filter(data => data.BCR_LV1_BC_ID == lv1CatNum);

        for(let j=0; j<lv1BrandList.length; j++){
            let lanType1 = $('#kor').hasClass('choose') ? lv1BrandList[j].BS_NameKor : lv1BrandList[j].BS_NameEng;
            let lanType2 = $('#kor').hasClass('choose') ? lv1BrandList[j].BC_NameKor : lv1BrandList[j].BC_NameEng;

            let html = "<div class='brandList' id="+lv1BrandList[j].BS_ID+" onclick='brandClick(this)' data-lv1CategoryId="+lv1BrandList[j].BCR_LV1_BC_ID+"><div><div class='categoryImg'><img src="+lv1BrandList[j].BS_ThumbnailUrl+"></div></div>";
                html += "<ul><li><div class='searchBrand'>"+lanType1+"</div>";
                html += "<h4 class='searchLocation'>"+lv1BrandList[j].LS_Floor+"."+lanType2+"</h4><div class='searchTime'>영업시간 "+lv1BrandList[j].BS_MainDtS.substring(0,5)+" ~ "+lv1BrandList[j].BS_MainDtF.substring(0,5)+"</div></li></ul>";
            $('.searchResult').append(html);

        }
    }

    //중분류 브랜드 리스트 생성
    function LV2BrandList(lv2CatNum){
        $('#searchResult').empty();
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'));
        //BCR_LV1_BC_ID에 검색 
        let lv2BrandList = [];
        lv2BrandList = jsonBrand.filter(data => data.BCR_LV2_BC_ID == lv2CatNum );
        for(let i=0; i<lv2BrandList.length; i++){
            let lanType1 = $('#kor').hasClass('choose') ? lv2BrandList[i].BS_NameKor : lv2BrandList[i].BS_NameEng;
            let lanType2 = $('#kor').hasClass('choose') ? lv2BrandList[i].BC_NameKor : lv2BrandList[i].BC_NameEng;

            let html = "<div class='brandList' id="+lv2BrandList[i].BS_ID+" onclick='brandClick(this)' data-lv1CategoryId="+jsonBrand[i].BCR_LV1_BC_ID+"><div><div class='categoryImg'><img src="+lv2BrandList[i].BS_ThumbnailUrl+"></div></div>";
                html += "<ul><li><div class='searchBrand'>"+lanType1+"</div>";
                html += "<h4 class='searchLocation'> "+lv2BrandList[i].LS_Floor+"."+lanType2+"</h4><div class='searchTime'>영업시간 "+lv2BrandList[i].BS_MainDtS.substring(0,5)+" ~ "+lv2BrandList[i].BS_MainDtF.substring(0,5)+"</div></li></ul>";
            $('.searchResult').append(html);
        }
    }

    //대분류 카테고리 리스트
    function searchCategoryListLV1(){
        $('.searchList').empty();
        $('.searchList2').empty();
        //로컬에 저장된 카테고리를 사용
        let searchCatLV1 = JSON.parse(localStorage.getItem('categoryLV1'));
        for(let i=0; i<searchCatLV1.length; i++){
            let lanType = ( $('#kor').hasClass('choose') ) ? searchCatLV1[i].BC_NameKor : searchCatLV1[i].BC_NameEng;
            if(i < 9){
                let html = "<li><label>";
                    html += "<input type='checkbox' name='searchCategoryList' data-lv1cat ="+Number(i+1)+" onclick='LV1Cat(this)' id='lv1Cateogry"+i+"' class='searchCheck' value='"+lanType+"'>";
                    html += "<div class='searchCategory searchCategoryFont categoryBack'>"+lanType+"</div>";
                    html += "</label></li>";
                $('.searchList').append(html);
            }
            else if(i >= 9){
                let html = "<li><label>";
                    html += "<input type='checkbox' name='searchCategoryList' data-lv1cat ="+Number(i+1)+"  onclick='LV1Cat(this)' id='lv1Cateogry"+i+"' class='searchCheck' value='"+lanType+"'>";
                    html += "<div class='searchCategory searchCategoryFont categoryBack'>"+lanType+"</div>";
                    html += "</label></li>";
                $('.searchList2').append(html);
            }

        }
    }

    //중분류 카테고리 리스트
    function searchCategoryListLV2(lv1CatNum){
        let searchCatLV2 = JSON.parse(localStorage.getItem('categoryLV2'));
        let resultCatLV2 = new Array();
        $('.searchList').empty();
        $('.searchList2').empty();
        //중분류 카테고리
        resultCatLV2 = searchCatLV2.filter(data => data.BCR_LV1_BC_ID == lv1CatNum);

        for(let j=0; j<resultCatLV2.length; j++){
            let lanType1 = $('#kor').hasClass('choose') ? resultCatLV2[j].BC_NameKor : resultCatLV2[j].BC_NameEng;
        
            if(j < 9){
                let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                    html += "<div class='searchCategory searchCategoryFont categoryBack' onclick='LV2Cat(this)' id='lv2Cateogry"+j+"' data-lv2cat ="+resultCatLV2[j].BC_ID+">"+lanType1+"</div></label></li>";
                $('.searchList').append(html);
                $('.searchNav').css('display','none');
            }
            else if(j >=9){
                let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                    html += "<div class='searchCategory searchCategoryFont categoryBack' onclick='LV2Cat(this)' id='lv2Cateogry"+j+"' data-lv2cat ="+resultCatLV2[j].BC_ID+">"+lanType1+"</div></label></li>";
                $('.searchList2').append(html);
                $('.searchNav').css('display','block');
            }
        }
    }
   
   
   //브랜드 리스트 클릭시
    function brandClick(e){
        $('.brandDetail').empty();
        $('.searchResult div').css('background-color','')
        $('#'+e.id).css('background-color','#f9eff6');
        $('.search_right').css('display','none');
        $('.searchRightAd').css('display','none');
        $('.searchRightDetail').css('display','block');
        $('.category_bottom div').css('display','block')
        // 업종 광고 변경
        AD.showCategoryAD(e.dataset.lv1categoryid);
        
        // let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'));
        let selectBrand = [];
        //BCR_LV1_BC_ID에 검색 
        selectBrand = jsonBrand.filter(data => data.BS_ID == e.id);

        let lanType1 = $('#kor').hasClass('choose') ? selectBrand[0].BS_NameKor : selectBrand[0].BS_NameEng;
        let lanType2 = $('#kor').hasClass('choose') ? selectBrand[0].BC_NameKor : selectBrand[0].BC_NameEng;
        let lanType3 = $('#kor').hasClass('choose') ? selectBrand[0].BS_ContentsKor : selectBrand[0].BS_ContentsEng;
        let lanType4 = $('#kor').hasClass('choose') ? '위치 보기' : 'Location';

        let html = "<div><img src="+selectBrand[0].BS_ImageUrl+"></div>";
            html += "<div class='brandContents'><ul>";
            html += "<li><h2 class='brandName'>"+lanType1+"</h2></li>";
            html += "<li><h4 class='searchLocation'>"+selectBrand[0].LS_Floor+"."+lanType2+"</h4></li>";
            html += "<li><div class='brandInfo'>"+lanType3+"</div></li>";
            html += "</ul></div>";
            html += "<ul class='detailInfo'>";
            html += "<li><div class='infoImgNav' id="+'bs'+selectBrand[0].BS_ID+" onclick='storeInfo(this)'>상세 보기</div></li>";
            html += "<li><div class='infoImgNav' id="+"area"+selectBrand[0].LS_Number+" onclick='storeLocation(this)'>"+lanType4+"</div></li></ul>";
        $('.brandDetail').append(html);
        // debugger;
        
    }

    //대분류 카테고리 클릭
    let catChk = 0;
    function LV1Cat(e){
        //선택된 카테고리 아이디
        let lv1CatId = e.id;
        //상단 선택된 카테고리 명
        if(catChk == 0){
            let chooseCatName = $("#"+lv1CatId).val();
            $('#chooseCategory').text(chooseCatName);
        }
        
        //업종 광고 변경
        AD.showCategoryAD(e.dataset.lv1cat);
        //카테고리, 브랜드 리스트 초기화
        $('.searchResult').empty();
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
        let lv2Cateogry = e.id;
        //중분류 브랜드 리스트
        if($('.searchCheck').attr('checked',false)){
            $('.searchCategory').removeClass('selected');
            LV2BrandList($('#'+lv2Cateogry).data('lv2cat'));
        }
        if($(e).attr('checked',true)){
            $('#'+lv2Cateogry).addClass('selected');
        }   
    }

    //카테고리변경 버튼 생성
    function createCatBtn(){
        $('.categoryChange').css('display','block');
        $('.searchInfo').css('display','none');
        $('.searchRightDetail').css('display','none');
        $('.search_right').css('display','none');
        $('.searchRightAd').css('display','block');
    }

    //카테고리 변경하기 클릭
    function changeCategory(){
        signageSearch();
        catChk = 0;
    }

    //카테고리 이전 버튼
    function searchPrev(){
        if($('#searchPage').text()==2){
            $('#searchPage').text('1');
            $('.searchList').css('display','block');
            $('.searchList2').css('display','none');
            $('#searchPrev').removeClass('searchPrevClick');
            $('#searchNext').addClass('searchNextClick');
            $('#searchNext img').attr('src','/img/signage/right_arrow_active_icon.png');
            $('#searchPrev img').attr('src','/img/signage/left_arrow_icon.png');
        }
    }
    //카테고리 다음 버튼
    function searchNext(){
        if($('#searchPage').text()==1){
            $('#searchPage').text('2');
            $('.searchList').css('display','none');
            $('.searchList2').css('display','block');
            $('#searchPrev').addClass('searchPrevClick');
            $('#searchNext').removeClass('searchNextClick');
            $('#searchNext img').attr('src','/img/signage/right_arrow_icon.png');
            $('#searchPrev img').attr('src','/img/signage/left_arrow_active_icon.png');
            
        }
    }

//검색창 플레이스홀더 내용 번역
    function searchModalLanguage(){
        $('.searchInfo').empty();
        let lanType1 = $('#kor').hasClass('choose') ? '이곳을 클릭하여 찾으시는 브랜드명을 검색하세요. (초성검색가능)' : 'Click here to search for the brand name you are looking for';
        let lanType2 = $('#kor').hasClass('choose') ? '위의<span style="color: #222222; font-weight: 500;"> 카테고리를 선택</span>하세요.' : 'Select a<span style="color: #222222; font-weight: 500;"> category </span>above.';
        let lanType3 = $('#kor').hasClass('choose') ? '카테고리 변경하기' : 'Change Category';
        let lanType4 = $('#kor').hasClass('choose') ? '닫기' : 'Close';
        let lanType5 = $('#kor').hasClass('choose') ? '검색' : 'Search';

        $('#searchBrandName').attr('placeholder',lanType1);
        let html = lanType2;
        $('.searchInfo').append(html);
        $('#chagneCategory').text(lanType3);
        $('.searchCloseName').text(lanType4);
        $('.searchTopName').text(lanType5);
    }



   
   
   //브랜드 위치보기
    function storeLocation(e){
        let storeArea = e.id.replace(/area/g,'')
        $('#myModal').css('display','none');
        $('.floorBtn div').removeClass('floorSelcet');
        $('.brandInfoCenter').css('display','none');
        $('.brandMenuCenter').css('display','none');
    //1층    
        if(storeArea >=1001 && storeArea <= 1230){
            $('#1Fstore path').css('fill','#E2E2E2');
            $('.centralSvg1F').css('display','block');
            $('.centralSvg2F').css('display','none');
            $('.centralSvg3F').css('display','none');
            $('#floor1Btn').addClass('floorSelcet');
            $('#nowFloor').text('1F');
            $('#1Fstore_name text').each(function(){
                let storeName = $(this);
                let storeNumber;
                //svg텍스트가 선택한 브랜드 명과 같으면
                if(storeName.text() == $('#h'+storeArea+'-2').text()){
                    //해당 아이디를 가져옴
                    storeNumber = $(this).attr('id').substring('1','5');
                    $('#h'+storeNumber).css('fill','#a91179');
                    storeNumber = $(this).attr('id').substring('1','5')
                }
            })
            //좌표이동
                //1사 분면
                if((storeArea >= 1001 && storeArea <= 1026) ||(storeArea >= 1133 && storeArea <= 1147) || (storeArea >= 1220 && storeArea <= 1226)){
                    $('.centralSvg1F').css('left','424px');
                    $('.centralSvg1F').css('top','250px');
                    storeMapSize(1,15,2.125);
                }
                //2사 분면
                else if((storeArea >= 1027 && storeArea <= 1056) ||(storeArea >= 1148 && storeArea <= 1171)){
                    $('.centralSvg1F').css('left','-319px');
                    $('.centralSvg1F').css('top','273px');
                    storeMapSize(1,15,2.125);
                }
                //3사 분면
                else if((storeArea >= 1057 && storeArea <= 1096) ||(storeArea >= 1172 && storeArea <= 1196) ||(storeArea >= 1227 && storeArea<= 1230)){
                    $('.centralSvg1F').css('left','-378px');
                    $('.centralSvg1F').css('top','-435px');
                    storeMapSize(1,15,2.125);
                }
                //4사 분면
                else if((storeArea >= 1097 && storeArea <= 1132) ||(storeArea >= 1199 && storeArea <= 1219)){
                    $('.centralSvg1F').css('left','445px');
                    $('.centralSvg1F').css('top','-297px');
                    storeMapSize(1,15,2.125);
                }

            }

        //2층
            else if(storeArea>= 2001 && storeArea<= 2102){
                // console.log('2층')
                $('#2Fstore path').css('fill','#E2E2E2');
                $('.centralSvg1F').css('display','none');
                $('.centralSvg2F').css('display','block');
                $('.centralSvg3F').css('display','none');
                $('#floor2Btn').addClass('floorSelcet');
                $('#nowFloor').text('2F');
                $('#2Fstore_name text').each(function(){
                    let storeName = $(this);
                    let storeNumber;
                    //svg텍스트가 선택한 브랜드 명과 같으면
                    if(storeName.text() == $('#h'+e.id+'-2').text()){
                        //해당 아이디를 가져옴
                        storeNumber = $(this).attr('id').substring('1','5');
                        $('#h'+storeNumber).css('fill','#a91179');
                    }
                })
                //좌표이동
                //1사 분면
                if((storeArea >= 2001 && storeArea <= 2010) ||(storeArea >= 2064 && storeArea <= 2067) || (storeArea == 2060 || storeArea == 2101)){
                    $('.centralSvg2F').css('left','424px');
                    $('.centralSvg2F').css('top','250px');
                    storeMapSize(2,15,2.125);
                }
                //2사 분면
                else if((storeArea >= 2011 && storeArea <= 2027) ||(storeArea >= 2068 && storeArea <= 2077) || storeArea == 2061){
                    $('.centralSvg2F').css('left','-319px');
                    $('.centralSvg2F').css('top','273px');
                    storeMapSize(2,15,2.125);
                }
                //3사 분면
                else if((storeArea >= 2028 && storeArea <= 2044) ||(storeArea >= 2078 && storeArea <= 2090) ||(storeArea == 2062)){
                    $('.centralSvg2F').css('left','-378px');
                    $('.centralSvg2F').css('top','-435px');
                    storeMapSize(2,15,2.125);
                }
                //4사 분면
                else if((storeArea >= 2045 && storeArea <= 2059) ||(storeArea >= 2091 && storeArea <= 2100) || storeArea == 2063){
                    $('.centralSvg2F').css('left','445px');
                    $('.centralSvg2F').css('top','-297px');
                    storeMapSize(2,15,2.125);
                }
            }
        //3층
            else if(storeArea >= 3001 && storeArea <= 3106){
                // console.log('3층')
                $('#3Fstore path').css('fill','#E2E2E2');
                $('.centralSvg1F').css('display','none');
                $('.centralSvg2F').css('display','none');
                $('.centralSvg3F').css('display','block');
                $('#floor3Btn').addClass('floorSelcet');
                $('#nowFloor').text('3F');
                $('#3Fstore_name text').each(function(){
                let storeName = $(this);
                let storeNumber;
                //svg텍스트가 선택한 브랜드 명과 같으면
                if(storeName.text() == $('#h'+storeArea+'-2').text()){
                    //해당 아이디를 가져옴
                    storeNumber = $(this).attr('id').substring('1','5');
                    $('#h'+storeNumber).css('fill','#a91179');
                }
                //좌표이동
                //1사 분면
                if((storeArea >= 3001 && storeArea <= 3010) ||(storeArea >= 3060 && storeArea <= 3061) ||(storeArea >= 3068 && storeArea <= 3071) || (storeArea == 3106)){
                    $('.centralSvg3F').css('left','424px');
                    $('.centralSvg3F').css('top','250px');
                    storeMapSize(3,15,2.125);
                }
                //2사 분면
                else if((storeArea >= 3011 && storeArea <= 3027) ||(storeArea >= 3062 && storeArea <= 3063) ||(storeArea >= 3072 && storeArea <= 3081)){
                    $('.centralSvg3F').css('left','-319px');
                    $('.centralSvg3F').css('top','273px');
                    storeMapSize(3,15,2.125);
                }
                //3사 분면
                else if((storeArea >= 3028 && storeArea <= 3044) ||(storeArea >= 3064 && storeArea <= 3065) ||(storeArea >= 3082 && storeArea <= 3095)){
                    $('.centralSvg3F').css('left','-378px');
                    $('.centralSvg3F').css('top','-435px');
                    storeMapSize(3,15,2.125);
                }
                //4사 분면
                else if((storeArea >= 3045 && storeArea <= 3059) ||(storeArea >= 3066 && storeArea <= 3067) ||(storeArea >= 3096 && storeArea <= 3105)){
                    $('.centralSvg3F').css('left','445px');
                    $('.centralSvg3F').css('top','-297px');
                    storeMapSize(3,15,2.125);
                }
            })
        }
    }

//브랜드 상세보기
    function storeInfo(e){
        if($(e).text() === '상세 보기' || ($(e).text() === 'Detail')){
            $('#kor').hasClass('choose') ? $(e).text('상세보기 닫기') : $(e).text('Close');
            //상세정보 정보 버튼에 아이디 추가
            $('.brandInfoBtn div').attr('id',e.id);
            $('.brandMenuBtn div').attr('id',e.id);
            $('.brandEventBtn div').attr('id',e.id);
            $(e).addClass('detail_click');
            $('.searchLeft').css('display','none');
            $('.brandInfoLeft').css('display','block');
            $('.searchCenter').css('display','none');
            brandNavInfo();
        }else if($(e).text() === '상세보기 닫기' || $(e).text() === 'Close'){
            $('#kor').hasClass('choose') ? $(e).text('상세 보기') : $(e).text('Detail');
            $(e).removeClass('detail_click');
            $('.searchLeft').css('display','block');
            $('.brandInfoLeft').css('display','none');
            $('.searchCenter').css('display','block');
            $('.brandInfoCenter').css('display','none');
            $('.brandMenuCenter').css('display','none');
        }
    }

//브랜드 정보
    function brandNavInfo(){
        $('.brandInfoText').removeClass('selected');
        $('.brandInfoBtn div').addClass('selected');
        $('.brandInfoCenter').css('display','block');
        $('.brandMenuCenter').css('display','none');
        let brandID = $('.brandInfoBtn div').attr('id');
        brandInfoList(brandID.replace(/bs/g,''));
    }

//브랜드 메뉴
    function brandNavMenu(e){
        $('.brandInfoText').removeClass('selected');
        $(e).addClass('selected');
        $('.brandInfoCenter').css('display','none');
        $('.brandMenuCenter').css('display','block');
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
        let lanType1 = $('#kor').hasClass('choose') ? "<dd style='color: #999;'>"+brandInfoList[0].BS_PersonalDayKor+' 휴무'+"</dd></dl>" : "<dd style='color: #999;'>"+'Closed for the '+brandInfoList[0].BS_PersonalDayEng+"</dd></dl>";
        let lanType2 = $('#kor').hasClass('choose') ? brandInfoList[0].BS_Addr1Kor : brandInfoList[0].BS_Addr1Eng;
        let lanType3 = $('#kor').hasClass('choose') ? brandInfoList[0].BS_Addr2Kor : brandInfoList[0].BS_Addr2Eng;
        let lanType4 = $('#kor').hasClass('choose') ? brandInfoList[0].BS_NameKor : brandInfoList[0].BS_NameEng;

        let lanName1 = $('#kor').hasClass('choose') ? "<h3>상세정보 <span>단체석 예약, 포장 가능</span></h3>" : "<h3>Information <span>Group seat reservation and packing available</span></h3>";
        let lanName2 = $('#kor').hasClass('choose') ? "<dl><dt><i class='far fa-clock'></i> 영업시간</dt>" : "<dl><dt><i class='far fa-clock'></i> OpenTime</dt>";
        let lanName3 = $('#kor').hasClass('choose') ? "<dl><dt><i class='fas fa-mobile-alt'></i> 전화번호</dt>" : "<dl><dt><i class='fas fa-mobile-alt'></i> Phone</dt>";
        let lanName4 = $('#kor').hasClass('choose') ? "<dl><dt><i class='fas fa-map-marker-alt'></i> 주소</dt>" : "<dl><dt><i class='fas fa-map-marker-alt'></i> Address</dt>";
        let lanName5 = $('#kor').hasClass('choose') ? $('#infoStoreNumber').append(brandInfoList[0].LS_Number + ' 호') : $('#infoStoreNumber').append('Room No. '+brandInfoList[0].LS_Number)
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
        $('.brandInfoDetail_txt').append(html);
        $('#infoStoreName').append(lanType4);
    }

    //브랜드 메뉴 정보
    function brandMenuList(bsID){
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
    //M_MC_ID가 같은것 끼리 묶어주기
        eventOne = resultEvent.filter(data => data.M_MC_ID == 1);
        eventTwo = resultEvent.filter(data => data.M_MC_ID == 2);
        eventThree = resultEvent.filter(data => data.M_MC_ID == 3);
  
        $('#envetMenuOne').empty();
        $('#envetMenuTwo').empty();
        $('#normalList').empty();

        for(let i=0; i<eventOne.length; i++){
            let languageType1 = $('#kor').hasClass('choose') ? eventOne[i].M_NameKor : eventOne[i].M_NameEng;
            let languageName1 = $('#kor').hasClass('choose') ? eventOne[0].MC_NameKor : eventOne[0].MC_NameEng;
            let html = '<li><div class="menu_best_pic"><img src='+eventOne[i].M_ImageUrl+'></div>';
                html += '<div class="menu_best_name">'+languageType1+'</div>';
                html += '<div class="menu_best_price">'+eventOne[i].M_Price+'</div></li>';
            $('#envetMenuOne').append(html);
            $('#envetMenuOneName').text(languageName1);
        
        }
 
        
        for(let i=0; i<eventTwo.length; i++){
            let languageType2 = $('#kor').hasClass('choose') ? eventTwo[i].M_NameKor : eventTwo[i].M_NameEng;
            let languageName2 = $('#kor').hasClass('choose') ? eventTwo[0].MC_NameKor : eventTwo[0].MC_NameEng;
            let html = '<li><div class="menu_best_pic"><img src='+eventTwo[i].M_ImageUrl+'></div>';
                html += '<div class="menu_best_name">'+languageType2+'</div>';
                html += '<div class="menu_best_price">'+eventTwo[i].M_Price+'</div></li>';
            $('#envetMenuTwo').append(html);
            $('#envetMenuTwoName').text(languageName2);
        }
        for(let i=0; i<resultNormal.length; i++){
            let languageType3 = $('#kor').hasClass('choose') ? resultNormal[i].M_NameKor : resultNormal[i].M_NameEng;
            let html = '<li><dl>';
                html += '<dt>'+languageType3+'</dt>';
                html += '<dd><h6>'+resultNormal[i].M_Price+'</h6></dd></dl></li>';
            $('#normalList').append(html);
        }
    }