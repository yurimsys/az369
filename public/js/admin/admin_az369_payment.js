
$(document).ready(function(){

    init();

    $('.check-all').click(function () {
        $('.ab').prop('checked', this.checked);
    });
}) 
function init(){


    // 신규모드로 실행
    // objectInfo("new");
    // 광고기간 DateBox
    $(".search_cr_cdt").dxDateBox({
        type: "date",
        dateSerializationFormat : "yyyy-MM-dd"
    });
}


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
        // console.log('row_data',row_data);
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
            console.log('selection changed', e);
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
            
            console.log('row click', e);

            let ph_id = e.data.PH_ID;
            let ph_pay_state;
            $.ajax({
                url : '/api/payment_cancel',
                method : 'get',
                dataType : 'JSON',
                async : false,
                data : {'ph_id' : ph_id},
                success: function(res){
                     console.log('res',res.data);
                    if(res.data == 0){
                        ph_pay_state='결제취소';
                    }else{
                        ph_pay_state='결제완료';
                    }
                }					
            });
            console.log('ph',ph_pay_state);
            
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
            var workbook = new ExcelJS.Workbook();
            var worksheet = workbook.addWorksheet('결제 관리');
            
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
            { dataField: "PH_PG_Name", caption: "PG사명"},
            { dataField: "PH_PG_ID", caption: "거래번호"},
            { dataField: "PH_Price", caption: "결제금액"},
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
            { dataField: "CR_cDt", caption: "결제일시"}
        ],
        onContentReady: function(e) {
            let informer = e.element.find(".informer");
            informer.find(".totalCount").text(e.component.totalCount()+" 개");
        },
        onToolbarPreparing: function(e) {
            var dataGrid = e.component;
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
            // {
            //     location: "before",
            //     template: function(){
            //         return $("<div/>")
            //             .addClass("selectedActionBtns")
            //             .append(
            //                 $("<div />")
            //                 .addClass("selectRowCount")
            //                 .text(""),
            //                 $("<div />")
            //                 .addClass("btn btn-delete py-0")
            //                 .text("삭제")
            //                 .attr("onClick", "deleteAD('multi')")
            //             );
            //     }
            // }, 
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


tableInit();
//신규 등록 저장
function saveAD(){

    let update_data = {
        u_login_id : $("#u_login_id").val(),
        u_name : $('#u_name').val(),
        u_email : $('#u_email').val(),
        u_phone : $('#u_phone').val(),
        u_brand : $('#u_brand').val(),
        u_admin : $("#u_admin option:selected").attr('value'),
        postcode : $('#postcode').val(),
        address : $('#address').val(),
        detailAddress : $('#detailAddress').val(),
    }

    // console.log('updat22222e :',update_data);
    
    // let form_data = new FormData(document.forms[0]);
    // for ( let i in update_data) form_data.append(i, update_data[i]);
    let api_url  = '/api/member';
    // $.ajax({
    //     dataType : 'JSON',
    //     type : "POST",
    //     url : api_url,
    //     data : update_data,
    //     success : function (res) {
    //         console.log('ajax result');
    //         console.log(res);
    //         objectInfo('new');
    //         $("#mgmt-table").dxDataGrid("instance").refresh();
    //     }
    // })
}
function deleteAD(mode = 'single') {
    // if(mode === 'single'){

    //     let id = JSON.parse( sessionStorage.getItem('row_data') ).U_ID;
    //     console.log(id,'삭제 아이디');
    //     $.ajax({
    //         dataType : 'JSON',
    //         type : "DELETE",
    //         url : '/api/member/'+id,
    //         success : function (res) {
    //             console.log('ajax result');
    //             console.log(res);
    //             objectInfo('new');
    //             $("#mgmt-table").dxDataGrid("instance").refresh();
    //         }
    //     });
    // } else if(mode === "multi"){
    //     let id_list = {
    //         row_ids : sessionStorage.getItem('row_data_list')
    //     }
    //     console.log(id_list,'삭제 아이디들');
    //     $.ajax({
    //         dataType : 'JSON',
    //         type : "DELETE",
    //         data : id_list,
    //         url : '/api/member',
    //         success : function (res) {
    //             console.log('ajax result');
    //             console.log(res);
    //             objectInfo('new');
    //             $("#mgmt-table").dxDataGrid("instance").refresh();
    //         }
    //     });
    // }
}
function updateAD(){
    let id = JSON.parse( sessionStorage.getItem('row_data') ).U_ID;
    let update_data = {
        u_login_id : $("#u_login_id").val(),
        u_name : $('#u_name').val(),
        u_email : $('#u_email').val(),
        u_phone : $('#u_phone').val(),
        u_brand : $('#u_brand').val(),
        u_admin : $("#u_admin option:selected").attr('value'),
        postcode : $('#postcode').val(),
        address : $('#address').val(),
        detailAddress : $('#detailAddress').val(),
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/member/'+id;

    // $.ajax({
    //     dataType : 'JSON',
    //     type : "PUT",
    //     url : api_url,
    //     data : update_data,
    //     success : function (res) {
    //         console.log('ajax result');
    //         console.log(res);
    //         $("#mgmt-table").dxDataGrid("instance").refresh();
    //     }
    // })
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
// 닫기
function searchPopupClose() {
    $("#object-search-popup").hide();
}0
function searchPopupShow() {
    $('#object-search-popup').css('left','430px')
    $('#object-search-popup').css('top','300px')
    $("#object-search-popup").show();
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
}
function resNoseatClose(){
    $("#object-res-noseat-popup").hide();
}
//회원 예매 목록
function userSeat(ph_id) {
    $('#popup').css('display', 'block')
    // console.log('ph_id',ph_id);
    let ph_data = {
        ph_data : ph_id
    }
        
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
            if(res.data.length != 0){
                $('#object-res-seat-popup').css('left','530px')
                $('#object-res-seat-popup').css('top','100px')
                $("#object-res-seat-popup").show();

                let top_html = "<div><div class='time_info_date'><dd>"+res.data[0].deptTe2+" ("+getInputDayLabel(res.data[0].deptDay)+")</dd>";
                top_html += "<dd>"+res.data[0].returnTe2+" ("+getInputDayLabel(res.data[0].retnDay)+")</dd></div></div>";
                top_html += "<div><div class='time_info_time'><ul style='list-style:none;'><li><dt>평택</dt><dd>"+res.data[0].startTime+"</dd></li>";
                top_html += "<li><img src='/img/mypage/info_arrow.png'></li><li><dt>동대문</dt><dd>"+res.data[0].returnTime+"</dd></li></ul></div></div>";

                $('.time_info').append(top_html);
                let vank_num = res.data[0].PH_VankNumber == null ?  "" : "<tr><td style='width:100%'>"+res.data[0].PH_CardName+" "+res.data[0].PH_VankNumber+"</td></tr>";
                let mid_html = "<tr><th>결제일시</th><td>"+res.data[0].payDayYM+' ('+getInputDayLabel(res.data[0].payDayWeek)+') '+res.data[0].payDayTm+"</td></tr>";
                    mid_html += "<tr><th>결제수단</th><td>"+res.data[0].PH_Type+"</td></tr>";
                    mid_html += vank_num;
                    mid_html += "<tr><th>결제금액</th><td>"+(res.data[0].CR_Price * res.data.length)+"원</td></tr>";
                    mid_html += "<tr><th>결제상태</th><td>"+res.data[0].CR_PayState+"</td></tr>";

                $('.payment_info').append(mid_html);

                for(let i=0; i<res.data.length; i++){
                    let bot_html = "<li><div class='checks etrans' id=res_seat"+res.data[i].CR_ID+">";
                        bot_html += "<input type='checkbox' onclick='seatCheck(this)' name='seat_chk' id=seat_chk"+res.data[i].CR_ID+" value="+res.data[i].CR_ID+" class='ab' data-uid="+res.data[i].CR_U_ID+" data-pgid="+res.data[i].PH_PG_ID+" data-pgpaytype="+res.data[i].PH_CodeType+" data-seatprice="+res.data[i].CR_Price+">";
                        bot_html += "<label for=seat_chk"+res.data[i].CR_ID+" style='cursor:pointer;'>좌석번호<span>"+res.data[i].CR_SeatNum+"</span></label></div>";

                    
                        
                    $('#res_seat_list').append(bot_html);
                }
            }else{
                console.log('baad');
                $('#object-res-noseat-popup').css('left','430px')
                $('#object-res-noseat-popup').css('top','300px')
                $("#object-res-noseat-popup").show();
            }

        }					
    });
    
}

