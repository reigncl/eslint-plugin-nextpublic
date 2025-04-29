/**
 * @fileoverview ESLint plugin to check if NEXT_PUBLIC variables are justified in .nextpublicrc file
 */

"use strict";

module.exports = {
  rules: {
    "require-justification": require("./lib/rules/require-justification")
  },
  configs: {
    recommended: {
      plugins: ["@applydigital_latam/nextpublic"],
      rules: {
        "@applydigital_latam/nextpublic/require-justification": "error"
      }
    }
  }
};