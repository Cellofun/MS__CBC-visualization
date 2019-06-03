$('#file_input').change(function() {
    var i = $(this).prev('label').clone();
    var file = $('#file_input')[0].files[0].name;
    $(this).prev('label').text(file);
});