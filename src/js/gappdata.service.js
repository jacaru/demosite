function GAppDataService() {

  //*****************************************************
  //GENERIC METHODS
  //*****************************************************

  this.loadFile = function (file, done) {
    gapi.client.drive.files.export({
      fileId: file.id,
      mimeType: 'text/plain',
      fields: 'id,name,parents'
    }).then(function (resp) {
      var retFile = { name: file.name, id: file.id, content: resp.body, parents: file.parents };
      done(retFile);
    });
  }

  this.loadFileRaw = function (file, done) {
    gapi.client.drive.files.get({
      fileId: file.id,
      alt: 'media'
    }).then(function (resp) {
      var retFile = { name: file.name, id: file.id, content: resp.body, parents: file.parents };
      done(retFile);
    }, function (reason) {
      console.log('loadFileRaw ERROR: ', reason)
    });
  }

  this.saveFile = function (file, done, raw) {
    this.saveFileGeneric(file, done, false)
  }

  this.saveRootFile = function(name, stream, mimeType) {
    var fileMetadata = {
      'name': name,
      'parents': ['appDataFolder']
    };
    var media = {
      mimeType: mimeType,
      body: stream
    };
    gapi.client.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log('Folder Id:', file.id);
      }
    });
  }

  this.loadRootFileByName = function(name, stream, notfound) {
    console.log("Test")
    this.listRootFiles(function(files) {
      var file = files.find(el => el.name == name)
      if (file == undefined) {
        notfound()
      } else {
        this.loadRootFile(file, stream);
      }
    });
  }

  this.loadRootFile = function(file, stream) {
    gapi.client.drive.files.get({
      fileId: file.Id,
      alt: 'media'
    })
    .on('end', function () {
      console.log('Done');
    })
    .on('error', function (err) {
      console.log('Error during download', err);
    })
    .pipe(stream);
  }

  this.listRootFiles = function(callback) {
    console.log("Test")
    gapi.client.drive.files.list({
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(id, name)',
      pageSize: 100
    }, function (err, res) {
      if (err) {
        // Handle error
        console.error("Error: ", err);
      } else {
        console.log("Found files:")
        res.files.forEach(function (file) {
          console.log(file.name, file.id);
        });
        callback(res.files)
      }
    }).then(function (resp) {
      console.log("Test")
    }, function (reason) {
      console.log("Test")
    });
  }

  this.saveFileRaw = function (file, done, raw) {
    this.saveFileGeneric(file, done, true)
  }

  this.saveFileGeneric = function (file, done, raw) {
    function addContent(fileId) {
      return gapi.client.request({
        path: '/upload/drive/v3/files/' + fileId,
        method: 'PATCH',
        params: {
          uploadType: 'media'
        },
        body: file.content
      })
    }
    var metadata = {
      mimeType: 'application/vnd.google-apps.document',
      name: file.name,
      fields: 'id'
    }
    if (raw) {
      delete metadata["mimeType"];
    }

    if (file.parents) {
      metadata.parents = file.parents;
    }

    if (file.id) { //just update
      addContent(file.id).then(function (resp) {
        console.log('File just updated', resp.result);
        done(resp.result);
      })
    } else { //create and update
      gapi.client.drive.files.create({
        resource: metadata
      }).then(function (resp) {
        addContent(resp.result.id).then(function (resp) {
          console.log('created and added content', resp.result);
          done(resp.result);
        })
      });
    }
  }


  this.list = function (resource, done) {
    var query = ' name contains "' + resource.query_name + '" '
    if (resource.parents) {
      query += ' and "' + resource.parents + '" in parents '
    }
    if (resource.mimeType) {
      query += ' and mimeType="' + resource.mimeType + '" '
    }
    if (resource.trashed != undefined) {
      query += ' and trashed=' + resource.trashed;
    }
    gapi.client.drive.files.list({
      pageSize: 30,
      corpora: 'user',
      spaces: 'appDataFolder',
      q: query,
      orderBy: resource.orderBy || 'modifiedTime desc'
    }).then(function (resp) {
      return done(null, resp.result.files);
    }, function (reason) {
      return done(reason, null);
    })
  }

  //*****************************************************
  //SPECIFIC METHODS TO MAKE IT EASIER TO USE
  //*****************************************************


  this.listFilesAt = function (query_name, parents, done) {
    this.list({ query_name: query_name, parents: parents, trashed: false }, done)
  }

  this.listFiles = function (query_name, done) {
    this.list({ query_name: query_name, trashed: false }, done)
  }

  this.listFolders = function (query_name, parents, done) {
    this.list({ query_name: query_name, mimeType: 'application/vnd.google-apps.folder', trashed: false }, done)
  }

  this.listFoldersAt = function (query_name, parents, done) {
    this.list({ query_name: query_name, parents: parents, mimeType: 'application/vnd.google-apps.folder', trashed: false }, done)
  }

}

export { GAppDataService };