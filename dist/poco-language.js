'use strict';

class Log {
    // eslint-disable-next-line no-unused-vars
    values;
    constructor() {
        this.values = [];
    }
    add(log) {
        this.values.push(log);
    }
    error(message, line) {
        this.values.push({
            type: 'error',
            message: message,
            line: line
        });
    }
}
const globalLog = new Log();

class ErrorHandler {
    log = globalLog;
    throw(message, line, column) {
        const error = line && column
            ? `\n\n${message} -- line: ${line}, column: ${column}\n`
            : `\n\n${message}\n`;
        try {
            throw new Error(error);
        }
        catch (e) {
            console.error(e);
            this.log.error(e, line);
        }
    }
}

// eslint-disable-next-line no-unused-vars
const isTokenList = {
    SYMBOLS: input => ['>=', '<=', '!=', '==', '->', '+', '-', '/', '*', '%', '=', '>', '<', '!', '(', ')', '{', '}', '|', ',', "'", '.'].includes(input),
    NUMBER: input => /^[0-9]+$/.test(input),
    IDENTIFIER: input => /^[a-zA-Z]+$/.test(input),
    WHITESPACE: input => !/\S/.test(input),
    UNRECOGNIZED: () => true
};
const reserved = ['for', 'while', 'return', 'if', 'then', 'else', 'let'];
class CharSeparator {
    input;
    charTypes;
    errorHandler;
    constructor(input) {
        this.input = input;
        this.errorHandler = new ErrorHandler();
        this.charTypes = this.getCharTypes(input);
    }
    getCharTypes(input) {
        let line = 1;
        let column = 1;
        const r = [];
        for (const char of input.split('')) {
            for (const [token, verification] of Object.entries(isTokenList)) {
                if (verification(char)) {
                    const charDescription = {
                        type: token,
                        value: char,
                        line: line,
                        column: column
                    };
                    if (charDescription.type === 'UNRECOGNIZED') {
                        this.errorHandler.throw('UNRECOGNIZED SYNTAX', charDescription.line, charDescription.column);
                    }
                    else {
                        r.push(charDescription);
                    }
                    break;
                }
            }
            if (char === '\n') {
                column = 1;
                line++;
            }
            else {
                column++;
            }
        }
        return r;
    }
}
class Lexer {
    charSeparator;
    errorHandler;
    charTypes;
    index;
    tokens;
    currentToken;
    get currentChar() { return this.charTypes[this.index]; }
    constructor(input) {
        this.charSeparator = new CharSeparator(input);
        this.errorHandler = new ErrorHandler();
        this.charTypes = this.charSeparator.charTypes;
        this.index = 0;
        this.tokens = [];
        this.run();
    }
    peakNext() {
        try {
            return this.charTypes[this.index + 1];
        }
        catch {
            return undefined;
        }
    }
    handleString() {
        this.currentToken = {
            type: 'STRING',
            value: '',
            line: this.currentChar.line,
            column: this.currentChar.column
        };
        if (this.peakNext !== undefined) {
            this.index++;
        }
        else {
            this.errorHandler.throw('EOF WHILE PARSING STRING', this.currentToken.line, this.currentToken.column);
        }
        while (this.currentChar.value !== "'") {
            this.currentToken.value += this.currentChar.value;
            this.index++;
            if (!this.currentChar) {
                this.errorHandler.throw('EOF WHILE PARSING STRING', this.currentToken.line, this.currentToken.column);
            }
        }
        this.tokens.push(this.currentToken);
        this.currentToken = undefined;
        this.index++;
        this.run();
    }
    handleNumber() {
        let hasDecimal = false;
        this.currentToken = {
            type: 'NUMBER',
            value: '',
            line: this.currentChar.line,
            column: this.currentChar.column
        };
        // Long statements to handle decimal and int numbers
        while (this.currentChar.type === 'NUMBER' || (!hasDecimal && this.currentChar.value === '.' && this.peakNext() && this.peakNext().type === 'NUMBER')) {
            if (this.currentChar.value === '.') {
                hasDecimal = true;
            }
            this.currentToken.value += this.currentChar.value;
            this.index++;
            if (!this.currentChar)
                break;
        }
        this.tokens.push(this.currentToken);
        this.currentToken = undefined;
        this.run();
    }
    handleIdentifier() {
        this.currentToken = {
            type: 'IDENTIFIER',
            value: '',
            line: this.currentChar.line,
            column: this.currentChar.column
        };
        while (this.currentChar.type === 'NUMBER' || this.currentChar.type === 'IDENTIFIER') {
            this.currentToken.value += this.currentChar.value;
            this.index++;
            if (!this.currentChar)
                break;
        }
        if (reserved.includes(this.currentToken.value)) {
            this.currentToken.type = 'STATEMENT';
        }
        this.tokens.push(this.currentToken);
        this.currentToken = undefined;
        this.run();
    }
    isDoubleCharOperator() {
        if (this.peakNext()) {
            const operatorToTest = this.currentChar.value.concat(this.peakNext().value);
            for (const [type, verification] of Object.entries(isTokenList)) {
                if (verification(operatorToTest) && (type !== 'UNRECOGNIZED')) {
                    return {
                        type: type,
                        line: this.currentChar.line,
                        column: this.currentChar.column,
                        value: operatorToTest
                    };
                }
            }
            return undefined;
        }
    }
    ;
    handleOperator() {
        if (this.currentChar.type !== 'WHITESPACE') {
            const doubleCharOperator = this.isDoubleCharOperator();
            if (doubleCharOperator) {
                this.index++;
                this.currentToken = doubleCharOperator;
            }
            else {
                this.currentToken = this.currentChar;
            }
            this.tokens.push(this.currentToken);
            this.currentToken = undefined;
        }
        this.index++;
        this.run();
    }
    run() {
        if (!this.currentChar) {
            console.log('current char undefined index', this.index);
            /**/
        }
        else if (this.currentChar.value === "'")
            this.handleString();
        else if (this.currentChar.type === 'NUMBER')
            this.handleNumber();
        else if (this.currentChar.type === 'IDENTIFIER')
            this.handleIdentifier();
        else
            this.handleOperator();
    }
}

const lexer = new Lexer("let name = 'Po Co'");
console.log(lexer.tokens);
