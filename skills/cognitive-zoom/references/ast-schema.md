# AST Schema 規範

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["question", "nodes"],
  "properties": {
    "question": { "type": "string" },
    "preferred_zoom": { "type": "number", "minimum": 0, "maximum": 4 },
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "level", "kind"],
        "properties": {
          "id": { "type": "string" },
          "parent_id": { "type": ["string", "null"] },
          "level": { "type": "integer", "minimum": 0, "maximum": 4 },
          "kind": {
            "type": "string",
            "enum": [
              "tldr", "card", "paragraph", "code", "list", "table",
              "callout", "diagram", "deep_note", "asm"
            ]
          },
          "title": { "type": ["string", "null"] },
          "content": { "type": "string" },
          "hint": { "type": "string", "maxLength": 40 },
          "code": {
            "type": "object",
            "required": ["lang", "source"],
            "properties": {
              "lang": { "type": "string" },
              "source": { "type": "string" },
              "caption": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```
