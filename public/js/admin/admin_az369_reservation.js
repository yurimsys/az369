
$(document).ready(function(){





    
    init();
}) 
function init(){

    // 신규모드로 실행
    objectInfo("new");
    $(".search_res_day, .search_py_start, .search_se_start").dxDateBox({
        type: "date",
        dateSerializationFormat : "yyyy-MM-dd",
    });
    // $.ajax({
    //     method: "get",
    //     dataType : "JSON",
    //     url: "/api/vehicle/list?type=default",
    //     success: function (res){
    //         // $('#ct_id').empty();
    //         // let default_html = '<option value="null">배차 선택</option>'
    //         // $('#ct_id').append(default_html);
    //         for (let i=0; i<res.data.length; i++){
    //             let html = "<option value="+res.data[i].CT_ID+" data-price="+res.data[0].CY_SeatPrice+">"+res.data[i].B_NAME+" "+res.data[i].deptTime+"시</option>";
    //             $('#ct_id').append(html);
    //         }

    //             let html = "<option value="+res.data[0].B_NAME+">"+res.data[0].B_NAME+"</option>";
    //             $('#search_ct_id').append(html);
            

    //     }
    // });

}

let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns")

    if( mode === "new"){
        $.ajax({
            method: "get",
            dataType : "JSON",
            url: "/api/vehicle/list?type=default",
            success: function (res){
                $('#ct_id').empty();
                let default_html = '<option value="null">배차 선택</option>'
                $('#ct_id').append(default_html);
                for (let i=0; i<res.data.length; i++){
                    let html = "<option value="+res.data[i].CT_ID+" data-price="+res.data[0].CY_SeatPrice+">"+res.data[i].B_NAME+" "+res.data[i].deptTime+"시</option>";
                    $('#ct_id').append(html);
                }
    
                    let html = "<option value="+res.data[0].B_NAME+">"+res.data[0].B_NAME+"</option>";
                    $('#search_ct_id').append(html);
            }
        });


        if($('.brand_info').css('display') == 'none'){
            folding();
        }
        $('#new_test2').css('display','none');
        $('.info_center').css('display','none');
        $('.info_right').css('display','none');
        $('#ct_id').attr('disabled', false);
        $('#u_id').attr('readonly',false);
        $('#seat_num').attr('readonly',false);

        
        action_btns_instance.removeClass('action-modify');
        action_btns_instance.addClass('action-new');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');

        $('#cr_id').val('');
        $('#u_id').val('');
        $('#ct_id').val('null');
        $('#seat_num').val('');
        $("#user_name").val('');
        $("#user_phone").val('');
        $("#user_brand").val('');
        $("#seat_price").val('');
        $("#user_addr1").val('');
        $("#user_addr2").val('');
        $('#py_start').val('null');
        $('#se_start').val('null');
        $('#cr_cancel').val('null');
        $("#py_scan").val('null');
        $("#se_scan").val('null');
        $('#res_day').val('');
        // init();
        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        // console.log('row_data',row_data);
        $('#new_test2').css('display','block');
        $('.info_center').css('display','block');
        $('.info_right').css('display','block');
        $('#ct_id').attr('disabled', 'true');
        $('#u_id').attr('readonly',true);
        $('#seat_num').attr('readonly',true);
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');
        $('#cr_id').val(row_data.CR_ID);
        $('#u_id').val(row_data.CR_U_ID);
        $('#ct_id').val(row_data.CR_CT_ID);
        $('#seat_num').val(row_data.CR_SeatNum);
        $("#user_name").val(row_data.U_Name);
        $("#user_phone").val(row_data.U_Phone);
        $("#user_brand").val(row_data.U_Brand);
        $("#seat_price").val(row_data.CR_Price);
        $("#user_addr1").val(row_data.U_Addr1);
        $("#user_addr2").val(row_data.U_Addr2);
        $('#py_start').val(row_data.CT_DepartureTe);
        $('#se_start').val(row_data.CT_ReturnTe);
        $('#cr_cancel').val(row_data.CR_Cancel);
        $("#py_scan").val(row_data.CR_ScanPy);
        $("#se_scan").val(row_data.CR_ScanSe);
        $('#res_day').val(row_data.CR_cDt);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/reservation_list",
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
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.CR_ID));
            let dataGrid = e.component;
            
            let informer = e.element.find(".selectedActionBtns");
            informer.find(".selectRowCount").text( "선택 "+dataGrid.getSelectedRowsData().length+" 개");

            let isSelected = (e.selectedRowsData.length > 0);
            let selectedActionBtns = $(".selectedActionBtns");
            
            selectedActionBtns.css('display', (isSelected) ? "flex" : "none");
            selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
        },
        onRowClick : function(e) {
            console.log('goood?',e.data.CR_CT_ID);
            $.ajax({
                method: "get",
                dataType : "JSON",
                url: "/api/vehicle/list",
                success: function (res){
                    
                    for (let i=0; i<res.data.length; i++){
                        let html = "<option value="+res.data[i].CT_ID+" data-price="+res.data[0].CY_SeatPrice+">"+res.data[i].B_NAME+" "+res.data[i].deptTime+"시</option>";
                        $('#ct_id').append(html);
                    }
        
                }
            });
            // init();
            // console.log('row click', e.data);
            // selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            e.rowElement.css("border-left", "2px solid #f2f2f2");

            let row_data = {};
            row_data.CR_ID = e.data.CR_ID;
            row_data.CR_CT_ID = e.data.CR_CT_ID;
            row_data.CR_U_ID = e.data.CR_U_ID;
            row_data.U_Name = e.data.U_Name;
            row_data.U_Phone = e.data.U_Phone;
            row_data.U_Brand = e.data.U_Brand;
            row_data.U_Addr1 = e.data.U_Addr1;
            row_data.U_Addr2 = e.data.U_Addr2;
            row_data.CR_SeatNum = e.data.CR_SeatNum;
            row_data.CR_Price = e.data.CR_Price;
            row_data.CR_Cancel = e.data.CR_Cancel;
            row_data.CR_ScanPy = e.data.CR_ScanPy;
            row_data.CR_ScanSe = e.data.CR_ScanSe;
            row_data.CT_DepartureTe = e.data.CT_DepartureTe;
            row_data.CT_ReturnTe = e.data.CT_ReturnTe;
            row_data.CR_cDt = e.data.CR_cDt;
            
            if($('.brand_info').css('display') == 'none'){
                folding();
            }
            objectInfo("modify", row_data);
        },
        onCellClick : function(e){
            if (e.columnIndex == 5) {  
                // console.log('open',e.data.CR_SeatNum);
                openBus(e.data.CR_SeatNum);
                //좌석 현황 오픈
                $('#object-seat-popup').css('left','430px')
                $('#object-seat-popup').css('top','300px')
                $("#object-seat-popup").show();
            } 
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
            var worksheet = workbook.addWorksheet('배차관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '장차 예약관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            //cssClass : 'tooltip'
            { dataField: "CR_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "U_Name", caption: "회원명"},
            { dataField: "U_Phone", caption: "회원 전화번호"},
            { dataField: "B_Name", caption: "운송사명"},
            { dataField: "CR_SeatNum", caption: "예약 좌석"},
            { dataField: "CT_CarNum", caption: "버스번호"},
            { dataField: "CT_DepartureTe", caption: "평택 출발시간"},
            { dataField: "CT_ReturnTe", caption: "서울 출발시간"},
            { dataField: "CR_Price", caption: "좌석 금액"},
            { dataField: "CR_Cancel", caption: "취소여부"},
            { dataField: "CR_ScanPy", caption: "평택 스캔확인"},
            { dataField: "CR_ScanSe", caption: "서울 스캔확인"},
            { dataField: "CR_cDt", caption: "예매일"},
            { dataField: "U_Email", caption: "회원 이메일"},
            { dataField: "U_Brand", caption: "회원 브랜드"},
            { dataField: "U_Zip", caption: "회원 우편번호"},
            { dataField: "U_Addr1", caption: "회원 주소"},
            { dataField: "U_Addr2", caption: "회원 상세주소"},
            { dataField: "CR_CT_ID", visible: false },
            { dataField: "CR_U_ID", visible: false },
            { dataField: "CT_ID", visible: false }
        ],
        // onSelectionChanged: function (selectedItems) {
        //     debugger;
        //     var data = selectedItems.selectedRowsData[0];
        //     console.log(selectedItems.selectedRowsData[0]);
        //     console.log('321321321321');
        //     console.log(selectedItems.selectedRowsData[5]);
            
        // },
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
            }, {
                location: "before",
                template: function(){
                    return $("<div/>")
                        .addClass("selectedActionBtns")
                        .append(
                            $("<div />")
                            .addClass("selectRowCount")
                            .text(""),
                            $("<div />")
                            .addClass("btn btn-delete py-0")
                            .text("삭제")
                            .attr("onClick", "deleteAD('multi')")
                        );
                }
            }, {
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

// 검색창 초기화
function resetSearch() {
    let search_res_day_instance = $(".object-info .search_res_day").dxDateBox("instance"),
    search_py_start_instance = $(".object-info .search_py_start").dxDateBox("instance"),
    search_se_start_instance = $(".object-info .search_se_start").dxDateBox("instance");
    search_res_day_instance.reset();
    search_py_start_instance.reset();
    search_se_start_instance.reset();
}


tableInit();
//신규 등록 저장
function saveAD(){

    let update_data = {
        ct_id : $("#ct_id option:selected").attr('value'),
        u_id : $("#u_id").val(),
        seat_num : $('#seat_num').val(),
        seat_price : $("#ct_id option:selected").attr('data-price')
    }

    // console.log('updat22222e :',update_data);
    
    // let form_data = new FormData(document.forms[0]);
    // for ( let i in update_data) form_data.append(i, update_data[i]);
    let api_url = '/api/reservation';
    $.ajax({
        dataType : 'JSON',
        type : "POST",
        url : api_url,
        data : update_data,
        success : function (res) {
            console.log('ajax result');
            console.log(res);
            objectInfo('new');
            $("#mgmt-table").dxDataGrid("instance").refresh();
        }
    })
}
function deleteAD(mode = 'single') {
    if(mode === 'single'){

        let id = JSON.parse( sessionStorage.getItem('row_data') ).CR_ID;
        console.log(id,'삭제 아이디');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/reservation/'+id,
            success : function (res) {
                console.log('ajax result');
                console.log(res);
                objectInfo('new');
                $("#mgmt-table").dxDataGrid("instance").refresh();
            }
        });
    } else if(mode === "multi"){
        let id_list = {
            row_ids : sessionStorage.getItem('row_data_list')
        }
        console.log(id_list,'삭제 아이디들');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            data : id_list,
            url : '/api/reservation',
            success : function (res) {
                console.log('ajax result');
                console.log(res);
                objectInfo('new');
                $("#mgmt-table").dxDataGrid("instance").refresh();
            }
        });
    }
}
function updateAD(){
    let id = JSON.parse( sessionStorage.getItem('row_data') ).CR_ID;
    let update_data = {
        cr_cancel : $("#cr_cancel option:selected").attr('value'),
        py_scan : $("#py_scan option:selected").attr('value'),
        se_scan : $("#se_scan option:selected").attr('value')
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/reservation/'+id;

    $.ajax({
        dataType : 'JSON',
        type : "PUT",
        url : api_url,
        data : update_data,
        success : function (res) {
            console.log('ajax result');
            console.log(res);
            $("#mgmt-table").dxDataGrid("instance").refresh();
        }
    })
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
    let search_res_day_instance = $("#object-search-popup .search_res_day").dxDateBox("instance"),
    search_py_start_instance = $("#object-search-popup .search_py_start").dxDateBox("instance"),
    search_se_start_instance = $("#object-search-popup .search_se_start").dxDateBox("instance");
    search_res_day_instance.reset();
    search_py_start_instance.reset();
    search_se_start_instance.reset();
    $('#search_user_name').val('');
    $('#search_user_phone').val('');
    $('#search_user_brand').val('');
    $('#search_user_addr1').val('');
    $("#search_user_addr2").val('');
    $("#search_ct_id").val('null');
    $('#search_seat_num').val('');
    $('#search_seat_price').val('');
    $('#search_cr_cancel').val('null');
    $('#search_py_scan').val('null');
    $('#search_se_scan').val('null');
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
        search_user_name : $("#search_user_name").val(),
        search_user_phone : $("#search_user_phone").val(),
        search_user_brand : $('#search_user_brand').val(),
        search_user_addr1 : $("#search_user_addr1").val(),
        search_user_addr2 : $("#search_user_addr2").val(),
        search_ct_id : $("#search_ct_id option:selected").attr('value'),
        search_seat_num : $('#search_seat_num').val(),
        search_seat_price : $('#search_seat_price').val(),
        search_res_day : $("#object-search-popup .search_res_day").dxDateBox("instance").option().value,
        search_py_start : $("#object-search-popup .search_py_start").dxDateBox("instance").option().value,
        search_se_start : $("#object-search-popup .search_se_start").dxDateBox("instance").option().value,
        search_cr_cancel : $("#search_cr_cancel option:selected").attr('value'),
        search_py_scan : $("#search_py_scan option:selected").attr('value'),
        search_se_scan : $("#search_se_scan option:selected").attr('value')
        
        
    };
    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/reservation_list?type=search',
        data : condition_data,
        success : function (res) {
            
            $("#mgmt-table").dxDataGrid({
                dataSource: res.data
            });
        }
    })
}

