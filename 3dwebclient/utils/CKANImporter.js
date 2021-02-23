/*
  * CKAN Importer Tool
  * Developed by Ann-Katrin Frank, Georg Eckert and Lucas Angermann
  * Technical University of Munich, winter term 2020/21
*/

//functions for the handling of the webform

//jQuery functions
$(document).ready(function(){

  //toggle button for additional input fields
  $("#ckan-form-toggleadditionalcategoriesbutton").click(function(){
    $("#ckan-fieldset-toggleID").toggle();
  });

    //Functionality for the adding or removal of author information
    $('#ckan-form-author_add').click(function(){
          var i = $('#ckan_author_table tr').length + 1;
          $('#ckan_author_table').append('<tr id="ckan-form-author_row'+i+'"><td><input id="ckan-form-authorname'+i+'" type="text" placeholder="Enter author name" class="form-control name_list ckan-input-field" /></td><td><input id="ckan-form-authormail'+i+'" type="text" placeholder="Enter author email" class="form-control name_list ckan-input-field" /><td><button type="button" name="remove" id="ckan_btn_author_remove'+i+'" class="btn btn-danger ckan-form-btn_remove">X</button></td></tr>');
     });
     $(document).on('click', '.ckan-form-btn_remove', function(){
          $(this).parent().parent().remove();
     });

     //Functionality for the adding or removal of maintainer information
     $('#ckan-form-maintainer_add').click(function(){
          var j = $('#ckan_maintainer_table tr').length + 1;
          $('#ckan_maintainer_table').append('<tr id="ckan-form-maintainer_row'+j+'"><td><input type="text" placeholder="Enter maintainer name" class="form-control name_list ckan-input-field" /></td><td><input type="text" placeholder="Enter maintainer email" class="form-control name_list ckan-input-field" /></td><td><button type="button" name="remove" id="ckan_btn_maintainer_remove'+j+'" class="btn btn-danger ckan-form-btn_remove">X</button></td></tr>');
     });
     $(document).on('click', '.ckan-form-btn_remove', function(){
          var button_id = $(this).attr("id");
          $(this).parent().parent().remove();
     });

     //Initialization of the multiselct input fields for topics and tags. In the tag input new suggestions can be added. See https://select2.org/ for detailed documentation.
     $(".ckan-tags").select2({
        tags: true,
        tokenSeparators: [',', ' ']
      });

    $('.ckan-basic-multiple').select2();


});

//change toggle button text when clicked
function ckan_toggle_button_text() {
  var x = document.getElementById("ckan-form-toggleadditionalcategoriesbutton");
  if (x.innerHTML === "Show additional input categories") {
    x.innerHTML = "Hide additional input categories";
  } else {
    x.innerHTML = "Show additional input categories";
  }
}

//Remove entries of author and maintainer fields on new form load
function ckan_clear_entries(){
    $('#ckan_author_table').find("tr:gt(0)").remove();
    $('#ckan_maintainer_table').find("tr:gt(0)").remove();
}


//Function for getting window location coordinates. Not used in later version of the tool.
function getSpatialBuildingInfo(){

var latitudeStr = urlController.getUrlParaValue('latitude', window.location.href, CitydbUtil);
var longitudeStr = urlController.getUrlParaValue('longitude', window.location.href, CitydbUtil);
/*console.debug("Coordinates:");
console.debug(latitudeStr);
console.debug(longitudeStr);*/
var ckan_spatial_extent= longitudeStr + ', ' + latitudeStr;
}

//Closing the modals, when an outside area is clicked. Not used in later versions.
var modal = document.getElementById("ckan-modal");
var modal_connection = document.getElementById("ckan-modal-connection");
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    document.getElementById('ckan-attribute-table-body').innerHTML = '';
  }
}
window.onclick = function(event) {
  if (event.target == modal_connection) {
    modal_connection.style.display = "none";
  }
}

//Functions for removing existing values in drop down lists
function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
      selectElement.remove(i);
    }
  }

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

