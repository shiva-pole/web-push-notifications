/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, serviceworker, es6 */

'use strict';
const applicationServerPublicKey = 'BKuSA3j58trocZicsCnNyYQ1_az6SxrqbI0KzOwimC_9VOAoqWf2HFzR21d6iFOZyV5hQSBzxxikQoE_ZX_lobw';

self.addEventListener('push', function (event) {
    console.log(event);
    console.log('[Service Worker] Push Received.');

    const data = event.data.json();
    console.log(`[Service Worker] Push had this data: `, data);
    const title = 'HomeUnion';
    const options = {
        body: `${data.line1} ${data.line2}`,
        icon: 'images/hu.png',
        badge: 'images/badge.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://developers.google.com/web/')
    );
});


self.addEventListener('pushsubscriptionchange', function (event) {
    console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    event.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
            .then(function (newSubscription) {
                // TODO: Send to application server
                console.log('[Service Worker] New subscription: ', newSubscription);
            })
    );
});

//The following code causes a new version of a registered Service Worker to replace an existing one that is already installed, 
//and replace the currently active worker on open pages.

self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});