import React, { useState, useEffect, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { X, Delete, ChevronDown } from "lucide-react";

class MathParser {
    private tokens: string[] = [];
    private index: number = 0;
    private useDegrees: boolean = false;

    constructor(expression: string, useDegrees: boolean) {
        this.useDegrees = useDegrees;
        this.tokenize(expression);
    }

    private tokenize(expr: string) {
        let sanitized = expr
            .replace(/\s+/g, "")
            .replace(/mod/gi, "%")
            .replace(/pi/gi, Math.PI.toString())
            .replace(/e/gi, Math.E.toString());

        const regex = /\d+(\.\d+)?|[+\-*/^!()%]|sin|cos|tan|ln|log|sqrt/gi;
        let match;
        this.tokens = [];
        while ((match = regex.exec(sanitized)) !== null) {
            this.tokens.push(match[0].toLowerCase());
        }
        this.index = 0;
    }

    private peek(): string | null {
        return this.index < this.tokens.length ? this.tokens[this.index] : null;
    }

    private consume(): string {
        return this.tokens[this.index++];
    }

    public parse(): number {
        if (this.tokens.length === 0) return 0;
        const val = this.parseExpression();
        if (this.index < this.tokens.length) {
            throw new Error("Unexpected character: " + this.tokens[this.index]);
        }
        return val;
    }

    private parseExpression(): number {
        let left = this.parseTerm();
        while (true) {
            const next = this.peek();
            if (next === "+" || next === "-") {
                this.consume();
                const right = this.parseTerm();
                if (next === "+") left += right;
                else left -= right;
            } else {
                break;
            }
        }
        return left;
    }

    private parseTerm(): number {
        let left = this.parseFactor();
        while (true) {
            const next = this.peek();
            if (next === "*" || next === "/" || next === "%") {
                this.consume();
                const right = this.parseFactor();
                if (next === "*") {
                    left *= right;
                } else if (next === "/") {
                    if (right === 0) throw new Error("Divide by zero");
                    left /= right;
                } else {
                    left = left % right;
                }
            } else {
                break;
            }
        }
        return left;
    }

    private parseFactor(): number {
        let left = this.parsePrimary();
        while (true) {
            const next = this.peek();
            if (next === "^") {
                this.consume();
                const right = this.parseFactor(); // Exponents are right-associative
                left = Math.pow(left, right);
            } else if (next === "!") {
                this.consume();
                left = this.factorial(left);
            } else {
                break;
            }
        }
        return left;
    }

    private parsePrimary(): number {
        const token = this.peek();
        if (token === null) throw new Error("Unexpected end of expression");

        if (token === "-") {
            this.consume();
            return -this.parsePrimary();
        }
        if (token === "+") {
            this.consume();
            return this.parsePrimary();
        }

        if (token === "(") {
            this.consume();
            const val = this.parseExpression();
            if (this.consume() !== ")") throw new Error("Mismatched brackets");
            return val;
        }

        if (["sin", "cos", "tan", "ln", "log", "sqrt"].includes(token)) {
            this.consume();
            if (this.peek() !== "(") throw new Error("Expected '(' after " + token);
            this.consume();
            let arg = this.parseExpression();
            if (this.consume() !== ")") throw new Error("Mismatched brackets");

            switch (token) {
                case "sin":
                    if (this.useDegrees) arg = (arg * Math.PI) / 180;
                    return Math.sin(arg);
                case "cos":
                    if (this.useDegrees) arg = (arg * Math.PI) / 180;
                    return Math.cos(arg);
                case "tan":
                    if (this.useDegrees) arg = (arg * Math.PI) / 180;
                    return Math.tan(arg);
                case "ln":
                    if (arg <= 0) throw new Error("Domain error (ln)");
                    return Math.log(arg);
                case "log":
                    if (arg <= 0) throw new Error("Domain error (log)");
                    return Math.log10(arg);
                case "sqrt":
                    if (arg < 0) throw new Error("Negative square root");
                    return Math.sqrt(arg);
            }
        }

        const num = parseFloat(token);
        if (isNaN(num)) {
            throw new Error("Invalid token: " + token);
        }
        this.consume();
        return num;
    }

    private factorial(n: number): number {
        if (n < 0 || !Number.isInteger(n)) throw new Error("Invalid factorial");
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }
}

export function evaluateExpression(expr: string, useDegrees: boolean = false): number {
    try {
        const parser = new MathParser(expr, useDegrees);
        const result = parser.parse();
        if (Math.abs(result) < 1e-12) return 0;
        return Number(result.toFixed(10).replace(/\.?0+$/, ""));
    } catch (e: any) {
        throw new Error(e.message || "Syntax Error");
    }
}

interface VirtualCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
    useRealisticTheme?: boolean;
}

