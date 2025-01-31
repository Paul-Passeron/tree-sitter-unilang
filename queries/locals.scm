; Scopes
(block) @local.scope

; Definitions
(variable_declaration
  name: (identifier) @local.definition)
(parameter
  name: (identifier) @local.definition)

; References
(identifier) @local.reference