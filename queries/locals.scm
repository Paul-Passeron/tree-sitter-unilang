; Scopes
(function_declaration) @local.scope
(method_declaration) @local.scope
(constructor_declaration) @local.scope
(class_declaration) @local.scope
(block) @local.scope

; Definitions
(function_declaration
  name: (identifier) @local.definition.function)

(method_declaration
  name: (identifier) @local.definition.method)

(class_declaration
  (identifier) @local.definition.type)

(variable_declaration
  (identifier) @local.definition.variable)

(parameter
  (identifier) @local.definition.parameter)

(field_declaration
  name: (identifier) @local.definition.field)

; References
(identifier) @local.reference
