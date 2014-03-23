module.exports.init = function(mongoose, Schema){

  var fs = require('fs');

  fs.readdir('./models/schemas/', function(err, files) {

    if(!err && files.length > 0) {

      var fn = 0;
      var models = {};

      for(fn in files) {

        var nfn = files[fn].replace('.js', '');
        var path_fn = './schemas/' + nfn;
        var exported_model = require(path_fn);
        models[nfn] = mongoose.model(nfn, exported_model(mongoose, Schema));

      }

    }
    else {
      console.log('No schemas found in models/schemas/');
      process.exit(1);
    }

  });

};
