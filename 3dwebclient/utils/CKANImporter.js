//jQuery functions for the handling of the webform
$(document).ready(function(){

  $("#ckan-form-toggleadditionalcategoriesbutton").click(function(){
    $("#ckan-fieldset-toggleID").toggle();
  });

     $('#ckan-form-autor_add').click(function(){
          var i = $('#ckan_autor_table tr').length + 1;
          $('#ckan_autor_table').append('<tr id="ckan-form-autor_row'+i+'"><td><input id="ckan-form-autorname'+i+'" type="text" placeholder="Enter autor name" class="form-control name_list" /></td><td><input id="ckan-form-autormail'+i+'" type="text" placeholder="Enter autor email" class="form-control name_list" /><td><button type="button" name="remove" id="ckan_btn_autor_remove'+i+'" class="btn btn-danger ckan-form-btn_remove">X</button></td></tr>');
     });
     $(document).on('click', '.ckan-form-btn_remove', function(){
          $(this).parent().parent().remove();
     });

     var i=1;
     $('#ckan-form-maintainer_add').click(function(){
          i++;
          $('#ckan_maintainer_table').append('<tr id="ckan-form-maintainer_row'+i+'"><td><input type="text" placeholder="Enter maintainer name" class="form-control name_list" /></td><td><input type="text" placeholder="Enter maintainer mail" class="form-control name_list" /></td><td><button type="button" name="remove" id="'+i+'" class="btn btn-danger ckan-form-btn_remove">X</button></td></tr>');
     });
     $(document).on('click', '.ckan-form-btn_remove', function(){
          var button_id = $(this).attr("id");
          $('#ckan-form-maintainer_row'+button_id+'').remove();
     });

     $(".ckan-tags").select2({
        tags: true,
        tokenSeparators: [',', ' ']
      });

});
