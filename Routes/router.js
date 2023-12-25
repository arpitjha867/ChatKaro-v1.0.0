import express from "express"
import { homeRoutes, textChatRouters } from '../Services/render.js'

const routes = express.Router();
routes.get("/",homeRoutes)
routes.get("/text-chat",textChatRouters)


export default routes;