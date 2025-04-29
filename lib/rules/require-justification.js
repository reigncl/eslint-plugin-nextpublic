/**
 * @fileoverview Rule to check if NEXT_PUBLIC variables are justified in .nextpublicrc file
 */

"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Reads the .nextpublicrc file and returns the justifications
 * @param {string} cwd - Current working directory
 * @param {string} rcPath - Optional custom path to the rc file
 * @returns {Object} - Object with NEXT_PUBLIC variables as keys and justifications as values
 */
function readJustificationsFile(cwd, rcPath) {
  // If a custom path is provided, use it directly
  const customRcPath = rcPath ? path.resolve(cwd, rcPath) : null;
  
  if (customRcPath && fs.existsSync(customRcPath)) {
    const content = fs.readFileSync(customRcPath, "utf8");
    try {
      return JSON.parse(content);
    } catch (e) {
      // If it's not valid JSON, try to parse it as a simple key-value format
      return parseSimpleFormat(content);
    }
  }
  
  // Search for the .nextpublicrc file in the current directory and parent directories
  let currentDir = cwd;
  const root = path.parse(currentDir).root;
  
  // Continue searching until reaching the root directory
  while (currentDir !== root) {
    const rcFilePath = path.join(currentDir, ".nextpublicrc");
    
    if (fs.existsSync(rcFilePath)) {
      const content = fs.readFileSync(rcFilePath, "utf8");
      try {
        return JSON.parse(content);
      } catch (e) {
        // If it's not valid JSON, try to parse it as a simple key-value format
        return parseSimpleFormat(content);
      }
    }
    
    // Move up one level in the directory structure
    const parentDir = path.dirname(currentDir);
    
    // If we reach the root or can't go up anymore, stop the search
    if (parentDir === currentDir) {
      break;
    }
    
    currentDir = parentDir;
  }
  
  console.log("No .nextpublicrc file found in any parent directory");
  return {};
}

/**
 * Parse simple key-value format
 * @param {string} content - File content
 * @returns {Object} - Parsed justifications
 */
function parseSimpleFormat(content) {
  const justifications = {};
  const lines = content.split("\n");
  
  lines.forEach(line => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith("#")) return;
    
    // Try to match the format: KEY="value"
    const match = line.match(/^([^=]+)=\"(.*)\"$/); 
    if (match) {
      const [, key, value] = match;
      justifications[key.trim()] = value.trim();
    }
  });
  
  return justifications;
}

/**
 * Checks if a variable has a valid justification
 * @param {string} variable - The NEXT_PUBLIC variable name
 * @param {Object} justifications - Object with justifications
 * @param {Object} context - ESLint context
 * @param {Object} node - AST node
 * @param {Set} foundVariables - Set of found variables
 */
function checkJustification(variable, justifications, context, node, foundVariables) {
  // Add to found variables set
  foundVariables.add(variable);
  
  if (!justifications[variable]) {
    context.report({
      node,
      message: `NEXT_PUBLIC variable '${variable}' requires justification in .nextpublicrc file`
    });
  } else if (justifications[variable].length < 20) {
    context.report({
      node,
      message: `Justification for NEXT_PUBLIC variable '${variable}' must be at least 8 characters long`
    });
  }
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Require justification for NEXT_PUBLIC environment variables",
      category: "Possible Errors",
      recommended: true
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          rcPath: {
            type: "string"
          }
        },
        additionalProperties: false
      }
    ]
  },

  create: function(context) {
    const cwd = context.getCwd ? context.getCwd() : process.cwd();
    const options = context.options[0] || {};
    const rcPath = options.rcPath;
    
    // Clear the justifications cache to force a new read
    if (global.eslintPluginNextPublic) {
      delete global.eslintPluginNextPublic.justificationsCache;
    }
    
    // Read the justifications file each time
    const justifications = readJustificationsFile(cwd, rcPath);
    
    // Set to track unique NEXT_PUBLIC variables found
    const foundVariables = new Set();
    
    // Store the context object to use it in the Program:exit event
    if (!global.eslintPluginNextPublic) {
      global.eslintPluginNextPublic = {
        allFoundVariables: new Set(),
        processed: false,
        exitListenerAdded: false
      };
      
      // Add the listener only once
      if (!global.eslintPluginNextPublic.exitListenerAdded) {
        global.eslintPluginNextPublic.exitListenerAdded = true;
        process.on('exit', () => {
          if (!global.eslintPluginNextPublic.processed) {
            global.eslintPluginNextPublic.processed = true;
            const totalCount = global.eslintPluginNextPublic.allFoundVariables.size;
            console.log(`Found a total of ${totalCount} unique NEXT_PUBLIC variables across all files.`);
            
            // Reset the state for the next execution
            global.eslintPluginNextPublic.processed = false;
            global.eslintPluginNextPublic.allFoundVariables.clear();
          }
        });
      }
    }
    
    return {
      Literal: function(node) {
        if (typeof node.value === "string" && node.value.includes("NEXT_PUBLIC_")) {
          const matches = node.value.match(/NEXT_PUBLIC_[A-Z0-9_]+/g);
          
          if (matches) {
            matches.forEach(variable => {
              checkJustification(variable, justifications, context, node, foundVariables);
            });
          }
        }
      },
      
      Identifier: function(node) {
        if (node.name.startsWith("NEXT_PUBLIC_")) {
          checkJustification(node.name, justifications, context, node, foundVariables);
        }
      },
      
      TemplateElement: function(node) {
        if (node.value && node.value.raw && node.value.raw.includes("NEXT_PUBLIC_")) {
          const matches = node.value.raw.match(/NEXT_PUBLIC_[A-Z0-9_]+/g);
          
          if (matches) {
            matches.forEach(variable => {
              checkJustification(variable, justifications, context, node, foundVariables);
            });
          }
        }
      },
      
      // Detect process.env.NEXT_PUBLIC_XXX
      MemberExpression: function(node) {
        // Case: process.env.NEXT_PUBLIC_XXX
        if (
          node.object && 
          node.object.type === "MemberExpression" &&
          node.object.object && 
          node.object.object.name === "process" &&
          node.object.property && 
          node.object.property.name === "env" &&
          node.property && 
          node.property.type === "Identifier" &&
          node.property.name.startsWith("NEXT_PUBLIC_")
        ) {
          checkJustification(node.property.name, justifications, context, node, foundVariables);
        }
        
        // Case: process.env["NEXT_PUBLIC_XXX"]
        if (
          node.object && 
          node.object.type === "MemberExpression" &&
          node.object.object && 
          node.object.object.name === "process" &&
          node.object.property && 
          node.object.property.name === "env" &&
          node.property && 
          node.property.type === "Literal" &&
          typeof node.property.value === "string" &&
          node.property.value.startsWith("NEXT_PUBLIC_")
        ) {
          checkJustification(node.property.value, justifications, context, node, foundVariables);
        }
      },
      
      // Report summary at the end of the program
      "Program:exit": function() {
        // Add the variables found in this file to the global set
        foundVariables.forEach(variable => {
          global.eslintPluginNextPublic.allFoundVariables.add(variable);
        });
        
        // Remove the code that adds the listener here
        // We don't need this anymore because we add it once at the beginning
      }
    };
  }
};