import type { DesignPattern } from "./types";

export const PATTERNS: DesignPattern[] = [
  {
    slug: "singleton",
    category: "creational",
    title: "Singleton",
    tagline: "One shared instance, reached from anywhere that needs it.",
    explanation:
      "Use when exactly one object should own a resource — a process-wide logger, config, or connection pool. The hard part is not 'one instance'. It is lazy init, tests, and threads.",
    whenToUse: "A single owner of a scarce resource in one process.",
    whenNot: "Most services should be injected. Hidden globals make tests lie.",
    versions: [
      {
        label: "Basic",
        intent: "A module-level object. No control over creation.",
        drawbacks: [
          "Created even if never used.",
          "Tests cannot swap it.",
          "No protection if someone constructs another.",
        ],
        nextImprovement: "Hide the constructor and expose a getInstance() gate.",
        code: {
          python: `class Logger:
    def log(self, msg: str) -> None:
        print(msg)


LOGGER = Logger()  # constructed at import time`,
          java: `class Logger {
    void log(String msg) { System.out.println(msg); }
}

class App {
    static final Logger LOGGER = new Logger();
}`,
        },
      },
      {
        label: "Improved",
        intent: "Classic singleton. Lazy, but not safe under concurrent first calls.",
        drawbacks: [
          "Two threads can create two instances.",
          "Still a hidden global.",
          "Subclassing is awkward.",
        ],
        nextImprovement: "Make creation atomic (lock, enum, or module import guarantees).",
        code: {
          python: `class Logger:
    _instance = None

    def __init__(self):
        if Logger._instance is not None:
            raise RuntimeError("use get_instance()")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls.__new__(cls)
        return cls._instance

    def log(self, msg: str) -> None:
        print(msg)`,
          java: `class Logger {
    private static Logger instance;
    private Logger() {}

    static Logger getInstance() {
        if (instance == null) instance = new Logger(); // race
        return instance;
    }

    void log(String msg) { System.out.println(msg); }
}`,
        },
      },
      {
        label: "Best",
        intent: "One instance, lazy, and safe. Python uses the module; Java uses an enum.",
        drawbacks: [
          "Still global — prefer injecting this logger in new code.",
          "Process-wide, not cluster-wide.",
        ],
        code: {
          python: `# logger.py — import is already atomic in CPython
class Logger:
    def log(self, msg: str) -> None:
        print(msg)


instance = Logger()


# callers
from logger import instance as logger
logger.log("ready")`,
          java: `enum Logger {
    INSTANCE;

    void log(String msg) {
        System.out.println(msg);
    }
}

// Logger.INSTANCE.log("ready");`,
        },
      },
    ],
  },
  {
    slug: "factory-method",
    category: "creational",
    title: "Factory Method",
    tagline: "Let subclasses decide which product to build.",
    explanation:
      "A creator defines the flow. A factory method supplies the product. Adding Slack notifications means a new creator, not another if in the old one.",
    whenToUse: "When the steps stay the same and only the concrete product changes.",
    whenNot: "A single product type does not need a creator hierarchy.",
    versions: [
      {
        label: "Basic",
        intent: "A function switches on a string to new up senders.",
        drawbacks: [
          "Every new channel edits the switch.",
          "Typos fail at runtime.",
          "Creation and use stay tangled.",
        ],
        nextImprovement: "Give each product a class and keep the switch in one factory function.",
        code: {
          python: `def notify(kind: str, to: str, body: str) -> None:
    if kind == "email":
        Smtp().send(to, body)
    elif kind == "sms":
        Twilio().sms(to, body)
    else:
        raise ValueError(kind)`,
          java: `void notify(String kind, String to, String body) {
    if ("email".equals(kind)) new Smtp().send(to, body);
    else if ("sms".equals(kind)) new Twilio().sms(to, body);
    else throw new IllegalArgumentException(kind);
}`,
        },
      },
      {
        label: "Improved",
        intent: "A simple factory function. Still one place that knows every product.",
        drawbacks: [
          "Closed for extension — new products edit the factory.",
          "No shared creator workflow (retry, logging) around creation.",
        ],
        nextImprovement: "Push creation into subclasses of a Creator.",
        code: {
          python: `class Notifier:
    def send(self, to: str, body: str) -> None: ...


class EmailNotifier(Notifier):
    def send(self, to, body): Smtp().send(to, body)


class SmsNotifier(Notifier):
    def send(self, to, body): Twilio().sms(to, body)


def create(kind: str) -> Notifier:
    if kind == "email":
        return EmailNotifier()
    if kind == "sms":
        return SmsNotifier()
    raise ValueError(kind)`,
          java: `interface Notifier { void send(String to, String body); }

class EmailNotifier implements Notifier {
    public void send(String to, String body) { new Smtp().send(to, body); }
}

class SmsNotifier implements Notifier {
    public void send(String to, String body) { new Twilio().sms(to, body); }
}

class Notifiers {
    static Notifier create(String kind) {
        if ("email".equals(kind)) return new EmailNotifier();
        if ("sms".equals(kind)) return new SmsNotifier();
        throw new IllegalArgumentException(kind);
    }
}`,
        },
      },
      {
        label: "Best",
        intent: "Creator owns the workflow. Subclasses only implement the factory method.",
        drawbacks: [
          "A class per channel can feel heavy for two types.",
          "Do not confuse this with Abstract Factory (families of products).",
        ],
        code: {
          python: `from abc import ABC, abstractmethod


class Notifier(ABC):
    @abstractmethod
    def send(self, to: str, body: str) -> None: ...


class NotificationService(ABC):
    def notify(self, to: str, body: str) -> None:
        self.create().send(to, body)

    @abstractmethod
    def create(self) -> Notifier: ...


class EmailService(NotificationService):
    def create(self) -> Notifier:
        return EmailNotifier()


class SmsService(NotificationService):
    def create(self) -> Notifier:
        return SmsNotifier()`,
          java: `interface Notifier { void send(String to, String body); }

abstract class NotificationService {
    void notify(String to, String body) { create().send(to, body); }
    abstract Notifier create();
}

class EmailService extends NotificationService {
    Notifier create() { return new EmailNotifier(); }
}

class SmsService extends NotificationService {
    Notifier create() { return new SmsNotifier(); }
}`,
        },
      },
    ],
  },
  {
    slug: "abstract-factory",
    category: "creational",
    title: "Abstract Factory",
    tagline: "Create a family of related objects that must stay consistent.",
    explanation:
      "A UI kit is either Light or Dark — button, input, and dialog from the same theme. Abstract Factory gives you a kit, not one product. Factory Method makes one product.",
    whenToUse: "When objects must be from the same family (theme, cloud vendor, OS).",
    whenNot: "If you only need one product, use Factory Method.",
    versions: [
      {
        label: "Basic",
        intent: "Screens new concrete widgets and mix Light buttons with Dark inputs.",
        drawbacks: [
          "Families can be mixed by accident.",
          "Every screen repeats construction.",
          "Theme swap means hunting new LightButton().",
        ],
        nextImprovement: "Group construction behind one factory per theme.",
        code: {
          python: `class LoginPage:
    def __init__(self):
        self.submit = LightButton()
        self.email = DarkInput()  # mixed family`,
          java: `class LoginPage {
    LoginPage() {
        this.submit = new LightButton();
        this.email = new DarkInput(); // mixed family
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "A theme string picks widgets, still with branches.",
        drawbacks: [
          "Each widget type needs its own switch.",
          "Easy to add LightButton and forget LightInput.",
          "Stringly typed theme.",
        ],
        nextImprovement: "One factory interface that returns the whole family.",
        code: {
          python: `def button(theme: str):
    return LightButton() if theme == "light" else DarkButton()

def input_box(theme: str):
    return LightInput() if theme == "light" else DarkInput()`,
          java: `Button button(String theme) {
    return "light".equals(theme) ? new LightButton() : new DarkButton();
}
Input inputBox(String theme) {
    return "light".equals(theme) ? new LightInput() : new DarkInput();
}`,
        },
      },
      {
        label: "Best",
        intent: "A WidgetFactory produces a matching set. Pages depend on the factory, not themes.",
        drawbacks: [
          "Adding a widget means updating every factory.",
          "Overkill for one button and one theme.",
        ],
        code: {
          python: `from typing import Protocol


class Button(Protocol):
    def paint(self) -> str: ...


class Input(Protocol):
    def paint(self) -> str: ...


class WidgetFactory(Protocol):
    def button(self) -> Button: ...
    def input(self) -> Input: ...


class LightFactory:
    def button(self) -> Button: return LightButton()
    def input(self) -> Input: return LightInput()


class DarkFactory:
    def button(self) -> Button: return DarkButton()
    def input(self) -> Input: return DarkInput()


class LoginPage:
    def __init__(self, ui: WidgetFactory):
        self.submit = ui.button()
        self.email = ui.input()`,
          java: `interface Button { String paint(); }
interface Input { String paint(); }
interface WidgetFactory {
    Button button();
    Input input();
}

class LightFactory implements WidgetFactory {
    public Button button() { return new LightButton(); }
    public Input input() { return new LightInput(); }
}

class DarkFactory implements WidgetFactory {
    public Button button() { return new DarkButton(); }
    public Input input() { return new DarkInput(); }
}

class LoginPage {
    LoginPage(WidgetFactory ui) {
        this.submit = ui.button();
        this.email = ui.input();
    }
}`,
        },
      },
    ],
  },
  {
    slug: "builder",
    category: "creational",
    title: "Builder",
    tagline: "Assemble a complex object step by step, then build once.",
    explanation:
      "HTTP requests, SQL queries, and pizza orders have many optional parts. A builder names each step and can validate before the object exists.",
    whenToUse: "Many optional fields, or construction that must be validated as a whole.",
    whenNot: "A type with two required fields wants a constructor, not a builder.",
    versions: [
      {
        label: "Basic",
        intent: "Telescoping constructors. Callers guess argument order.",
        drawbacks: [
          "New optional fields explode overloads.",
          "null / None placeholders are easy to swap.",
          "Nothing validates combinations (GET + body).",
        ],
        nextImprovement: "Set fields on an object, then freeze it.",
        code: {
          python: `class Request:
    def __init__(self, url, method="GET", headers=None, body=None, timeout=5):
        self.url = url
        self.method = method
        self.headers = headers or {}
        self.body = body
        self.timeout = timeout


Request("https://api", "POST", None, '{"ok":1}', 10)`,
          java: `class Request {
    Request(String url) { this(url, "GET", null, null, 5); }
    Request(String url, String method) { this(url, method, null, null, 5); }
    Request(String url, String method, String body, int timeout) {
        this.url = url; this.method = method; this.body = body; this.timeout = timeout;
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "Fluent setters, but build() never checks the result.",
        drawbacks: [
          "You can build a GET with a body or a missing URL.",
          "The request is mutable if the builder shares the instance.",
        ],
        nextImprovement: "Validate at build() and return an immutable request.",
        code: {
          python: `class RequestBuilder:
    def __init__(self):
        self._url = self._method = self._body = None

    def url(self, url: str):
        self._url = url
        return self

    def method(self, method: str):
        self._method = method
        return self

    def body(self, body: str):
        self._body = body
        return self

    def build(self):
        return Request(self._url, self._method, self._body)`,
          java: `class RequestBuilder {
    private String url, method = "GET", body;
    RequestBuilder url(String url) { this.url = url; return this; }
    RequestBuilder method(String method) { this.method = method; return this; }
    RequestBuilder body(String body) { this.body = body; return this; }
    Request build() { return new Request(url, method, body); }
}`,
        },
      },
      {
        label: "Best",
        intent: "Fluent API plus a single validation gate. The product is immutable.",
        drawbacks: [
          "Verbose for a tiny DTO.",
          "Java records + builder can be more code than a factory method.",
        ],
        code: {
          python: `from dataclasses import dataclass


@dataclass(frozen=True)
class Request:
    url: str
    method: str
    body: str | None


class RequestBuilder:
    def __init__(self):
        self._url = None
        self._method = "GET"
        self._body = None

    def url(self, url: str):
        self._url = url
        return self

    def method(self, method: str):
        self._method = method.upper()
        return self

    def body(self, body: str):
        self._body = body
        return self

    def build(self) -> Request:
        if not self._url:
            raise ValueError("url required")
        if self._method == "GET" and self._body:
            raise ValueError("GET cannot have a body")
        return Request(self._url, self._method, self._body)`,
          java: `record Request(String url, String method, String body) {}

class RequestBuilder {
    private String url;
    private String method = "GET";
    private String body;

    RequestBuilder url(String url) { this.url = url; return this; }
    RequestBuilder method(String method) { this.method = method.toUpperCase(); return this; }
    RequestBuilder body(String body) { this.body = body; return this; }

    Request build() {
        if (url == null || url.isBlank()) throw new IllegalStateException("url");
        if ("GET".equals(method) && body != null) throw new IllegalStateException("GET body");
        return new Request(url, method, body);
    }
}`,
        },
      },
    ],
  },
  {
    slug: "adapter",
    category: "structural",
    title: "Adapter",
    tagline: "Make a foreign API look like the one your code already uses.",
    explanation:
      "Your checkout expects charge(cents). Stripe wants pay(dollars). An adapter translates without rewriting checkout or the SDK.",
    whenToUse: "When you cannot change a third-party (or legacy) interface.",
    whenNot: "If you own both sides, just change the interface.",
    versions: [
      {
        label: "Basic",
        intent: "Checkout calls the Stripe SDK directly, including unit conversion.",
        drawbacks: [
          "Every call site knows Stripe.",
          "Swapping to Razorpay rewrites checkout.",
          "Cents vs dollars leaks everywhere.",
        ],
        nextImprovement: "Wrap Stripe behind your PaymentGateway type.",
        code: {
          python: `class Checkout:
    def pay(self, cents: int) -> None:
        StripeSdk().pay(cents / 100)  # SDK wants dollars`,
          java: `class Checkout {
    void pay(int cents) {
        new StripeSdk().pay(cents / 100.0); // SDK wants dollars
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "A wrapper exists, but it is named after Stripe and still leaks SDK types.",
        drawbacks: [
          "Return type is still StripeCharge.",
          "Callers import Stripe to read the receipt.",
        ],
        nextImprovement: "Return your own result type. Hide the SDK completely.",
        code: {
          python: `class StripeGateway:
    def __init__(self, sdk: StripeSdk):
        self.sdk = sdk

    def charge(self, cents: int):
        return self.sdk.pay(cents / 100)`,
          java: `class StripeGateway {
    private final StripeSdk sdk;
    StripeGateway(StripeSdk sdk) { this.sdk = sdk; }
    StripeCharge charge(int cents) { return sdk.pay(cents / 100.0); }
}`,
        },
      },
      {
        label: "Best",
        intent: "Checkout depends on PaymentGateway. Stripe is one adapter.",
        drawbacks: [
          "One extra type per vendor.",
          "Do not confuse Adapter (same job, new shape) with Facade (simplify a subsystem).",
        ],
        code: {
          python: `from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class Receipt:
    ok: bool
    ref: str


class PaymentGateway(Protocol):
    def charge(self, cents: int) -> Receipt: ...


class StripeAdapter:
    def __init__(self, sdk: StripeSdk):
        self.sdk = sdk

    def charge(self, cents: int) -> Receipt:
        raw = self.sdk.pay(cents / 100)
        return Receipt(ok=raw.paid, ref=raw.id)


class Checkout:
    def __init__(self, gateway: PaymentGateway):
        self.gateway = gateway

    def pay(self, cents: int) -> Receipt:
        return self.gateway.charge(cents)`,
          java: `record Receipt(boolean ok, String ref) {}
interface PaymentGateway { Receipt charge(int cents); }

class StripeAdapter implements PaymentGateway {
    private final StripeSdk sdk;
    StripeAdapter(StripeSdk sdk) { this.sdk = sdk; }
    public Receipt charge(int cents) {
        StripeCharge raw = sdk.pay(cents / 100.0);
        return new Receipt(raw.paid, raw.id);
    }
}

class Checkout {
    private final PaymentGateway gateway;
    Checkout(PaymentGateway gateway) { this.gateway = gateway; }
    Receipt pay(int cents) { return gateway.charge(cents); }
}`,
        },
      },
    ],
  },
  {
    slug: "decorator",
    category: "structural",
    title: "Decorator",
    tagline: "Wrap an object to add behavior without changing its class.",
    explanation:
      "Logging, retries, and auth around a notifier are extra layers, not new subclasses for every combo. Each decorator implements the same interface and delegates.",
    whenToUse: "When you need stackable extras (log + retry + cache) around one core.",
    whenNot: "If the extra is core business logic, put it in the object — do not wrap forever.",
    versions: [
      {
        label: "Basic",
        intent: "A subclass per combination: LoggedEmail, RetryEmail, LoggedRetryEmail.",
        drawbacks: [
          "Combinations explode.",
          "The same logging code is copied.",
          "Order of extras is baked into class names.",
        ],
        nextImprovement: "Wrap a Notifier with objects that also are Notifiers.",
        code: {
          python: `class EmailNotifier:
    def send(self, to, body): ...


class LoggedEmailNotifier(EmailNotifier):
    def send(self, to, body):
        print("send")
        super().send(to, body)


class LoggedRetryEmailNotifier(LoggedEmailNotifier):
    def send(self, to, body):
        for _ in range(3):
            super().send(to, body)
            break`,
          java: `class EmailNotifier { void send(String to, String body) {} }

class LoggedEmailNotifier extends EmailNotifier {
    void send(String to, String body) {
        System.out.println("send");
        super.send(to, body);
    }
}

class LoggedRetryEmailNotifier extends LoggedEmailNotifier {
    void send(String to, String body) {
        for (int i = 0; i < 3; i++) { super.send(to, body); break; }
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "A logging wrapper exists, but it only wraps EmailNotifier.",
        drawbacks: [
          "Cannot wrap SMS or a test double.",
          "Still one-off, not stackable.",
        ],
        nextImprovement: "Decorate the interface, not a concrete class.",
        code: {
          python: `class LoggedEmail:
    def __init__(self, inner: EmailNotifier):
        self.inner = inner

    def send(self, to, body):
        print("send")
        self.inner.send(to, body)`,
          java: `class LoggedEmail {
    private final EmailNotifier inner;
    LoggedEmail(EmailNotifier inner) { this.inner = inner; }
    void send(String to, String body) {
        System.out.println("send");
        inner.send(to, body);
    }
}`,
        },
      },
      {
        label: "Best",
        intent: "Each layer implements Notifier. Stack them in any order.",
        drawbacks: [
          "Deep stacks are harder to debug.",
          "Identity checks (is this the email sender?) get messy.",
        ],
        code: {
          python: `from typing import Protocol


class Notifier(Protocol):
    def send(self, to: str, body: str) -> None: ...


class Logged:
    def __init__(self, inner: Notifier):
        self.inner = inner

    def send(self, to: str, body: str) -> None:
        print(f"send {to}")
        self.inner.send(to, body)


class Retry:
    def __init__(self, inner: Notifier, times: int = 3):
        self.inner = inner
        self.times = times

    def send(self, to: str, body: str) -> None:
        for attempt in range(self.times):
            try:
                self.inner.send(to, body)
                return
            except OSError:
                if attempt == self.times - 1:
                    raise


notifier = Logged(Retry(EmailNotifier()))`,
          java: `interface Notifier { void send(String to, String body); }

class Logged implements Notifier {
    private final Notifier inner;
    Logged(Notifier inner) { this.inner = inner; }
    public void send(String to, String body) {
        System.out.println("send " + to);
        inner.send(to, body);
    }
}

class Retry implements Notifier {
    private final Notifier inner;
    private final int times;
    Retry(Notifier inner, int times) { this.inner = inner; this.times = times; }
    public void send(String to, String body) {
        RuntimeException last = null;
        for (int i = 0; i < times; i++) {
            try { inner.send(to, body); return; }
            catch (RuntimeException e) { last = e; }
        }
        throw last;
    }
}

Notifier notifier = new Logged(new Retry(new EmailNotifier(), 3));`,
        },
      },
    ],
  },
  {
    slug: "facade",
    category: "structural",
    title: "Facade",
    tagline: "One simple door in front of a messy subsystem.",
    explanation:
      "Checkout needs inventory, payment, shipping, and email. A facade offers placeOrder() so the web layer does not orchestrate five services.",
    whenToUse: "When most callers need a happy-path recipe, not every knob.",
    whenNot: "Do not hide a subsystem so well that power users cannot reach it.",
    versions: [
      {
        label: "Basic",
        intent: "The controller talks to every service itself.",
        drawbacks: [
          "Every entry point repeats the same four calls.",
          "A new step (tax) edits every controller.",
          "Order of operations is easy to get wrong.",
        ],
        nextImprovement: "Put the recipe in one place.",
        code: {
          python: `class OrderController:
    def place(self, cart, card, addr):
        Inventory().reserve(cart)
        Payment().charge(card, cart.total)
        Shipping().ship(addr, cart)
        Mail().receipt(cart)`,
          java: `class OrderController {
    void place(Cart cart, Card card, Address addr) {
        new Inventory().reserve(cart);
        new Payment().charge(card, cart.total);
        new Shipping().ship(addr, cart);
        new Mail().receipt(cart);
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "A helper function exists, but it still news up services.",
        drawbacks: [
          "Hard to test without all four systems.",
          "Two facades can drift apart.",
        ],
        nextImprovement: "Inject the subsystem and keep the facade as orchestration only.",
        code: {
          python: `def place_order(cart, card, addr):
    Inventory().reserve(cart)
    Payment().charge(card, cart.total)
    Shipping().ship(addr, cart)
    Mail().receipt(cart)`,
          java: `class Orders {
    static void place(Cart cart, Card card, Address addr) {
        new Inventory().reserve(cart);
        new Payment().charge(card, cart.total);
        new Shipping().ship(addr, cart);
        new Mail().receipt(cart);
    }
}`,
        },
      },
      {
        label: "Best",
        intent: "CheckoutFacade is the only type the web layer needs for the happy path.",
        drawbacks: [
          "A fat facade can become a god class — keep it as a recipe, not a junk drawer.",
          "Advanced flows may still need the individual services.",
        ],
        code: {
          python: `class CheckoutFacade:
    def __init__(self, inventory, payment, shipping, mail):
        self.inventory = inventory
        self.payment = payment
        self.shipping = shipping
        self.mail = mail

    def place_order(self, cart, card, addr) -> str:
        self.inventory.reserve(cart)
        charge_id = self.payment.charge(card, cart.total)
        tracking = self.shipping.ship(addr, cart)
        self.mail.receipt(cart, tracking)
        return charge_id`,
          java: `class CheckoutFacade {
    private final Inventory inventory;
    private final Payment payment;
    private final Shipping shipping;
    private final Mail mail;

    CheckoutFacade(Inventory inventory, Payment payment, Shipping shipping, Mail mail) {
        this.inventory = inventory;
        this.payment = payment;
        this.shipping = shipping;
        this.mail = mail;
    }

    String placeOrder(Cart cart, Card card, Address addr) {
        inventory.reserve(cart);
        String chargeId = payment.charge(card, cart.total);
        String tracking = shipping.ship(addr, cart);
        mail.receipt(cart, tracking);
        return chargeId;
    }
}`,
        },
      },
    ],
  },
  {
    slug: "proxy",
    category: "structural",
    title: "Proxy",
    tagline: "A stand-in that controls access to the real object.",
    explanation:
      "A virtual proxy delays loading a heavy image. A cache proxy skips the network. Same interface as the real subject — unlike a facade, which simplifies a whole subsystem.",
    whenToUse: "Lazy load, access control, or caching in front of one object.",
    whenNot: "If you only want a simpler API, that is a Facade.",
    versions: [
      {
        label: "Basic",
        intent: "The gallery loads every image from disk up front.",
        drawbacks: [
          "Slow start when most images are never viewed.",
          "No cache if the same file is shown twice.",
          "UI is coupled to disk IO.",
        ],
        nextImprovement: "Load on first draw.",
        code: {
          python: `class Gallery:
    def __init__(self, paths: list[str]):
        self.images = [open(p, "rb").read() for p in paths]`,
          java: `class Gallery {
    Gallery(java.util.List<String> paths) {
        images = paths.stream().map(p -> java.nio.file.Files.readAllBytes(java.nio.file.Path.of(p))).toList();
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "Lazy field on the image itself, but every widget reimplements it.",
        drawbacks: [
          "Lazy logic is copied for video, PDF, and API calls.",
          "No shared cache across widgets.",
        ],
        nextImprovement: "A proxy with the same Image interface.",
        code: {
          python: `class Image:
    def __init__(self, path: str):
        self.path = path
        self._bytes = None

    def draw(self):
        if self._bytes is None:
            self._bytes = open(self.path, "rb").read()
        return self._bytes`,
          java: `class Image {
    private final String path;
    private byte[] data;
    Image(String path) { this.path = path; }
    byte[] draw() {
        if (data == null) data = java.nio.file.Files.readAllBytes(java.nio.file.Path.of(path));
        return data;
    }
}`,
        },
      },
      {
        label: "Best",
        intent: "RealImage does IO. ImageProxy looks the same and loads once.",
        drawbacks: [
          "Proxy and real object can get out of sync if the interface grows.",
          "Caching proxy must decide invalidation.",
        ],
        code: {
          python: `from typing import Protocol


class Image(Protocol):
    def draw(self) -> bytes: ...


class RealImage:
    def __init__(self, path: str):
        self.data = open(path, "rb").read()

    def draw(self) -> bytes:
        return self.data


class ImageProxy:
    def __init__(self, path: str):
        self.path = path
        self._real: RealImage | None = None

    def draw(self) -> bytes:
        if self._real is None:
            self._real = RealImage(self.path)
        return self._real.draw()`,
          java: `interface Image { byte[] draw(); }

class RealImage implements Image {
    private final byte[] data;
    RealImage(String path) throws java.io.IOException {
        data = java.nio.file.Files.readAllBytes(java.nio.file.Path.of(path));
    }
    public byte[] draw() { return data; }
}

class ImageProxy implements Image {
    private final String path;
    private RealImage real;
    ImageProxy(String path) { this.path = path; }
    public byte[] draw() {
        if (real == null) {
            try { real = new RealImage(path); }
            catch (java.io.IOException e) { throw new RuntimeException(e); }
        }
        return real.draw();
    }
}`,
        },
      },
    ],
  },
  {
    slug: "composite",
    category: "structural",
    title: "Composite",
    tagline: "Treat a leaf and a tree the same way.",
    explanation:
      "A folder is a file node that contains file nodes. Callers ask for size() and do not care whether they pointed at a file or a tree.",
    whenToUse: "Part-whole trees: files, menus, org charts, UI views.",
    whenNot: "A flat list is not a composite. Do not invent a tree you do not have.",
    versions: [
      {
        label: "Basic",
        intent: "Separate File and Folder types. Callers branch on which they have.",
        drawbacks: [
          "Every operation needs if folder / else file.",
          "Nested folders need recursion written at each call site.",
        ],
        nextImprovement: "A shared Node with size().",
        code: {
          python: `def total(item):
    if isinstance(item, Folder):
        return sum(total(child) for child in item.children)
    return item.size`,
          java: `int total(Object item) {
    if (item instanceof Folder folder) {
        int sum = 0;
        for (Object child : folder.children) sum += total(child);
        return sum;
    }
    return ((File) item).size;
}`,
        },
      },
      {
        label: "Improved",
        intent: "Shared Node, but Folder exposes a raw children list and File does not.",
        drawbacks: [
          "Callers still special-case add().",
          "A file can be asked to add a child if you are not careful.",
        ],
        nextImprovement: "Uniform component: add is a no-op or throws on leaves; clients rarely need it.",
        code: {
          python: `class Node:
    def size(self) -> int: ...


class File(Node):
    def __init__(self, size: int):
        self._size = size

    def size(self) -> int:
        return self._size


class Folder(Node):
    def __init__(self):
        self.children = []

    def size(self) -> int:
        return sum(c.size() for c in self.children)`,
          java: `interface Node { int size(); }

class File implements Node {
    private final int size;
    File(int size) { this.size = size; }
    public int size() { return size; }
}

class Folder implements Node {
    final java.util.List<Node> children = new java.util.ArrayList<>();
    public int size() { return children.stream().mapToInt(Node::size).sum(); }
}`,
        },
      },
      {
        label: "Best",
        intent: "Clients walk Node. Folder composes nodes. File is a leaf.",
        drawbacks: [
          "A huge tree can make size() expensive without caching.",
          "Uniform add() on leaves is a design choice — throwing is honest.",
        ],
        code: {
          python: `from abc import ABC, abstractmethod


class Node(ABC):
    @abstractmethod
    def size(self) -> int: ...


class File(Node):
    def __init__(self, name: str, nbytes: int):
        self.name = name
        self._nbytes = nbytes

    def size(self) -> int:
        return self._nbytes


class Folder(Node):
    def __init__(self, name: str):
        self.name = name
        self._children: list[Node] = []

    def add(self, node: Node) -> None:
        self._children.append(node)

    def size(self) -> int:
        return sum(child.size() for child in self._children)


root = Folder("src")
root.add(File("a.py", 120))
root.add(File("b.py", 80))
root.size()  # 200`,
          java: `interface Node { int size(); }

class File implements Node {
    final String name;
    private final int nbytes;
    File(String name, int nbytes) { this.name = name; this.nbytes = nbytes; }
    public int size() { return nbytes; }
}

class Folder implements Node {
    final String name;
    private final java.util.List<Node> children = new java.util.ArrayList<>();
    Folder(String name) { this.name = name; }
    void add(Node node) { children.add(node); }
    public int size() { return children.stream().mapToInt(Node::size).sum(); }
}

Folder root = new Folder("src");
root.add(new File("A.java", 120));
root.add(new File("B.java", 80));
root.size(); // 200`,
        },
      },
    ],
  },
  {
    slug: "strategy",
    category: "behavioral",
    title: "Strategy",
    tagline: "Swap an algorithm without changing the code that uses it.",
    explanation:
      "Shipping cost is a policy: flat, weight, or distance. The cart asks a strategy. New policies are new types, not new branches in the cart.",
    whenToUse: "When several interchangeable algorithms exist and the caller should not care which.",
    whenNot: "One formula does not need a strategy interface.",
    versions: [
      {
        label: "Basic",
        intent: "Cart switches on shipping kind.",
        drawbacks: [
          "New methods edit the cart.",
          "Rates and cart logic share one file.",
          "Cannot inject a fake in tests without flags.",
        ],
        nextImprovement: "Move each formula into its own function.",
        code: {
          python: `def shipping(kind: str, weight: int, km: int) -> int:
    if kind == "flat":
        return 5
    if kind == "weight":
        return weight * 2
    if kind == "distance":
        return km
    raise ValueError(kind)`,
          java: `int shipping(String kind, int weight, int km) {
    if ("flat".equals(kind)) return 5;
    if ("weight".equals(kind)) return weight * 2;
    if ("distance".equals(kind)) return km;
    throw new IllegalArgumentException(kind);
}`,
        },
      },
      {
        label: "Improved",
        intent: "Functions exist, but the cart still picks them with a string.",
        drawbacks: [
          "String keys are typo-prone.",
          "The cart still owns the catalog of strategies.",
        ],
        nextImprovement: "Pass the strategy in. Cart only calls cost().",
        code: {
          python: `def flat(_w, _km): return 5
def weight(w, _km): return w * 2
def distance(_w, km): return km

STRATEGIES = {"flat": flat, "weight": weight, "distance": distance}

def shipping(kind, weight, km):
    return STRATEGIES[kind](weight, km)`,
          java: `java.util.Map<String, java.util.function.BiFunction<Integer,Integer,Integer>> STRATEGIES = java.util.Map.of(
    "flat", (w, km) -> 5,
    "weight", (w, km) -> w * 2,
    "distance", (w, km) -> km
);`,
        },
      },
      {
        label: "Best",
        intent: "Cart depends on Shipping. Policies are ordinary objects.",
        drawbacks: [
          "Tiny policies can look like ceremony.",
          "Choosing the strategy (UI, config) still lives somewhere else — that is fine.",
        ],
        code: {
          python: `from typing import Protocol


class Shipping(Protocol):
    def cost(self, weight: int, km: int) -> int: ...


class Flat:
    def cost(self, weight: int, km: int) -> int:
        return 5


class ByWeight:
    def cost(self, weight: int, km: int) -> int:
        return weight * 2


class Cart:
    def __init__(self, shipping: Shipping):
        self.shipping = shipping

    def total(self, goods: int, weight: int, km: int) -> int:
        return goods + self.shipping.cost(weight, km)`,
          java: `interface Shipping { int cost(int weight, int km); }

class Flat implements Shipping {
    public int cost(int weight, int km) { return 5; }
}

class ByWeight implements Shipping {
    public int cost(int weight, int km) { return weight * 2; }
}

class Cart {
    private final Shipping shipping;
    Cart(Shipping shipping) { this.shipping = shipping; }
    int total(int goods, int weight, int km) {
        return goods + shipping.cost(weight, km);
    }
}`,
        },
      },
    ],
  },
  {
    slug: "observer",
    category: "behavioral",
    title: "Observer",
    tagline: "When one object changes, dependents are told — they are not polled.",
    explanation:
      "A stock ticker should not know about charts, logs, and push alerts. It notifies observers. Each observer decides what to do.",
    whenToUse: "One-to-many updates where the subject should not import its listeners.",
    whenNot: "Two objects that always travel together can just call each other.",
    versions: [
      {
        label: "Basic",
        intent: "The ticker calls Chart and Logger by name.",
        drawbacks: [
          "Adding a mobile alert edits the ticker.",
          "Cannot reuse the ticker without those UI types.",
          "Order of side effects is hardcoded.",
        ],
        nextImprovement: "Keep a list of callbacks.",
        code: {
          python: `class Ticker:
    def __init__(self, chart, logger):
        self.chart = chart
        self.logger = logger

    def set_price(self, symbol, price):
        self.chart.draw(symbol, price)
        self.logger.write(symbol, price)`,
          java: `class Ticker {
    Chart chart;
    Logger logger;
    void setPrice(String symbol, int price) {
        chart.draw(symbol, price);
        logger.write(symbol, price);
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "A list of functions. No unsubscribe, no typing.",
        drawbacks: [
          "Listeners cannot leave cleanly.",
          "Exceptions in one listener kill the rest.",
          "No shared observer contract.",
        ],
        nextImprovement: "Subscribe / unsubscribe plus an Observer type.",
        code: {
          python: `class Ticker:
    def __init__(self):
        self._subs = []

    def on_price(self, fn):
        self._subs.append(fn)

    def set_price(self, symbol, price):
        for fn in self._subs:
            fn(symbol, price)`,
          java: `class Ticker {
    java.util.List<java.util.function.BiConsumer<String,Integer>> subs = new java.util.ArrayList<>();
    void onPrice(java.util.function.BiConsumer<String,Integer> fn) { subs.add(fn); }
    void setPrice(String symbol, int price) { subs.forEach(fn -> fn.accept(symbol, price)); }
}`,
        },
      },
      {
        label: "Best",
        intent: "Subject holds observers. Attach and detach are explicit.",
        drawbacks: [
          "Forgotten unsubscribe leaks memory.",
          "Notification order should not be something observers rely on.",
        ],
        code: {
          python: `from typing import Protocol


class Observer(Protocol):
    def update(self, symbol: str, price: int) -> None: ...


class Ticker:
    def __init__(self):
        self._observers: list[Observer] = []

    def attach(self, observer: Observer) -> None:
        self._observers.append(observer)

    def detach(self, observer: Observer) -> None:
        self._observers.remove(observer)

    def set_price(self, symbol: str, price: int) -> None:
        for observer in list(self._observers):
            observer.update(symbol, price)


class Logger:
    def update(self, symbol: str, price: int) -> None:
        print(symbol, price)`,
          java: `interface Observer { void update(String symbol, int price); }

class Ticker {
    private final java.util.List<Observer> observers = new java.util.ArrayList<>();
    void attach(Observer o) { observers.add(o); }
    void detach(Observer o) { observers.remove(o); }
    void setPrice(String symbol, int price) {
        for (Observer o : java.util.List.copyOf(observers)) o.update(symbol, price);
    }
}

class Logger implements Observer {
    public void update(String symbol, int price) {
        System.out.println(symbol + " " + price);
    }
}`,
        },
      },
    ],
  },
  {
    slug: "state",
    category: "behavioral",
    title: "State",
    tagline: "Behavior changes with an object's state, without a giant switch.",
    explanation:
      "An order is placed, paid, shipped, or cancelled. Each state allows different actions. State objects own those rules so the order class stays small.",
    whenToUse: "When the same method means different things depending on life-cycle.",
    whenNot: "Two flags do not need a state machine.",
    versions: [
      {
        label: "Basic",
        intent: "A status string and if/else in every action.",
        drawbacks: [
          "Illegal transitions are easy to miss.",
          "Every new state edits every method.",
          "The happy path is buried in guards.",
        ],
        nextImprovement: "Centralize allowed transitions, still as data.",
        code: {
          python: `class Order:
    def __init__(self):
        self.status = "placed"

    def pay(self):
        if self.status != "placed":
            raise ValueError("cannot pay")
        self.status = "paid"

    def ship(self):
        if self.status != "paid":
            raise ValueError("cannot ship")
        self.status = "shipped"`,
          java: `class Order {
    String status = "placed";
    void pay() {
        if (!"placed".equals(status)) throw new IllegalStateException();
        status = "paid";
    }
    void ship() {
        if (!"paid".equals(status)) throw new IllegalStateException();
        status = "shipped";
    }
}`,
        },
      },
      {
        label: "Improved",
        intent: "An enum plus a transition table. Actions still live on Order.",
        drawbacks: [
          "Behavior is still in one class.",
          "Table says what is allowed, not what pay() does in that state.",
        ],
        nextImprovement: "Give each state an object that implements pay/ship/cancel.",
        code: {
          python: `ALLOWED = {
    ("placed", "pay"): "paid",
    ("paid", "ship"): "shipped",
    ("placed", "cancel"): "cancelled",
    ("paid", "cancel"): "cancelled",
}

class Order:
    def __init__(self):
        self.status = "placed"

    def _move(self, action: str) -> None:
        key = (self.status, action)
        if key not in ALLOWED:
            raise ValueError(key)
        self.status = ALLOWED[key]`,
          java: `class Order {
    enum Status { PLACED, PAID, SHIPPED, CANCELLED }
    Status status = Status.PLACED;
}`,
        },
      },
      {
        label: "Best",
        intent: "Order delegates to a State. Each state returns the next state or rejects.",
        drawbacks: [
          "Many small classes.",
          "Shared data (items, totals) must be passed into states carefully.",
        ],
        code: {
          python: `from typing import Protocol


class State(Protocol):
    def pay(self, order: "Order") -> None: ...
    def ship(self, order: "Order") -> None: ...


class Placed:
    def pay(self, order: "Order") -> None:
        order._state = Paid()

    def ship(self, order: "Order") -> None:
        raise ValueError("pay first")


class Paid:
    def pay(self, order: "Order") -> None:
        raise ValueError("already paid")

    def ship(self, order: "Order") -> None:
        order._state = Shipped()


class Shipped:
    def pay(self, order: "Order") -> None:
        raise ValueError("already shipped")

    def ship(self, order: "Order") -> None:
        raise ValueError("already shipped")


class Order:
    def __init__(self):
        self._state: State = Placed()

    def pay(self) -> None:
        self._state.pay(self)

    def ship(self) -> None:
        self._state.ship(self)`,
          java: `interface State {
    void pay(Order order);
    void ship(Order order);
}

class Placed implements State {
    public void pay(Order order) { order.setState(new Paid()); }
    public void ship(Order order) { throw new IllegalStateException("pay first"); }
}

class Paid implements State {
    public void pay(Order order) { throw new IllegalStateException("already paid"); }
    public void ship(Order order) { order.setState(new Shipped()); }
}

class Shipped implements State {
    public void pay(Order order) { throw new IllegalStateException("already shipped"); }
    public void ship(Order order) { throw new IllegalStateException("already shipped"); }
}

class Order {
    private State state = new Placed();
    void setState(State state) { this.state = state; }
    void pay() { state.pay(this); }
    void ship() { state.ship(this); }
}`,
        },
      },
    ],
  },
  {
    slug: "prototype",
    category: "creational",
    title: "Prototype",
    tagline: "Create a new object by copying one you already have.",
    explanation:
      "A document template, a game enemy, or a styled shape is cheaper to clone than to rebuild. The trap is shallow copy: nested objects stay shared.",
    whenToUse: "When construction is expensive or you already have a configured example.",
    whenNot: "If a constructor is cheap and clear, just new it up.",
    versions: [
      {
        label: "Basic",
        intent: "Copy fields by hand. Nested lists are shared.",
        drawbacks: [
          "Easy to forget a field.",
          "Mutating tags on the clone changes the original.",
          "No single clone() contract.",
        ],
        nextImprovement: "Add clone(), and copy nested collections.",
        code: {
          python: `class Document:
    def __init__(self, title, tags):
        self.title = title
        self.tags = tags


original = Document("Offer", ["legal"])
copy = Document(original.title, original.tags)
copy.tags.append("draft")  # original.tags is now ["legal", "draft"]`,
          java: `class Document {
    String title;
    java.util.List<String> tags;
}

Document original = new Document();
original.title = "Offer";
original.tags = new java.util.ArrayList<>(java.util.List.of("legal"));
Document copy = new Document();
copy.title = original.title;
copy.tags = original.tags; // shared
copy.tags.add("draft");`,
        },
      },
      {
        label: "Improved",
        intent: "A clone() method that still shallow-copies nested objects.",
        drawbacks: [
          "Looks safe, still shares inner lists or children.",
          "Callers think they have an independent document.",
        ],
        nextImprovement: "Deep-copy owned data. Share only true flyweights.",
        code: {
          python: `class Document:
    def __init__(self, title, tags):
        self.title = title
        self.tags = tags

    def clone(self):
        return Document(self.title, self.tags)`,
          java: `class Document implements Cloneable {
    String title;
    java.util.List<String> tags;
    public Document clone() {
        try { return (Document) super.clone(); } // shallow
        catch (CloneNotSupportedException e) { throw new RuntimeException(e); }
    }
}`,
        },
      },
      {
        label: "Best",
        intent: "clone() copies owned state. The copy can diverge safely.",
        drawbacks: [
          "Deep copy of graphs with cycles needs extra care.",
          "Java Cloneable is awkward — a copy constructor is often clearer.",
        ],
        code: {
          python: `from dataclasses import dataclass, field


@dataclass
class Document:
    title: str
    tags: list[str] = field(default_factory=list)
    body: str = ""

    def clone(self) -> "Document":
        return Document(self.title, list(self.tags), self.body)


template = Document("Offer", ["legal"], "Dear …")
draft = template.clone()
draft.tags.append("draft")
# template.tags is still ["legal"]`,
          java: `class Document {
    final String title;
    final String body;
    private final java.util.List<String> tags;

    Document(String title, String body, java.util.List<String> tags) {
        this.title = title;
        this.body = body;
        this.tags = new java.util.ArrayList<>(tags);
    }

    Document cloneDoc() {
        return new Document(title, body, tags);
    }

    java.util.List<String> tags() { return java.util.List.copyOf(tags); }
}`,
        },
      },
    ],
  },
];

export function getPattern(slug: string): DesignPattern | undefined {
  return PATTERNS.find((pattern) => pattern.slug === slug);
}
