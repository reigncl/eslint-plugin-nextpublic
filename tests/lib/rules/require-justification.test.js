/**
 * @fileoverview Tests for require-justification rule
 */

"use strict";

const rule = require("../../../lib/rules/require-justification");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester();

// Mock fs module for testing
const fs = require("fs");
const path = require("path");

// Mock implementation of fs.existsSync and fs.readFileSync
const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;

let mockJustifications = {};

// Setup before tests
beforeAll(() => {
  // Mock fs.existsSync to return true for .nextpublicrc
  fs.existsSync = jest.fn(filePath => {
    if (filePath.endsWith(".nextpublicrc")) {
      return true;
    }
    return originalExistsSync(filePath);
  });

  // Mock fs.readFileSync to return mock justifications
  fs.readFileSync = jest.fn((filePath, encoding) => {
    if (filePath.endsWith(".nextpublicrc")) {
      return JSON.stringify(mockJustifications);
    }
    return originalReadFileSync(filePath, encoding);
  });

  // Mock global object to prevent memory leak warnings
  global.eslintPluginNextPublic = {
    allFoundVariables: new Set(),
    processed: false,
    exitListenerAdded: true // Prevent adding new listeners
  };
});

// Cleanup after tests
afterAll(() => {
  fs.existsSync = originalExistsSync;
  fs.readFileSync = originalReadFileSync;
  delete global.eslintPluginNextPublic;

  if (global.eslintPluginNextPublic) {
    global.eslintPluginNextPublic.allFoundVariables.clear();
    global.eslintPluginNextPublic.processed = false;
  }
  
  // Default to empty justifications
  mockJustifications = {};
});

// Reset mocks before each test

// Tests
ruleTester.run("require-justification", rule, {
  valid: [
    // Test for justified variables
    {
      code: "const url = process.env.NEXT_PUBLIC_API_URL;",
      globals: {
        process: "readonly"
      },
      before: () => {
        mockJustifications = {
          "NEXT_PUBLIC_API_URL": "This is justified with enough characters"
        };
      }
    },
    {
      code: "const config = { url: process.env.NEXT_PUBLIC_API_URL };",
      globals: {
        process: "readonly"
      },
      before: () => {
        mockJustifications = {
          "NEXT_PUBLIC_API_URL": "This is justified with enough characters"
        };
      }
    }
  ],
  invalid: [
    // Tests for unjustified variables
    {
      code: "const url = process.env.NEXT_PUBLIC_API_KEY;",
      globals: {
        process: "readonly"
      },
      before: () => {
        mockJustifications = {}; // No justifications
      },
      errors: [
        {
          message: "NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' requires justification in .nextpublicrc file"
        }
      ]
    },
    // Test for short justification
    {
      code: "const url = process.env.NEXT_PUBLIC_API_KEY;",
      globals: {
        process: "readonly"
      },
      before: () => {
        mockJustifications = {
          "NEXT_PUBLIC_API_KEY": "Short"
        };
      },
      errors: [
        {
          message: "Justification for NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' must be at least 8 characters long"
        }
      ]
    },
    // Test for string literals
    {
      code: "const config = { key: 'NEXT_PUBLIC_API_KEY' };",
      before: () => {
        mockJustifications = {}; // No justifications
      },
      errors: [
        {
          message: "NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' requires justification in .nextpublicrc file"
        }
      ]
    },
    // Test for template literals
    {
      code: "const template = `Using ${NEXT_PUBLIC_API_KEY}`;",
      globals: {
        NEXT_PUBLIC_API_KEY: "readonly"
      },
      before: () => {
        mockJustifications = {}; // No justifications
      },
      errors: [
        {
          message: "NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' requires justification in .nextpublicrc file"
        }
      ]
    },
    // Test for process.env["NEXT_PUBLIC_XXX"]
    {
      code: "const key = process.env[\"NEXT_PUBLIC_API_KEY\"];",
      globals: {
        process: "readonly"
      },
      before: () => {
        mockJustifications = {}; // No justifications
      },
      errors: [
        {
          message: "NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' requires justification in .nextpublicrc file"
        }
      ]
    },
    // Test for multiple variables
    {
      code: `
        const url = process.env.NEXT_PUBLIC_API_URL;
        const key = process.env.NEXT_PUBLIC_API_KEY;
      `,
      globals: {
        process: "readonly"
      },
      before: () => {
        mockJustifications = {
          "NEXT_PUBLIC_API_URL": "This is justified with enough characters"
        };
      },
      errors: [
        {
          message: "NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' requires justification in .nextpublicrc file"
        }
      ]
    }
  ]
});