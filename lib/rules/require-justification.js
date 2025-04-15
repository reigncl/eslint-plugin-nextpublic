/**
 * @fileoverview Rule to check if NEXT_PUBLIC variables are justified in .nextpublicrc file
 */

"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Reads the .nextpublicrc file and returns the justifications
 * @param {string} cwd - Current working directory
 * @returns {Object} - Object with NEXT_PUBLIC variables as keys and justifications as values
 */
function readJustificationsFile(cwd) {
  const rcFilePath = path.resolve(cwd, ".nextpublicrc");
  
  try {
    if (fs.existsSync(rcFilePath)) {
      const content = fs.readFileSync(rcFilePath, "utf8");
      try {
        return JSON.parse(content);
      } catch (e) {
        // If it's not valid JSON, try to parse it as a simple key-value format
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
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }
  
  return {};
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
    schema: []
  },

  create: function(context) {
    const cwd = context.getCwd ? context.getCwd() : process.cwd();
    const justifications = readJustificationsFile(cwd);
    // Set to track unique NEXT_PUBLIC variables found
    const foundVariables = new Set();
    
    return {
      Literal: function(node) {
        if (typeof node.value === "string" && node.value.includes("NEXT_PUBLIC_")) {
          const matches = node.value.match(/NEXT_PUBLIC_[A-Z0-9_]+/g);
          
          if (matches) {
            matches.forEach(variable => {
              // Add to found variables set
              foundVariables.add(variable);
              
              if (!justifications[variable]) {
                context.report({
                  node,
                  message: `NEXT_PUBLIC variable '${variable}' requires justification in .nextpublicrc file`
                });
              } else if (justifications[variable].length < 8) {
                context.report({
                  node,
                  message: `Justification for NEXT_PUBLIC variable '${variable}' must be at least 8 characters long`
                });
              }
            });
          }
        }
      },
      
      Identifier: function(node) {
        if (node.name.startsWith("NEXT_PUBLIC_")) {
          // Add to found variables set
          foundVariables.add(node.name);
          
          if (!justifications[node.name]) {
            context.report({
              node,
              message: `NEXT_PUBLIC variable '${node.name}' requires justification in .nextpublicrc file`
            });
          } else if (justifications[node.name].length < 8) {
            context.report({
              node,
              message: `Justification for NEXT_PUBLIC variable '${node.name}' must be at least 8 characters long`
            });
          }
        }
      },
      
      TemplateElement: function(node) {
        if (node.value && node.value.raw && node.value.raw.includes("NEXT_PUBLIC_")) {
          const matches = node.value.raw.match(/NEXT_PUBLIC_[A-Z0-9_]+/g);
          
          if (matches) {
            matches.forEach(variable => {
              // Add to found variables set
              foundVariables.add(variable);
              
              if (!justifications[variable]) {
                context.report({
                  node,
                  message: `NEXT_PUBLIC variable '${variable}' requires justification in .nextpublicrc file`
                });
              } else if (justifications[variable].length < 8) {
                context.report({
                  node,
                  message: `Justification for NEXT_PUBLIC variable '${variable}' must be at least 8 characters long`
                });
              }
            });
          }
        }
      },
      
      // Report summary at the end of the program
      "Program:exit": function() {
        const count = foundVariables.size;
        if (count > 0) {
          console.log(`Found ${count} unique NEXT_PUBLIC variables in the code.`);
        } else {
            // console.log("No NEXT_PUBLIC variables were found in the code.");
        }
      }
    };
  }
};