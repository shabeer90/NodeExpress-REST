/**
 * Created by ShabeerSheffa on 08/07/2015.
 */

// Userlist data array for filling in info box

var userListData = [];

$(document).ready(function () {
    populateTable();

    // Username link click
    $('#userList table tbody').on('click', 'td a.linkShowUser', showUserInfo);

    // Add user button click
    $('#btnAddUser').on('click', addUser);

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
});

function populateTable() {
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON('users/userlist', function (data) {
        // Stick our user data array into a userlist variable in the global object
        userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function () {
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkShowUser" rel="' + this.username + '">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
}

function showUserInfo(event) {
    // Prevent link from fireing
    event.preventDefault();

    // Retreive username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get index of Object based on ID value
    var arrayPosition = userListData.map(function (arrayItems) {
        return arrayItems.username;
    }).indexOf(thisUserName);

    // Get out User Object
    var thisUserObject = userListData[arrayPosition];

    // Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfogender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);
}

function addUser(event) {
    // Prevent link from fireing
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function (index, val) {
        if ($(this).val() === '') {
            errorCount++;
        }
    });

    // Check and make sure errorCount's still at zero
    if (errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        };

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function (response) {
            if (response.msg === '') {
                // Clear the form inputs
                $('#addUser fieldset input').val();

                // Update the table
                populateTable();
            } else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    } else {
        alert('Please fill in all details');
        return false;
    }
}


function deleteUser(event) {
    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {
        //if they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function (response) {

            if (response.msg === '') {
            } else {
                alert('Error: ' + response.msg);
            }
            // Update the table
            populateTable();
        });
    } else {
        return false;
    }
}