// 예매 취소
function resCancel(e) {
    $("#ex_chk5").prop('checked', false);
    // console.log('데이터 :', e.dataset.pgid);
    if($('input:checkbox[name=seat_chk]:checked').length == 0){
        alert('취소할 좌석을 선택해 주세요.')
        return false;
    }
    var check_box_arr = [];
    let chk_pg_id;
    let chk_u_id;
    let chk_pg_pay_type;
    let seat_pay;
    let ph_pay;
    $("input[name=seat_chk]:checked").each(function(){
        check_box_arr.push($(this).val());
        let chk_id = this.id
        chk_pg_id = $('#'+chk_id).data('pgid');
        chk_u_id = $('#'+chk_id).data('uid');
        chk_pg_pay_type = $('#'+chk_id).data('pgpaytype');
        seat_pay = $('#'+chk_id).data('seatprice');
    });

    console.log('check?',check_box_arr);
    console.log('data',chk_pg_id);
    ph_pay = seat_pay * check_box_arr.length;
    // console.log('ph_pay',ph_pay);
    // alert(ph_pay);
    $.ajax({
        url: "/api/user/cancelRes?type=admin",
        method: 'post',
        dataType: 'json',
        async: false,
        data: { 'cr_id': check_box_arr, "u_id" : chk_u_id},
        success: function (res) {
            $('#popup').css('display','none');
            $('.swal-icon--success__ring').css('display','none');
            $.ajax({
                type : "POST",
                url : "https://api.innopay.co.kr/api/cancelApi",
                async : true,
                data : cancelInfo(chk_pg_id,chk_pg_pay_type,ph_pay),
                contentType: "application/json; charset=utf-8",
                dataType : "json",
                success : function(data){
                    console.log('취소결과',data);
                    
                    alert('취소완료!');
                    // resSeatClose();
                    location.reload();

                },
                error : function(data){
                    console.log(data);
                    alert("취소 오류");
                }
            });
        }
    })
}

