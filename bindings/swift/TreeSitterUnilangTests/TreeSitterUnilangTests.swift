import XCTest
import SwiftTreeSitter
import TreeSitterUnilang

final class TreeSitterUnilangTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_unilang())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Unilang grammar")
    }
}
