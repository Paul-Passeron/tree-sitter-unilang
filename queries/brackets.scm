; Bracket matching rules for Unilang

; Standard brackets
("[" @open "]" @close)
("(" @open ")" @close)
("{" @open "}" @close)

; Angle brackets for generics
("<" @open ">" @close)

; String delimiters
("\"" @open "\"" @close)
("'" @open "'" @close)

