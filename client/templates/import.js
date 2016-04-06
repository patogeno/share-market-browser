Template.import.codesToInsert = [];

Template.import.indexCodes = 0;

Template.import.upsertCode = function() {
    if(Template.import.indexCodes < Template.import.codesToInsert.length) {
        Codes.update({code:Template.import.codesToInsert[Template.import.indexCodes].$set.code}, Template.import.codesToInsert[Template.import.indexCodes], {upsert: true});
    }
    Template.import.indexCodes += 1;
    if(Template.import.indexCodes > Template.import.codesToInsert.length - 1 ) {
        $('[name="uploadCSV"]').val('');
        $('[name="uploadCSV"]').show();
        $('#uploading').hide();
    } else {
        window.setTimeout(Template.import.upsertCode,10);
        $('#upload-progress').html(Math.round(Template.import.indexCodes/Template.import.codesToInsert.length*100) + "%");
    }
};

Template.import.onRendered( function() {
    $('#import-panel-content').collapse('toggle');
});

Template.import.helpers({

});

Template.import.events({
    'change [name="uploadCSV"]' (event, template) {
        let files = event.target.files;
        if(!files[0]) return;
        let file = files[0];
        let name = files[0].name;
        Template.import.codesToInsert = [];
        $('[name="uploadCSV"]').hide();
        $('#uploading').show();

        if (window.FileReader) {
            // FileReader is supported.
            // generate a new FileReader object
            let reader = new FileReader();

            reader.onload = function (event) {
                let csv = reader.result;
                // to split the csv file into rows to get the number of rows
                csv = csv.replace(/^\s+|\s+$/g, '');
                csv = csv.replace(/\t/g, ',');
                let n = csv.split('\n').length;

                d3.csv.parse(csv, function (d, i) {
                    Template.import.codesToInsert.push({
                        $set: {
                            code: d.code,
                            name: (d.company) ? d.company: d.name,
                            description: (d.industry) ? d.industry : d.description,
                            seen : (d.seen == "true") ? true : false
                        }
                    });

//                    Codes.update({code:d.code},codesToInsert, {upsert: true});
                });
                Template.import.indexCodes = 0;
                Template.import.upsertCode();
            };

                // when the file is read it triggers the onload event above.
            reader.readAsText(file, 'UTF-8');
        } else {
//            throwMessage('FileReader is not supported in this browser.', "danger");
        }

    },
    'click #stop-upload'(){
        Template.import.indexCodes = Template.import.codesToInsert.length;
    }
});