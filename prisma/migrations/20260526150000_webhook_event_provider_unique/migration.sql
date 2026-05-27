-- Replace the global webhook event id uniqueness with provider-scoped idempotency.
DROP INDEX "WebhookEvent_externalEventId_key";

CREATE UNIQUE INDEX "WebhookEvent_provider_externalEventId_key" ON "WebhookEvent"("provider", "externalEventId");
