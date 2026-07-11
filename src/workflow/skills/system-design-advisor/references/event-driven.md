# Event-Driven

## Principles

- **Producers should not know their consumers.** The defining property of event-driven design is
  decoupling — a producer publishes a fact and moves on; it should not need to know who consumes it
  or block on their processing. A design where the producer calls consumers directly (even
  "fire and forget") is not really event-driven, it's synchronous coupling with extra steps.
- **At-least-once delivery is the realistic default; design consumers to be idempotent.** Most
  real event infrastructure can redeliver a message (consumer crash before ack, network retry) —
  consumers that aren't idempotent will double-process on redelivery. Exactly-once is expensive and
  often illusory; idempotent-consumer is the robust default.
- **Ordering guarantees (or lack thereof) must be designed for explicitly.** Many event systems
  only guarantee order within a partition/shard, not globally — if a consumer's correctness depends
  on strict global ordering, either the infrastructure must support it or the design needs to not
  depend on it.
- **An event stream is not a replacement for synchronous request/response when the caller genuinely
  needs an immediate answer.** Event-driven fits "notify and move on"; a caller that needs the
  result to proceed needs a synchronous call (or an async-with-polling/callback pattern), not a
  fire-and-forget event.

## Common Pitfalls

- A "poison message" (one that always fails processing) with no dead-letter handling — blocks the
  whole queue/partition behind it, or gets silently dropped depending on the infrastructure's default.
- Consumers with side effects that aren't idempotent, breaking under normal at-least-once redelivery.
- Implicit ordering assumptions across different event types/topics — ordering guarantees usually
  don't span topics even when they hold within one.
- Using events for something that's really a synchronous dependency, then working around the
  resulting latency with polling loops — a sign the interaction should have been synchronous.

## Failure Modes To Consider

- What happens to a message that repeatedly fails processing? (dead-letter queue, alerting, manual
  intervention path)
- What happens if a consumer is down for an extended period — does the producer's event source
  retain enough history to replay, or is that data lost?
- What happens on consumer restart — does it resume from the last acknowledged position, or could
  it skip or reprocess a range?

## Checklist

- [ ] Producers do not have direct knowledge of or dependency on specific consumers.
- [ ] Consumers are idempotent, or the infrastructure genuinely guarantees exactly-once for this path.
- [ ] Ordering requirements (if any) are matched against what the actual event infrastructure guarantees.
- [ ] A dead-letter/poison-message handling path exists for messages that repeatedly fail.
- [ ] This interaction is genuinely "notify and move on," not a disguised synchronous dependency.
