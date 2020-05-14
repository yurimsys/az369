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
        $('.searchLeft').css('display','block');
        $('.brandInfoLeft').css('display','none')
        $('.searchCenter').css('display','block');
        $('.brandInfoCenter').css('display','none')
        $('.searchNav').css('display','block')
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
        //모달내용 번역
        searchModalLanguage();
    }    

    
    //전체 브랜드 리스트 생성
    function searchBrandList(){
        //리스트 초기화
        $('.searchResult').empty()
        //let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
        let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'))
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
                let jsonObject = searchCatLV2[i]
                resultCatLV2.push(jsonObject)
            }
        }
        for(let j=0; j<resultCatLV2.length; j++){
            if($('#kor').hasClass('choose')){
                if(j < 9){
                    let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                        html += "<div class='searchCategory searchCategoryFont categoryBack' onclick='LV2Cat(this)' id='lv2Cateogry"+j+"' data-lv2cat ="+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</div></label></li>"
                    $('.searchList').append(html);
                    $('.searchNav').css('display','none')
                }
                if( j > 8){
                    let html = "<li><label><input type='checkbox' name='searchCategoryList' class='searchCheck'>";
                        html += "<div class='searchCategory searchCategoryFont categoryBack' onclick='LV2Cat(this)' id='lv2Cateogry"+j+"' data-lv2cat ="+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</div></label></li>"
                    $('.searchList2').append(html);
                    $('.searchNav').css('display','block')
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
   
   
   //브랜드 리스트 클릭시
    function brandClick(e){
        $('.brandDetail').empty();
        $('.searchResult div').css('background-color','')
        $('#'+e.id).css('background-color','#f9eff6');
        $('.searchRight').css('display','none')
        $('.searchRightAd').css('display','none');
        // $('.searchRightAd').css('display','block');
        $('.searchRightDetail').css('display','block')
            // $('.brandDetail').css('display','block')

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
                        html += "<li><div class='infoImgNav' id="+selectBrand[0].LS_Number+" onclick='storeInfo(this)'>Detail</div></li>"
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

    //카테고리 이전 버튼
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
    //카테고리 다음 버튼
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

   //검색창 플레이스홀더 내용 번역
   function searchModalLanguage(){
        $('.searchInfo').empty();
        if($('#eng').hasClass('choose')){
            $('#searchBrandName').attr('placeholder','Click here to search for the brand name you are looking for')
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
   
   
   //브랜드 위치보기
    function storeLocation(e){
        $('#myModal').css('display','none')
        $('.floorBtn div').removeClass('floorSelcet')
        $('.brandInfoCenter').css('display','none')
        $('.brandMenuCenter').css('display','none')
    //1층    
        if(e.id >1000 && e.id < 1231){
            $('#1Fstore path').css('fill','#E2E2E2')
            $('.centralSvg1F').css('display','block');
            $('.centralSvg2F').css('display','none');
            $('.centralSvg3F').css('display','none');
            $('#floor1Btn').addClass('floorSelcet')
            $('#nowFloor').text('1F')
            $('#1Fstore_name text').each(function(){
                let storeName = $(this)
                let storeNumber;
                //svg텍스트가 선택한 브랜드 명과 같으면
                if(storeName.text() == $('#h'+e.id+'-2').text()){
                    //해당 아이디를 가져옴
                    storeNumber = $(this).attr('id').substring('1','5')
                    $('#h'+storeNumber).css('fill','#a91179')
                }
            })
            //좌표이동
                //1사 분면
                if((e.id > 1000 && e.id < 1027) ||(e.id > 1132 && e.id < 1147) || (e.id > 1219 && e.id < 1227)){
                    $('.centralSvg1F').css('left','424px')
                    $('.centralSvg1F').css('top','250px')
                    storeMapSize(1,15,2.125)
                }
                //2사 분면
                else if((e.id > 1026 && e.id < 1057) ||(e.id > 1147 && e.id < 1172)){
                    $('.centralSvg1F').css('left','-319px')
                    $('.centralSvg1F').css('top','273px')
                    storeMapSize(1,15,2.125)
                }
                //3사 분면
                else if((e.id > 1056 && e.id < 1097) ||(e.id > 1171 && e.id < 1197) ||(e.id > 1226 && e.id < 1231)){
                    $('.centralSvg1F').css('left','-378px')
                    $('.centralSvg1F').css('top','-435px')
                    storeMapSize(1,15,2.125)
                    return false;
                }
                //4사 분면
                else if((e.id > 1096 && e.id < 1133) ||(e.id > 1198 && e.id < 1220)){
                    $('.centralSvg1F').css('left','445px')
                    $('.centralSvg1F').css('top','-297px')
                    storeMapSize(1,15,2.125)
                    return false;
                }

            }

        //2층
            else if(e.id > 2000 && e.id < 2103){
                // console.log('2층')
                $('#2Fstore path').css('fill','#E2E2E2')
                $('.centralSvg1F').css('display','none');
                $('.centralSvg2F').css('display','block');
                $('.centralSvg3F').css('display','none');
                $('#floor2Btn').addClass('floorSelcet')
                $('#nowFloor').text('2F')
                $('#2Fstore_name text').each(function(){
                    let storeName = $(this)
                    let storeNumber;
                    //svg텍스트가 선택한 브랜드 명과 같으면
                    if(storeName.text() == $('#h'+e.id+'-2').text()){
                        //해당 아이디를 가져옴
                        storeNumber = $(this).attr('id').substring('1','5')
                        $('#h'+storeNumber).css('fill','#a91179')
                    }
                })
                //좌표이동
                //1사 분면
                if((e.id > 2000 && e.id < 2011) ||(e.id > 2063 && e.id < 2068) || (e.id == 2060 || e.id == 2101)){
                    $('.centralSvg2F').css('left','424px')
                    $('.centralSvg2F').css('top','250px')
                    storeMapSize(1,15,2.125)
                    return false;
                }
                //2사 분면
                else if((e.id > 2010 && e.id < 2028) ||(e.id > 2067 && e.id < 2078) || e.id == 2061){
                    $('.centralSvg2F').css('left','-319px')
                    $('.centralSvg2F').css('top','273px')
                    storeMapSize(1,15,2.125)
                    return false;
                }
                //3사 분면
                else if((e.id > 2027 && e.id < 2045) ||(e.id > 2077 && e.id < 2091) ||(e.id == 2062)){
                    $('.centralSvg2F').css('left','-378px')
                    $('.centralSvg2F').css('top','-435px')
                    storeMapSize(1,15,2.125)
                    return false;
                }
                //4사 분면
                else if((e.id > 2044 && e.id < 2060) ||(e.id > 2090 && e.id < 2101) || e.id == 2063){
                    $('.centralSvg2F').css('left','445px')
                    $('.centralSvg2F').css('top','-297px')
                    storeMapSize(1,15,2.125)
                    return false;
                }
            }
            else if(e.id>3000 && e.id < 3107){
                // console.log('3층')
                $('#3Fstore path').css('fill','#E2E2E2')
                $('.centralSvg1F').css('display','none');
                $('.centralSvg2F').css('display','none');
                $('.centralSvg3F').css('display','block');
                $('#floor3Btn').addClass('floorSelcet')
                $('#nowFloor').text('3F')
                $('#3Fstore_name text').each(function(){
                let storeName = $(this)
                let storeNumber;
                //svg텍스트가 선택한 브랜드 명과 같으면
                if(storeName.text() == $('#h'+e.id+'-2').text()){
                    //해당 아이디를 가져옴
                    storeNumber = $(this).attr('id').substring('1','5')
                    $('#h'+storeNumber).css('fill','#a91179')
                }
                //좌표이동
                //1사 분면
                if((e.id > 3000 && e.id < 3011) ||(e.id > 3059 && e.id < 3062) ||(e.id > 3067 && e.id < 3072) || (e.id == 3106)){
                    $('.centralSvg3F').css('left','424px')
                    $('.centralSvg3F').css('top','250px')
                    storeMapSize(1,15,2.125)
                    return false;
                }
                //2사 분면
                else if((e.id > 3010 && e.id < 3028) ||(e.id > 3059 && e.id < 3062) ||(e.id > 3071 && e.id < 3082)){
                    $('.centralSvg3F').css('left','-319px')
                    $('.centralSvg3F').css('top','273px')
                    storeMapSize(1,15,2.125)
                    return false;
                }
                //3사 분면
                else if((e.id > 3027 && e.id < 3045) ||(e.id > 3063 && e.id < 3066) ||(e.id > 3081 && e.id < 3095)){
                    $('.centralSvg3F').css('left','-378px')
                    $('.centralSvg3F').css('top','-435px')
                    storeMapSize(1,15,2.125)
                    return false;
                }
                //4사 분면
                else if((e.id > 3044 && e.id < 3060) ||(e.id > 3065 && e.id < 3068) ||(e.id > 3095 && e.id < 3106)){
                    $('.centralSvg3F').css('left','445px')
                    $('.centralSvg3F').css('top','-297px')
                    storeMapSize(1,15,2.125)
                    return false;
                }
            })
        }
    }

//브랜드 상세보기
    function storeInfo(e){
        if($(e).text() === '상세 보기' || ($(e).text() === 'Detail')){
            if($('#kor').hasClass('choose') == true){
                $(e).text('상세보기 닫기')
            }else{
                $(e).text('Close')
            }
            $(e).addClass('detail_click')
            $('.searchLeft').css('display','none');
            $('.brandInfoLeft').css('display','block')
            $('.searchCenter').css('display','none');
            brandNavInfo();
        }else if($(e).text() === '상세보기 닫기' || $(e).text() === 'Close'){
            if($('#kor').hasClass('choose') == true){
                $(e).text('상세 보기')
            }else{
                $(e).text('Detail')
            }
            $(e).removeClass('detail_click')
            $('.searchLeft').css('display','block');
            $('.brandInfoLeft').css('display','none')
            $('.searchCenter').css('display','block');
            $('.brandInfoCenter').css('display','none')
            $('.brandMenuCenter').css('display','none')
        }
    }

//브랜드 정보
    function brandNavInfo(){
        $('.brandInfoText').removeClass('selected')
        $('.brandInfoBtn div').addClass('selected')
        $('.brandInfoCenter').css('display','block')
        $('.brandMenuCenter').css('display','none')
    }

//브랜드 메뉴
    function brandNavMenu(e){
        $('.brandInfoText').removeClass('selected')
        $(e).children('div').addClass('selected')
        $('.brandInfoCenter').css('display','none')
        $('.brandMenuCenter').css('display','block')
    }