//결제 취소 요청 값!
function cancelInfo(string, codeString, ph_pay) {
    // var obj = {};
    // var row, 
    //     rows = table.rows;
    // for (var i=0, iLen=rows.length; i<iLen; i++) {
    //   row = rows[i];
    //   obj[document.getElementsByTagName("input")[i].getAttribute('name')] = document.getElementsByTagName("input")[i].value;
    // }
    // console.log('good',obj);
    let cancel_data = {}
        cancel_data.mid = 'pgaz369azm',
        cancel_data.tid = string,
        cancel_data.svcCd = codeString.toString(),
        cancel_data.partialCancelCode = '0',
        cancel_data.cancelAmt = ph_pay,
        cancel_data.cancelMsg = '결제 취소',
        cancel_data.cancelPwd = '123456'
        
    return JSON.stringify(cancel_data);
    // console.log('can', cancel_data);
}

//요일 계산 함수
function getInputDayLabel(date) {
    console.log('date :',date);
    var week = new Array('일', '월', '화', '수', '목', '금', '토');
    var todayLabel = week[date-1];
    return todayLabel;
}

//체크박스 활성화
function seatCheck(e){

    if($('input:checkbox[name=seat_chk]:checked').length < $("input:checkbox[name=seat_chk]").length){
        $("#ex_chk5").prop('checked', false);
        return false;
    }else if($('input:checkbox[name=seat_chk]:checked').length == $("input:checkbox[name=seat_chk]").length){
        $("#ex_chk5").prop('checked', true);
        return false;
    }
}

function showPay(){
    if($('#payState').val() == "impt"){
    
    }
}