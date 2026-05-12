-- CreateTable
CREATE TABLE "otp_verificacion" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "usado_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verificacion_pkey" PRIMARY KEY ("id")
);
