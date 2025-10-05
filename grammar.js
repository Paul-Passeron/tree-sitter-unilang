/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: "unilang",
  extras: ($) => [/\s/, $.comment],

  rules: {
    source_file: ($) => repeat($._item),
    _item: ($) =>
      choice(
        $.function_declaration,
        $.module_declaration,
        $.class_declaration,
        $.interface_declaration,
        $.impl_block,
        $.include_dir,
        $.type_alias,
      ),
    type_alias: ($) =>
      seq(
        "type",
        field("aias_name", $.identifier),
        "=>",
        field("aliased", $.type),
      ),
    include_dir: ($) => seq("@include", $.typename),
    interface_declaration: ($) =>
      seq(
        "interface",
        field("interface_name", $.identifier), // interface name
        field("type_param", $.identifier), // type parameter
        optional(seq("impl", commaSep1($.type))),
        "=>",
        "{",
        repeat(
          choice($.interface_type_declaration, $.interface_method_declaration),
        ),
        "}",
      ),

    interface_type_declaration: ($) =>
      seq(
        "type",
        field("name", $.identifier),
        optional(seq("impl", commaSep1($.type))),
        ";",
      ),

    interface_method_declaration: ($) =>
      seq(
        field("name", $.identifier),
        "(",
        commaSep($.parameter),
        ")",
        ":",
        $.type,
        ";",
      ),

    impl_block: ($) =>
      seq(
        "impl",
        optional($.templates),
        field("trait_name", $.typename), // Changed from $.identifier to $.typename
        "for",
        field("target_type", $.type),
        "=>",
        "{",
        repeat(choice($.impl_type_declaration, $.impl_method)),
        "}",
      ),

    impl_type_declaration: ($) =>
      seq("type", field("name", $.identifier), "=>", $.type, ";"),

    impl_method: ($) =>
      seq(
        choice("public", "private"),
        field("name", $.identifier),
        "(",
        commaSep($.parameter),
        ")",
        ":",
        $.type,
        "=>",
        "{",
        repeat($.statement),
        "}",
      ),

    class_declaration: ($) =>
      seq(
        "class",
        optional($.templates),
        field("name", $.identifier),
        "=>",
        "{",
        repeat($.class_items),
        "}",
      ),

    class_items: ($) => choice($.class_method, $.class_field),

    class_method: ($) =>
      seq(
        choice("public", "private"),
        field("name", $.identifier),
        "(",
        commaSep($.parameter),
        ")",
        optional(seq(":", $.type)),
        "=>",
        "{",
        repeat($.statement),
        "}",
      ),

    class_field: ($) =>
      seq(
        choice("public", "private"),
        field("name", $.identifier),
        seq(":", $.type),
        optional(seq("=>", $.expr)),
        ";",
      ),
    module_declaration: ($) =>
      seq("mod", $.identifier, "=>", "{", repeat($._item), "}"),
    class_declaration: ($) =>
      seq(
        "class",
        field("templates", optional($.templates)),
        $.identifier,
        "=>",
        "{",
        repeat($.class_items),
        "}",
      ),
    function_declaration: ($) =>
      seq(
        "let",
        $.identifier,
        "(",
        commaSep($.parameter),
        ")",
        ":",
        $.type,
        "=>",
        "{",
        repeat($.statement),
        "}",
      ),

    statement: ($) =>
      choice(
        seq("return", $.expr, ";"), //
        seq($.expr, ";"),
        seq(
          "let",
          $.expr,
          optional(seq(":", $.type)),
          optional(seq("=>", $.expr)),
          ";",
        ),
        seq(
          $.expr, //
          optional(seq(":", $.type)),
          seq("=>", $.expr),
          ";",
        ),
        seq("{", repeat($.statement), "}"),
      ),
    binary_expression: ($) => {
      const table = [
        [10, "::"],
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
              field("left", $.expr),
              field("operator", operator),
              field("right", $.expr),
            ),
          ),
        ),
      );
    },

    unop: ($) => choice("-", "!", "&", "*"),
    expr: ($) =>
      choice(
        seq("(", commaSep1($.expr), ")"),
        $.binary_expression,
        prec.right(2, seq($.unop, $.expr)),
        prec.left(4, seq($.expr, "(", commaSep($.expr), ")")), // function call
        prec.left(4, seq($.expr, "[", $.expr, "]")), // indexing
        "@todo",
        prec(5, seq("@new", $.type, seq("(", commaSep($.expr), ")"))), // Remove the choice
        prec(5, seq("@as", $.type, seq("(", commaSep($.expr), ")"))),
        prec(5, seq("@size", "(", $.type, ")")),
        prec(5, seq("@repr", "(", $.type, ")")),
        $.identifier,
        $.number,
        $.char,
        $.string,
      ),
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    number: ($) => /\d+/,
    string: ($) => seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),
    char: ($) => seq("'", choice(/[^'\\]/, /\\./), "'"),
    comment: ($) =>
      choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),

    parameter: ($) => seq($.identifier, ":", $.type),
    templates: ($) => seq("<", commaSep1($.type), ">"),
    typename: ($) => prec.left(multipleSep1($.identifier, "::")),

    builtin_type: ($) =>
      choice(
        "i8",
        "i16",
        "i32",
        "i64",
        "u8",
        "u16",
        "u32",
        "u64",
        "f32",
        "f64",
        "bool",
        "void",
        "char",
      ),

    // Update the type rule to include builtin types
    type: ($) =>
      choice(
        prec(10, seq("(", commaSep1($.type), ")", repeat("*"))),
        prec(10, seq($.typename, optional($.templates), repeat("*"))),
        prec(11, seq($.builtin_type, repeat("*"))), // Add this line
      ),
  },
});

function commaSep1(rule) {
  return multipleSep1(rule, ",");
}

function commaSep(rule) {
  return multipleSep(rule, ",");
}

function multipleSep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}

function multipleSep(rule, sep) {
  return optional(multipleSep1(rule, sep));
}