//Function is called with submission of first modal. Connection to CKAN is tested and established.
function connect2CKAN(){
  //Function start
  console.debug('Starting connection to CKAN');
  //Getting connection parameters from form
  var apiKeyValue = document.getElementById("ckan-form-connection-key").value;
  var urlValue = document.getElementById("ckan-form-connection-url").value;

  //Remove trailing slash in URL
  urlValue = urlValue.replace(/\/$/, "");

  console.debug('CKAN URL: '+urlValue);
  console.debug('CKAN API Key: '+apiKeyValue);

  //Adding path to url in order to access user dependent organization list.
  //If CKAN provides an authentification API in the future, here were the place to implement it.
  var url_user = urlValue + "/api/3/action/organization_list_for_user";

  //XMLHttpRequest to request user dependent organization list. This is done to 1. check if the url and 2. if the API Key is correct.
  var xhr_user = new XMLHttpRequest();
    xhr_user.open("GET", url_user, true);
    xhr_user.setRequestHeader("Accept", "application/json");
    xhr_user.setRequestHeader("Content-Type", "application/json");
    xhr_user.setRequestHeader("Authorization", apiKeyValue);
    xhr_user.onreadystatechange = function () {
        if (xhr_user.readyState === 4 && xhr_user.status === 200) {
            var user_response = JSON.parse(xhr_user.responseText);
            console.debug(user_response);
            var user_org_list = user_response.result;

            //Connection was successful and list is not empty.
            if(user_org_list.length > 0){
              //Connection parameters are forewarded to the next modal
              document.getElementById("ckan-form-url").value = urlValue;
              document.getElementById("ckan-form-key").value = apiKeyValue;

              //Function for retrieving list values is called
              getCKANdata(urlValue,apiKeyValue);

            //If the list is empty, then the API Key is wrong or has no permission to request data
          }else{
            alert("Connection to CKAN could not be established. Please check CKAN URL and API Key. Read the error log for more information.");

          }

          }
          //Provided URL is not correct, or CKAN instance is not ready
          if (xhr_user.readyState === 4 && xhr_user.status === 0) {
            alert("Connection to CKAN could not be established. Please check CKAN URL and API Key. Read the error log for more information.");

            }
            //Access is not permittet. This case is not happening, as CKAN does not return an 401 error but an empty list instead.
          if (xhr_user.readyState === 4 && xhr_user.status === 401) {
            alert("Connection to CKAN could not be established. Error 401 Unauthorized. Please read the error log for more information.");

            }
        };
        xhr_user.send();




}

//Due to a bug, we have to define all values of the main category and the topic in two list. Later, when the data is fetched from CKAN, together with the list is decided, which kind of category a group is in
//Ideally this would be improved by CKAN in the future in a way, that a group can be recognized as main category or topic.
var group_main_categories = ["geoobject","dataset","online-service","project","software","online-application","method","device"];
var group_topics = ["administration","urban-planning","environment","health","energy","information-technology","living","education","work","trade","construction","culture","mobility","agriculture","craft"];

//CKAN_User_Org stores the existing data of all user dependent organizations
var CKAN_User_Org;