export function VirtualCalculator({ isOpen, onClose, useRealisticTheme = true }: VirtualCalculatorProps) {
    const [inputVal, setInputVal] = useState("");
    const [resultVal, setResultVal] = useState<string>("");
    const [useDegrees, setUseDegrees] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragControls = useDragControls();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleEvaluate();
            } else if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [inputVal, useDegrees]);

    const handleKeyPress = (char: string) => {
        setInputVal(prev => prev + char);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleClear = () => {
        setInputVal("");
        setResultVal("");
    };

    const handleBackspace = () => {
        setInputVal(prev => prev.slice(0, -1));
    };

    const handleEvaluate = () => {
        if (!inputVal.trim()) return;
        try {
            const evaluated = evaluateExpression(inputVal, useDegrees);
            setResultVal(evaluated.toString());
        } catch (err: any) {
            setResultVal(err.message || "Syntax Error");
        }
    };

    const calculateOneOverX = () => {
        if (!inputVal) return;
        try {
            const expr = `1/(${inputVal})`;
            const evaluated = evaluateExpression(expr, useDegrees);
            setInputVal(expr);
            setResultVal(evaluated.toString());
        } catch (err: any) {
            setResultVal("Syntax Error");
        }
    };

    const toggleSign = () => {
        if (inputVal.startsWith("-")) {
            setInputVal(prev => prev.slice(1));
        } else {
            setInputVal(prev => "-" + prev);
        }
    };

    const borderClass = useRealisticTheme ? "rounded-none border border-slate-700" : "rounded-2xl border border-border shadow-xl";
    const headerClass = useRealisticTheme
        ? "bg-slate-800 text-white cursor-move flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider font-sans select-none"
        : "bg-slate-100 dark:bg-slate-900 text-foreground cursor-move flex items-center justify-between px-4 py-3 text-sm font-bold font-sans select-none";

    const keyStyle = (type: "num" | "op" | "fn" | "eq" | "clear") => {
        let base = "h-9 text-xs font-semibold select-none flex items-center justify-center transition-all duration-100 cursor-pointer ";

        if (useRealisticTheme) {
            base += "rounded-none ";
            if (type === "num") base += "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground";
            else if (type === "op") base += "bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-650 text-foreground";
            else if (type === "fn") base += "bg-slate-400/30 hover:bg-slate-400/50 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 text-foreground/90";
            else if (type === "eq") base += "bg-emerald-600 hover:bg-emerald-700 text-white font-bold";
            else base += "bg-red-500 hover:bg-red-600 text-white";
        } else {
            base += "rounded-lg shadow-sm border border-border/40 ";
            if (type === "num") base += "bg-card hover:bg-muted text-foreground";
            else if (type === "op") base += "bg-muted/80 hover:bg-muted text-foreground";
            else if (type === "fn") base += "bg-primary/5 hover:bg-primary/10 text-primary";
            else if (type === "eq") base += "bg-primary hover:bg-primary/90 text-primary-foreground font-bold";
            else base += "bg-destructive hover:bg-destructive/90 text-destructive-foreground";
        }
        return base;
    };

    if (!isOpen) return null;

    return (
        <motion.div
            drag
            dragMomentum={false}
            dragControls={dragControls}
            dragListener={false}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed z-[90] w-[340px] bg-background text-card-foreground shadow-2xl flex flex-col overflow-hidden ${borderClass}`}
            style={{ top: "15%", left: "calc(50% - 170px)" }}
        >
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className={headerClass}
                style={{ touchAction: "none" }}
            >
                <span className="flex items-center gap-1.5 font-sans">
                    <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Scientific Calculator
                </span>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 flex flex-col gap-1 border-b border-border font-sans">
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full text-right bg-transparent border-none text-sm font-semibold tracking-wide text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                    placeholder="Enter mathematical formula..."
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                />
                <div className="text-right text-base font-black font-mono tracking-tight text-emerald-500 min-h-6 break-all">
                    {resultVal}
                </div>
            </div>

            <div className="p-2 bg-card grid grid-cols-6 gap-1 font-sans">
                <button
                    onClick={() => setUseDegrees(prev => !prev)}
                    className={`${keyStyle("fn")} font-bold text-[10px]`}
                >
                    {useDegrees ? "DEG" : "RAD"}
                </button>
                <button onClick={() => handleKeyPress("sin(")} className={keyStyle("fn")}>sin</button>
                <button onClick={() => handleKeyPress("cos(")} className={keyStyle("fn")}>cos</button>
                <button onClick={() => handleKeyPress("tan(")} className={keyStyle("fn")}>tan</button>
                <button onClick={() => handleKeyPress("ln(")} className={keyStyle("fn")}>ln</button>
                <button onClick={() => handleKeyPress("log(")} className={keyStyle("fn")}>log</button>

                <button onClick={() => handleKeyPress("pi")} className={`${keyStyle("fn")} font-mono`}>π</button>
                <button onClick={() => handleKeyPress("e")} className={`${keyStyle("fn")} font-mono`}>e</button>
                <button onClick={() => handleKeyPress("^")} className={keyStyle("fn")}>^</button>
                <button onClick={() => handleKeyPress("sqrt(")} className={keyStyle("fn")}>√</button>
                <button onClick={() => handleKeyPress("(")} className={keyStyle("fn")}>(</button>
                <button onClick={() => handleKeyPress(")")} className={keyStyle("fn")}>)</button>

                <button onClick={handleClear} className={keyStyle("clear")}>C</button>
                <button onClick={handleBackspace} className={`${keyStyle("op")} py-1`} aria-label="Backspace">
                    <Delete className="h-4 w-4" />
                </button>
                <button onClick={() => handleKeyPress("mod")} className={keyStyle("op")}>mod</button>
                <button onClick={() => handleKeyPress("!")} className={keyStyle("op")}>!</button>
                <button onClick={() => handleKeyPress("/")} className={keyStyle("op")}>/</button>
                <button onClick={() => handleKeyPress("%")} className={keyStyle("op")}>%</button>

                <button onClick={() => handleKeyPress("7")} className={keyStyle("num")}>7</button>
                <button onClick={() => handleKeyPress("8")} className={keyStyle("num")}>8</button>
                <button onClick={() => handleKeyPress("9")} className={keyStyle("num")}>9</button>
                <button onClick={() => handleKeyPress("*")} className={keyStyle("op")}>*</button>
                <button onClick={calculateOneOverX} className={keyStyle("op")}>1/x</button>
                <div className="bg-transparent" />

                <button onClick={() => handleKeyPress("4")} className={keyStyle("num")}>4</button>
                <button onClick={() => handleKeyPress("5")} className={keyStyle("num")}>5</button>
                <button onClick={() => handleKeyPress("6")} className={keyStyle("num")}>6</button>
                <button onClick={() => handleKeyPress("-")} className={keyStyle("op")}>-</button>
                <div className="bg-transparent" />
                <div className="bg-transparent" />

                <button onClick={() => handleKeyPress("1")} className={keyStyle("num")}>1</button>
                <button onClick={() => handleKeyPress("2")} className={keyStyle("num")}>2</button>
                <button onClick={() => handleKeyPress("3")} className={keyStyle("num")}>3</button>
                <button onClick={() => handleKeyPress("+")} className={keyStyle("op")}>+</button>
                <div className="bg-transparent" />
                <div className="bg-transparent" />

                <button onClick={toggleSign} className={keyStyle("num")}>+/-</button>
                <button onClick={() => handleKeyPress("0")} className={keyStyle("num")}>0</button>
                <button onClick={() => handleKeyPress(".")} className={keyStyle("num")}>.</button>
                <button onClick={handleEvaluate} className={`${keyStyle("eq")} col-span-3`}>=</button>
            </div>
        </motion.div>
    );
}
