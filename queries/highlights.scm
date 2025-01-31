; Keywords
[
  "class"
  "interface"
  "public"
  "private"
  "let"
  "while"
  "if"
  "else"
  "return"
  "impl"
  "self"
] @keyword

; Special keywords
[
  "@include"
  "@new"
  "@as"
] @keyword.directive

; Operators
[
  "=>"
  "::"
  "="
  "+"
  "-"
  "*"
  "/"
  "<"
  ">"
  "<="
  ">="
  "!="
  "&&"
  "||"
] @operator

; Types
(simple_type) @type
(generic_type
  base: (identifier) @type)

; Type constraints
(type_constraint
  type: (identifier) @type
  constraint: (identifier) @type.builtin)

; Function and method declarations
(function_definition
  name: (identifier) @function)
(method_definition
  name: (identifier) @function.method)
(method_declaration
  name: (identifier) @function.method)

; Parameters
(parameter
  name: (identifier) @variable.parameter)

; Variable declarations
(variable_declaration
  name: (identifier) @variable)

; Field declarations
(field_declaration
  name: (identifier) @variable.member)

; Member access
(member_access
  member: (identifier) @variable.member)

; Function calls
(call_expression
  function: (identifier) @function)

; Literals
(number_literal) @number
(string_literal) @string
(boolean_literal) @boolean

; Comments
(comment) @comment

; Namespaces
(namespace_path
  segment: (identifier) @namespace)

; Class names
(class_definition
  name: (identifier) @type)
(interface_definition
  name: (identifier) @type)