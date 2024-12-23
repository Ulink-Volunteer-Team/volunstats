import students from "./students";
import recruitments from "./recruitment";
import events from "./events";
import authentication from "./authentication";
import database from "./database";
import { handshake, closeSession, heartbeat } from "./base";

export default [
	...students,
	...recruitments,
	...events,
	...authentication,
	...database,
	{
		name: "handshake",
		handler: handshake
	},
	{
		name: "close-session",
		handler: closeSession
	},
	{
		name: "heartbeat",
		handler: heartbeat
	}
];