//Function for retrieving data from CKAN to fill the lists in the form.
function getCKANdata(urlValue,apiKeyValue){

  //Paths to the different lists
  var url_user_organizations = urlValue + "/api/3/action/organization_list_for_user";
  var url_licence = urlValue + "/api/3/action/license_list";
  var url_user_groups = urlValue + "/api/3/action/group_list_authz";
  var url_groups = urlValue + "/api/3/action/group_list"; //Not used later, as a group, which the current user has no access to, cannot be submittet.
  var url_tags = urlValue + "/api/3/action/tag_list";



  //Fetching Group List
  var xhr_group = new XMLHttpRequest();
    xhr_group.open("GET", url_user_groups, true);
    xhr_group.setRequestHeader("Accept", "application/json");
    xhr_group.setRequestHeader("Content-Type", "application/json");
    xhr_group.setRequestHeader("Authorization", apiKeyValue);
    xhr_group.onreadystatechange = function () {
        if (xhr_group.readyState === 4 && xhr_group.status === 200) {
            var group_response = JSON.parse(xhr_group.responseText);
            console.debug(group_response);
            var group_result = group_response.result;
            console.debug(group_result);

            //Addressing the select input fields of the main category and topics.
            var maincategoryList = document.getElementById("ckan-form-maincategory");
            var topicList = document.getElementById("ckan-form-topic");

            //Remove existing values to prevent duplicate entries
            removeAllChildNodes(maincategoryList);
            removeAllChildNodes(topicList);

            //Creating new entries with fetched list
            for (var group in group_result) {
                console.debug(group_result[group].title);
                var option = document.createElement("option");
                option.text = group_result[group].title;
                option.value = group_result[group].name;
                option.id = 'ckan-group-' + group_result[group].name;

                //Divide groups into main categories and topics with preknown list values. It is not possible at the moment to read from the fetched data which type of group an entrie is.
                if(group_topics.includes(group_result[group].name)){
                  topicList.appendChild(option);
                }
                if(group_main_categories.includes(group_result[group].name)){
                  if(group_result[group].name == 'geoobject'){ //Setting geoobject as default, as this makes the most sense for the group in the importer
                    option.selected = true;
                  }
                  maincategoryList.appendChild(option);
                }

            }
          }

        };
        xhr_group.send();

  //Fetching Organization List
  var xhr_c2C = new XMLHttpRequest();
    xhr_c2C.open("GET", url_user_organizations, true);
    xhr_c2C.setRequestHeader("Accept", "application/json");
    xhr_c2C.setRequestHeader("Content-Type", "application/json");
    xhr_c2C.setRequestHeader("Authorization", apiKeyValue);
    xhr_c2C.onreadystatechange = function () {
        if (xhr_c2C.readyState === 4 && xhr_c2C.status === 200) {
            var json_response = JSON.parse(xhr_c2C.responseText);
            console.debug(json_response);
            CKAN_User_Org = json_response.result;
            console.debug(CKAN_User_Org);
            var orgList = document.getElementById("ckan-form-organization");
            removeOptions(orgList);
            for (var org in CKAN_User_Org) {
                console.debug(CKAN_User_Org[org].title);

                var option = document.createElement("option");
                option.text = CKAN_User_Org[org].display_name;
                option.value = CKAN_User_Org[org].name;
                option.id = 'ckan-organization-' + CKAN_User_Org[org].name;
                orgList.add(option);
            }


          }
        };
        xhr_c2C.send();


        //Fetching Licence List
        var xhr_licence = new XMLHttpRequest();
          xhr_licence.open("GET", url_licence, true);
          xhr_licence.setRequestHeader("Accept", "application/json");
          xhr_licence.setRequestHeader("Content-Type", "application/json");
          //xhr_licence.setRequestHeader("Authorization", apiKeyValue);
          xhr_licence.onreadystatechange = function () {
              if (xhr_licence.readyState === 4 && xhr_licence.status === 200) {
                  var licence_response = JSON.parse(xhr_licence.responseText);
                  console.debug(licence_response);
                  var licence_result = licence_response.result;
                  console.debug(licence_result);
                  var licenceList = document.getElementById("ckan-form-licence");
                  removeOptions(licenceList);
                  for (var licence in licence_result) {
                      console.debug(licence_result[licence].title);

                      var option = document.createElement("option");
                      option.text = licence_result[licence].title;
                      option.value = licence_result[licence].id;
                      option.id = 'ckan-license-' + licence_result[licence].id;
                      licenceList.add(option);
                  }

                }
              };
              xhr_licence.send();

              //Fetching Tag List
              var xhr_tag = new XMLHttpRequest();
                xhr_tag.open("GET", url_tags, true);
                xhr_tag.setRequestHeader("Accept", "application/json");
                xhr_tag.setRequestHeader("Content-Type", "application/json");
                //xhr_tag.setRequestHeader("Authorization", apiKeyValue);
                xhr_tag.onreadystatechange = function () {
                    if (xhr_tag.readyState === 4 && xhr_tag.status === 200) {
                        var tag_response = JSON.parse(xhr_tag.responseText);
                        console.debug(tag_response);
                        var tag_result = tag_response.result;
                        console.debug(tag_result);
                        var tagList = document.getElementById("ckan-tag-options");
                        removeAllChildNodes(tagList);
                        for (var tag in tag_result) {
                            console.debug(tag_result[tag]);

                            var option = document.createElement("option");
                            option.value = tag_result[tag];
                            option.text = tag_result[tag];
                            option.id = 'ckan-tag-' + tag_result[tag];
                            //option.selected = true;
                            tagList.appendChild(option);
                        }
                      }
                    };
                    xhr_tag.send();


  //Clear values in Author and Maintainer fields
  ckan_clear_entries();
  //Load existing data of dataset
    loadDataset(urlValue,apiKeyValue);

}

