# Snapshot report for `tests/prettier.js`

The actual snapshot is saved in `prettier.js.snap`.

Generated by [AVA](https://ava.li).

## prettier

> Should sort `prettier` as object.

    {
      input: `{␊
        "prettier": {␊
          "overrides": [],␊
          "trailingComma": "none",␊
          "semi": false,␊
          "z": "z",␊
          "a": "a"␊
        }␊
      }`,
      options: undefined,
      output: `{␊
        "prettier": {␊
          "a": "a",␊
          "semi": false,␊
          "trailingComma": "none",␊
          "z": "z",␊
          "overrides": []␊
        }␊
      }`,
      pretty: true,
    }

## prettier.overrides[]

> Should sort `prettier.override[]`

    `{␊
      "prettier": {␊
        "overrides": [␊
          {␊
            "_": "this should still the first element",␊
            "a": "a",␊
            "files": "",␊
            "options": {},␊
            "z": "z"␊
          },␊
          {␊
            "_": "this should still the seconde element",␊
            "a": "a",␊
            "files": "",␊
            "options": {},␊
            "z": "z"␊
          }␊
        ]␊
      }␊
    }`

## prettier.overrides[].options

> Should sort `prettier.overrides[].options`

    `{␊
      "prettier": {␊
        "overrides": [␊
          {␊
            "options": {␊
              "a": "a",␊
              "semi": false,␊
              "trailingComma": "none",␊
              "z": "z"␊
            }␊
          }␊
        ]␊
      }␊
    }`