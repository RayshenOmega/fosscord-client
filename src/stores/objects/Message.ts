import type {
	APIActionRowComponent,
	APIApplication,
	APIAttachment,
	APIChannel,
	APIChannelMention,
	APIEmbed,
	APIMessage,
	APIMessageActionRowComponent,
	APIMessageActivity,
	APIMessageInteraction,
	APIMessageReference,
	APIReaction,
	APIRole,
	APISticker,
	APIStickerItem,
	APIUser,
	MessageFlags,
	Snowflake,
} from "@spacebarchat/spacebar-api-types/v9";
import { action, observable } from "mobx";
import AppStore from "../AppStore";
import MessageBase from "./MessageBase";
import QueuedMessage, { QueuedMessageData } from "./QueuedMessage";

export type MessageLike = Message | QueuedMessage;
export type MessageLikeData = APIMessage | QueuedMessageData;

export default class Message extends MessageBase {
	/**
	 * ID of the channel the message was sent in
	 */
	channel_id: Snowflake;
	/**
	 * When this message was edited (or null if never)
	 */
	@observable edited_timestamp: Date | null;
	/**
	 * Whether this was a TTS message
	 */
	tts: boolean;
	/**
	 * Whether this message mentions everyone
	 */
	mention_everyone: boolean;
	/**
	 * Users specifically mentioned in the message
	 *
	 * The `member` field is only present in `MESSAGE_CREATE` and `MESSAGE_UPDATE` events
	 * from text-based guild channels
	 *
	 * See https://discord.com/developers/docs/resources/user#user-object
	 * See https://discord.com/developers/docs/resources/guild#guild-member-object
	 */
	mentions: APIUser[];
	/**
	 * Roles specifically mentioned in this message
	 *
	 * See https://discord.com/developers/docs/topics/permissions#role-object
	 */
	mention_roles: APIRole["id"][];
	/**
	 * Channels specifically mentioned in this message
	 *
	 * Not all channel mentions in a message will appear in `mention_channels`.
	 * - Only textual channels that are visible to everyone in a lurkable guild will ever be included
	 * - Only crossposted messages (via Channel Following) currently include `mention_channels` at all
	 *
	 * If no mentions in the message meet these requirements, this field will not be sent
	 *
	 * See https://discord.com/developers/docs/resources/channel#channel-mention-object
	 */
	mention_channels?: APIChannelMention[];
	/**
	 * Any attached files
	 *
	 * See https://discord.com/developers/docs/resources/channel#attachment-object
	 *
	 * The `MESSAGE_CONTENT` privileged gateway intent will become required after **August 31, 2022** for verified applications to receive a non-empty value from this field
	 *
	 * In the Discord Developers Portal, you need to enable the toggle of this intent of your application in **Bot > Privileged Gateway Intents**
	 *
	 * See https://support-dev.discord.com/hc/articles/4404772028055
	 */
	@observable attachments: APIAttachment[];
	/**
	 * Any embedded content
	 *
	 * See https://discord.com/developers/docs/resources/channel#embed-object
	 *
	 * The `MESSAGE_CONTENT` privileged gateway intent will become required after **August 31, 2022** for verified applications to receive a non-empty value from this field
	 *
	 * In the Discord Developers Portal, you need to enable the toggle of this intent of your application in **Bot > Privileged Gateway Intents**
	 *
	 * See https://support-dev.discord.com/hc/articles/4404772028055
	 */
	@observable embeds: APIEmbed[];
	/**
	 * Reactions to the message
	 *
	 * See https://discord.com/developers/docs/resources/channel#reaction-object
	 */
	@observable reactions?: APIReaction[];
	/**
	 * A nonce that can be used for optimistic message sending (up to 25 characters)
	 *
	 * **You will not receive this from further fetches. This is received only once from a `MESSAGE_CREATE`
	 * event to ensure it got sent**
	 */
	nonce?: string | number;
	/**
	 * Whether this message is pinned
	 */
	@observable pinned: boolean;
	/**
	 * If the message is generated by a webhook, this is the webhook's id
	 */
	webhook_id?: Snowflake;
	/**
	 * Sent with Rich Presence-related chat embeds
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-object-message-activity-structure
	 */
	activity?: APIMessageActivity;
	/**
	 * Sent with Rich Presence-related chat embeds
	 *
	 * See https://discord.com/developers/docs/resources/application#application-object
	 */
	application?: Partial<APIApplication>;
	/**
	 * If the message is a response to an Interaction, this is the id of the interaction's application
	 */
	application_id?: Snowflake;
	/**
	 * Reference data sent with crossposted messages, replies, pins, and thread starter messages
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure
	 */
	message_reference?: APIMessageReference;
	/**
	 * Message flags combined as a bitfield
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-object-message-flags
	 *
	 * See https://en.wikipedia.org/wiki/Bit_field
	 */
	flags?: MessageFlags;
	/**
	 * The message associated with the `message_reference`
	 *
	 * This field is only returned for messages with a `type` of `19` (REPLY).
	 *
	 * If the message is a reply but the `referenced_message` field is not present,
	 * the backend did not attempt to fetch the message that was being replied to,
	 * so its state is unknown.
	 *
	 * If the field exists but is `null`, the referenced message was deleted
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-object
	 */
	referenced_message?: APIMessage | null;
	/**
	 * Sent if the message is a response to an Interaction
	 */
	interaction?: APIMessageInteraction;
	/**
	 * Sent if a thread was started from this message
	 */
	thread?: APIChannel;
	/**
	 * Sent if the message contains components like buttons, action rows, or other interactive components
	 *
	 * The `MESSAGE_CONTENT` privileged gateway intent will become required after **August 31, 2022** for verified applications to receive a non-empty value from this field
	 *
	 * In the Discord Developers Portal, you need to enable the toggle of this intent of your application in **Bot > Privileged Gateway Intents**
	 *
	 * See https://support-dev.discord.com/hc/articles/4404772028055
	 */
	@observable
	components?: APIActionRowComponent<APIMessageActionRowComponent>[];
	/**
	 * Sent if the message contains stickers
	 *
	 * See https://discord.com/developers/docs/resources/sticker#sticker-item-object
	 */
	sticker_items?: APIStickerItem[];
	/**
	 * The stickers sent with the message
	 *
	 * See https://discord.com/developers/docs/resources/sticker#sticker-object
	 * @deprecated Use `sticker_items` instead
	 */
	stickers?: APISticker[];
	/**
	 * A generally increasing integer (there may be gaps or duplicates) that represents the approximate position of the message in a thread
	 *
	 * It can be used to estimate the relative position of the message in a thread in company with `total_message_sent` on parent thread
	 */
	position?: number;

