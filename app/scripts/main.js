
// const applicationServerPublicKey = 'BKuSA3j58trocZicsCnNyYQ1_az6SxrqbI0KzOwimC_9VOAoqWf2HFzR21d6iFOZyV5hQSBzxxikQoE_ZX_lobw';
const applicationServerPublicKey = 'BNGgaJ6W3OZNNC7pQGTiY7BuZaXBbp6bUTGp3M646KaViR74Kf9NjXPKWuhmdHKRNmvCdLWwU3Um3dwGJVnr3ys';
const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

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

            // Update the server state with the new subscription
            sendSubscriptionToServer(subscription);
        })
            .catch(function (err) {
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

            // Update the server state with the new subscription
            return sendSubscriptionToServer(subscription);
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
function sendSubscriptionToServer(subscription) {

    // Get public key and user auth from the subscription object
    var key = subscription.getKey ? subscription.getKey('p256dh') : '';
    var auth = subscription.getKey ? subscription.getKey('auth') : '';

    // This example uses the new fetch API. This is not supported in all
    // browsers yet.
    return fetch('http://localhost:8081/profile/subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            endpoint: subscription.endpoint,
            // Take byte[] and turn it into a base64 encoded string suitable for
            // POSTing to a server over HTTP
            key: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : '',
            auth: auth ? btoa(String.fromCharCode.apply(null, new Uint8Array(auth))) : ''
        })
    });
}


// After this code has been run successfully, the following JSON will be POSTed to your server:

// {
//     "endpoint": "https://push.server.mozilla.org/unique-endpoint",
//         "key": "TmljZSB0cnksIG5vIGtleSBmb3IgeW91IQ==",
//             "auth": "Tm8hIEJhZCBoYWNrZXIh"
// }

//Push messages
const pushButton = document.querySelector('.push-msg-btn');
pushButton.addEventListener('click', function () {
    //mozilla test body
    // var data = {
    //     "endpoint": "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABY9MYRHFhZEFMHuxNDCcC4g4jRCTNRcyFQcQNNWh45XEDMgQmEHyebie583oPSstSBCVjycAjIz1TuEeNA1EMluai1jMS5RKo-u_borgrrSnkFgN-tP0Bh8K-BK8QAg9jqx28acmalNHBCRWDaMoZBcEhoI06g_r1nenkQWNG5-YeMHSw",
    //     "key": "BEkVxNXLMW3MEgCBACHQsRJZfacOFn7/6pHEx6IR941+VjeDRmxd40JCi0pxx2qy5fXkz4GZO5046diLvDu/U/M=",
    //     "auth": "pOFybkQ2wQWmau9b8xrSfw==",
    //     "payLoad": "{\"line1\":\"You have a new notification..\",\"line2\":\"View more info\"}"
    // }
    //chrome test body
    var data = {
        "endpoint": "https://fcm.googleapis.com/fcm/send/f52sSaZ-mN4:APA91bFQIHo7ynzBqewUXPyXIS_XVeQuMctPUlToh8QzljFMohd2w4TPyjsND_2IUvw5-lViHHl0msdzAFD0dwFgXXa8y1AeQ1h9geR8z7Brvxmv4vpU3Yv2FXoH8nSLd6NaaZ8Kj__G",
        "key": "BJFYnnRt4a46VeWwbUy65o6oHj8oSY43lOHoe3LDB6eM043Pe9NtDUuLydQ60k+/SwWm2HvYZRndvCjzrC9Jt0g=",
        "auth": "Hd6HN5zXWw1zfDeE/b3Pmg==",
        "payLoad": "{\"line1\":\"You have a new notification..\",\"line2\":\"View more info\"}"
    }

    return fetch('http://localhost:8081/send-notification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
});