export const dnsWorkshop = {
  prerequisites: [
    "Identify a client, an IP address and a router (Lesson 1).",
    "Read a URL: https://shop.example.test/cart. DNS looks up the host, not /cart.",
    "No terminal installation or prior DNS knowledge is required. The lab uses simulated time.",
  ],
  technicalGoals: [
    "Trace a cache miss and explain which server owns the answer.",
    "Calculate the remaining TTL and predict what happens after a record changes.",
    "Distinguish a negative DNS response from a timeout or an HTTP error.",
    "Write a short diagnosis supported by timestamps, answers and a counterexample.",
  ],
  englishGoals: [
    "Use resolve, cache and expire as verbs in a technical explanation.",
    "Read remaining TTL and authoritative answer without translating every word.",
    "Explain cause and evidence with because, until and however.",
  ],
  sections: [
    {
      id: "dns-case-study",
      title: "A shop moves, but your phone sees the old address",
      text: "Mina runs a small online shop. At 10:00, her phone asks for shop.example.test and receives 192.0.2.10. At 10:00:30, she changes the authoritative A record to 192.0.2.20. A second lookup still returns the old address. Before calling this a broken update, separate two facts: the zone has changed, but a resolver may still hold an unexpired copy. A useful diagnosis asks who answered, when that answer was cached, and how long it can remain. In this lesson, time is measured in seconds so you can test the explanation instead of waiting in real life. A public IP is like a delivery address; DNS is a distributed directory, not the delivery truck. After resolution, TCP or QUIC and HTTPS still have work to do. Returning an address does not prove that a website is reachable or trustworthy.",
    },
    {
      id: "dns-cache-clock",
      title: "TTL is a lifetime, not a notification",
      text: "Suppose a resolver caches an A record at t=0 with TTL 60. It expires at t=60. At t=30, the remaining TTL is 30 seconds: 60 minus 30. At t=59 it has one second left. A cache hit does not restart the original expiry clock. At t=60, this simplified resolver must fetch a fresh answer. TTL (生存时间) is a maximum cache lifetime for a resource record; it is not a promise that every resolver worldwide refreshes at the same moment. Changing an authoritative record does not push a notification to every old cache. Lowering TTL after an answer was cached also does not rewrite that cached answer's earlier deadline. To prepare a planned move, lower TTL sufficiently in advance, wait out the previous TTL, then change the address. Lower TTL can reduce stale answers but increases queries. Higher TTL reduces queries but may extend a transition. Neither is always better; describe the trade-off.",
    },
    {
      id: "dns-negative-evidence",
      title: "A missing name is different from a failed conversation",
      text: "NXDOMAIN (名称不存在) says the queried DNS name does not exist. It is different from NODATA: the name exists, but the requested record type has no data. It is also different from a timeout: no response arrived, so you do not yet know whether the name exists. Negative answers can be cached. Their lifetime is derived from the zone's SOA information; in this lab we explicitly use 30 seconds, not the A record's 60 seconds. If you create a name while a resolver still caches NXDOMAIN, that resolver may keep returning NXDOMAIN until its negative cache expires. This does not prove that the new record was never created. A server failure such as SERVFAIL is another category and may also be cached under rules not simulated here. Do not assume that a negative answer and a network outage are interchangeable. Repeatedly refreshing a web page may reuse the same resolver cache rather than collect new evidence.",
    },
    {
      id: "dns-diagnostic-method",
      title: "Turn an observation into a testable explanation",
      text: "Use a small evidence table: time, question, answer, source, remaining TTL. First predict an outcome. Next change exactly one variable: advance the clock, update the authoritative address, or remove the name. Query again and compare the observed answer with your prediction. If the old address survives only while the cache is valid, caching explains the evidence. If the authoritative server also gives the old answer, investigate the zone update instead. If DNS returns the expected address but the connection times out, move your investigation to reachability, transport and the application; changing DNS without evidence may make things worse. A real nslookup output can say Non-authoritative answer. That means the replying server is not authoritative for the name; it does not mean the answer is wrong. For practice, compare these fictional observations: t=0 -> .10 from authority, t=30 -> .10 from cache, t=60 -> .20 from authority. Say: The resolver returned the old address because its cached answer had not expired. Then add a limit: This explains this resolver, not every cache on the Internet.",
    },
    {
      id: "dns-evidence-report",
      title: "Explain what your experiment proves",
      text: "Run two experiments in the lab below. Positive case: query at t=0, change the address, predict the answer at t=30, and query again at t=60. Negative case: reset, remove the name, query, create it again, and compare t=0 with t=30. In your course notes, write four lines: my prediction; observed answer and source; the TTL calculation; a conclusion and one limitation. Use the English frame: I expected ... However, I observed ... because ... This does not show whether ... A strong report includes a result that could have disproved your explanation. For example, receiving the new address before expiry would contradict this particular cache model. Do not copy real account details, device addresses or private logs into your notes. Finish by applying the same layered reasoning to the existing transport and HTTPS sections: a correct DNS answer is one stage, not proof of end-to-end success.",
    },
  ],
  exercises: [
    {
      level: "Understand",
      prompt:
        "A resolver returns an unexpired cached answer. Which work may be skipped?",
      options: [
        "The root, TLD and authoritative queries for this answer",
        "Every future DNS query forever",
        "The HTTP request that downloads the page",
      ],
      answer: 0,
      feedback: [
        "Yes. A usable cached answer can avoid the hierarchy for this lookup, but transport and HTTP still happen.",
        "A cache entry has a finite TTL; it cannot replace future lookups forever.",
        "DNS supplies records, not page contents. HTTP is a later application step.",
      ],
    },
    {
      level: "Apply",
      prompt:
        "An answer was cached at t=0 with TTL 60. The authority changes at t=20. At t=30, what may this resolver return?",
      options: [
        "Only the new address, because updates push to all caches",
        "The old address with 30 seconds remaining",
        "The old address with a fresh 60-second lifetime",
      ],
      answer: 1,
      feedback: [
        "An authoritative update does not invalidate an existing remote cache.",
        "Correct: expiry remains t=60. Remaining TTL = 60 - 30 = 30.",
        "A hit does not restart the clock in this model; that would let stale data live indefinitely.",
      ],
    },
    {
      level: "Reason",
      prompt:
        "DNS returns the expected IP, but HTTPS times out. What should you conclude?",
      options: [
        "DNS proves that the web server is healthy",
        "Delete the DNS record immediately",
        "DNS succeeded for this lookup; investigate reachability and transport next",
      ],
      answer: 2,
      feedback: [
        "An address answer does not demonstrate a successful TCP/QUIC connection or TLS exchange.",
        "The evidence does not show a bad DNS record. Removing it introduces another failure.",
        "Correct. Name resolution and a successful end-to-end connection are separate claims.",
      ],
    },
  ],
};
