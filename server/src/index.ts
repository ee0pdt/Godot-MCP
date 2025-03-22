import { FastMCP } from 'fastmcp';
import { nodeTools } from './tools/node_tools.js';
import { scriptTools } from './tools/script_tools.js';
import { sceneTools } from './tools/scene_tools.js';
import { editorTools } from './tools/editor_tools.js';
import { getGodotConnection } from './utils/godot_connection.js';

// Import resources
import { 
  sceneListResource, 
  sceneStructureResource 
} from './resources/scene_resources.js';
import { 
  scriptResource, 
  scriptListResource,
  scriptMetadataResource 
} from './resources/script_resources.js';
import { 
  projectStructureResource,
  projectSettingsResource,
  projectResourcesResource 
} from './resources/project_resources.js';
import { 
  editorStateResource,
  selectedNodeResource,
  currentScriptResource 
} from './resources/editor_resources.js';

// Add global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  // Check if this is a connection closed error from the MCP protocol
  const err = reason as any;
  if (err?.code === -32000 && err?.message?.includes('Connection closed')) {
    // connection closed
    return;
  } else if (err?.context?.error?.code === -32001 && err?.code == 'ERR_UNHANDLED_ERROR') {
    // request timeout
    return;
  }
  console.error('[MCP Server] Error details:', reason);
});

process.on('uncaughtException', (error) => {
  // Check if this is a connection closed error from the MCP protocol
  const err = error as any; // Cast to any to access non-standard properties
  if (err && err.code === 'ERR_UNHANDLED_ERROR') {
    const code = err.context?.error?.code;
    if (code === -32000 || code === -32001) { // connection closed or request timeout
        return;
    }
  }
  console.error('[MCP Server] Exception details:', error);
});

/**
 * Main entry point for the Godot MCP server
 */
async function main() {
  console.error('Starting Godot MCP server...');

  // Create FastMCP instance
  const server = new FastMCP({
    name: 'GodotMCP',
    version: '1.0.0',
  });

  // Register all tools
  [...nodeTools, ...scriptTools, ...sceneTools, ...editorTools].forEach(tool => {
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

  // Try to connect to Godot
  try {
    const godot = getGodotConnection();
    await godot.connect();
    console.error('Successfully connected to Godot WebSocket server');
  } catch (error) {
    const err = error as Error;
    console.warn(`Could not connect to Godot: ${err.message}`);
    console.warn('Will retry connection when commands are executed');
  }

  // Start the server
  server.start({
    transportType: 'stdio',
  });

  console.error('Godot MCP server started');

  // Handle cleanup
  const cleanup = () => {
    console.error('Shutting down Godot MCP server...');
    const godot = getGodotConnection();
    godot.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

// Start the server
main().catch(error => {
  console.error('Failed to start Godot MCP server:', error);
  process.exit(1);
});
