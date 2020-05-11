/** 
 *  공통 스크립트
 */


 // Datatable Config.
$(function() {
	'use strict';

	// DataTable setup
	$.extend( $.fn.dataTable.defaults, {
		autoWidth: false,
		columnDefs: [{
			orderable: false,
			width: '90px',
			targets: [ 0, 1 ]
		}],
		dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"ip>',
		language: {
			search: '<span>Search:</span> _INPUT_',
			lengthMenu: '<span>Show:</span> _MENU_',
			paginate: { 'first': 'First', 'last': 'Last', 'next': '&rarr;', 'previous': '&larr;' }
		},

		lengthMenu: [ 5, 10, 25, 50 ],
		displayLength: 5,

	});

	// Individual column searching with text inputs
	// $('.datatable tfoot td').not(':last-child').each(function () {
	// 	var title = $('.datatable thead th').eq($(this).index()).text();
	// 	$(this).html('<input type="text" class="form-control input-sm" placeholder="'+title+'" />');
	// });
	// var table = $('.datatable').DataTable();
	// table.columns().every( function () {
	// 	var that = this;
	// 	$('input', this.footer()).on('keyup change', function () {
	// 		that.search(this.value).draw();
	// 	});
	// });

	// Add placeholder to the datatable filter option
	$('.dataTables_filter input[type=search]').attr('placeholder','Type to filter...');
	$('.dataTables_filter input[type=search]').attr('class', 'form-control');

	// Enable Select2 select for the length option
	$('.dataTables_length select').select2({
		minimumResultsForSearch: Infinity,
		width: 'auto'
	});

	// Enable Select2 select for individual column searching
	$('.filter-select').select2();

	$('.select').select2();
});

$.dataTable = {}
$.dataTable.init = function (){
    // Add placeholder to the datatable filter option
	$('.dataTables_filter input[type=search]').attr('placeholder','Type to filter...');
	$('.dataTables_filter input[type=search]').attr('class', 'form-control');

	// Enable Select2 select for the length option
	$('.dataTables_length select').select2({
		minimumResultsForSearch: Infinity,
		width: 'auto'
	});

	// Enable Select2 select for individual column searching
	$('.filter-select').select2();

	$('.select').select2();
}