import type { OopsPillar, OopsProblem } from "./types";

export const OOP_PILLARS: OopsPillar[] = [
  {
    name: "Encapsulation",
    summary: "Hide state. Expose only operations that keep invariants true.",
  },
  {
    name: "Abstraction",
    summary: "Talk to a small interface. Hide how the work is actually done.",
  },
  {
    name: "Inheritance",
    summary: "Share a contract or behavior. Prefer it for is-a, not for reuse.",
  },
  {
    name: "Polymorphism",
    summary: "Callers use one type. Each implementation decides the details.",
  },
];

export const OOP_PROBLEMS: OopsProblem[] = [
  {
    slug: "bank-account",
    title: "Bank Account",
    tagline: "Protect money with invariants, not public fields.",
    problem:
      "Model a checking account. Customers deposit and withdraw. Balance can never go negative, and the account must keep a short ledger of what happened.",
    pillars: ["Encapsulation", "Abstraction"],
    explanation:
      "A real account is not a number you mutate from anywhere. The object owns the balance, rejects bad operations, and records history in one place.",
    whenToUse: "Any domain object with rules that must always hold (money, inventory, seats).",
    whenNot: "Do not hide data so hard that tests or reports cannot read a snapshot.",
    versions: [
      {
        label: "Basic",
        intent: "A bag of public fields. Callers do the arithmetic.",
        drawbacks: [
          "Anyone can set balance to -100.",
          "No single place records a withdrawal.",
          "Business rules leak into every caller.",
        ],
        nextImprovement: "Hide the balance and put deposit/withdraw on the class.",
        code: {
          python: `class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance
        self.ledger = []


# Callers mutate state directly.
acct = BankAccount("Ada", 100)
acct.balance -= 150  # overdraft, no record`,
          java: `class BankAccount {
    public String owner;
    public int balance;
    public java.util.List<String> ledger = new java.util.ArrayList<>();
}

// Callers mutate state directly.
BankAccount acct = new BankAccount();
acct.owner = "Ada";
acct.balance = 100;
acct.balance -= 150; // overdraft, no record`,
        },
      },
      {
        label: "Improved",
        intent: "Methods own the mutations, but overdraft and history are still sloppy.",
        drawbacks: [
          "Negative withdraw is accepted.",
          "Ledger is a raw list callers can clear.",
          "No typed result for 'rejected vs applied'.",
        ],
        nextImprovement: "Validate amounts, return a result, and expose an immutable ledger view.",
        code: {
          python: `class BankAccount:
    def __init__(self, owner: str, opening: int):
        self.owner = owner
        self._balance = opening
        self._ledger = [f"open {opening}"]

    def deposit(self, amount: int) -> None:
        self._balance += amount
        self._ledger.append(f"deposit {amount}")

    def withdraw(self, amount: int) -> None:
        self._balance -= amount
        self._ledger.append(f"withdraw {amount}")

    @property
    def balance(self) -> int:
        return self._balance`,
          java: `class BankAccount {
    private final String owner;
    private int balance;
    private final java.util.List<String> ledger = new java.util.ArrayList<>();

    BankAccount(String owner, int opening) {
        this.owner = owner;
        this.balance = opening;
        ledger.add("open " + opening);
    }

    void deposit(int amount) {
        balance += amount;
        ledger.add("deposit " + amount);
    }

    void withdraw(int amount) {
        balance -= amount;
        ledger.add("withdraw " + amount);
    }

    int balance() { return balance; }
}`,
        },
      },
      {
        label: "Best",
        intent: "The account is the only writer. Invalid moves fail loudly and history is read-only.",
        drawbacks: [
          "Still in-memory only — persistence would be a separate port.",
          "A real bank needs transactions, currency, and concurrent access.",
        ],
        code: {
          python: `from dataclasses import dataclass


@dataclass(frozen=True)
class Txn:
    kind: str
    amount: int
    balance: int


class BankAccount:
    def __init__(self, owner: str, opening: int):
        if opening < 0:
            raise ValueError("opening balance")
        self.owner = owner
        self._balance = opening
        self._ledger = [Txn("open", opening, opening)]

    def deposit(self, amount: int) -> Txn:
        self._require_positive(amount)
        self._balance += amount
        return self._record("deposit", amount)

    def withdraw(self, amount: int) -> Txn:
        self._require_positive(amount)
        if amount > self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount
        return self._record("withdraw", amount)

    @property
    def balance(self) -> int:
        return self._balance

    @property
    def ledger(self) -> tuple[Txn, ...]:
        return tuple(self._ledger)

    def _record(self, kind: str, amount: int) -> Txn:
        txn = Txn(kind, amount, self._balance)
        self._ledger.append(txn)
        return txn

    @staticmethod
    def _require_positive(amount: int) -> None:
        if amount <= 0:
            raise ValueError("amount must be > 0")`,
          java: `record Txn(String kind, int amount, int balance) {}

class BankAccount {
    private final String owner;
    private int balance;
    private final java.util.List<Txn> ledger = new java.util.ArrayList<>();

    BankAccount(String owner, int opening) {
        if (opening < 0) throw new IllegalArgumentException("opening");
        this.owner = owner;
        this.balance = opening;
        ledger.add(new Txn("open", opening, opening));
    }

    Txn deposit(int amount) {
        requirePositive(amount);
        balance += amount;
        return record("deposit", amount);
    }

    Txn withdraw(int amount) {
        requirePositive(amount);
        if (amount > balance) throw new IllegalStateException("insufficient funds");
        balance -= amount;
        return record("withdraw", amount);
    }

    int balance() { return balance; }
    java.util.List<Txn> ledger() { return java.util.List.copyOf(ledger); }

    private Txn record(String kind, int amount) {
        Txn txn = new Txn(kind, amount, balance);
        ledger.add(txn);
        return txn;
    }

    private static void requirePositive(int amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount");
    }
}`,
        },
      },
    ],
  },
  {
    slug: "employee-payroll",
    title: "Employee Payroll",
    tagline: "Pay people by role without a growing if/else pile.",
    problem:
      "A company pays full-time staff a monthly salary and contractors an hourly rate. Later it will add interns. Compute each person's payout for a period.",
    pillars: ["Inheritance", "Polymorphism"],
    explanation:
      "Payroll is a classic is-a trap. Sharing a Payable contract is useful. Stuffing every worker into one class, or inheriting just to reuse a field, is not.",
    whenToUse: "When callers should ask 'pay this person' without knowing the compensation model.",
    whenNot: "Do not inherit Contractor from Employee just to reuse a name field.",
    versions: [
      {
        label: "Basic",
        intent: "One class, a type string, and branches in pay().",
        drawbacks: [
          "Every new role edits the same method.",
          "Unused fields (hours vs salary) sit on every instance.",
          "Easy to miss a branch and pay zero.",
        ],
        nextImprovement: "Split types so each role computes its own pay.",
        code: {
          python: `class Employee:
    def __init__(self, name, kind, salary=0, hours=0, rate=0):
        self.name = name
        self.kind = kind
        self.salary = salary
        self.hours = hours
        self.rate = rate

    def pay(self):
        if self.kind == "fulltime":
            return self.salary
        if self.kind == "contractor":
            return self.hours * self.rate
        return 0`,
          java: `class Employee {
    String name;
    String kind;
    int salary;
    int hours;
    int rate;

    int pay() {
        if ("fulltime".equals(kind)) return salary;
        if ("contractor".equals(kind)) return hours * rate;
        return 0;
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "Subclasses own the formula, but the hierarchy is used as a grab bag.",
        drawbacks: [
          "Contractor inheriting Employee implies benefits, IDs, and HR rules that may not apply.",
          "Adding Intern still means growing the tree.",
          "Hard to mix a person who is both staff and a contractor later.",
        ],
        nextImprovement: "Keep a thin Payable contract and compose compensation instead of deep inheritance.",
        code: {
          python: `class Employee:
    def __init__(self, name: str):
        self.name = name

    def pay(self) -> int:
        raise NotImplementedError


class FullTime(Employee):
    def __init__(self, name: str, salary: int):
        super().__init__(name)
        self.salary = salary

    def pay(self) -> int:
        return self.salary


class Contractor(Employee):
    def __init__(self, name: str, hours: int, rate: int):
        super().__init__(name)
        self.hours = hours
        self.rate = rate

    def pay(self) -> int:
        return self.hours * self.rate`,
          java: `abstract class Employee {
    final String name;
    Employee(String name) { this.name = name; }
    abstract int pay();
}

class FullTime extends Employee {
    final int salary;
    FullTime(String name, int salary) { super(name); this.salary = salary; }
    int pay() { return salary; }
}

class Contractor extends Employee {
    final int hours, rate;
    Contractor(String name, int hours, int rate) {
        super(name); this.hours = hours; this.rate = rate;
    }
    int pay() { return hours * rate; }
}`,
        },
      },
      {
        label: "Best",
        intent: "A person has a name. Compensation is a strategy you can swap.",
        drawbacks: [
          "One extra type versus a tiny two-role app.",
          "Still no taxes, overtime, or pay periods.",
        ],
        code: {
          python: `from typing import Protocol


class Compensation(Protocol):
    def amount(self) -> int: ...


class Salary:
    def __init__(self, monthly: int):
        self.monthly = monthly

    def amount(self) -> int:
        return self.monthly


class Hourly:
    def __init__(self, hours: int, rate: int):
        self.hours = hours
        self.rate = rate

    def amount(self) -> int:
        return self.hours * self.rate


class Person:
    def __init__(self, name: str, compensation: Compensation):
        self.name = name
        self.compensation = compensation

    def pay(self) -> int:
        return self.compensation.amount()


payroll = [
    Person("Ada", Salary(8000)),
    Person("Lin", Hourly(40, 80)),
]
total = sum(p.pay() for p in payroll)`,
          java: `interface Compensation { int amount(); }

record Salary(int monthly) implements Compensation {
    public int amount() { return monthly; }
}

record Hourly(int hours, int rate) implements Compensation {
    public int amount() { return hours * rate; }
}

class Person {
    final String name;
    final Compensation compensation;
    Person(String name, Compensation compensation) {
        this.name = name;
        this.compensation = compensation;
    }
    int pay() { return compensation.amount(); }
}

int total = java.util.List.of(
    new Person("Ada", new Salary(8000)),
    new Person("Lin", new Hourly(40, 80))
).stream().mapToInt(Person::pay).sum();`,
        },
      },
    ],
  },
  {
    slug: "notification-service",
    title: "Notification Service",
    tagline: "Send email, SMS, and push without rewriting the dispatcher.",
    problem:
      "After an order ships, notify the customer. Today that is email. Tomorrow it is SMS and push. The checkout flow should not grow a switch for every channel.",
    pillars: ["Abstraction", "Polymorphism"],
    explanation:
      "The checkout cares that a message went out, not whether SMTP or Twilio sent it. That is abstraction. New channels plug in as new implementations.",
    whenToUse: "When the action is stable ('notify') and the transport will keep changing.",
    whenNot: "One hardcoded email in a script does not need a channel hierarchy.",
    versions: [
      {
        label: "Basic",
        intent: "Checkout talks to SMTP and Twilio by name.",
        drawbacks: [
          "Adding push means editing checkout.",
          "Cannot send two channels without more branches.",
          "Hard to test without hitting real vendors.",
        ],
        nextImprovement: "Hide each vendor behind a notify() method.",
        code: {
          python: `class Checkout:
    def shipped(self, email, phone, message):
        SmtpClient().send(email, message)
        TwilioClient().sms(phone, message)


class SmtpClient:
    def send(self, to, body): ...


class TwilioClient:
    def sms(self, to, body): ...`,
          java: `class Checkout {
    void shipped(String email, String phone, String message) {
        new SmtpClient().send(email, message);
        new TwilioClient().sms(phone, message);
    }
}

class SmtpClient { void send(String to, String body) {} }
class TwilioClient { void sms(String to, String body) {} }`,
        },
      },
      {
        label: "Improved",
        intent: "A Notifier interface exists, but checkout still constructs concrete channels.",
        drawbacks: [
          "Checkout still knows which channels exist.",
          "Construction is hardcoded — tests still fight vendors.",
          "Fan-out to many channels is copy-paste.",
        ],
        nextImprovement: "Inject a list of notifiers. Checkout only fans out.",
        code: {
          python: `class Notifier:
    def notify(self, to: str, body: str) -> None:
        raise NotImplementedError


class EmailNotifier(Notifier):
    def notify(self, to: str, body: str) -> None:
        SmtpClient().send(to, body)


class SmsNotifier(Notifier):
    def notify(self, to: str, body: str) -> None:
        TwilioClient().sms(to, body)


class Checkout:
    def shipped(self, email: str, message: str) -> None:
        EmailNotifier().notify(email, message)`,
          java: `interface Notifier { void notify(String to, String body); }

class EmailNotifier implements Notifier {
    public void notify(String to, String body) { new SmtpClient().send(to, body); }
}

class SmsNotifier implements Notifier {
    public void notify(String to, String body) { new TwilioClient().sms(to, body); }
}

class Checkout {
    void shipped(String email, String message) {
        new EmailNotifier().notify(email, message);
    }
}`,
        },
      },
      {
        label: "Best",
        intent: "Checkout depends on a notifier list. Channels are added at composition time.",
        drawbacks: [
          "You still need retry, templates, and user preferences in a real system.",
          "Fan-out is sequential here — production would queue it.",
        ],
        code: {
          python: `from typing import Protocol


class Notifier(Protocol):
    def notify(self, to: str, body: str) -> None: ...


class EmailNotifier:
    def __init__(self, smtp):
        self.smtp = smtp

    def notify(self, to: str, body: str) -> None:
        self.smtp.send(to, body)


class SmsNotifier:
    def __init__(self, twilio):
        self.twilio = twilio

    def notify(self, to: str, body: str) -> None:
        self.twilio.sms(to, body)


class MultiNotifier:
    def __init__(self, channels: list[Notifier]):
        self.channels = channels

    def notify(self, to: str, body: str) -> None:
        for channel in self.channels:
            channel.notify(to, body)


class Checkout:
    def __init__(self, notifier: Notifier):
        self.notifier = notifier

    def shipped(self, customer: str, message: str) -> None:
        self.notifier.notify(customer, message)`,
          java: `interface Notifier { void notify(String to, String body); }

class EmailNotifier implements Notifier {
    private final SmtpClient smtp;
    EmailNotifier(SmtpClient smtp) { this.smtp = smtp; }
    public void notify(String to, String body) { smtp.send(to, body); }
}

class SmsNotifier implements Notifier {
    private final TwilioClient twilio;
    SmsNotifier(TwilioClient twilio) { this.twilio = twilio; }
    public void notify(String to, String body) { twilio.sms(to, body); }
}

class MultiNotifier implements Notifier {
    private final java.util.List<Notifier> channels;
    MultiNotifier(java.util.List<Notifier> channels) { this.channels = channels; }
    public void notify(String to, String body) {
        channels.forEach(c -> c.notify(to, body));
    }
}

class Checkout {
    private final Notifier notifier;
    Checkout(Notifier notifier) { this.notifier = notifier; }
    void shipped(String customer, String message) {
        notifier.notify(customer, message);
    }
}`,
        },
      },
    ],
  },
];
