/**
 * 
 * AD Slide 관리 Class
 * 
 */
class AdSlide{
    static ad_main_instance = $('.ad.main_full');
    constructor () {
        this.default = {
            slide_duration_sec : 5,
            category_ad_id : 1
        };

        this.ad_init_min = 1;   // 미동작시 전면광고 보여주는 타임(min)
        this.data = '';
        this.slide_template = `
            <div class="adSlides fade">
                <img src="" style="width:100%" />
            </div>
        `
        this.Slide_Event_List = [];
        
    }
    // parent_class_name  :  body tag 의 class name을 입력.
    static showSlides(type, time = this.default.slide_duration_sec, category_id, parent_class_name = 'full' ) {
        
        let slide_index = 0;
        
        function createSlidess(){
            let i;
            let flag_display = false, flag_non_ad = false;
            let current_slide_index = 0;
            // let slides = $(slide_element).find('.adSlides');
            let slides = null;
            
            if( category_id !== undefined ){
                slides = $(`.${parent_class_name} .ad.${type} .category_container[data-category_id=${category_id}] .adSlides`);
            } else {
                slides = document.querySelectorAll(`.${parent_class_name} .ad.${type} .adSlides`);
            }
            
            // console.log(type, parent_class_name, category_id,slides);
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            slide_index++;
            if (slide_index > slides.length) { slide_index = 1 }
            
            do {
                // slides 노출시 유효시간 체크
                let display_finish_time = new Date( slides[slide_index-1].dataset.display_f );
                let now = new Date();
                if(display_finish_time >= now){
                    slides[slide_index-1].style.display = "block";
                    flag_display = true;
                    current_slide_index = slide_index;
                } else {
                    slide_index++;
                    if (slide_index > slides.length) { slide_index = 1 }
                    if (slide_index == current_slide_index) { flag_non_ad = true } 
                }
            } while ( !(flag_display || flag_non_ad) );
        }
        
        // if( category_id !== undefined ){
        //     slide_container = $(`.ad.${type} .category_container[data-category_id=${category_id}]`);
        // } else {
        //     slide_container = $(`.ad.${type}`);
        // }

        // slide_container.each( (i, ele) => {
        //     createSlidess(ele);
        // })
        createSlidess();

        // return setInterval(createSlidess(ele), time * 1000);
        return setInterval(createSlidess, time * 1000);
    }
    dataLoad(){
        $.ajax({
            url: '/api/ad?type=display',
            method: 'get',
            dataType: 'json',
            success: function(res){
                sessionStorage.setItem('ad_data', JSON.stringify(res));
                AD.data = res;
            }
        });
    }
    dataReload() {
        $.ajax({
            url: '/api/ad?type=display',
            method: 'get',
            dataType: 'json',
            success: function(res){
                sessionStorage.setItem('ad_data', JSON.stringify(res));
                sessionStorage.setItem('ad_default', JSON.stringify(res.data2))
                AD.data = res.data;
                AD.render();
                AD.execute();
            }
        });

        return this.data;
    }
    showMainAD() {
        if( !AdSlide.ad_main_instance.hasClass('active') ) AdSlide.ad_main_instance.addClass('active');
    }
    render () {
        // console.log(this.data);
        for( let type in this.data ){
            
            $(`.ad.${type}`).html('');
            let $container = $('<div class="category_container">');
            let $template = $(this.slide_template);

            if( type.includes('category') ){
                let container_store = {};
                this.data[type].contents.forEach((data)=>{
                    if( container_store[ data.category_id ] === undefined ){
                        container_store[ data.category_id ] = $container.clone();
                        container_store[ data.category_id ].attr('data-category_id', data.category_id);
                    }

                    $template.attr('data-display_s', data.display_s.replace('T',' ').replace('Z',''));
                    $template.attr('data-display_f', data.display_f.replace('T',' ').replace('Z',''));
                    $template.children().attr('src', data.url);
                    container_store[ data.category_id ].append($template.clone());
                });
                
                for( let key in container_store){
                    $(`.ad.${type}`).append( container_store[ key ] );
                }



            } else {
                this.data[type].contents.forEach((data)=>{
                    //메인 광고
                    $template.attr('data-display_s', data.display_s.replace('T',' ').replace('Z',''));
                    $template.attr('data-display_f', data.display_f.replace('T',' ').replace('Z',''));
                    $template.children().attr('src', data.url);
                    $(`.ad.${type}`).append($template.clone());
                });

                    
            }
        }
    }
    showCategoryAD(lv1_category_id) {
        let ad_default = JSON.parse(sessionStorage.getItem('ad_default'))
        console.log(ad_default);
        // console.log(ad_default);
        $(`.category_container`).hide();
        //불러오는 광고 데이터 카테고리 id 11이상으로 디폴트 이미지?
        $(`.category_top .category_container`).each(function(){
            if($(`.category_top .category_container[data-category_id=${lv1_category_id}]`).children('div').length == 0){
                ad_default.forEach((ad)=>{
                    if( ad.ADY_CD === "category_top"){
                        let html = '<div class="category_container" data-category_id='+lv1_category_id+'><div class="adSlides fade" data-display_s="2020-03-27 03:00:00.000" data-display_f="2020-05-27 03:00:00.000">';
                            html += '<img src='+ad.AD_ContentURL+' style="width:100%"></div></div>'
                        $('.category_top').append(html)   
                    }
                })
            }else{
                $(`.category_top .category_container[data-category_id=${lv1_category_id}]`).show();
            }
        })

        $(`.category_mid .category_container`).each(function(){
            if($(`.category_mid .category_container[data-category_id=${lv1_category_id}]`).children('div').length == 0){
                ad_default.forEach((ad)=>{
                    if( ad.ADY_CD === "category_mid"){
                        let html = '<div class="category_container" data-category_id='+lv1_category_id+'><div class="adSlides fade" data-display_s="2020-03-27 03:00:00.000" data-display_f="2020-05-27 03:00:00.000">';
                            html += '<img src='+ad.AD_ContentURL+' style="width:100%"></div></div>'
                        $('.category_mid').append(html)   
                    }
                })
            }else{
                $(`.category_mid .category_container[data-category_id=${lv1_category_id}]`).show();
            }
        })
        
        $(`.category_bottom .category_container`).each(function(){
            if($(`.category_bottom .category_container[data-category_id=${lv1_category_id}]`).children('div').length == 0){
                ad_default.forEach((ad)=>{
                    if( ad.ADY_CD === "category_bottom"){
                        let html = '<div class="category_container" data-category_id='+lv1_category_id+'><div class="adSlides fade" data-display_s="2020-03-27 03:00:00.000" data-display_f="2020-05-27 03:00:00.000">';
                            html += '<img src='+ad.AD_ContentURL+' style="width:100%"></div></div>'
                        $('.category_bottom').append(html)   
                    }
                })
            }else{
                $(`.category_bottom .category_container[data-category_id=${lv1_category_id}]`).show();
            }
        })
    }
    execute () {
        if( this.Slide_Event_List.length > 0){
            // Slide Event 제거.
            while( this.Slide_Event_List.length > 0 ){
                clearTimeout( this.Slide_Event_List.pop() );
            }
        }
        for( let type in this.data ){
            if( type.includes('category') ){
                let category_id_list = AD.data[type].contents.map( content => content.category_id );
                category_id_list = category_id_list.filter((item, index) => category_id_list.indexOf(item) === index);
                
                category_id_list.forEach( category_id => {
                    
                    // category_bottom 의 경우 나눠서 실행
                    if( type === "category_bottom" ){
                        this.Slide_Event_List.push( AdSlide.showSlides( type, AD.data[type].slide_sec, category_id, 'searchRightAd' ) );
                        this.Slide_Event_List.push( AdSlide.showSlides( type, AD.data[type].slide_sec, category_id, 'searchRightDetail' ) );
                    } else {
                        this.Slide_Event_List.push( AdSlide.showSlides( type, AD.data[type].slide_sec, category_id ) );
                        
                    }
                });
            } else {
                this.Slide_Event_List.push( AdSlide.showSlides( type, AD.data[type].slide_sec ) );
            }
        }
    }
    init () {
        this.dataReload();
        this.showMainAD();
    }
}

var AD = new AdSlide();
AD.init();

/**
 *  Data 체크 시간 고민해볼것.
 * */

$(document).ready(() => {
    let usedTimeout = null;
    $("body").click(()=>{
        AdSlide.ad_main_instance.removeClass('active');
        clearTimeout(usedTimeout);
        usedTimeout=setTimeout( signageInit, AD.ad_init_min * 60 * 10000 );
    });

});

function signageInit() {
    AD.showMainAD();
    signageMain();
    searchModalInit();
}