//Load information of existing dataset into the webform in order to update the information
//CKAN_Object stores the existing data of an object needed for the update
var CKAN_Object;
function loadDataset(url,key){

  var id = document.getElementById("ckan-form-name").value;
  var url_update = url + "/api/3/action/package_show?id=" + id;

  var xhr_update = new XMLHttpRequest();
    xhr_update.open("GET", url_update, true);
    xhr_update.setRequestHeader("Accept", "application/json");
    xhr_update.setRequestHeader("Content-Type", "application/json");
    xhr_update.setRequestHeader("Authorization", key);
    xhr_update.onreadystatechange = function () {
      //Status 200: object is already existing -> update dataset
        if (xhr_update.readyState === 4 && xhr_update.status === 200) {
            var update_response = JSON.parse(xhr_update.responseText);
            console.debug(update_response);
            alert("An CKAN object with this ID already exists. Your changes will update the existing object.");

              document.getElementById("ckan-modal-submit-btn").innerHTML = "Update Object";
              document.getElementById("ckan-modal-connection").style.display = "none";
              document.getElementById("ckan-modal").style.display = "block";
              CKAN_Object = update_response.result;
              loadObjectInfo2form();
          }
          //Status 404: object is not already existing -> create new dataset
          if (xhr_update.readyState === 4 && xhr_update.status === 404) {
              var update_response = JSON.parse(xhr_update.responseText);
              console.debug(update_response);
              CKAN_Object = '';
                document.getElementById("ckan-modal-submit-btn").innerHTML = "Create New Object";
                document.getElementById("ckan-modal-connection").style.display = "none";
                document.getElementById("ckan-modal").style.display = "block";
            }
        };
        xhr_update.send();

}

