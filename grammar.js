module.exports = grammar({
  name: "unilang",

  extras: ($) => [/\s/, $.comment],

  rules: {
    // @ts-ignore
    source_file: ($) => repeat($._top_level_item),

    _top_level_item: ($) =>
      // @ts-ignore
      choice(
        $.include_statement,
        $.class_declaration,
        $.function_declaration,
        $.variable_declaration,
      ),

    // Include statements like @include std::io
    // @ts-ignore
    include_statement: ($) => seq("@include", $.module_path),

    module_path: ($) => sep1($.identifier, "::"),

    // Class declarations with optional generics
    class_declaration: ($) =>
      // @ts-ignore
      seq(
        "class",
        // @ts-ignore
        optional($.generic_parameters),
        $.identifier,
        "=>",
        "{",
        // @ts-ignore
        repeat($.class_member),
        "}",
      ),

    // @ts-ignore
    generic_parameters: ($) => seq("<", $.identifier, ">"),

    class_member: ($) =>
      // @ts-ignore
      choice(
        $.field_declaration,
        $.method_declaration,
        $.constructor_declaration,
      ),

    // Field declarations like "private contents: T*;"
    field_declaration: ($) =>
      // @ts-ignore
      seq(
        // @ts-ignore
        choice("private", "public"),
        // @ts-ignore
        field("name", $.identifier),
        ":",
        // @ts-ignore
        field("type", $.type),
        ";",
      ),

    // Method declarations
    method_declaration: ($) =>
      // @ts-ignore
      seq(
        "public",
        // @ts-ignore
        field("name", $.identifier),
        "(",
        // @ts-ignore
        optional($.parameter_list),
        ")",
        // @ts-ignore
        optional(seq(":", $.type)),
        "=>",
        $.block,
      ),

    // Constructor declarations
    constructor_declaration: ($) =>
      // @ts-ignore
      seq(
        "public",
        "new",
        "(",
        // @ts-ignore
        optional($.parameter_list),
        ")",
        "=>",
        $.block,
      ),

    // Function declarations like "let main(): int => { ... }"
    function_declaration: ($) =>
      // @ts-ignore
      seq(
        "let",
        // @ts-ignore
        field("name", $.identifier),
        "(",
        // @ts-ignore
        optional($.parameter_list),
        ")",
        ":",
        $.type,
        "=>",
        $.block,
      ),

    parameter_list: ($) => sep1($.parameter, ","),

    // @ts-ignore
    parameter: ($) => seq($.identifier, ":", $.type),

    // Type system
    type: ($) =>
      // @ts-ignore
      choice($.primitive_type, $.pointer_type, $.generic_type, $.identifier),

    // @ts-ignore
    primitive_type: ($) => choice("int", "char", "void", "float", "double"),

    // @ts-ignore
    pointer_type: ($) => seq($.type, "*"),

    // @ts-ignore
    generic_type: ($) => seq($.identifier, "<", $.type, ">"),

    // Variable declarations like "let x: int => 5;"
    variable_declaration: ($) =>
      // @ts-ignore
      seq("let", $.identifier, ":", $.type, "=>", $._expression, ";"),

    // Block statements
    // @ts-ignore
    block: ($) => seq("{", repeat($._statement), "}"),

    _statement: ($) =>
      // @ts-ignore
      choice(
        $.expression_statement,
        $.variable_declaration,
        $.assignment_statement,
        $.if_statement,
        $.while_statement,
        $.return_statement,
        $.block,
      ),

    // @ts-ignore
    expression_statement: ($) => seq($._expression, ";"),

    // Assignment statements like "x => 5;"
    // @ts-ignore
    assignment_statement: ($) => seq($.lvalue, "=>", $._expression, ";"),

    // @ts-ignore
    lvalue: ($) => choice($.identifier, $.member_access, $.array_access),

    // Control flow
    if_statement: ($) =>
      // @ts-ignore
      seq(
        "if",
        $._expression,
        "=>",
        $.block,
        // @ts-ignore
        optional(seq("else", $.block)),
      ),

    // @ts-ignore
    while_statement: ($) => seq("while", $._expression, "=>", $.block),

    // @ts-ignore
    return_statement: ($) => seq("return", optional($._expression), ";"),

    // Expressions
    _expression: ($) =>
      // @ts-ignore
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
        $.parenthesized_expression,
      ),

    binary_expression: ($) => {
      const table = [
        // @ts-ignore
        [9, choice("*", "/", "%")],
        // @ts-ignore
        [8, choice("+", "-")],
        // @ts-ignore
        [7, choice("<", ">", "<=", ">=")],
        // @ts-ignore
        [6, choice("==", "!=")],
        [5, "&&"],
        [4, "||"],
      ];

      // @ts-ignore
      return choice(
        ...table.map(([precedence, operator]) =>
          // @ts-ignore
          prec.left(
            precedence,
            // @ts-ignore
            seq(
              // @ts-ignore
              field("left", $._expression),
              // @ts-ignore
              field("operator", operator),
              // @ts-ignore
              field("right", $._expression),
            ),
          ),
        ),
      );
    },

    unary_expression: ($) =>
      // @ts-ignore
      prec(
        10,
        // @ts-ignore
        seq(
          // @ts-ignore
          field("operator", choice("!", "-", "&", "*")),
          // @ts-ignore
          field("operand", $._expression),
        ),
      ),

    call_expression: ($) =>
      // @ts-ignore
      seq(
        // @ts-ignore
        field("function", $._expression),
        "(",
        // @ts-ignore
        optional($.argument_list),
        ")",
      ),

    // Member access with :: operator
    member_access: ($) =>
      // @ts-ignore
      seq(
        // @ts-ignore
        field("object", $._expression),
        "::",
        // @ts-ignore
        field("property", $.identifier),
      ),

    array_access: ($) =>
      // @ts-ignore
      seq(
        // @ts-ignore
        field("array", $._expression),
        "[",
        // @ts-ignore
        field("index", $._expression),
        "]",
      ),

    // Cast expressions like "@as Vec<int>()"
    cast_expression: ($) =>
      // @ts-ignore
      seq("@as", $.type, "(", optional($.argument_list), ")"),

    // @ts-ignore
    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    argument_list: ($) => sep1($._expression, ","),

    // Literals
    // @ts-ignore
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // @ts-ignore
    number: ($) => /\d+/,

    // @ts-ignore
    string: ($) => seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),

    // @ts-ignore
    char: ($) => seq("'", choice(/[^'\\]/, /\\./), "'"),

    // Comments
    // @ts-ignore
    comment: ($) =>
      // @ts-ignore
      choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
  },
});

// Helper function for comma-separated lists
function sep1(rule, separator) {
  // @ts-ignore
  return seq(rule, repeat(seq(separator, rule)));
}
