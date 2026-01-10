"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const bookySearch_controller_1 = require("../controllers/bookySearch.controller");
const router = express_1.default.Router();
// Tutte le routes richiedono autenticazione
router.use(auth_middleware_1.authenticateToken);
// POST /api/booky-search - Ricerca con AI
router.post('/', bookySearch_controller_1.searchWithAI);
// GET /api/booky-search/limit - Stato limite giornaliero
router.get('/limit', bookySearch_controller_1.getUsageLimit);
// GET /api/booky-search/sessions - Lista sessioni chat
router.get('/sessions', bookySearch_controller_1.getChatSessions);
// GET /api/booky-search/sessions/:sessionId - Dettaglio sessione
router.get('/sessions/:sessionId', bookySearch_controller_1.getChatSession);
// DELETE /api/booky-search/sessions/:sessionId - Elimina sessione
router.delete('/sessions/:sessionId', bookySearch_controller_1.deleteChatSession);
exports.default = router;
//# sourceMappingURL=bookySearch.routes.js.map