//상세정보 토글

function folding(){
    $('#object_detail_group').slideToggle('fast')
    
}

//좌석금액 불러오기
var selected_seats = [];
var selected_seats_cnt = 0;
var seatPrice = 0;
let now_location = 'default';

function openBus(busSeat) {
    var firstSeatLabel = 1;
    let user_id = busSeat;

    $('.seat-map').seatCharts({
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
                let scan_checked;
                if (this.status() == 'available') {
                    // alert('예매되지 않은 좌석입니다.')
                    // return 'selected';
                } 
                //스캔 된 좌석
                else if (this.settings.$node.hasClass('selected')) {
                    scan_checked = 'selected'
                    // userSeatInfo(bus_ct_id,bus_seat_number,scan_checked);
                    
                    return 'selected';
                } 
                //스캔 되지 않은 예매된 좌석
                else if (this.status() == 'unavailable') {
                    // console.log('this',this);
                    scan_checked = 'unavailable'
                    return 'unavailable';
                } else {

                    return this.style();
                }
            }
        });

    //현재 예약된 자석
    // scanSeatList();
    flushSeat(user_id);
}


function flushSeat(seat_num) {
    let $seat = $('.seat-map')
    var sc = $seat.seatCharts();
    sc.find('e.selected').status('available');
    let seat_id_list;

    seat_id_list = (getSeatId(seat_num));
    sc.find('unavailable').status('available');
    sc.status(seat_id_list, 'unavailable');
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
        seat_id = row + "_" + column;
        return seat_id;
    } else {
        return null;
    }
}
//좌석현황 모달 닫기
function seatClose(){
    $("#object-seat-popup").hide();   
}