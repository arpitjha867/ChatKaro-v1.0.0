import generateName  from 'sillyname';
import {onlineUsers} from '../server.js'

export const homeRoutes = (req,res) => {
    res.render("index",{onlineUsers : onlineUsers.length});
}

export const textChatRouters = (req,res) => {
    let randomName = generateName();
    res.render("text_chat",{name : randomName});
}