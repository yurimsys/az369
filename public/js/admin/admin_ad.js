
$(document).ready(function(){
    init();

})
function init(){
    // 브랜드     
    $.ajax({
        method: "get",
        dataType : "JSON",
        url: "/api/bsList",
        success: function (res){
            
            let brand_list = res.data.map((data) =>{
                return { id : data.BS_ID, text : data.BS_NameKor}
            });
            console.log(brand_list);
            $('#selectBrand').select2(
                {
                    placeholder: 'Select an option',
                    data: brand_list
                }
            );
        }
    })
    
    // 광고업종
    $('#selectAdCategory').select2({
        placeholder: 'Select an option',
        data : [
            { id:1, text: "test1"},
            { id:1, text: "test1"},
            { id:1, text: "test1"},
            { id:1, text: "test1"}
        ]
    });

    // 광고위치
    $('#selectAdType').select2({
        placeholder: 'Select an option',
        data : [
            { id:1, text: "test1"},
            { id:1, text: "test1"},
            { id:1, text: "test1"},
            { id:1, text: "test1"}
        ]
    });

    // 광고기간 
    $("#display_duration_start, #display_duration_final").dxDateBox({
        type: "date"
    })
}
let tableInit = function (data) {
    $("#gridContainer").dxDataGrid({
        dataSource: "/api/ad",
        showBorders: true,
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
            $('#ad_id').text(e.data.AD_ID);
            $('#selectBrand').val(e.data.BS_NameKor);
            $('#inputURL').val(e.data.AD_ContentURL);
            $('#selectAdCategory').val(e.data.BC_NameKor);
            $('#selectAdType').val(e.data.ADY_Location);
            $('#selectAdTitle').val(e.data.AD_Title);
        },
        headerFilter: {
            visible: true
        },
        columns: [
            { dataField: "AD_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "BS_NameKor", caption: "브랜드"},
            { dataField: "BC_NameKor", caption: "광고업종"},
            { dataField: "ADY_Location", caption: "광고위치"},
            { dataField: "AD_Title", caption: "광고제목"},
            { dataField: "AD_ContentURL", caption: "URL"},
            { dataField: "AD_DtS", caption: "광고시작일", dataType: "date"},
            { dataField: "AD_DtF", caption: "광고종료일", dataType: "date"}
        ]
    });
}

tableInit();
// $.ajax({
//     dataType : 'JSON',
//     url : '/api/ad',
//     success : function (res) {
//         let ad_list = res.data;
//         tableInit(ad_list);
//     }
// })