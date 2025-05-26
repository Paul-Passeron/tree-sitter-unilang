module.exports = grammar({
  name: "unilang",

  extras: ($) => [/\s/, $.comment],

  rules: {
    source_file: ($) => repeat($._top_level_item),

    _top_level_item: ($) =>
      choice(
        $.include_statement,
        $.class_declaration,
        $.function_declaration,
        $.variable_declaration,
      ),

    // Include statements like @include std::io
    include_statement: ($) => seq(token("@include"), $.module_path),

    module_path: ($) => sep1($.identifier, "::"),

    // Class declarations with optional generics
    class_declaration: ($) =>
      seq(
        "class",
        optional($.generic_parameters),
        $.identifier,
        "=>",
        "{",
        repeat($.class_member),
        "}",
      ),

    generic_parameters: ($) => seq("<", sep1($.identifier, ","), ">"),

    class_member: ($) =>
      choice(
        $.field_declaration,
        $.method_declaration,
        $.constructor_declaration,
      ),

    // Field declarations like "private contents: T*;"
    field_declaration: ($) =>
      seq(
        choice("private", "public"),
        field("name", $.identifier),
        ":",
        field("type", $.type),
        ";",
      ),

    // Method declarations
    method_declaration: ($) =>
      seq(
        "public",
        field("name", $.identifier),
        "(",
        optional($.parameter_list),
        ")",
        optional(seq(":", $.type)),
        "=>",
        $.block,
      ),

    // Constructor declarations
    constructor_declaration: ($) =>
      seq("public", "new", "(", optional($.parameter_list), ")", "=>", $.block),

    // Function declarations like "let main(): int => { ... }"
    function_declaration: ($) =>
      seq(
        "let",
        field("name", $.identifier),
        "(",
        optional($.parameter_list),
        ")",
        ":",
        $.type,
        "=>",
        $.block,
      ),

    parameter_list: ($) => sep1($.parameter, ","),

    parameter: ($) => seq($.identifier, ":", $.type),

    // Type system
    type: ($) =>
      choice(
        $.primitive_type,
        $.pointer_type,
        prec(1, $.generic_type),
        $.identifier,
      ),

    primitive_type: ($) => choice("int", "char", "void", "float", "double"),

    pointer_type: ($) => prec.left(2, seq($.type, "*")),

    generic_type: ($) =>
      prec(2, seq($.identifier, "<", sep1($.type, ","), ">")),

    // Variable declarations like "let x: int => 5;"
    variable_declaration: ($) =>
      seq("let", $.identifier, ":", $.type, "=>", $._expression, ";"),

    // Block statements
    block: ($) => seq("{", repeat($._statement), "}"),

    _statement: ($) =>
      choice(
        $.expression_statement,
        $.variable_declaration,
        $.assignment_statement,
        $.if_statement,
        $.while_statement,
        $.return_statement,
        $.block,
      ),

    expression_statement: ($) => seq($._expression, ";"),

    // Assignment statements like "x => 5;"
    assignment_statement: ($) => seq($.lvalue, "=>", $._expression, ";"),

    lvalue: ($) => choice($.identifier, $.member_access, $.array_access),

    // Control flow
    if_statement: ($) =>
      seq("if", $._expression, "=>", $.block, optional(seq("else", $.block))),

    while_statement: ($) => seq("while", $._expression, "=>", $.block),

    return_statement: ($) => seq("return", optional($._expression), ";"),

    // Expressions
    _expression: ($) =>
      choice(
        $.identifier,
        $.number,
        $.string,
        $.char,
        $.binary_expression,
        $.unary_expression,
        $.call_expression,
        $.member_access,
        $.array_access,
        $.cast_expression,
        $.size_expression,
        $.parenthesized_expression,
      ),

    binary_expression: ($) => {
      const table = [
        [9, choice("*", "/", "%")],
        [8, choice("+", "-")],
        [7, choice("<", ">", "<=", ">=")],
        [6, choice("==", "!=")],
        [5, "&&"],
        [4, "||"],
      ];

      return choice(
        ...table.map(([precedence, operator]) =>
          prec.left(
            precedence,
            seq(
              field("left", $._expression),
              field("operator", operator),
              field("right", $._expression),
            ),
          ),
        ),
      );
    },

    unary_expression: ($) =>
      prec(
        10,
        seq(
          field("operator", choice("!", "-", "&", "*")),
          field("operand", $._expression),
        ),
      ),

    call_expression: ($) =>
      seq(
        field("function", $._expression),
        "(",
        optional($.argument_list),
        ")",
      ),

    // Member access with :: operator
    member_access: ($) =>
      seq(
        field("object", $._expression),
        "::",
        field("property", $.identifier),
      ),

    array_access: ($) =>
      seq(
        field("array", $._expression),
        "[",
        field("index", $._expression),
        "]",
      ),

    // Cast expressions like "@as Vec<int>()"
    cast_expression: ($) =>
      seq(token("@as"), $.type, "(", optional($.argument_list), ")"),

    // Size expressions like "@size T"
    size_expression: ($) => prec(3, seq(token("@size"), $.type)),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    argument_list: ($) => sep1($._expression, ","),

    // Literals
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number: ($) => /\d+/,

    string: ($) => seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),

    char: ($) => seq("'", choice(/[^'\\]/, /\\./), "'"),

    // Comments
    comment: ($) =>
      choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
  },
});

// Helper function for comma-separated lists
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
