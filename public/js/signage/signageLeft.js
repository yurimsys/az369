//*** 메인 좌측 카테고리 선택 스크립트 ***

// catPas
//좌측 카테고리 불러오기
    $.ajax({
        url: '/api/category',
        method: 'get',
        dataType: 'json',
        success: function(res){
            //카테고리 저장
            localStorage.setItem('category',JSON.stringify(res.data))
            console.log(res.data)
            for(let i=0; i<res.data.length; i++){
                if(i <7){
                    let html = "<li>";
                        html += '<div class="categoryBtn categoryFont" id='+res.data[i].BC_NameEng+' onclick="selectCat(this)"><span id="categoryIcon'+i+'"></span><span class="categoryName">'+res.data[i].BC_NameKor+'</span></div>'
                        html += "</li>";
                    $('.categoryList').append(html);
                }
                if(i > 6){
                    let html2 = "<li>";
                        html2 += '<div class="categoryBtn categoryFont" id='+res.data[i].BC_NameEng+' onclick="selectCat(this)"><span id="categoryIcon'+i+'"></span><span class="categoryName">'+res.data[i].BC_NameKor+'</span></div>'
                        html2 += "</li>"
                    $('.categoryList2').append(html2)
                }
            }
        }
    })



    let count = 0;
    function selectCat(e){
        let catId = e.id;
        //클릭시 전체 색상 초기화
        if(count == 0){
            $('.svgCat').css('fill','#e2e2e2');   
            count = 1;
        }
        
        //클릭한 것만 색상표시
        if($('#'+catId).hasClass('selected') == false ){
            $(e).addClass('selected')
            $('.'+catId).css('fill','')
        }
        else if($('#'+catId).hasClass('selected') == true ){
            $(e).removeClass('selected')
            $('.'+catId).css('fill','#e2e2e2')
            if($('.categoryList div').hasClass('selected') == false && $('.categoryList2 div').hasClass('selected') == false){
                $('.svgCat').css('fill',''); 
                count = 0;
                return count;
            }
        }

    }

    //카테고리 이전 다음버튼
    $('#next').on('click',function(e){
        if($('#nowPage').text()==1){
            $('#nowPage').text('2')
            $('.categoryList').css('display','none')
            $('.categoryList2').css('display','block')
            $('#prev').addClass('clickPrevBtn')
            $('#next').removeClass('clickNextBtn')
        }
    })

    $('#prev').on('click',function(){
        if($('#nowPage').text()==2){
            $('#nowPage').text('1')
            $('.categoryList').css('display','block')
            $('.categoryList2').css('display','none')
            $('#next').addClass('clickNextBtn')
            $('#prev').removeClass('clickPrevBtn')
        }
    })
//*** 메인 좌측 카테고리 선택 스크립트 종료 ***