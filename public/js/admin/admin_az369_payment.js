
    $(document).ready(function(){

        init();

        $('.check-all').click(function () {
            console.log('nunu',this);
            let all_this = this
            $('.ab').each(function(e){
                // console.log('e',e);
                if($('.ab').attr('disabled') == "disabled" ){
                    console.log('first');
                    $('.check-all').prop('checked', false);
                }else{
                    if(this.disabled == false){
                        //this의 id를 추출해 전체선택의 체크값으로 변경함
                        $('input:checkbox[id='+this.id+']').prop('checked',all_this.checked)
                    }else{
                        return false;
                    }
                    // $('.ab').prop('checked', this.checked);
                    
                }
            })
        });
    }) 
    function init(){

        // 신규모드로 실행
        // objectInfo("new");
        // 광고기간 DateBox
        $(".search_cr_cdt, .pg_get_day").dxDateBox({
            type: "date",
            dateSerializationFormat : "yyyy-MM-dd"
        });
    }

    let ck_count = 0;
    let objectInfo = function (mode = "modify", row_data) {
        let action_btns_instance = $(".object-info .action-btns");

        if( mode === "new"){
            if($('.brand_info').css('display') == 'none'){
                folding();
            }
            
            action_btns_instance.removeClass('action-modify');
            action_btns_instance.addClass('action-new');
            
            action_btns_instance.find('.btn').removeClass('disabled');
            action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');

            $('#ph_id').val('');
            $('#u_name').val('');
            $("#u_phone").val('');
            $("#pg_name").val('');
            $('#pg_id').val('');
            $("#ph_price").val('');
            $("#ph_type").val('');
            $('#pay_state').val('');
            $('#cr_cdt').val('');

            sessionStorage.removeItem('row_data');
        } else if( mode === "modify"){
            action_btns_instance.removeClass('action-new');
            action_btns_instance.addClass('action-modify');
            
            action_btns_instance.find('.btn').removeClass('disabled');
            action_btns_instance.find('.btn-save').addClass('disabled');

            $('#ph_id').val(row_data.PH_ID);
            $('#u_name').val(row_data.U_Name);
            $("#u_phone").val(row_data.U_Phone);
            $("#pg_name").val(row_data.PH_PG_Name);
            $('#pg_id').val(row_data.PH_PG_ID);
            $("#ph_price").val(row_data.PH_Price);
            $("#ph_type").val(row_data.PH_Type);
            $('#pay_state').val(row_data.CR_PayState);
            $('#cr_cdt').val(row_data.CR_cDt);
            $('#cr_memo').val(row_data.CR_Memo);
            $('#ph_amount').val(row_data.PH_PayAmount);
            if(row_data.PH_PayAmount == null){
                $('#ph_amount').val('0');
            }
            $('#ph_confirm').val(row_data.PH_PayConfirm);
            
            
            sessionStorage.setItem('row_data', JSON.stringify(row_data) );
        }
    }
    
    let tableInit = function (data) {
        $("#mgmt-table").dxDataGrid({
            dataSource: "/api/admin_payment",
            showBorders: true,
            renderAsync: true,
            allowColumnReordering: true,
            allowColumnResizing : true,
            columnResizingMode : "widget",
            cacheEnabled : true,
            columnAutoWidth : true,
            selection : {
                mode : "multiple",
                showCheckBoxesMode : "always" 
            },
            horverStateEnabled : true,
            pager: {
                showPageSizeSelector: true,
                allowedPageSizes: [5, 10, 20, 50, 100],
                showInfo: true
            },
            filterRow: {
                visible: true,
                applyFilter: "auto"
            },
            searchPanel: {
                visible: true,
                width: 240,
                placeholder: "Search..."
            },
            onSelectionChanged : function(e) {
                // console.log('selection changed', e);
                sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.U_ID));
                let dataGrid = e.component;
                
                let informer = e.element.find(".selectedActionBtns");
                informer.find(".selectRowCount").text( "선택 "+dataGrid.getSelectedRowsData().length+" 개");

                let isSelected = (e.selectedRowsData.length > 0);
                let selectedActionBtns = $(".selectedActionBtns");
                
                selectedActionBtns.css('display', (isSelected) ? "flex" : "none");
                selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            },
            onCellClick : function(e){
                if (e.columnIndex == 6) {  
                    userSeat(e.data.PH_ID);
                } 
            },
            onRowClick : function(e) {
                
                // console.log('row click', e);

                let ph_id = e.data.PH_ID;
                let ph_pay_state;
                $.ajax({
                    url : '/api/payment_cancel',
                    method : 'get',
                    dataType : 'JSON',
                    async : false,
                    data : {'ph_id' : ph_id},
                    success: function(res){
                        // console.log('res',res.data);
                        // if(res.data == 0){
                        //     ph_pay_state='결제취소';
                        // }else{
                        //     ph_pay_state='결제완료';
                        // }
                    }					
                });
                // console.log('ph',ph_pay_state);
                
                // selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
                e.rowElement.css("border-left", "2px solid #f2f2f2");

                let row_data = {};
                row_data.PH_ID = e.data.PH_ID;
                row_data.U_Name = e.data.U_Name;
                row_data.U_Phone = e.data.U_Phone;
                row_data.PH_PG_Name = e.data.PH_PG_Name;
                row_data.PH_PG_ID = e.data.PH_PG_ID;
                row_data.PH_Price = e.data.PH_Price;
                row_data.PH_Type = e.data.PH_Type;
                // row_data.CR_PayState = ph_pay_state;
                row_data.CR_PayState = e.data.CR_PayState;
                row_data.CR_cDt = e.data.CR_cDt;
                row_data.CR_Memo = e.data.CR_Memo;
                row_data.PH_PayConfirm = e.data.PH_PayConfirm;
                row_data.PH_PayAmount = e.data.PH_PayAmount;
                if($('.brand_info').css('display') == 'none'){
                    folding();
                }
                objectInfo("modify", row_data);
            },
            headerFilter: {
                visible: true
            },
            export: {
                enabled: true,
                allowExportSelectedData: true
            },
            onExporting: function(e) {
                let workbook = new ExcelJS.Workbook();
                let worksheet = workbook.addWorksheet('결제 관리');
                
                DevExpress.excelExporter.exportDataGrid({
                component: e.component,
                worksheet: worksheet,
                autoFilterEnabled: true
                }).then(function() {
                workbook.xlsx.writeBuffer().then(function(buffer) {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '장차 결제관리.xlsx');
                });
                });
                e.cancel = true;
            },
            columns: [
                //cssClass : 'tooltip'
                { dataField: "PH_ID", caption: "ID", width : 70, sortOrder : "desc"},
                { dataField: "U_Name", caption: "회원이름"},
                { dataField: "U_uId", caption: "회원아이디"},
                { dataField: "U_Phone", caption: "전화번호"},
                { dataField: "PH_OrderNumber", caption: "주문번호"},
                { dataField: "PH_PG_ID", caption: "거래번호"},
                { dataField: "PH_Price", caption: "결제금액"},
                { dataField: "cancel_pay", caption: "취소금액"},
                { dataField: "last_pay", caption: "최종금액"},
                { dataField: "PH_Type", caption: "결제수단"},
                { dataField: "CR_PayState", caption: "결제여부",
                    cellTemplate : function(element, info){
                        // console.log('info',info.data.PH_ID);
                        // let ph_id = info.data.PH_ID;
                        // $.ajax({
                        //     url : '/api/payment_cancel',
                        //     method : 'get',
                        //     dataType : 'JSON',
                        //     data : {'ph_id' : ph_id},
                        //     success: function(res){
                        //         console.log('id',ph_id);
                        //              console.log('res',res.data);
                        //             if(res.data == 0){
                        //                 element.append('<div>결제취소</div>').css('color','red')
                        //                 return dataField='결제취소';
                        //             }else{
                        //                 element.append('<div>결제완료</div>')            
                        //                 return dataField='결제완료';
                        //             }
                        //     }					
                        // });
                        if(info.value == '결제취소'){
                            element.append('<div>'+info.value +'</div>').css('color','red')
                        }else{
                            element.append('<div>'+info.value +'</div>')
                        }
                    }
                    // cellTemplate : function(element, info){
                    //     if(info.value == '결제취소'){
                    //         element.append('<div>'+info.value +'</div>').css('color','red')
                    //     }else{
                    //         element.append('<div>'+info.value +'</div>')
                    //     }
                    // }
                },
                { dataField: "CR_Memo", caption: "취소상태"},
                { dataField: "PH_PayConfirm", caption: "정산상태",
                    cellTemplate : function(element, info){
                        if(info.value == 'Y'){
                            element.append('<div>정산완료</div>').css('color','blue')
                        }else{
                            element.append('<div>미정산</div>')
                        }
                    }
                },
                { dataField: "PH_PayAmount", caption: "실제정산금액"},
                { dataField: "CR_cDt", caption: "결제일시"},
                { dataField: "CR_CancelDt", caption: "취소일시"},
                { dataField: "PH_PG_Name", caption: "PG사명"}
            ],
            //하단 합계
            summary: {
                recalculateWhileEditing: true,
                totalItems: [
                    {
                        name: "payConfirm",
                        showInColumn: "PH_PayConfirm",
                        displayFormat: "정산수: {0} 건",
                        summaryType: "custom"
                    },  
                    {
                        column: "PH_PayAmount",
                        displayFormat: "실제정산금액: {0} 원",
                        summaryType: "sum"
                    },
                    {
                        column: "PH_Price",
                        displayFormat: "결제금액: {0} 원",
                        summaryType: "sum"
                    },
                    {
                        column: "cancel_pay",
                        displayFormat: "취소금액: {0} 원",
                        summaryType: "sum"
                    },
                    {
                        column: "last_pay",
                        displayFormat: "최종금액: {0} 원",
                        summaryType: "sum"
                    }
                ],
                calculateCustomSummary: function (options) {
                        if (options.name == "payConfirm") {
                            if (options.summaryProcess === "start") {
                                options.totalValue = 0;
                            }

                            if (options.summaryProcess === "calculate") {
                                //정산인 된것만 카운트 ++
                                if(options.value.PH_PayConfirm == 'Y'){
                                    options.totalValue++;
                                }
                            }
                        }
                }
            },
            onContentReady: function(e) {
                let informer = e.element.find(".informer");
                informer.find(".totalCount").text(e.component.totalCount()+" 개");
            },
            onToolbarPreparing: function(e) {
                let dataGrid = e.component;
                e.toolbarOptions.items.unshift({
                    location: "before",
                    template: function(){
                        return $("<div/>")
                            .addClass("informer")
                            .append(
                                $("<span />")
                                .css("color", "#767676")
                                .text("검색 결과 "),
                            $("<strong />")
                                .addClass("totalCount")
                                .text("")
                            );
                    }
                }, 
                {
                    location: "after",
                    template: function(){
                        return $("<div/>")
                            .append(
                                $("<strong />")
                                .addClass("btn searchPopupBtn")
                                .text("상세검색")
                                .attr("onClick", "searchPopupShow()")
                            );
                    }
                })
            }

        });
    }

    // 상세 검색창 설정
    $(document).ready(()=>{
        let search_popup_element = $('.object-search-popup');
        search_popup_element.draggable({ handle: ".object-search-header" });
        let rect = document.querySelector("#mgmt-table").getBoundingClientRect();
        search_popup_element.css("left", "30px");
        search_popup_element.css("top", rect.top+'px');
    });


    //그리드 함수 실행
    tableInit();

    function deleteAD(mode = 'single') {

    }
    function updateAD(){

    }
    function clickActionBtn(e){
        if( $(e.target).hasClass('disabled') ) return false;

        if(e.target.getAttribute('name') == "modify"){
            updateAD();
        } else if(e.target.getAttribute('name') == "save"){
            saveAD();
        }
    }

    $(".action-btns .btn").click(clickActionBtn);

    // 상세 검색 버튼 기능
    // 초기화
    function searchPopupReset(){
        let search_cr_cdt_instance = $("#object-search-popup .search_cr_cdt").dxDateBox("instance");
        
        $('#search_u_name').val('');
        $("#search_u_phone").val('');
        $("#search_pg_name").val('');
        $('#search_pg_id').val('');
        $("#search_ph_price").val('');
        $("#search_ph_type").val('');
        $('#search_pay_state').val('');
        search_cr_cdt_instance.reset();
    }
    
    //검색 팝업
    function searchPopupShow() {
        $('#object-search-popup').css('left','430px')
        $('#object-search-popup').css('top','300px')
        $("#object-search-popup").show();
    }
    // 검색 닫기
    function searchPopupClose() {
        $("#object-search-popup").hide();
    }

    //PG 정산하기 팝업
    function payPopupShow(){
        $('#object-pay-popup').css('left','430px')
        $('#object-pay-popup').css('top','300px')
        $("#object-pay-popup").show();
        
    }
    //정산 모달 닫기 
    function payPopupClose() {
        $("#object-pay-popup").hide();
    }
    //현재 날짜 계산
    function pgGetToday(){
        let date = new Date();
        let year_toString = date.getFullYear().toString();
        let year = year_toString.substr(0,4)
        let month = ("0" + (1 + date.getMonth())).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);
        let result = year+"-"+month+"-"+ day;
        console.log('result',result);
        return result;
    }
    
    //정산일시 박스 초기화
    function pgPopupReset(){
        console.log('초기화하기');
        let obj_pg_get_day = $(".object-search-popup .pg_get_day").dxDateBox("instance");
        obj_pg_get_day.reset();
    }

    //정산일 날짜 구하기
    function getDay(e){
        console.log('e!!!',e.dataset.selectday);
        
        let obj_pg_get_day = $(".object-search-popup .pg_get_day").dxDateBox("instance");

        //클릭한 버튼의 값
        let select_day = e.dataset.selectday;

        if(select_day == 'daynow'){
            console.log('테스트',pgGetToday());
            obj_pg_get_day.option("value", pgGetToday());
        }else if(select_day == 'dayone'){
            console.log('테스트',dateAddDel(pgGetToday(),-1,'d'));
            obj_pg_get_day.option("value", dateAddDel(pgGetToday(),-1,'d'));
        }else if(select_day == 'daytwo'){
            console.log('테스트',dateAddDel(pgGetToday(),-2,'d'));
            obj_pg_get_day.option("value", dateAddDel(pgGetToday(),-2,'d'));
        }
        
    }

    //날짜 더히기 빼기 함수
    function dateAddDel(sDate, nNum, type) {
        var yy = parseInt(sDate.substr(0, 4), 10);
        var mm = parseInt(sDate.substr(5, 2), 10);
        var dd = parseInt(sDate.substr(8), 10);
        
        if (type == "d") {
            d = new Date(yy, mm - 1, dd + nNum);
        }
        else if (type == "m") {
            d = new Date(yy, mm - 1, dd + (nNum * 31));
        }
        else if (type == "y") {
            d = new Date(yy + nNum, mm - 1, dd);
        }
     
        yy = d.getFullYear();
        mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
        dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;
     
        return '' + yy + '-' +  mm  + '-' + dd;
    }

    //정산요청하기
    function payPopupAction(){
        // console.log('good',$(".object-search-popup .pg_get_day").dxDateBox("instance").option().value);
        //요일 계산
        let req_day = $(".object-search-popup .pg_get_day").dxDateBox("instance").option().value;

        if(req_day == null){
            alert('정산일시를 지정해 주세요.');
            return false;
        }

        // let week = ['일', '월', '화', '수', '목', '금', '토'];
        // let dayOfWeek = week[new Date(req_day).getDay()];
        // console.log('보낼 값 -제거',req_day.replace(/-/g,''));
        // // 주말 평일 나누는 분기
        // if(dayOfWeek == "토" || dayOfWeek == "일"){
        //     alert('주말에는 정산 내역이 없습니다.');
        //     return false;
        // }

        //정산된 좌석을 표시할 변수
        let ph_id_arr = [];
        $.ajax({
            url : '/api/pay-calculate',
            method : 'get',
            dataType : 'json',
            data : {"req_day" : req_day.replace(/-/g,'')},
            async : false,
            success: function(res){
                console.log('resL',res);
                if(res[0]){
                    if(res[0].type0 == "0001"){
                        alert(req_day+'날은 정산내역이 없습니다.')
                    }
                    else{
                        for(let i=0; i<res.length; i++){
                            ph_id_arr.push(res[i].PH_ID)
                        }
                        alert(req_day+'일'+'\n'+ph_id_arr+'번 PH_ID의 내역이 정산 되었습니다.')
                        $("#mgmt-table").dxDataGrid("instance").refresh();
                    }
                }else{
                    alert(req_day+'날은 정산내역이 없습니다.')
                }
                
            }					
        });
    }
    
    // 검색
    function searchPopupAction() {
        
        let condition_data = {
            searchType : $("#object_search_info #searchType").is(":checked"),
            u_name : $('#search_u_name').val(),
            u_phone : $('#search_u_phone').val(),
            pg_name : $('#search_pg_name').val(),
            pg_id : $('#search_pg_id').val(),
            ph_price : $('#search_ph_price').val(),
            ph_type : $('#search_ph_type').val(),
            pay_state : $('#search_pay_state').val(),
            u_cdt : $("#object-search-popup .search_cr_cdt").dxDateBox("instance").option().value
        };
        $.ajax({
            type : "GET",
            dataType : 'JSON',
            url : '/api/admin_payment?type=search',
            data : condition_data,
            success : function (res) {
                
                $("#mgmt-table").dxDataGrid({
                    dataSource: res.data
                });
            }
        })
    }

    function resSeatClose(){
        $("#object-res-seat-popup").hide();
        //전체선택 원상복귀
        $('.check-all').prop('checked', false);
    }
    function resNoseatClose(){
        $("#object-res-noseat-popup").hide();
    }

    //회원 예매 목록
    function userSeat(ph_id) {
        $('#popup').css('display', 'block')
            
        $.ajax({
            url : '/api/payment_list',
            method : 'get',
            dataType : 'json',
            data : {"ph_id" : ph_id},
            success: function(res){
                
                $('.time_info').empty();
                $('.payment_info').empty();
                $('#res_seat_list').empty();
                // console.log('res.data', res.data.length);
                //해당 좌석이 있는 경우
                if(res.data.length != 0){
                    $('#object-res-seat-popup').css('left','530px')
                    $('#object-res-seat-popup').css('top','100px')
                    $("#object-res-seat-popup").show();

                    let top_html = "<div><div class='time_info_date'><dd>"+res.data[0].deptTe2+" ("+getInputDayLabel(res.data[0].deptDay)+")</dd>";
                    top_html += "<dd>"+res.data[0].returnTe2+" ("+getInputDayLabel(res.data[0].retnDay)+")</dd></div></div>";
                    top_html += "<div><div class='time_info_time'><ul style='list-style:none;'><li><dt>평택</dt><dd>"+res.data[0].startTime+"</dd></li>";
                    top_html += "<li><img src='/img/mypage/info_arrow.png'></li><li><dt>동대문</dt><dd>"+res.data[0].returnTime+"</dd></li></ul></div></div>";

                    $('.time_info').append(top_html);

                    let bank_num = res.data[0].PH_BankNumber == null ?  "" : "<tr><td style='width:100%'>"+res.data[0].PH_CardName+" "+res.data[0].PH_BankNumber+"</td></tr>";
                    let mid_html = "<tr><th>결제일시</th><td>"+res.data[0].payDayYM+' ('+getInputDayLabel(res.data[0].payDayWeek)+') '+res.data[0].payDayTm+"</td></tr>";
                        mid_html += "<tr><th>주문번호</th><td>"+res.data[0].PH_OrderNumber+"</td></tr>";
                        mid_html += "<tr><th>결제수단</th><td>"+res.data[0].PH_Type+"</td></tr>";
                        mid_html += bank_num;
                        mid_html += "<tr><th>결제금액</th><td>"+(res.data[0].CR_Price * res.data.length)+"원</td></tr>";
                        mid_html += "<tr><th>결제상태</th><td>"+res.data[0].CR_PayState+"</td></tr>";

                    $('.payment_info').append(mid_html);

                    //좌석 리스트
                    let bot_html = "";
                    //취소 좌석 비활성화 변수
                    let chk_dis = "";
                    //취소 자석 안내문구
                    let chk_dis_memo = "";
                    for(let i=0; i<res.data.length; i++){
                        if(res.data[i].CR_Cancel == 'Y'){

                            bot_html += "<li style='background-color: #BDBDBD'>";
                            chk_dis = 'disabled';
                            chk_dis_memo = "취소된 좌석";
                        }else{
                            chk_dis = '';
                            bot_html += "<li>";
                        }

                        bot_html += "<div class='checks etrans' id=res_seat"+res.data[i].CR_ID+">";
                        bot_html += "<input type='checkbox' onclick='seatCheck(this)' name='seat_chk' id=seat_chk"+res.data[i].CR_ID+" value="+res.data[i].CR_ID+" class='ab' data-uid="+res.data[i].CR_U_ID+" data-pgid="+res.data[i].PH_PG_ID+" data-pgpaytype="+res.data[i].PH_CodeType+" data-seatprice="+res.data[i].CR_Price+" data-phid="+res.data[i].PH_ID+" data-ordernum="+res.data[i].PH_OrderNumber+" data-vbanknum="+res.data[i].PH_BankNumber+" data-vbankcd="+res.data[i].PH_BankCode+" data-canceltype="+res.data[i].CR_Cancel+" "+chk_dis+">";
                        bot_html += "<label for=seat_chk"+res.data[i].CR_ID+">좌석번호<span>"+res.data[i].CR_SeatNum+"</span>   "+chk_dis_memo+"</label></div></li>";
                        
                    }
                    // console.log('bot',bot_html);
                    $('#res_seat_list').append(bot_html);
                }
                //좌석이 없으면 이미 취소된 좌석입니다 문구 표현
                else{
                    console.log('baad');
                    $('#object-res-noseat-popup').css('left','430px')
                    $('#object-res-noseat-popup').css('top','300px')
                    $("#object-res-noseat-popup").show();
                }
            }					
        });
        
    }
    
    //예약한 좌석의 수 구하기
    function getCancelType(ph_id){
        let cancel_type;
        $.ajax({
            url : '/api/user/canceltype',
            method : 'get',
            dataType : 'json',
            async : false,
            data : {ph_id : ph_id},
            success: function(res){
                cancel_type = res.data[0].count
            }					
        });
        return cancel_type;
    }

        //가상계좌 취소 요청값
        function vBankCancel(tid, moid, pay, vbank_code, vbank_num){
        let vBank_data = {}
            vBank_data.mid = 'pgaz369azm'
            vBank_data.licenseKey = 'fx/UT4tcb5VWxP24BXiwH0stdJnNxFf6GpdFdvd42Bmwnurd/1QgGPORTIfioiAVy/B0cx6j5spsDwAfGsleuQ=='
            vBank_data.tid = tid
            vBank_data.moid = moid
            vBank_data.amt = pay
            vBank_data.vbankBankCode = vbank_code
            vBank_data.vbankNum = vbank_num

        return JSON.stringify(vBank_data); 
    }
    

    //가상계좌 취소 요청
    function vBank(chk_pg_id, order_num, ph_pay, vbank_code, vbank_num){
        $.ajax({
            type : "POST",
            url : "https://api.innopay.co.kr/api/vbankCancel",
            async : true,
            data : vBankCancel(chk_pg_id, order_num, ph_pay, vbank_code, vbank_num),
            contentType: "application/json; charset=utf-8",
            dataType : "json",
            success : function(data){
                console.log('가상계좌 결과값', data);
            },
            error : function(data){
                console.log('가상계좌 오류',data);   
            }
        });
    }



    // 예매 취소전 결제 모듈 확인 및 예외처리
    function resCancel(e) {
        // console.log('데이터 :', e.dataset.pgid);
        if($('input:checkbox[name=seat_chk]:checked').length == 0){
            alert('취소할 좌석을 선택해 주세요.')
            return false;
        }
        let check_box_arr = []; //예매한 좌석 cr_id
        let chk_pg_id; //PG사 결제 고유 아이디 tid
        let chk_u_id; // 결제 회원 아이디
        let chk_pg_pay_type; // 결제 취소 코드
        let seatPay; //선택된 좌석 금액
        let ph_pay; //취소할 금액
        let cancelType; //전체취소 or 부분취소
        let ph_id; //결제 고유 아이디 ph_id
        let order_num; //주문번호
        let vbank_num; //가상계좌 번호
        let vbank_cd; //가상계좌 은행코드

        //해당 체크박스의 값들 도출
        $("input[name=seat_chk]:checked").each(function(i){
            check_box_arr.push($(this).val());
            let chk_id = this.id;
            chk_pg_id = $('#'+chk_id).data('pgid');
            chk_u_id = $('#'+chk_id).data('uid');
            chk_pg_pay_type = $('#'+chk_id).data('pgpaytype');
            seatPay = $('#'+chk_id).data('seatprice');
            ph_id = $('#'+chk_id).data('phid');
            order_num = $('#'+chk_id).data('ordernum');
            vbank_num = $('#'+chk_id).data('vbanknum');
            vbank_cd = $('#'+chk_id).data('vbankcd');
            
        });
        ph_pay = seatPay * check_box_arr.length;
        let all_res_seat = $('#res_seat_list').children('li').length;
        // if($("input:checkbox[id='ex_chk5']").is(":checked") == true){
        //     cancelType = "0"
        // }else{
        //     cancelType = "1"
        // }
        //cancelType = 1 - 부분 취소 cancelType = 0 - 전체취소
        if(getCancelType(ph_id) > $("input[name=seat_chk]:checked").length){
            cancelType = "1"
        }else{
            cancelType = "0"
        }

        console.log('check_box_arr',check_box_arr);
        console.log('chk_u_id', chk_u_id);
        console.log('cancelType',cancelType);
        console.log('ph_pay', ph_pay);
        console.log('chk_pg_id', chk_pg_id);
        console.log('chk_pg_pay_type', chk_pg_pay_type);
        //후불결제 취소
        if(chk_pg_id == '1' ){
            cancelSeatAPI(check_box_arr, chk_u_id, cancelType)
            return false;
        }
        // 무통장 입금일때 api 처리
        //미 입금 시 전체 취소
        if(chk_pg_pay_type == '03' && cancelType == '0'){   
            $.ajax({
                url : '/api/user/vBank',
                method : 'get',
                dataType : 'json',
                data : {'cr_id': check_box_arr},
                success: function(res){
                    alert(cancelType)
                    if(res.data == '결제대기'){
                        cancelSeatAPI(check_box_arr, chk_u_id)
                        vBank(chk_pg_id, order_num.toString(), ph_pay.toString(), vbank_cd, vbank_num.toString())
                    }else{
                        $('#popup').css('display','none');	  
                        alert('무통장 입금은 취소를 지원하지 않습니다. 직접 해당 좌석을 환불해 주시고 예약 관리 페이지에서 예매 취소를 해주세요');
                        location.reload();
                    }
                }					
            });
        }
        //무통장 부분 취소일떄 경우 안내 메세지 표시
        else if(chk_pg_pay_type == '03' && cancelType == '1'){
            $('#popup').css('display','none');
            alert('무통장 입금은 취소를 지원하지 않습니다. 직접 해당 좌석을 환불해 주시고 예약 관리 페이지에서 예매 취소를 해주세요');
            location.reload();
        }
        //간편결제 부분취소 인경우
        else if(chk_pg_pay_type == '16' && cancelType == '1'){
            $('#popup').css('display','none');	            
            alert('간편결제는 부분취소를 지원하지 않습니다. 직접 해당 좌석을 환불해 주시고 예약 관리 페이지에서 예매 취소를 해주세요');
        }
        //그 외 결제수단은 api처리
        else{
            //결제 취소 우선 진행
            innopayCancelAPI(check_box_arr, chk_u_id, cancelType, ph_pay, chk_pg_id, chk_pg_pay_type)
        }
    }

    //좌석 예약 취소
    function cancelSeatAPI(check_box_arr, chk_u_id, cancelType){
        $.ajax({
            url: "/api/cancel-seat?type=admin",
            method: 'post',
            dataType: 'json',
            async: false,
            data: { 
                'cr_id': check_box_arr,
                "u_id" : chk_u_id,
                "cancelType" : cancelType  //부분취소 여부
            },
            success: function (res) {
                alert('취소완료');
                location.reload();
            }
        })
    }

    //이노페이 결제 취소 API
    function innopayCancelAPI(check_box_arr, chk_u_id, cancelType, ph_pay, chk_pg_id, chk_pg_pay_type){
        $.ajax({
            type : "POST",
            url : "https://api.innopay.co.kr/api/cancelApi",
            async : true,
            data : cancelInfo(chk_pg_id,chk_pg_pay_type,cancelType,ph_pay),
            contentType: "application/json; charset=utf-8",
            dataType : "json",
            success : function(data){
                console.log('취소결과',data);
                if(data.resultCode == '2001' ||data.resultCode == '2211'){
                    cancelSeatAPI(check_box_arr, chk_u_id, cancelType);
                }else{
                    alert('취소 오류 이노페이 관리페이지에서 직접 취소 해주세요.')
                    
                }
                // resSeatClose();
                //좌석 취소
                location.reload();
                

            },
            error : function(data){
                console.log(data);
                alert("취소 오류");
            }
        });
    }



    //결제 취소 요청 값!
    function cancelInfo(string, codeString, cancelType, ph_pay) {

        let cancel_data = {}
            cancel_data.mid = 'pgaz369azm',
            cancel_data.tid = string,
            cancel_data.svcCd = codeString.toString(),
            cancel_data.partialCancelCode = cancelType,
            cancel_data.cancelAmt = ph_pay,
            cancel_data.cancelMsg = '결제 취소',
            cancel_data.cancelPwd = '123456'
            
        return JSON.stringify(cancel_data);
        // console.log('can', cancel_data);
    }

    //요일 계산 함수
    function getInputDayLabel(date) {
        let week = new Array('일', '월', '화', '수', '목', '금', '토');
        let todayLabel = week[date-1];
        return todayLabel;
    }

    //체크박스 활성화
    function seatCheck(e){
        console.log('e',e);
        if(e.dataset.canceltype == 'Y'){
            return false
        }
        $('.ab').each(function(e){
            console.log('fuce',e);
            console.log('this',this);
        })
        if($('input:checkbox[name=seat_chk]:checked').length < $("input:checkbox[name=seat_chk]").length){
            console.log('첫');
            $("#ex_chk5").prop('checked', false);
            return false;
        }else if($('input:checkbox[name=seat_chk]:checked').length == $("input:checkbox[name=seat_chk]").length){
            console.log('둘');
            $("#ex_chk5").prop('checked', true);
            return false;
        }
    }
