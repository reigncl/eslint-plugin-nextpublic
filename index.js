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
      plugins: ["nextpublic"],
      rules: {
        "nextpublic/require-justification": "error"
      }
    }
  }
};