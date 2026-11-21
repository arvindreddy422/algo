# Level 4 — Programs, tests, and the standard library

You can split code into packages, test it, and use the `io` and `time` pieces every later level sits on.

Official pages: [Modules](https://go.dev/doc/modules/layout), [internal packages](https://go.dev/doc/go1.4#internalpackages), [Add a test](https://go.dev/doc/tutorial/add-a-test), [Fuzzing](https://go.dev/doc/security/fuzz/), [`testing` package](https://pkg.go.dev/testing).

## 1. Layout

```text
example.com/ledger/
  go.mod
  cmd/ledger/main.go      // the program, thin
  internal/money/money.go // importable only inside this module tree
  internal/money/money_test.go
  NOTES.md
```

The module path plus the directory is the import path. `internal/` is importable only by the parent tree. Another module cannot import `example.com/ledger/internal/money`.

Major version 2 and up is part of the path: `example.com/mod/v2`. Commit `go.sum`. A `replace` directive that points at your laptop breaks everyone else. `go.work` is for local multi-module work. It is not something you commit as the way the build finds packages.

`main` parses flags, builds dependencies, and calls `Run`. The behavior lives in a package you can test without starting a process.

## 2. Table tests

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name string
        a, b Money
        want int64
        err  error
    }{
        {name: "ok", a: Money{100, "INR"}, b: Money{50, "INR"}, want: 150},
        {name: "mismatch", a: Money{100, "INR"}, b: Money{50, "USD"}, err: ErrMismatch},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := tt.a.Add(tt.b)
            if tt.err != nil {
                if !errors.Is(err, tt.err) {
                    t.Fatalf("err = %v, want %v", err, tt.err)
                }
                return
            }
            if err != nil {
                t.Fatal(err)
            }
            if got.Paise != tt.want {
                t.Fatalf("paise = %d, want %d", got.Paise, tt.want)
            }
        })
    }
}
```

`t.Parallel()` runs the subtest alongside others. It is safe when the test does not share mutable package state. `t.TempDir()` is a directory the test framework deletes.

`go test ./...` runs every package. `go test -count=1` skips the cache when you are chasing a flake. `go test -race ./...` comes in level 5. Turn it on as soon as two goroutines exist.

## 3. Fuzz and benchmarks, lightly

A fuzz test throws random bytes at a parser until it panics or fails an invariant. You will use this on a binary frame in the key-value project. The shape:

```go
func FuzzParse(f *testing.F) {
    f.Add([]byte("12.50"))
    f.Fuzz(func(t *testing.T, data []byte) {
        _, _ = ParsePaise(string(data)) // must not panic
    })
}
```

Run a short fuzz with `go test -fuzz=FuzzParse -fuzztime=10s`.

A benchmark:

```go
func BenchmarkAdd(b *testing.B) {
    a := Money{1, "INR"}
    c := Money{2, "INR"}
    for b.Loop() { // Go 1.24. On older toolchains: for i := 0; i < b.N; i++
        _, _ = a.Add(c)
    }
}
```

`go test -bench=BenchmarkAdd -benchmem` prints ns/op and allocations. One number lies. Level 6 compares runs with `benchstat`. For this level, the goal is to see `allocs/op` move when you stop boxing a value in `any`.

## 4. golangci-lint

A small config is enough. More linters later, after you can read their warnings.

```yaml
# .golangci.yml
linters:
  enable:
    - govet
    - errcheck
    - staticcheck
    - unused
    - ineffassign
```

`errcheck` is the one that catches a discarded `Close` error. `govet` includes `copylocks`.

Install from the project’s documented release, then `golangci-lint run`.

## 5. io, and closing in a loop

`io.Reader` and `io.Writer` are the interfaces the standard library is built on. Accept them. Return concrete types (`*os.File`, `*bytes.Buffer`) from constructors.

```go
func copyN(dst io.Writer, src io.Reader, n int64) error {
    _, err := io.CopyN(dst, src, n)
    return err
}
```

Closing inside a loop:

```go
func sizes(paths []string) ([]int64, error) {
    out := make([]int64, 0, len(paths))
    for _, p := range paths {
        n, err := fileSize(p)
        if err != nil {
            return nil, err
        }
        out = append(out, n)
    }
    return out, nil
}

