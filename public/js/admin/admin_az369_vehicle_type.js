
$(document).ready(function(){

    init();
}) 
function init(){
    // 신규모드로 실행
    // objectInfo("new");
    // 광고기간 DateBox
    $(".search_cdt").dxDateBox({
        type: "date",
        dateSerializationFormat : "yyyy-MM-dd"
    });
    $.ajax({
        url: '/api/business',
        method: 'get',
        dataType : 'json',
        success : function(res){

            let brand_list = res.data.map((data) =>{
                return { id : data.B_ID, text : data.B_Name}
            });
            
            $("#car_list").select2(
                {
                    placeholder: '운송사 선택',
                    data: brand_list,
                    width: 'resolve'
                }
            );

            $("#search_car_list").select2(
                {
                    placeholder: '운송사 선택',
                    data: brand_list,
                    width: 'resolve'
                }
            );

            // for(let i=0; i <res.data.length; i++){
            //     let html = "<option value="+res.data[i].B_ID+">"+res.data[i].B_Name+"</option>"  
            //     // $('#car_list').append(html);
            //     $('#search_car_list').append(html);
                
            // }
        }
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

        $('#car_id').val('');
        $(".object-info .select2").val(null).trigger('change');
        // $('#car_list').val('null');
        $('#car_type').val('');
        $('#all_seat').val('');
        $('#service_seat').val('');
        $('#seat_price').val('');

        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        console.log('row_data',row_data);
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');

        $('#car_id').val(row_data.CY_ID);
        $('.object-info #car_list').val(row_data.CY_B_ID).trigger('change');
        // $('#car_list').val(row_data.CY_B_ID);
        $('#car_type').val(row_data.CY_Ty);
        $('#all_seat').val(row_data.CY_TotalPassenger);
        $('#service_seat').val(row_data.CY_ServicePassenger);
        $('#seat_price').val(row_data.CY_SeatPrice);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/vehicle_type",
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
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.CY_ID));
            let dataGrid = e.component;
            
            let informer = e.element.find(".selectedActionBtns");
            informer.find(".selectRowCount").text( "선택 "+dataGrid.getSelectedRowsData().length+" 개");

            let isSelected = (e.selectedRowsData.length > 0);
            let selectedActionBtns = $(".selectedActionBtns");
            
            selectedActionBtns.css('display', (isSelected) ? "flex" : "none");
            selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
        },
        onRowClick : function(e) {
            // console.log('row click', e.data);
            // selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            e.rowElement.css("border-left", "2px solid #f2f2f2");

            let row_data = {};
            row_data.CY_ID = e.data.CY_ID;
            row_data.CY_B_ID = e.data.CY_B_ID;
            row_data.CY_Ty = e.data.CY_Ty;
            row_data.CY_TotalPassenger = e.data.CY_TotalPassenger;
            row_data.CY_ServicePassenger = e.data.CY_ServicePassenger;
            row_data.CY_SeatPrice = e.data.CY_SeatPrice;
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
            var worksheet = workbook.addWorksheet('차량 타입 관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '차량타입 관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            //cssClass : 'tooltip'
            { dataField: "CY_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "B_Name", caption: "운송사명"},
            { dataField: "CY_Ty", caption: "차량타입"},
            { dataField: "CY_TotalPassenger", caption: "전체 좌석"},
            { dataField: "CY_ServicePassenger", caption: "실제 좌석"},
            { dataField: "CY_SeatPrice", caption: "좌석 가격"},
            { dataField: "CY_cDt", caption: "생성일"}
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
    // $(".select2").val(null).trigger('change');
    let search_py_start_instance = $(".object-info .search_py_start").dxDateBox("instance"),
    search_se_start_instance = $(".object-info .search_se_start").dxDateBox("instance");
    search_py_start_instance.reset();
    search_se_start_instance.reset();
}


tableInit();
//신규 등록 저장
function saveAD(){

    let update_data = {
        cy_list : $("#car_list option:selected").attr('value'),
        cy_type : $('#car_type').val(),
        cy_total : $('#all_seat').val(),
        cy_service : $('#service_seat').val(),
        cy_price : $('#seat_price').val()
    }

    let api_url  = '/api/vehicle_type';
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

        let id = JSON.parse( sessionStorage.getItem('row_data') ).CY_ID;
        console.log(id,'삭제 아이디');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/vehicle_type/'+id,
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
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            data : id_list,
            url : '/api/vehicle_type',
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
    let id = JSON.parse( sessionStorage.getItem('row_data') ).CY_ID;
    let update_data = {
        cy_list : $("#car_list option:selected").attr('value'),
        cy_type : $('#car_type').val(),
        cy_total : $('#all_seat').val(),
        cy_service : $('#service_seat').val(),
        cy_price : $('#seat_price').val()
    }

    // let form_data = new FormData(document.forms[0]);
    // for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/vehicle_type/'+id;

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
    let search_detailAddress_instance = $("#object-search-popup .search_cdt").dxDateBox("instance")
    search_detailAddress_instance.reset();

    $("#search_car_list").val('null')
    $('#search_car_type').val('')
    $('#search_all_seat').val('')
    $('#search_service_seat').val('')
    $('#search_seat_price').val('')
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
        cy_list : $("#search_car_list option:selected").attr('value'),
        cy_type : $('#search_car_type').val(),
        cy_total : $('#search_all_seat').val(),
        cy_service : $('#search_service_seat').val(),
        cy_price : $('#search_seat_price').val()
    };
    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/vehicle_type?type=search',
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
