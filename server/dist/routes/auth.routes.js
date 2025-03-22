"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Route per la registrazione
router.post('/register', auth_controller_1.register);
// Route per il login
router.post('/login', auth_controller_1.login);
// Route per il logout
router.post('/logout', auth_controller_1.logout);
// Rotte autenticate
router.post('/change-password', auth_middleware_1.authenticateToken, auth_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map