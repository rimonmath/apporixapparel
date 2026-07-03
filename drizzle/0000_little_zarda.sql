CREATE TYPE "public"."coupon_type" AS ENUM('Percentage', 'Flat');--> statement-breakpoint
CREATE TYPE "public"."dealer_statement_type" AS ENUM('Debit', 'Credit');--> statement-breakpoint
CREATE TYPE "public"."gender1" AS ENUM('Male', 'Female', 'Other', 'Not Specified');--> statement-breakpoint
CREATE TYPE "public"."income_or_expense_type" AS ENUM('Income', 'Expense');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('Placed', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Return Rejected', 'Return Received', 'Returned', 'Refunded', 'Failed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Paid', 'Failed', 'Refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('Draft', 'Published', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('Admin', 'User', 'Customer');--> statement-breakpoint
CREATE TABLE "stores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"show_next_to_logo" boolean DEFAULT true NOT NULL,
	"sub_domain" varchar(100) NOT NULL,
	"custom_domain" varchar(256),
	"meta_title" varchar(255) DEFAULT '',
	"meta_description" varchar(255) DEFAULT '',
	"meta_keywords" text[] DEFAULT '{}',
	"logo_url" varchar(255),
	"brand_color" varchar(20) DEFAULT '#009edb',
	"favicon_url" varchar(255),
	"currency" varchar(10) DEFAULT 'BDT' NOT NULL,
	"timezone" varchar(100) DEFAULT 'Asia/Dhaka' NOT NULL,
	"address" text DEFAULT 'Default Location, Dhaka',
	"support_email" varchar(99) DEFAULT 'support@yourdomain.com',
	"support_phone" varchar(20) DEFAULT '+88017xxxxxxxx',
	"facebook" varchar(255) DEFAULT 'https://facebook.com',
	"instagram" varchar(255) DEFAULT 'https://instagram.com',
	"whatsapp" varchar(255) DEFAULT '+88017xxxxxxxx',
	"youtube" varchar(255) DEFAULT 'https://youtube.com',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stores_sub_domain_unique" UNIQUE("sub_domain"),
	CONSTRAINT "stores_custom_domain_unique" UNIQUE("custom_domain")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(99) NOT NULL,
	"password" varchar(256) NOT NULL,
	"permissions" json DEFAULT '[]'::json,
	"name" varchar(256) NOT NULL,
	"gender" "gender1" DEFAULT 'Not Specified' NOT NULL,
	"email_verification_code" varchar(6) DEFAULT '',
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"user_type" "user_type" DEFAULT 'User' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"referred_user_id" integer DEFAULT 0,
	"referral_reward" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
