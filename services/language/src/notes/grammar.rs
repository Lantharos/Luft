/// What the notes are written as: JSON in a fixed shape, so whatever the
/// model writes can be read. Each item names the line it comes from.
pub const NOTES: &str = r#"
root ::= "{" ws "\"points\":" ws points "," ws "\"definitions\":" ws definitions "," ws "\"homework\":" ws homework "," ws "\"questions\":" ws questions ws "}"
points ::= "[" ws ( point ( "," ws point )* )? ws "]"
point ::= "{" ws "\"text\":" ws string "," ws "\"line\":" ws line ws "}"
definitions ::= "[" ws ( definition ( "," ws definition )* )? ws "]"
definition ::= "{" ws "\"term\":" ws string "," ws "\"meaning\":" ws string "," ws "\"line\":" ws line ws "}"
homework ::= "[" ws ( task ( "," ws task )* )? ws "]"
task ::= "{" ws "\"task\":" ws string "," ws "\"due\":" ws ( string | "null" ) "," ws "\"line\":" ws line ws "}"
questions ::= "[" ws ( question ( "," ws question )* )? ws "]"
question ::= "{" ws "\"question\":" ws string "," ws "\"answer\":" ws ( string | "null" ) "," ws "\"line\":" ws line ws "}"
line ::= [0-9] [0-9]? [0-9]? [0-9]?
string ::= "\"" ( [^"\\\x7F\x00-\x1F] | "\\" ["\\/bfnrt] )* "\""
ws ::= [ \t\n]{0,20}
"#;

pub const HEADING: &str = r#"
root ::= "{" ws "\"title\":" ws string "," ws "\"summary\":" ws string ws "}"
string ::= "\"" ( [^"\\\x7F\x00-\x1F] | "\\" ["\\/bfnrt] )* "\""
ws ::= [ \t\n]{0,20}
"#;
