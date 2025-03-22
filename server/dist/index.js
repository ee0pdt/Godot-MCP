var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { FastMCP } from 'fastmcp';
import { nodeTools } from './tools/node_tools.js';
import { scriptTools } from './tools/script_tools.js';
import { sceneTools } from './tools/scene_tools.js';
import { editorTools } from './tools/editor_tools.js';
import { getGodotConnection } from './utils/godot_connection.js';
// Import resources
import { sceneListResource, sceneStructureResource } from './resources/scene_resources.js';
import { scriptResource, scriptListResource, scriptMetadataResource } from './resources/script_resources.js';
import { projectStructureResource, projectSettingsResource, projectResourcesResource } from './resources/project_resources.js';
import { editorStateResource, selectedNodeResource, currentScriptResource } from './resources/editor_resources.js';
// Add global error handlers to prevent crashes
process.on('unhandledRejection', function (reason, promise) {
    var _a, _b, _c;
    // Check if this is a connection closed error from the MCP protocol
    var err = reason;
    if ((err === null || err === void 0 ? void 0 : err.code) === -32000 && ((_a = err === null || err === void 0 ? void 0 : err.message) === null || _a === void 0 ? void 0 : _a.includes('Connection closed'))) {
        // connection closed
        return;
    }
    else if (((_c = (_b = err === null || err === void 0 ? void 0 : err.context) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.code) === -32001 && (err === null || err === void 0 ? void 0 : err.code) == 'ERR_UNHANDLED_ERROR') {
        // request timeout
        return;
    }
    console.error('[MCP Server] Error details:', reason);
});
process.on('uncaughtException', function (error) {
    var _a, _b;
    // Check if this is a connection closed error from the MCP protocol
    var err = error; // Cast to any to access non-standard properties
    if (err && err.code === 'ERR_UNHANDLED_ERROR') {
        var code = (_b = (_a = err.context) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.code;
        if (code === -32000 || code === -32001) { // connection closed or request timeout
            return;
        }
    }
    console.error('[MCP Server] Exception details:', error);
});
/**
 * Main entry point for the Godot MCP server
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var server, godot, error_1, err, cleanup;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.error('Starting Godot MCP server...');
                    server = new FastMCP({
                        name: 'GodotMCP',
                        version: '1.0.0',
                    });
                    // Register all tools
                    __spreadArray(__spreadArray(__spreadArray(__spreadArray([], nodeTools, true), scriptTools, true), sceneTools, true), editorTools, true).forEach(function (tool) {
                        server.addTool(tool);
                    });
                    // Register all resources
                    // Static resources
                    server.addResource(sceneListResource);
                    server.addResource(scriptListResource);
                    server.addResource(projectStructureResource);
                    server.addResource(projectSettingsResource);
                    server.addResource(projectResourcesResource);
                    server.addResource(editorStateResource);
                    server.addResource(selectedNodeResource);
                    server.addResource(currentScriptResource);
                    server.addResource(sceneStructureResource);
                    server.addResource(scriptResource);
                    server.addResource(scriptMetadataResource);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    godot = getGodotConnection();
                    return [4 /*yield*/, godot.connect()];
                case 2:
                    _a.sent();
                    console.error('Successfully connected to Godot WebSocket server');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    err = error_1;
                    console.warn("Could not connect to Godot: ".concat(err.message));
                    console.warn('Will retry connection when commands are executed');
                    return [3 /*break*/, 4];
                case 4:
                    // Start the server
                    server.start({
                        transportType: 'stdio',
                    });
                    console.error('Godot MCP server started');
                    cleanup = function () {
                        console.error('Shutting down Godot MCP server...');
                        var godot = getGodotConnection();
                        godot.disconnect();
                        process.exit(0);
                    };
                    process.on('SIGINT', cleanup);
                    process.on('SIGTERM', cleanup);
                    return [2 /*return*/];
            }
        });
    });
}
// Start the server
main().catch(function (error) {
    console.error('Failed to start Godot MCP server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map