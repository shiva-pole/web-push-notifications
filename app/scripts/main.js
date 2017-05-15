
const applicationServerPublicKey = 'BKuSA3j58trocZicsCnNyYQ1_az6SxrqbI0KzOwimC_9VOAoqWf2HFzR21d6iFOZyV5hQSBzxxikQoE_ZX_lobw';
const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
const pushEnableButton = document.querySelector('.js-push-btn');
let isSubscribed = false;

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
/**
 * Step one: run a function on load (or whenever is appropriate for you)
 * Function run on load sets up the service worker if it is supported in the
 * browser. Requires a serviceworker in a `sw.js`. This file contains what will
 * happen when we receive a push notification.
 * If you are using webpack, see the section below.
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(initialiseState);
} else {
    console.warn('Service workers are not supported in this browser.');
}

/**
 * Step two: The serviceworker is registered (started) in the browser. Now we
 * need to check if push messages and notifications are supported in the browser
 */
function initialiseState(registration) {

    // Check if desktop notifications are supported
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        console.warn('Notifications aren\'t supported.');
        return;
    }

    // Check if user has disabled notifications
    // If a user has manually disabled notifications in his/her browser for 
    // your page previously, they will need to MANUALLY go in and turn the
    // permission back on. In this statement you could show some UI element 
    // telling the user how to do so.
    if (Notification.permission === 'denied') {
        console.warn('The user has blocked notifications.');
        return;
    }

    // Check is push API is supported
    if (!('PushManager' in window)) {
        console.warn('Push messaging isn\'t supported.');
        return;
    }

    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {

        // Get the push notification subscription object
        serviceWorkerRegistration.pushManager.getSubscription().then(function (subscription) {

            // If this is the user's first visit we need to set up
            // a subscription to push notifications
            if (!subscription) {
                subscribe();
                return;
            }
            isSubscribed = true;
            // Update the server state with the new subscription
            sendSubscriptionToServer(subscription, true);
        }).catch(function (err) {
            // Handle the error - show a notification in the GUI
            console.warn('Error during getSubscription()', err);
        });
    });
}

/**
 * Step three: Create a subscription. Contact the third party push server (for
 * example mozilla's push server) and generate a unique subscription for the
 * current browser.
 */
function subscribe() {
    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {

        // Contact the third party push server. Which one is contacted by
        // pushManager is  configured internally in the browser, so we don't
        // need to worry about browser differences here.
        //
        // When .subscribe() is invoked, a notification will be shown in the
        // user's browser, asking the user to accept push notifications from
        // <yoursite.com>. This is why it is async and requires a catch.
        serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        }).then(function (subscription) {
            console.log('Subscription successful');
            console.log('Subscription', subscription);
            // Update the server state with the new subscription
            return sendSubscriptionToServer(subscription, true);
        })
            .catch(function (e) {
                if (Notification.permission === 'denied') {
                    console.warn('Permission for Notifications was denied');
                } else {
                    console.error('Unable to subscribe to push.', e);
                }
            });
    });
}

/**
 * Step four: Send the generated subscription object to our server.
 */
function sendSubscriptionToServer(subscription, subscribe) {

    // Get public key and user auth from the subscription object
    var key = subscription.getKey ? subscription.getKey('p256dh') : '';
    var auth = subscription.getKey ? subscription.getKey('auth') : '';
    if (subscribe) {
        // pushEnableButton.disabled = false;
        isSubscribed = true;
        pushEnableButton.textContent = 'Disable Push';
    } else {
        // pushEnableButton.disabled = true;
        isSubscribed = false;
        pushEnableButton.textContent = 'Enable Push';
    }
    // This example uses the new fetch API. This is not supported in all
    // browsers yet.
    return fetch('http://localhost:8081/save-subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            endpoint: subscription.endpoint,
            // Take byte[] and turn it into a base64 encoded string suitable for
            // POSTing to a server over HTTP
            key: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : '',
            auth: auth ? btoa(String.fromCharCode.apply(null, new Uint8Array(auth))) : '',
            subscribe: subscribe
        })
    });
}

//Unsubscribe

function unsubscribe() {
    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        serviceWorkerRegistration.pushManager.getSubscription().then(function (subscription) {
            subscription.unsubscribe().then(function (successful) {
                return sendSubscriptionToServer(subscription, false);
            }).catch(function (e) {
                // Unsubscription failed
                console.log('Unsubscription failed');
            })
        })
    });
}

pushEnableButton.addEventListener('click', function () {
    // pushEnableButton.disabled = true;
    if (isSubscribed) {
        unsubscribe();
    } else {
        subscribe();
    }
});


//Push messages
const pushButton = document.querySelector('.push-msg-btn');
pushButton.addEventListener('click', function () {
    //mozilla test body
    // var data = {
    //     "endpoint": "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABZGX6GUvn7ZFgnUdXZUqGOCBDAM2R56k_-9oQIDwlUinl3j0OXxIbZBsr9_SMrpXd7_i1ZRXc1DgPRiOSI8yUlyGVZWC9gaR5YafBbKf5cM829Yg7lSTkxwXvZbTdCmkfrhwTTprii8YVtmryZN9cZqoJU0NccWqgMPRj0HLUau-tsdL8",
    //     "key": "BLs2ctmUoAjQYBxuHzyrV1mLQHYM6ARV6ZFIf5iFHp3Rks8nTkO/wYpdf0caiyGR7BPaRht/c5z5P5ZxdxBAnZQ=",
    //     "auth": "llStJALQuUdR/OBfN+AOTw==",
    //     "payLoad": "{\"line1\":\"You have a new notification..\",\"line2\":\"View more info here\"}"
    // }

    //chrome test body
    var data = {
        "endpoint": "https://fcm.googleapis.com/fcm/send/cRmtbuWnwus:APA91bFHEPbRGo3aBqGyMUwV5fYJokG2WkOlgtOwv3sHfevFraoYcaQ_pTHz4Ok-eVKmHfdNYlJBgyd8PQ9vxFlx6kg-QgLL8SRmqpzsCaGHc5Vh2fJtToKWCa1tX4Qmm2SPn9T5yCXP",
        "key": "BHyKPWhqt7zveVcY8v+EeNrW0iRRrvDa9CO+bP/w4ull9C4wHjBHGVnYmRJZ99/wEKvGiLSYBqePq1UXjo0DWyM=",
        "auth": "pM2BbUnMnZL6v7pLN9IuxQ==",
        "payLoad": "{\"line1\":\"You have a new notification..\",\"line2\":\"View more info here\"}"
    };



    return fetch('http://localhost:8081/send-notification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
});