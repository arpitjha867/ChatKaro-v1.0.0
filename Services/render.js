import generateName  from 'sillyname';
import {onlineUsers} from '../server.js'

export const homeRoutes = (req,res) => {
    res.render("index",{onlineUsers : onlineUsers.length});
}

export const textChatRouters = (req,res) => {
    res.render("text_chat");
}

export const videoChatRouters = (req,res) => {
    let randomName = generateName();
    res.render("video_chat",{name : randomName});
}