//Loading selected object data into webform
function loadObjectInfo2form(){

  console.debug(CKAN_Object);

  /*
  var maincategoryValue = document.getElementById("ckan-form-groups").value;
  */
  if (typeof CKAN_Object.type !== 'undefined'){
  document.getElementById("ckan-form-schematype").value = CKAN_Object.type;
  }
  if (typeof CKAN_Object.name !== 'undefined'){
  document.getElementById("ckan-form-name").value = CKAN_Object.name;
  }
  if (typeof CKAN_Object.title !== 'undefined'){
  document.getElementById("ckan-form-title").value = CKAN_Object.title;
  }
  if (typeof CKAN_Object.notes !== 'undefined'){
  document.getElementById("ckan-form-descriptionnotes").value = CKAN_Object.notes;
  }
  if (typeof CKAN_Object.version !== 'undefined'){
  document.getElementById("ckan-form-version").value = CKAN_Object.version;
  }
  if (typeof CKAN_Object.begin_collection_date !== 'undefined'){
  document.getElementById("ckan-form-individualbeginncollectiondate").value = CKAN_Object.begin_collection_date;
  }
  if (typeof CKAN_Object.end_collection_date !== 'undefined'){
  document.getElementById("ckan-form-individualendcollectiondate").value = CKAN_Object.end_collection_date;
  }
  if (typeof CKAN_Object.extras !== 'undefined'){
    var extra_data = CKAN_Object.extras;
    var ckan_table = document.getElementById("ckan-attribute-table-body");

    for(var meta in extra_data){
    var ckan_row = ckan_table.insertRow(0);
    var cell1 = ckan_row.insertCell(0);
    var cell2 = ckan_row.insertCell(1);
    var cell3 = ckan_row.insertCell(2);
    var cell4 = ckan_row.insertCell(3);
    cell1.innerHTML = extra_data[meta].key;
    cell2.innerHTML = extra_data[meta].value;
    cell3.innerHTML = '<input type="checkbox" >';
    cell4.innerHTML = 'Old Value';
  }
  }
  if (typeof CKAN_Object.license_id !== 'undefined'){
    document.getElementById("ckan-license-" + CKAN_Object.license_id).selected = true;
  }

  if (typeof CKAN_Object.organization !== 'undefined'){
    document.getElementById("ckan-organization-" + CKAN_Object.organization.name).selected = true;
  }


  if (typeof CKAN_Object.language !== 'undefined'){
    if(CKAN_Object.language == 'de'){
      document.getElementById("ckan-form-language-de").checked = true;
    }
    if(CKAN_Object.language == 'en'){
      document.getElementById("ckan-form-language-en").checked = true;
    }

  }
  if (typeof CKAN_Object.private !== 'undefined'){
    if(CKAN_Object.private == true){
      document.getElementById("ckan-form-visibility-true").selected = true;
    }
    if(CKAN_Object.private == false){
      document.getElementById("ckan-form-visibility-false").selected = true;
    }

  }

  if (typeof CKAN_Object.tags !== 'undefined'){
    var tag_list = CKAN_Object.tags;
    var tagList = document.getElementById("ckan-tag-options");
    for(tag in tag_list){
    document.getElementById("ckan-tag-" + tag_list[tag].name).remove();
    var option = document.createElement("option");
    option.value = tag_list[tag].name;
    option.text = tag_list[tag].name;
    option.id = 'ckan-tag-' + tag_list[tag].name;
    option.selected = true;
    tagList.appendChild(option);
    console.debug('Tag Name: ' + tag_list[tag].name);
    }

  }

  if (typeof CKAN_Object.author !== 'undefined'){
    var author_list = JSON.parse(CKAN_Object.author);
    for(author in author_list){
      if(author_list[author].author !== ""){
        var i = $('#ckan_author_table tr').length + 1;
        $('#ckan_author_table').append('<tr id="ckan-form-author_row'+i+'"><td><input id="ckan-form-authorname'+i+'" type="text" placeholder="Enter author name" class="form-control name_list ckan-input-field" value="'+author_list[author].author+'" /></td><td><input id="ckan-form-authormail'+i+'" type="text" placeholder="Enter author email" class="form-control name_list ckan-input-field" value="'+author_list[author].author_email+'" /><td><button type="button" name="remove" id="ckan_btn_author_remove'+i+'" class="btn btn-danger ckan-form-btn_remove">X</button></td></tr>');
        }
      }
  }

  if (typeof CKAN_Object.maintainer !== 'undefined'){
    var maintainer_list = JSON.parse(CKAN_Object.maintainer);
    for(maintainer in maintainer_list){
      if(maintainer_list[maintainer].maintainer !== ""){
        var j = $('#ckan_maintainer_table tr').length + 1;
        $('#ckan_maintainer_table').append('<tr id="ckan-form-maintainer_row'+j+'"><td><input type="text" placeholder="Enter maintainer name" class="form-control name_list ckan-input-field" value="'+maintainer_list[maintainer].maintainer+'" /></td><td><input type="text" placeholder="Enter maintainer email" class="form-control name_list ckan-input-field" value="'+maintainer_list[maintainer].maintainer_email+'" /></td><td><button type="button" name="remove" id="ckan_btn_maintainer_remove'+j+'" class="btn btn-danger ckan-form-btn_remove">X</button></td></tr>');
      }
    }
  }

  if (typeof CKAN_Object.groups !== 'undefined'){
    var groupList = CKAN_Object.groups;
    for(group in groupList){
      if(group_main_categories.includes(groupList[group].name)){
        document.getElementById("ckan-group-"+groupList[group].name).selected = true;
      }
      if(group_topics.includes(groupList[group].name)){
      document.getElementById("ckan-group-" + groupList[group].name).remove();
      var topicList = document.getElementById("ckan-form-topic");
      var option = document.createElement("option");
      option.text = groupList[group].title;
      option.value = groupList[group].name;
      option.id = 'ckan-group-' + groupList[group].name;
      option.selected = true;
      topicList.appendChild(option);
      console.debug('Topic Name: ' + groupList[group].name);
    }

  }
}





  document.getElementById("ckan-modal-submit-btn").innerHTML = "Update Object";
  document.getElementById("ckan-modal-connection").style.display = "none";
  document.getElementById("ckan-modal").style.display = "block";


}

