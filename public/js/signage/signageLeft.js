//*** 메인 좌측 카테고리 선택 스크립트 ***

    //카테고리 클릭
    $('.categoryList div').on('click',function(e){
        let categoryId = e.currentTarget.id
        if(this.className.substring(25,40) != 'selected'){
            $('#'+categoryId).addClass('selected')
        }else if(this.className.substring(25,40) == 'selected'){
            $('#'+categoryId).removeClass('selected')
        }
    })
    $('.categoryList2 div').on('click',function(e){
        let categoryId = e.currentTarget.id
        if(this.className.substring(25,40) != 'selected'){
            $('#'+categoryId).addClass('selected')
        }else if(this.className.substring(25,40) == 'selected'){
            $('#'+categoryId).removeClass('selected')
        }
    })
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