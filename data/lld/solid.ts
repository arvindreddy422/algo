import type { SolidPrinciple } from "./types";

export const SOLID_PRINCIPLES: SolidPrinciple[] = [
  {
    slug: "srp",
    letter: "S",
    name: "Single Responsibility",
    title: "Single Responsibility",
    tagline: "A class should have one reason to change.",
    explanation:
      "If checkout, email, and SQL all live in one class, a copy change, a template change, and a schema change all collide. Split by reason to change, not by 'make more files'.",
    whenToUse: "When one type is edited for unrelated reasons — persistence, IO, and business rules.",
    whenNot: "Do not explode a 20-line helper into five empty classes.",
    versions: [
      {
        label: "Basic",
        intent: "One OrderService does pricing, SQL, and email.",
        drawbacks: [
          "Any email tweak risks breaking persistence.",
          "Cannot unit-test pricing without a database.",
          "The class grows every time the product adds a side effect.",
        ],
        nextImprovement: "Pull IO out so the service only coordinates.",
        code: {
          python: `class OrderService:
    def place(self, user_id: int, items: list) -> None:
        total = sum(i.price for i in items)
        db.execute(
            "INSERT INTO orders(user_id, total) VALUES (?, ?)",
            (user_id, total),
        )
        smtp.send(user_id, f"Order placed: {total}")`,
          java: `class OrderService {
    void place(int userId, java.util.List<Item> items) {
        int total = items.stream().mapToInt(i -> i.price).sum();
        db.execute("INSERT INTO orders(user_id, total) VALUES (?, ?)", userId, total);
        smtp.send(userId, "Order placed: " + total);
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "Helpers exist, but the service still constructs and owns them.",
        drawbacks: [
          "OrderService still knows MySQL and SMTP by name.",
          "Tests still need to stub construction.",
          "Adding SMS means editing the same service again.",
        ],
        nextImprovement: "Depend on ports. Let composition wire the writers.",
        code: {
          python: `class OrderRepo:
    def save(self, user_id: int, total: int) -> None:
        db.execute("INSERT INTO orders ...", (user_id, total))


class OrderMailer:
    def placed(self, user_id: int, total: int) -> None:
        smtp.send(user_id, f"Order placed: {total}")


class OrderService:
    def __init__(self):
        self.repo = OrderRepo()
        self.mailer = OrderMailer()

    def place(self, user_id: int, items: list) -> None:
        total = sum(i.price for i in items)
        self.repo.save(user_id, total)
        self.mailer.placed(user_id, total)`,
          java: `class OrderRepo {
    void save(int userId, int total) {
        db.execute("INSERT INTO orders ...", userId, total);
    }
}

class OrderMailer {
    void placed(int userId, int total) {
        smtp.send(userId, "Order placed: " + total);
    }
}

class OrderService {
    private final OrderRepo repo = new OrderRepo();
    private final OrderMailer mailer = new OrderMailer();

    void place(int userId, java.util.List<Item> items) {
        int total = items.stream().mapToInt(i -> i.price).sum();
        repo.save(userId, total);
        mailer.placed(userId, total);
    }
}`,
        },
      },
      {
        label: "Best",
        intent: "Pricing stays here. Persistence and notification are injected ports.",
        drawbacks: [
          "More types up front.",
          "You still need a composition root (main / DI container).",
        ],
        code: {
          python: `from typing import Protocol


class OrderWriter(Protocol):
    def save(self, user_id: int, total: int) -> None: ...


class OrderNotifier(Protocol):
    def placed(self, user_id: int, total: int) -> None: ...


class OrderService:
    def __init__(self, writer: OrderWriter, notifier: OrderNotifier):
        self.writer = writer
        self.notifier = notifier

    def place(self, user_id: int, items: list) -> int:
        total = sum(i.price for i in items)
        self.writer.save(user_id, total)
        self.notifier.placed(user_id, total)
        return total`,
          java: `interface OrderWriter { void save(int userId, int total); }
interface OrderNotifier { void placed(int userId, int total); }

class OrderService {
    private final OrderWriter writer;
    private final OrderNotifier notifier;

    OrderService(OrderWriter writer, OrderNotifier notifier) {
        this.writer = writer;
        this.notifier = notifier;
    }

    int place(int userId, java.util.List<Item> items) {
        int total = items.stream().mapToInt(i -> i.price).sum();
        writer.save(userId, total);
        notifier.placed(userId, total);
        return total;
    }
}`,
        },
      },
    ],
  },
  {
    slug: "ocp",
    letter: "O",
    name: "Open-Closed",
    title: "Open-Closed",
    tagline: "Add behavior by adding types, not by editing a switch.",
    explanation:
      "Open for extension, closed for modification. A discount engine that needs a new if every Black Friday will keep breaking old rules.",
    whenToUse: "When new variants arrive often and the call site should stay still.",
    whenNot: "Two stable cases can stay as a simple if.",
    versions: [
      {
        label: "Basic",
        intent: "One function switches on coupon type.",
        drawbacks: [
          "New coupon types edit this function and every copy of it.",
          "Easy to forget a type and silently charge full price.",
          "Rules cannot be combined without more flags.",
        ],
        nextImprovement: "Give each rule its own type with an apply() method.",
        code: {
          python: `def discount(kind: str, total: int) -> int:
    if kind == "percent10":
        return total * 90 // 100
    if kind == "flat5":
        return max(0, total - 5)
    if kind == "none":
        return total
    raise ValueError(kind)`,
          java: `int discount(String kind, int total) {
    if ("percent10".equals(kind)) return total * 90 / 100;
    if ("flat5".equals(kind)) return Math.max(0, total - 5);
    if ("none".equals(kind)) return total;
    throw new IllegalArgumentException(kind);
}`,
        },
      },
      {
        label: "Improved",
        intent: "A map of functions, but registration is still inside the module.",
        drawbacks: [
          "Adding a rule still means editing this file.",
          "No shared interface for stacking rules.",
          "Lookup fails as a runtime string typo.",
        ],
        nextImprovement: "A Discount protocol plus a list the checkout does not own.",
        code: {
          python: `RULES = {
    "percent10": lambda total: total * 90 // 100,
    "flat5": lambda total: max(0, total - 5),
    "none": lambda total: total,
}

def discount(kind: str, total: int) -> int:
    return RULES[kind](total)`,
          java: `java.util.Map<String, java.util.function.IntUnaryOperator> RULES = java.util.Map.of(
    "percent10", total -> total * 90 / 100,
    "flat5", total -> Math.max(0, total - 5),
    "none", total -> total
);

int discount(String kind, int total) {
    return RULES.get(kind).applyAsInt(total);
}`,
        },
      },
      {
        label: "Best",
        intent: "New discounts are new classes. The cart only folds rules.",
        drawbacks: [
          "Overkill for a single hardcoded 10% sale.",
          "Rule order still matters and must be documented.",
        ],
        code: {
          python: `from typing import Protocol


class Discount(Protocol):
    def apply(self, total: int) -> int: ...


class PercentOff:
    def __init__(self, percent: int):
        self.percent = percent

    def apply(self, total: int) -> int:
        return total * (100 - self.percent) // 100


class FlatOff:
    def __init__(self, amount: int):
        self.amount = amount

    def apply(self, total: int) -> int:
        return max(0, total - self.amount)


def checkout(total: int, discounts: list[Discount]) -> int:
    for rule in discounts:
        total = rule.apply(total)
    return total`,
          java: `interface Discount { int apply(int total); }

record PercentOff(int percent) implements Discount {
    public int apply(int total) { return total * (100 - percent) / 100; }
}

record FlatOff(int amount) implements Discount {
    public int apply(int total) { return Math.max(0, total - amount); }
}

int checkout(int total, java.util.List<Discount> discounts) {
    for (Discount rule : discounts) total = rule.apply(total);
    return total;
}`,
        },
      },
    ],
  },
  {
    slug: "lsp",
    letter: "L",
    name: "Liskov Substitution",
    title: "Liskov Substitution",
    tagline: "A subtype must honor the contract callers already rely on.",
    explanation:
      "If code accepts a Bird and calls fly(), a Penguin that throws is not a Bird in that design. Split capabilities so substitutes do not surprise callers.",
    whenToUse: "When you inherit or implement an interface callers already trust.",
    whenNot: "Do not keep a useless method just to 'fit' a parent type.",
    versions: [
      {
        label: "Basic",
        intent: "Penguin extends Bird and breaks fly().",
        drawbacks: [
          "Callers that take Bird can crash.",
          "instanceof checks start spreading.",
          "The inheritance models biology, not behavior.",
        ],
        nextImprovement: "Do not put fly() on a type that is not always airborne.",
        code: {
          python: `class Bird:
    def fly(self) -> str:
        return "airborne"


class Penguin(Bird):
    def fly(self) -> str:
        raise NotImplementedError("penguins swim")


def migrate(bird: Bird) -> str:
    return bird.fly()`,
          java: `class Bird {
    String fly() { return "airborne"; }
}

class Penguin extends Bird {
    String fly() { throw new UnsupportedOperationException("penguins swim"); }
}

String migrate(Bird bird) {
    return bird.fly();
}`,
        },
      },
      {
        label: "Improved",
        intent: "A canFly flag. Callers must remember to check it.",
        drawbacks: [
          "The flag is easy to ignore.",
          "Type system does not help.",
          "Every new capability becomes another boolean.",
        ],
        nextImprovement: "Split into Flyer and Swimmer so illegal calls do not compile.",
        code: {
          python: `class Bird:
    def __init__(self, can_fly: bool):
        self.can_fly = can_fly

    def fly(self) -> str:
        if not self.can_fly:
            raise ValueError("cannot fly")
        return "airborne"


def migrate(bird: Bird) -> str:
    if bird.can_fly:
        return bird.fly()
    return "walk"`,
          java: `class Bird {
    final boolean canFly;
    Bird(boolean canFly) { this.canFly = canFly; }
    String fly() {
        if (!canFly) throw new IllegalStateException("cannot fly");
        return "airborne";
    }
}

String migrate(Bird bird) {
    return bird.canFly ? bird.fly() : "walk";
}`,
        },
      },
      {
        label: "Best",
        intent: "Shared animal type is just identity. Flight is a separate capability.",
        drawbacks: [
          "More types than a toy demo needs.",
          "You must choose the right input type at each call site.",
        ],
        code: {
          python: `from typing import Protocol


class Flyer(Protocol):
    def fly(self) -> str: ...


class Swimmer(Protocol):
    def swim(self) -> str: ...


class Sparrow:
    def fly(self) -> str:
        return "airborne"


class Penguin:
    def swim(self) -> str:
        return "underwater"


def migrate(bird: Flyer) -> str:
    return bird.fly()`,
          java: `interface Flyer { String fly(); }
interface Swimmer { String swim(); }

class Sparrow implements Flyer {
    public String fly() { return "airborne"; }
}

class Penguin implements Swimmer {
    public String swim() { return "underwater"; }
}

String migrate(Flyer bird) {
    return bird.fly();
}`,
        },
      },
    ],
  },
  {
    slug: "isp",
    letter: "I",
    name: "Interface Segregation",
    title: "Interface Segregation",
    tagline: "Do not force a client to depend on methods it does not use.",
    explanation:
      "A fat Worker interface with work(), eat(), and code() makes a Robot implement eat(). Split into role interfaces so each client sees only what it needs.",
    whenToUse: "When implementers leave methods empty or throw 'not supported'.",
    whenNot: "A cohesive 3-method interface used by every client can stay together.",
    versions: [
      {
        label: "Basic",
        intent: "One Worker interface. Robot fakes eat().",
        drawbacks: [
          "Robot must implement nonsense methods.",
          "A change to eat() recompiles every worker.",
          "Callers cannot tell who actually eats.",
        ],
        nextImprovement: "Split human needs from job needs.",
        code: {
          python: `class Worker:
    def work(self) -> None: ...
    def eat(self) -> None: ...
    def code(self) -> None: ...


class Human(Worker):
    def work(self): ...
    def eat(self): ...
    def code(self): ...


class Robot(Worker):
    def work(self): ...
    def eat(self):
        raise NotImplementedError
    def code(self): ...`,
          java: `interface Worker {
    void work();
    void eat();
    void code();
}

class Human implements Worker {
    public void work() {}
    public void eat() {}
    public void code() {}
}

class Robot implements Worker {
    public void work() {}
    public void eat() { throw new UnsupportedOperationException(); }
    public void code() {}
}`,
        },
      },
      {
        label: "Improved",
        intent: "Two interfaces, but they are still glued into one required pair.",
        drawbacks: [
          "A coder who does not eat still inherits Eater in some designs.",
          "Managers that only assign work still see eat().",
        ],
        nextImprovement: "Role interfaces that clients pick independently.",
        code: {
          python: `class Workable:
    def work(self) -> None: ...


class Eatable:
    def eat(self) -> None: ...


class Human(Workable, Eatable):
    def work(self): ...
    def eat(self): ...


class Robot(Workable, Eatable):
    def work(self): ...
    def eat(self):
        pass  # still required`,
          java: `interface Workable { void work(); }
interface Eatable { void eat(); }

class Human implements Workable, Eatable {
    public void work() {}
    public void eat() {}
}

class Robot implements Workable, Eatable {
    public void work() {}
    public void eat() {} // still required
}`,
        },
      },
      {
        label: "Best",
        intent: "Each client depends on the slimmest role it needs.",
        drawbacks: [
          "Many tiny interfaces can feel noisy.",
          "You still compose them at the concrete class.",
        ],
        code: {
          python: `from typing import Protocol


class Workable(Protocol):
    def work(self) -> None: ...


class Eatable(Protocol):
    def eat(self) -> None: ...


class Codeable(Protocol):
    def code(self) -> None: ...


class Human:
    def work(self): ...
    def eat(self): ...
    def code(self): ...


class Robot:
    def work(self): ...
    def code(self): ...


def shift(worker: Workable) -> None:
    worker.work()`,
          java: `interface Workable { void work(); }
interface Eatable { void eat(); }
interface Codeable { void code(); }

class Human implements Workable, Eatable, Codeable {
    public void work() {}
    public void eat() {}
    public void code() {}
}

class Robot implements Workable, Codeable {
    public void work() {}
    public void code() {}
}

void shift(Workable worker) {
    worker.work();
}`,
        },
      },
    ],
  },
  {
    slug: "dip",
    letter: "D",
    name: "Dependency Inversion",
    title: "Dependency Inversion",
    tagline: "High-level policy should not import low-level details.",
    explanation:
      "A report service that news up MySQLRepo is glued to MySQL. Both should depend on a repository port. The database is a plugin.",
    whenToUse: "When you want to test, replace, or swap infrastructure.",
    whenNot: "A one-off script can construct a concrete client and move on.",
    versions: [
      {
        label: "Basic",
        intent: "The service constructs MySQLRepo itself.",
        drawbacks: [
          "Cannot run the service without MySQL.",
          "Swapping to Postgres rewrites the service.",
          "High-level policy imported a driver detail.",
        ],
        nextImprovement: "Accept a repo in the constructor — even if it is still the MySQL class.",
        code: {
          python: `class MySQLRepo:
    def find_user(self, user_id: int) -> dict:
        return mysql.query("SELECT * FROM users WHERE id=%s", user_id)


class UserService:
    def __init__(self):
        self.repo = MySQLRepo()

    def email(self, user_id: int) -> str:
        return self.repo.find_user(user_id)["email"]`,
          java: `class MySQLRepo {
    User findUser(int userId) {
        return mysql.query("SELECT * FROM users WHERE id=?", userId);
    }
}

class UserService {
    private final MySQLRepo repo = new MySQLRepo();
    String email(int userId) { return repo.findUser(userId).email; }
}`,
        },
      },
      {
        label: "Improved",
        intent: "Injected, but the parameter type is still MySQLRepo.",
        drawbacks: [
          "Tests must subclass or mock a concrete class.",
          "The service still compiles against MySQL types.",
          "A second implementation has to inherit the SQL repo.",
        ],
        nextImprovement: "Introduce a UserStore port both sides depend on.",
        code: {
          python: `class UserService:
    def __init__(self, repo: MySQLRepo):
        self.repo = repo

    def email(self, user_id: int) -> str:
        return self.repo.find_user(user_id)["email"]`,
          java: `class UserService {
    private final MySQLRepo repo;
    UserService(MySQLRepo repo) { this.repo = repo; }
    String email(int userId) { return repo.findUser(userId).email; }
}`,
        },
      },
      {
        label: "Best",
        intent: "Service depends on an abstract store. MySQL is one implementation.",
        drawbacks: [
          "You need a composition root to wire the real repo.",
          "A port with one implementation can feel ceremonial — until the second one arrives.",
        ],
        code: {
          python: `from typing import Protocol


class UserStore(Protocol):
    def find_user(self, user_id: int) -> dict: ...


class MySQLUserStore:
    def find_user(self, user_id: int) -> dict:
        return mysql.query("SELECT * FROM users WHERE id=%s", user_id)


class MemoryUserStore:
    def __init__(self, rows: dict[int, dict]):
        self.rows = rows

    def find_user(self, user_id: int) -> dict:
        return self.rows[user_id]


class UserService:
    def __init__(self, store: UserStore):
        self.store = store

    def email(self, user_id: int) -> str:
        return self.store.find_user(user_id)["email"]`,
          java: `interface UserStore { User findUser(int userId); }

class MySQLUserStore implements UserStore {
    public User findUser(int userId) {
        return mysql.query("SELECT * FROM users WHERE id=?", userId);
    }
}

class MemoryUserStore implements UserStore {
    private final java.util.Map<Integer, User> rows;
    MemoryUserStore(java.util.Map<Integer, User> rows) { this.rows = rows; }
    public User findUser(int userId) { return rows.get(userId); }
}

class UserService {
    private final UserStore store;
    UserService(UserStore store) { this.store = store; }
    String email(int userId) { return store.findUser(userId).email; }
}`,
        },
      },
    ],
  },
];
