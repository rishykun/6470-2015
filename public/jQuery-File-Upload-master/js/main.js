/*
 * jQuery File Upload Plugin JS Example 8.9.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global $, window */

$(function () {
    'use strict';

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        url: 'http://localhost:3000/uploadgoodies',
        maxFileSize: 25000000,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png|mp4|pdf|mp3)$/i,
        limitMultiFileUploads: 3
        //previewThumbnail: true
    });

    // Enable iframe cross-domain access via redirect option:
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    );

    //For Thumbnails

            function getThumbnail(original, scale) {
              var canvas = document.createElement("canvas");

              canvas.width = original.width * scale;
              canvas.height = original.height * scale;

              canvas.getContext("2d").drawImage
                (original, 0, 0, canvas.width, canvas.height);
             console.log("canvas:");
             console.log(canvas);
            return canvas;
}

        function dataURItoBlob(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type:mimeString});
        }
  
    $('#fileupload').bind('fileuploadsubmit', function (e, data) {
        console.log(data); //debug
        console.log(data.files);

        var inputs = data.context.find(':input');
        if (inputs.filter(function () {
                return !this.value && $(this).prop('required');
            }).first().focus().length) {
            data.context.find('button').prop('disabled', false);
            return false;
        }
        var boxnameobj = $(this).serializeArray().filter(function(obj) {if(obj.name === 'boxname') return true;});
        var usernameobj = $(this).serializeArray().filter(function(obj) {if(obj.name === 'username') return true;});
        data.formData = inputs.serializeArray();
        data.formData = data.formData.concat(boxnameobj);
        data.formData = data.formData.concat(usernameobj);
        data.formData = data.formData.concat({name: "numuploads", value: data.originalFiles.length});
        var thumbnailArray = new Array();
        for(var i = 0; i< data.files.length;i++){
            if(data.files[i].type.indexOf("image")>-1)
            {
                console.log("Image: ")
                console.log(data.files[i]);
                console.log(data.files[i].preview);//debug
                var canvas = data.files[i].preview;
                console.log(canvas.toDataURL("image/jpeg",0.5));//debug
                var dataURI = canvas.toDataURL("image/jpeg",0.5);
                var blob = dataURItoBlob(dataURI);
                console.log(blob);//debug
                //thumbnailArray.push({"blob":blob,"name":data.files[i].name});
                data.formData = data.formData.concat({name: data.files[i].name, value: blob});
            }
            else if(data.files[i].type.indexOf("video")>-1){
                console.log("Video: ")
                console.log(data.files[i]);
                console.log(data.files[i].preview);//debug
                var video = data.files[i].preview;
                video.setAttribute("width",'500');
                video.setAttribute("height",'450');
                console.log("Duration: " + video.duration);
                video.addEventListener("loadedmetadata", function() {
                    this.currentTime = this.duration/2;
                }, false);
                var canvas = getThumbnail(video,1);
                console.log(canvas.toDataURL("image/jpeg",0.5));//debug
                var dataURI = canvas.toDataURL("image/jpeg",0.5);
                var blob = dataURItoBlob(dataURI);
                console.log(blob);//debug
                data.formData = data.formData.concat({name: data.files[i].name, value: blob});
            }
            /*else if(data.files[i].type.indexOf("mp3")>-1)
            {
                var mp3Image = document.createElement("img");
                mp3Image.height = 200;
                mp3Image.width = 150;
                mp3Image.onload = function(){
                var canvas = getThumbnail(mp3Image,1);
                console.log(canvas.toDataURL("image/jpeg",0.5));//debug
                var dataURI = canvas.toDataURL("image/jpeg",0.5);
                //var reader = new FileReader();
                //var dataURI = reader.readAsDataURL(new File("../img/mp3icon.png"));
                var blob = dataURItoBlob(dataURI);
                console.log(blob);//debug
                data.formData = data.formData.concat({name: data.files[i].name, value: blob});
                }
                mp3Image.src = "../img/mp3icon.png";
                console.log(mp3Image);
               

            }*/
            //handle videos capture specific frame
        }
        //data.formData = data.formData.concat({name: "fileName", value: data.files[i].name});
        //data.formData = data.formData.concat({name: "thumbnail", value: thumbnailArray});

    });

    if (window.location.hostname === 'blueimp.github.io') {
        // Demo settings:
        $('#fileupload').fileupload('option', {
            url: '//jquery-file-upload.appspot.com/',
            // Enable image resizing, except for Android and Opera,
            // which actually support image resizing, but fail to
            // send Blob objects via XHR requests:
            disableImageResize: /Android(?!.*Chrome)|Opera/
                .test(window.navigator.userAgent),
            maxFileSize: 5000000,
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
        });
        // Upload server status check for browsers with CORS support:
        if ($.support.cors) {
            $.ajax({
                url: '//jquery-file-upload.appspot.com/',
                type: 'HEAD'
            }).fail(function () {
                $('<div class="alert alert-danger"/>')
                    .text('Upload server currently unavailable - ' +
                            new Date())
                    .appendTo('#fileupload');
            });
        }
    } else {
        // Load existing files:
        $('#fileupload').addClass('fileupload-processing');
        $.ajax({
            // Uncomment the following to send cross-domain cookies:
            //xhrFields: {withCredentials: true},
            url: $('#fileupload').fileupload('option', 'url'),
            dataType: 'json',
            context: $('#fileupload')[0]
        }).always(function () {
            $(this).removeClass('fileupload-processing');
        }).done(function (result) {
            $(this).fileupload('option', 'done')
                .call(this, $.Event('done'), {result: result});
        });
    }

});
