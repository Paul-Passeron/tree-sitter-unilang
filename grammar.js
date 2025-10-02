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
      ),
    impl_block: ($) =>
      seq(
        "impl",
        field("templates", optional($.templates)),
        $.identifier,
        "for",
        $.type,
        "=>",
        "{",
        repeat(
          choice(
            seq("type", $.identifier, "=>", $.type, ";"),
            seq(
              choice("public", "private"),
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
          ),
        ),
        "}",
      ),
    interface_declaration: ($) =>
      seq(
        "interface",
        $.identifier, // interface name
        $.identifier, // type name
        optional(seq("impl", commaSep1($.type))),
        "=>",
        "{",
        repeat(
          choice(
            seq(
              "type",
              $.identifier,
              optional(seq("impl", commaSep1($.type))),
              ";",
            ),
            seq(
              $.identifier,
              "(",
              commaSep($.parameter),
              ")",
              ":",
              $.type,
              ";",
            ),
          ),
        ),
        "}",
      ),
    module_declaration: ($) =>
      seq("mod", $.identifier, "=>", "{", repeat($._item), "}"),
    class_declaration: ($) =>
      seq(
        "class",
        optional($.templates),
        $.identifier,
        "=>",
        "{",
        repeat($.class_items),
        "}",
      ),
    class_items: ($) =>
      seq(
        choice("public", "private"),
        choice(
          seq(
            $.identifier,
            "(",
            commaSep($.parameter),
            ")",
            optional(seq(":", $.type)),
            "=>",
            "{",
            repeat($.statement),
            "}",
          ),
          seq(
            $.identifier, //
            seq(":", $.type),
            optional(seq("=>", $.expr)),
            ";",
          ),
        ),
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
    type: ($) =>
      choice(
        prec(10, seq("(", commaSep1($.type), ")", repeat("*"))),

        prec(10, seq($.typename, optional($.templates), repeat("*"))),
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
