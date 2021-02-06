//functions for the handling of the webform
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



/*Functions for CKAN Import Functionality*/
function getSpatialBuildingInfo(){

var latitudeStr = urlController.getUrlParaValue('latitude', window.location.href, CitydbUtil);
var longitudeStr = urlController.getUrlParaValue('longitude', window.location.href, CitydbUtil);
console.log("Coordinates:");
console.log(latitudeStr);
console.log(longitudeStr);

var ckan_spatial_extent= longitudeStr + ', ' + latitudeStr;
}

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



function connect2CKAN(){
  //Function start
  console.log('Starting connection to CKAN');

  var apiKeyValue = document.getElementById("ckan-form-connection-key").value;
  var urlValue = document.getElementById("ckan-form-connection-url").value;

  console.log('CKAN URL: '+urlValue);
  console.log('CKAN API Key: '+apiKeyValue);

  var url_user = urlValue + "/api/3/action/organization_list_for_user";

//Testing connection and api key
  var xhr_user = new XMLHttpRequest();
    xhr_user.open("GET", url_user, true);
    xhr_user.setRequestHeader("Accept", "application/json");
    xhr_user.setRequestHeader("Content-Type", "application/json");
    xhr_user.setRequestHeader("Authorization", apiKeyValue);
    xhr_user.onreadystatechange = function () {
      console.log('Ready State: ' + xhr_user.readyState);
      console.log('Status: ' + xhr_user.status);
        if (xhr_user.readyState === 4 && xhr_user.status === 200) {
            var user_response = JSON.parse(xhr_user.responseText);
            console.log(user_response);

            document.getElementById("ckan-form-url").value = urlValue;
            document.getElementById("ckan-form-key").value = apiKeyValue;

            getCKANdata(urlValue,apiKeyValue);
          }
          if (xhr_user.readyState === 4 && xhr_user.status === 0) {
            alert("Connection to CKAN could not be established. Please read the error log for more information.");
            }
        };
        xhr_user.send();
}

