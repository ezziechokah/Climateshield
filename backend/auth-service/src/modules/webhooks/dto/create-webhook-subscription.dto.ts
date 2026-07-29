import { IsString, IsUUID, Matches, MaxLength } from 'class-validator';

/**
 * POST /v1/webhook-subscriptions body. `target_url` must be `https://` —
 * validated here (in addition to the DB's own
 * `webhook_subscription_url_https` CHECK constraint) so a bad URL surfaces
 * as a 400 at the API boundary rather than a 500 from a constraint
 * violation, per this task's explicit instruction.
 */
export class CreateWebhookSubscriptionDto {
  @IsUUID()
  api_key_id!: string;

  @IsString()
  @MaxLength(100)
  event_type!: string;

  @IsString()
  @Matches(/^https:\/\//i, { message: 'target_url must use https://.' })
  target_url!: string;
}
