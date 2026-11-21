# Level 1 — The language

You can read a small Go program and write one that compiles, returns errors, and cleans up with `defer`.

Nothing in this level is an interview trick. It is the grammar the later levels assume.

Official pages: [Tour of Go](https://go.dev/tour/), [Effective Go](https://go.dev/doc/effective_go), [How to write Go code](https://go.dev/doc/code).

## 1. A program is a package

Every file starts with `package`. The program you run is package `main` and has a function `main`. Other packages are libraries. The import path is how you name them.

```go
package main

import "fmt"

func main() {
    fmt.Println("hello")
}
```

Create a folder, then:

```bash
go mod init example.com/hello
go run .
```

`go.mod` records the module path and the language version. The `go` line is the language version your code is written for. Installing a newer toolchain does not change that line by itself.

`gofmt` is the formatter. Run `gofmt -w .` or let the editor do it on save. Go has one standard layout. Do not invent another.

Names that start with a capital letter are exported. `Balance` is visible to other packages. `balance` is not. There is no `public` keyword.

## 2. Zero values

A variable with no explicit value holds the zero value of its type.

| Type | Zero |
| --- | --- |
| numeric (`int`, `float64`, …) | `0` |
| `bool` | `false` |
| `string` | `""` |
| pointer, slice, map, channel, function, interface | `nil` |

Declare with `var` when the zero value is what you want. Use `:=` when you are setting a real starting value.

```go
var n int          // 0
name := "ada"      // string, inferred
const pi = 3.14159
```

`:=` declares at least one new name. `=` assigns to names that already exist. Inside a nested block, `:=` can accidentally create a new variable with the same name. Later levels hit this with `err`.

Constants can be untyped until they are used. `iota` numbers a block of constants, starting at 0.

```go
const (
    StatusNew int = iota // 0
    StatusOpen           // 1
    StatusClosed         // 2
)
```

Prefer a named type when a bare `int` would let any number through. Level 3 builds constructors on top of this.

## 3. Types you use every day

```text
bool
int int8 int16 int32 int64
uint uint8 uint16 uint32 uint64 uintptr
float32 float64
string
byte   // alias of uint8
rune   // alias of int32, one Unicode code point
```

`int` is 32 or 64 bits depending on the machine. For money, time durations you store yourself, and protocol fields, pick a sized type: `int64` paise, not `float64` rupees. Binary floating point cannot represent 0.10 exactly.

Conversion is explicit. `int64(n)` is a conversion. It is not a function call you can overload.

```go
var n int = 3
var f float64 = float64(n)
```

## 4. Control flow

`if` does not need parentheses. An `if` can start with a short statement. The name exists only inside the `if` and the `else`.

```go
if n < 0 {
    return fmt.Errorf("amount %d is negative", n)
}
```

`for` is the only loop. The three-part form, the condition form, and `for {}` (forever) are the same keyword.

```go
for i := 0; i < 3; i++ {
    fmt.Println(i)
}

// Go 1.22 and later: the integer range
for i := range 3 {
    fmt.Println(i)
}
```

`switch` does not fall through. `break` is already implied. `fallthrough` exists and is rare. A switch with no value switches on `true`, which is how you write a chain of conditions.

```go
switch {
case n < 0:
    return fmt.Errorf("negative")
case n == 0:
    return fmt.Errorf("zero")
default:
    return nil
}
```

## 5. Functions

A function can return several values. The last one is often `error`. Check it at the call. Do not store it and look later.

```go
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, fmt.Errorf("divide by zero")
    }
    return a / b, nil
}

func main() {
    q, err := divide(10, 2)
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(q)
}
```

Named result parameters exist. Use them when a `defer` must change the returned error (level 3). A naked `return` with named results is hard to read. Prefer an explicit `return err`.

Functions are values. You can pass them.

```go
func apply(n int, f func(int) int) int {
    return f(n)
}
```

## 6. defer

`defer` schedules a call to run when the function returns. Calls run last in, first out. Arguments are evaluated at the `defer` line, not when the call runs.

```go
func readFirst(path string) (byte, error) {
    f, err := os.Open(path)
    if err != nil {
        return 0, err
    }
    defer f.Close()

    var buf [1]byte
    _, err = f.Read(buf[:])
    return buf[0], err
}
```

`defer` inside a loop waits until the enclosing function returns. A loop that opens a thousand files will hold them all. Close inside the loop, or move one iteration into its own function so the `defer` runs each call. Level 4 shows that with `io`.

## 7. A shape you will repeat

Read an integer, reject bad input, print a result. This is the whole level in one file.

```go
package main

import (
    "fmt"
    "os"
    "strconv"
)

func double(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("parse %q: %w", s, err)
    }
    if n < 0 {
        return 0, fmt.Errorf("negative: %d", n)
    }
    return n * 2, nil
}

func main() {
    if len(os.Args) != 2 {
        fmt.Fprintln(os.Stderr, "usage: double <n>")
        os.Exit(2)
    }
    n, err := double(os.Args[1])
    if err != nil {
        fmt.Fprintln(os.Stderr, err)
        os.Exit(1)
    }
    fmt.Println(n)
}
```

`%w` wraps the error so a caller can unwrap it. Level 3 is where that matters. Use it now so the habit is already there.

`os.Exit` skips `defer`. Return from `main` when you still need cleanup. `os.Exit` is for a process that is done.

## 8. What the compiler will not do

Go has no exceptions for ordinary failure, no classes, no inheritance, and no implicit numeric conversion. The later levels replace those ideas with return values, interfaces, and embedding.

A compile error is the tool. Read the first line. `go vet` and `staticcheck` catch a second class of mistakes after it compiles. You install a linter in level 4. For now, `go vet ./...` is enough.

## Practice

In `example.com/level1`:

1. `go mod init`, then a `main` that prints the integers from 1 to 20 and replaces multiples of 3 with `fizz`, multiples of 5 with `buzz`, and both with `fizzbuzz`.
2. A function `parsePaise(s string) (int64, error)` that accepts `"12.50"` and returns `1250`, rejects more than two decimal places, and rejects a leading minus.
3. A function that opens a file path from the first argument, `defer`s `Close`, and prints the length of the file (`Stat`). Check every error.

## Exit checklist

- You can create a module and run it with `go run .`.
- You can say what the zero value of `int`, `string`, and a pointer is.
- You write `if err != nil` at the call that returned the error.
- You can explain when `defer` runs, and why a `defer` in a loop is the wrong close.
- `gofmt` has been run on the practice files.

Next: [level-02-values.md](level-02-values.md).
