"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const voice_controller_1 = require("../controllers/voice.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Route per Text-to-Speech
router.post('/tts', auth_middleware_1.authenticateToken, voice_controller_1.textToSpeech);
exports.default = router;
//# sourceMappingURL=voice.routes.js.map