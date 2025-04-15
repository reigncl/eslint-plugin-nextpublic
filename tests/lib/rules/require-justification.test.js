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
});

// Cleanup after tests
afterAll(() => {
  fs.existsSync = originalExistsSync;
  fs.readFileSync = originalReadFileSync;
});

// Tests
ruleTester.run("require-justification", rule, {
  valid: [
    // No valid tests since all cases will report a summary message
  ],
  invalid: [
    // Tests for justified variables
    {
      code: "const url = process.env.NEXT_PUBLIC_API_URL;",
      globals: {
        process: "readonly"
      },
      beforeEach: () => {
        mockJustifications = {
          "NEXT_PUBLIC_API_URL": "This is justified"
        };
      },
      errors: [
        {
          message: "Found 1 NEXT_PUBLIC variable in the code.",
          line: 1,
          column: 0
        }
      ]
    },
    {
      code: "const config = { url: 'NEXT_PUBLIC_API_URL' };",
      beforeEach: () => {
        mockJustifications = {
          "NEXT_PUBLIC_API_URL": "This is justified"
        };
      },
      errors: [
        {
          message: "Found 1 NEXT_PUBLIC variable in the code.",
          line: 1,
          column: 0
        }
      ]
    },
    {
      code: "const template = `Using ${NEXT_PUBLIC_API_URL}`;",
      globals: {
        NEXT_PUBLIC_API_URL: "readonly"
      },
      beforeEach: () => {
        mockJustifications = {
          "NEXT_PUBLIC_API_URL": "This is justified"
        };
      },
      errors: [
        {
          message: "Found 1 NEXT_PUBLIC variable in the code.",
          line: 1,
          column: 0
        }
      ]
    },
    // Tests for unjustified variables
    {
      code: "const url = process.env.NEXT_PUBLIC_API_KEY;",
      globals: {
        process: "readonly"
      },
      beforeEach: () => {
        mockJustifications = {}; // No justifications
      },
      errors: [
        {
          message: "NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' requires justification in .nextpublicrc file"
        },
        {
          message: "Found 1 NEXT_PUBLIC variable in the code.",
          line: 1,
          column: 0
        }
      ]
    },
    {
      code: "const config = { key: 'NEXT_PUBLIC_API_KEY' };",
      beforeEach: () => {
        mockJustifications = {}; // No justifications
      },
      errors: [
        {
          message: "NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' requires justification in .nextpublicrc file"
        },
        {
          message: "Found 1 NEXT_PUBLIC variable in the code.",
          line: 1,
          column: 0
        }
      ]
    },
    {
      code: "const template = `Using ${NEXT_PUBLIC_API_KEY}`;",
      globals: {
        NEXT_PUBLIC_API_KEY: "readonly"
      },
      beforeEach: () => {
        mockJustifications = {}; // No justifications
      },
      errors: [
        {
          message: "NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' requires justification in .nextpublicrc file"
        },
        {
          message: "Found 1 NEXT_PUBLIC variable in the code.",
          line: 1,
          column: 0
        }
      ]
    },
    // Test for no NEXT_PUBLIC variables
    {
      code: "const normalVar = 'This is a normal variable';",
      errors: [
        {
          message: "No NEXT_PUBLIC variables were found in the code.",
          line: 1,
          column: 0
        }
      ]
    }
  ]
});