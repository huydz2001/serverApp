import FCM from 'fcm-node'
const fcm = new FCM('AAAAkZvCDqQ:APA91bGi9aCmF1_bQ7oK8OAyYp_mjbdrOBgRG_Bdo_CDKV2HqSIl0SyghJWfbXOTT2dtXG_tR5nVVOV3xJCjPSFImB4Lbv4KwAeVDEngc3nfsCkbSRVKiM3Wk7dwEXW6AwuDa_dopZoL')
const androidConfig = {
    priority: 'high', 
};
 const sendNoti = (to,title,body)=>{
    var message = { 
        to, 
        notification: {
            title, 
            body
        },
        android: androidConfig,
      };
      fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!",err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
      });
}
export default sendNoti