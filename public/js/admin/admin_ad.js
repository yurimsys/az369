
$(document).ready(function(){
    init();

})
function init(){
    // 브랜드 Data Load
    $.ajax({
        method: "get",
        dataType : "JSON",
        url: "/api/bsList",
        success: function (res){
            
            let brand_list = res.data.map((data) =>{
                return { id : data.BS_ID, text : data.BS_NameKor}
            });

            $('#selectBrand').select2(
                {
                    placeholder: 'Select an option',
                    data: brand_list
                }
            );
        }
    })
    
    // 광고업종 Data Load
    $.ajax({
        method: "get",
        dataType : "JSON",
        url: "/api/categoryLV1",
        success: function (res){
            let categoryLV1 = res.data.map((data) =>{
                return { id : data.BCR_LV1_BC_ID, text : data.BC_NameKor}
            });

            $('#selectAdCategory').select2(
                {
                    placeholder: 'Select an option',
                    data: categoryLV1
                }
            );
        }
    });

    // 광고위치 Data Load
    $.ajax({
        method: "get",
        dataType : "JSON",
        url: "/api/adtype",
        success: function (res){           
            let adtype = res.data.map((data) =>{
                return { id : data.ADY_ID, text : data.ADY_Location}
            });

            $('#selectAdType').select2(
                {
                    placeholder: 'Select an option',
                    data: adtype
                }
            );
        }
    });

    // 광고기간 DateBox
    $("#ad_duration_start, #ad_duration_final").dxDateBox({
        type: "date",
        dateSerializationFormat : "yyyy-MM-dd"
    });

    // 신규모드로 실행
    objectInfo("new");
}

let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns"),
        ad_duration_start_instance = $("#ad_duration_start").dxDateBox("instance"),
        ad_duration_final_instance = $("#ad_duration_final").dxDateBox("instance");

    if( mode === "new"){
        action_btns_instance.removeClass('action-modify');
        action_btns_instance.addClass('action-new');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');
        // todo : object reset
        $('#ad_id').text("");
        $('#ad_content_url').text("");
        $("#inputAdFiles").val('');
        $("#inputAdTitle").val('');
        $(".select2").val(null).trigger('change');
        ad_duration_start_instance.reset();
        ad_duration_final_instance.reset();

        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');
        
        // todo : object data-bind
        $('#ad_id').text(row_data.ad_id);
        $('#selectBrand').val(row_data.selectBrand).trigger('change');
        $('#ad_content_url').text(row_data.ad_content_url);
        $('#selectAdCategory').val(row_data.selectAdCategory).trigger('change');
        $('#selectAdType').val(row_data.selectAdType).trigger('change');
        $('#inputAdTitle').val(row_data.inputAdTitle);
        ad_duration_start_instance.option("value", row_data.ad_duration_start);
        ad_duration_final_instance.option("value", row_data.ad_duration_final);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/ad",
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
        },
        onRowClick : function(e) {
            console.log('row click', e.data);
            let row_data = {};
            row_data.ad_id = e.data.AD_ID;
            row_data.selectBrand = e.data.BS_ID;
            row_data.ad_content_url = e.data.AD_ContentURL;
            row_data.selectAdCategory = e.data.AD_BC_ID;
            row_data.selectAdType = e.data.AD_ADY_ID;
            row_data.inputAdTitle = e.data.AD_Title;
            row_data.ad_duration_start = e.data.AD_DtS;
            row_data.ad_duration_final = e.data.AD_DtF;

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
            var worksheet = workbook.addWorksheet('광고관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '광고관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            { dataField: "AD_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "BS_NameKor", caption: "브랜드"},
            { dataField: "BC_NameKor", caption: "광고업종"},
            { dataField: "ADY_Location", caption: "광고위치"},
            { dataField: "AD_Title", caption: "광고제목"},
            { dataField: "AD_ContentURL", caption: "URL"},
            { dataField: "AD_DtS", caption: "광고시작일", dataType: "date"},
            { dataField: "AD_DtF", caption: "광고종료일", dataType: "date"},
            { dataField: "AD_BC_ID", visible: false },
            { dataField: "BS_ID", visible: false },
            { dataField: "AD_ADY_ID", visible: false },
        ]
    });
}

tableInit();
function saveAD(){
    let update_data = {
        adBsId : $("#selectBrand").val(),
        adAdyId : $("#selectAdType").val(),
        adBcId : $("#selectAdCategory").val(),
        adTitle : $("#inputAdTitle").val(),
        adDtS : $("#ad_duration_start").dxDateBox("instance").option().value,
        adDtF : $("#ad_duration_final").dxDateBox("instance").option().value
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/ad/';

    $.ajax({
        dataType : 'JSON',
        type : "POST",
        url : api_url,
        data : form_data,
        contentType : false,
        processData : false,
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

        let id = JSON.parse( sessionStorage.getItem('row_data') ).ad_id;
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/ad/'+id,
            success : function (res) {
                console.log('ajax result');
                console.log(res);
                objectInfo('new');
                $("#mgmt-table").dxDataGrid("instance").refresh();
            }
        });
    } else if(mode === "multi"){
        
    }
}
function updateAD(){
    let id = JSON.parse( sessionStorage.getItem('row_data') ).ad_id;
    let update_data = {
        adBsId : $("#selectBrand").val(),
        adAdyId : $("#selectAdType").val(),
        adBcId : $("#selectAdCategory").val(),
        adTitle : $("#inputAdTitle").val(),
        adDtS : $("#ad_duration_start").dxDateBox("instance").option().value,
        adDtF : $("#ad_duration_final").dxDateBox("instance").option().value
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/ad/'+id;

    $.ajax({
        dataType : 'JSON',
        type : "PUT",
        url : api_url,
        data : form_data,
        contentType : false,
        processData : false,
        success : function (res) {
            console.log('ajax result');
            console.log(res);
            $("#mgmt-table").dxDataGrid("instance").refresh();
        }
    })
}
function clickActionBtn(e){
    
    // TODO : 클릭 버튼과 API 연결해야함.
    if( $(e.target).hasClass('disabled') ) return false;

    if(e.target.name == "modify"){
        // deleteAD()
    } else if(e.target.name == "save"){

    }
}

$(".action-btns .btn").click(clickActionBtn);