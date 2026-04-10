import globals from "globals";

export default [
    {
        ignores: [
            "media/",
            "dist/"
        ]
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                ...globals.commonjs,
                ...globals.node,
                ...globals.mocha
            },
            ecmaVersion: 2022,
            sourceType: "module",
        },
        rules: {
            "no-const-assign": "warn",
            "no-this-before-super": "warn",
            "no-undef": "warn",
            "no-unreachable": "warn",
            "no-unused-vars": "warn",
            "constructor-super": "warn",
            "valid-typeof": "warn",
            "curly": "warn",
            "semi": "warn",
        },
    }
];