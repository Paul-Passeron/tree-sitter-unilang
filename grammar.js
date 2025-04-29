module.exports = grammar({
  name: "unilang",
  extras: ($) => [/[\s\t\n\r]/, $.comment],
  rules: {
    source_file: ($) => repeat($._definition),

    _left_paren: ($) => "(",
    _right_paren: ($) => ")",
    _left_brace: ($) => "{",
    _right_brace: ($) => "}",
    _left_angle: ($) => "<",
    _right_angle: ($) => ">",
    _left_bracket: ($) => "[",
    _right_bracket: ($) => "]",

    _definition: ($) =>
      choice(
        $.include_directive,
        $.interface_definition,
        $.class_definition,
        $.function_definition,
        $.module_definition,
      ),

    include_directive: ($) => seq("@include", $.namespace_path),

    namespace_path: ($) => sep1(field("segment", $.identifier), "::"),

    module_definition: ($) =>
      seq(
        "module",
        $.identifier,
        $._left_brace,
        repeat($._definition),
        "}",
        $._right_brace,
      ),
    interface_definition: ($) =>
      seq(
        "interface",
        field("name", $.identifier),
        field("type", $.identifier),
        "=>",
        $._left_brace,
        repeat($.method_declaration),
        $._right_brace,
      ),

    class_definition: ($) =>
      seq(
        "class",
        optional(
          seq($._left_angle, sep1($.type_constraint, ","), $._right_angle),
        ),
        field("name", $.identifier),
        "=>",
        $._left_brace,
        sep1(choice($.field_declaration, $.method_definition), ","),
        $._right_brace,
      ),

    type_constraint: ($) =>
      seq(
        field("type", $.identifier),
        "impl",
        field("constraint", $.identifier),
      ),

    type_parameters: ($) =>
      seq($._left_angle, sep1($.identifier, ","), $._right_angle),

    field_declaration: ($) =>
      seq(
        choice("public", "private"),
        field("name", $.identifier),
        ":",
        field("type", $._type),
      ),

    method_definition: ($) =>
      seq(
        choice("public", "private"),
        field("name", $.identifier),
        $._left_paren,
        optional($.parameter_list),
        $._right_paren,
        optional(seq(":", field("return_type", $._type))),
        "=>",
        field("body", $.block),
      ),

    method_declaration: ($) =>
      seq(
        field("name", $.identifier),
        $._left_paren,
        optional($.parameter_list),
        $._right_paren,
        ":",
        field("return_type", $._type),
      ),

    function_definition: ($) =>
      seq(
        "let",
        field("name", $.identifier),
        $._left_paren,
        optional($.parameter_list),
        $._right_paren,
        ":",
        field("return_type", $._type),
        "=>",
        field("body", $.block),
      ),

    parameter_list: ($) => sep1($.parameter, ","),

    parameter: ($) =>
      seq(field("name", $.identifier), ":", field("type", $._type)),

    block: ($) => seq($._left_brace, repeat($._statement), $._right_brace),

    _statement: ($) =>
      choice(
        $.variable_declaration,
        $.assignment_statement,
        $.if_statement,
        $.while_statement,
        $.return_statement,
        $.expression_statement,
        $.block,
      ),

    variable_declaration: ($) =>
      seq(
        "let",
        field("name", $.identifier),
        ":",
        field("type", $._type),
        optional(seq("=>", field("value", $.expression))),
        ";",
      ),

    assignment_statement: ($) =>
      seq(
        field("target", $._assignable),
        "=>",
        field("value", $.expression),
        ";",
      ),

    if_statement: ($) =>
      prec.left(
        seq(
          "if",
          field("condition", $.expression),
          "=>",
          field("consequence", $._statement),
          optional(seq("else", field("alternative", $._statement))),
        ),
      ),

    while_statement: ($) =>
      seq(
        "while",
        field("condition", $.expression),
        "=>",
        field("body", $.block),
      ),

    return_statement: ($) => seq("return", optional($.expression), ";"),

    expression_statement: ($) => seq($.expression, ";"),

    expression: ($) =>
      choice(
        $.binary_expression,
        $.unary_expression,
        $.call_expression,
        $.member_access,
        $.new_expression,
        $.cast_expression,
        $.literal,
        $.identifier,
        seq($._left_paren, $.expression, $._right_paren),
      ),

    binary_expression: ($) =>
      prec.left(
        1,
        seq(
          field("left", $.expression),
          field(
            "operator",
            choice(
              "+",
              "-",
              "*",
              "/",
              "=",
              "!=",
              $._left_angle,
              $._right_angle,
              "<=",
              ">=",
              "&&",
              "||",
              "%",
            ),
          ),
          field("right", $.expression),
        ),
      ),

    unary_expression: ($) =>
      prec(
        2,
        seq(
          field("operator", choice("!", "-", "&", "$")),
          field("operand", $.expression),
        ),
      ),

    call_expression: ($) =>
      prec(
        3,
        seq(
          field("function", $._callable),
          $._left_paren,
          optional($.argument_list),
          $._right_paren,
        ),
      ),

    _callable: ($) => choice($.identifier, $.member_access),

    member_access: ($) =>
      prec(
        4,
        seq(field("object", $.expression), "::", field("member", $.identifier)),
      ),

    new_expression: ($) =>
      seq("@new", field("type", $._type), field("arguments", $.expression)),

    cast_expression: ($) =>
      seq("@as", field("type", $._type), field("value", $.expression)),

    argument_list: ($) => sep1($.expression, ","),

    _type: ($) => choice($.simple_type, $.generic_type),

    simple_type: ($) => $.identifier,

    generic_type: ($) =>
      seq(
        field("base", $.identifier),
        $._left_angle,
        sep1($._type, ","),
        $._right_angle,
      ),

    _assignable: ($) => choice($.identifier, $.member_access),

    literal: ($) =>
      choice($.number_literal, $.string_literal, $.boolean_literal),

    number_literal: ($) => /[0-9]+/,
    string_literal: ($) => /"[^"]*"/,
    boolean_literal: ($) => choice("true", "false"),
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    comment: ($) => token(seq("//", /.*/)),
  },
});

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