function getCKANdata(urlValue,apiKeyValue){

  var url_user_organizations = urlValue + "/api/3/action/organization_list_for_user";
  var url_licence = urlValue + "/api/3/action/license_list";
  var url_user_groups = urlValue + "/api/3/action/group_list_authz";
  var url_groups = urlValue + "/api/3/action/group_list";
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
            console.log(group_response);
            var group_result = group_response.result;
            console.log(group_result);
            var groupList = document.getElementById("ckan-form-groups");
            removeOptions(groupList);
            for (var group in group_result) {
                console.log(group_result[group].title);

                var option = document.createElement("option");
                option.text = group_result[group].title;
                option.value = group_result[group].name;

                if(option.value == 'geoobject'){ //Setting geoobject as default, as this makes the most sense for the group in the importer
                  option.selected = true;
                }
                groupList.add(option);
            }
            if(group_result.length < 1){
            //adding default option, necessary for creating new datasets
            var option = document.createElement("option");
            option.text = 'geoobject';
            option.value = 'geoobject';
            option.selected = true;
            groupList.add(option);
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
            console.log(json_response);
            var json_result = json_response.result;
            console.log(json_result);
            var orgList = document.getElementById("ckan-form-organization");
            removeOptions(orgList);
            for (var org in json_result) {
                console.log(json_result[org].title);

                var option = document.createElement("option");
                option.text = json_result[org].display_name;
                option.value = json_result[org].name;
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
                  console.log(licence_response);
                  var licence_result = licence_response.result;
                  console.log(licence_result);
                  var licenceList = document.getElementById("ckan-form-licence");
                  removeOptions(licenceList);
                  for (var licence in licence_result) {
                      console.log(licence_result[licence].title);
                      var option = document.createElement("option");
                      option.text = licence_result[licence].title;
                      option.value = licence_result[licence].id;
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
                        console.log(tag_response);
                        var tag_result = tag_response.result;
                        console.log(tag_result);
                        var tagList = document.getElementById("ckan-tag-options");
                        removeAllChildNodes(tagList);
                        for (var tag in tag_result) {
                            console.log(tag_result[tag]);

                            var option = document.createElement("option");
                            option.value = tag_result[tag];
                            option.text = tag_result[tag];
                            tagList.appendChild(option);
                        }
                      }
                    };
                    xhr_tag.send();



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
            console.log(update_response);
            alert("An CKAN object with this ID already exists. Your changes will update the existing object.");
            CKAN_Object = update_response.result;
            loadObjectInfo2form();
          }
          //Status 200: object is not already existing -> create dataset
          if (xhr_update.readyState === 4 && xhr_update.status === 404) {
              var update_response = JSON.parse(xhr_update.responseText);
              console.log(update_response);
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

  console.log(CKAN_Object);

  /*
  var groupsValue = document.getElementById("ckan-form-groups").value;
  var spatialExtentValue = document.getElementById("ckan-form-spatial-extent").value;
  var licenceValue = document.getElementById("ckan-form-licence").value;
  var organizationValue = document.getElementById("ckan-form-organization").value;

  var visibilityValue = document.getElementById("ckan-form-visibility").value;
  var agreementValue = document.getElementById("ckan-form-licence_agreement").checked;
  var languageValue = document.querySelector('input[name="ckan-language"]:checked').value;

  var tagValues = $('#ckan-tag-options').find(':selected');
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





  document.getElementById("ckan-modal-submit-btn").innerHTML = "Update Object";
  document.getElementById("ckan-modal-connection").style.display = "none";
  document.getElementById("ckan-modal").style.display = "block";


}

function transmitCKANdata(){
  //Function start
  console.log('Starting transmitting data to CKAN');

  //getting the values of the input form fields
  var url_host = document.getElementById("ckan-form-url").value;
  var url_path = url_host + "/api/3/action/package_create";
  var url_update = url_host + "/api/3/action/package_update";
  var keyValue = document.getElementById("ckan-form-key").value;
  var typeValue = document.getElementById("ckan-form-schematype").value;
  var nameValue = document.getElementById("ckan-form-name").value;
  var groupsValue = document.getElementById("ckan-form-groups").value;
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
  //var autorNameValue = document.getElementById("ckan-form-autorname").value;
  //var autorMailValue = document.getElementById("ckan-form-autormail").value;
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
          var check = document.getElementById(col1+"_checkbox");
          if(check.checked){
            var row_string = '{"key":"'+col1+'","value": "'+col2+'"}';
            extraValues += row_string;

            if(i<tableBody_rows-1){
              extraValues +=', ';
            }
          }

      }
      extraValues +=']';

      //Getting Autor and Maintainer data from the dynamic table
      var autor_table_length = document.getElementById("ckan_autor_table").rows.length;
      var autorTable = document.getElementById("ckan_autor_table")
      var autorValues = '';
        for (var i = 0, row; row = autorTable.rows[i]; i++) {
            //iterate through rows of the tbody with the Values
              var col1 = row.cells[0].getElementsByTagName('input')[0].value;
              var col2 = row.cells[1].getElementsByTagName('input')[0].value;

                autorValues += '{\\"author\\":\\"'+col1+'\\",\\"author_email\\": \\"'+col2+'\\"}';

                if(i<autor_table_length-1){
                  autorValues +=', ';
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

    //transforming spatial data

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
      console.log(bbox_trans);
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

  //Printing out all values for debugging purposes
  console.log('CKAN URL: '+url_path);
  console.log('CKAN Key: '+keyValue);
  console.log('CKAN Schema Type: '+typeValue);
  console.log('CKAN Name: '+nameValue);
  console.log('CKAN Groups: '+groupsValue);
  console.log('CKAN Spatial Extend: '+bbox_string);
  console.log('CKAN Title: '+titleValue);
  console.log('CKAN Notes: '+noteValue);
  console.log('CKAN Extra: '+extraValues);
  console.log('CKAN Licence Id: '+licenceValue);
  console.log('CKAN Organization: '+organizationValue);
  console.log('CKAN Visibility: '+visibilityValue);
  console.log('CKAN Agreement Check: '+agreementValue);
  console.log('CKAN Language: '+languageValue);
  console.log('CKAN Version: '+versionValue);
  console.log('CKAN Begin Date: '+beginDateValue);
  console.log('CKAN End Date: '+endDateValue);
  console.log('CKAN Tags: '+tagString);
  console.log('CKAN Autor(s): '+autorValues);
  //console.log('CKAN Maintainer Name: '+maintainerNameValue);
  //console.log('CKAN Maintainer Mail: '+maintainerMailValue);

  var data;
  var url;

  if(CKAN_Object.length<1){
    console.log("Create New");
    url = url_path;

  //var data = JSON.stringify({"type":typeValue, "name":nameValue,"title":titleValue,"spatial":{"type":"Point","coordinates":[spatialExtentValue]}, "extras": [extraValues], "notes":noteValue, "end_collection_date":endDateValue,"licence_agreement":["licence_agreement_check"]});
  //data += extraValues;
  data = '{"type":"'+typeValue+'", "name":"'+nameValue+'","title":"'+titleValue+'","groups":[{"name":"'+groupsValue+'"}], "extras": '+extraValues+', "notes":"'+noteValue+'", "end_collection_date":"'+endDateValue+'","begin_collection_date":"'+beginDateValue+'","licence_agreement":["'+agreementCheck+'"],"license_id":"'+licenceValue+'","owner_org":"'+organizationValue+'","private":"'+visibilityValue+'","language":"'+languageValue+'","version":"'+versionValue+'","tags": ['+tagString+'],"spatial":"{\\"type\\":\\"MultiPolygon\\",\\"coordinates\\":[[['+bbox_string+']]]}","author": "['+autorValues+']","maintainer": "['+maintainerValues+']"}';
  //var data = JSON.stringify({"type":typeValue, "name":nameValue,"title":titleValue,"notes":noteValue, "end_collection_date":endDateValue,"begin_collection_date":beginDateValue,"licence_agreement":[agreementCheck],"license_id":licenceValue,"owner_org":organizationValue,"private":visibilityValue,"language":languageValue,"version":versionValue,"tags": [{"name": tagValue}],"spatial":'{"type":"MultiPolygon","coordinates":[['+spatialExtentValue+']]}'});
  //"spatial":{"type":"MultiPolygon","coordinates":[['+spatialExtentValue+']]},
  //"spatial":&quot;{"type":"MultiPolygon","coordinates":[[[[11.566726,48.150439],[11.56956,48.149637],[11.568143,48.147733],[11.56561,48.14832],[11.566726,48.150439]]]]}&quot;,
  //,"author": [{"author_email": "'+autorMailValue+'", "author": "'+autorNameValue+'"}],"maintainer": [{"maintainer_email": "'+maintainerMailValue+'", "maintainer": "'+maintainerNameValue+'"}]
  //"extras":[extraValues],
  //,"spatial":\'{"type":"MultiPolygon","coordinates":[[[[11.566726,48.150439],[11.56956,48.149637],[11.568143,48.147733],[11.56561,48.14832],[11.566726,48.150439]]]]}\'
  //,"maintainer": "[{\\"maintainer_email\\": \\"'+maintainerMailValue+'\\", \\"maintainer\\": \\"'+maintainerNameValue+'\\"}]"
}else{
  console.log("Update");
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
          console.log(json);
          document.getElementById("ckan_message_header").innerHTML = 'Transmission was successful';
          document.getElementById("ckan_message_paragraph").innerHTML = xhr.responseText;
        }
        if (xhr.readyState === 4 && xhr.status === 409) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);

            //Print response on message modal
            document.getElementById("ckan_message_header").innerHTML = 'Transmission failed, Error 409';
            document.getElementById("ckan_message_paragraph").innerHTML = xhr.responseText;

          }
          if (xhr.readyState === 4 && xhr.status === 404) {
              var json = JSON.parse(xhr.responseText);
              console.log(json);
              //Print response on message modal
              document.getElementById("ckan_message_header").innerHTML = 'Transmission failed, Error 404';
              document.getElementById("ckan_message_paragraph").innerHTML = xhr.responseText;
            }
            if (xhr.readyState === 4 && xhr.status === 500) {
                var json = JSON.parse(xhr.responseText);
                console.log(json);
                //Print response on message modal
                document.getElementById("ckan_message_header").innerHTML = 'Transmission failed, Error 500';
                document.getElementById("ckan_message_paragraph").innerHTML = xhr.responseText;
              }
      };
        console.log(data);
      xhr.send(data);




  //Close main importer modal and open transmission window
  document.getElementById("ckan-modal").style.display = "none";
  document.getElementById("ckan-modal-message").style.display = "block";
}
function closeCKANimporter(){
  document.getElementById("ckan-modal-message").style.display = "none";
}
