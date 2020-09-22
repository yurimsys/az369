//평택, 동대문 탭
    let now_location;
    function openLocation(evt, locationName) {
        now_location = locationName;
        let car_info = JSON.parse(sessionStorage.getItem("dirver_car_list"));
        openBus(car_info[0].ctID, locationName);
        
        
        var i, tabcontent, tab_button;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tab_button = document.getElementsByClassName("tab_button");
        for (i = 0; i < tab_button.length; i++) {
            tab_button[i].className = tab_button[i].className.replace(" active", "");
        }
        document.getElementById(locationName).style.display = "block";
        evt.currentTarget.className += " active";
    }

    //데이터 로드 및 가져올 데이터 쿼리 타입 설정
    $(document).ready(function(){        
        // document.getElementById("defaultOpenPy").click();
        dataLoad();
    })

    function dataLoad(){
        $.ajax({
            url: "/api/driver_seat",
            method: "post",
            dataType: "json",
            success: function (res) {
                sessionStorage.setItem("dirver_car_list", JSON.stringify(res.data));
                sessionStorage.setItem('scan_list', JSON.stringify(res.scan_seat));
                if(res.data[0].CT_PyStart === 'Y' && res.data[0].CT_SeStart === 'N'){
                    document.getElementById("defaultOpenSe").click();
                    $('.start_p').css('display','none');
                    $('.check_p').css('display','none');
                    $('.start_cancel_p').css('display','block');
                }else if(res.data[0].CT_PyStart === 'Y' && res.data[0].CT_SeStart === 'Y'){
                    
                    document.getElementById("defaultOpenSe").click();
                    $('.start_p').css('display','none');
                    $('.check_p').css('display','none');
                    $('.start_cancel_p').css('display','block');
                    $('.start_s').css('display','none');
                    $('.check_s').css('display','none');
                    $('.start_cancel_s').css('display','block');
                }else{
                    document.getElementById("defaultOpenPy").click();
                }
            }
        });
        
    }

    var selected_seats = [];
    var selected_seats_cnt = 0;
    var seatPrice = 0;


    function openBus(busSeat,locationName) {
        // alert(busSeat+'%'+locationName);
        //스캔 한 값 표시
        let $seat;
        let car_info = JSON.parse(sessionStorage.getItem("dirver_car_list"));
        let $location_info = $('.location_info');
        let $bus_name = $('.bus_name');
        if(locationName == "pyeongtaek"){
            $location_info.text('평택 '+car_info[0].deptYM+' ('+getInputDayLabel(car_info[0].deptDay)+') '+car_info[0].startTime);
            $bus_name.text(car_info[0].b_name+'('+car_info[0].backNum+')');
            $seat = $('.seat-map-py');
            // $('.seat-map-se').empty();

        }else{
            $location_info.text('서울 동대문 '+car_info[0].retuYM+' ('+getInputDayLabel(car_info[0].retnDay)+') '+car_info[0].returnTime);
            $bus_name.text(car_info[0].b_name+'('+car_info[0].backNum+')');
            $seat = $('.seat-map-se');
            // $('.seat-map-py').empty();
        }
        
        var i, tablinks
        tablinks = document.getElementsByClassName("tablinks");
        //alert(seatPrice);
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        sessionStorage.setItem('ct_id', busSeat);

        // document.getElementById("bus_seat_layer").style.display = "block";
        // evt.currentTarget.className += " active";
        var firstSeatLabel = 1;

        //좌석금액 불러오기

        var sc = $seat.seatCharts({
                map: [
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'eeeee',
                ],
                seats: {
                    e: {

                        classes: '일반', //your custom CSS class
                        category: '일반'
                    }

                },
                naming: {
                    top: false,
                    getLabel: function (character, row, column) {
                        return firstSeatLabel++;
                    },
                },
                click: function () {
                    let bus_seat_number = this.settings.label;
                    let bus_ct_id = sessionStorage.getItem("ct_id");
                    let scan_checked;
                    if (this.status() == 'available') {
                        // alert('예매되지 않은 좌석입니다.')
                        // return 'selected';
                    } 
                    //스캔 된 좌석
                    else if (this.settings.$node.hasClass('selected')) {
                        scan_checked = 'selected'
                        userSeatInfo(bus_ct_id,bus_seat_number,scan_checked);
                        
                        return 'selected';
                    } 
                    //스캔 되지 않은 예매된 좌석
                    else if (this.status() == 'unavailable') {
                        // console.log('this',this);
                        scan_checked = 'unavailable'
                        userSeatInfo(bus_ct_id,bus_seat_number,scan_checked);
                        return 'unavailable';
                    } else {

                        return this.style();
                    }
                }
            });

        //현재 예약된 자석
        // scanSeatList();
        flushSeat(locationName);
    }

    function scanSeatList(){
        let scan_list = JSON.parse(sessionStorage.getItem("scan_list"));
        //평택 스캔 현황
        for(let i=0; i<scan_list.length; i++){
            if(scan_list[i].CR_ScanPy == 'Y'){
                let seat_scan = getSeatId(scan_list[i].CR_SeatNum);
                $('.seat-map-py #'+seat_scan).removeClass('unavailable');
                $('.seat-map-py #'+seat_scan).addClass('selected');
            }
        }
        //서울 스캔 현황
        for(let i=0; i<scan_list.length; i++){
            if(scan_list[i].CR_ScanSe == 'Y'){
                let seat_scan = getSeatId(scan_list[i].CR_SeatNum);
                $('.seat-map-se #'+seat_scan).removeClass('unavailable');
                $('.seat-map-se #'+seat_scan).addClass('selected');
            }
        }
    }


    //회원 정보 표시
    let $user_checked = $('#user_checked');
    function userSeatInfo(bus_id, seat_number, scan_checked){
        
        $.ajax({
            url: '/api/bus_user_info',
            method: 'get',
            dataType: 'json',
            data : { 
                ct_id : bus_id,
                cr_seatnum : seat_number        
            },
            success : function(res){
                $('#popup').css('display','block')
                $('#user_seat_number').text(res.data[0].CR_SeatNum);
                $('#user_name').text(res.data[0].U_NAME);
                $('#user_phone').text(res.data[0].U_PHONE);
                //클릭한 좌석이 확인된 여부
                if(scan_checked == 'selected'){
                    $user_checked.css('color','blue')
                    $user_checked.text('Y');
                }else{
                    $user_checked.css('color','red')
                    $user_checked.text('N');
                }
            }
        });
    }

        
    function flushSeat(locationName) {

        let $seat;
        if(locationName == "pyeongtaek"){
            $seat = $('.seat-map-py')
        }else{
            $seat = $('.seat-map-se')
        }

        var sc = $seat.seatCharts();
        selected_seats = [];
        selected_seats_cnt = 0;
        sc.find('e.selected').status('available');
        // 데이터 가져와서 예약된 좌석 상태 설정.
        var ct_id = sessionStorage.getItem('ct_id');
        $.ajax({
            dataType: "json",
            method: "GET",
            url: "/api/busSeat/" + ct_id
        }).done((res) => {
            let seat_id_list = [];
            res.data.map((seat_num) => {
                seat_id_list.push(getSeatId(seat_num));
            });
            // console.log('seat_id_list',seat_id_list);
            sc.find('unavailable').status('available');
            sc.status(seat_id_list, 'unavailable');
            scanSeatList();

        });
    }

    // 45인승 기준 seatId 가져오기
    function getSeatId(seat_num) {
        if (seat_num <= 45 && seat_num > 0) {

            let seat_id = "1_1";
            let row = '',
                column = '';

            if (seat_num > 40) {
                row = 11;
                column = seat_num % 10;
            } else {
                if ((seat_num % 4) === 0) {
                    row = Number.parseInt(seat_num / 4);
                    column = 4;
                } else {
                    row = (Number.parseInt(seat_num / 4)) + 1;
                    column = seat_num % 4;
                }

                if (column >= 3) column += 1;
            }
            if(now_location === 'pyeongtaek'){
                seat_id = row + "_" + column+'py';
                // seat_id = "seat"+ row;
                
            }else{
                seat_id = row + "_" + column+'se';
            }
            return seat_id;
        } else {
            return null;
        }

    }

    //새로고침
    function reload(e){
        sessionStorage.removeItem('scan_list');
        sessionStorage.removeItem('dirver_car_list');
        //새로고침 버튼 클릭시
        if(e.id === 'reloadPy'){
            dataLoad();
            flushSeat('pyeongtaek');
        }else if(e.id === 'reloadSe'){
            dataLoad();
            flushSeat('seoul');
        }
        //스캔확인 시
        if(e === 'pyeongtaek'){
            dataLoad();
            flushSeat('pyeongtaek');
        }else if(e === 'seoul'){
            dataLoad();
            flushSeat('seoul');
        }
    }



    // 승차 완료 버튼
    function busReady(e) {
        //승차 완료 클릭시 출발 버튼 활성화
        if(e.id === 'check_p'){
            $(e).toggleClass("checked"),
            $(".start_p").toggleClass("started");
        }else{
            if($('.start_cancel_p').css('display') == 'none'){
                swal({
                    title: '승차완료 오류',
                    text: '평택에서 먼저 출발을 클릭해 주세요.',
                    icon: 'error',
                    button: '확인'
                })
            }else{
                $(e).toggleClass("checked"),
                $(".start_s").toggleClass("started");
            }

        }
    }


    // 버스 출발 버튼
    function busStart(e) {
        //출발 클릭시 QR코드 비활성화 경고 및 재확인 팝업
        if(e.id === 'start_p'){
            if ($('#check_p').hasClass('checked') == false) {
                return false;
            } else {
                $('.start_p_modal').css('display', 'block')
            }
        }else{
            if ($('#check_s').hasClass('checked') == false) {
                return false;
            } else {
                if($('.start_cancel_p').css('display') == 'none'){
                    swal({
                        title: '출발 오류',
                        text: '평택에서 먼저 출발을 클릭해 주세요.',
                        icon: 'error',
                        button: '확인'
                    })
                }else{
                    $('.start_s_modal').css('display', 'block')
                }
            }
        }
    }

    // 출발 취소 버튼
    function busCancel(e) {
        let cancel_info = JSON.parse(sessionStorage.getItem("dirver_car_list"));
        //출발 취소 확인 모달 활성화
        if(e.id === 'start_cancel_p'){
            if($('.start_cancel_s').css('display') == 'block'){
                swal({
                    title: '취소 오류',
                    text: '서울이 현재 출발 중 입니다.',
                    icon: 'error',
                    button: '확인'
                }).then(function(){
                    return false;
                })
            }else{
                $('.start_cancel_p_modal').css('display', 'block')
                $.ajax({
                    url: '/api/bus_cancel',
                    method: 'put',
                    dataType: 'json',
                    data: { 'ct_id' : cancel_info[0].ctID, 'location' : 'py'},
                    success: function(res){
    
                    }
    
                });
            }

        }else{
            $('.start_cancel_s_modal').css('display', 'block')
            $.ajax({
                url: '/api/bus_cancel',
                method: 'put',
                dataType: 'json',
                data: { 'ct_id' : cancel_info[0].ctID, 'location' : 'se'},
                success: function(res){

                }

            });
        }
    }


    // 출발확인 모달 : 취소 ---------------------
    function startModalCancel(e) {
        if(e.id === 'startModalCancelPy'){
            $('.start_p_modal').css('display', 'none');
        }else{
            $('.start_s_modal').css('display', 'none');
        }
    }

    // 출발확인 모달 : 확인 ---------------------
    function startModalCheck(e) {
        let start_info = JSON.parse(sessionStorage.getItem("dirver_car_list"));
        if(e.id === 'startModalCheckPy'){
            $('.start_p_modal').css('display', 'none');
            $('#check_p').css('display', 'none');
            $('#start_p').css('display', 'none');
            $('#start_cancel_p').css('display', 'block');
            $.ajax({
                url: '/api/bus_start',
                method: 'put',
                dataType: 'json',
                data: { 'ct_id' : start_info[0].ctID, 'location' : 'py'},
                success: function(res){
                }

            });
        }else{
            $('.start_s_modal').css('display', 'none')
            $('#check_s').css('display', 'none');
            $('#start_s').css('display', 'none');
            $('#start_cancel_s').css('display', 'block');
            $.ajax({
                url: '/api/bus_start',
                method: 'put',
                dataType: 'json',
                data: { 'ct_id' : start_info[0].ctID, 'location' : 'se'},
                success: function(res){
                }

            });
        }
        
    }


    // 출발취소 모달 : 모달 닫기 -----
    function cancelModalClose(e) {
        if(e.id === 'cancelModalClosePy'){
            $('.start_cancel_p_modal').css('display', 'none')
        }else{
            $('.start_cancel_s_modal').css('display', 'none')
        }
    }
    // 출발취소 모달 : 취소 완료 ----
    function cancelModalCheck(e) {
        if(e.id === 'cancelModalCheckPy'){
            $('.start_cancel_p_modal').css('display', 'none')
            $('#check_p').css('display', 'block');
            $('#check_p').removeClass('checked');
            $('#start_p').css('display', 'block');
            $('#start_p').removeClass('started');
            $('#start_cancel_p').css('display', 'none');
        }else{
            $('.start_cancel_s_modal').css('display', 'none')
            $('#check_s').css('display', 'block');
            $('#check_s').removeClass('checked');
            $('#start_s').css('display', 'block');
            $('#start_s').removeClass('started');
            $('#start_cancel_s').css('display', 'none');
        }
    }



    //요일 계산 함수
    function getInputDayLabel(date) {
        var week = new Array('일', '월', '화', '수', '목', '금', '토');
        var todayLabel = week[date-1];
        return todayLabel;
    }


    // WEB -> Android Function Call
    function ScanClick(e) {
        let location = e.dataset.location
        if(now_location === 'pyeongtaek' && $('.start_cancel_p').css('display') =='block'){
            swal({
                title: '스캔 실패',
                text: '출발을 하게되면 스캔기능이 비활성화 됩니다.',
                icon: 'error',
                button: '확인'
            })
        }else if(now_location === 'seoul' && $('.start_cancel_s').css('display')=='block'){
            swal({
                title: '스캔 실패',
                text: '출발을 하게되면 스캔기능이 비활성화 됩니다.',
                icon: 'error',
                button: '확인'
            })
        }else if(now_location === 'seoul' && $('.start_cancel_p').css('display')=='none'){
            swal({
                title: '스캔 실패',
                text: '평택에서 미출발 시 스캔이 불가능 합니다.',
                icon: 'error',
                button: '확인'
            })
        }else{
            window.Android.ScanClick(location);
        }
        //평택 OR 서울 지역

    }

    // Android -> Web Function Call
    function ReadQR(code,location) {
        
        let car_info = JSON.parse(sessionStorage.getItem("dirver_car_list"));
        
        $('#scan_alert_check').css('display','none');
        $('#scan_alert_error').css('display','none');
        $.ajax({
            url: '/api/bus_qrcode_scan',
            method: 'post',
            dataType: 'json',
            data: {
                'qr_code' : code,
                'location' : location,
                'cr_id' : car_info[0].ctID
            },
            success: function(res){
                let qr_info;
                //qrcode 없음
                if(res.data == 0){
                    qr_info = 0;
                    window.Android.CheckQR(qr_info);
                    $('#scan_alert_error').css('display','block');
                    $('#scan_alert_text_error').text('결제가 되지않았거나 잘못된 QR코드 입니다.')
                }
                //qrcode 스캔 성공
                else if(res.data == 1){
                    qr_info = 1;
                    window.Android.CheckQR(qr_info);
                    $('#scan_alert_check').css('display','block');
                    $('#scan_alert_text_check').text(res.seatNum+'번 좌석이 스캔되었습니다.')
                    reload(location);
                }
                //이미 스캔되어있음
                else if(res.data == 2){
                    qr_info = 2;
                    window.Android.CheckQR(qr_info);
                    $('#scan_alert_error').css('display','block');
                    $('#scan_alert_text_error').text('이미 스캔된 QR코드 입니다.')
                }
                //qrcode 기간이 지남 
                else{
                    qr_info = 3;
                    window.Android.CheckQR(qr_info);
                    $('#scan_alert_error').css('display','block');
                    $('#scan_alert_text_error').text('기간만료된 QR코드 입니다.')
                }
            }

        });

        // document.getElementById('qrCode').innerHTML = "QR code : " + code;
    }

    //회원 전화번호 안드로이드로 전송
    function CallUser(e){
        let phone_number = e.text;
        // console.log('phone :',phone_number); 
        window.Android.CallUser(phone_number);
    }

// ScanClick -> 스캐너 호출
// CheckQR(String) -> 결과 전송