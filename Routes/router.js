import express from "express"
import { homeRoutes, textChatRouters, videoChatRouters } from '../Services/render.js'

const routes = express.Router();
routes.get("/",homeRoutes)
routes.get("/text-chat",textChatRouters)
routes.get("/video-chat",videoChatRouters)


export default routes;