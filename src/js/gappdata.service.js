import UploaderForGoogleDrive from './gupload.js';

function GAppDataService() {

  this.dataMeta = null;

  this.getDataMeta = function() {
    if (this.dataMeta) {
        return Promise.resolve(this.dataMeta)
    }
    return gapi.client.drive.files.list({
      pageSize: 1,
      q: 'name = "data.yaml"',
      spaces: 'appDataFolder',
      orderBy: 'modifiedTime desc',
      parents: ['appDataFolder'] 
    }).then((response) => {
      var files = response.result.files;
      if (files && files.length > 0) {
        this.dataMeta = files[0];
        return this.dataMeta;
      }
      return null;
    });
  }
 
  this.saveData = function(data) {
    return this.getDataMeta().then((dataMeta) => {
      return UploaderForGoogleDrive({
        token: gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token,
        fileId: dataMeta ? dataMeta.id : null,
        file: new Blob([data]),
        metadata: dataMeta ? null : {
          name: 'data.yaml',
          parents: ['appDataFolder']
        }
      });
    });
  }

  this.loadData = function(path) {
    return this.getDataMeta().then((dataMeta) => {
      if (dataMeta) {
        return gapi.client.drive.files.get({
          fileId: dataMeta.id,
          alt: 'media'
        }).then((response) => {
          return response.body;
        });
      }
      else {
        return null;
      }
    });
  }
}

export { GAppDataService };