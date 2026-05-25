# Background Jobs

# Goal

Handle retries and async workflows cleanly.

---

# Notification Processor

Runs periodically.

Responsibilities:

````txt
Find pending notifications
Simulate send
Mark Sent or Failed
Increment retry counts
````

---

# Upload Session Expiration

Responsibilities:

````txt
Find expired sessions
Mark Expired
Write audit log
````

---

# Failed Upload Cleanup

Responsibilities:

````txt
Find stale uploads
Mark Failed
Write audit log
````

---

# Why Use Jobs?

Keeps APIs:

- fast
- retryable
- resilient

---

# Future Improvements

````txt
Queue system
Distributed workers
Dead-letter handling
Webhook retries
````
