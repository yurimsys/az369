/**
 * 
 * AD Slide 관리 Class
 * 
 */
class AdSlide{
    static ad_main_instance = $('.ad.main_full');
    constructor () {
        this.ad_init_min = 1;   // 미동작시 전면광고 보여주는 타임(min)
        this.data = '';
        this.slide_template = `
            <div class="adSlides fade">
                <img src="" style="width:100%">
            </div>
        `
        this.Slide_Event_List = [];
        
    }
    static showSlides(time = 5, type) {
        let slideIndex = 0;
        function showSlides(){
            let i;
            let slides = document.querySelectorAll(`.${type} .adSlides`);
            
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            slideIndex++;
            if (slideIndex > slides.length) {slideIndex = 1}    
            
            slides[slideIndex-1].style.display = "block";
            
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
                $template.attr('data-disp_s', data.display_s);
                $template.attr('data-disp_f', data.display_f);
                $template.children().attr('src', data.url);
                
                $(`.ad.${type}`).append($template.clone());
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
        usedTimeout=setTimeout( AD.showMainAD, AD.ad_init_min * 60 * 1000 );
        console.log('usedTimeout : ',  usedTimeout);
    });
    
});
