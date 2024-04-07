const Notif = require('../modules/notification/model');
class Notification extends Notif {
 static async init (id) {
  await this.create({user:id})
 }

 static async updateActivity(body, id) {
  const updated = await this.findOneAndUpdate({user:id}, {$push: {activities: body}})
  return updated
 }

 static async changeNotificationStatus(id, nid, status, isWithdrawal) {
   const notification = await this.findOne({user:id})
   const index = notification.activities.findIndex(x => {
     if(x._id.toString() === nid){
     return x
    }
    })

    notification.activities[index].status = Number(status);
    
    if(notification.activities[index].title.includes("withdrew")) isWithdrawal = true;
    const updatedNotification = await notification.save();
    updatedNotification._doc.isWithdrawal = isWithdrawal 
    return updatedNotification
 }

 static async getActivity(id) {
  const activity = await this.findOne({user:id}).populate({path:'activities.transactionId', model:'transaction'}).populate({path:'user', model:'profile', select:'name userName'})
  return activity
 }

 static async getAllActivities() {
  const activities = await this.find({}).populate({path:'activities.transactionId', model:'transaction'}).populate({path:'user', model:'profile', select:'name userName'})
  return activities
 }

 static async deleteByOwner (id) {
  await this.findOneAndRemove({user:id})
  return {
   name: "Notification",
   acknowledged: true,
   deletedCount: 1
  }
 }
}

module.exports = Notification;