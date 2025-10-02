; Keywords
[
  "class"
  "let"
  "if"
  "else"
  "while"
  "return"
  "interface"
] @keyword

; Control flow keywords
[
  "if"
  "else"
  "while"
  "return"
] @keyword.control

; Storage modifiers
[
  "public"
  "private"
] @keyword.storage.modifier

; Built-in types
[
  "int"
  "i8"
  "i16"
  "i32"
  "i64"
  "u8"
  "u16"
  "u32"
  "u64"
  "char"
  "void"
  "float"
  "double"
] @type.builtin

; Special operators and directives
[
  "@include"
  "@as"
  "@size"
] @keyword.directive

; Assignment and member access operators
[
  "=>"
  "::"
] @operator

; Standard operators
[
  "+"
  "-"
  "*"
  "/"
  "%"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "&&"
  "||"
  "!"
  "&"
] @operator

; Punctuation
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "<"
  ">"
] @punctuation.bracket

[
  ","
  ";"
  ":"
] @punctuation.delimiter

; Literals
(number) @constant.numeric
(string) @string
(char) @character

; Comments
(comment) @comment

; Identifiers and function names
(identifier) @variable

; Class names in declarations
(class_declaration
  (identifier) @type)

; Interface names in declarations
(interface_declaration
  name: (identifier) @type)

; Function names in declarations
(function_declaration
  name: (identifier) @function)

; Method names in declarations
(method_declaration
  name: (identifier) @function.method)

; Constructor declarations
(constructor_declaration) @constructor

; Function/method calls
(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (member_access
    property: (identifier) @function.method.call))

; Member access
(member_access
  property: (identifier) @property)

; Type references
(type (identifier) @type)

; Generic type parameters
(generic_parameters (identifier) @type.parameter)

; Include statements
(module_path (identifier) @module)

; Interface member method names
(interface_members
  name: (identifier) @function.method)
