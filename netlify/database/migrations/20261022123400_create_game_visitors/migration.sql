CREATE TABLE "game_visitors" (
	"id" uuid PRIMARY KEY,
	"snow_notice_seen" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
