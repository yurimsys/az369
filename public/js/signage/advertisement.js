/**
 * 
 * AD Slide 관리 Class
 * 
 */
class AdSlide{
    static ad_main_instance = $('.ad.main_full');
    constructor () {
        this.default_slide_duration_sec = 5;
        this.ad_init_min = 1;   // 미동작시 전면광고 보여주는 타임(min)
        this.data = '';
        this.slide_template = `
            <div class="adSlides fade">
                <img src="" style="width:100%">
            </div>
        `
        this.Slide_Event_List = [];
        
    }
    static showSlides(time = this.default_slide_duration_sec, type) { // Slide 기본값 5
        let slide_index = 0;
        function showSlides(){
            let i;
            let flag_display = false, flag_non_ad = false;
            let current_slide_index = 0;
            let slides = document.querySelectorAll(`.${type} .adSlides`);
            
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
            } while ( !(flag_display || flag_non_ad)  );
        }
        showSlides();
        return setInterval(showSlides, time * 1000);
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
        for( let type in this.data ){
            $(`.ad.${type}`).html('');
            let $template = $(this.slide_template);
            this.data[type].contents.forEach((data)=>{
                
                $template.attr('data-display_s', data.display_s.replace('T',' ').replace('Z',''));
                $template.attr('data-display_f', data.display_f.replace('T',' ').replace('Z',''));
                $template.children().attr('src', data.url);
                if( type.includes('category') ){

                    // 업종 분류 하여 광고판 추가
                    $(`.ad.${type}`).append($template.clone());
                } else {
                    $(`.ad.${type}`).append($template.clone());
                }
            });
        }
    }
    execute () {
        if( this.Slide_Event_List.length > 0){
            // Slide Event 제거.
            while( this.Slide_Event_List.length > 0 ){                
                clearTimeout( this.Slide_Event_List.pop() );
            }
        }
        for( let type in this.data ){
            this.Slide_Event_List.push( AdSlide.showSlides( AD.data[type].slide_sec , type ) );
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
// setInterval(() => {
//     AD.dataReload();
// }, 7 * 1000);

var usedTimeout = '';
$(document).ready(() => {
    $("body").click(()=>{
        AdSlide.ad_main_instance.removeClass('active');
        clearTimeout(usedTimeout);
        usedTimeout=setTimeout( AD.showMainAD, AD.ad_init_min * 1000 * 1000 );
        // console.log('usedTimeout : ',  usedTimeout);
    });

});
