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
        document.addEventListener('online', this.onLine, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        var pushNotification = window.plugins.pushNotification;
        
        if (device.platform == 'android' || device.platform == 'Android') {
            //Area di gestione notifiche
            
            pushNotification.register(app.successHandler, app.errorHandler,{"senderID":"1073127551296","ecb":"app.onNotificationGCM"});
        }
        else {
            //se � IOS
            pushNotification.register(this.tokenHandler,this.errorHandler,   {"badge":"true","sound":"true","alert":"true","ecb":"app.onNotificationAPN"});
        }
        
        
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
    //Area gestione notifiche Android (GCM = Google Cloud Messaging)
    onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
 
                    //Quando il device � pronto lo inserisco nel database delle notifiche
                    var url='http://www.confcommercioverona.it/app/notify_newdevice.php?deviceid='+device.uuid+'&platform='+device.platform+'&model='+device.model+'&registrationId='+e.regid;
                    var ref = window.open(url, '_blank','hidden=yes');
                    ref.addEventListener('loadstart', function() {});
                    ref.addEventListener('loadstop', function() {});
                    ref.addEventListener('exit', function() {}); 
                    // close InAppBrowser after 5 seconds
                    setTimeout(function() {
                      ref.close();
                    }, 5000);     
                }
                break;

                //questo � il comportamento che segue quando viene ricevuta una notifica
            case 'message':
                // this is the actual push notification. its format depends on the data model from the push server
                var str = e.message;
                var res = str.split("***");

                    var x="";
                    var r=confirm(res[0]);
                    if (r==true)
                      {
                      
                      var notify_news_id=res[1]; //  id del contenuto joomla da notificare
                      //qui per aprire la notifica in app
                      window.open("apri.html?notify_id="+notify_news_id,"_self","location=yes");
                      }

                break;

            case 'error':
                alert('GCM error = '+e.msg);
                break;

            default:
                alert('An unknown GCM event has occurred');
                break;
        }
    },
     //Area gestione notifiche iOS (apple)
    onNotificationAPN: function(event) {
        var pushNotification = window.plugins.pushNotification;
        console.log("Received a notification! " + event.alert);
        console.log("event sound " + event.sound);
        console.log("event badge " + event.badge);
        console.log("event " + event);
        if (event.alert) {
            navigator.notification.alert(event.alert);
        }
        if (event.badge) {
            console.log("Set badge on  " + pushNotification);
            pushNotification.setApplicationIconBadgeNumber(this.successHandler, event.badge);
        }
        if (event.sound) {
            var snd = new Media(event.sound);
            snd.play();
        }
    }

};