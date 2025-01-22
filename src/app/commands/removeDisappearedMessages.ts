import { Users } from "../http/models/users.model"
import { UserSpecificSettings } from "../http/models/usersSpecificSettings.model";
import { messageRemoveTimerEnum } from "../http/types/users.types"
import { logger } from "../providers/logger";
import { Chats } from "../sockets/models/chat.model";

export const removeDisappearedMessage = async () => {
    try {
        const findUser = await Users.find({ messageRemoveTimer: { $exists: true, $ne: messageRemoveTimerEnum.OFF}}, { _id: 1, messageRemoveTimer: 1});
        
        const findUserlist:any = await UserSpecificSettings.find({
            $or: [
                { "generalSettings.privacySettings.messageRemoveTimer": { $ne: messageRemoveTimerEnum.OFF } },
                { "userwiseSetting.privacySettings.messageRemoveTimer": { $ne: messageRemoveTimerEnum.OFF } }
            ]
        })

        let differGeneralSettingUser:any = [];
        let differCustomSettingUser:any = [];

        findUserlist.forEach((userlist:any)=>{
            if(userlist.generalSettings.privacySettings.messageRemoveTimer != messageRemoveTimerEnum.OFF){
                differGeneralSettingUser.push({userId: findUserlist.userId, messageRemoveTimerEnum: userlist.generalSettings.privacySettings.messageRemoveTimer});
            } else {
                userlist.userwiseSetting.forEach((userWise:any) => {
                    if(userWise.privacySettings.messageRemoveTimer != messageRemoveTimerEnum.OFF){
                        differCustomSettingUser.push({userId: findUserlist.userId, otherUserId: userWise.userId, messageRemoveTimerEnum})
                    }
                });
            }
        })



        let hours24Users:any = [];
        let days7Users:any = [];
        let days90Users:any = [];
        differGeneralSettingUser.forEach((user:any)=>{
            if(user.messageRemoveTimer == messageRemoveTimerEnum["24_HOURS"]){
                hours24Users.push(user.userId);
            } else if (user.messageRemoveTimer == messageRemoveTimerEnum["7_DAYS"]){
                days7Users.push(user.userId);
            } else if (user.messageRemoveTimer == messageRemoveTimerEnum["90_DAYS"]){
                days90Users.push(user.userId);
            }
        })
        let hours24CustomUsers:any = [];
        let days7CustomUsers:any = [];
        let days90CustomUsers:any = [];
        differCustomSettingUser.forEach((user: any)=>{
            if(user.messageRemoveTimer == messageRemoveTimerEnum["24_HOURS"]){
                hours24CustomUsers.push({senderId: user.userId, receiverId: user.otherUserId});
                hours24CustomUsers.push({senderId: user.otheruserId, receiverId: user.userId});
            } else if (user.messageRemoveTimer == messageRemoveTimerEnum["7_DAYS"]){
                days7CustomUsers.push({senderId: user.userId, receiverId: user.otherUserId});
                days7CustomUsers.push({senderId: user.otheruserId, receiverId: user.userId});
            } else if (user.messageRemoveTimer == messageRemoveTimerEnum["90_DAYS"]){
                days90CustomUsers.push({senderId: user.userId, receiverId: user.otherUserId});
                days90CustomUsers.push({senderId: user.otheruserId, receiverId: user.userId});
            }
        })
        // findUser.forEach((user:any)=>{
        //     if(user.messageRemoveTimer == messageRemoveTimerEnum["24_HOURS"]){
        //         hours24Users.push(user._id);
        //     } else if (user.messageRemoveTimer == messageRemoveTimerEnum["7_DAYS"]){
        //         days7Users.push(user._id);
        //     } else if (user.messageRemoveTimer == messageRemoveTimerEnum["90_DAYS"]){
        //         days90Users.push(user._id);
        //     }
        // })

        if(hours24Users.length){
            const oneDaysAgo = new Date();
            oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);
            await Chats.updateMany(
                {
                    deletedAt: null,
                    $or: [
                        { senderId: { $in: hours24Users }},
                        { receiverId: { $in: hours24Users }}
                    ],
                    createdAt: {
                        $lte: oneDaysAgo
                    }
                },
                { $set: { deletedAt: new Date() }}
            );
        }

        if(days7Users.length){
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            await Chats.updateMany(
                {
                    deletedAt: null,
                    $or: [
                        { senderId: { $in: days7Users }},
                        { receiverId: { $in: days7Users }}
                    ],
                    createdAt: {
                        $lte: sevenDaysAgo
                    }
                },
                { $set: { deletedAt: new Date() }}
            );
        }

        if(days90Users.length){
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            await Chats.updateMany(
                {
                    deletedAt: null,
                    $or: [
                        { senderId: { $in: days90Users }},
                        { receiverId: { $in: days90Users }}
                    ],
                    createdAt: {
                        $lte: ninetyDaysAgo
                    }
                },
                { $set: { deletedAt: new Date() }}
            );
        }

        if(hours24CustomUsers.length){
            const oneDaysAgo = new Date();
            oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);
            await Chats.updateMany(
                {
                    deletedAt: null,
                    $or: hours24CustomUsers,
                    createdAt: {
                        $lte: oneDaysAgo
                    }
                },
                { $set: { deletedAt: new Date() }}
            );
        }

        if(days7CustomUsers.length){
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            await Chats.updateMany(
                {
                    deletedAt: null,
                    $or: [
                        { senderId: { $in: days7CustomUsers }},
                        { receiverId: { $in: days7CustomUsers }}
                    ],
                    createdAt: {
                        $lte: sevenDaysAgo
                    }
                },
                { $set: { deletedAt: new Date() }}
            );
        }

        if(days90CustomUsers.length){
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            await Chats.updateMany(
                {
                    deletedAt: null,
                    $or: [
                        { senderId: { $in: days90CustomUsers }},
                        { receiverId: { $in: days90CustomUsers }}
                    ],
                    createdAt: {
                        $lte: ninetyDaysAgo
                    }
                },
                { $set: { deletedAt: new Date() }}
            );
        }

        logger.info("Successfully remove disappeared message")
    } catch (error: any) {
        logger.info("remove disappeared message error:"+ error.message)
    }
}