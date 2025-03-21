-- Create database if it doesn't exist
CREATE DATABASE "PokerTrackerDb" WITH OWNER = postgres ENCODING = 'UTF8' CONNECTION LIMIT = -1;

\c PokerTrackerDb;

-- AspNetRoles table
CREATE TABLE "AspNetRoles" (
    "Id" text NOT NULL,
    "Name" character varying(256),
    "NormalizedName" character varying(256),
    "ConcurrencyStamp" text,
    CONSTRAINT "PK_AspNetRoles" PRIMARY KEY ("Id")
);

-- AspNetUsers table
CREATE TABLE "AspNetUsers" (
    "Id" text NOT NULL,
    "UserName" character varying(256),
    "NormalizedUserName" character varying(256),
    "Email" character varying(256),
    "NormalizedEmail" character varying(256),
    "EmailConfirmed" boolean NOT NULL,
    "PasswordHash" text,
    "SecurityStamp" text,
    "ConcurrencyStamp" text,
    "PhoneNumber" text,
    "PhoneNumberConfirmed" boolean NOT NULL,
    "TwoFactorEnabled" boolean NOT NULL,
    "LockoutEnd" timestamp with time zone,
    "LockoutEnabled" boolean NOT NULL,
    "AccessFailedCount" integer NOT NULL,
    CONSTRAINT "PK_AspNetUsers" PRIMARY KEY ("Id")
);

-- HandRecords table
CREATE TABLE "HandRecords" (
    "Id" uuid NOT NULL,
    "UserId" text NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL,
    "Position" text NOT NULL,
    "HoleCards" text NOT NULL,
    "CommunityCards" text,
    "PotSize" numeric NOT NULL,
    "IsWinner" boolean NOT NULL,
    "AmountWon" numeric NOT NULL,
    "Notes" text,
    "GameType" text,
    "TableName" text,
    "IsSyncedToNotion" boolean NOT NULL,
    "SyncStatus" text,
    "NotionPageId" text,
    "LastSyncAttempt" timestamp with time zone,
    CONSTRAINT "PK_HandRecords" PRIMARY KEY ("Id")
);

-- AspNetRoleClaims table
CREATE TABLE "AspNetRoleClaims" (
    "Id" serial NOT NULL,
    "RoleId" text NOT NULL,
    "ClaimType" text,
    "ClaimValue" text,
    CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY ("RoleId")
        REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE
);

-- AspNetUserClaims table
CREATE TABLE "AspNetUserClaims" (
    "Id" serial NOT NULL,
    "UserId" text NOT NULL,
    "ClaimType" text,
    "ClaimValue" text,
    CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY ("UserId")
        REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

-- AspNetUserLogins table
CREATE TABLE "AspNetUserLogins" (
    "LoginProvider" text NOT NULL,
    "ProviderKey" text NOT NULL,
    "ProviderDisplayName" text,
    "UserId" text NOT NULL,
    CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"),
    CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY ("UserId")
        REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

-- AspNetUserRoles table
CREATE TABLE "AspNetUserRoles" (
    "UserId" text NOT NULL,
    "RoleId" text NOT NULL,
    CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY ("UserId", "RoleId"),
    CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY ("RoleId")
        REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY ("UserId")
        REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

-- AspNetUserTokens table
CREATE TABLE "AspNetUserTokens" (
    "UserId" text NOT NULL,
    "LoginProvider" text NOT NULL,
    "Name" text NOT NULL,
    "Value" text,
    CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name"),
    CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId")
        REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

-- ActionRecords table
CREATE TABLE "ActionRecords" (
    "Id" uuid NOT NULL,
    "HandRecordId" uuid NOT NULL,
    "Stage" text NOT NULL,
    "ActionType" text NOT NULL,
    "Amount" numeric,
    "Order" integer NOT NULL,
    CONSTRAINT "PK_ActionRecords" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ActionRecords_HandRecords_HandRecordId" FOREIGN KEY ("HandRecordId")
        REFERENCES "HandRecords" ("Id") ON DELETE CASCADE
);

-- SyncQueue table
CREATE TABLE "SyncQueue" (
    "Id" uuid NOT NULL,
    "HandRecordId" uuid NOT NULL,
    "Status" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "CompletedAt" timestamp with time zone,
    "RetryCount" integer NOT NULL,
    "ErrorMessage" text,
    CONSTRAINT "PK_SyncQueue" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_SyncQueue_HandRecords_HandRecordId" FOREIGN KEY ("HandRecordId")
        REFERENCES "HandRecords" ("Id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "IX_ActionRecords_HandRecordId" ON "ActionRecords" ("HandRecordId");
CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");
CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" ("NormalizedName");
CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");
CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");
CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");
CREATE INDEX "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");
CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName");
CREATE INDEX "IX_SyncQueue_HandRecordId" ON "SyncQueue" ("HandRecordId");

-- Create __EFMigrationsHistory table to track migrations
CREATE TABLE "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

-- Insert the migration record
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250321041733_InitialCreate', '9.0.3');

-- Create default roles
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
VALUES 
('1', 'Admin', 'ADMIN', 'cca4ec6f-7c1a-4d47-8fb1-3c67d0d55d68'),
('2', 'User', 'USER', '0c810611-7893-4d12-9368-1f98c1d83c4a');

-- Create a default admin user (password: Admin123!)
INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnd", "LockoutEnabled", "AccessFailedCount")
VALUES 
('1', 'admin', 'ADMIN', 'admin@example.com', 'ADMIN@EXAMPLE.COM', true, 'AQAAAAIAAYagAAAAEL0oYUF7zI9wJJU8KpG9hDnAvFLyX5RRrYyZYxES/QWaI1bUBM6xBJvr4P0XJYDTzA==', 'YUPAFWNGZI2UC5FOITC7MEOW7MIHBMN7', '8d9d3d0c-effa-4343-baef-5b8317c23930', null, false, false, null, false, 0);

-- Assign admin role to admin user
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
VALUES ('1', '1');
