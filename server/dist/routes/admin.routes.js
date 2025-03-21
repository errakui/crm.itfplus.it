"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Route Admin per la gestione utenti
router.get('/users', auth_middleware_1.authenticateToken, auth_middleware_1.isAdmin, auth_controller_1.getAllUsers);
router.get('/users/:id', auth_middleware_1.authenticateToken, auth_middleware_1.isAdmin, auth_controller_1.getUserById);
router.post('/users', auth_middleware_1.authenticateToken, auth_middleware_1.isAdmin, auth_controller_1.createUser);
router.put('/users/:id', auth_middleware_1.authenticateToken, auth_middleware_1.isAdmin, auth_controller_1.updateUser);
router.delete('/users/:id', auth_middleware_1.authenticateToken, auth_middleware_1.isAdmin, auth_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map