function transmitCKANdata(){
  //Function start
  console.debug('Starting transmitting data to CKAN');

  //getting the values of the input form fields
  var url_host = document.getElementById("ckan-form-url").value;
  var url_path = url_host + "/api/3/action/package_create";
  var url_update = url_host + "/api/3/action/package_update";
  var keyValue = document.getElementById("ckan-form-key").value;
  var typeValue = document.getElementById("ckan-form-schematype").value;
  var nameValue = document.getElementById("ckan-form-name").value;
  var maincategoryValue = document.getElementById("ckan-form-maincategory").value;
  var spatialExtentValue = document.getElementById("ckan-form-spatial-extent").value;
  var titleValue = document.getElementById("ckan-form-title").value;
  var noteValue = document.getElementById("ckan-form-descriptionnotes").value;
  var licenceValue = document.getElementById("ckan-form-licence").value;
  var organizationValue = document.getElementById("ckan-form-organization").value;
  var visibilityValue = document.getElementById("ckan-form-visibility").value;
  var agreementValue = document.getElementById("ckan-form-licence_agreement").checked;
  var languageValue = document.querySelector('input[name="ckan-language"]:checked').value;
  var versionValue = document.getElementById("ckan-form-version").value;
  var beginDateValue = document.getElementById("ckan-form-individualbeginncollectiondate").value;
  var endDateValue = document.getElementById("ckan-form-individualendcollectiondate").value;
  var tagValues = $('#ckan-tag-options').find(':selected');
  var topicValues = $('#ckan-form-topic').find(':selected');
  //var authorNameValue = document.getElementById("ckan-form-authorname").value;
  //var authorMailValue = document.getElementById("ckan-form-authormail").value;
  //var maintainerNameValue = document.getElementById("ckan-form-maintainername").value;
  //var maintainerMailValue = document.getElementById("ckan-form-maintainermail").value;



  //getting meta data values from the table (only checked values)
  var tableBody = document.getElementById("ckan-attribute-table-body");
  var tableBody_rows = document.getElementById("ckan-attribute-table-body").rows.length;
  var extraValues = '[';
    for (var i = 0, row; row = tableBody.rows[i]; i++) {
        //iterate through rows of the tbody with the Values
          var col1 = row.cells[0].innerHTML;
          var col2 = row.cells[1].innerHTML;

          //check if checked
          var check = row.cells[2].getElementsByTagName('input')[0];
          if(check.checked){
            var row_string = '{"key":"'+col1+'","value": "'+col2+'"}';
            extraValues += row_string;

            if(i<tableBody_rows-1){
              extraValues +=', ';
            }
          }

      }
      extraValues +=']';
      console.debug(extraValues);

      //Getting author and Maintainer data from the dynamic table
      var author_table_length = document.getElementById("ckan_author_table").rows.length;
      var authorTable = document.getElementById("ckan_author_table")
      var authorValues = '';
        for (var i = 0, row; row = authorTable.rows[i]; i++) {
            //iterate through rows of the tbody with the Values
              var col1 = row.cells[0].getElementsByTagName('input')[0].value;
              var col2 = row.cells[1].getElementsByTagName('input')[0].value;

                authorValues += '{\\"author\\":\\"'+col1+'\\",\\"author_email\\": \\"'+col2+'\\"}';

                if(i<author_table_length-1){
                  authorValues +=', ';
                }
          }

          var maintainer_table_length = document.getElementById("ckan_maintainer_table").rows.length;
          var maintainerTable = document.getElementById("ckan_maintainer_table")
          var maintainerValues = '';
            for (var i = 0, row; row = maintainerTable.rows[i]; i++) {
                //iterate through rows of the tbody with the Values
                  var col1 = row.cells[0].getElementsByTagName('input')[0].value;
                  var col2 = row.cells[1].getElementsByTagName('input')[0].value;

                    maintainerValues += '{\\"maintainer\\":\\"'+col1+'\\",\\"maintainer_email\\": \\"'+col2+'\\"}';

                    if(i<maintainer_table_length-1){
                      maintainerValues +=', ';
                    }
              }

    //check licence agreementValue
    var agreementCheck = '';
    if(agreementValue){
      agreementCheck ='licence_agreement_check';
    }

    //transforming spatial data, see reference: https://github.com/tum-gis/3DCityDB4BIM

    var bboxArray = spatialExtentValue.replace(/[{()}]/g, '')  // removes () at start and end
                .split(' ')                         // splits into coord sets
                .map((set) =>                       // splits every coord set and converts into numbers
                    set.split(',')
                    .map(Number)
                );
    var bbox_string = '';
    proj4.defs("EPSG:31468","+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs");
    for (var i in bboxArray) {
      if(bboxArray[i].length > 2){
        bboxArray[i].pop();
      }
      var bbox_trans = proj4('EPSG:31468', 'EPSG:4326', bboxArray[i]);
      console.debug(bbox_trans);
      bbox_string += '['+bbox_trans+']';
      if(i<bboxArray.length-1){
        bbox_string += ', ';
      }
      }


      //Formatting tag Values
      var tagString = '';
      var tagNum = tagValues.length;
      for (var j = 0; j < tagNum; j++) {
          tagString += '{"name": "'+tagValues[j].value+'"}';
          if(j<tagNum-1){
            tagString += ', ';
          }
        }

        //Formatting group topic Values
        var topicString = '';
        var topicNum = topicValues.length;
        for (var k = 0; k < topicNum; k++) {
            topicString += '{"name": "'+topicValues[k].value+'"}';
            if(k<topicNum-1){
              topicString += ', ';
            }
          }

        //Putting together group main category and topics
        groupsString = '{"name": "'+maincategoryValue+'"}';
        if(topicString.length > 0){
          groupsString += ', ' + topicString
        }

  //Printing out all values for debugging purposes
  console.debug('CKAN URL: '+url_path);
  console.debug('CKAN Key: '+keyValue);
  console.debug('CKAN Schema Type: '+typeValue);
  console.debug('CKAN Name: '+nameValue);
  console.debug('CKAN Groups: '+groupsString);
  console.debug('CKAN Spatial Extend: '+bbox_string);
  console.debug('CKAN Title: '+titleValue);
  console.debug('CKAN Notes: '+noteValue);
  console.debug('CKAN Extra: '+extraValues);
  console.debug('CKAN Licence Id: '+licenceValue);
  console.debug('CKAN Organization: '+organizationValue);
  console.debug('CKAN Visibility: '+visibilityValue);
  console.debug('CKAN Agreement Check: '+agreementValue);
  console.debug('CKAN Language: '+languageValue);
  console.debug('CKAN Version: '+versionValue);
  console.debug('CKAN Begin Date: '+beginDateValue);
  console.debug('CKAN End Date: '+endDateValue);
  console.debug('CKAN Tags: '+tagString);
  console.debug('CKAN author(s): '+authorValues);
  //console.debug('CKAN Maintainer Name: '+maintainerNameValue);
  //console.debug('CKAN Maintainer Mail: '+maintainerMailValue);

  var data;
  var url;

  if(CKAN_Object.length<1){
    console.debug("Create New");
    url = url_path;

  //var data = JSON.stringify({"type":typeValue, "name":nameValue,"title":titleValue,"spatial":{"type":"Point","coordinates":[spatialExtentValue]}, "extras": [extraValues], "notes":noteValue, "end_collection_date":endDateValue,"licence_agreement":["licence_agreement_check"]});
  //data += extraValues;
  data = '{"type":"'+typeValue+'", "name":"'+nameValue+'","title":"'+titleValue+'","groups":['+groupsString+'], "extras": '+extraValues+', "notes":"'+noteValue+'", "end_collection_date":"'+endDateValue+'","begin_collection_date":"'+beginDateValue+'","licence_agreement":["'+agreementCheck+'"],"license_id":"'+licenceValue+'","owner_org":"'+organizationValue+'","private":"'+visibilityValue+'","language":"'+languageValue+'","version":"'+versionValue+'","tags": ['+tagString+'],"spatial":"{\\"type\\":\\"MultiPolygon\\",\\"coordinates\\":[[['+bbox_string+']]]}","author": "['+authorValues+']","maintainer": "['+maintainerValues+']"}';
  //var data = JSON.stringify({"type":typeValue, "name":nameValue,"title":titleValue,"notes":noteValue, "end_collection_date":endDateValue,"begin_collection_date":beginDateValue,"licence_agreement":[agreementCheck],"license_id":licenceValue,"owner_org":organizationValue,"private":visibilityValue,"language":languageValue,"version":versionValue,"tags": [{"name": tagValue}],"spatial":'{"type":"MultiPolygon","coordinates":[['+spatialExtentValue+']]}'});
  //"spatial":{"type":"MultiPolygon","coordinates":[['+spatialExtentValue+']]},
  //"spatial":&quot;{"type":"MultiPolygon","coordinates":[[[[11.566726,48.150439],[11.56956,48.149637],[11.568143,48.147733],[11.56561,48.14832],[11.566726,48.150439]]]]}&quot;,
  //,"author": [{"author_email": "'+authorMailValue+'", "author": "'+authorNameValue+'"}],"maintainer": [{"maintainer_email": "'+maintainerMailValue+'", "maintainer": "'+maintainerNameValue+'"}]
  //"extras":[extraValues],
  //,"spatial":\'{"type":"MultiPolygon","coordinates":[[[[11.566726,48.150439],[11.56956,48.149637],[11.568143,48.147733],[11.56561,48.14832],[11.566726,48.150439]]]]}\'
  //,"maintainer": "[{\\"maintainer_email\\": \\"'+maintainerMailValue+'\\", \\"maintainer\\": \\"'+maintainerNameValue+'\\"}]"
}else{
  console.debug("Update");
  url = url_update;

  //Replacing the old values
  CKAN_Object.type = typeValue;
  CKAN_Object.name = nameValue;
  CKAN_Object.title = titleValue;
  CKAN_Object.notes = noteValue;
  CKAN_Object.version = versionValue;
  CKAN_Object.begin_collection_date = beginDateValue;
  CKAN_Object.end_collection_date = endDateValue;
  CKAN_Object.spatial = '{\"type\":\"MultiPolygon\",\"coordinates\":[[['+bbox_string+']]]}';
  CKAN_Object.extras = JSON.parse(extraValues);
  CKAN_Object.license_id = licenceValue;
  CKAN_Object.language = languageValue;
  CKAN_Object.private = visibilityValue;
  CKAN_Object.organization = CKAN_User_Org.find( function(org) { return org.name == organizationValue } );
  CKAN_Object.owner_org = CKAN_User_Org.find( function(org) { return org.name == organizationValue } ).id;
  CKAN_Object.tags = JSON.parse('['+tagString+']');
  CKAN_Object.author = '['+authorValues.replace(/\\/g, '')+']';
  CKAN_Object.maintainer = '['+maintainerValues.replace(/\\/g, '')+']';
  CKAN_Object.groups = JSON.parse('['+groupsString+']');

  data = JSON.stringify(CKAN_Object);

}



  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", keyValue);
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          console.debug(json);
          document.getElementById("ckan_message_header").innerHTML = 'Transmission was successful';
          //document.getElementById("ckan_message_paragraph").innerHTML = xhr.responseText;
        }
        if (xhr.readyState === 4 && xhr.status === 409) {
            var json = JSON.parse(xhr.responseText);
            console.debug(json);

            //Print response on message modal
            document.getElementById("ckan_message_header").innerHTML = 'Transmission failed, Conflict Error 409';
            document.getElementById("ckan_message_paragraph").innerHTML = xhr.responseText;

          }
          if (xhr.readyState === 4 && xhr.status === 404) {
              var json = JSON.parse(xhr.responseText);
              console.debug(json);
              //Print response on message modal
              document.getElementById("ckan_message_header").innerHTML = 'Transmission failed, Not Found Error 404';
              document.getElementById("ckan_message_paragraph").innerHTML = xhr.responseText;
            }
            if (xhr.readyState === 4 && xhr.status === 400) {
                var json = JSON.parse(xhr.responseText);
                console.debug(json);
                //Print response on message modal
                document.getElementById("ckan_message_header").innerHTML = 'Transmission failed, Bad Request Error 400';
                document.getElementById("ckan_message_paragraph").innerHTML = xhr.responseText;
              }
            if (xhr.readyState === 4 && xhr.status === 500) {
                var json = JSON.parse(xhr.responseText);
                console.debug(json);
                //Print response on message modal
                document.getElementById("ckan_message_header").innerHTML = 'Transmission failed, Internal Server Error Error 500';
                document.getElementById("ckan_message_paragraph").innerHTML = xhr.responseText;
              }
      };
        console.debug(data);
      xhr.send(data);




  //Close main importer modal and open transmission window
  document.getElementById("ckan-modal").style.display = "none";
  document.getElementById("ckan-modal-message").style.display = "block";
}
function closeCKANimporter(){
  document.getElementById("ckan-modal-message").style.display = "none";
  location.reload();
}
