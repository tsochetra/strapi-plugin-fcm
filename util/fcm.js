"use strict";

const admin = require("firebase-admin");

module.exports = {
    /*
    * Send a message to a device(s) or a topic.
    * @param {Object} entry - of type: see the attributes in schema ../server/content-types/fcm-notification/schema.json
    * @returns {Promise<any>}
    * */
    send: async (entry) => {
        console.log('send to FCM', entry);
        let topic = "all_users";
      
        let payload = {
            notification: {
                title: entry.title,
                body: entry.body
            },
            data: {
              type: "list"
            },
            topic: topic,
            android:{
              priority: 'high',
              notification: {
               color: "#063159"
              }
            },
            apns: {
              payload: {
                aps: {
                  contentAvailable: true,                  
                  sound: "default",
                  color: "#063159"
                },
              },
            }
        };

        let res = null;
      
        res = await admin.messaging().send(payload);
      
        console.log('send to FCM res', JSON.stringify(res));
        return res;
    },
    /*
    * Initialize or reinitialize the firebase app
    * */
    initialize: async (strapi) => {
        // console.log('initialize FCM');
        const { serviceAccount } = await strapi.db.query('plugin::strapi-plugin-fcm.fcm-plugin-configuration').findOne({
            select: ['serviceAccount']
        });
        // console.log('serviceAccount', serviceAccount);
        // console.log('admin.apps?.length', admin.apps?.length);
        if (serviceAccount) {
            if (admin.apps?.length > 1) {
                Promise.all(admin.apps.map(app => app.delete())).then(() => {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                });
            } else {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            }
        }
    }
}
