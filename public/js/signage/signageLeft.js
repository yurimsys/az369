//*** 메인 좌측 카테고리 선택 스크립트 ***

// catPas
    let count = 0;
    function selectCat(e){
        let catId = e.id;
        if(count == 0){
            $('.svgCat').css('fill','#e2e2e2');   
            count = 1;
            console.log('초기화')
        }
             
        console.log('1번')
        
        if($('#'+catId).hasClass('selected') == false ){
            $(e).addClass('selected')
            $('.'+catId).css('fill','')
            console.log('2번')
            // $('.'+catId).removeClass(catId)
            // $('.'+catId).attr('class',catId)
        }
        else if($('#'+catId).hasClass('selected') == true ){
            $(e).removeClass('selected')
            $('.'+catId).css('fill','#e2e2e2')
            console.log('3번')
            if($('.categoryList div').hasClass('selected') == false && $('.categoryList2 div').hasClass('selected') == false){
                console.log('4번')
                $('.svgCat').css('fill',''); 
                count = 0;
                return;
            }
        }

    }

    //카테고리 클릭
    // $('.categoryList div').on('click',function(e){
    //     console.log(e.target.id)
    //     let categoryId = e.currentTarget.id
        
    //     if(this.className.substring(25,40) != 'selected'){
    //         $('#'+categoryId).addClass('selected')
    //         $('.catPas').css('fill','white')
            
    //     }else if(this.className.substring(25,40) == 'selected'){
    //         $('#'+categoryId).removeClass('selected')
    //         $('.catPas').css('fill','#d0a3db')
            
    //     }
    // })
    // $('.categoryList2 div').on('click',function(e){
    //     let categoryId = e.currentTarget.id
    //     if(this.className.substring(25,40) != 'selected'){
    //         $('#'+categoryId).addClass('selected')
    //     }else if(this.className.substring(25,40) == 'selected'){
    //         $('#'+categoryId).removeClass('selected')
    //     }
    // })
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