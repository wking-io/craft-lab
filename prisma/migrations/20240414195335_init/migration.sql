-- CreateTable
CREATE TABLE "WaitlistMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" TEXT,
    CONSTRAINT "Account_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "Group_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "Member_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "AccountImage_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "Password_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expirationDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "Session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "memberId" TEXT,
    CONSTRAINT "Role_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "digits" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "charSet" TEXT NOT NULL,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "Connection_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistMember_email_key" ON "WaitlistMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_handle_key" ON "Account"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Member_accountId_groupId_key" ON "Member"("accountId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountImage_accountId_key" ON "AccountImage"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Password_accountId_key" ON "Password"("accountId");

-- CreateIndex
CREATE INDEX "Session_accountId_idx" ON "Session"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_target_type_key" ON "Verification"("target", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_providerName_providerId_key" ON "Connection"("providerName", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

INSERT INTO Account VALUES('clvfegx96000q12ovr5qvl2s7','contact@wking.dev','wking','Will King',NULL);
INSERT INTO "Group" VALUES('clvfegx97000r12ovqrfcia0z','Origin','clvfegx96000q12ovr5qvl2s7');
INSERT INTO Member VALUES('clvfegx98000s12ovm9d9rcnv',1714058995292,1714058995292,'clvfegx96000q12ovr5qvl2s7','clvfegx97000r12ovqrfcia0z');
INSERT INTO Password VALUES('$2a$10$Gekb/iyZOHIs3Lc9OLKPN.8TTefJ4N1fw89HUfG9.LiyLFUO7djuO','clvfegx96000q12ovr5qvl2s7');
INSERT INTO Permission VALUES('clvfegx6e000012ovd8qqgtfn','create','account','own','',1714058995190,1714058995190);
INSERT INTO Permission VALUES('clvfegx6f000112ovko2kd8v9','create','account','any','',1714058995192,1714058995192);
INSERT INTO Permission VALUES('clvfegx6g000212ove4jxg7mr','read','account','own','',1714058995193,1714058995193);
INSERT INTO Permission VALUES('clvfegx6h000312ovg9z0eqdy','read','account','any','',1714058995194,1714058995194);
INSERT INTO Permission VALUES('clvfegx6i000412ovbaejkhmm','update','account','own','',1714058995194,1714058995194);
INSERT INTO Permission VALUES('clvfegx6j000512ov311ia80r','update','account','any','',1714058995195,1714058995195);
INSERT INTO Permission VALUES('clvfegx6j000612ovxixbn751','delete','account','own','',1714058995196,1714058995196);
INSERT INTO Permission VALUES('clvfegx6k000712ovslemvdws','delete','account','any','',1714058995197,1714058995197);
INSERT INTO Permission VALUES('clvfegx6l000812ovjfbxc1ur','create','profile','own','',1714058995198,1714058995198);
INSERT INTO Permission VALUES('clvfegx6m000912ovz1ekfhr0','create','profile','any','',1714058995198,1714058995198);
INSERT INTO Permission VALUES('clvfegx6n000a12ovs7uu5rh5','read','profile','own','',1714058995199,1714058995199);
INSERT INTO Permission VALUES('clvfegx6o000b12ovx5yavckd','read','profile','any','',1714058995200,1714058995200);
INSERT INTO Permission VALUES('clvfegx6o000c12ov1np20qxl','update','profile','own','',1714058995201,1714058995201);
INSERT INTO Permission VALUES('clvfegx6p000d12ovs2oqj4wy','update','profile','any','',1714058995202,1714058995202);
INSERT INTO Permission VALUES('clvfegx6q000e12ovgm65n1z1','delete','profile','own','',1714058995202,1714058995202);
INSERT INTO Permission VALUES('clvfegx6q000f12ovt17gfz31','delete','profile','any','',1714058995203,1714058995203);
INSERT INTO Permission VALUES('clvfegx6r000g12ov5577qkkl','create','group','own','',1714058995203,1714058995203);
INSERT INTO Permission VALUES('clvfegx6s000h12ovbp7fgk0i','create','group','any','',1714058995204,1714058995204);
INSERT INTO Permission VALUES('clvfegx6s000i12ovzyomi5aq','read','group','own','',1714058995205,1714058995205);
INSERT INTO Permission VALUES('clvfegx6t000j12ovy98kc80x','read','group','any','',1714058995205,1714058995205);
INSERT INTO Permission VALUES('clvfegx6u000k12ovbhpu82br','update','group','own','',1714058995206,1714058995206);
INSERT INTO Permission VALUES('clvfegx6u000l12ovmg977hge','update','group','any','',1714058995207,1714058995207);
INSERT INTO Permission VALUES('clvfegx6v000m12ovdd3tfjo8','delete','group','own','',1714058995207,1714058995207);
INSERT INTO Permission VALUES('clvfegx6v000n12ovmwfkiyca','delete','group','any','',1714058995208,1714058995208);
INSERT INTO Role VALUES('clvfegx6x000o12ova5upbtdo','admin','',1714058995209,1714058995292,'clvfegx98000s12ovm9d9rcnv');
INSERT INTO Role VALUES('clvfegx6y000p12ovrqrgcmot','member','',1714058995211,1714058995292,'clvfegx98000s12ovm9d9rcnv');
INSERT INTO _PermissionToRole VALUES('clvfegx6f000112ovko2kd8v9','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6h000312ovg9z0eqdy','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6j000512ov311ia80r','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6k000712ovslemvdws','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6m000912ovz1ekfhr0','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6o000b12ovx5yavckd','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6p000d12ovs2oqj4wy','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6q000f12ovt17gfz31','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6s000h12ovbp7fgk0i','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6t000j12ovy98kc80x','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6u000l12ovmg977hge','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6v000n12ovmwfkiyca','clvfegx6x000o12ova5upbtdo');
INSERT INTO _PermissionToRole VALUES('clvfegx6e000012ovd8qqgtfn','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6g000212ove4jxg7mr','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6i000412ovbaejkhmm','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6j000612ovxixbn751','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6l000812ovjfbxc1ur','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6n000a12ovs7uu5rh5','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6o000c12ov1np20qxl','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6q000e12ovgm65n1z1','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6r000g12ov5577qkkl','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6s000i12ovzyomi5aq','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6u000k12ovbhpu82br','clvfegx6y000p12ovrqrgcmot');
INSERT INTO _PermissionToRole VALUES('clvfegx6v000m12ovdd3tfjo8','clvfegx6y000p12ovrqrgcmot');