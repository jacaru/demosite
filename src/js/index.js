import { GLoginService } from './glogin.service.js';
import { GAppDataService } from './gappdata.service.js';
import { DataService } from './data.service.js';
import streambuffer from 'stream-buffers';

//SCOPES: scopes to request, as a space-delimited string. 
//CLIENT_ID: The app's client ID, found and created in the Google Developers Console.
//DISCOVERY_DOCS: are the apis that we are going to use. An array of discovery doc URLs or discovery doc JSON objects.
var SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
var CLIENT_ID = '590420372047-40a2rmare8tipsh1icu8fkvcr1fothn5.apps.googleusercontent.com';
var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
var API_KEY = 'AIzaSyAXWgBnXwEMzy-SG135fxT_vrHhlKqt7Es'

window.loginService = new GLoginService(API_KEY, CLIENT_ID, SCOPES, DISCOVERY_DOCS);
window.driveService = new GAppDataService();
window.dataService = new DataService();

var signinButton = document.getElementById('signin-button');
signinButton.onclick = signIn;
var signoutButton = document.getElementById('signout-button');
signoutButton.onclick = signOut;
var listFoldersHref = document.getElementById('list-folders-href');
listFoldersHref.onclick = listFoldersAt;
var listFilesHref = document.getElementById('list-files-href');
listFilesHref.onclick = listFilesAt
var saveHref = document.getElementById('save-href');
saveHref.onclick = loadData

//Try to automactically signin
function initClient() {
    //We pass a callback function to initClient, that return true/false if user is signin/signoff
    window.loginService.initClient(updateSigninStatus)
}

function initGapi() {
    gapi.load('client:auth2', initClient);
}
window.initGapi = initGapi

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        var useremail = window.loginService.userProfile().getEmail();
        is_auth(useremail)
    } else {
        not_auth();
    }
}

function signIn() {
    window.loginService.signIn();
}

function signOut() {
    window.loginService.signOut();
}

//variable to reference the file id that we are modified, used when updated it
window.current_file = {
    content: '',
    id: null,
    name: 'gDriveSync.example.txt',
    parents: []
};
function saveRaw() {
    window.current_file.content = $('#textEditor').val()
    window.current_file.name = 'gDriveSync.example.json'
    var jsonString = JSON.stringify(window.current_file)
    window.current_file.content = jsonString
    driveService.saveFileRaw(window.current_file, function (file) {
        window.current_file = file
        console.log('saved file with id:' + file.id)
    })
}

function loadRaw(fileId) {
    var file = window.current_file
    if (fileId) {
        file = { id: fileId }
    }
    window.driveService.loadFileRaw(file, function (file) {
        window.current_file = file;
        $('#textEditor').val(file.content);
    })
}

function save() {
    window.current_file.content = $('#textEditor').val()
    driveService.saveFile(window.current_file, function (file) {
        window.current_file = file
        console.log('saved file with id:' + file.id)
    })
}

function load(fileId) {
    var file = window.current_file
    if (fileId) {
        file = { id: fileId }
    }
    window.driveService.loadFile(file, function (file) {
        window.current_file = file;
        $('#textEditor').val(file.content);
    })
}

function listFiles() {
    window.driveService.listFiles('gDriveSync', displayList)
}

function listFilesAt() {
    var parents = $('#fileFolderId').val();
    var fileName = $('#fileName').val();
    window.driveService.listFilesAt(fileName, parents, displayList);
}

function listFoldersAt() {
    var parents = document.getElementById('folderId').value
    var folderName = document.getElementById('folderName').value
    window.driveService.listFoldersAt(folderName, parents, displayList);
}

function displayList(err, files) {
    if (err) {
        console.log('List error:' + err)
        return
    }
    $('#filesListSection ul').html("");
    $.each(files, function (index, file) {
        var newLink = $("<a />", {
            href: "#",
            class: 'file_link',
            'data-id': file.id,
            'data-name': file.name,
            onclick: 'load("' + file.id + '")',
            text: file.name
        });
        var li = $('<li/>').append(newLink).append(' | ' + file.id)

        $('#filesListSection ul').append(li)
    });
}
//Just jquery stuff to hide, show divs

function is_auth(useremail) {
    document.getElementById('not-authenticated-div').style.display = 'none';
    document.getElementById('authenticated-div').style.display = 'block';
    document.getElementById("useremail-span").textContent=useremail;
}

function not_auth() {
    document.getElementById('not-authenticated-div').style.display = 'block';
    document.getElementById('authenticated-div').style.display = 'none';
}

function loadData() {
    console.log("Test")
    var name = 'data.yaml';
    var writestream = new streambuffer.WritableStreamBuffer();
    window.driveService.loadRootFileByName(name, writestream, function() {
        var data = window.dataService.getDefaultData();
        var readstream = new streambuffer.ReadableStreamBuffer();
        readstream.put(data);
        readstream.stop();
        window.driveService.saveRootFile('data.yaml', readstream, 'application/yaml');
    });
    writestream.on('end', function() {
        console.log(writestream.getContentsAsString());
    });
}
