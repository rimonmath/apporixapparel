CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"parent_id" integer DEFAULT 0,
	"name" varchar(256) NOT NULL,
	"thumbnail" varchar(100),
	"meta_title" varchar(255) DEFAULT '',
	"meta_description" text DEFAULT '',
	"order" integer DEFAULT 0,
	"is_top" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