func fileSize(path string) (int64, error) {
    f, err := os.Open(path)
    if err != nil {
        return 0, err
    }
    defer f.Close()
    info, err := f.Stat()
    if err != nil {
        return 0, err
    }
    return info.Size(), nil
}
```

Each call returns, so each `defer` runs. A `defer` in the loop inside `sizes` would wait until `sizes` returns.

`bufio.Writer` buffers writes. Call `Flush` before you treat the file as complete, and check its error. `os.File.Sync` pushes bytes to durable storage. It is expensive. Level 9 and the key-value project are where you decide to call it. Know that a write without `Sync` can sit in the OS page cache across a power loss.

## 6. bytes and binary

Protocol frames are length-prefixed, not line-oriented, when the payload can contain the delimiter.

```text
[length uint32][payload bytes]
```

```go
func writeFrame(w io.Writer, payload []byte) error {
    var hdr [4]byte
    binary.BigEndian.PutUint32(hdr[:], uint32(len(payload)))
    if _, err := w.Write(hdr[:]); err != nil {
        return err
    }
    _, err := w.Write(payload)
    return err
}
```

`encoding/binary` is the tool. Pick big-endian or little-endian and write it in the spec. A checksum (CRC32) before the payload is how a reader detects a torn tail. You will build that frame for real in month 3. Here, write and read one frame in a test with `bytes.Buffer`.

## 7. time

The layout string for `time.Parse` is the reference time `Mon Jan 2 15:04:05 MST 2006`. It is not a picture of your field. Use `time.RFC3339` for `2026-11-21T08:00:00Z`.

Compare instants with `Equal`, `Before`, or `After`. `==` also compares location and the monotonic clock reading.

```go
deadline := time.Now().Add(2 * time.Second)
if time.Now().After(deadline) {
    return errors.New("late")
}
```

`time.After` in a loop allocates a timer every pass. Before a `go` line of 1.23, an unstopped timer lived until it fired. Keep one `Timer` and `Reset` it. After 1.23 the garbage collector can reclaim an unreferenced timer, and the allocation is still waste. The pattern belongs to level 5, next to `select`. Remember the rule now: one timer, reused.

## 8. Generics, only as far as you need

Use a type parameter when two types would otherwise force `any` and a type assert, or when you would copy the function. Keep constraints small: `any`, `comparable`, `cmp.Ordered`, or a short union. `~int` also matches a defined type whose underlying type is `int`.

```go
func Sum[T cmp.Ordered](xs []T) T {
    var total T
    for _, x := range xs {
        total += x
    }
    return total
}
```

A method may have its own type parameters since Go 1.27. An interface method still cannot, and a generic method cannot be the method that satisfies an interface. If there is only one type, write the function for that type.

Iterators arrived in Go 1.23. `for v := range seq` where `seq` is `func(yield func(T) bool)`. The loop stops when `yield` returns false, which is what `break` and `return` do. `slices.Values`, `slices.All`, `maps.Keys`, `maps.All` are the ones you will call. `iter.Pull` turns a push iterator into a `next` function. Call `stop` if you abandon it early, or the push side stays blocked.

You do not need to write iterators yet. You need to recognize the signature when you see it in the standard library.

## 9. JSON

Decode into a struct. A number decoded into `any` becomes `float64` and loses integers above 2^53. If you must accept unknown JSON numbers, use `Decoder.UseNumber`.

```go
type Payment struct {
    ID     string `json:"id"`
    Paise  int64  `json:"paise"`
    Status string `json:"status"`
}

func decode(r io.Reader) (Payment, error) {
    dec := json.NewDecoder(r)
    dec.DisallowUnknownFields() // optional, strict
    var p Payment
    if err := dec.Decode(&p); err != nil {
        return Payment{}, err
    }
    return p, nil
}
```

On Go 1.27, `encoding/json` is backed by the v2 engine and keeps v1 behavior, with error strings that may differ. `encoding/json/v2` is the new API: options on `Marshal` and `Unmarshal`, and stricter defaults, including a rejection of invalid UTF-8 and of duplicate object names.

## Practice

1. Move `Money` into `internal/money`. `cmd/ledger` calls it. An outside example module must fail to import `internal/money`. Confirm that by reading the rule, and by the compiler if you try.
2. Table-test `Add` and `Debit`, including the error sentinels.
3. Fuzz `ParsePaise` for 10 seconds. It must not panic.
4. Write and read a length-prefixed frame through a `bytes.Buffer`. Include a test where the buffer ends mid-frame and the reader returns an error.
5. Run `go test ./...` and `golangci-lint run` clean.

## Exit checklist

- You can explain `internal/` and why `go.sum` is committed.
- A table test covers the success path and each error sentinel.
- You close files in a helper, so `defer` runs per file.
- You parse time with `time.RFC3339` or the reference layout, and you can say why `time.Parse` rejected a “normal” timestamp.
- You decode JSON into a struct, not into `map[string]any`, when the shape is known.

Next: [level-05-concurrency.md](level-05-concurrency.md).
