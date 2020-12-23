import { GLoginService } from './glogin.service.js';
import { DataService } from './data.service.js';
import { DateTime } from "luxon";
const Anser = require("anser");


//SCOPES: scopes to request, as a space-delimited string. 
//CLIENT_ID: The app's client ID, found and created in the Google Developers Console.
//DISCOVERY_DOCS: are the apis that we are going to use. An array of discovery doc URLs or discovery doc JSON objects.
var SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
var CLIENT_ID = '590420372047-40a2rmare8tipsh1icu8fkvcr1fothn5.apps.googleusercontent.com';
var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
var API_KEY = 'AIzaSyAXWgBnXwEMzy-SG135fxT_vrHhlKqt7Es'

window.loginService = new GLoginService(API_KEY, CLIENT_ID, SCOPES, DISCOVERY_DOCS);
window.dataService = new DataService();

var signinButton = document.getElementById('signin-button');
signinButton.onclick = signIn;
var signoutButton = document.getElementById('signout-button');
signoutButton.onclick = signOut;
var configButton = document.getElementById('config-button');
configButton.onclick = toggleConfig;

document.getElementById('date-input').onchange = loadDayTable;

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

async function is_auth(useremail) {
    document.getElementById('not-authenticated-div').style.display = 'none';
    document.getElementById('authenticated-div').style.display = 'block';
    document.getElementById("useremail-span").textContent=useremail;
    window.dataService = new DataService();
    await window.dataService.loadData();
    onDataLoad();    
}

function not_auth() {
    document.getElementById('not-authenticated-div').style.display = 'block';
    document.getElementById('authenticated-div').style.display = 'none';
    document.getElementById('loading-div').style.display = 'block';
    document.getElementById('loaded-div').style.display = 'none';
    window.dataService = null
}

function setCalendar() {
    var period = dataService.getPeriod();
    var minDate = DateTime.local().minus({days: period}).toISODate();
    document.getElementById('date-input').min = minDate;
}

function onDataLoad() {
    setCalendar();
    document.getElementById('loading-div').style.display = 'none';
    document.getElementById('loaded-div').style.display = 'block'; 
}

async function toggleConfig() {
    var configDiv = document.getElementById('config-div')
    if (configDiv.style.display == 'block') {
        configDiv.style.display = 'none'
        configButton.textContent = 'Mostrar Reglas'
    } else {
        document.getElementById('data-pre').textContent = await window.dataService.loadData();
        configDiv.style.display = 'block'
        configButton.textContent = 'Ocultar Reglas'
    }
}

function loadDayTable() {
    var date = DateTime.fromISO(document.getElementById('date-input').value);
    var timetable = window.dataService.getTimetable(date);
    var html = Anser.ansiToHtml(timetable);
    document.getElementById('day-table-pre').innerHTML = html;
}

