; Indentation rules for Unilang

; Increase indent after opening braces
[
  "{"
] @indent

; Decrease indent before closing braces
[
  "}"
] @outdent

; Control flow structures that should indent their bodies
[
  (if_statement)
  (while_statement)
  (class_declaration)
  (function_declaration)
  (method_declaration)
  (constructor_declaration)
  (block)
] @indent
