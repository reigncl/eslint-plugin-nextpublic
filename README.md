# eslint-plugin-nextpublic

ESLint plugin to verify that NEXT_PUBLIC variables are justified in a .nextpublicrc file. The justification text should have a minimum length of 20 characters.

## Installation

First, you need to install [ESLint](https://eslint.org/):

```bash
npm i eslint --save-dev
```

Then, install `@applydigital_latam/eslint-plugin-nextpublic`:

```bash
npm i -D @applydigital_latam/eslint-plugin-nextpublic
```

## Usage

Add `nextpublic` to the plugins section in your `.eslintrc` file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["@applydigital_latam/eslint-plugin-nextpublic"]
}
```

Then configure the rules you want to use:

```json
{
  "rules": {
    "@applydigital_latam/eslint-plugin-nextpublic/require-justification": "error"
  }
}
```

Or use the recommended configuration:

```json
{
  "extends": ["plugin:@applydigital_latam/eslint-plugin-nextpublic/recommended"]
}
```

Important: You must use "--no-cache" flag when running ESLint to ensure that the plugin is loading the env vars and the justification file correctly on each execution.

## Rules

### require-justification

This rule verifies that all environment variables starting with `NEXT_PUBLIC_` have a justification in the `.nextpublicrc` file.

## .nextpublicrc File

You must create a `.nextpublicrc` file in the root of your project with justifications for each NEXT_PUBLIC variable:

```
NEXT_PUBLIC_API_URL="This URL is public because it is necessary for client API calls"
NEXT_PUBLIC_FEATURE_FLAG="This flag is public because it controls features visible on the client"
```

Alternatively, you can use JSON format:

```json
{
  "NEXT_PUBLIC_API_URL": "This URL is public because it is necessary for client API calls",
  "NEXT_PUBLIC_FEATURE_FLAG": "This flag is public because it controls features visible on the client"
}
```

## Example

If you have a `NEXT_PUBLIC_API_KEY` variable in your code but haven't justified it in the `.nextpublicrc` file, ESLint will show an error:

```
error: NEXT_PUBLIC variable 'NEXT_PUBLIC_API_KEY' requires justification in .nextpublicrc file
```

To resolve this error, you must add a justification in the `.nextpublicrc` file:

```
NEXT_PUBLIC_API_KEY="It's public because we have no issues sharing the URL, it's safe to have it public"
```