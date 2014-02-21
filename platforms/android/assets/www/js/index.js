/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        //Area di gestione notifiche
        var pushNotification = window.plugins.pushNotification;
        pushNotification.register(app.successHandler, app.errorHandler,{"senderID":"1073127551296","ecb":"app.onNotificationGCM"});
        
       //Opzioni del menu  - vedi OptionsMenu.js per il trigger del tasto menu
        var onSettings = function() {
           window.location="settings.html";
        };
     
        var onHelp = function() {
            window.location="help.html";
        };
     
        var optionsmenu = new OptionsMenu({
            id: "optionsmenu",
            items: [ 
                [ {
                    label: "Impostazioni",
                    image: "img/settings.png",
                    action: onSettings
                }, 
                {
                    label: "Contatti",
                    image: "img/help.png",
                    action: onHelp
                } ]
            ]
        });
         
        /*------------------*/
        //Area di gestione del file di impostazioni
        
         // retrieves root file system entry
        var getFileSystemRoot = (function() {
 
            // private
            var root;
            
            // one-time retrieval of the root file system entry
            var init = function() {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                    function(fileSystem) {
                        root = fileSystem.root;
                    }, 
                    onFileSystemError);
            };
          
 
            // public function returns private root entry
            return function() {
                return root;
            };
        }()); // execute immediately
 
        // file system error handler
        function onFileSystemError(error) {
            var msg = 'file system error: ' + error.code;
            navigator.notification.alert(msg, null, 'File System Error');
        }
 
        // logs file events
        function onFileEvent(event) {
            console.log('file event: ' + event.target.fileName + ' ' + event.type);
        }
      
        // called when error reading file
        function onFileError(event) {
            console.log('file error: ' + event.target.error.code);
        }
 
        // called when file is written
        function onFileWrite(event) {
            onFileEvent(event);
            console.log('FileWriter position=' + 
                event.target.position + ", length=" + event.target.length);
        }
 
        // writes a text file to the device
        function writeFile() {
                // root file system entry
            var root = getFileSystemRoot(),
            
                // writes a file
                write_file = function(writer) {
                    var lineCount = 1;
                              
                    // set the callbacks
                    writer.onwritestart = onFileEvent;
                    writer.onprogress = onFileEvent;
                    writer.onwrite = onFileWrite;
                    writer.onabort = onFileEvent;
                    writer.onerror = onFileError;
                    writer.onwriteend = function(event) {
                        onFileEvent(event);
                        lineCount += 1;
                        if (lineCount <= 3) {
                            // append a new line   
                            writer.write('Line ' + lineCount + '.\r\n');  
                        } 
                        else {
                            alert(writer.fileName + 
                                ' length=' + writer.length + 
                                ', position=' + writer.position);
                        }
                    }
                    
                    // append
                    writer.seek(writer.length);
          
                    // write to file
                    writer.write('Line ' + lineCount + '.\r\n');   
                },
                
                // creates a FileWriter object
                create_writer = function(fileEntry) {
                    fileEntry.createWriter(write_file, onFileSystemError);
                };
            
            // create a file and write to it
            root.getFile('impostazioni_confcommercio.txt', {create: true}, create_writer, onFileSystemError);
        }
        
        // remove file system entry
        function removeFile() {
            var root = getFileSystemRoot();
            var remove_file = function(entry) {
                entry.remove(function() {
                    navigator.notification.alert(entry.toURI(), null, 'Entry deleted');                    
                }, onFileSystemError);
            };
            
            // retrieve a file and truncate it
            root.getFile('impostazioni_confcommercio.txt', {create: false}, remove_file, onFileSystemError);
        }    
        
      /*---------------*/  
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);      
    },
    // result contains any message sent from the plugin call
    successHandler: function(result) {
     //   alert('Callback Success! Result = '+result)
    },
    errorHandler:function(error) {
        alert(error);
    },
    onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    //Quando il device è pronto lo inserisco nel database delle notifiche
                    var url='http://www.confcommercioverona.it/app/notify_newdevice.php?registrationId='+e.regid;
                    var ref = window.open(url, '_blank','hidden=yes');
                    ref.addEventListener('loadstart', function() { /*alert('start: ' + event.url); */});
                    ref.addEventListener('loadstop', function() { /*alert('stop: ' + event.url); */});
                    ref.addEventListener('exit', function() { /*alert(event.type);*/ }); 
                    // close InAppBrowser after 5 seconds
                    setTimeout(function() {
                      ref.close();
                    }, 5000)
                }
                break;

                //questo è il comportamento che segue quando viene ricevuta una notifica
            case 'message':
                // this is the actual push notification. its format depends on the data model from the push server
                var str = e.message;
                var res = str.split("***");

                    var x="";
                    var r=confirm(res[0]);
                    if (r==true)
                      {
                      var url=res[1];
                      window.open(url,"_system","location=yes");
                      }

                break;

            case 'error':
                alert('GCM error = '+e.msg);
                break;

            default:
                alert('An unknown GCM event has occurred');
                break;
        }
    }

};