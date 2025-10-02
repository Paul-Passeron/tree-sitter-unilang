; Code outline/symbol navigation for Unilang

; Include statements
(include_statement
  (module_path (identifier) @name)) @item

; Class declarations
(class_declaration
  "class" @context
  (identifier) @name) @item

; Function declarations
(function_declaration
  "let" @context
  name: (identifier) @name) @item

; Method declarations within classes
(method_declaration
  "public" @context
  name: (identifier) @name) @item

; Constructor declarations
(constructor_declaration
  "public" @context
  "new" @name) @item

; Field declarations
(field_declaration
  name: (identifier) @name) @item
