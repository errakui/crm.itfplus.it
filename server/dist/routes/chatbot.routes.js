"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatbot_controller_1 = require("../controllers/chatbot.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Route per ottenere la risposta dal chatbot
router.post('/chat', auth_middleware_1.authenticateToken, chatbot_controller_1.getChatResponse);
// Route per ottenere un riassunto di un documento
router.get('/summary/:documentId', auth_middleware_1.authenticateToken, chatbot_controller_1.getSummary);
exports.default = router;
//# sourceMappingURL=chatbot.routes.js.map