	constructor(app: AppStore, data: APIMessage) {
		super(app, data);

		this.id = data.id;
		this.channel_id = data.channel_id;
		// this.member = message.member ? new GuildMember(message.member) : undefined;
		this.content = data.content;
		this.timestamp = new Date(data.timestamp);
		this.edited_timestamp = data.edited_timestamp ? new Date(data.edited_timestamp) : null;
		this.tts = data.tts;
		this.mention_everyone = data.mention_everyone;
		this.mentions = data.mentions; // TODO: user object?
		this.mention_roles = data.mention_roles;
		this.mention_channels = data.mention_channels;
		this.attachments = data.attachments;
		this.embeds = data.embeds;
		this.reactions = data.reactions;
		this.nonce = data.nonce;
		this.pinned = data.pinned;
		this.webhook_id = data.webhook_id;
		this.type = data.type;
		this.activity = data.activity;
		this.application = data.application;
		this.application_id = data.application_id;
		this.message_reference = data.message_reference;
		this.flags = data.flags;
		this.referenced_message = data.referenced_message;
		this.interaction = data.interaction;
		this.thread = data.thread;
		this.components = data.components;
		this.sticker_items = data.sticker_items;
		this.stickers = data.stickers;
		this.position = data.position;
	}

	@action
	update(message: APIMessage) {
		Object.assign(this, message);

		this.timestamp = new Date(message.timestamp);
		this.edited_timestamp = message.edited_timestamp ? new Date(message.edited_timestamp) : null;
	}
}
